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

/**
 * 1. Đặt hàng thanh toán khi nhận hàng (COD) hoặc Mua Ngay
 * POST /api/v1/orders
 * POST /api/v1/orders/checkout-cod (alias)
 */
const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrderCOD(req.user._id, req.body);
    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công! Đơn hàng đang được chuẩn bị',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Khách / Shop hủy đơn hàng
 * POST /api/v1/orders/:id/cancel
 * PATCH /api/v1/orders/:id/cancel (alias)
 */
const cancelOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { reason } = req.body;
    const order = await orderService.cancelOrder(req.params.id, userId, reason);
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
    const userId = req.user._id;
    const order = await orderService.getOrderById(req.params.id, userId);
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
    const statusData = await orderService.getOrderStatus(req.params.id, userId);
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

module.exports = {
  previewOrder,
  createOrder,
  checkoutCOD: createOrder, // alias giữ tương thích ngược
  cancelOrder,
  getOrderById,
  getOrderStatus,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};
