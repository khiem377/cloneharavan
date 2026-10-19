const axios = require('axios');
const ShippingProvider = require('../models/shippingProvider.model');
const { decryptObject } = require('../utils/crypto.util');
const AppError = require('../utils/AppError');

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

  /**
   * Tạo đơn vận chuyển trên GHTK (Sandbox hoặc Production)
   */
  static async createShippingOrder({ order, warehouse, packageInfo = {}, payer = 'shop', credentials = {}, codAmount = 0 }) {
    let token = credentials.apiToken || process.env.GHTK_API_TOKEN;
    let partnerCode = credentials.partnerCode || process.env.GHTK_PARTNER_CODE;

    if (!token) {
      const auth = await this.getHeaders();
      if (!auth.hasToken) {
        throw new AppError('Chưa cấu hình Token GHTK trong cài đặt hoặc file .env', 400);
      }
    }

    const headers = {
      'Content-Type': 'application/json',
      Token: (token || process.env.GHTK_API_TOKEN || '').trim(),
    };
    if (partnerCode || process.env.GHTK_PARTNER_CODE) {
      headers['X-Client-Source'] = (partnerCode || process.env.GHTK_PARTNER_CODE || '').trim();
    }

    const shippingAddr = order.shippingAddress || {};
    const items = order.items || [];
    const totalWeightKg = Math.max(0.1, ((Number(packageInfo.weight) || 500) / 1000));
    const weightPerItemKg = Math.max(0.05, totalWeightKg / (items.length || 1));

    const products = items.map((it) => ({
      name: it.productName || 'Sản phẩm',
      weight: Number(weightPerItemKg.toFixed(2)),
      quantity: it.quantity || 1,
      product_code: it.sku || String(it.productId || ''),
    }));

    const orderPayload = {
      id: `${order.orderCode}_${Date.now().toString().slice(-4)}`,
      pick_name: warehouse?.name || 'Dak Shop',
      pick_address: warehouse?.address?.detailAddress || warehouse?.address?.fullAddress || 'Kho trung tâm Dak Shop',
      pick_province: warehouse?.address?.province || 'Hồ Chí Minh',
      pick_district: warehouse?.address?.district || 'Quận Bình Tân',
      pick_ward: warehouse?.address?.ward || '',
      pick_tel: warehouse?.phone || '0949527013',
      tel: shippingAddr.phone || '',
      name: shippingAddr.fullName || 'Khách hàng',
      address: shippingAddr.detailAddress || shippingAddr.fullAddress || '',
      province: shippingAddr.province || '',
      district: shippingAddr.district || '',
      ward: shippingAddr.ward || '',
      is_freeship: payer === 'shop' ? 1 : 0,
      pick_money: Math.round(Number(codAmount) || 0),
      value: Math.round(order.pricing?.totalAmount || 100000),
      transport: 'road',
      note: packageInfo.note || 'Giao giờ hành chính',
    };

    try {
      const res = await axios.post(
        `${this.getBaseUrl()}/services/shipment/order`,
        { products, order: orderPayload },
        { headers, timeout: 15000, validateStatus: () => true }
      );

      if (res.data && res.data.success && res.data.order?.label) {
        return {
          success: true,
          carrier: 'ghtk',
          trackingCode: String(res.data.order.label),
          shippingFee: Number(res.data.order.fee) || order.pricing?.finalShippingFee || 22000,
          rawResponse: res.data.order,
        };
      }

      const errMsg = res.data?.message || (res.data?.error ? JSON.stringify(res.data) : `Mã lỗi GHTK ${res.status}`);
      throw new AppError(`GHTK Sandbox từ chối tạo đơn: ${errMsg}`, 400);
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(`Lỗi kết nối API GHTK: ${err.message}`, 500);
    }
  }
}

module.exports = GhtkService;
