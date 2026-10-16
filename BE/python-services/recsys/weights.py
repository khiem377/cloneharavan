"""Trọng số hành vi và time-decay."""
import math
from datetime import datetime, timezone

INTERACTION_WEIGHTS = {
    'view':              1.0,
    'view_deep':         2.5,
    'product_detail':    1.8,
    'search_click':      2.0,
    'filter_apply':      1.5,
    'compare_add':       1.5,
    'wishlist_add':      2.5,
    'share_product':     2.0,
    'review_submit':     3.0,
    'add_to_cart':       5.0,
    'purchase':         10.0,
    # Tín hiệu âm
    'view_bounce':      -1.5,
    'cart_remove':      -1.0,
    'checkout_abandon': -0.5,
    'search_noresult':  -0.5,
}

HALF_LIFE_DAYS = 7      # trọng số giảm 50% sau 7 ngày
MAX_AGE_DAYS = 90       # sau 90 ngày trọng số < 0.02%, bỏ luôn để đỡ đọc dữ liệu thừa
_LN2 = math.log(2)


def utc_now():
    """Thời điểm hiện tại dạng naive UTC (cùng quy ước với datetime pymongo trả về)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def to_naive_utc(ts):
    """Chuẩn hóa timestamp (datetime hoặc chuỗi ISO) về naive UTC. Lỗi thì trả None."""
    if ts is None:
        return None
    if isinstance(ts, str):
        try:
            ts = datetime.fromisoformat(ts.strip().replace('Z', '+00:00'))
        except ValueError:
            return None
    if not isinstance(ts, datetime):
        return None
    if ts.tzinfo is not None:
        ts = ts.astimezone(timezone.utc).replace(tzinfo=None)
    return ts


def decay_factor(ts, now=None):
    """Hệ số suy giảm half-life. Không có timestamp thì không suy giảm."""
    ts = to_naive_utc(ts)
    if ts is None:
        return 1.0
    now = now or utc_now()
    age_days = max((now - ts).total_seconds() / 86400.0, 0.0)
    return math.exp(-_LN2 * age_days / HALF_LIFE_DAYS)
