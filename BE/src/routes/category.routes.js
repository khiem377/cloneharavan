const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

router.get('/', categoryController.getCategories);
router.get('/admin', protect, requirePermission('category.view'), categoryController.getCategoriesAdmin);
router.get('/:id', categoryController.getCategoryById);

router.post('/', protect, requirePermission('category.create'), categoryController.createCategory);
router.put('/:id', protect, requirePermission('category.edit'), categoryController.updateCategory);
router.patch('/:id/status', protect, requirePermission('category.edit'), categoryController.toggleCategoryStatus);
router.delete('/bulk', protect, requirePermission('category.delete'), categoryController.deleteBulkCategories);
router.delete('/:id', protect, requirePermission('category.delete'), categoryController.deleteCategory);

module.exports = router;
