/**
 * Cart Routes
 *
 * GET    /api/v1/cart              — Lấy giỏ hàng hiện tại (Guest hoặc User)
 * POST   /api/v1/cart/items        — Thêm sản phẩm vào giỏ
 * PATCH  /api/v1/cart/items/:id    — Cập nhật số lượng
 * DELETE /api/v1/cart/items/:id    — Xóa một sản phẩm
 * DELETE /api/v1/cart              — Xóa toàn bộ giỏ hàng
 * POST   /api/v1/cart/merge        — Merge Guest Cart → User Cart (yêu cầu đăng nhập)
 * POST   /api/v1/cart/validate     — Validate Cart trước Checkout
 */

const express = require('express');
const router  = express.Router();

const {
  protect,
  optionalAuth,
} = require('../middleware/auth.middleware');

const {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  mergeCart,
  validateCart,
} = require('../controllers/cart.controller');

// ─── Routes ───────────────────────────────────────────────────────────────────

// Guest + User: đọc giỏ hàng
router.get('/', optionalAuth, getCart);

// Guest + User: thêm sản phẩm
router.post('/items', optionalAuth, addItem);

// Guest + User: cập nhật số lượng
router.patch('/items/:itemId', optionalAuth, updateItem);

// Guest + User: xóa một sản phẩm
router.delete('/items/:itemId', optionalAuth, removeItem);

// Guest + User: xóa toàn bộ giỏ hàng
router.delete('/', optionalAuth, clearCart);

// Chỉ User đã đăng nhập: merge Guest Cart → User Cart
// Thường gọi ngay sau khi login/register thành công
router.post('/merge', protect, mergeCart);

// Guest + User: validate trước Checkout
router.post('/validate', optionalAuth, validateCart);

module.exports = router;
