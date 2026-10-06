import { api } from '@/lib/axios';

export const shippingService = {
  /**
   * Lấy danh sách Tỉnh / Thành phố từ GHN API
   */
  getProvinces: async () => {
    try {
      const res = await api.get('/shipping/provinces');
      return res.data?.data?.provinces || [];
    } catch (err) {
      console.error('Lỗi lấy danh sách tỉnh/thành từ GHN:', err);
      return [];
    }
  },

  /**
   * Lấy danh sách Quận / Huyện theo provinceId từ GHN API
   */
  getDistricts: async (provinceId) => {
    if (!provinceId) return [];
    try {
      const res = await api.get('/shipping/districts', {
        params: { province_id: provinceId },
      });
      return res.data?.data?.districts || [];
    } catch (err) {
      console.error('Lỗi lấy danh sách quận/huyện từ GHN:', err);
      return [];
    }
  },

  /**
   * Lấy danh sách Phường / Xã theo districtId từ GHN API
   */
  getWards: async (districtId) => {
    if (!districtId) return [];
    try {
      const res = await api.get('/shipping/wards', {
        params: { district_id: districtId },
      });
      return res.data?.data?.wards || [];
    } catch (err) {
      console.error('Lỗi lấy danh sách phường/xã từ GHN:', err);
      return [];
    }
  },

  /**
   * Tra cứu địa giới sau sáp nhập qua TinhThanhPho.com API & Casso AddressKit
   */
  getPostMergerAddress: async ({
    province,
    district,
    ward,
    detailAddress,
    provinceCode,
    districtCode,
    wardCode,
  }) => {
    if (!ward && !province) return null;
    try {
      const res = await api.get('/shipping/post-merger-lookup', {
        params: {
          province,
          district,
          ward,
          detailAddress,
          provinceCode,
          districtCode,
          wardCode,
        },
      });
      return res.data?.data || null;
    } catch (err) {
      console.warn('Lỗi tra cứu API địa giới sau sáp nhập:', err);
      return null;
    }
  },
};

export default shippingService;
