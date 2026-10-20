const Notification = require('../models/notification.model');
const { emitToAdmin } = require('../config/socket');
const { AppError } = require('../utils/AppError');

/**
 * 1. Tạo thông báo mới + Bắn Socket Realtime tới Admin
 */
const createNotification = async ({
  recipient = 'admin',
  type = 'ORDER_NEW',
  title,
  message,
  link = '',
  metadata = {},
}) => {
  if (!title || !message) {
    throw new AppError('Tiêu đề và nội dung thông báo là bắt buộc', 400);
  }

  const notification = await Notification.create({
    recipient,
    type,
    title,
    message,
    link,
    metadata,
  });

  // Bắn Socket Realtime cho Admin đang trực Dashboard
  if (recipient === 'admin') {
    try {
      emitToAdmin('notification:new', {
        _id: notification._id,
        recipient: notification.recipient,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        metadata: notification.metadata,
        createdAt: notification.createdAt,
        isRead: false,
      });
    } catch (sockErr) {
      console.warn('[Notification Service] Lỗi emit socket notification:', sockErr.message);
    }
  }

  return notification;
};

/**
 * 2. Lấy danh sách thông báo phân trang (Mặc định cho Admin)
 */
const getNotifications = async ({
  recipient = 'admin',
  userId = null,
  page = 1,
  limit = 20,
  unreadOnly = false,
  search = '',
}) => {
  const query = { recipient };

  if (search && typeof search === 'string' && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { title: { $regex: escaped, $options: 'i' } },
      { message: { $regex: escaped, $options: 'i' } },
    ];
  }

  if (unreadOnly) {
    if (userId) {
      query.readBy = { $ne: userId };
    } else {
      query.isRead = false;
    }
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [list, total, unreadCount] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    Notification.countDocuments(query),
    userId
      ? Notification.countDocuments({ recipient, readBy: { $ne: userId } })
      : Notification.countDocuments({ recipient, isRead: false }),
  ]);

  // Format trường isRead theo góc nhìn của nhân viên đang xem
  const formattedList = list.map((item) => {
    const isReadByUser = userId
      ? Array.isArray(item.readBy) && item.readBy.some((id) => id.toString() === userId.toString())
      : item.isRead;
    return {
      ...item,
      isRead: isReadByUser,
    };
  });

  return {
    data: formattedList,
    unreadCount,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

/**
 * 3. Đánh dấu một thông báo đã đọc
 */
const markAsRead = async (notificationId, userId = null) => {
  const update = { isRead: true };
  if (userId) {
    update.$addToSet = { readBy: userId };
  }

  const notification = await Notification.findByIdAndUpdate(notificationId, update, { new: true });
  if (!notification) {
    throw new AppError('Không tìm thấy thông báo', 404);
  }
  return notification;
};

/**
 * 4. Đánh dấu tất cả thông báo là đã đọc
 */
const markAllAsRead = async (recipient = 'admin', userId = null) => {
  const filter = { recipient };
  const update = { isRead: true };
  if (userId) {
    update.$addToSet = { readBy: userId };
  }

  await Notification.updateMany(filter, update);
  return { success: true, message: 'Đã đánh dấu tất cả thông báo là đã đọc' };
};

/**
 * 5. Lấy số lượng thông báo chưa đọc nhanh (Quick unread counter)
 */
const getUnreadCount = async (recipient = 'admin', userId = null) => {
  const filter = { recipient };
  if (userId) {
    filter.readBy = { $ne: userId };
  } else {
    filter.isRead = false;
  }
  const count = await Notification.countDocuments(filter);
  return { unreadCount: count };
};

/**
 * 6. Xóa 1 thông báo
 */
const deleteNotification = async (notificationId) => {
  const result = await Notification.findByIdAndDelete(notificationId);
  if (!result) {
    throw new AppError('Không tìm thấy thông báo cần xóa', 404);
  }
  return { success: true, message: 'Đã xóa thông báo thành công' };
};

/**
 * 7. Xóa nhiều thông báo (Bulk Delete)
 */
const deleteBulkNotifications = async (ids = []) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError('Danh sách mã thông báo không hợp lệ', 400);
  }
  const result = await Notification.deleteMany({ _id: { $in: ids } });
  return {
    success: true,
    deletedCount: result.deletedCount,
    message: `Đã xóa thành công ${result.deletedCount} thông báo`,
  };
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
  deleteBulkNotifications,
};
