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
  getNotificationTemplates,
  getTemplateDetail,
  saveCustomTemplate,
  resetCustomTemplate,
  previewNotificationTemplate,
  sendTestNotificationEmail,
  updateNotificationSettings,
  updateSmtpConfig,
  testSmtpConfig,
} = require('../controllers/storeSetting.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

// Public route cho Storefront (Header, Footer, Checkout public)
router.get('/public', getPublicStoreSettings);

// Private routes cho Admin quản trị
router.use(protect);

// Quản lý Mẫu thông báo & Email Branding & Template Editor & SMTP
router.get('/notifications/templates', requirePermission(['setting.manage', 'setting.view']), getNotificationTemplates);
router.get('/notifications/templates/:templateId', requirePermission(['setting.manage', 'setting.view']), getTemplateDetail);
router.put('/notifications/templates/:templateId', requirePermission('setting.manage'), saveCustomTemplate);
router.post('/notifications/templates/:templateId/reset', requirePermission('setting.manage'), resetCustomTemplate);
router.get('/notifications/preview/:templateId', requirePermission(['setting.manage', 'setting.view']), previewNotificationTemplate);
router.post('/notifications/preview/:templateId', requirePermission(['setting.manage', 'setting.view']), previewNotificationTemplate);
router.post('/notifications/send-test', requirePermission('setting.manage'), sendTestNotificationEmail);
router.put('/notifications/update', requirePermission('setting.manage'), updateNotificationSettings);
router.put('/notifications/smtp', requirePermission('setting.manage'), updateSmtpConfig);
router.post('/notifications/smtp/test', requirePermission('setting.manage'), testSmtpConfig);

router.get('/', requirePermission(['setting.manage', 'setting.view']), getStoreSettings);
router.put('/:section', requirePermission('setting.manage'), updateStoreSettings);

// Quản lý Đối tác vận chuyển
router.get('/shipping-providers/list', requirePermission(['setting.manage', 'setting.view']), getShippingProviders);
router.post('/shipping-providers/:code/connect', requirePermission('setting.manage'), connectShippingProvider);
router.post('/shipping-providers/:code/disconnect', requirePermission('setting.manage'), disconnectShippingProvider);
router.post('/shipping-providers/:code/test', requirePermission('setting.manage'), testShippingProvider);
router.post('/shipping-providers/:code/default', requirePermission('setting.manage'), setDefaultShippingProvider);

module.exports = router;
