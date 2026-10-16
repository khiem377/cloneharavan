"""Xuất kết quả gợi ý ra CSV và đồng bộ vào MongoDB (bulk)."""
import csv
import os
from datetime import datetime

from .config import DATA_DIR, get_mongo_uri

try:
    from bson import ObjectId
    from pymongo import MongoClient, UpdateOne
    HAS_PYMONGO = True
except ImportError:
    HAS_PYMONGO = False

MODEL_REASON = 'Implicit ALS + Time-Decay'
BULK_BATCH = 500


def export_csv(recommendations, titles):
    """recommendations: {u_key: [(product_id, score), ...]}"""
    path = os.path.join(DATA_DIR, 'recommendations_output.csv')
    count = 0
    with open(path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['user_id', 'product_id', 'title', 'predicted_score', 'rank'])
        for u_key, recs in recommendations.items():
            for rank, (p_key, score) in enumerate(recs, start=1):
                writer.writerow([u_key, p_key, titles.get(p_key, {}).get('title', ''),
                                 round(score, 4), rank])
                count += 1
    return count


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
    """Ghi bulk theo lô. Trả về số document đã gửi, hoặc None nếu bỏ qua/lỗi."""
    uri = get_mongo_uri()
    if not (HAS_PYMONGO and uri):
        print('-> Bỏ qua đồng bộ MongoDB (thiếu pymongo hoặc MONGO_URI).')
        return None
    now = datetime.now()
    ops = [_build_op(u, recs, now) for u, recs in recommendations.items()]
    client = MongoClient(uri, serverSelectionTimeoutMS=3000)
    try:
        coll = client.get_database().personalizedrecommendations
        for i in range(0, len(ops), BULK_BATCH):
            coll.bulk_write(ops[i:i + BULK_BATCH], ordered=False)
        return len(ops)
    except Exception as exc:  # noqa: BLE001
        print(f'-> Đồng bộ MongoDB lỗi ({exc}). Kết quả vẫn nằm trong CSV.')
        return None
    finally:
        client.close()
