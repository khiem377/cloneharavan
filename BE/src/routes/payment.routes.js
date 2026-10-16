const express = require('express');
const router = express.Router();
const paymentCtrl = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

// 1. Lấy danh sách phương thức thanh toán
router.get('/methods', paymentCtrl.getPaymentMethods);

// 2. Khởi tạo / xác nhận thanh toán cho đơn hàng
router.post('/create', protect, paymentCtrl.createPayment);

// 3. Nhận kết quả thanh toán từ cổng thanh toán (Webhook / IPN)
router.post('/webhook', paymentCtrl.handleWebhook);

// 4. Kiểm tra trạng thái thanh toán của đơn hàng
router.get('/:id/status', protect, paymentCtrl.getPaymentStatus);

module.exports = router;
