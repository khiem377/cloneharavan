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
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

// Public route cho trang Checkout người mua lấy danh sách phương thức thanh toán đã kích hoạt
router.get('/active', getActiveProvidersForCheckout);

// Private routes dành cho Admin quản trị kết nối cổng thanh toán
router.use(protect);

router.get('/list', requirePermission(['setting.manage', 'setting.view']), getProviders);
router.post('/:code/connect', requirePermission('setting.manage'), connectProvider);
router.patch('/:code/toggle', requirePermission('setting.manage'), toggleEnable);
router.post('/:code/disconnect', requirePermission('setting.manage'), disconnectProvider);
router.post('/:code/test', requirePermission('setting.manage'), testProvider);

module.exports = router;
