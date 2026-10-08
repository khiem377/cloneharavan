const API_SERVER_URL = process.env.API_SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const recommendationServerService = {
  /**
   * Lấy danh sách sản phẩm thịnh hành (Trending) phía Server
   * @param {number} [limit=10]
   */
  async getTrending(limit = 10) {
    try {
      const res = await fetch(`${API_SERVER_URL}/recommendations/trending?limit=${limit}`, {
        cache: 'no-store',
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json?.data || [];
    } catch (err) {
      console.error('SSR recommendationServerService.getTrending error:', err?.message);
      return [];
    }
  },

  /**
   * Lấy danh sách gợi ý cá nhân hoá phía Server (Fallback trending nếu chưa có user)
   * @param {number} [limit=10]
   */
  async getPersonalized(limit = 10) {
    try {
      const res = await fetch(`${API_SERVER_URL}/recommendations/personalized?limit=${limit}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        const items = json?.data || [];
        if (Array.isArray(items) && items.length > 0) return items;
      }
      return await this.getTrending(limit);
    } catch (err) {
      console.warn('SSR recommendationServerService.getPersonalized error, fallback:', err?.message);
      return await this.getTrending(limit);
    }
  },
};

export default recommendationServerService;
