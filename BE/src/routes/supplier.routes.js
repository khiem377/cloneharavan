const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier.controller');
const supplierDebtController = require('../controllers/supplierDebt.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

// Basic CRUD
router.get('/', protect, requirePermission('supplier.view'), supplierController.getSuppliers);
router.post('/sync-debts', protect, requirePermission('supplier.manage'), supplierDebtController.syncAllExistingOrders);
router.get('/staff-options', protect, requirePermission('supplier.view'), supplierController.getStaffOptions);
router.get('/:id', protect, requirePermission('supplier.view'), supplierController.getSupplierById);
router.post('/', protect, requirePermission('supplier.manage'), supplierController.createSupplier);
router.put('/:id', protect, requirePermission('supplier.manage'), supplierController.updateSupplier);
router.delete('/:id', protect, requirePermission('supplier.manage'), supplierController.deleteSupplier);

// Công nợ & Lịch sử dòng tiền (Pancake POS style)
router.get('/:supplierId/debts', protect, requirePermission('supplier.view'), supplierDebtController.getSupplierDebts);
router.post('/:supplierId/debts', protect, requirePermission('supplier.manage'), supplierDebtController.createManualDebt);
router.post('/:supplierId/debts/:debtId/pay', protect, requirePermission('supplier.manage'), supplierDebtController.payDebt);
router.post('/:supplierId/debts/offset', protect, requirePermission('supplier.manage'), supplierDebtController.offsetDebts);
router.get('/:supplierId/debt-history', protect, requirePermission('supplier.view'), supplierDebtController.getDebtHistory);

// Tổng hợp hoạt động NCC: chỉ số theo kỳ + lịch sử đơn nhập/đơn trả
router.get('/:supplierId/activity', protect, requirePermission('supplier.view'), supplierController.getSupplierActivity);

module.exports = router;
