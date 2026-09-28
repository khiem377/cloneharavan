const express = require('express');
const stockReceivingController = require('../controllers/stockReceiving.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

const router = express.Router();

router.use(protect);

router.post('/', requirePermission('purchase_order.manage'), stockReceivingController.createReceiving);
router.post('/sync-from-pos', requirePermission('purchase_order.manage'), stockReceivingController.syncFromPOs);
router.get('/', requirePermission('purchase_order.view'), stockReceivingController.getReceivings);
router.get('/:id/download-excel', requirePermission('purchase_order.view'), stockReceivingController.downloadExcelSlip);
router.get('/:id', requirePermission('purchase_order.view'), stockReceivingController.getReceivingById);

module.exports = router;
