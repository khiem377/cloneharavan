const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

router.get('/', protect, requirePermission('supplier.view'), supplierController.getSuppliers);
router.get('/:id', protect, requirePermission('supplier.view'), supplierController.getSupplierById);
router.post('/', protect, requirePermission('supplier.manage'), supplierController.createSupplier);
router.put('/:id', protect, requirePermission('supplier.manage'), supplierController.updateSupplier);
router.delete('/:id', protect, requirePermission('supplier.manage'), supplierController.deleteSupplier);

module.exports = router;
