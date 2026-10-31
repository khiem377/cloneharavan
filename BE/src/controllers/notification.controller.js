const catchAsync = require('../utils/catchAsync');
const notificationService = require('../services/notification.service');

/**
 * GET /api/v1/notifications
 * Lấy danh sách thông báo phân trang (Khách hàng chỉ xem thông báo của mình, Admin/Staff xem toàn bộ theo recipient)
 */
const getNotifications = catchAsync(async (req, res) => {
  const userId = req.user?._id || null;
  const userRole = String(req.user?.role || '').toLowerCase();
  const isStaffOrAdmin = userRole !== 'user' && userRole !== 'guest' && userRole !== '';

  const { page, limit, unreadOnly, isRead, type, search } = req.query;
  const recipient = isStaffOrAdmin ? (req.query.recipient || 'admin') : userId.toString();

  const result = await notificationService.getNotifications({
    recipient,
    userId,
    page,
    limit,
    unreadOnly: unreadOnly === 'true',
    isRead,
    type,
    search,
  });

  res.status(200).json({
    success: true,
    data: result.data,
    unreadCount: result.unreadCount,
    stats: result.stats,
    pagination: result.pagination,
  });
});

/**
 * GET /api/v1/notifications/unread-count
 * Đếm nhanh số lượng thông báo chưa đọc
 */
const getUnreadCount = catchAsync(async (req, res) => {
  const userId = req.user?._id || null;
  const userRole = String(req.user?.role || '').toLowerCase();
  const isStaffOrAdmin = userRole !== 'user' && userRole !== 'guest' && userRole !== '';
  const recipient = isStaffOrAdmin ? (req.query.recipient || 'admin') : userId.toString();

  const result = await notificationService.getUnreadCount(recipient, userId);
  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * PATCH /api/v1/notifications/:id/read
 * Đánh dấu một thông báo đã đọc
 */
const markAsRead = catchAsync(async (req, res) => {
  const userId = req.user?._id || null;
  const notification = await notificationService.markAsRead(req.params.id, userId);
  res.status(200).json({
    success: true,
    message: 'Đã đánh dấu thông báo là đã đọc',
    data: notification,
  });
});

/**
 * PATCH /api/v1/notifications/read-all
 * Đánh dấu tất cả thông báo là đã đọc
 */
const markAllAsRead = catchAsync(async (req, res) => {
  const userId = req.user?._id || null;
  const userRole = String(req.user?.role || '').toLowerCase();
  const isStaffOrAdmin = userRole !== 'user' && userRole !== 'guest' && userRole !== '';
  const recipient = isStaffOrAdmin ? (req.body.recipient || 'admin') : userId.toString();

  const result = await notificationService.markAllAsRead(recipient, userId);
  res.status(200).json({
    success: true,
    message: result.message,
  });
});

/**
 * DELETE /api/v1/notifications/:id
 * Xóa một thông báo (Kiểm tra quyền sở hữu đối với người dùng thông thường)
 */
const deleteNotification = catchAsync(async (req, res) => {
  const result = await notificationService.deleteNotification(req.params.id, req.user);
  res.status(200).json({
    success: true,
    message: result.message,
  });
});

/**
 * POST /api/v1/notifications/bulk-delete
 * Xóa nhiều thông báo đã chọn
 */
const deleteBulkNotifications = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await notificationService.deleteBulkNotifications(ids);
  res.status(200).json({
    success: true,
    deletedCount: result.deletedCount,
    message: result.message,
  });
});

/**
 * POST /api/v1/notifications/seed-sample
 * Khởi tạo dữ liệu mẫu nếu chưa có thông báo nào
 */
const seedSampleNotifications = catchAsync(async (req, res) => {
  const created = await notificationService.seedSampleNotifications();
  res.status(200).json({
    success: true,
    message: `Đã khởi tạo thành công ${created.length} thông báo mẫu`,
    data: created,
  });
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteBulkNotifications,
  seedSampleNotifications,
};
