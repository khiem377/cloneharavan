import { api } from '@/lib/axios';

export const recommendationService = {
  /**
   * Lấy danh sách gợi ý cá nhân hoá cho user / session hiện tại
   * @param {number} [limit=10]
   */
  async getPersonalized(limit = 10) {
    try {
      const res = await api.get('/recommendations/personalized', {
        params: { limit },
      });
      const data = res.data?.data || [];
      if (Array.isArray(data) && data.length > 0) return data;
      return await this.getTrending(limit);
    } catch (err) {
      console.warn('recommendationService.getPersonalized error, fallback to trending:', err?.message);
      return await this.getTrending(limit);
    }
  },

  /**
   * Lấy danh sách gợi ý theo phiên duyệt hiện tại (session-based)
   * @param {number} [limit=10]
   */
  async getSessionBased(limit = 10) {
    try {
      const res = await api.get('/recommendations/session-based', {
        params: { limit },
      });
      return res.data?.data || [];
    } catch (err) {
      console.warn('recommendationService.getSessionBased error:', err?.message);
      return [];
    }
  },

  /**
   * Lấy danh sách sản phẩm thịnh hành (Trending)
   * @param {number} [limit=10]
   */
  async getTrending(limit = 10) {
    try {
      const res = await api.get('/recommendations/trending', {
        params: { limit },
      });
      return res.data?.data || [];
    } catch (err) {
      console.error('recommendationService.getTrending error:', err?.message);
      return [];
    }
  },

  /**
   * Lấy danh sách sản phẩm tương tự (Item-CF)
   * @param {string} productId
   * @param {number} [limit=6]
   */
  async getSimilar(productId, limit = 6) {
    if (!productId) return [];
    try {
      const res = await api.get(`/recommendations/similar/${productId}`, {
        params: { limit },
      });
      return res.data?.data || [];
    } catch (err) {
      console.error('recommendationService.getSimilar error:', err?.message);
      return [];
    }
  },
};

export default recommendationService;
