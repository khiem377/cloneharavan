import os
import sys
import csv
import random
import json
from datetime import datetime, timedelta

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

# Config
BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, 'data')
os.makedirs(DATA_DIR, exist_ok=True)

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

# Đường dẫn tới file JSON export từ MongoDB Compass (nằm ở root project)
_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PRODUCTS_JSON = os.path.join(_ROOT, 'cloneharavan.products.json')
VARIANTS_JSON = os.path.join(_ROOT, 'cloneharavan.productvariants.json')

# -----------------------------------------------------------------------------
# ĐỌC DỮ LIỆU TỪ FILE JSON EXPORT (dùng làm fallback khi không có MongoDB)
# -----------------------------------------------------------------------------
def _load_products_from_json_files():
    """
    Đọc products + productvariants từ file JSON export của MongoDB Compass.
    - Nếu product có variants → tạo 1 row per variant
    - Nếu không → dùng thông tin product gốc
    Trả về list products theo format chuẩn, hoặc [] nếu không có file.
    """
    if not os.path.exists(PRODUCTS_JSON):
        return []
    try:
        with open(PRODUCTS_JSON, 'r', encoding='utf-8') as f:
            raw_products = json.load(f)

        # Đọc variants nếu có
        variants_by_product = {}
        if os.path.exists(VARIANTS_JSON):
            with open(VARIANTS_JSON, 'r', encoding='utf-8') as f:
                raw_variants = json.load(f)
            for v in raw_variants:
                pid_raw = v.get('productId', '')
                pid = pid_raw.get('$oid', '') if isinstance(pid_raw, dict) else str(pid_raw)
                if pid not in variants_by_product:
                    variants_by_product[pid] = []
                variants_by_product[pid].append(v)

        products = []
        for p in raw_products:
            pid_raw = p.get('_id', '')
            pid = pid_raw.get('$oid', '') if isinstance(pid_raw, dict) else str(pid_raw)
            sku_base = p.get('sku', f"SKU-{pid[-6:]}")
            name = p.get('name', 'Sản phẩm')
            price = float(p.get('price', 0))
            sale_price = float(p.get('salePrice') or p.get('price', 0))
            stock = int(p.get('stock', 10))
            cat_raw = p.get('categories', p.get('category', ''))
            category = (cat_raw[0] if isinstance(cat_raw, list) and len(cat_raw) > 0
                        else (cat_raw if isinstance(cat_raw, str) else 'Điện Máy'))
            brand_raw = p.get('brand', '')
            brand = brand_raw if isinstance(brand_raw, str) else 'Chính hãng'

            variants = variants_by_product.get(pid, [])
            if variants:
                for v in variants:
                    vid_raw = v.get('_id', '')
                    vid = vid_raw.get('$oid', '') if isinstance(vid_raw, dict) else str(vid_raw)
                    products.append({
                        "product_id": vid or pid,
                        "sku": v.get('sku', sku_base),
                        "title": name,
                        "category": category,
                        "brand": brand,
                        "price": float(v.get('price') or price),
                        "sale_price": float(v.get('salePrice') or v.get('price') or sale_price),
                        "stock": int(v.get('stock') if v.get('stock') is not None else stock),
                        "rating": 4.8
                    })
            else:
                products.append({
                    "product_id": pid,
                    "sku": sku_base,
                    "title": name,
                    "category": category,
                    "brand": brand,
                    "price": price,
                    "sale_price": sale_price,
                    "stock": stock,
                    "rating": 4.8
                })
        print(f"-> [JSON] Loaded {len(products)} product rows (incl. variants).")
        return products
    except Exception as e:
        print(f"-> Error reading JSON files: {e}")
        return []


# FALLBACK_PRODUCTS: tự động đọc từ JSON export, không cần hardcode
# Chỉ dùng list tối thiểu bên dưới nếu cả JSON lẫn MongoDB đều không khả dụng
_MINIMAL_FALLBACK = [
    {"product_id": "000000000000000000000001", "sku": "SAMPLE-001", "title": "Sản phẩm mẫu 1", "category": "Điện Máy", "brand": "Unknown", "price": 1000000, "sale_price": 900000, "stock": 10, "rating": 4.5},
    {"product_id": "000000000000000000000002", "sku": "SAMPLE-002", "title": "Sản phẩm mẫu 2", "category": "Điện Máy", "brand": "Unknown", "price": 2000000, "sale_price": 1800000, "stock": 5, "rating": 4.5},
]
FALLBACK_PRODUCTS = _load_products_from_json_files() or _MINIMAL_FALLBACK

FALLBACK_USERS = [
    {"user_id": "66a000000000000000000101", "full_name": "Nguyễn Văn Hùng", "email": "hung.nguyen@gmail.com", "phone": "0901234501", "gender": "Male", "age": 28, "city": "TP. Hồ Chí Minh", "customer_tier": "VIP"},
    {"user_id": "66a000000000000000000102", "full_name": "Trần Thị Mai", "email": "mai.tran@yahoo.com", "phone": "0901234502", "gender": "Female", "age": 34, "city": "Hà Nội", "customer_tier": "Gold"},
    {"user_id": "66a000000000000000000103", "full_name": "Lê Hoàng Nam", "email": "nam.le@gmail.com", "phone": "0901234503", "gender": "Male", "age": 25, "city": "Đà Nẵng", "customer_tier": "Silver"},
    {"user_id": "66a000000000000000000104", "full_name": "Phạm Thu Thảo", "email": "thao.pham@outlook.com", "phone": "0901234504", "gender": "Female", "age": 31, "city": "Cần Thơ", "customer_tier": "Gold"},
    {"user_id": "66a000000000000000000105", "full_name": "Vũ Minh Tuấn", "email": "tuan.vu@gmail.com", "phone": "0901234505", "gender": "Male", "age": 40, "city": "Hải Phòng", "customer_tier": "VIP"},
    {"user_id": "66a000000000000000000106", "full_name": "Đặng Hoàng Anh", "email": "hoanganh.dang@gmail.com", "phone": "0901234506", "gender": "Male", "age": 22, "city": "TP. Hồ Chí Minh", "customer_tier": "Regular"},
    {"user_id": "66a000000000000000000107", "full_name": "Bùi Khánh Linh", "email": "linh.bui@gmail.com", "phone": "0901234507", "gender": "Female", "age": 27, "city": "Hà Nội", "customer_tier": "Silver"},
    {"user_id": "66a000000000000000000108", "full_name": "Đỗ Đức Trí", "email": "tri.do@gmail.com", "phone": "0901234508", "gender": "Male", "age": 36, "city": "Bình Dương", "customer_tier": "Gold"},
]

# (hàm _load_products_from_json_files đã được định nghĩa ở trên)

def load_products_from_mongo_or_fallback():
    products = []
    if HAS_PYMONGO:
        try:
            client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
            db = client.get_database()
            mongo_prods = list(db.products.find())
            cat_map = {str(c['_id']): c.get('name', 'Khác') for c in db.categories.find()}
            brand_map = {str(b['_id']): b.get('name', 'Khác') for b in db.brands.find()}
            for p in mongo_prods:
                c_id = str(p['categories'][0]) if p.get('categories') and len(p['categories']) > 0 else ''
                b_id = str(p.get('brand', ''))
                products.append({
                    "product_id": str(p['_id']),
                    "sku": p.get('sku', f"SKU-{str(p['_id'])[-6:]}"),
                    "title": p.get('name', 'Sản phẩm'),
                    "category": cat_map.get(c_id, 'Điện máy'),
                    "brand": brand_map.get(b_id, 'Chính hãng'),
                    "price": float(p.get('price', 0)),
                    "sale_price": float(p.get('salePrice') or p.get('price', 0)),
                    "stock": int(p.get('stock', 10)),
                    "rating": 4.8
                })
        except Exception as e:
            print(f"-> Could not fetch products from MongoDB ({e}). Trying JSON export files...")

    if not products:
        products = _load_products_from_json_files()
    if not products:
        products = FALLBACK_PRODUCTS
    return products

def load_users_from_mongo_or_fallback():
    users = []
    if HAS_PYMONGO:
        try:
            client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
            db = client.get_database()
            mongo_users = list(db.users.find())
            for idx, u in enumerate(mongo_users):
                users.append({
                    "user_id": str(u['_id']),
                    "full_name": u.get('fullName', 'Khách hàng'),
                    "email": u.get('email', f"user_{idx}@gmail.com"),
                    "phone": u.get('phone', f"09012345{idx+1:02d}"),
                    "gender": "Male" if idx % 2 == 0 else "Female",
                    "age": random.randint(22, 45),
                    "city": random.choice(["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Hải Phòng"]),
                    "customer_tier": random.choice(["VIP", "Gold", "Silver", "Regular"])
                })
        except Exception as e:
            print(f"-> Could not fetch users from MongoDB ({e}). Using baseline users.")

    if not users:
        users = FALLBACK_USERS
    return users

# -----------------------------------------------------------------------------
# 1. GENERATE PRODUCTS.CSV
# -----------------------------------------------------------------------------
def generate_products_csv(products):
    filepath = os.path.join(DATA_DIR, 'products.csv')
    fieldnames = ['product_id', 'sku', 'title', 'category', 'brand', 'price', 'sale_price', 'stock', 'rating']
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(products)
    print(f"[CSV-Gen] Generated {len(products)} products to: {filepath}")

# -----------------------------------------------------------------------------
# 2. GENERATE USERS.CSV
# -----------------------------------------------------------------------------
def generate_users_csv(users):
    filepath = os.path.join(DATA_DIR, 'users.csv')
    fieldnames = ['user_id', 'full_name', 'email', 'phone', 'gender', 'age', 'city', 'customer_tier']
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(users)
    print(f"[CSV-Gen] Generated {len(users)} users to: {filepath}")

# -----------------------------------------------------------------------------
# 3. GENERATE INTERACTIONS.CSV (User Behavior Clickstream Data)
# -----------------------------------------------------------------------------
def generate_interactions_csv(users, products):
    filepath = os.path.join(DATA_DIR, 'interactions.csv')
    events_pool = [
        ('view', 1.0),
        ('search_click', 2.0),
        ('add_to_cart', 5.0),
        ('purchase', 10.0),
    ]

    prod_ids = [p['product_id'] for p in products]
    rows = []
    idx = 1000
    base_time = datetime.now() - timedelta(days=30)

    for u in users:
        u_id = u["user_id"]
        # Sample 3-6 preferred products per user
        n_pref = min(len(prod_ids), random.randint(3, 6))
        pref_prods = random.sample(prod_ids, n_pref)

        for pid in pref_prods:
            n_events = random.randint(2, 5)
            for _ in range(n_events):
                event_name, weight = random.choice(events_pool)
                timestamp = base_time + timedelta(hours=random.randint(1, 700))
                rows.append({
                    "interaction_id": f"INT-{idx}",
                    "user_id": u_id,
                    "session_id": f"sess_{u_id[-4:]}_{random.randint(10, 99)}",
                    "product_id": pid,
                    "event_type": event_name,
                    "weight": weight,
                    "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S")
                })
                idx += 1

    fieldnames = ['interaction_id', 'user_id', 'session_id', 'product_id', 'event_type', 'weight', 'timestamp']
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"[CSV-Gen] Generated {len(rows)} user interactions to: {filepath}")

# -----------------------------------------------------------------------------
# 4. GENERATE ORDERS.CSV
# -----------------------------------------------------------------------------
def generate_orders_csv(users, products):
    filepath = os.path.join(DATA_DIR, 'orders.csv')
    prod_map = {p["product_id"]: p for p in products}
    prod_ids = list(prod_map.keys())
    rows = []
    
    order_id_counter = 5001
    base_time = datetime.now() - timedelta(days=20)

    for u in users[:10]:
        u_id = u["user_id"]
        n_bought = min(len(prod_ids), random.randint(1, 3))
        bought_pids = random.sample(prod_ids, n_bought)
        
        for pid in bought_pids:
            prod = prod_map[pid]
            qty = random.randint(1, 2)
            amount = prod["sale_price"] * qty
            created_at = base_time + timedelta(days=random.randint(1, 15))
            rows.append({
                "order_id": f"ORD-{order_id_counter}",
                "user_id": u_id,
                "product_id": pid,
                "quantity": qty,
                "unit_price": prod["sale_price"],
                "total_amount": amount,
                "payment_method": random.choice(["COD", "MOMO", "VNPAY", "BANK_TRANSFER"]),
                "created_at": created_at.strftime("%Y-%m-%d %H:%M:%S")
            })
            order_id_counter += 1

    fieldnames = ['order_id', 'user_id', 'product_id', 'quantity', 'unit_price', 'total_amount', 'payment_method', 'created_at']
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"[CSV-Gen] Generated {len(rows)} order purchase records to: {filepath}")

# -----------------------------------------------------------------------------
# MAIN RUNNERc
# -----------------------------------------------------------------------------
if __name__ == '__main__':
 
    
    products = load_products_from_mongo_or_fallback()
    users = load_users_from_mongo_or_fallback()

    generate_products_csv(products)
    generate_users_csv(users)
    generate_interactions_csv(users, products)
    generate_orders_csv(users, products)
    print("==========================================================================")
    print(f"SUCCESS: ==============================All CSV dataset files generated matching MongoDB records in: {DATA_DIR}")
    print("============================================\n")
