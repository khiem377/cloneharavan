import { api } from '@/lib/axios';

/**
 * Service quản lý Giỏ hàng Client (Đồng bộ với BE /api/v1/cart)
 * Tự động gửi kèm Header x-session-id và Authorization Token qua Axios Interceptors
 */
export const cartService = {
  /**
   * Lấy chi tiết giỏ hàng hiện tại (kèm tự động re-validate tồn kho và giá 4 cấp)
   */
  async getCart() {
    const response = await api.get('/cart');
    return response.data;
  },

  /**
   * Thêm 1 hoặc nhiều sản phẩm vào giỏ hàng
   * @param {Object|Array} payload - { variantId, sku, productId, quantity } hoặc [{ variantId, quantity }]
   */
  async addToCart(payload) {
    const response = await api.post('/cart/items', payload);
    return response.data;
  },

  /**
   * Cập nhật số lượng của một dòng sản phẩm trong giỏ
   * @param {string} itemId - ID của dòng item trong cart
   * @param {number} quantity - Số lượng mới
   */
  async updateItemQuantity(itemId, quantity) {
    const response = await api.patch(`/cart/items/${itemId}`, { quantity });
    return response.data;
  },

  /**
   * Xóa một sản phẩm khỏi giỏ hàng
   * @param {string} itemId - ID dòng item
   */
  async removeItem(itemId) {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data;
  },

  /**
   * Xóa sạch toàn bộ giỏ hàng
   */
  async clearCart() {
    const response = await api.delete('/cart');
    return response.data;
  },

  /**
   * Áp dụng mã giảm giá Coupon
   * @param {string} couponCode - Mã voucher
   */
  async applyCoupon(couponCode) {
    const response = await api.post('/cart/apply-coupon', { couponCode });
    return response.data;
  },

  /**
   * Gỡ bỏ mã giảm giá Coupon
   */
  async removeCoupon() {
    const response = await api.delete('/cart/remove-coupon');
    return response.data;
  },

  /**
   * Kiểm tra tính hợp lệ của giỏ hàng trước khi sang Checkout
   */
  async validateCheckout() {
    const response = await api.post('/cart/validate-checkout');
    return response.data;
  },

  /**
   * Hợp nhất giỏ hàng của Guest vào User khi đăng nhập
   * @param {string} [sessionId] - ID session của khách vãng lai nếu cần chỉ định
   */
  async mergeGuestCart(sessionId) {
    const response = await api.post('/cart/merge', sessionId ? { sessionId } : {});
    return response.data;
  },
};

export default cartService;
