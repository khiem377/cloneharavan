const express = require('express');
const router = express.Router();
const paymentCtrl = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

// 1. Lấy danh sách phương thức thanh toán
router.get('/methods', paymentCtrl.getPaymentMethods);

// 2. Nhận kết quả điều hướng (Return URL) từ OnePay Sandbox / Production (Public)
router.get('/onepay/return', paymentCtrl.handleOnepayReturn);

// 3. Nhận tín hiệu IPN (Server-to-Server) từ OnePay (Public)
router.get('/onepay/ipn', paymentCtrl.handleOnepayIPN);
router.post('/onepay/ipn', paymentCtrl.handleOnepayIPN);

// 4. Nhận kết quả điều hướng (Return URL) từ VNPAY Sandbox / Production (Public)
router.get('/vnpay/return', paymentCtrl.handleVnpayReturn);

// 5. Nhận tín hiệu IPN (Server-to-Server) từ VNPAY (Public)
router.get('/vnpay/ipn', paymentCtrl.handleVnpayIPN);
router.post('/vnpay/ipn', paymentCtrl.handleVnpayIPN);

// 4. Khởi tạo / xác nhận thanh toán cho đơn hàng
router.post('/create', protect, paymentCtrl.createPayment);

// 5. Nhận kết quả thanh toán từ cổng thanh toán (Webhook / IPN chung)
router.post('/webhook', paymentCtrl.handleWebhook);

// 6. Kiểm tra trạng thái thanh toán của đơn hàng
router.get('/:id/status', protect, paymentCtrl.getPaymentStatus);

module.exports = router;
