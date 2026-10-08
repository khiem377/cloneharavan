import { api } from '@/lib/axios';
import useAuthStore from '@/store/authStore';

export const trackingService = {
  /**
   * Ghi nhận tương tác của người dùng để phục vụ hệ thống gợi ý AI (Recommendation Engine)
   * @param {Object} payload
   * @param {string} payload.productId - ID sản phẩm
   * @param {string} payload.interactionType - Loại tương tác: 'view', 'product_detail', 'search_click', 'filter_apply', 'compare_add', 'wishlist_add'
   * @param {number} [payload.dwellTime=0] - Thời gian xem trang (giây)
   * @param {Object} [payload.context={}] - Ngữ cảnh tương tác (device, source, categoryId, brandId, ...)
   */
  async recordInteraction({ productId, interactionType = 'view', dwellTime = 0, context = {} }) {
    if (!productId || typeof window === 'undefined') return null;

    try {
      const { anonymousId, getOrCreateAnonymousId } = useAuthStore.getState();
      const sessionId = anonymousId || getOrCreateAnonymousId();

      const response = await api.post('/recommendations/interactions', {
        sessionId,
        productId,
        interactionType,
        dwellTime,
        context: {
          device: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
          source: window.location.pathname,
          ...context,
        },
      });

      return response.data;
    } catch (error) {
      // Tracking chạy ngầm, không làm phiền người dùng nếu lỗi mạng
      if (process.env.NODE_ENV === 'development') {
        console.warn('Tracking recordInteraction notice:', error?.message);
      }
      return null;
    }
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

      // 2. Ghi nhận interaction search_click cho recommendation engine
      if (productId) {
        await this.recordInteraction({
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
};

export default trackingService;
