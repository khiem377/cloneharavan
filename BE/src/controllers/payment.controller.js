const catchAsync = require('../utils/catchAsync');
const paymentService = require('../services/payment.service');

/**
 * GET /api/v1/payments/methods
 * Lấy danh sách phương thức thanh toán khả dụng
 */
const getPaymentMethods = catchAsync(async (req, res) => {
  const methods = await paymentService.getPaymentMethods();
  res.status(200).json({
    success: true,
    data: methods,
  });
});

/**
 * POST /api/v1/payments/create
 * Khởi tạo hoặc xác nhận thanh toán cho đơn hàng
 */
const createPayment = catchAsync(async (req, res) => {
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '127.0.0.1';
  const result = await paymentService.createPayment(req.user?._id, {
    ...req.body,
    clientIp,
  });
  res.status(200).json({
    success: true,
    message: result.message,
    data: result,
  });
});

/**
 * GET /api/v1/payments/:id/status
 * Kiểm tra trạng thái thanh toán của một đơn hàng
 */
const getPaymentStatus = catchAsync(async (req, res) => {
  const result = await paymentService.getPaymentStatus(req.params.id, req.user);
  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * GET /api/v1/payments/onepay/return
 * Nhận kết quả điều hướng (redirect) sau khi khách thanh toán qua OnePay Sandbox / Production
 */
const handleOnepayReturn = catchAsync(async (req, res) => {
  const redirectUrl = await paymentService.handleOnepayReturn(req.query);
  res.redirect(redirectUrl);
});

/**
 * GET/POST /api/v1/payments/onepay/ipn
 * Nhận tín hiệu IPN (Server-to-Server) tức thì từ OnePay
 */
const handleOnepayIPN = catchAsync(async (req, res) => {
  const params = req.method === 'GET' ? req.query : req.body;
  const result = await paymentService.handleOnepayIPN(params);
  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(result);
});

/**
 * GET /api/v1/payments/vnpay/return
 * Nhận kết quả điều hướng (redirect) sau khi khách thanh toán qua VNPAY Sandbox / Production
 */
const handleVnpayReturn = catchAsync(async (req, res) => {
  const redirectUrl = await paymentService.handleVnpayReturn(req.query);
  res.redirect(redirectUrl);
});

/**
 * GET/POST /api/v1/payments/vnpay/ipn
 * Nhận tín hiệu IPN (Server-to-Server) từ VNPAY
 */
const handleVnpayIPN = catchAsync(async (req, res) => {
  const params = req.method === 'GET' ? req.query : req.body;
  const result = await paymentService.handleVnpayIPN(params);
  res.status(200).json(result);
});

/**
 * POST /api/v1/payments/webhook
 * Nhận kết quả thanh toán từ cổng thanh toán (IPN/Webhook chung)
 */
const handleWebhook = catchAsync(async (req, res) => {
  const result = await paymentService.handlePaymentWebhook(req.body, req.headers);
  res.status(200).json(result);
});

module.exports = {
  getPaymentMethods,
  createPayment,
  getPaymentStatus,
  handleOnepayReturn,
  handleOnepayIPN,
  handleVnpayReturn,
  handleVnpayIPN,
  handleWebhook,
};
