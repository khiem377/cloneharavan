"""Đồng bộ kết quả gợi ý vào MongoDB (bulk).

Không xuất CSV và không bỏ qua âm thầm: thiếu cấu hình hoặc lỗi ghi sẽ ném lỗi.
"""
from datetime import datetime

from .config import get_mongo_uri

try:
    from bson import ObjectId
    from pymongo import MongoClient, UpdateOne
except ImportError:  # pragma: no cover
    MongoClient = None

MODEL_REASON = 'Implicit ALS + Time-Decay'
BULK_BATCH = 500


def _build_op(u_key, recs, now):
    is_user = ObjectId.is_valid(u_key)
    flt = {'userId': ObjectId(u_key)} if is_user else {'sessionId': u_key}
    products = [
        {'productId': ObjectId(p_key), 'predictedScore': round(score, 4), 'reason': MODEL_REASON}
        for p_key, score in recs if ObjectId.is_valid(p_key)
    ]
    doc = {
        'userId': ObjectId(u_key) if is_user else None,
        'sessionId': '' if is_user else u_key,
        'recommendedProducts': products,
        'lastCalculatedAt': now,
    }
    return UpdateOne(flt, {'$set': doc}, upsert=True)


def sync_mongo(recommendations):
    """Ghi bulk theo lô vào collection personalizedrecommendations. Trả về số document đã gửi."""
    if MongoClient is None:
        raise RuntimeError("Thiếu thư viện 'pymongo'. Chạy: pip install pymongo")

    uri = get_mongo_uri(required=True)
    now = datetime.now()
    ops = [_build_op(u, recs, now) for u, recs in recommendations.items()]
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    try:
        coll = client.get_database().personalizedrecommendations
        for i in range(0, len(ops), BULK_BATCH):
            coll.bulk_write(ops[i:i + BULK_BATCH], ordered=False)
        return len(ops)
    finally:
        client.close()
