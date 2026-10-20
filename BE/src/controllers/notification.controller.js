const notificationService = require('../services/notification.service');

/**
 * GET /api/v1/notifications
 * Lấy danh sách thông báo
 */
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user?._id || null;
    const { page, limit, unreadOnly, recipient = 'admin', search } = req.query;

    const result = await notificationService.getNotifications({
      recipient,
      userId,
      page,
      limit,
      unreadOnly: unreadOnly === 'true',
      search,
    });

    res.json({
      success: true,
      data: result.data,
      unreadCount: result.unreadCount,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/notifications/unread-count
 * Đếm nhanh số lượng thông báo chưa đọc
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user?._id || null;
    const recipient = req.query.recipient || 'admin';
    const result = await notificationService.getUnreadCount(recipient, userId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/notifications/:id/read
 * Đánh dấu một thông báo đã đọc
 */
const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user?._id || null;
    const notification = await notificationService.markAsRead(req.params.id, userId);
    res.json({
      success: true,
      message: 'Đã đánh dấu thông báo là đã đọc',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/notifications/read-all
 * Đánh dấu tất cả thông báo là đã đọc
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user?._id || null;
    const recipient = req.body.recipient || 'admin';
    const result = await notificationService.markAllAsRead(recipient, userId);
    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/notifications/:id
 * Xóa một thông báo
 */
const deleteNotification = async (req, res, next) => {
  try {
    const result = await notificationService.deleteNotification(req.params.id);
    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/notifications/bulk-delete
 * Xóa nhiều thông báo đã chọn
 */
const deleteBulkNotifications = async (req, res, next) => {
  try {
    const { ids } = req.body;
    const result = await notificationService.deleteBulkNotifications(ids);
    res.json({
      success: true,
      deletedCount: result.deletedCount,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/notifications/seed-sample
 * Khởi tạo dữ liệu mẫu nếu chưa có thông báo nào
 */
const seedSampleNotifications = async (req, res, next) => {
  try {
    const samples = [
      {
        recipient: 'admin',
        type: 'ORDER_NEW',
        title: 'Đơn hàng mới #1002',
        message: 'Admin đã khởi tạo đơn hàng #1002 trị giá 5.000.000đ cho Khách lẻ qua Admin tại chi nhánh Cửa hàng chính.',
        link: '/orders',
        isRead: false,
      },
      {
        recipient: 'admin',
        type: 'ORDER_STATUS',
        title: 'Thanh toán thành công đơn #1001',
        message: 'Đơn hàng #1001 được thanh toán 5.000.000 VNĐ thành công bằng phương thức Thu hộ (COD).',
        link: '/orders',
        isRead: false,
      },
      {
        recipient: 'admin',
        type: 'ORDER_STATUS',
        title: 'Thanh toán thành công đơn #1000',
        message: 'Đơn hàng #1000 được thanh toán 2.450.000 VNĐ thành công bằng phương thức Chuyển khoản VietQR.',
        link: '/orders',
        isRead: true,
      },
      {
        recipient: 'admin',
        type: 'STOCK_LOW',
        title: 'Cảnh báo tồn kho thấp',
        message: 'Sản phẩm Áo Polo Cotton Cao Cấp (Đen / L) sắp hết hàng trong kho chính (tồn kho: 2 sản phẩm).',
        link: '/stock-alerts',
        isRead: false,
      },
    ];

    const Notification = require('../models/notification.model');
    const created = await Notification.insertMany(samples);

    res.json({
      success: true,
      message: `Đã khởi tạo thành công ${created.length} thông báo mẫu`,
      data: created,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteBulkNotifications,
  seedSampleNotifications,
};
