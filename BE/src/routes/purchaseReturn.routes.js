const express = require('express');
const purchaseReturnController = require('../controllers/purchaseReturn.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

const router = express.Router();

router.use(protect);

router.get('/', requirePermission('purchase_order.view'), purchaseReturnController.getPurchaseReturns);
router.post('/', requirePermission('purchase_order.create'), purchaseReturnController.createPurchaseReturn);

router.get('/:id', requirePermission('purchase_order.view'), purchaseReturnController.getPurchaseReturnById);
router.patch('/:id/refund-status', requirePermission('purchase_order.manage'), purchaseReturnController.updateRefundStatus);
router.get('/:id/download-excel', requirePermission('purchase_order.view'), purchaseReturnController.downloadExcelSlip);

module.exports = router;
