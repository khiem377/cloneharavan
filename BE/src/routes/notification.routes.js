const express = require('express');
const router = express.Router();
const notificationCtrl = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');

// Mọi tác vụ thông báo yêu cầu đã đăng nhập
router.use(protect);

// 1. Lấy danh sách thông báo & Số lượng chưa đọc
router.get('/', notificationCtrl.getNotifications);
router.get('/unread-count', notificationCtrl.getUnreadCount);

// 2. Đánh dấu tất cả đã đọc
router.patch('/read-all', notificationCtrl.markAllAsRead);

// 3. Đánh dấu 1 thông báo đã đọc
router.patch('/:id/read', notificationCtrl.markAsRead);

// 4. Xóa nhiều thông báo (Bulk Delete)
router.post('/bulk-delete', notificationCtrl.deleteBulkNotifications);

// 5. Seed thông báo mẫu
router.post('/seed-sample', notificationCtrl.seedSampleNotifications);

// 6. Xóa 1 thông báo
router.delete('/:id', notificationCtrl.deleteNotification);

module.exports = router;
