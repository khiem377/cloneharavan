const express = require('express');
const inventoryReportController = require('../controllers/inventoryReport.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

const router = express.Router();

router.use(protect);

router.get('/balance-report', requirePermission('stock_movement.view'), inventoryReportController.getBalanceReport);
router.get('/export-excel', requirePermission('stock_movement.view'), inventoryReportController.exportExcel);

module.exports = router;

