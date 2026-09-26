import os
import sys
import csv
from datetime import datetime

# Fix Windows cp1252 charmap encoding error for Vietnamese diacritics
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

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

def sync_csv_to_mongodb():
    print("==========================================================================")
    print("CSV DATASET TO MONGODB SYNCHRONIZATION PIPELINE")
    print("==========================================================================")

    if not HAS_PYMONGO:
        print("[WARNING] Thư viện 'pymongo' chưa được cài đặt. Run: pip install pymongo")
        return

    client = MongoClient(MONGO_URI)
    db = client.get_database()
    print(f"-> Connected to MongoDB: {db.name}")

    # 1. Sync Products CSV
    prod_csv = os.path.join(DATA_DIR, 'products.csv')
    if os.path.exists(prod_csv):
        with open(prod_csv, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            prod_count = 0
            for row in reader:
                p_id = ObjectId(row['product_id'])
                doc = {
                    'name': row['title'],
                    'slug': row['sku'].lower(),
                    'sku': row['sku'],
                    'price': float(row['price']),
                    'salePrice': float(row['sale_price']),
                    'stock': int(row['stock']),
                    'status': 'published',
                    'isActive': True,
                    'isFeatured': True if float(row.get('rating', 0)) >= 4.8 else False,
                    'isHot': True,
                    'updatedAt': datetime.now()
                }
                db.products.update_one({'_id': p_id}, {'$set': doc}, upsert=True)
                prod_count += 1
            print(f"-> Synced {prod_count} Products from CSV into MongoDB collection 'products'.")

    # 2. Sync Users CSV
    users_csv = os.path.join(DATA_DIR, 'users.csv')
    if os.path.exists(users_csv):
        with open(users_csv, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            user_count = 0
            for row in reader:
                u_id = ObjectId(row['user_id'])
                phone_val = row.get('phone') or f"090123450{user_count + 1}"
                doc = {
                    'fullName': row['full_name'],
                    'email': row['email'],
                    'phone': phone_val,
                    'role': 'customer',
                    'isActive': True,
                    'updatedAt': datetime.now()
                }
                db.users.update_one({'_id': u_id}, {'$set': doc}, upsert=True)
                user_count += 1
            print(f"-> Synced {user_count} Users from CSV into MongoDB collection 'users'.")

    # 3. Sync Interactions CSV
    inter_csv = os.path.join(DATA_DIR, 'interactions.csv')
    if os.path.exists(inter_csv):
        with open(inter_csv, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            inter_count = 0
            db.userinteractions.delete_many({}) # Refresh interaction log
            for row in reader:
                u_id = ObjectId(row['user_id']) if ObjectId.is_valid(row['user_id']) else None
                p_id = ObjectId(row['product_id']) if ObjectId.is_valid(row['product_id']) else None
                if not p_id:
                    continue
                doc = {
                    'userId': u_id,
                    'sessionId': row['session_id'],
                    'productId': p_id,
                    'interactionType': row['event_type'],
                    'weight': float(row['weight']),
                    'timestamp': datetime.strptime(row['timestamp'], "%Y-%m-%d %H:%M:%S") if row['timestamp'] else datetime.now()
                }
                db.userinteractions.insert_one(doc)
                inter_count += 1
            print(f"-> Synced {inter_count} Interaction logs from CSV into MongoDB 'userinteractions'.")

    print("==========================================================================")
    print("SUCCESS: CSV Dataset successfully synchronized with MongoDB!")
    print("==========================================================================\n")

if __name__ == '__main__':
    sync_csv_to_mongodb()
