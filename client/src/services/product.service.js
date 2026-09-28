import { api } from '@/lib/axios';

export const productService = {
  /**
   * Lấy chi tiết sản phẩm phía client
   */
  async getProductBySlug(slugOrId) {
    if (!slugOrId) return null;
    try {
      const res = await api.get(`/products/${encodeURIComponent(slugOrId)}`);
      return res.data?.data || null;
    } catch (err) {
      console.error('Client getProductBySlug error:', err?.message);
      return null;
    }
  },

  /**
   * Lấy danh sách biến thể phía client
   */
  async getProductVariants(productId) {
    if (!productId) return [];
    try {
      const res = await api.get(`/products/${productId}/variants`);
      return res.data?.data || [];
    } catch (err) {
      console.error('Client getProductVariants error:', err?.message);
      return [];
    }
  },

  /**
   * Lấy ưu đãi khuyến mãi phía client
   */
  async getProductDeals(slugOrId) {
    if (!slugOrId) return null;
    try {
      const res = await api.get(`/products/${encodeURIComponent(slugOrId)}/deals`);
      return res.data?.data || null;
    } catch (err) {
      console.error('Client getProductDeals error:', err?.message);
      return null;
    }
  },

  /**
   * Lấy sản phẩm tương tự
   */
  async getSimilarProducts(productId, limit = 6) {
    if (!productId) return [];
    try {
      const res = await api.get(`/recommendations/similar/${productId}`, {
        params: { limit },
      });
      return res.data?.data || [];
    } catch (err) {
      console.error('Client getSimilarProducts error:', err?.message);
      return [];
    }
  },
};

export default productService;
