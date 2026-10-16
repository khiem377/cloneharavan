const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouse.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

router.get('/', protect, requirePermission('purchase_order.view'), warehouseController.getWarehouses);
router.get('/staff-candidates', protect, requirePermission('purchase_order.view'), warehouseController.getStaffCandidates);
router.get('/:id', protect, requirePermission('purchase_order.view'), warehouseController.getWarehouseById);
router.get('/:id/inventory', protect, requirePermission('purchase_order.view'), warehouseController.getWarehouseInventory);

router.post('/', protect, requirePermission('purchase_order.manage'), warehouseController.createWarehouse);
router.put('/:id', protect, requirePermission('purchase_order.manage'), warehouseController.updateWarehouse);
router.patch('/:id/set-default', protect, requirePermission('purchase_order.manage'), warehouseController.setDefault);
router.delete('/:id', protect, requirePermission('purchase_order.manage'), warehouseController.deleteWarehouse);

module.exports = router;
