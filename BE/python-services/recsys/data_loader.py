"""Nạp dữ liệu tương tác: ưu tiên MongoDB, dự phòng CSV."""
import csv
import os
import re
from datetime import timedelta

from .config import DATA_DIR, get_mongo_uri
from .weights import (
    INTERACTION_WEIGHTS, MAX_AGE_DAYS, decay_factor, to_naive_utc, utc_now,
)

try:
    from pymongo import MongoClient
    HAS_PYMONGO = True
except ImportError:
    HAS_PYMONGO = False

_OBJECT_ID_RE = re.compile(r'^[0-9a-fA-F]{24}$')
MIN_ABS_WEIGHT = 0.01


def _make_row(u_key, p_key, weight, is_purchase):
    return {'u_key': u_key, 'p_key': p_key, 'weight': weight, 'is_purchase': is_purchase}


def _load_from_mongo(uri):
    """Đọc bằng cursor, chỉ lấy trường cần và chỉ trong MAX_AGE_DAYS gần nhất."""
    now = utc_now()
    cutoff = now - timedelta(days=MAX_AGE_DAYS)

    client = MongoClient(uri, serverSelectionTimeoutMS=3000)
    try:
        db = client.get_database()
        query = {'$or': [{'timestamp': {'$gte': cutoff}}, {'createdAt': {'$gte': cutoff}}]}
        projection = {'userId': 1, 'sessionId': 1, 'productId': 1,
                      'interactionType': 1, 'timestamp': 1, 'createdAt': 1}
        rows = []
        for doc in db.userinteractions.find(query, projection):
            u_key = str(doc['userId']) if doc.get('userId') else str(doc.get('sessionId') or '')
            p_key = str(doc.get('productId') or '')
            if not u_key or not p_key:
                continue
            i_type = doc.get('interactionType', 'view')
            weight = INTERACTION_WEIGHTS.get(i_type, 1.0)
            weight *= decay_factor(doc.get('timestamp') or doc.get('createdAt'), now)
            if abs(weight) < MIN_ABS_WEIGHT:
                continue
            rows.append(_make_row(u_key, p_key, weight, i_type == 'purchase'))
        return rows
    finally:
        client.close()


def _ensure_csv_exists():
    if (os.path.exists(os.path.join(DATA_DIR, 'products.csv'))
            and os.path.exists(os.path.join(DATA_DIR, 'interactions.csv'))):
        return
    print('-> Chưa có dataset CSV, đang tự sinh...')
    try:
        from generate_dataset import (
            generate_products_csv, generate_users_csv,
            generate_interactions_csv, generate_orders_csv,
        )
        generate_products_csv()
        generate_users_csv()
        generate_interactions_csv()
        generate_orders_csv()
    except Exception as exc:  # noqa: BLE001 - chỉ cảnh báo, không chặn pipeline
        print(f'[Warning] Không sinh được dataset: {exc}')


def _load_from_csv():
    _ensure_csv_exists()
    path = os.path.join(DATA_DIR, 'interactions.csv')
    if not os.path.exists(path):
        return []
    now = utc_now()
    rows, skipped = [], 0
    with open(path, 'r', encoding='utf-8') as f:
        for row in csv.DictReader(f):
            u_key = (row.get('user_id') or '').strip() or (row.get('session_id') or '').strip()
            p_key = (row.get('product_id') or '').strip()
            i_type = row.get('event_type') or row.get('interaction_type')
            # Bỏ dòng hỏng (thiếu cột hoặc product_id không phải ObjectId)
            if not u_key or not _OBJECT_ID_RE.match(p_key) or not i_type:
                skipped += 1
                continue
            weight = INTERACTION_WEIGHTS.get(i_type)
            if weight is None:
                try:
                    weight = float(row.get('weight') or 1.0)
                except ValueError:
                    weight = 1.0
            ts = to_naive_utc(row.get('timestamp'))
            if ts is not None and (now - ts).days > MAX_AGE_DAYS:
                continue
            weight *= decay_factor(ts, now)
            if abs(weight) < MIN_ABS_WEIGHT:
                continue
            rows.append(_make_row(u_key, p_key, weight, i_type == 'purchase'))
    if skipped:
        print(f'-> Bỏ qua {skipped} dòng CSV không hợp lệ')
    return rows


def load_interactions():
    """Trả về (danh sách tương tác đã áp decay, tên nguồn)."""
    uri = get_mongo_uri()
    if uri and HAS_PYMONGO:
        try:
            rows = _load_from_mongo(uri)
            if rows:
                return rows, 'MongoDB'
        except Exception as exc:  # noqa: BLE001
            print(f'-> MongoDB không dùng được ({exc}). Chuyển sang CSV.')
    elif not uri:
        print('-> Chưa cấu hình MONGO_URI, dùng dữ liệu CSV.')
    return _load_from_csv(), 'data/interactions.csv'


def load_product_titles():
    """Map product_id -> {title, category} từ products.csv (chỉ để xuất CSV dễ đọc)."""
    path = os.path.join(DATA_DIR, 'products.csv')
    meta = {}
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            for row in csv.DictReader(f):
                p_id = (row.get('product_id') or '').strip()
                if p_id:
                    meta[p_id] = {'title': row.get('title', ''), 'category': row.get('category', '')}
    return meta
