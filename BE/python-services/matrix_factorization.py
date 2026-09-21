import os
import sys
import csv
import math
from datetime import datetime, timedelta

# Fix Windows cp1252 charmap encoding error for Vietnamese diacritics
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')



try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False

try:
    from pymongo import MongoClient
    from bson import ObjectId
    HAS_PYMONGO = True
except ImportError:
    HAS_PYMONGO = False

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, 'data')

def _load_env_file(env_path):
    if not os.path.exists(env_path):
        return
    try:
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    k, v = k.strip(), v.strip().strip("'\"")
                    if k and k not in os.environ:
                        os.environ[k] = v
    except Exception:
        pass

_load_env_file(os.path.abspath(os.path.join(BASE_DIR, '..', '.env')))
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/cloneharavan')

# ── Layer 1: Interaction Weights (chuẩn với Node service) ───────────────────
INTERACTION_WEIGHTS = {
    'view':              1.0,
    'product_detail':    1.8,
    'search_click':      2.0,
    'filter_apply':      1.5,
    'compare_add':       1.5,
    'wishlist_add':      2.5,
    'share_product':     2.0,
    'review_submit':     3.0,
    'add_to_cart':       5.0,
    'purchase':         10.0,
    # Negative signals
    'cart_remove':      -1.0,
    'checkout_abandon': -0.5,
    'search_noresult':  -0.5,
}

# ── Layer 2: Time Decay ───────────────────────────────────────────────────────
HALF_LIFE_DAYS = 7  # hành vi giảm 50% trọng số sau 7 ngày (chuẩn Netflix)

def apply_time_decay(weight, timestamp):
    """Half-life exponential decay"""
    if timestamp is None:
        return weight
    if isinstance(timestamp, str):
        try:
            timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        except Exception:
            return weight
    age_days = (datetime.now() - timestamp.replace(tzinfo=None)).total_seconds() / 86400
    decay_factor = math.exp(-0.693 * age_days / HALF_LIFE_DAYS)
    return weight * decay_factor


def ensure_csv_datasets_exist():
    products_file     = os.path.join(DATA_DIR, 'products.csv')
    interactions_file = os.path.join(DATA_DIR, 'interactions.csv')
    if not os.path.exists(products_file) or not os.path.exists(interactions_file):
        print("-> Dataset CSV not found. Auto-generating...")
        try:
            from generate_dataset import (
                generate_products_csv, generate_users_csv,
                generate_interactions_csv, generate_orders_csv,
            )
            generate_products_csv()
            generate_users_csv()
            generate_interactions_csv()
            generate_orders_csv()
        except Exception as e:
            print(f"[Warning] Failed to generate dataset: {e}")


# ── Load Interactions (Priority: MongoDB > CSV) ───────────────────────────────
def load_interactions_data():
    interactions = []
    source       = "CSV"

    if HAS_PYMONGO:
        try:
            client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
            db     = client.get_database()
            docs   = list(db.userinteractions.find())
            if docs:
                source = "MongoDB"
                for doc in docs:
                    u_key = str(doc.get('userId')) if doc.get('userId') else str(doc.get('sessionId', ''))
                    p_key = str(doc.get('productId', ''))
                    if not u_key or not p_key:
                        continue

                    i_type    = doc.get('interactionType', 'view')
                    base_w    = INTERACTION_WEIGHTS.get(i_type, 1.0)
                    timestamp = doc.get('timestamp') or doc.get('createdAt')
                    decayed_w = apply_time_decay(base_w, timestamp)

                    # Track purchased items for filtering
                    is_purchase = i_type == 'purchase'

                    interactions.append({
                        'userId':      doc.get('userId'),
                        'sessionId':   doc.get('sessionId', ''),
                        'u_key':       u_key,
                        'p_key':       p_key,
                        'weight':      decayed_w,
                        'is_purchase': is_purchase,
                    })
        except Exception as e:
            print(f"-> MongoDB unavailable ({e}). Falling back to CSV.")

    if not interactions:
        ensure_csv_datasets_exist()
        csv_path = os.path.join(DATA_DIR, 'interactions.csv')
        if os.path.exists(csv_path):
            source = "data/interactions.csv"
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    u_key = str(row.get('user_id', '')).strip() or str(row.get('session_id', '')).strip()
                    p_key = str(row.get('product_id', '')).strip()
                    if not u_key or not p_key:
                        continue
                    i_type = row.get('interaction_type', 'view')
                    base_w = INTERACTION_WEIGHTS.get(i_type, float(row.get('weight', 1.0)))
                    interactions.append({
                        'userId':      u_key if len(u_key) == 24 else None,
                        'sessionId':   u_key if len(u_key) != 24 else '',
                        'u_key':       u_key,
                        'p_key':       p_key,
                        'weight':      base_w,
                        'is_purchase': i_type == 'purchase',
                    })

    return interactions, source


def load_product_metadata():
    prod_meta = {}
    csv_path  = os.path.join(DATA_DIR, 'products.csv')
    if os.path.exists(csv_path):
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                p_id = row.get('product_id', '').strip()
                if p_id:
                    prod_meta[p_id] = {
                        'title':    row.get('title', ''),
                        'category': row.get('category', ''),
                        'brand':    row.get('brand', ''),
                        'price':    float(row.get('price', 0)),
                    }
    return prod_meta


# ── ALS-inspired SVD with improved k and negative feedback ───────────────────
def run_matrix_factorization():
    print("=" * 76)
    print("HYBRID RECOMMENDATION ENGINE — SVD + Time-Decay + Negative Feedback")
    print("=" * 76)

    interactions, source = load_interactions_data()
    print(f"-> Loaded {len(interactions)} interactions from: [{source}]")

    if not interactions:
        print("-> No interaction data. Exiting.")
        return

    prod_meta = load_product_metadata()

    # Build purchased set per user (for hard filtering)
    purchased_by_user = {}
    for item in interactions:
        if item.get('is_purchase'):
            u = item['u_key']
            if u not in purchased_by_user:
                purchased_by_user[u] = set()
            purchased_by_user[u].add(item['p_key'])

    # Filter out zero/very-small weight interactions
    valid_interactions = [i for i in interactions if abs(i['weight']) > 0.01]

    user_keys = sorted(set(x['u_key'] for x in valid_interactions))
    prod_keys = sorted(set(x['p_key'] for x in valid_interactions))

    user_to_idx = {u: i for i, u in enumerate(user_keys)}
    prod_to_idx = {p: i for i, p in enumerate(prod_keys)}
    idx_to_user = {i: u for u, i in user_to_idx.items()}
    idx_to_prod = {i: p for p, i in prod_to_idx.items()}

    n_users = len(user_keys)
    n_prods = len(prod_keys)
    sparsity = 1.0 - (len(valid_interactions) / max(1, n_users * n_prods))

    print(f"-> Matrix: {n_users} Users × {n_prods} Products | Sparsity: {sparsity*100:.2f}%")

    all_recommendations = {}
    csv_rows            = []

    if HAS_NUMPY:
        # Build interaction matrix R with time-decayed weights
        R = np.zeros((n_users, n_prods), dtype=np.float64)
        for item in valid_interactions:
            u_idx = user_to_idx[item['u_key']]
            p_idx = prod_to_idx[item['p_key']]
            R[u_idx, p_idx] += item['weight']  # includes negative weights

        # Clip negatives to min -5 to avoid extreme penalization
        R = np.clip(R, -5, None)

        # SVD with dynamic k (improved from hardcoded 5)
        # k = min(50, n_users, n_prods) — up to 50 latent factors
        k = min(50, n_users, n_prods)

        try:
            U, sigma, Vt = np.linalg.svd(R, full_matrices=False)
            k_actual = min(k, len(sigma))
            U_k      = U[:, :k_actual]
            sigma_k  = np.diag(sigma[:k_actual])
            Vt_k     = Vt[:k_actual, :]
            R_hat    = np.dot(np.dot(U_k, sigma_k), Vt_k)

            rmse = math.sqrt(np.mean((R - R_hat) ** 2))
            print(f"-> SVD k={k_actual} latent factors | RMSE: {rmse:.4f}")
        except Exception as e:
            print(f"-> SVD error ({e}). Using raw matrix.")
            R_hat = R

        # Generate recommendations per user
        for u_idx, u_key in enumerate(user_keys):
            purchased = purchased_by_user.get(u_key, set())

            prod_scores = []
            for p_idx in range(n_prods):
                p_key = idx_to_prod[p_idx]
                # HARD FILTER: skip purchased products
                if p_key in purchased:
                    continue
                score = float(R_hat[u_idx, p_idx])
                prod_scores.append((p_key, score))

            prod_scores.sort(key=lambda x: x[1], reverse=True)

            top_recs = []
            for p_id_str, score in prod_scores[:15]:
                meta  = prod_meta.get(p_id_str, {})
                top_recs.append({
                    'productId':      p_id_str,
                    'title':          meta.get('title', ''),
                    'category':       meta.get('category', ''),
                    'predictedScore': round(score, 4),
                    'reason':         'Hybrid SVD + Time-Decay Model',
                })
                csv_rows.append({
                    'user_id':         u_key,
                    'product_id':      p_id_str,
                    'title':           meta.get('title', ''),
                    'predicted_score': round(score, 4),
                    'rank':            len(top_recs),
                })

            all_recommendations[u_key] = top_recs

    else:
        # Pure Python fallback
        R_flat = {}
        for item in valid_interactions:
            key = (item['u_key'], item['p_key'])
            R_flat[key] = R_flat.get(key, 0) + item['weight']

        for u_key in user_keys:
            purchased = purchased_by_user.get(u_key, set())
            prod_scores = [
                (p, R_flat.get((u_key, p), 0))
                for p in prod_keys
                if p not in purchased
            ]
            prod_scores.sort(key=lambda x: x[1], reverse=True)
            all_recommendations[u_key] = [
                {
                    'productId':      p,
                    'predictedScore': round(s, 4),
                    'reason':         'Pure Python Fallback Model',
                }
                for p, s in prod_scores[:15]
            ]

        print("-> Pure Python fallback completed.")

    # Export CSV
    output_csv = os.path.join(DATA_DIR, 'recommendations_output.csv')
    with open(output_csv, 'w', newline='', encoding='utf-8') as f:
        fieldnames = ['user_id', 'product_id', 'title', 'predicted_score', 'rank']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(csv_rows)
    print(f"-> Exported {len(csv_rows)} recommendations to [data/recommendations_output.csv]")

    # Sync to MongoDB
    if HAS_PYMONGO:
        try:
            client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
            db     = client.get_database()
            synced = 0

            for u_key, recs in all_recommendations.items():
                is_valid_objid = ObjectId.is_valid(u_key)
                filter_query   = {'userId': ObjectId(u_key)} if is_valid_objid else {'sessionId': u_key}

                mongo_recs = []
                for r in recs:
                    if ObjectId.is_valid(r['productId']):
                        mongo_recs.append({
                            'productId':      ObjectId(r['productId']),
                            'predictedScore': r['predictedScore'],
                            'reason':         r['reason'],
                        })

                update_doc = {
                    'userId':               ObjectId(u_key) if is_valid_objid else None,
                    'sessionId':            u_key if not is_valid_objid else '',
                    'recommendedProducts':  mongo_recs,
                    'lastCalculatedAt':     datetime.now(),
                }

                db.personalizedrecommendations.update_one(
                    filter_query,
                    {'$set': update_doc},
                    upsert=True,
                )
                synced += 1

            print(f"-> Synced {synced} user recommendation documents to MongoDB.")
        except Exception as e:
            print(f"-> MongoDB sync failed ({e}). Output saved in CSV.")

    # Summary
    print("\n" + "=" * 76)
    print("SAMPLE OUTPUT (TOP 3 USERS)")
    print("=" * 76)
    for u_key in list(all_recommendations.keys())[:3]:
        print(f"\n[User]: {u_key}")
        for rec in all_recommendations[u_key][:3]:
            print(f"  -> {rec['title']} | Score: {rec['predictedScore']} | {rec['reason']}")

    print("\n" + "=" * 76)
    print("RECOMMENDATION ENGINE PIPELINE COMPLETED!")
    print("=" * 76 + "\n")


if __name__ == '__main__':
    run_matrix_factorization()
