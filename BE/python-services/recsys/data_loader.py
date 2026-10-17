"""Nạp dữ liệu tương tác từ MongoDB (nguồn duy nhất).

Không có fallback: thiếu MONGO_URI hoặc không kết nối được thì báo lỗi rõ ràng
để cron ghi log thất bại, thay vì âm thầm dùng dữ liệu khác.
"""
from datetime import timedelta

from .config import get_mongo_uri
from .weights import INTERACTION_WEIGHTS, MAX_AGE_DAYS, decay_factor, utc_now

try:
    from pymongo import MongoClient
except ImportError:  # pragma: no cover
    MongoClient = None

MIN_ABS_WEIGHT = 0.01


def _make_row(u_key, p_key, weight, is_purchase):
    return {'u_key': u_key, 'p_key': p_key, 'weight': weight, 'is_purchase': is_purchase}


def load_interactions():
    """Trả về (danh sách tương tác đã áp decay, tên nguồn).

    Đọc bằng cursor, chỉ lấy trường cần và chỉ trong MAX_AGE_DAYS gần nhất.
    """
    if MongoClient is None:
        raise RuntimeError("Thiếu thư viện 'pymongo'. Chạy: pip install pymongo")

    uri = get_mongo_uri(required=True)
    now = utc_now()
    cutoff = now - timedelta(days=MAX_AGE_DAYS)

    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
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
        return rows, 'MongoDB'
    finally:
        client.close()
