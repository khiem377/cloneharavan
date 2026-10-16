"""Implicit ALS (Hu, Koren, Volinsky 2008) thuần numpy, không cần scipy.

Khác SVD cũ: ô chưa tương tác KHÔNG bị coi là "không thích" mà là
"chưa biết" với độ tin cậy thấp (1). Chỉ cặp đã quan sát mới có độ tin cậy cao.
Mỗi bước giải hệ k x k cho từng user/item nên chi phí tỉ lệ với số tương tác
đã quan sát, không phải kích thước ma trận đầy đủ.
"""
import numpy as np

DEFAULT_FACTORS = 16
DEFAULT_ITERATIONS = 15
# Dò trên dữ liệu hiện tại (8 seed, leave-one-out): reg lớn chống overfit tốt nhất
DEFAULT_REG = 8.0


def _to_csr(major, minor, conf, n_major):
    """Sắp xếp COO theo chỉ số chính, trả (indptr, minor, conf)."""
    order = np.argsort(major, kind='stable')
    major, minor, conf = major[order], minor[order], conf[order]
    indptr = np.zeros(n_major + 1, dtype=np.int64)
    np.cumsum(np.bincount(major, minlength=n_major), out=indptr[1:])
    return indptr, minor, conf


def _solve_side(fixed, indptr, indices, conf, reg):
    """Cập nhật toàn bộ hàng của một phía khi phía kia cố định."""
    n, k = len(indptr) - 1, fixed.shape[1]
    gram = fixed.T @ fixed + reg * np.eye(k)
    out = np.zeros((n, k))
    for i in range(n):
        start, end = indptr[i], indptr[i + 1]
        if start == end:
            continue
        y = fixed[indices[start:end]]
        c = conf[start:end]
        a = gram + (y.T * (c - 1.0)) @ y
        b = y.T @ c
        out[i] = np.linalg.solve(a, b)
    return out


def train_als(rows, cols, conf, n_users, n_items,
              factors=DEFAULT_FACTORS, iterations=DEFAULT_ITERATIONS,
              reg=DEFAULT_REG, seed=42):
    """Trả về (user_factors, item_factors)."""
    k = max(2, min(factors, n_users - 1, n_items - 1))
    rng = np.random.default_rng(seed)
    users = rng.normal(0, 0.01, (n_users, k))
    items = rng.normal(0, 0.01, (n_items, k))

    user_csr = _to_csr(rows, cols, conf, n_users)
    item_csr = _to_csr(cols, rows, conf, n_items)

    for _ in range(iterations):
        users = _solve_side(items, *user_csr, reg)
        items = _solve_side(users, *item_csr, reg)
    return users, items
