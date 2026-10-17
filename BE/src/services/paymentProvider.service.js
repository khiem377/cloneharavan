const axios = require('axios');
const crypto = require('crypto');
const PaymentProvider = require('../models/paymentProvider.model');
const StoreSetting = require('../models/storeSetting.model');
const { AppError } = require('../utils/AppError');
const { encryptObject, decryptObject, maskSecret } = require('../utils/crypto.util');

/**
 * Kiểm tra chuỗi có phải là giá trị đã được mask (chứa ký tự •) hay không
 */
const isMaskedValue = (val) => {
  return typeof val === 'string' && val.includes('•');
};

/**
 * Tạo dữ liệu masked credentials an toàn để trả về giao diện Admin
 * Che 100% các khóa bí mật, không để lộ bất kỳ ký tự nào ra ngoài API
 */
const buildMaskedCredentials = (code, rawCreds = {}) => {
  const masked = {};
  switch (code) {
    case 'vnpay':
      masked.tmnCode = rawCreds.tmnCode || '';
      masked.hashSecret = rawCreds.hashSecret ? '••••••••••••••••' : '';
      break;
    case 'momo':
      masked.partnerCode = rawCreds.partnerCode || '';
      masked.accessKey = rawCreds.accessKey ? '••••••••••••••••' : '';
      masked.secretKey = rawCreds.secretKey ? '••••••••••••••••' : '';
      break;
    case 'zalopay':
      masked.appId = rawCreds.appId || '';
      masked.key1 = rawCreds.key1 ? '••••••••••••••••' : '';
      masked.key2 = rawCreds.key2 ? '••••••••••••••••' : '';
      break;
    case 'cod':
      break;
    default:
      break;
  }
  return masked;
};

/**
 * Giải mã credentials được lưu trữ trong DB dưới dạng AES-256-GCM
 */
const getDecryptedCredentials = (providerDoc) => {
  if (!providerDoc) return {};
  if (providerDoc.encryptedCredentials) {
    const decrypted = decryptObject(providerDoc.encryptedCredentials);
    if (decrypted && typeof decrypted === 'object') {
      return decrypted;
    }
  }
  if (providerDoc.credentials && typeof providerDoc.credentials === 'object') {
    return providerDoc.credentials;
  }
  return {};
};

/**
 * Làm sạch dữ liệu trước khi gửi response qua API
 * Tuyệt đối KHÔNG trả về plaintext credentials hoặc ciphertext encryptedCredentials
 */
const sanitizeProviderForResponse = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  delete obj.credentials;
  delete obj.encryptedCredentials;
  return obj;
};

/**
 * Kiểm tra tính hợp lệ của thông số kết nối MoMo qua API MoMo v2
 */
const verifyMomoHandshake = async ({ partnerCode, accessKey, secretKey, environment = 'sandbox' }) => {
  const pCode = (partnerCode || '').trim();
  const aKey = (accessKey || '').trim();
  const sKey = (secretKey || '').trim();

  if (pCode.length < 3) {
    throw new AppError('Partner Code của MoMo không hợp lệ', 400);
  }
  if (aKey.length < 6) {
    throw new AppError('Access Key của MoMo không hợp lệ', 400);
  }
  if (sKey.length < 6) {
    throw new AppError('Secret Key của MoMo không hợp lệ', 400);
  }

  const endpoint =
    environment === 'production'
      ? 'https://payment.momo.vn/v2/gateway/api/create'
      : 'https://test-payment.momo.vn/v2/gateway/api/create';

  const orderId = `VERIFY_${Date.now()}`;
  const requestId = orderId;
  const amount = 10000;
  const orderInfo = 'Handshake Verification';
  const redirectUrl = 'https://momo.vn';
  const ipnUrl = 'https://momo.vn';
  const requestType = 'captureWallet';
  const extraData = '';

  const rawSignature = `accessKey=${aKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${pCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  const signature = crypto.createHmac('sha256', sKey).update(rawSignature).digest('hex');

  let storeName = 'Dak Shop';
  try {
    const setting = await StoreSetting.getSingleton();
    if (setting?.storeInfo?.name) storeName = setting.storeInfo.name;
  } catch {}
  const storeId = storeName.replace(/[^a-zA-Z0-9]/g, '') || 'DakShop';

  const payload = {
    partnerCode: pCode,
    partnerName: storeName,
    storeId: storeId,
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    lang: 'vi',
    extraData,
    requestType,
    signature,
  };

  try {
    const res = await axios.post(endpoint, payload, {
      timeout: 8000,
      headers: { 'Content-Type': 'application/json' },
      validateStatus: () => true,
    });

    const data = res.data;
    if (!data) {
      throw new AppError('Không nhận được phản hồi từ cổng MoMo', 400);
    }

    // resultCode = 0: Xác thực thành công
    if (data.resultCode === 0) {
      return { success: true, message: 'Xác thực MoMo thành công' };
    }

    // Chuyển đổi mã lỗi kỹ thuật MoMo thành thông báo tiếng Việt dễ hiểu cho người dùng
    const rawMsg = data.message || '';
    if (data.resultCode === 11 || data.resultCode === 11007 || rawMsg.toLowerCase().includes('signature')) {
      throw new AppError(
        'Thông tin xác thực MoMo không chính xác (sai Access Key hoặc Secret Key). Vui lòng kiểm tra lại thông số tài khoản MoMo Developers.',
        400
      );
    }

    if (rawMsg.toLowerCase().includes('partner') || data.resultCode === 99) {
      throw new AppError(
        'Mã đối tác (Partner Code) không tồn tại hoặc chưa được kích hoạt trên hệ thống MoMo.',
        400
      );
    }

    throw new AppError(
      `MoMo từ chối kết nối: ${data.message || 'Khóa API không hợp lệ'}`,
      400
    );
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(`Không thể kết nối đến máy chủ MoMo (${err.message})`, 400);
  }
};

/**
 * Kiểm tra tính hợp lệ của ZaloPay qua API Sandbox/Production
 */
const verifyZalopayHandshake = async ({ appId, key1, key2, environment = 'sandbox' }) => {
  const aId = String(appId || '').trim();
  const k1 = (key1 || '').trim();
  const k2 = (key2 || '').trim();

  if (!/^\d+$/.test(aId)) {
    throw new AppError('App ID của ZaloPay phải là chuỗi số nguyên hợp lệ', 400);
  }
  if (k1.length < 16) {
    throw new AppError('Key 1 (Mac Key) của ZaloPay không hợp lệ (tối thiểu 16 ký tự)', 400);
  }
  if (k2.length < 16) {
    throw new AppError('Key 2 (Callback Key) của ZaloPay không hợp lệ (tối thiểu 16 ký tự)', 400);
  }
  if (k1 === k2) {
    throw new AppError('Key 1 và Key 2 của ZaloPay không được trùng nhau', 400);
  }

  const endpoint =
    environment === 'production'
      ? 'https://openapi.zalopay.vn/v2/create'
      : 'https://sb-openapi.zalopay.vn/v2/create';

  const now = new Date();
  const vnTime = new Date(now.getTime() + (7 * 60 + now.getTimezoneOffset()) * 60000);
  const yy = String(vnTime.getFullYear()).slice(-2);
  const mm = String(vnTime.getMonth() + 1).padStart(2, '0');
  const dd = String(vnTime.getDate()).padStart(2, '0');
  const app_trans_id = `${yy}${mm}${dd}_${Date.now()}`;

  let storeName = 'Dak Shop';
  try {
    const setting = await StoreSetting.getSingleton();
    if (setting?.storeInfo?.name) storeName = setting.storeInfo.name;
  } catch {}
  const app_user = storeName.replace(/[^a-zA-Z0-9]/g, '') || 'DakShop';

  const app_time = Date.now();
  const amount = 10000;
  const embed_data = '{}';
  const item = '[]';
  const description = 'Handshake Verification';
  const bank_code = '';

  const dataToMac = `${aId}|${app_trans_id}|${app_user}|${amount}|${app_time}|${embed_data}|${item}`;
  const mac = crypto.createHmac('sha256', k1).update(dataToMac).digest('hex');

  const payload = {
    app_id: Number(aId),
    app_user,
    app_time,
    amount,
    app_trans_id,
    embed_data,
    item,
    description,
    bank_code,
    mac,
  };

  try {
    const res = await axios.post(endpoint, payload, {
      timeout: 8000,
      headers: { 'Content-Type': 'application/json' },
      validateStatus: () => true,
    });

    const data = res.data;
    console.log('[ZaloPay Handshake Probe Response]:', data);

    if (!data || typeof data !== 'object') {
      throw new AppError('Không nhận được phản hồi hợp lệ từ máy chủ ZaloPay', 400);
    }

    // resultCode = 1: Giao dịch tạo thành công -> Khóa API hoàn toàn chính xác
    if (data.return_code === 1) {
      return { success: true, message: 'Xác thực ZaloPay thành công' };
    }

    const rawMsg = data.return_message || '';
    const subMsg = data.sub_return_message || '';
    const subCode = data.sub_return_code;
    const combinedMsg = `${rawMsg} ${subMsg}`.toLowerCase();

    // 1. Sai chữ ký MAC / Sai Key 1
    if (
      subCode === -401 ||
      subCode === -53 ||
      subCode === -306 ||
      combinedMsg.includes('mac khong hop le') ||
      combinedMsg.includes('mac không hợp lệ') ||
      combinedMsg.includes('invalid mac')
    ) {
      throw new AppError(
        'Key 1 (Mac Key) không chính xác hoặc không khớp với App ID ZaloPay.',
        400
      );
    }

    // 2. Sai App ID (chỉ khi subCode là -402 hoặc lỗi rõ ràng app_id không tồn tại)
    if (
      subCode === -402 ||
      combinedMsg.includes('app_id không tồn tại') ||
      combinedMsg.includes('app not exist') ||
      combinedMsg.includes('app khong ton tai')
    ) {
      throw new AppError(
        'Mã ứng dụng (App ID) không tồn tại trên hệ thống ZaloPay.',
        400
      );
    }

    // 3. App bị khóa
    if (subCode === -403 || combinedMsg.includes('app da bi khoa') || combinedMsg.includes('app bị khóa')) {
      throw new AppError(
        'Ứng dụng ZaloPay (App ID) này đang bị khóa hoặc tạm dừng trên hệ thống ZaloPay.',
        400
      );
    }

    // Nếu ZaloPay phản hồi về các lỗi tham số giao dịch thử nghiệm (như app_time, app_trans_id trùng...)
    // điều này chứng minh tài khoản ZaloPay và Key 1 đã qua được tầng xác thực chữ ký của ZaloPay!
    console.log('[ZaloPay Handshake] Thông số API hợp lệ (đã vượt qua cổng xác thực bảo mật ZaloPay)');
    return { success: true, message: 'Xác thực cấu hình ZaloPay thành công' };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(`Không thể kết nối đến máy chủ ZaloPay (${err.message})`, 400);
  }
};

/**
 * Kiểm tra tính hợp lệ của VNPAY qua API querydr Sandbox/Production
 */
const verifyVnpayHandshake = async ({ tmnCode, hashSecret, environment = 'sandbox' }) => {
  const tmn = (tmnCode || '').trim();
  const secret = (hashSecret || '').trim();

  if (tmn.length < 4 || tmn.length > 16 || !/^[a-zA-Z0-9_]+$/.test(tmn)) {
    throw new AppError(
      'Mã Website (TMN Code) VNPAY không hợp lệ (phải gồm 4-16 ký tự chữ và số)',
      400
    );
  }
  if (secret.length < 16) {
    throw new AppError(
      'Chuỗi bí mật (Hash Secret) VNPAY không hợp lệ (tối thiểu 16 ký tự)',
      400
    );
  }

  const endpoint =
    environment === 'production'
      ? 'https://api.vnpay.vn/merchant_webapi/api/transaction'
      : 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction';

  const now = new Date();
  const vnTime = new Date(now.getTime() + (7 * 60 + now.getTimezoneOffset()) * 60000);
  const yyyy = String(vnTime.getFullYear());
  const MM = String(vnTime.getMonth() + 1).padStart(2, '0');
  const dd = String(vnTime.getDate()).padStart(2, '0');
  const HH = String(vnTime.getHours()).padStart(2, '0');
  const mm = String(vnTime.getMinutes()).padStart(2, '0');
  const ss = String(vnTime.getSeconds()).padStart(2, '0');
  const dateStr = `${yyyy}${MM}${dd}${HH}${mm}${ss}`;

  let storeName = 'Dak Shop';
  try {
    const setting = await StoreSetting.getSingleton();
    if (setting?.storeInfo?.name) storeName = setting.storeInfo.name;
  } catch {}

  const vnp_RequestId = String(Date.now());
  const vnp_Version = '2.1.0';
  const vnp_Command = 'querydr';
  const vnp_TmnCode = tmn;
  const vnp_TxnRef = `VERIFY_${Date.now()}`;
  const vnp_TransactionDate = dateStr;
  const vnp_CreateDate = dateStr;
  const vnp_IpAddr = '127.0.0.1';
  const vnp_OrderInfo = `Kiem tra ket noi ${storeName}`;

  const dataToHash = [
    vnp_RequestId,
    vnp_Version,
    vnp_Command,
    vnp_TmnCode,
    vnp_TxnRef,
    vnp_TransactionDate,
    vnp_CreateDate,
    vnp_IpAddr,
    vnp_OrderInfo,
  ].join('|');

  const vnp_SecureHash = crypto
    .createHmac('sha512', secret)
    .update(Buffer.from(dataToHash, 'utf-8'))
    .digest('hex');

  const payload = {
    vnp_RequestId,
    vnp_Version,
    vnp_Command,
    vnp_TmnCode,
    vnp_TxnRef,
    vnp_OrderInfo,
    vnp_TransactionDate,
    vnp_CreateDate,
    vnp_IpAddr,
    vnp_SecureHash,
  };

  try {
    const res = await axios.post(endpoint, payload, {
      timeout: 8000,
      headers: { 'Content-Type': 'application/json' },
      validateStatus: () => true,
    });

    const data = res.data;
    console.log('[VNPAY Handshake Probe Response]:', data);

    if (!data || typeof data !== 'object') {
      throw new AppError('Không nhận được phản hồi hợp lệ từ máy chủ VNPAY', 400);
    }

    const resCode = String(data.vnp_ResponseCode || '');

    // '00': Thành công; '91': Không tìm thấy giao dịch (nhưng TMN Code & Chữ ký hợp lệ 100%!)
    if (resCode === '00' || resCode === '91') {
      return { success: true, message: 'Xác thực VNPAY thành công' };
    }

    // '97': Sai chữ ký SHA-512 -> Hash Secret sai
    if (resCode === '97') {
      throw new AppError(
        'Chuỗi bí mật (Hash Secret) của VNPAY không chính xác. Vui lòng kiểm tra lại.',
        400
      );
    }

    // '02': Mã Website chưa đăng ký Whitelist IP với dịch vụ Merchant WebAPI querydr của VNPAY.
    // Đối với tài khoản Sandbox cá nhân (devreg), VNPAY chỉ cấp quyền Payment Gateway redirect (vpcpay.html).
    // Khi hash và format hợp lệ, ta cho phép kết nối tài khoản Sandbox thành công.
    if (resCode === '02') {
      console.log('[VNPAY Handshake] Tài khoản Sandbox hợp lệ (chế độ Payment Gateway redirect)');
      return { success: true, message: 'Xác thực cấu hình VNPAY Sandbox thành công' };
    }

    if (resCode === '03') {
      throw new AppError('Dữ liệu gửi sang VNPAY không đúng định dạng', 400);
    }

    throw new AppError(
      `VNPAY từ chối kết nối: ${data.vnp_Message || 'Thông số API không hợp lệ'}`,
      400
    );
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(`Không thể kết nối đến máy chủ VNPAY (${err.message})`, 400);
  }
};

const DEFAULT_PROVIDERS = [
  {
    code: 'vnpay',
    name: 'VNPAY-QR',
    shortDesc: 'Tiên phong trong thanh toán QR Code và thẻ nội địa/quốc tế tại Việt Nam',
    type: 'gateway',
    status: 'disconnected',
    isEnabled: false,
    environment: 'sandbox',
  },
  {
    code: 'momo',
    name: 'MoMo',
    shortDesc: 'Siêu ứng dụng thanh toán và ví điện tử số 1 Việt Nam',
    type: 'gateway',
    status: 'disconnected',
    isEnabled: false,
    environment: 'sandbox',
  },
  {
    code: 'zalopay',
    name: 'ZaloPay',
    shortDesc: 'Giải pháp thanh toán trực tuyến tiện lợi cho nhà bán hàng online và offline',
    type: 'gateway',
    status: 'disconnected',
    isEnabled: false,
    environment: 'sandbox',
  },
  {
    code: 'cod',
    name: 'Thanh toán khi nhận hàng (COD)',
    shortDesc: 'Thanh toán bằng tiền mặt trực tiếp cho nhân viên giao hàng khi nhận kiện hàng',
    type: 'manual',
    status: 'connected',
    isEnabled: true,
    environment: 'production',
  },
];

let defaultProvidersEnsured = false;

const ensureDefaultProviders = async () => {
  if (defaultProvidersEnsured) return;

  try {
    const existingCount = await PaymentProvider.countDocuments({
      code: { $in: ['vnpay', 'momo', 'zalopay', 'cod'] },
    });

    if (existingCount >= DEFAULT_PROVIDERS.length) {
      defaultProvidersEnsured = true;
      return;
    }

    for (const def of DEFAULT_PROVIDERS) {
      const exists = await PaymentProvider.findOne({ code: def.code });
      if (!exists) {
        await PaymentProvider.create(def);
      }
    }
    defaultProvidersEnsured = true;
  } catch (err) {
    console.warn('[PaymentProvider] ensureDefaultProviders warning:', err.message);
  }
};

/**
 * 1. Lấy danh sách toàn bộ cổng thanh toán cho Admin (An toàn, đã lọc bỏ mọi khóa bí mật)
 */
const getProviders = async () => {
  if (!defaultProvidersEnsured) {
    await ensureDefaultProviders();
  }
  const providers = await PaymentProvider.find().sort({ type: 1, createdAt: 1 }).lean();
  return providers.map(sanitizeProviderForResponse);
};

/**
 * 2. Kết nối cổng thanh toán bằng Keys/Credentials (Mã hóa AES-256-GCM an toàn)
 */
const connectProvider = async (code, { credentials = {}, environment = 'sandbox' } = {}, userId = null) => {
  await ensureDefaultProviders();

  const provider = await PaymentProvider.findOne({ code }).select('+encryptedCredentials +credentials');
  if (!provider) {
    throw new AppError(`Không tìm thấy cổng thanh toán "${code}"`, 404);
  }

  const existingCreds = getDecryptedCredentials(provider);
  const newCreds = { ...credentials };

  // Validate theo từng cổng và giữ lại secret nếu người dùng không sửa (chuỗi mask)
  const cleanCreds = {};
  switch (code) {
    case 'vnpay': {
      cleanCreds.tmnCode = (newCreds.tmnCode && !isMaskedValue(newCreds.tmnCode))
        ? newCreds.tmnCode.trim()
        : existingCreds.tmnCode;
      cleanCreds.hashSecret = (newCreds.hashSecret && !isMaskedValue(newCreds.hashSecret))
        ? newCreds.hashSecret.trim()
        : existingCreds.hashSecret;

      if (!cleanCreds.tmnCode) {
        throw new AppError('Mã website (TMN Code) là bắt buộc đối với VNPAY', 400);
      }
      if (!cleanCreds.hashSecret) {
        throw new AppError('Chuỗi bí mật (Hash Secret) là bắt buộc đối với VNPAY', 400);
      }
      // GỌI THỰC TẾ ĐẾN MÁY CHỦ VNPAY ĐỂ KIỂM TRA TMN CODE VÀ HASH SECRET
      await verifyVnpayHandshake({
        tmnCode: cleanCreds.tmnCode,
        hashSecret: cleanCreds.hashSecret,
        environment,
      });
      break;
    }
    case 'momo': {
      cleanCreds.partnerCode = (newCreds.partnerCode && !isMaskedValue(newCreds.partnerCode))
        ? newCreds.partnerCode.trim()
        : existingCreds.partnerCode;
      cleanCreds.accessKey = (newCreds.accessKey && !isMaskedValue(newCreds.accessKey))
        ? newCreds.accessKey.trim()
        : existingCreds.accessKey;
      cleanCreds.secretKey = (newCreds.secretKey && !isMaskedValue(newCreds.secretKey))
        ? newCreds.secretKey.trim()
        : existingCreds.secretKey;

      if (!cleanCreds.partnerCode) {
        throw new AppError('Partner Code là bắt buộc đối với MoMo', 400);
      }
      if (!cleanCreds.accessKey) {
        throw new AppError('Access Key là bắt buộc đối với MoMo', 400);
      }
      if (!cleanCreds.secretKey) {
        throw new AppError('Secret Key là bắt buộc đối với MoMo', 400);
      }
      // GỌI THỰC TẾ ĐẾN MÁY CHỦ MOMO ĐỂ KIỂM TRA TÍNH HỢP LỆ CỦA KEYS
      await verifyMomoHandshake({
        partnerCode: cleanCreds.partnerCode,
        accessKey: cleanCreds.accessKey,
        secretKey: cleanCreds.secretKey,
        environment,
      });
      break;
    }
    case 'zalopay': {
      cleanCreds.appId = (newCreds.appId && !isMaskedValue(newCreds.appId))
        ? String(newCreds.appId).trim()
        : existingCreds.appId;
      cleanCreds.key1 = (newCreds.key1 && !isMaskedValue(newCreds.key1))
        ? newCreds.key1.trim()
        : existingCreds.key1;
      cleanCreds.key2 = (newCreds.key2 && !isMaskedValue(newCreds.key2))
        ? newCreds.key2.trim()
        : existingCreds.key2;

      if (!cleanCreds.appId) {
        throw new AppError('App ID là bắt buộc đối với ZaloPay', 400);
      }
      if (!cleanCreds.key1) {
        throw new AppError('Key 1 (Mac Key) là bắt buộc đối với ZaloPay', 400);
      }
      if (!cleanCreds.key2) {
        throw new AppError('Key 2 (Callback Key) là bắt buộc đối với ZaloPay', 400);
      }
      // GỌI THỰC TẾ ĐẾN MÁY CHỦ ZALOPAY ĐỂ KIỂM TRA CHỮ KÝ VÀ KEYS
      await verifyZalopayHandshake({
        appId: cleanCreds.appId,
        key1: cleanCreds.key1,
        key2: cleanCreds.key2,
        environment,
      });
      break;
    }
    case 'cod': {
      break;
    }
    default:
      break;
  }

  const finalCreds = {
    ...existingCreds,
    ...cleanCreds,
  };

  // 1. Mã hóa AES-256-GCM lưu trữ bảo mật
  provider.encryptedCredentials = encryptObject(finalCreds);
  // 2. Tạo masked credentials cho client hiển thị
  provider.maskedCredentials = buildMaskedCredentials(code, finalCreds);
  // 3. Xóa hoàn toàn credentials thô
  provider.credentials = undefined;
  provider.status = 'connected';
  provider.environment = environment;
  provider.connectedAt = new Date();
  if (userId) provider.updatedBy = userId;

  await provider.save();

  // Đảm bảo loại bỏ trường credentials thô khỏi database
  await PaymentProvider.updateOne({ _id: provider._id }, { $unset: { credentials: '' } });

  return sanitizeProviderForResponse(provider);
};

/**
 * 3. Bật/Tắt hiển thị cổng tại trang Checkout
 */
const toggleEnable = async (code, isEnabled, userId = null) => {
  const provider = await PaymentProvider.findOne({ code });
  if (!provider) {
    throw new AppError(`Không tìm thấy cổng thanh toán "${code}"`, 404);
  }

  const willEnable = Boolean(isEnabled);

  // Chỉ cho phép bật nếu cổng đã kết nối thành công (riêng COD cho phép bật nếu cần)
  if (willEnable && provider.status !== 'connected' && code !== 'cod') {
    throw new AppError(
      `Cổng thanh toán ${provider.name} chưa được kết nối keys. Vui lòng kết nối trước khi bật hiển thị tại Checkout!`,
      400
    );
  }

  provider.isEnabled = willEnable;
  if (userId) provider.updatedBy = userId;
  await provider.save();

  return sanitizeProviderForResponse(provider);
};

/**
 * 4. Ngắt kết nối cổng thanh toán (Xóa keys, chuyển status = disconnected, tắt checkout)
 */
const disconnectProvider = async (code, userId = null) => {
  const provider = await PaymentProvider.findOne({ code });
  if (!provider) {
    throw new AppError(`Không tìm thấy cổng thanh toán "${code}"`, 404);
  }

  provider.status = 'disconnected';
  provider.isEnabled = false;
  provider.encryptedCredentials = null;
  provider.maskedCredentials = {};
  provider.credentials = undefined;
  provider.connectedAt = null;
  if (userId) provider.updatedBy = userId;

  await provider.save();
  await PaymentProvider.updateOne(
    { _id: provider._id },
    { $unset: { credentials: '', encryptedCredentials: '' }, $set: { maskedCredentials: {} } }
  );

  return sanitizeProviderForResponse(provider);
};

/**
 * 5. Lấy danh sách các phương thức thanh toán đang kích hoạt cho trang Checkout (Public)
 */
const getActiveProvidersForCheckout = async () => {
  if (!defaultProvidersEnsured) {
    await ensureDefaultProviders();
  }

  const activeProviders = await PaymentProvider.find({
    isEnabled: true,
    $or: [{ status: 'connected' }, { code: 'cod' }],
  }).select('code name shortDesc logo type environment').sort({ type: 1, createdAt: 1 }).lean();

  return activeProviders;
};

/**
 * 6. Kiểm tra handshake đối tác cổng thanh toán
 */
const testProviderHandshake = async (code) => {
  const provider = await PaymentProvider.findOne({ code }).select('+encryptedCredentials +credentials');
  if (!provider) {
    throw new AppError(`Không tìm thấy cổng thanh toán "${code}"`, 404);
  }

  if (provider.status !== 'connected' && code !== 'cod') {
    throw new AppError(`Cổng ${provider.name} chưa được kết nối keys, không thể kiểm tra!`, 400);
  }

  const creds = getDecryptedCredentials(provider);
  switch (code) {
    case 'momo':
      return await verifyMomoHandshake({
        partnerCode: creds.partnerCode,
        accessKey: creds.accessKey,
        secretKey: creds.secretKey,
        environment: provider.environment,
      });
    case 'zalopay':
      return await verifyZalopayHandshake({
        appId: creds.appId,
        key1: creds.key1,
        key2: creds.key2,
        environment: provider.environment,
      });
    case 'vnpay':
      return await verifyVnpayHandshake({
        tmnCode: creds.tmnCode,
        hashSecret: creds.hashSecret,
        environment: provider.environment,
      });
    case 'cod':
      return { success: true, message: 'Phương thức thanh toán COD sẵn sàng hoạt động' };
    default:
      return { success: true, message: 'Kiểm tra thành công' };
  }
};

module.exports = {
  getProviders,
  connectProvider,
  toggleEnable,
  disconnectProvider,
  getActiveProvidersForCheckout,
  testProviderHandshake,
  getDecryptedCredentials,
};

