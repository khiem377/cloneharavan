const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brand.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

router.get('/', brandController.getBrands);
router.get('/admin', protect, requirePermission('brand.view'), brandController.getBrandsAdmin);
router.get('/:id', brandController.getBrandById);

router.post('/', protect, requirePermission('brand.create'), brandController.createBrand);
router.put('/:id', protect, requirePermission('brand.edit'), brandController.updateBrand);
router.patch('/:id/status', protect, requirePermission('brand.edit'), brandController.toggleBrandStatus);
router.delete('/bulk', protect, requirePermission('brand.delete'), brandController.deleteBulkBrands);
router.delete('/:id', protect, requirePermission('brand.delete'), brandController.deleteBrand);

module.exports = router;
