import { api } from '@/lib/axios';

export const orderService = {
  /**
   * Kiểm tra thông tin đơn hàng trước khi đặt (Read-only)
   */
  previewOrder: async (payload = {}) => {
    const res = await api.post('/orders/preview', payload);
    return res.data;
  },

  /**
   * Đặt hàng (hỗ trợ Idempotency-Key header)
   */
  createOrder: async (payload = {}, customHeaders = {}) => {
    const headers = { ...customHeaders };
    if (payload.idempotencyKey && !headers['Idempotency-Key']) {
      headers['Idempotency-Key'] = payload.idempotencyKey;
    }
    const res = await api.post('/orders', payload, { headers });
    return res.data;
  },

  /**
   * Lấy danh sách lịch sử đơn hàng của tôi
   */
  getMyOrders: async (params = {}) => {
    const res = await api.get('/orders', { params });
    return res.data;
  },

  /**
   * Lấy chi tiết đơn hàng
   */
  getOrderById: async (orderId) => {
    const res = await api.get(`/orders/${orderId}`);
    return res.data;
  },

  /**
   * Kiểm tra trạng thái đơn hàng nhanh
   */
  getOrderStatus: async (orderId) => {
    const res = await api.get(`/orders/${orderId}/status`);
    return res.data;
  },

  /**
   * Hủy đơn hàng (hoàn lại tồn kho giữ chỗ)
   */
  cancelOrder: async (orderId, reason = '') => {
    const res = await api.post(`/orders/${orderId}/cancel`, { reason });
    return res.data;
  },
};

export default orderService;
