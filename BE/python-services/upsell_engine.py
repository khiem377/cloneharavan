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

from recsys.config import get_mongo_uri

TIER_BULK_BATCH = 1000

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

        # Chuẩn hóa về [0,1] để các yếu tố cùng thang: gần giá hơn thì điểm cao hơn,
        # cộng thêm thương hiệu / nổi bật / hot. Trước đây số hạng giá (x1e6) lấn át hoàn toàn.
        closeness = 1.0 / (1.0 + price_diff / max(current_max_price, 1.0))
        brand_id = str(p.get('brand', '')) if p.get('brand') else ''
        current_brand = str(current_product.get('brand', '')) if current_product.get('brand') else ''
        same_brand_bonus = 0.3 if brand_id == current_brand and brand_id else 0.0

        is_featured = 0.3 if p.get('isFeatured') else 0.0
        is_hot = 0.2 if p.get('isHot') else 0.0
        score = closeness + same_brand_bonus + is_featured + is_hot

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

    client = MongoClient(get_mongo_uri(required=True), serverSelectionTimeoutMS=5000)
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
    category_cache = {}  # product_id -> danh sách sản phẩm cùng danh mục (gộp 1 lần)
    tier2_cache = {}     # (product_id, giá) -> gợi ý tier 2

    def get_category_products(product_id, current_product):
        cached = category_cache.get(product_id)
        if cached is not None:
            return cached
        merged, seen_pids = [], set()
        for cat_id in current_product.get('categories', []):
            for cp in products_by_category.get(str(cat_id), []):
                cpid = str(cp['_id'])
                if cpid not in seen_pids:
                    seen_pids.add(cpid)
                    merged.append(cp)
        category_cache[product_id] = merged
        return merged

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
            cache_key = (product_id, current_price)
            if cache_key not in tier2_cache:
                tier2_cache[cache_key] = build_tier2_suggestions(
                    current_product,
                    current_price,
                    get_category_products(product_id, current_product),
                    product_id,
                )
            tier2 = tier2_cache[cache_key]

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

    upserted = modified = 0
    for i in range(0, len(bulk_ops), TIER_BULK_BATCH):
        result = db.upsellsuggestions.bulk_write(bulk_ops[i:i + TIER_BULK_BATCH], ordered=False)
        upserted += result.upserted_count
        modified += result.modified_count
    if bulk_ops:
        print(f"-> Upserted: {upserted} | Modified: {modified}")

    db.upsellsuggestions.create_index([('variantId', 1)], unique=True)
    db.upsellsuggestions.create_index([('productId', 1)])

    print(f"-> Processed: {processed} variants | Skipped: {skipped}")
    print("=" * 70)
    print("UPSELL ENGINE COMPLETED!")
    print("=" * 70)
    client.close()


if __name__ == '__main__':
    run_upsell_engine()