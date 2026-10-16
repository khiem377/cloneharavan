const Order = require('../models/order.model');
const { AppError } = require('../utils/AppError');

/**
 * 1. Danh sách phương thức thanh toán khả dụng
 * Hiện tại hỗ trợ COD (tiền mặt khi nhận hàng) làm nền tảng
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
  ];
};

/**
 * 2. Khởi tạo thanh toán cho đơn hàng
 * - Đối với COD: Xác nhận đơn hàng tồn tại, thuộc quyền của khách, đang PENDING
 * - TUYỆT ĐỐI KHÔNG đánh dấu là đã thanh toán (paymentStatus vẫn giữ UNPAID)
 * - Không tạo đơn trùng lặp
 */
const createPayment = async (userId, { orderId, paymentMethod = 'COD' } = {}) => {
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

  if (targetMethod !== 'COD') {
    throw new AppError(`Phương thức thanh toán "${targetMethod}" hiện chưa được kích hoạt. Vui lòng chọn COD.`, 400);
  }

  // Cập nhật paymentMethod nếu trước đó chưa gán
  if (order.paymentMethod !== 'COD') {
    order.paymentMethod = 'COD';
    await order.save();
  }

  return {
    orderId: order._id,
    orderCode: order.orderCode,
    paymentMethod: 'COD',
    paymentStatus: order.paymentStatus || 'UNPAID', // Giữ nguyên UNPAID cho COD
    totalAmount: order.pricing?.totalAmount || 0,
    requiresAction: false,
    message: 'Đơn hàng được xác nhận thanh toán khi nhận hàng (COD). Vui lòng chuẩn bị tiền mặt khi shipper giao hàng.',
  };
};

/**
 * 3. Kiểm tra trạng thái thanh toán của một đơn hàng
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
    orderStatus: order.orderStatus,
    totalAmount: order.pricing?.totalAmount || 0,
    paidAt: order.paymentStatus === 'PAID' ? order.updatedAt : null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

/**
 * 4. Xử lý webhook từ cổng thanh toán (Stub sẵn sàng cho tương lai khi tích hợp VNPay/MoMo/VietQR)
 */
const handlePaymentWebhook = async (payload = {}, headers = {}) => {
  console.log('[Payment Webhook] Nhận tín hiệu IPN/Webhook:', { payload, headers });
  return {
    success: true,
    message: 'Webhook received successfully',
  };
};

module.exports = {
  getPaymentMethods,
  createPayment,
  getPaymentStatus,
  handlePaymentWebhook,
};
