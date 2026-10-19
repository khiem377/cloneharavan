const express = require('express');
const router = express.Router();
const {
  getStoreSettings,
  getPublicStoreSettings,
  updateStoreSettings,
  getShippingProviders,
  connectShippingProvider,
  disconnectShippingProvider,
  testShippingProvider,
  setDefaultShippingProvider,
} = require('../controllers/storeSetting.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

// Public route cho Storefront (Header, Footer, Checkout public)
router.get('/public', getPublicStoreSettings);

// Private routes cho Admin quản trị
router.use(protect);

router.get('/', requirePermission(['setting.manage', 'setting.view']), getStoreSettings);
router.put('/:section', requirePermission('setting.manage'), updateStoreSettings);

// Quản lý Đối tác vận chuyển
router.get('/shipping-providers/list', requirePermission(['setting.manage', 'setting.view']), getShippingProviders);
router.post('/shipping-providers/:code/connect', requirePermission('setting.manage'), connectShippingProvider);
router.post('/shipping-providers/:code/disconnect', requirePermission('setting.manage'), disconnectShippingProvider);
router.post('/shipping-providers/:code/test', requirePermission('setting.manage'), testShippingProvider);
router.post('/shipping-providers/:code/default', requirePermission('setting.manage'), setDefaultShippingProvider);

module.exports = router;
