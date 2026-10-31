const orderService = require('../services/order.service');

/**
 * 0. Kiểm tra đơn hàng trước khi đặt (Preview Order)
 * POST /api/v1/orders/preview
 */
const previewOrder = async (req, res, next) => {
  try {
    const preview = await orderService.previewOrder(req.user._id, req.body);
    res.json({
      success: true,
      message: 'Kiểm tra thông tin đơn hàng thành công',
      data: preview,
    });
  } catch (error) {
    next(error);
  }
};


const createOrder = async (req, res, next) => {
  try {
    const idempotencyKey = req.headers['idempotency-key'] || req.body.idempotencyKey || null;
    const order = await orderService.createOrderCOD(req.user._id, {
      ...req.body,
      idempotencyKey,
    });

    let paymentUrl = null;
    const methodUpper = String(order.paymentMethod || '').toUpperCase();
    const paymentService = require('../services/payment.service');
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '127.0.0.1';

    if (methodUpper === 'ONEPAY') {
      paymentUrl = await paymentService.buildOnepayPaymentUrl(order, clientIp);
    } else if (methodUpper === 'VNPAY') {
      paymentUrl = await paymentService.buildVnpayPaymentUrl(order, clientIp);
    }

    const orderData = typeof order.toObject === 'function' ? order.toObject() : order;

    res.status(201).json({
      success: true,
      message: paymentUrl
        ? `Đơn hàng được khởi tạo thành công. Đang chuyển hướng sang cổng thanh toán ${methodUpper === 'VNPAY' ? 'VNPAY' : 'OnePay'}...`
        : 'Đặt hàng thành công! Đơn hàng đang được chuẩn bị',
      data: {
        ...orderData,
        paymentUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};


const cancelOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user?.role || 'user';
    const { reason } = req.body;
    const order = await orderService.cancelOrder(req.params.id, userId, reason, userRole);
    res.json({
      success: true,
      message: 'Đã hủy đơn hàng thành công, tồn kho giữ chỗ đã được hoàn lại',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Lấy chi tiết đơn hàng (Snapshot bất biến)
 * GET /api/v1/orders/:id
 */
const getOrderById = async (req, res, next) => {
  try {
    const userId = req.user?._id || null;
    const userRole = req.user?.role || 'guest';
    const order = await orderService.getOrderById(req.params.id, userId, userRole);
    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Kiểm tra trạng thái đơn hàng nhanh
 * GET /api/v1/orders/:id/status
 */
const getOrderStatus = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user?.role || 'user';
    const statusData = await orderService.getOrderStatus(req.params.id, userId, userRole);
    res.json({
      success: true,
      data: statusData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Lấy danh sách đơn hàng của người dùng hiện tại
 * GET /api/v1/orders
 * GET /api/v1/orders/my-orders (alias)
 */
const getMyOrders = async (req, res, next) => {
  try {
    const result = await orderService.getMyOrders(req.user._id, req.query);
    res.json({
      success: true,
      data: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 6. Lấy danh sách toàn bộ đơn hàng (Dành cho Admin)
 * GET /api/v1/orders/admin/all
 */
const getAllOrders = async (req, res, next) => {
  try {
    const result = await orderService.getAllOrders(req.query);
    res.json({
      success: true,
      data: result.orders,
      pagination: result.pagination,
      stats: result.stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 7. Admin cập nhật trạng thái đơn hàng (Điều phối kho nội bộ)
 * PATCH /api/v1/orders/admin/:id/status
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, {
      newStatus: status,
      note,
      adminUser: req.user,
    });
    res.json({
      success: true,
      message: `Cập nhật trạng thái đơn hàng sang ${status} thành công`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 8. Lấy số lượng đơn hàng đang chờ duyệt (Dành cho Admin Badge)
 * GET /api/v1/orders/admin/pending-count
 */
const getPendingOrdersCount = async (req, res, next) => {
  try {
    const count = await orderService.getPendingOrdersCount();
    res.json({
      success: true,
      data: { pendingCount: count },
    });
  } catch (error) {
    next(error);
  }
};

const getOrderByIdForAdmin = async (req, res, next) => {
  try {
    const order = await orderService.getOrderByIdForAdmin(req.params.id);
    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  previewOrder,
  createOrder,
  checkoutCOD: createOrder,
  cancelOrder,
  getOrderById,
  getOrderByIdForAdmin,
  getOrderStatus,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getPendingOrdersCount,
};

