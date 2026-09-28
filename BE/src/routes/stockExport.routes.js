const express = require('express');
const router = express.Router();
const stockExportController = require('../controllers/stockExport.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

router.get('/', protect, requirePermission('stock_export.view'), stockExportController.getStockExports);
router.get('/:id', protect, requirePermission('stock_export.view'), stockExportController.getStockExportById);
router.get('/:id/download-excel', protect, requirePermission('stock_export.view'), stockExportController.downloadExcelSlip);
router.post('/', protect, requirePermission('stock_export.manage'), stockExportController.createStockExport);
router.patch('/:id/status', protect, requirePermission('stock_export.manage'), stockExportController.updateStatus);

module.exports = router;
