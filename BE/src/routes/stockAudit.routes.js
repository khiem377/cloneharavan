const express = require('express');
const router = express.Router();
const stockAuditController = require('../controllers/stockAudit.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

router.get('/', protect, requirePermission('stock_audit.view'), stockAuditController.getStockAudits);
router.get('/:id', protect, requirePermission('stock_audit.view'), stockAuditController.getStockAuditById);
router.get('/:id/download-excel', protect, requirePermission('stock_audit.view'), stockAuditController.downloadExcelSlip);
router.post('/', protect, requirePermission('stock_audit.manage'), stockAuditController.createStockAudit);

module.exports = router;
