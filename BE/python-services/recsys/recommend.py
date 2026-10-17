"""Tính top-N gợi ý theo lô, vectorized."""
import numpy as np

CHUNK_USERS = 2048


def _exclusion_slices(excl_rows, excl_cols):
    order = np.argsort(excl_rows, kind='stable')
    return excl_rows[order], excl_cols[order]


def iter_top_n(user_factors, item_factors, excl_rows, excl_cols, top_n=15, chunk=CHUNK_USERS):
    """Sinh (user_idx, item_idx[], score[]) cho từng user có vector khác 0.

    Mỗi lô chỉ giữ chunk x n_items điểm trong RAM, không dựng cả ma trận n_users x n_items.
    Sản phẩm trong danh sách loại trừ (đã mua / điểm âm) bị chặn bằng -inf.
    """
    n_users, n_items = user_factors.shape[0], item_factors.shape[0]
    top_n = min(top_n, n_items)
    ex_rows, ex_cols = _exclusion_slices(excl_rows, excl_cols)
    active = np.any(user_factors != 0.0, axis=1)

    for start in range(0, n_users, chunk):
        end = min(start + chunk, n_users)
        scores = user_factors[start:end] @ item_factors.T

        lo = np.searchsorted(ex_rows, start, side='left')
        hi = np.searchsorted(ex_rows, end, side='left')
        if hi > lo:
            scores[ex_rows[lo:hi] - start, ex_cols[lo:hi]] = -np.inf

        if top_n < n_items:
            part = np.argpartition(-scores, top_n - 1, axis=1)[:, :top_n]
        else:
            part = np.tile(np.arange(n_items), (end - start, 1))
        part_scores = np.take_along_axis(scores, part, axis=1)
        order = np.argsort(-part_scores, axis=1)
        part = np.take_along_axis(part, order, axis=1)
        part_scores = np.take_along_axis(part_scores, order, axis=1)

        for local in range(end - start):
            u = start + local
            if not active[u]:
                continue
            keep = np.isfinite(part_scores[local])
            if keep.any():
                yield u, part[local][keep], part_scores[local][keep]
