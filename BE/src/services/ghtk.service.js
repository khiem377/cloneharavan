const axios = require('axios');
const ShippingProvider = require('../models/shippingProvider.model');
const { decryptObject } = require('../utils/crypto.util');

let cachedGhtkProvinces = null;
let lastProvincesFetch = 0;
const cachedGhtkWards = new Map();

class GhtkService {
  /**
   * Lấy danh sách Tỉnh/Thành phố từ GHTK Public Gateway
   * Có hỗ trợ trường `old_provinces` (ví dụ: TP HCM gồm Bà Rịa - Vũng Tàu, Bình Dương)
   */
  static async getProvinces() {
    const now = Date.now();
    if (cachedGhtkProvinces && (now - lastProvincesFetch < 3600000)) {
      return cachedGhtkProvinces;
    }
    try {
      const res = await axios.get('https://shop-gateway.ghtk.vn/public/api/v1/address/province', {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': 'application/json',
        },
      });
      if (res.data?.success && Array.isArray(res.data?.data)) {
        cachedGhtkProvinces = res.data.data;
        lastProvincesFetch = now;
        return cachedGhtkProvinces;
      }
      return cachedGhtkProvinces || [];
    } catch (err) {
      console.warn('[GhtkService] Lỗi gọi GHTK public province API:', err.message);
      return cachedGhtkProvinces || [];
    }
  }

  /**
   * Lấy danh sách Phường/Xã từ GHTK Public Gateway theo province_id
   * Có hỗ trợ trường `old_wards` (ví dụ: Phường Diên Hồng gồm Phường 14, Phường 5...)
   */
  static async getWards(provinceId) {
    if (!provinceId) return [];
    const pId = Number(provinceId);
    const cached = cachedGhtkWards.get(pId);
    if (cached && (Date.now() - cached.time < 3600000)) {
      return cached.data;
    }
    try {
      const res = await axios.get('https://shop-gateway.ghtk.vn/public/api/v1/address/ward', {
        params: { province_id: pId },
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': 'application/json',
        },
      });
      if (res.data?.success && Array.isArray(res.data?.data)) {
        cachedGhtkWards.set(pId, { data: res.data.data, time: Date.now() });
        return res.data.data;
      }
      return cached?.data || [];
    } catch (err) {
      console.warn(`[GhtkService] Lỗi gọi GHTK public ward API (province_id=${provinceId}):`, err.message);
      return cached?.data || [];
    }
  }

  /**
   * Lấy Base URL theo môi trường (Production hoặc Sandbox Staging)
   */
  static getBaseUrl() {
    if (process.env.GHTK_DEV_MODE === 'true') {
      return 'https://services-staging.ghtklab.com';
    }
    return process.env.GHTK_API_URL || 'https://services.giaohangtietkiem.vn';
  }

  /**
   * Lấy Headers xác thực từ .env hoặc từ Database ShippingProvider (được giải mã AES-256)
   */
  static async getHeaders() {
    let token = process.env.GHTK_API_TOKEN;
    let partnerCode = process.env.GHTK_PARTNER_CODE;

    // Nếu .env chưa có, kiểm tra cấu hình đối tác đã kết nối trong DB
    if (!token) {
      try {
        const provider = await ShippingProvider.findOne({ code: 'ghtk' });
        if (provider?.encryptedCredentials) {
          const creds = decryptObject(provider.encryptedCredentials);
          if (creds?.apiToken) token = creds.apiToken;
          if (creds?.partnerCode) partnerCode = creds.partnerCode;
        }
      } catch (err) {
        console.warn('[GhtkService] Lỗi giải mã token GHTK từ DB:', err.message);
      }
    }

    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Token'] = token.trim();
    }
    if (partnerCode) {
      headers['X-Client-Source'] = partnerCode.trim();
    }

    return { headers, hasToken: !!token };
  }

  /**
   * API Địa chỉ cấp 4 đặc biệt (Tòa nhà, hẻm, đường, chung cư, khách sạn...)
   * GET /services/address/getAddressLevel4
   */
  static async getAddressLevel4({ province, district, ward_street, address }) {
    const { headers, hasToken } = await this.getHeaders();
    if (!hasToken) {
      return {
        success: false,
        message: 'Chưa cấu hình GHTK_API_TOKEN trong .env hoặc cài đặt đối tác',
        data: [],
      };
    }

    try {
      const baseUrl = this.getBaseUrl();
      const params = {};
      if (province) params.province = province;
      if (district) params.district = district;
      if (ward_street) params.ward_street = ward_street;
      if (address) params.address = address;

      const res = await axios.get(`${baseUrl}/services/address/getAddressLevel4`, {
        headers,
        params,
        timeout: 10000,
      });

      if (res.data && res.data.success) {
        return {
          success: true,
          data: Array.isArray(res.data.data) ? res.data.data : [],
        };
      }

      return {
        success: false,
        message: res.data?.message || 'Không tìm thấy dữ liệu địa chỉ cấp 4 từ GHTK',
        data: [],
      };
    } catch (err) {
      console.warn('[GhtkService] Lỗi gọi API getAddressLevel4:', err.response?.data || err.message);
      return {
        success: false,
        message: err.response?.data?.message || err.message,
        data: [],
      };
    }
  }

  /**
   * API Lấy danh sách kho lấy hàng đã cài đặt
   * GET /services/shipment/list_pick_add
   */
  static async getListPickAddresses() {
    const { headers, hasToken } = await this.getHeaders();
    if (!hasToken) return [];

    try {
      const res = await axios.get(`${this.getBaseUrl()}/services/shipment/list_pick_add`, {
        headers,
        timeout: 8000,
      });
      return res.data?.data || [];
    } catch (err) {
      console.warn('[GhtkService] Lỗi getListPickAddress:', err.response?.data || err.message);
      return [];
    }
  }

  /**
   * Kiểm tra tính hợp lệ của Token đối tác GHTK
   */
  static async testAuth() {
    const { headers, hasToken } = await this.getHeaders();
    if (!hasToken) {
      return { success: false, message: 'Thiếu GHTK Token' };
    }

    try {
      const res = await axios.get(`${this.getBaseUrl()}/services/authenticated`, {
        headers,
        timeout: 8000,
      });
      return { success: !!res.data?.success, message: res.data?.message || 'Token GHTK hợp lệ' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  }
}

module.exports = GhtkService;
