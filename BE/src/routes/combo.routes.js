const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/combo.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

router.get('/', ctrl.getCombos);
router.get('/ai-suggest-bundles', protect, ctrl.aiSuggestBundles);
router.get('/:id', ctrl.getComboById);

router.post('/ai-suggest-pricing', protect, ctrl.aiSuggestPricing);
router.post('/', protect, requirePermission('promotion.manage'), ctrl.createCombo);
router.put('/:id', protect, requirePermission('promotion.manage'), ctrl.updateCombo);
router.patch('/:id/toggle-status', protect, requirePermission('promotion.manage'), ctrl.toggleComboStatus);
router.delete('/:id', protect, requirePermission('promotion.manage'), ctrl.deleteCombo);

module.exports = router;
