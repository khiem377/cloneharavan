const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/comment.controller');
const { protect } = require('../middleware/auth.middleware');

// Public: Xem danh sách bình luận / đánh giá
router.get('/', ctrl.getComments);

// Protected: Kiểm tra quyền mua hàng trước khi comment
router.get('/check-purchase', protect, ctrl.checkPurchaseStatus);

// Protected: Tạo bình luận / đánh giá
router.post('/', protect, ctrl.createComment);

// Protected: Thả cảm xúc Facebook
router.post('/:id/reactions', protect, ctrl.toggleReaction);

// Protected: Xóa bình luận
router.delete('/:id', protect, ctrl.deleteComment);

module.exports = router;
