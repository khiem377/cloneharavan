const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brand.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', brandController.getBrands);
router.get('/admin', protect, authorize('admin'), brandController.getBrandsAdmin);
router.get('/:id', brandController.getBrandById);

router.post('/', protect, authorize('admin'), brandController.createBrand);
router.put('/:id', protect, authorize('admin'), brandController.updateBrand);
router.patch('/:id/status', protect, authorize('admin'), brandController.toggleBrandStatus);
router.delete('/bulk', protect, authorize('admin'), brandController.deleteBulkBrands);
router.delete('/:id', protect, authorize('admin'), brandController.deleteBrand);

module.exports = router;
