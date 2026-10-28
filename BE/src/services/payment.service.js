const crypto = require('crypto');
const qs = require('qs');
const Order = require('../models/order.model');
const PaymentProvider = require('../models/paymentProvider.model');
const { getDecryptedCredentials } = require('./paymentProvider.service');
const { AppError } = require('../utils/AppError');

// So sánh an toàn bất biến thời gian chống Timing Attacks trên chữ ký HMAC
const safeTimingCompare = (a = '', b = '') => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

/**
 * Bảng mã lỗi phản hồi OnePay chuẩn tiếng Việt
 */
const ONEPAY_RESPONSE_CODES = {
  '0': 'Giao dịch thành công (Approved)',
  '1': 'Ngân hàng từ chối giao dịch (Bank Declined)',
  '3': 'Không nhận được phản hồi từ tổ chức phát hành thẻ',
  '4': 'Hết hạn chờ thanh toán (Expired)',
  '5': 'Số dư tài khoản không đủ để thanh toán (Insufficient Funds)',
  '6': 'Thẻ không hợp lệ hoặc đã bị khóa',
  '7': 'Lỗi xử lý giao dịch tại ngân hàng',
  '8': 'Ngân hàng phát hành không hỗ trợ thanh toán trực tuyến loại thẻ này',
  '9': 'Thông tin thẻ không chính xác hoặc thẻ chưa kích hoạt thương mại điện tử',
  '99': 'Người dùng đã hủy giao dịch trên cổng thanh toán OnePay',
  'B': 'Xác thực 3D-Secure không thành công hoặc người dùng đóng OTP',
  'Z': 'Giao dịch bị chặn do nghi ngờ gian lận',
};

const getOnepayResponseDescription = (code) => {
  return ONEPAY_RESPONSE_CODES[String(code)] || `Lỗi giao dịch OnePay (Mã phản hồi: ${code})`;
};

/**
 * Bảng mã lỗi phản hồi VNPAY chuẩn tiếng Việt
 */
const VNPAY_RESPONSE_CODES = {
  '00': 'Giao dịch thành công (Approved)',
  '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)',
  '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ Internet Banking tại ngân hàng',
  '10': 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
  '11': 'Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch',
  '12': 'Thẻ/Tài khoản của khách hàng bị khóa',
  '13': 'Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)',
  '24': 'Khách hàng hủy giao dịch',
  '51': 'Tài khoản của quý khách không đủ số dư để thực hiện giao dịch',
  '65': 'Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày',
  '75': 'Ngân hàng thanh toán đang bảo trì',
  '79': 'Khách hàng nhập sai mật khẩu thanh toán quá số lần quy định',
  '99': 'Các lỗi khác (Lỗi hệ thống hoặc chưa xác định)',
};

const getVnpayResponseDescription = (code) => {
  return VNPAY_RESPONSE_CODES[String(code)] || `Lỗi giao dịch VNPAY (Mã phản hồi: ${code})`;
};

const sortObject = (obj) => {
  const sorted = {};
  const str = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (let i = 0; i < str.length; i++) {
    const key = str[i];
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
  }
  return sorted;
};

const formatDateVnpay = (d = new Date()) => {
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const vnTime = new Date(utc + 7 * 3600000);
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = vnTime.getFullYear();
  const MM = pad(vnTime.getMonth() + 1);
  const dd = pad(vnTime.getDate());
  const HH = pad(vnTime.getHours());
  const mm = pad(vnTime.getMinutes());
  const ss = pad(vnTime.getSeconds());
  return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
};

/**
 * 1. Danh sách phương thức thanh toán khả dụng
 */
const getPaymentMethods = async () => {
  return [
    {
      code: 'COD',
      name: 'Thanh toán khi nhận hàng (COD)',
      description: 'Thanh toán bằng tiền mặt trực tiếp cho nhân viên giao hàng khi nhận được kiện hàng',
      icon: 'truck',
      isEnabled: true,
      isOnline: false,
      extraFee: 0,
    },
    {
      code: 'ONEPAY',
      name: 'Cổng thanh toán OnePay',
      description: 'Thanh toán trực tuyến bằng thẻ ATM nội địa Napas, thẻ Visa/Mastercard hoặc quét mã QR',
      icon: 'credit-card',
      isEnabled: true,
      isOnline: true,
      extraFee: 0,
    },
    {
      code: 'VNPAY',
      name: 'Cổng thanh toán VNPAY',
      description: 'Thanh toán trực tuyến qua VNPAY-QR, thẻ ATM nội địa Napas hoặc thẻ quốc tế Visa/Mastercard',
      icon: 'credit-card',
      isEnabled: true,
      isOnline: true,
      extraFee: 0,
    },
  ];
};

/**
 * Sinh đường link redirect thanh toán OnePay Sandbox / Production
 */
const buildOnepayPaymentUrl = async (order, clientIp = '127.0.0.1') => {
  const provider = await PaymentProvider.findOne({ code: 'onepay' }).select('+encryptedCredentials +credentials');
  if (!provider || provider.status !== 'connected') {
    throw new AppError('Cổng thanh toán OnePay chưa được cấu hình hoặc chưa kết nối.', 400);
  }

  const creds = getDecryptedCredentials(provider);
  if (!creds?.merchantId || !creds?.accessCode || !creds?.secureSecret) {
    throw new AppError('Thông tin kết nối OnePay không đầy đủ.', 400);
  }

  const endpoint = provider.environment === 'production'
    ? 'https://onepay.vn/paygate/vpcpay.op'
    : 'https://mtf.onepay.vn/paygate/vpcpay.op';

  const amountInCents = Math.round(Number(order.pricing?.totalAmount || 0) * 100);
  const backendBase = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
  const returnUrl = `${backendBase}/api/v1/payments/onepay/return`;

  const params = {
    vpc_Version: '2',
    vpc_Command: 'pay',
    vpc_AccessCode: creds.accessCode,
    vpc_Merchant: creds.merchantId,
    vpc_MerchTxnRef: order.orderCode,
    vpc_OrderInfo: `Thanh toan don hang #${order.orderCode}`,
    vpc_Amount: String(amountInCents),
    vpc_ReturnURL: returnUrl,
    vpc_Locale: 'vn',
    vpc_Currency: 'VND',
    vpc_TicketNo: clientIp || '127.0.0.1',
  };

  const sortedKeys = Object.keys(params).sort();
  const rawParts = [];
  for (const k of sortedKeys) {
    if ((k.startsWith('vpc_') || k.startsWith('user_')) && params[k] !== undefined && params[k] !== null && String(params[k]).length > 0) {
      rawParts.push(`${k}=${params[k]}`);
    }
  }
  const raw = rawParts.join('&');

  let secretBuffer;
  try {
    secretBuffer = Buffer.from(creds.secureSecret, 'hex');
  } catch {
    throw new AppError('Khóa bí mật OnePay không hợp lệ (hex).', 400);
  }

  const hash = crypto.createHmac('sha256', secretBuffer).update(raw).digest('hex').toUpperCase();

  const queryStringParts = [];
  for (const k of sortedKeys) {
    if ((k.startsWith('vpc_') || k.startsWith('user_')) && params[k] !== undefined && params[k] !== null && String(params[k]).length > 0) {
      queryStringParts.push(`${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`);
    }
  }
  queryStringParts.push(`vpc_SecureHash=${hash}`);

  return `${endpoint}?${queryStringParts.join('&')}`;
};

/**
 * 2. Khởi tạo thanh toán cho đơn hàng
 */
const createPayment = async (userId, { orderId, paymentMethod = 'COD', clientIp = '127.0.0.1' } = {}) => {
  if (!orderId) {
    throw new AppError('Mã đơn hàng (orderId) là bắt buộc để khởi tạo thanh toán', 400);
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Không tìm thấy đơn hàng cần thanh toán', 404);
  }

  if (userId && order.userId && order.userId.toString() !== userId.toString()) {
    throw new AppError('Bạn không có quyền thanh toán cho đơn hàng này', 403);
  }

  if (order.orderStatus === 'CANCELLED') {
    throw new AppError('Đơn hàng này đã bị hủy, không thể thanh toán', 400);
  }

  const targetMethod = String(paymentMethod || 'COD').toUpperCase();

  if (targetMethod === 'ONEPAY') {
    if (order.paymentStatus === 'PAID') {
      throw new AppError('Đơn hàng này đã được thanh toán thành công trước đó.', 400);
    }
    const paymentUrl = await buildOnepayPaymentUrl(order, clientIp);
    if (order.paymentMethod !== 'ONEPAY') {
      order.paymentMethod = 'ONEPAY';
      await order.save();
    }
    return {
      orderId: order._id,
      orderCode: order.orderCode,
      paymentMethod: 'ONEPAY',
      paymentStatus: order.paymentStatus || 'UNPAID',
      totalAmount: order.pricing?.totalAmount || 0,
      paymentUrl,
      requiresAction: true,
      message: 'Đang chuyển hướng sang cổng thanh toán OnePay...',
    };
  }

  if (targetMethod !== 'COD') {
    throw new AppError(`Phương thức thanh toán "${targetMethod}" hiện chưa được kích hoạt. Vui lòng chọn OnePay hoặc COD.`, 400);
  }

  if (order.paymentMethod !== 'COD') {
    order.paymentMethod = 'COD';
    await order.save();
  }

  return {
    orderId: order._id,
    orderCode: order.orderCode,
    paymentMethod: 'COD',
    paymentStatus: order.paymentStatus || 'UNPAID',
    totalAmount: order.pricing?.totalAmount || 0,
    requiresAction: false,
    message: 'Đơn hàng được xác nhận thanh toán khi nhận hàng (COD). Vui lòng chuẩn bị tiền mặt khi shipper giao hàng.',
  };
};

/**
 * 3. Xử lý kết quả trả về từ OnePay sau khi người dùng thanh toán (HTTP GET vpc_ReturnURL)
 */
const handleOnepayReturn = async (queryParams = {}) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const orderCode = queryParams.vpc_MerchTxnRef;
  const vpcSecureHash = queryParams.vpc_SecureHash;
  const txnResponseCode = queryParams.vpc_TxnResponseCode;
  const transactionNo = queryParams.vpc_TransactionNo || '';

  const provider = await PaymentProvider.findOne({ code: 'onepay' }).select('+encryptedCredentials +credentials');
  if (!provider) {
    return `${clientUrl}/checkout/result?orderCode=${encodeURIComponent(orderCode || '')}&status=failed&message=${encodeURIComponent('Cổng OnePay không tồn tại')}`;
  }

  const creds = getDecryptedCredentials(provider);
  const secretBuffer = Buffer.from(creds.secureSecret, 'hex');

  const sortedKeys = Object.keys(queryParams).sort();
  const rawParts = [];
  for (const k of sortedKeys) {
    if (k !== 'vpc_SecureHash' && (k.startsWith('vpc_') || k.startsWith('user_')) && queryParams[k]) {
      rawParts.push(`${k}=${queryParams[k]}`);
    }
  }
  const raw = rawParts.join('&');
  const calculatedHash = crypto.createHmac('sha256', secretBuffer).update(raw).digest('hex').toUpperCase();

  if (!safeTimingCompare(calculatedHash, String(vpcSecureHash || '').toUpperCase())) {
    console.error('[OnePay Return] Sai chữ ký bảo mật (Hash mismatch)', { calculatedHash, vpcSecureHash });
    return `${clientUrl}/checkout/result?orderCode=${encodeURIComponent(orderCode || '')}&status=invalid_signature&message=${encodeURIComponent('Chữ ký bảo mật OnePay không hợp lệ')}`;
  }

  const order = await Order.findOne({ orderCode });
  if (!order) {
    return `${clientUrl}/checkout/result?orderCode=${encodeURIComponent(orderCode || '')}&status=failed&message=${encodeURIComponent('Không tìm thấy thông tin đơn hàng')}`;
  }

  const description = getOnepayResponseDescription(txnResponseCode);

  if (String(txnResponseCode) === '0') {
    if (order.paymentStatus !== 'PAID') {
      order.paymentStatus = 'PAID';
      order.orderStatus = 'CONFIRMED';
      order.paymentDetails = {
        provider: 'onepay',
        transactionNo,
        merchTxnRef: orderCode,
        amount: Number(queryParams.vpc_Amount || 0) / 100,
        bankCode: queryParams.vpc_BankCode || null,
        cardType: queryParams.vpc_CardType || null,
        responseCode: txnResponseCode,
        paidAt: new Date(),
        rawResponse: queryParams,
      };
      order.statusHistory.push({
        status: 'CONFIRMED',
        note: `Thanh toán thành công qua OnePay Sandbox (Mã GD: ${transactionNo || 'N/A'}).`,
        changedAt: new Date(),
      });
      await order.save();

      try {
        const notificationService = require('./notification.service');
        notificationService.createNotification({
          recipient: 'admin',
          type: 'ORDER_PAID',
          title: `Đơn hàng #${order.orderCode} đã thanh toán OnePay`,
          message: `Khách hàng ${order.shippingAddress?.fullName} đã thanh toán thành công ${(order.pricing?.totalAmount || 0).toLocaleString('vi-VN')}đ qua OnePay.`,
          link: `/orders/${order._id}`,
          metadata: { orderId: order._id, orderCode: order.orderCode },
        }).catch(() => { });
      } catch { }

      try {
        const emailService = require('./email.service');
        emailService.sendPaymentSuccessEmail(order, transactionNo).catch((e) =>
          console.warn('[OnePay Return] Lỗi gửi email thanh toán thành công:', e.message)
        );
      } catch (_) {}
    }

    return `${clientUrl}/checkout/result?orderCode=${encodeURIComponent(order.orderCode)}&status=success&transNo=${encodeURIComponent(transactionNo)}&amount=${order.pricing?.totalAmount || 0}`;
  }

  order.statusHistory.push({
    status: order.orderStatus,
    note: `Thanh toán OnePay không thành công hoặc bị hủy (Mã: ${txnResponseCode} - ${description}).`,
    changedAt: new Date(),
  });
  await order.save();

  return `${clientUrl}/checkout/result?orderCode=${encodeURIComponent(order.orderCode)}&status=failed&code=${encodeURIComponent(txnResponseCode)}&message=${encodeURIComponent(description)}`;
};

/**
 * 4. Xử lý IPN từ OnePay (Server-to-Server Instant Payment Notification)
 */
const handleOnepayIPN = async (params = {}) => {
  const vpcSecureHash = params.vpc_SecureHash;
  const orderCode = params.vpc_MerchTxnRef;
  const txnResponseCode = params.vpc_TxnResponseCode;
  const transactionNo = params.vpc_TransactionNo || '';

  const provider = await PaymentProvider.findOne({ code: 'onepay' }).select('+encryptedCredentials +credentials');
  if (!provider) return 'responseCode=0&desc=provider-not-found';

  const creds = getDecryptedCredentials(provider);
  const secretBuffer = Buffer.from(creds.secureSecret, 'hex');

  const sortedKeys = Object.keys(params).sort();
  const rawParts = [];
  for (const k of sortedKeys) {
    if (k !== 'vpc_SecureHash' && (k.startsWith('vpc_') || k.startsWith('user_')) && params[k]) {
      rawParts.push(`${k}=${params[k]}`);
    }
  }
  const raw = rawParts.join('&');
  const calculatedHash = crypto.createHmac('sha256', secretBuffer).update(raw).digest('hex').toUpperCase();

  if (!safeTimingCompare(calculatedHash, String(vpcSecureHash || '').toUpperCase())) {
    return 'responseCode=0&desc=invalid-hash';
  }

  const order = await Order.findOne({ orderCode });
  if (!order) return 'responseCode=0&desc=order-not-found';

  if (String(txnResponseCode) === '0' && order.paymentStatus !== 'PAID') {
    order.paymentStatus = 'PAID';
    order.orderStatus = 'CONFIRMED';
    order.paymentDetails = {
      provider: 'onepay',
      transactionNo,
      merchTxnRef: orderCode,
      amount: Number(params.vpc_Amount || 0) / 100,
      bankCode: params.vpc_BankCode || null,
      cardType: params.vpc_CardType || null,
      responseCode: txnResponseCode,
      paidAt: new Date(),
      rawResponse: params,
    };
    order.statusHistory.push({
      status: 'CONFIRMED',
      note: `Xác nhận thanh toán OnePay qua IPN (Mã GD: ${transactionNo}).`,
      changedAt: new Date(),
    });
    await order.save();

    try {
      const emailService = require('./email.service');
      emailService.sendPaymentSuccessEmail(order, transactionNo).catch((e) =>
        console.warn('[OnePay IPN] Lỗi gửi email thanh toán thành công:', e.message)
      );
    } catch (_) {}
  }

  return 'responseCode=1&desc=confirm-success';
};

/**
 * 5. Kiểm tra trạng thái thanh toán của một đơn hàng
 */
const getPaymentStatus = async (orderId, userId = null) => {
  if (!orderId) {
    throw new AppError('Mã đơn hàng (orderId) là bắt buộc', 400);
  }

  const order = await Order.findById(orderId).lean();
  if (!order) {
    throw new AppError('Không tìm thấy thông tin đơn hàng', 404);
  }

  if (userId && order.userId && order.userId.toString() !== userId.toString()) {
    throw new AppError('Bạn không có quyền xem thông tin thanh toán của đơn hàng này', 403);
  }

  return {
    orderId: order._id,
    orderCode: order.orderCode,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    paymentDetails: order.paymentDetails,
    orderStatus: order.orderStatus,
    totalAmount: order.pricing?.totalAmount || 0,
    paidAt: order.paymentStatus === 'PAID' ? (order.paymentDetails?.paidAt || order.updatedAt) : null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

/**
 * 6. Xử lý webhook chung
 */
const handlePaymentWebhook = async (payload = {}, headers = {}) => {
  console.log('[Payment Webhook] Nhận tín hiệu IPN/Webhook:', { payload, headers });
  return {
    success: true,
    message: 'Webhook received successfully',
  };
};

/**
 * Sinh đường link redirect thanh toán VNPAY Sandbox / Production
 */
const buildVnpayPaymentUrl = async (order, clientIp = '127.0.0.1') => {
  const provider = await PaymentProvider.findOne({ code: 'vnpay' }).select('+encryptedCredentials +credentials');
  if (!provider || provider.status !== 'connected') {
    throw new AppError('Cổng thanh toán VNPAY chưa được cấu hình hoặc chưa kết nối.', 400);
  }

  const creds = getDecryptedCredentials(provider);
  if (!creds?.tmnCode || !creds?.hashSecret) {
    throw new AppError('Thông tin kết nối VNPAY (vnp_TmnCode, vnp_HashSecret) không đầy đủ.', 400);
  }

  const endpoint = provider.environment === 'production'
    ? 'https://pay.vnpayment.vn/paymentv2/vpcpay.html'
    : 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';

  const amountInCents = Math.round(Number(order.pricing?.totalAmount || 0) * 100);
  const backendBase = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
  const returnUrl = `${backendBase}/api/v1/payments/vnpay/return`;

  const now = new Date();
  const expire = new Date(now.getTime() + 15 * 60 * 1000);

  const rawParams = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: creds.tmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: order.orderCode,
    vnp_OrderInfo: `Thanh toan don hang ${order.orderCode}`,
    vnp_OrderType: 'other',
    vnp_Amount: String(amountInCents),
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: clientIp || '127.0.0.1',
    vnp_CreateDate: formatDateVnpay(now),
    vnp_ExpireDate: formatDateVnpay(expire),
  };

  const sortedParams = sortObject(rawParams);
  const signData = qs.stringify(sortedParams, { encode: false });
  const signed = crypto
    .createHmac('sha512', creds.hashSecret)
    .update(Buffer.from(signData, 'utf-8'))
    .digest('hex');

  sortedParams['vnp_SecureHash'] = signed;
  return `${endpoint}?${qs.stringify(sortedParams, { encode: false })}`;
};

/**
 * Xử lý kết quả trả về từ VNPAY (Return URL)
 */
const handleVnpayReturn = async (queryParams) => {
  let vnp_Params = { ...queryParams };
  const secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);

  const provider = await PaymentProvider.findOne({ code: 'vnpay' }).select('+encryptedCredentials +credentials');
  if (!provider) {
    throw new AppError('Cổng thanh toán VNPAY chưa được cấu hình.', 400);
  }
  const creds = getDecryptedCredentials(provider);
  const secretKey = creds.hashSecret;

  const signData = qs.stringify(vnp_Params, { encode: false });
  const checkHash = crypto
    .createHmac('sha512', secretKey)
    .update(Buffer.from(signData, 'utf-8'))
    .digest('hex');

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const orderCode = vnp_Params['vnp_TxnRef'];
  const responseCode = vnp_Params['vnp_ResponseCode'];
  const transactionNo = vnp_Params['vnp_TransactionNo'] || '';
  const bankCode = vnp_Params['vnp_BankCode'] || '';
  const cardType = vnp_Params['vnp_CardType'] || '';
  const amount = Number(vnp_Params['vnp_Amount']) ? Number(vnp_Params['vnp_Amount']) / 100 : 0;

  if (!safeTimingCompare(String(secureHash || '').toLowerCase(), String(checkHash || '').toLowerCase())) {
    console.error('[VNPAY] Checksum mismatch! received:', secureHash, 'expected:', checkHash);
    return `${clientUrl}/checkout/result?orderCode=${encodeURIComponent(orderCode)}&status=failed&code=CHECKSUM_INVALID&message=${encodeURIComponent('Chữ ký bảo mật VNPAY không hợp lệ')}`;
  }

  const order = await Order.findOne({ orderCode });
  if (!order) {
    return `${clientUrl}/checkout/result?orderCode=${encodeURIComponent(orderCode)}&status=failed&code=ORDER_NOT_FOUND&message=${encodeURIComponent('Không tìm thấy đơn hàng')}`;
  }

  if (responseCode === '00') {
    order.paymentStatus = 'PAID';
    order.orderStatus = 'CONFIRMED';
    order.paymentDetails = {
      provider: 'VNPAY',
      transactionNo,
      bankCode,
      cardType,
      payDate: vnp_Params['vnp_PayDate'],
      responseCode,
      status: 'SUCCESS',
      paidAt: new Date(),
    };
    order.statusHistory.push({
      status: 'CONFIRMED',
      note: `Thanh toán thành công qua VNPAY (Mã GD: ${transactionNo || 'N/A'}).`,
      changedAt: new Date(),
    });
    await order.save();

    try {
      const { createNotification } = require('./notification.service');
      createNotification({
        type: 'ORDER_PAID',
        title: 'Thanh toán VNPAY thành công',
        message: `Khách hàng ${order.shippingAddress?.fullName || ''} đã thanh toán thành công ${(order.pricing?.totalAmount || 0).toLocaleString('vi-VN')}đ qua VNPAY.`,
        link: `/orders/${order._id}`,
        metadata: { orderId: order._id, orderCode: order.orderCode },
      }).catch(() => {});
    } catch {}

    try {
      const emailService = require('./email.service');
      emailService.sendPaymentSuccessEmail(order, transactionNo).catch((e) =>
        console.warn('[VNPAY Return] Lỗi gửi email thanh toán thành công:', e.message)
      );
    } catch (_) {}

    return `${clientUrl}/checkout/result?orderCode=${encodeURIComponent(order.orderCode)}&status=success&transNo=${encodeURIComponent(transactionNo)}&amount=${order.pricing?.totalAmount || amount}`;
  } else {
    const desc = VNPAY_RESPONSE_CODES[responseCode] || 'Giao dịch VNPAY không thành công';
    order.paymentStatus = 'FAILED';
    order.paymentDetails = {
      provider: 'VNPAY',
      transactionNo,
      bankCode,
      cardType,
      responseCode,
      status: 'FAILED',
    };
    await order.save();

    return `${clientUrl}/checkout/result?orderCode=${encodeURIComponent(order.orderCode)}&status=failed&code=${encodeURIComponent(responseCode)}&message=${encodeURIComponent(desc)}&amount=${order.pricing?.totalAmount || amount}`;
  }
};

/**
 * Xử lý IPN (Server-to-Server) từ VNPAY
 */
const handleVnpayIPN = async (queryParams) => {
  let vnp_Params = { ...queryParams };
  const secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);

  const provider = await PaymentProvider.findOne({ code: 'vnpay' }).select('+encryptedCredentials +credentials');
  if (!provider) {
    return { RspCode: '99', Message: 'Provider not found' };
  }
  const creds = getDecryptedCredentials(provider);
  const secretKey = creds.hashSecret;

  const signData = qs.stringify(vnp_Params, { encode: false });
  const checkHash = crypto
    .createHmac('sha512', secretKey)
    .update(Buffer.from(signData, 'utf-8'))
    .digest('hex');

  if (!safeTimingCompare(String(secureHash || '').toLowerCase(), String(checkHash || '').toLowerCase())) {
    return { RspCode: '97', Message: 'Checksum failed' };
  }

  const orderCode = vnp_Params['vnp_TxnRef'];
  const responseCode = vnp_Params['vnp_ResponseCode'];
  const order = await Order.findOne({ orderCode });

  if (!order) {
    return { RspCode: '01', Message: 'Order not found' };
  }

  const vnpAmount = Number(vnp_Params['vnp_Amount']) / 100;
  if (Math.abs((order.pricing?.totalAmount || 0) - vnpAmount) > 1000) {
    return { RspCode: '04', Message: 'Amount invalid' };
  }

  if (order.paymentStatus === 'PAID') {
    return { RspCode: '02', Message: 'Order already confirmed' };
  }

  if (responseCode === '00') {
    order.paymentStatus = 'PAID';
    order.orderStatus = 'CONFIRMED';
    order.paymentDetails = {
      provider: 'VNPAY',
      transactionNo: vnp_Params['vnp_TransactionNo'] || '',
      bankCode: vnp_Params['vnp_BankCode'] || '',
      cardType: vnp_Params['vnp_CardType'] || '',
      payDate: vnp_Params['vnp_PayDate'],
      responseCode,
      status: 'SUCCESS',
      paidAt: new Date(),
    };
    order.statusHistory.push({
      status: 'CONFIRMED',
      note: `Thanh toán thành công qua VNPAY IPN (Mã GD: ${vnp_Params['vnp_TransactionNo'] || 'N/A'}).`,
      changedAt: new Date(),
    });
    await order.save();

    try {
      const emailService = require('./email.service');
      emailService.sendPaymentSuccessEmail(order, vnp_Params['vnp_TransactionNo'] || '').catch((e) =>
        console.warn('[VNPAY IPN] Lỗi gửi email thanh toán thành công:', e.message)
      );
    } catch (_) {}

    return { RspCode: '00', Message: 'Confirm Success' };
  } else {
    order.paymentStatus = 'FAILED';
    await order.save();
    return { RspCode: '00', Message: 'Confirm Success' };
  }
};

module.exports = {
  getPaymentMethods,
  buildOnepayPaymentUrl,
  createPayment,
  handleOnepayReturn,
  handleOnepayIPN,
  buildVnpayPaymentUrl,
  handleVnpayReturn,
  handleVnpayIPN,
  getPaymentStatus,
  handlePaymentWebhook,
  getOnepayResponseDescription,
  getVnpayResponseDescription,
};
