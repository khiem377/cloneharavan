const express = require('express');
const router = express.Router();
const {
  getProviders,
  connectProvider,
  toggleEnable,
  disconnectProvider,
  getActiveProvidersForCheckout,
  testProvider,
} = require('../controllers/paymentProvider.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public route cho trang Checkout người mua lấy danh sách phương thức thanh toán đã kích hoạt
router.get('/active', getActiveProvidersForCheckout);

// Private routes dành cho Admin quản trị kết nối cổng thanh toán
router.use(protect, authorize('admin'));

router.get('/list', getProviders);
router.post('/:code/connect', connectProvider);
router.patch('/:code/toggle', toggleEnable);
router.post('/:code/disconnect', disconnectProvider);
router.post('/:code/test', testProvider);

module.exports = router;
