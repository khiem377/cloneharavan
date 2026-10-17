"""Đánh giá offline: leave-one-out với HitRate@K và NDCG@K, so với baseline phổ biến."""
import math

import numpy as np

from .als import train_als
from .interaction_matrix import InteractionData

MIN_POSITIVES_PER_USER = 3


def _split_leave_one_out(data, seed):
    """Mỗi user có >= 3 cặp positive: giấu ngẫu nhiên 1 cặp làm tập kiểm tra."""
    rng = np.random.default_rng(seed)
    held = np.zeros(len(data.rows), dtype=bool)
    order = np.argsort(data.rows, kind='stable')
    rows_sorted = data.rows[order]
    bounds = np.flatnonzero(np.diff(rows_sorted)) + 1
    for group in np.split(order, bounds):
        if len(group) >= MIN_POSITIVES_PER_USER:
            held[rng.choice(group)] = True
    return held


def evaluate(data: InteractionData, top_k=10, seed=7, **als_kwargs):
    """Trả về dict số liệu, hoặc None nếu dữ liệu quá ít để đánh giá."""
    held = _split_leave_one_out(data, seed)
    if held.sum() < 5:
        return None

    train = ~held
    users, items = train_als(
        data.rows[train], data.cols[train], data.conf[train],
        data.n_users, data.n_items, seed=seed, **als_kwargs,
    )
    popularity = np.bincount(data.cols[train], weights=data.conf[train], minlength=data.n_items)

    # Loại sản phẩm user đã có trong tập train + đã mua + điểm âm
    seen = {}
    for r, c in zip(data.rows[train], data.cols[train]):
        seen.setdefault(int(r), set()).add(int(c))
    for r, c in zip(data.excl_rows, data.excl_cols):
        seen.setdefault(int(r), set()).add(int(c))

    hit_als = hit_pop = ndcg_als = ndcg_pop = 0.0
    n_eval = 0
    for r, target in zip(data.rows[held], data.cols[held]):
        r, target = int(r), int(target)
        mask = np.zeros(data.n_items, dtype=bool)
        mask[list(seen.get(r, ()))] = True
        mask[target] = False
        if mask.all():
            continue
        for name, scores in (('als', users[r] @ items.T), ('pop', popularity)):
            scores = np.where(mask, -np.inf, scores)
            rank = int(np.sum(scores > scores[target]))  # 0 = đứng đầu
            if rank < top_k:
                gain = 1.0 / math.log2(rank + 2)
                if name == 'als':
                    hit_als += 1
                    ndcg_als += gain
                else:
                    hit_pop += 1
                    ndcg_pop += gain
        n_eval += 1

    if n_eval == 0:
        return None
    return {
        'users': n_eval,
        'k': top_k,
        'hit_als': hit_als / n_eval,
        'hit_pop': hit_pop / n_eval,
        'ndcg_als': ndcg_als / n_eval,
        'ndcg_pop': ndcg_pop / n_eval,
    }
