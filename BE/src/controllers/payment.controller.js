const paymentService = require('../services/payment.service');

/**
 * GET /api/v1/payments/methods
 * Lấy danh sách phương thức thanh toán khả dụng
 */
const getPaymentMethods = async (req, res, next) => {
  try {
    const methods = await paymentService.getPaymentMethods();
    res.json({
      success: true,
      data: methods,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/payments/create
 * Khởi tạo hoặc xác nhận thanh toán cho đơn hàng
 */
const createPayment = async (req, res, next) => {
  try {
    const result = await paymentService.createPayment(req.user._id, req.body);
    res.json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/payments/:id/status
 * Kiểm tra trạng thái thanh toán của một đơn hàng
 */
const getPaymentStatus = async (req, res, next) => {
  try {
    const result = await paymentService.getPaymentStatus(req.params.id, req.user._id);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/payments/webhook
 * Nhận kết quả thanh toán từ cổng thanh toán (IPN/Webhook)
 */
const handleWebhook = async (req, res, next) => {
  try {
    const result = await paymentService.handlePaymentWebhook(req.body, req.headers);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPaymentMethods,
  createPayment,
  getPaymentStatus,
  handleWebhook,
};
