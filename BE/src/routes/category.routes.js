const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', categoryController.getCategories);
router.get('/admin', protect, authorize('admin'), categoryController.getCategoriesAdmin);
router.get('/:id', categoryController.getCategoryById);

router.post('/', protect, authorize('admin'), categoryController.createCategory);
router.put('/:id', protect, authorize('admin'), categoryController.updateCategory);
router.patch('/:id/status', protect, authorize('admin'), categoryController.toggleCategoryStatus);
router.delete('/bulk', protect, authorize('admin'), categoryController.deleteBulkCategories);
router.delete('/:id', protect, authorize('admin'), categoryController.deleteCategory);

module.exports = router;
