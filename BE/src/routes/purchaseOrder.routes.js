const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrder.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

router.get('/', protect, requirePermission('purchase_order.view'), purchaseOrderController.getPurchaseOrders);
router.get('/:id', protect, requirePermission('purchase_order.view'), purchaseOrderController.getPurchaseOrderById);
router.get('/:id/download-excel', protect, requirePermission('purchase_order.view'), purchaseOrderController.downloadExcelSlip);
router.get('/:id/preview-email', protect, requirePermission('purchase_order.view'), purchaseOrderController.previewPOEmail);

router.post('/', protect, requirePermission('purchase_order.create'), purchaseOrderController.createPurchaseOrder);
router.post('/preview-excel', protect, requirePermission('purchase_order.view'), purchaseOrderController.previewExcelSlip);
router.post('/:id/send-po', protect, requirePermission('purchase_order.manage'), purchaseOrderController.sendPOToSupplier);
router.patch('/:id/status', protect, requirePermission('purchase_order.manage'), purchaseOrderController.updatePurchaseOrderStatus);

module.exports = router;
