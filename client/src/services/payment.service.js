import { api } from '@/lib/axios';

export const paymentService = {
  /**
   * Lấy danh sách phương thức thanh toán khả dụng
   */
  getPaymentMethods: async () => {
    const res = await api.get('/payments/methods');
    return res.data?.data || [];
  },

  /**
   * Khởi tạo hoặc xác nhận thanh toán đơn hàng
   */
  createPayment: async (payload = {}) => {
    const res = await api.post('/payments/create', payload);
    return res.data;
  },

  /**
   * Tra cứu trạng thái thanh toán đơn hàng
   */
  getPaymentStatus: async (orderId) => {
    const res = await api.get(`/payments/${orderId}/status`);
    return res.data;
  },
};

export default paymentService;
