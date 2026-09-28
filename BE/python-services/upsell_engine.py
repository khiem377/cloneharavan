import os
import sys
import math
from datetime import datetime

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

try:
    from pymongo import MongoClient, UpdateOne
    from bson import ObjectId
    HAS_PYMONGO = True
except ImportError:
    HAS_PYMONGO = False
    print("[ERROR] pymongo not installed. Run: pip install pymongo")
    sys.exit(1)

BASE_DIR = os.path.dirname(__file__)

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

TIER1_MIN_RATIO = 1.05
TIER1_MAX_RATIO = 4.0
TIER1_MAX_SUGGESTIONS = 3

TIER2_MIN_RATIO = 1.25
TIER2_MAX_RATIO = 2.5
TIER2_MAX_SUGGESTIONS = 2


def get_effective_price(obj):
    sp = obj.get('salePrice')
    p = obj.get('price', 0)
    if sp and sp > 0:
        return float(sp)
    return float(p) if p else 0.0


def extract_numeric_from_display(display_name):
    if not display_name:
        return None
    import re
    nums = re.findall(r'\d+(?:\.\d+)?', str(display_name))
    if nums:
        return float(nums[0])
    return None


def build_tier1_suggestions(current_variant, all_variants_of_product):
    current_price = get_effective_price(current_variant)
    if current_price <= 0:
        return []

    current_id = str(current_variant['_id'])
    candidates = []

    for v in all_variants_of_product:
        if str(v['_id']) == current_id:
            continue
        if not v.get('isActive', True):
            continue
        if v.get('stock', 0) <= 0:
            continue

        vp = get_effective_price(v)
        if vp <= current_price:
            continue

        ratio = vp / current_price
        if ratio < TIER1_MIN_RATIO or ratio > TIER1_MAX_RATIO:
            continue

        price_diff = vp - current_price
        display = v.get('displayName', '')

        candidates.append({
            'variantId': str(v['_id']),
            'productId': str(v['productId']),
            'displayName': display,
            'sku': v.get('sku', ''),
            'price': vp,
            'priceDiff': round(price_diff),
            'stock': v.get('stock', 0),
            'thumbnailUrl': v.get('thumbnail', {}).get('url', ''),
            'attributes': v.get('attributes', []),
        })

    candidates.sort(key=lambda x: x['price'])
    return candidates[:TIER1_MAX_SUGGESTIONS]


def build_tier2_suggestions(current_product, current_max_price, all_products_in_category, current_product_id):
    if current_max_price <= 0:
        return []

    min_price = current_max_price * TIER2_MIN_RATIO
    max_price = current_max_price * TIER2_MAX_RATIO

    candidates = []

    for p in all_products_in_category:
        if str(p['_id']) == current_product_id:
            continue
        if p.get('status') not in ('published', None):
            continue

        cached_price = p.get('cachedSalePrice') or p.get('cachedPrice') or p.get('salePrice') or p.get('price') or 0
        if cached_price <= 0:
            continue
        if cached_price < min_price or cached_price > max_price:
            continue

        price_diff = cached_price - current_max_price

        brand_id = str(p.get('brand', '')) if p.get('brand') else ''
        current_brand = str(current_product.get('brand', '')) if current_product.get('brand') else ''
        same_brand_bonus = 0.3 if brand_id == current_brand and brand_id else 0.0

        is_featured = 1.0 if p.get('isFeatured') else 0.0
        is_hot = 0.5 if p.get('isHot') else 0.0
        score = same_brand_bonus + is_featured + is_hot + (1.0 / max(price_diff, 1)) * 1e6

        candidates.append({
            'productId': str(p['_id']),
            'name': p.get('name', ''),
            'slug': p.get('slug', ''),
            'price': cached_price,
            'priceDiff': round(price_diff),
            'thumbnailUrl': p.get('thumbnail', {}).get('url', ''),
            'isFeatured': p.get('isFeatured', False),
            'isHot': p.get('isHot', False),
            'score': score,
        })

    candidates.sort(key=lambda x: x['score'], reverse=True)
    for c in candidates:
        c.pop('score', None)
    return candidates[:TIER2_MAX_SUGGESTIONS]


def run_upsell_engine():
    print("=" * 70)
    print("UPSELL ENGINE — 2-Tier Ladder Up-sell Batch")
    print("=" * 70)

    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client.get_database()

    print("-> Loading products...")
    products = list(db.products.find(
        {'status': {'$in': ['published', 'draft']}},
        {
            '_id': 1, 'name': 1, 'slug': 1, 'categories': 1, 'brand': 1,
            'thumbnail': 1, 'isFeatured': 1, 'isHot': 1, 'status': 1,
            'price': 1, 'salePrice': 1, 'cachedPrice': 1, 'cachedSalePrice': 1,
        }
    ))
    print(f"-> {len(products)} products loaded")

    print("-> Loading variants...")
    variants = list(db.productvariants.find(
        {'isActive': {'$ne': False}},
        {
            '_id': 1, 'productId': 1, 'displayName': 1, 'sku': 1,
            'price': 1, 'salePrice': 1, 'stock': 1, 'thumbnail': 1,
            'attributes': 1, 'isDefault': 1, 'isActive': 1, 'position': 1,
        }
    ))
    print(f"-> {len(variants)} variants loaded")

    product_map = {str(p['_id']): p for p in products}

    variants_by_product = {}
    for v in variants:
        pid = str(v['productId'])
        if pid not in variants_by_product:
            variants_by_product[pid] = []
        variants_by_product[pid].append(v)

    for pid in variants_by_product:
        variants_by_product[pid].sort(key=lambda x: (get_effective_price(x), x.get('position', 0)))

    products_by_category = {}
    for p in products:
        cats = p.get('categories', [])
        for cat_id in cats:
            key = str(cat_id)
            if key not in products_by_category:
                products_by_category[key] = []
            products_by_category[key].append(p)

    bulk_ops = []
    processed = 0
    skipped = 0

    for v in variants:
        variant_id = str(v['_id'])
        product_id = str(v['productId'])

        current_product = product_map.get(product_id)
        if not current_product:
            skipped += 1
            continue

        all_variants = variants_by_product.get(product_id, [])
        tier1 = build_tier1_suggestions(v, all_variants)

        tier2 = []
        if len(tier1) == 0:
            current_price = get_effective_price(v)
            category_ids = current_product.get('categories', [])
            category_products = []
            seen_pids = set()
            for cat_id in category_ids:
                for cp in products_by_category.get(str(cat_id), []):
                    cpid = str(cp['_id'])
                    if cpid not in seen_pids:
                        seen_pids.add(cpid)
                        category_products.append(cp)

            tier2 = build_tier2_suggestions(
                current_product,
                current_price,
                category_products,
                product_id,
            )

        doc = {
            'variantId': ObjectId(variant_id),
            'productId': ObjectId(product_id),
            'tier': 1 if tier1 else (2 if tier2 else 0),
            'tier1Suggestions': [
                {
                    'variantId': ObjectId(s['variantId']),
                    'productId': ObjectId(s['productId']),
                    'displayName': s['displayName'],
                    'sku': s['sku'],
                    'price': s['price'],
                    'priceDiff': s['priceDiff'],
                    'stock': s['stock'],
                    'thumbnailUrl': s['thumbnailUrl'],
                    'attributes': s['attributes'],
                }
                for s in tier1
            ],
            'tier2Suggestions': [
                {
                    'productId': ObjectId(s['productId']),
                    'name': s['name'],
                    'slug': s['slug'],
                    'price': s['price'],
                    'priceDiff': s['priceDiff'],
                    'thumbnailUrl': s['thumbnailUrl'],
                    'isFeatured': s['isFeatured'],
                    'isHot': s['isHot'],
                }
                for s in tier2
            ],
            'lastCalculatedAt': datetime.now(),
        }

        bulk_ops.append(
            UpdateOne(
                {'variantId': ObjectId(variant_id)},
                {'$set': doc},
                upsert=True,
            )
        )
        processed += 1

    if bulk_ops:
        result = db.upsellsuggestions.bulk_write(bulk_ops, ordered=False)
        print(f"-> Upserted: {result.upserted_count} | Modified: {result.modified_count}")

    db.upsellsuggestions.create_index([('variantId', 1)], unique=True)
    db.upsellsuggestions.create_index([('productId', 1)])

    print(f"-> Processed: {processed} variants | Skipped: {skipped}")
    print("=" * 70)
    print("UPSELL ENGINE COMPLETED!")
    print("=" * 70)
    client.close()


if __name__ == '__main__':
    run_upsell_engine()
