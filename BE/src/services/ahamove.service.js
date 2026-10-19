const axios = require('axios');
const AppError = require('../utils/AppError');

const tokenCache = {
  token: null,
  expiresAt: 0,
};

class AhamoveService {
  static getBaseUrl() {
    return process.env.AHAMOVE_API_URL || 'https://partner-apistg.ahamove.com/v3';
  }

  /**
   * Lấy Bearer Token xác thực của Ahamove Sandbox qua API accounts/token
   */
  static async getToken(credentials = {}) {
    const now = Date.now();
    if (tokenCache.token && now < tokenCache.expiresAt) {
      return tokenCache.token;
    }

    const apiKey = (credentials.apiKey || process.env.AHAMOVE_API_KEY || '').trim();
    let mobile = (credentials.mobile || credentials.phone || process.env.AHAMOVE_MOBILE || '').trim();

    // Chuẩn hóa số điện thoại sang mã quốc gia 84xxxxxxxxx theo yêu cầu của Ahamove
    if (mobile.startsWith('0')) {
      mobile = '84' + mobile.slice(1);
    } else if (mobile.startsWith('+84')) {
      mobile = '84' + mobile.slice(3);
    }

    if (!apiKey || !mobile) {
      throw new AppError('Ahamove yêu cầu API Key và Số điện thoại đăng ký trong cài đặt đối tác', 400);
    }

    try {
      const res = await axios.post(
        `${this.getBaseUrl()}/accounts/token`,
        { api_key: apiKey, mobile },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000, validateStatus: () => true }
      );

      const token = res.data?.token || res.data?.access_token;
      if (token) {
        tokenCache.token = token;
        tokenCache.expiresAt = now + 50 * 60 * 1000; // Cache 50 phút
        return token;
      }

      const errMsg = res.data?.message || res.data?.description || `Mã HTTP ${res.status}`;
      throw new AppError(`Ahamove từ chối cấp token: ${errMsg}`, 400);
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(`Lỗi kết nối API Ahamove: ${err.message}`, 500);
    }
  }

  /**
   * Tạo đơn giao hàng tức thời qua Ahamove Sandbox API
   */
  static async createShippingOrder({ order, warehouse, packageInfo = {}, payer = 'shop', credentials = {}, codAmount = 0 }) {
    const token = await this.getToken(credentials);
    const shippingAddr = order.shippingAddress || {};

    const warehouseAddress =
      warehouse?.address?.fullAddress ||
      warehouse?.address?.detailAddress ||
      (typeof warehouse?.address === 'string' ? warehouse.address : '') ||
      'Kho Tổng Bình Tân, Hồ Chí Minh';

    const receiverAddress =
      shippingAddr.fullAddress ||
      [shippingAddr.detailAddress, shippingAddr.ward, shippingAddr.district, shippingAddr.province].filter(Boolean).join(', ') ||
      'Hồ Chí Minh';

    if (!receiverAddress) {
      throw new AppError('Thiếu địa chỉ người nhận cho đơn giao Ahamove', 400);
    }

    const isHN = (shippingAddr.province || '').toLowerCase().includes('hà nội');
    const serviceId = isHN ? 'HAN-BIKE' : 'SGN-BIKE';

    // Ahamove v3 yêu cầu tọa độ lat, lng cho từng điểm giao/nhận
    const warehouseLat = warehouse?.lat || (isHN ? 21.0285 : 10.7517);
    const warehouseLng = warehouse?.lng || (isHN ? 105.8542 : 106.6033);
    const receiverLat = shippingAddr.lat || (isHN ? 21.0333 : 10.7769);
    const receiverLng = shippingAddr.lng || (isHN ? 105.8500 : 106.7009);

    const items = (order.items || []).map((it) => ({
      _id: it.sku || String(it.productId || ''),
      name: it.productName || 'Sản phẩm',
      num: it.quantity || 1,
      price: it.price || it.unitPrice || 0,
    }));

    const totalItemValue = items.reduce((sum, it) => sum + (it.price * it.num), 0) || Math.round(Number(codAmount) || 100000);

    const payload = {
      order_time: 0,
      service_id: serviceId,
      payment_method: 'CASH', // Thu/trả bằng tiền mặt cho shipper
      remarks: packageInfo.note || `Giao hàng Dak Shop - Đơn ${order.orderCode}`,
      path: [
        {
          lat: warehouseLat,
          lng: warehouseLng,
          address: warehouseAddress,
          short_address: warehouse?.name || 'Kho lấy hàng',
          name: warehouse?.name || 'Kho Tổng Dak Shop',
          mobile: '84949527013',
          remarks: `Lấy đơn ${order.orderCode}`,
        },
        {
          lat: receiverLat,
          lng: receiverLng,
          address: receiverAddress,
          short_address: shippingAddr.district || 'Địa chỉ nhận',
          name: shippingAddr.fullName || 'Khách hàng',
          mobile: shippingAddr.phone || '',
          cod: Math.round(Number(codAmount) || 0),
          item_value: totalItemValue,
          tracking_number: order.orderCode,
          remarks: packageInfo.note || 'Gọi điện trước khi giao',
        },
      ],
      items,
    };

    try {
      const res = await axios.post(`${this.getBaseUrl()}/orders`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        timeout: 15000,
        validateStatus: () => true,
      });

      if (res.data && (res.data.order_id || res.data._id)) {
        const orderId = res.data.order_id || res.data._id;
        return {
          success: true,
          carrier: 'ahamove',
          trackingCode: String(orderId),
          shippingFee: Number(res.data.order?.total_pay) || order.pricing?.finalShippingFee || 35000,
          sharedLink: res.data.shared_link || '',
          rawResponse: res.data,
        };
      }

      const errMsg = res.data?.message || res.data?.description || `Mã phản hồi Ahamove ${res.status}`;
      throw new AppError(`Ahamove Sandbox từ chối tạo đơn: ${errMsg}`, 400);
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(`Lỗi kết nối API Ahamove: ${err.message}`, 500);
    }
  }
}

module.exports = AhamoveService;
