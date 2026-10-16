const express = require('express');
const router = express.Router();
const stockTransferController = require('../controllers/stockTransfer.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

router.get('/', protect, requirePermission('purchase_order.view'), stockTransferController.getStockTransfers);
router.get('/:id', protect, requirePermission('purchase_order.view'), stockTransferController.getStockTransferById);
router.post('/', protect, requirePermission('purchase_order.manage'), stockTransferController.createStockTransfer);
router.patch('/:id/status', protect, requirePermission('purchase_order.manage'), stockTransferController.updateStatus);

module.exports = router;
