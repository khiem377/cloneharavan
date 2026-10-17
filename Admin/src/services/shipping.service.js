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

  // GHN v3 Địa chỉ mới (2 cấp: Tỉnh/Thành phố mới -> Phường/Xã mới)
  getNewProvinces: async () => {
    try {
      const res = await api.get('/shipping/new-provinces');
      return res.data?.data?.provinces || [];
    } catch (err) {
      console.error('Lỗi lấy danh sách tỉnh/thành mới:', err);
      return [];
    }
  },

  getNewWards: async (provinceId) => {
    if (!provinceId) return [];
    try {
      const res = await api.get('/shipping/new-wards', {
        params: { province_id: provinceId },
      });
      return res.data?.data?.wards || [];
    } catch (err) {
      console.error('Lỗi lấy danh sách phường/xã mới:', err);
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

  // GHTK Administrative Master Data
  getGhtkProvinces: async () => {
    try {
      const res = await api.get('/shipping/ghtk/provinces');
      return res.data?.data || [];
    } catch (err) {
      console.error('Lỗi lấy danh sách tỉnh/thành GHTK:', err);
      return [];
    }
  },

  getGhtkWards: async (provinceId) => {
    if (!provinceId) return [];
    try {
      const res = await api.get('/shipping/ghtk/wards', {
        params: { province_id: provinceId },
      });
      return res.data?.data || [];
    } catch (err) {
      console.error('Lỗi lấy danh sách phường/xã GHTK:', err);
      return [];
    }
  },

  getGhtkLevel4Address: async ({ province, district, ward_street, address } = {}) => {
    try {
      const res = await api.get('/shipping/ghtk/level4', {
        params: { province, district, ward_street, address },
      });
      return res.data?.data || [];
    } catch (err) {
      console.warn('Lỗi gọi GHTK Level 4 API:', err);
      return [];
    }
  },

  calculateFee: async (payload) => {
    const res = await api.post('/shipping/fee', payload);
    return res.data?.data?.fee || null;
  },
};

export default shippingService;
