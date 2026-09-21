const express = require('express');
const stockAlertController = require('../controllers/stockAlert.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

const router = express.Router();

router.use(protect);
router.get('/', requirePermission('stock_movement.view'), stockAlertController.getLowStockItems);
router.patch('/:id/cost-price', requirePermission('product.edit'), stockAlertController.updateCostPrice);

module.exports = router;
