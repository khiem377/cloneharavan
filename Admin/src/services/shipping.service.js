import api from '@/lib/axios';

export const shippingService = {
  getProvinces: async () => {
    try {
      const res = await api.get('/shipping/provinces');
      return res.data?.data?.provinces || [];
    } catch (err) {
      console.error('Lỗi lấy danh sách tỉnh/thành:', err);
      return [];
    }
  },

  getDistricts: async (provinceId) => {
    if (!provinceId) return [];
    try {
      const res = await api.get('/shipping/districts', {
        params: { province_id: provinceId },
      });
      return res.data?.data?.districts || [];
    } catch (err) {
      console.error('Lỗi lấy danh sách quận/huyện:', err);
      return [];
    }
  },

  getWards: async (districtId) => {
    if (!districtId) return [];
    try {
      const res = await api.get('/shipping/wards', {
        params: { district_id: districtId },
      });
      return res.data?.data?.wards || [];
    } catch (err) {
      console.error('Lỗi lấy danh sách phường/xã:', err);
      return [];
    }
  },

  getServices: async ({ fromDistrictId, toDistrictId }) => {
    try {
      const res = await api.post('/shipping/services', {
        fromDistrictId,
        toDistrictId,
      });
      return res.data?.data?.services || [];
    } catch (err) {
      console.error('Lỗi lấy dịch vụ giao hàng:', err);
      return [];
    }
  },

  calculateFee: async (payload) => {
    const res = await api.post('/shipping/fee', payload);
    return res.data?.data?.fee || null;
  },
};

export default shippingService;
