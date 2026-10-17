"""Gom tương tác thành ma trận thưa (dạng COO) dùng cho ALS."""
from dataclasses import dataclass

import numpy as np

# Ngưỡng điểm ròng để coi là "có quan tâm" (positive).
MIN_POSITIVE = 0.05
# Hệ số tin cậy: conf = 1 + ALPHA * log1p(điểm ròng)
CONFIDENCE_ALPHA = 10.0


@dataclass
class InteractionData:
    user_keys: list
    prod_keys: list
    # Cặp positive dùng để huấn luyện
    rows: np.ndarray
    cols: np.ndarray
    conf: np.ndarray
    # Cặp không được gợi ý lại: đã mua hoặc điểm ròng âm
    excl_rows: np.ndarray
    excl_cols: np.ndarray

    @property
    def n_users(self):
        return len(self.user_keys)

    @property
    def n_items(self):
        return len(self.prod_keys)


def build_interaction_data(interactions):
    """Cộng dồn trọng số theo (user, product) bằng numpy, không dùng dict lồng."""
    user_keys = sorted({x['u_key'] for x in interactions})
    prod_keys = sorted({x['p_key'] for x in interactions})
    u_index = {u: i for i, u in enumerate(user_keys)}
    p_index = {p: i for i, p in enumerate(prod_keys)}
    n_items = len(prod_keys)

    u_idx = np.fromiter((u_index[x['u_key']] for x in interactions), dtype=np.int64, count=len(interactions))
    p_idx = np.fromiter((p_index[x['p_key']] for x in interactions), dtype=np.int64, count=len(interactions))
    weights = np.fromiter((x['weight'] for x in interactions), dtype=np.float64, count=len(interactions))
    purchase = np.fromiter((x['is_purchase'] for x in interactions), dtype=np.float64, count=len(interactions))

    pair_key = u_idx * n_items + p_idx
    uniq, inverse = np.unique(pair_key, return_inverse=True)
    net = np.bincount(inverse, weights=weights, minlength=len(uniq))
    bought = np.bincount(inverse, weights=purchase, minlength=len(uniq)) > 0

    pair_rows = uniq // n_items
    pair_cols = uniq % n_items

    positive = net > MIN_POSITIVE
    exclude = bought | (net < 0)

    conf = 1.0 + CONFIDENCE_ALPHA * np.log1p(net[positive])
    return InteractionData(
        user_keys=user_keys,
        prod_keys=prod_keys,
        rows=pair_rows[positive],
        cols=pair_cols[positive],
        conf=conf,
        excl_rows=pair_rows[exclude],
        excl_cols=pair_cols[exclude],
    )
