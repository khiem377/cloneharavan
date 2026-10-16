import api from '@/lib/axios';

const storeSettingService = {
  // Lấy toàn bộ cấu hình hệ thống
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  // Cập nhật cấu hình theo phân hệ ('storeInfo' | 'standards' | 'orderCode' | 'checkout' | 'shipping' | 'all')
  updateSettings: async (section, data) => {
    const response = await api.put(`/settings/${section}`, data);
    return response.data;
  },

  // Lấy danh sách đối tác vận chuyển
  getShippingProviders: async () => {
    const response = await api.get('/settings/shipping-providers/list');
    return response.data;
  },

  // Kết nối đối tác vận chuyển
  connectShippingProvider: async (code, data) => {
    const response = await api.post(`/settings/shipping-providers/${code}/connect`, data);
    return response.data;
  },

  // Ngắt kết nối đối tác vận chuyển
  disconnectShippingProvider: async (code) => {
    const response = await api.post(`/settings/shipping-providers/${code}/disconnect`);
    return response.data;
  },

  // Kiểm tra handshake đối tác
  testShippingProvider: async (code) => {
    const response = await api.post(`/settings/shipping-providers/${code}/test`);
    return response.data;
  },
};

export default storeSettingService;
