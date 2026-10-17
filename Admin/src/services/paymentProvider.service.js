import api from '@/lib/axios';

const paymentProviderService = {
  // Lấy danh sách toàn bộ cổng thanh toán cho Admin
  getProviders: async () => {
    const response = await api.get('/payment-providers/list');
    return response.data;
  },

  // Kết nối cổng thanh toán bằng Keys/Credentials
  connectProvider: async (code, data) => {
    const response = await api.post(`/payment-providers/${code}/connect`, data);
    return response.data;
  },

  // Bật/tắt hiển thị cổng tại trang Checkout (toggle độc lập với kết nối)
  toggleEnable: async (code, isEnabled) => {
    const response = await api.patch(`/payment-providers/${code}/toggle`, { isEnabled });
    return response.data;
  },

  // Ngắt kết nối cổng thanh toán
  disconnectProvider: async (code) => {
    const response = await api.post(`/payment-providers/${code}/disconnect`);
    return response.data;
  },

  // Kiểm tra handshake cổng thanh toán
  testProvider: async (code) => {
    const response = await api.post(`/payment-providers/${code}/test`);
    return response.data;
  },
};

export default paymentProviderService;
