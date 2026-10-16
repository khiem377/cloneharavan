const express = require('express');
const router = express.Router();
const orderCtrl = require('../controllers/order.controller');
const { protect } = require('../middleware/auth.middleware');

// 0. Kiểm tra đơn hàng trước khi đặt (Preview Order)
router.post('/preview', protect, orderCtrl.previewOrder);

// 1. Tạo đơn hàng (Hỗ trợ chuẩn RESTful POST / và alias cũ POST /checkout-cod)
router.post('/', protect, orderCtrl.createOrder);
router.post('/checkout-cod', protect, orderCtrl.checkoutCOD);

// 2. Lấy danh sách lịch sử đơn hàng của khách (Hỗ trợ GET / và alias cũ GET /my-orders)
router.get('/', protect, orderCtrl.getMyOrders);
router.get('/my-orders', protect, orderCtrl.getMyOrders);

// 3. Admin: Lấy danh sách toàn bộ đơn hàng
router.get('/admin/all', protect, orderCtrl.getAllOrders);

// 4. Admin: Cập nhật trạng thái đơn hàng (CONFIRMED -> SHIPPING -> DELIVERED -> RETURNED)
router.patch('/admin/:id/status', protect, orderCtrl.updateOrderStatus);

// 5. Kiểm tra trạng thái đơn hàng nhanh (GET /:id/status)
router.get('/:id/status', protect, orderCtrl.getOrderStatus);

// 6. Khách / Shop hủy đơn hàng (Hỗ trợ cả POST /:id/cancel và PATCH /:id/cancel)
router.post('/:id/cancel', protect, orderCtrl.cancelOrder);
router.patch('/:id/cancel', protect, orderCtrl.cancelOrder);

// 7. Lấy chi tiết một đơn hàng (Snapshot bất biến)
router.get('/:id', protect, orderCtrl.getOrderById);

module.exports = router;
