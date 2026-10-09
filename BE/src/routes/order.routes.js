const express = require('express');
const router = express.Router();
const orderCtrl = require('../controllers/order.controller');
const { protect } = require('../middleware/auth.middleware');

// 1. Đặt hàng thanh toán khi nhận hàng (COD) hoặc Mua Ngay - BẮT BUỘC ĐĂNG NHẬP
router.post('/checkout-cod', protect, orderCtrl.checkoutCOD);

// 2. Lấy danh sách đơn hàng của khách hàng hiện tại
router.get('/my-orders', protect, orderCtrl.getMyOrders);

// 3. Khách / Shop hủy đơn hàng (hoàn lại kho allocated)
router.patch('/:id/cancel', protect, orderCtrl.cancelOrder);

// 4. Lấy chi tiết đơn hàng (Snapshot bất biến)
router.get('/:id', protect, orderCtrl.getOrderById);

// 5. Admin: Lấy danh sách toàn bộ đơn hàng
router.get('/admin/all', protect, orderCtrl.getAllOrders);

// 6. Admin: Cập nhật trạng thái đơn hàng (CONFIRMED -> SHIPPING -> DELIVERED -> RETURNED)
router.patch('/admin/:id/status', protect, orderCtrl.updateOrderStatus);

module.exports = router;
