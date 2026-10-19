const axios = require('axios');
const AppError = require('../utils/AppError');

// Bộ nhớ cache tạm trong RAM cho Token và Master data địa chỉ Viettel Post
const cache = {
  token: null,
  tokenExpiresAt: 0,
  provinces: null,
  districts: new Map(),
  wards: new Map(),
  inventories: null,
  inventoriesExpiresAt: 0,
};

const normalizeVnString = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
};

class ViettelPostService {
  static getBaseUrl() {
    return process.env.VIETTELPOST_API_URL || 'https://partnerdev.viettelpost.vn';
  }

  /**
   * Đăng nhập lấy Token xác thực từ Viettel Post API
   */
  static async login(credentials = {}) {
    const now = Date.now();
    if (cache.token && now < cache.tokenExpiresAt) {
      return cache.token;
    }

    const username = (credentials.username || process.env.VIETTELPOST_USERNAME || '').trim();
    const password = (credentials.password || process.env.VIETTEL_POST_PASS_DEV || process.env.VIETTELPOST_PASSWORD || '').trim();

    if (!username || !password) {
      throw new AppError('Thiếu Tên đăng nhập hoặc Mật khẩu kết nối Viettel Post', 400);
    }

    try {
      const res = await axios.post(
        `${this.getBaseUrl()}/v2/user/Login`,
        { USERNAME: username, PASSWORD: password },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000, validateStatus: () => true }
      );

      if (res.data && (res.data.status === 200 || res.data.data?.token)) {
        const token = res.data.data?.token;
        if (token) {
          cache.token = token;
          cache.tokenExpiresAt = now + 45 * 60 * 1000; // Cache 45 phút
          return token;
        }
      }

      const msg = res.data?.message || `Viettel Post từ chối đăng nhập (Mã HTTP ${res.status})`;
      throw new AppError(`Đăng nhập Viettel Post Sandbox thất bại: ${msg}`, 400);
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(`Không thể kết nối đến máy chủ Viettel Post Sandbox: ${err.message}`, 500);
    }
  }

  /**
   * Lấy danh sách kho lấy hàng (Inventory list) để lấy GROUPADDRESS_ID và CUS_ID
   */
  static async listInventory(token) {
    const now = Date.now();
    if (cache.inventories && now < cache.inventoriesExpiresAt) {
      return cache.inventories;
    }

    try {
      const res = await axios.get(`${this.getBaseUrl()}/v2/user/listInventory`, {
        headers: { Token: token },
        timeout: 10000,
        validateStatus: () => true,
      });

      if (res.data && res.data.status === 200 && Array.isArray(res.data.data)) {
        if (res.data.data.length > 0) {
          cache.inventories = res.data.data;
          cache.inventoriesExpiresAt = now + 15 * 60 * 1000; // Cache 15 phút
          return cache.inventories;
        }

        // Tự động đăng ký kho mặc định nếu tài khoản Sandbox chưa có kho
        try {
          const regRes = await axios.post(
            `${this.getBaseUrl()}/v2/user/registerInventory`,
            {
              PHONE: '0949527013',
              NAME: 'Kho Tổng HCM',
              ADDRESS: 'Số 1 Lê Duẩn, Phường Bến Nghé',
              PROVINCE_ID: 2,
              DISTRICT_ID: 38,
              WARDS_ID: 716,
              INVENTORY_NAME: 'Kho Tổng HCM',
              IS_DEFAULT: 1,
            },
            {
              headers: { Token: token, 'Content-Type': 'application/json' },
              timeout: 10000,
              validateStatus: () => true,
            }
          );

          if (regRes.data?.data) {
            const reFetch = await axios.get(`${this.getBaseUrl()}/v2/user/listInventory`, {
              headers: { Token: token },
              timeout: 10000,
              validateStatus: () => true,
            });
            if (Array.isArray(reFetch.data?.data) && reFetch.data.data.length > 0) {
              cache.inventories = reFetch.data.data;
              cache.inventoriesExpiresAt = now + 15 * 60 * 1000;
              return cache.inventories;
            }
          }
        } catch (regErr) {
          console.warn('[ViettelPostService] Lỗi auto-registerInventory:', regErr.message);
        }
      }
      return [];
    } catch (err) {
      console.warn('[ViettelPostService] Lỗi listInventory:', err.message);
      return [];
    }
  }

  /**
   * Lấy danh mục Tỉnh/Thành
   */
  static async getProvinces(token) {
    if (cache.provinces && Array.isArray(cache.provinces) && cache.provinces.length > 0) {
      return cache.provinces;
    }
    try {
      const res = await axios.get(`${this.getBaseUrl()}/v2/categories/listProvince`, {
        headers: token ? { Token: token } : {},
        timeout: 10000,
        validateStatus: () => true,
      });
      if (res.data && (res.data.status === 200 || Array.isArray(res.data.data))) {
        cache.provinces = res.data.data || [];
        return cache.provinces;
      }
      return [];
    } catch (err) {
      console.warn('[ViettelPostService] Lỗi getProvinces:', err.message);
      return [];
    }
  }

  /**
   * Lấy danh mục Quận/Huyện theo Tỉnh
   */
  static async getDistricts(provinceId, token) {
    if (!provinceId) return [];
    if (cache.districts.has(Number(provinceId))) {
      return cache.districts.get(Number(provinceId));
    }
    try {
      const res = await axios.get(`${this.getBaseUrl()}/v2/categories/listDistrict`, {
        params: { provinceId: Number(provinceId) },
        headers: token ? { Token: token } : {},
        timeout: 10000,
        validateStatus: () => true,
      });
      const list = res.data?.data || [];
      cache.districts.set(Number(provinceId), list);
      return list;
    } catch (err) {
      console.warn('[ViettelPostService] Lỗi getDistricts:', err.message);
      return [];
    }
  }

  /**
   * Lấy danh mục Phường/Xã theo Huyện
   */
  static async getWards(districtId, token) {
    if (!districtId) return [];
    if (cache.wards.has(Number(districtId))) {
      return cache.wards.get(Number(districtId));
    }
    try {
      const res = await axios.get(`${this.getBaseUrl()}/v2/categories/listWards`, {
        params: { districtId: Number(districtId) },
        headers: token ? { Token: token } : {},
        timeout: 10000,
        validateStatus: () => true,
      });
      const list = res.data?.data || [];
      cache.wards.set(Number(districtId), list);
      return list;
    } catch (err) {
      console.warn('[ViettelPostService] Lỗi getWards:', err.message);
      return [];
    }
  }

  /**
   * Ánh xạ tên địa chỉ text (Tỉnh, Huyện, Xã) sang ID của Viettel Post
   */
  static async resolveAddressIds(provinceName, districtName, wardName, token, fullAddress = '') {
    try {
      const provinces = await this.getProvinces(token);
      const normP = normalizeVnString(provinceName || fullAddress);
      let matchedP = (provinces || []).find((p) => {
        const name = normalizeVnString(p.PROVINCE_NAME);
        return normP.includes(name) || name.includes(normP);
      });

      // Hỗ trợ alias nhận diện nhanh cho các thành phố lớn
      if (!matchedP && provinces && provinces.length > 0) {
        if (normP.includes('ho chi minh') || normP.includes('hcm') || normP.includes('sai gon')) {
          matchedP = provinces.find((p) => normalizeVnString(p.PROVINCE_NAME).includes('ho chi minh'));
        } else if (normP.includes('ha noi') || normP.includes('hn')) {
          matchedP = provinces.find((p) => normalizeVnString(p.PROVINCE_NAME).includes('ha noi'));
        } else if (normP.includes('da nang')) {
          matchedP = provinces.find((p) => normalizeVnString(p.PROVINCE_NAME).includes('da nang'));
        }
      }

      if (!matchedP) {
        console.warn(`[ViettelPostService] Không match được tỉnh: "${provinceName}", danh sách Viettel Post có ${provinces?.length || 0} tỉnh`);
        return null;
      }

      const provinceId = matchedP.PROVINCE_ID;
      const districts = await this.getDistricts(provinceId, token);
      const normD = normalizeVnString(districtName || fullAddress);
      let matchedD = (districts || []).find((d) => {
        const name = normalizeVnString(d.DISTRICT_NAME);
        return normD.includes(name) || name.includes(normD);
      });
      if (!matchedD && districts && districts.length > 0) {
        matchedD = districts[0];
      }

      const districtId = matchedD ? matchedD.DISTRICT_ID : null;
      let wardId = null;

      if (districtId) {
        const wards = await this.getWards(districtId, token);
        const normW = normalizeVnString(wardName || fullAddress);
        let matchedW = (wards || []).find((w) => {
          const name = normalizeVnString(w.WARDS_NAME);
          return normW.includes(name) || name.includes(normW);
        });
        if (!matchedW && wards && wards.length > 0) {
          matchedW = wards[0];
        }
        wardId = matchedW ? matchedW.WARDS_ID : null;
      }

      return {
        provinceId,
        districtId,
        wardId,
      };
    } catch (err) {
      console.warn('[ViettelPostService] resolveAddressIds error:', err.message);
      return null;
    }
  }

  /**
   * Tạo vận đơn thực tế trên Viettel Post Sandbox API (POST /v2/order/createOrder)
   */
  static async createShippingOrder({ order, warehouse, packageInfo = {}, payer = 'shop', credentials = {}, codAmount = 0 }) {
    const token = await this.login(credentials);

    // 1. Xác định kho lấy hàng trên Viettel Post (Inventory list)
    let groupAddressId = 0;
    let cusId = 0;
    let senderAddress = '';
    let senderPhone = '';
    let senderName = '';
    let senderProvince = 0;
    let senderDistrict = 0;
    let senderWard = 0;

    const inventories = await this.listInventory(token);
    if (inventories && inventories.length > 0) {
      const matchedInv = inventories.find((inv) =>
        warehouse?.name && (
          (inv.name || inv.NAME || '').toLowerCase().includes(warehouse.name.toLowerCase()) ||
          warehouse.name.toLowerCase().includes((inv.name || inv.NAME || '').toLowerCase())
        )
      ) || inventories[0];

      groupAddressId = matchedInv.groupaddressId || matchedInv.GROUPADDRESS_ID || 0;
      cusId = matchedInv.cusId || matchedInv.CUS_ID || 0;
      senderAddress = matchedInv.address || matchedInv.ADDRESS || '';
      senderPhone = matchedInv.phone || matchedInv.PHONE || '';
      senderName = matchedInv.name || matchedInv.NAME || '';
      senderProvince = matchedInv.provinceId || matchedInv.PROVINCE_ID || 0;
      senderDistrict = matchedInv.districtId || matchedInv.DISTRICT_ID || 0;
      senderWard = matchedInv.wardsId || matchedInv.WARDS_ID || 0;
    }

    // 2. Định dạng ngày giao hàng dd/MM/yyyy HH:mm:ss
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const deliveryDateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    // 3. Ánh xạ địa chỉ người nhận
    const shippingAddr = order.shippingAddress || {};
    const fullAddr = `${shippingAddr.detailAddress || ''} ${shippingAddr.ward || ''} ${shippingAddr.district || ''} ${shippingAddr.province || ''}`;
    const geoIds = await this.resolveAddressIds(shippingAddr.province, shippingAddr.district, shippingAddr.ward, token, fullAddr);

    if (!geoIds?.provinceId) {
      throw new AppError(`Viettel Post không nhận diện được Tỉnh/Thành từ địa chỉ: "${shippingAddr.province || shippingAddr.detailAddress || 'Chưa có'}"`, 400);
    }

    const weightInGrams = Math.max(100, Math.round(Number(packageInfo.weight) || 500));
    const items = order.items || [];
    const productNameSummary = items.map((it) => `${it.productName || 'Sản phẩm'} (x${it.quantity || 1})`).join(', ').slice(0, 200) || 'Hàng hóa Dak Shop';
    const totalQty = items.reduce((s, it) => s + (it.quantity || 1), 0) || 1;

    // Chuẩn bị payload chuẩn theo Docs Viettel Post v2
    const orderNumber = `${order.orderCode}_${Date.now().toString().slice(-4)}`;
    const finalSenderAddress = senderAddress || warehouse?.address?.fullAddress || warehouse?.address?.detailAddress || 'Kho trung tâm Dak Shop';

    const payload = {
      ORDER_NUMBER: orderNumber,
      GROUPADDRESS_ID: groupAddressId,
      CUS_ID: cusId,
      DELIVERY_DATE: deliveryDateStr,

      SENDER_FULLNAME: warehouse?.name || senderName || 'Dak Shop',
      SENDER_ADDRESS: finalSenderAddress,
      SENDER_PHONE: senderPhone || warehouse?.phone || '0949527013',
      ...(senderProvince ? { SENDER_PROVINCE: senderProvince } : {}),
      ...(senderDistrict ? { SENDER_DISTRICT: senderDistrict } : {}),
      ...(senderWard ? { SENDER_WARD: senderWard } : {}),

      RECEIVER_FULLNAME: shippingAddr.fullName || 'Khách hàng',
      RECEIVER_ADDRESS: shippingAddr.detailAddress || shippingAddr.fullAddress || '',
      RECEIVER_PHONE: shippingAddr.phone || '',
      RECEIVER_EMAIL: shippingAddr.email || '',
      RECEIVER_PROVINCE: geoIds.provinceId,
      RECEIVER_DISTRICT: geoIds.districtId || geoIds.provinceId,
      RECEIVER_WARD: geoIds.wardId || 1,

      PRODUCT_NAME: productNameSummary,
      PRODUCT_DESCRIPTION: `Đơn hàng ${order.orderCode}`,
      PRODUCT_QUANTITY: totalQty,
      PRODUCT_PRICE: Math.min(Math.round(Number(order.pricing?.totalAmount) || 100000), 100000000),
      PRODUCT_WEIGHT: weightInGrams,
      PRODUCT_LENGTH: Number(packageInfo.length) || 15,
      PRODUCT_WIDTH: Number(packageInfo.width) || 15,
      PRODUCT_HEIGHT: Number(packageInfo.height) || 10,
      PRODUCT_TYPE: 'HH',

      ORDER_PAYMENT: payer === 'receiver' ? 2 : 1, // 1: Người gửi trả cước, 2: Người nhận trả cước
      ORDER_SERVICE: weightInGrams > 30000 ? 'VTK' : 'VCN', // Hàng > 30kg dùng Tiết kiệm (VTK), hàng nhẹ dùng Chuyển phát nhanh (VCN)
      ORDER_SERVICE_ADD: '',
      ORDER_NOTE: packageInfo.note || 'Cho khách xem hàng',
      MONEY_COLLECTION: Math.round(Number(codAmount) || 0),
      NOTE_CODE: String(packageInfo.requiredNote || '').toUpperCase().includes('KHONG') ? 'KHONGCHOXEM' : 'CHOXEMHANG',
    };

    try {
      let res = await axios.post(`${this.getBaseUrl()}/v2/order/createOrder`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Token: token,
        },
        timeout: 15000,
        validateStatus: () => true,
      });

      // Tự động thử lại với các gói cước thay thế nếu gói mặc định không áp dụng cho hành trình này
      if (res.data?.message && res.data.message.includes('Price does not apply')) {
        for (const fallbackSrv of ['SCN', 'PHS', 'VTK', 'STK']) {
          payload.ORDER_SERVICE = fallbackSrv;
          res = await axios.post(`${this.getBaseUrl()}/v2/order/createOrder`, payload, {
            headers: {
              'Content-Type': 'application/json',
              Token: token,
            },
            timeout: 15000,
            validateStatus: () => true,
          });
          if (res.data && res.data.status === 200 && res.data.data?.ORDER_NUMBER) {
            break;
          }
        }
      }

      if (res.data && res.data.status === 200 && res.data.data?.ORDER_NUMBER) {
        return {
          success: true,
          carrier: 'viettelpost',
          trackingCode: String(res.data.data.ORDER_NUMBER),
          shippingFee: Number(res.data.data.MONEY_TOTAL) || order.pricing?.finalShippingFee || 28000,
          rawResponse: res.data.data,
        };
      }

      let errMsg = res.data?.message || (res.data?.error ? JSON.stringify(res.data) : `Mã phản hồi ${res.status}`);
      if (errMsg.includes('Price does not apply')) {
        errMsg = `Gói cước không áp dụng cho kiện hàng nặng ${Math.round(weightInGrams / 1000)}kg (${payload.PRODUCT_LENGTH}x${payload.PRODUCT_WIDTH}x${payload.PRODUCT_HEIGHT}cm) trên tuyến này. Vui lòng hạ bớt Khối lượng/Kích thước về mức bưu phẩm tiêu chuẩn.`;
      }
      throw new AppError(`Viettel Post Sandbox từ chối tạo đơn: ${errMsg}`, 400);
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(`Lỗi kết nối API Viettel Post Sandbox: ${err.message}`, 500);
    }
  }

  /**
   * Tra cứu hành trình / trạng thái đơn hàng Viettel Post Sandbox
   */
  static async getOrderTracking(orderNumber, credentials = {}) {
    const token = await this.login(credentials);
    try {
      const res = await axios.get(`${this.getBaseUrl()}/v2/order/getTracking`, {
        params: { orderNumber },
        headers: { Token: token },
        timeout: 10000,
        validateStatus: () => true,
      });

      if (res.data && (res.data.status === 200 || res.data.data)) {
        return res.data.data;
      }
    } catch (err) {
      console.warn('[ViettelPostService] getTracking error:', err.message);
    }

    // Fallback sang getOrderInfo nếu getTracking chưa có data
    try {
      const res = await axios.post(
        `${this.getBaseUrl()}/v2/order/getOrderInfo`,
        { ORDER_NUMBER: orderNumber },
        { headers: { Token: token, 'Content-Type': 'application/json' }, timeout: 10000, validateStatus: () => true }
      );
      if (res.data && res.data.status === 200 && res.data.data) {
        return res.data.data;
      }
    } catch (err) {
      console.warn('[ViettelPostService] getOrderInfo error:', err.message);
    }

    return null;
  }

  /**
   * Ánh xạ mã trạng thái Viettel Post sang trạng thái chuẩn của hệ thống
   */
  static mapViettelStatus(code) {
    const num = Number(code);
    if (num === 100) {
      return { status: 'ready_to_pick', statusText: 'Chờ lấy hàng' };
    }
    if ([101, 102, 103, 104, 105].includes(num)) {
      return { status: 'picking', statusText: 'Đang lấy hàng' };
    }
    if ([500, 506].includes(num)) {
      return { status: 'delivering', statusText: 'Đang giao hàng' };
    }
    if (num === 501) {
      return { status: 'delivered', statusText: 'Đã giao hàng' };
    }
    if ([502, 503, 504].includes(num)) {
      return { status: 'delivery_fail', statusText: 'Chờ giao lại' };
    }
    if (num === 505) {
      return { status: 'returning', statusText: 'Đang hoàn hàng' };
    }
    if ([107, 507, 508, 509].includes(num)) {
      return { status: 'cancelled', statusText: 'Đã hủy giao' };
    }
    return null;
  }
}

module.exports = ViettelPostService;

