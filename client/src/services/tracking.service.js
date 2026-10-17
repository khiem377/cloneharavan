import { api } from '@/lib/axios';
import useAuthStore from '@/store/authStore';

const BATCH_ENDPOINT = '/api/v1/recommendations/interactions/batch';
const FLUSH_SIZE = 10;
const FLUSH_INTERVAL_MS = 5000;
const MAX_QUEUE = 50; // trùng giới hạn BE
const CLIENT_DEDUP_MS = 30 * 1000;

// Event giá trị cao: gửi ngay (vẫn qua endpoint batch)
const IMMEDIATE_TYPES = new Set([
  'add_to_cart',
  'purchase',
  'wishlist_add',
  'cart_remove',
  'checkout_abandon',
  'review_submit',
]);

// Event "xem": chặn lặp lại trong CLIENT_DEDUP_MS trên cùng sản phẩm
const DEDUP_TYPES = new Set(['product_detail', 'view', 'view_deep', 'view_bounce']);

let queue = [];
let flushTimer = null;
let listenersAttached = false;
const lastSent = new Map();

const getSessionId = () => {
  const { anonymousId, getOrCreateAnonymousId } = useAuthStore.getState();
  return anonymousId || getOrCreateAnonymousId();
};

const getAccessToken = () => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) return accessToken;
  try {
    return JSON.parse(localStorage.getItem('client-auth'))?.state?.accessToken || null;
  } catch {
    return null;
  }
};

const isDuplicate = (productId, interactionType) => {
  if (!DEDUP_TYPES.has(interactionType)) return false;
  const key = `${productId}_${interactionType}`;
  const now = Date.now();
  const last = lastSent.get(key);
  if (last && now - last < CLIENT_DEDUP_MS) return true;
  lastSent.set(key, now);
  if (lastSent.size > 500) {
    for (const [k, t] of lastSent) {
      if (now - t > CLIENT_DEDUP_MS) lastSent.delete(k);
    }
  }
  return false;
};

const clearTimer = () => {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
};

/**
 * Gửi toàn bộ queue trong 1 request.
 * keepalive: request không bị huỷ khi đóng tab / chuyển trang (thay cho axios).
 */
const flush = () => {
  clearTimer();
  if (queue.length === 0 || typeof window === 'undefined') return;

  const events = queue;
  queue = [];

  try {
    const headers = { 'Content-Type': 'application/json' };
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    fetch(BATCH_ENDPOINT, {
      method: 'POST',
      headers,
      credentials: 'include',
      keepalive: true,
      body: JSON.stringify({ sessionId: getSessionId(), events }),
    }).catch(() => {
      // Tracking chạy ngầm, bỏ qua lỗi mạng
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Tracking flush notice:', error?.message);
    }
  }
};

const scheduleFlush = () => {
  if (flushTimer) return;
  flushTimer = setTimeout(flush, FLUSH_INTERVAL_MS);
};

const attachLifecycleListeners = () => {
  if (listenersAttached || typeof window === 'undefined') return;
  listenersAttached = true;

  // Component (vd ProductViewTracker) có thể enqueue event dwell trong cùng lượt "hidden",
  // nên đẩy flush sang macrotask kế tiếp để gom luôn các event đó.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') setTimeout(flush, 0);
  });
  window.addEventListener('pagehide', flush);
};

export const trackingService = {
  /**
   * Ghi nhận tương tác của người dùng để phục vụ hệ thống gợi ý AI (Recommendation Engine).
   * Event được gom vào queue và gửi theo lô (10 event hoặc 5 giây, hoặc khi rời trang).
   * @param {Object} payload
   * @param {string} payload.productId - ID sản phẩm
   * @param {string} payload.interactionType - Loại tương tác: 'view', 'product_detail', 'search_click', 'filter_apply', 'compare_add', 'wishlist_add', ...
   * @param {number} [payload.dwellTime=0] - Thời gian xem trang (giây)
   * @param {Object} [payload.context={}] - Ngữ cảnh tương tác (device, source, categoryId, brandId, ...)
   */
  recordInteraction({ productId, interactionType = 'view', dwellTime = 0, context = {} }) {
    if (!productId || typeof window === 'undefined') return null;
    if (isDuplicate(productId, interactionType)) return null;

    attachLifecycleListeners();

    queue.push({
      productId,
      interactionType,
      dwellTime,
      occurredAt: Date.now(),
      context: {
        device: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
        source: window.location.pathname,
        ...context,
      },
    });

    if (IMMEDIATE_TYPES.has(interactionType) || queue.length >= Math.min(FLUSH_SIZE, MAX_QUEUE)) {
      flush();
    } else {
      scheduleFlush();
    }
    return true;
  },

  /**
   * Ghi nhận click vào kết quả tìm kiếm (tăng CTR và độ chính xác cho Search AI)
   * @param {string} keyword
   * @param {string} productId
   */
  async recordSearchClick(keyword, productId) {
    if (!keyword || typeof window === 'undefined') return;

    try {
      // 1. Tăng CTR từ khóa trong Search Engine
      await api.post('/search/click', { keyword, productId });

      // 2. Ghi nhận interaction search_click cho recommendation engine (qua queue)
      if (productId) {
        this.recordInteraction({
          productId,
          interactionType: 'search_click',
          context: { searchKeyword: keyword },
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Tracking recordSearchClick notice:', error?.message);
      }
    }
  },

  /** Đẩy ngay toàn bộ event đang chờ (dùng khi cần, vd trước khi logout). */
  flush,
};

export default trackingService;
