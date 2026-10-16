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
} = require('../controllers/storeSetting.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public route cho Storefront (Header, Footer, Checkout public)
router.get('/public', getPublicStoreSettings);

// Private routes cho Admin quản trị
router.use(protect, authorize('admin'));

router.get('/', getStoreSettings);
router.put('/:section', updateStoreSettings);

// Quản lý Đối tác vận chuyển
router.get('/shipping-providers/list', getShippingProviders);
router.post('/shipping-providers/:code/connect', connectShippingProvider);
router.post('/shipping-providers/:code/disconnect', disconnectShippingProvider);
router.post('/shipping-providers/:code/test', testShippingProvider);

module.exports = router;
