const express = require('express');
const router = express.Router();
const cartCtrl = require('../controllers/cart.controller');
const { cartSession } = require('../middleware/cartSession.middleware');
const { protect } = require('../middleware/auth.middleware');

// Mọi route giỏ hàng đều đi qua middleware cartSession để tự nhận diện User hoặc Guest
router.use(cartSession);

// 1. Lấy thông tin giỏ hàng hiện tại (Re-validate tồn kho và giá tự động)
router.get('/', cartCtrl.getCart);

// 2. Thêm sản phẩm vào giỏ (theo SKU hoặc productId / variantId)
router.post('/items', cartCtrl.addToCart);

// 3. Cập nhật số lượng của một dòng sản phẩm
router.patch('/items/:itemId', cartCtrl.updateCartItemQuantity);

// 4. Xóa một sản phẩm khỏi giỏ
router.delete('/items/:itemId', cartCtrl.removeCartItem);

// 5. Xóa sạch giỏ hàng
router.delete('/', cartCtrl.clearCart);

// 6. Áp dụng mã giảm giá Coupon
router.post('/apply-coupon', cartCtrl.applyCoupon);

// 7. Gỡ mã giảm giá Coupon
router.delete('/remove-coupon', cartCtrl.removeCoupon);

// 8. Hợp nhất giỏ hàng của Guest khi User đăng nhập thành công
router.post('/merge', protect, cartCtrl.mergeGuestCart);

// 9. Kiểm tra tính hợp lệ của giỏ hàng trước khi sang màn hình thanh toán
router.post('/validate-checkout', cartCtrl.validateCheckout);

module.exports = router;
