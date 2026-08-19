const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const productVariantController = require('../controllers/productVariant.controller');
const { downloadTemplate, exportProductsCtrl, importProductsCtrl, syncImagesCtrl } = require('../controllers/product.import.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/template',    protect, authorize('admin'), downloadTemplate);
router.get('/export',      protect, authorize('admin'), exportProductsCtrl);
router.post('/import',     protect, authorize('admin'), importProductsCtrl);
router.post('/sync-images',protect, authorize('admin'), syncImagesCtrl);

router.get('/',         productController.getProducts);
router.get('/admin',    protect, authorize('admin'), productController.getProductsAdmin);
router.post('/compare', productController.getProductsToCompare);

router.get('/:id/deals',    productController.getProductDeals);
router.get('/:id',          productController.getProductById);

router.post('/',            protect, authorize('admin'), productController.createProduct);
router.put('/:id',          protect, authorize('admin'), productController.updateProduct);
router.patch('/:id/status', protect, authorize('admin'), productController.toggleProductStatus);
router.delete('/bulk',      protect, authorize('admin'), productController.deleteBulkProducts);
router.delete('/:id',       protect, authorize('admin'), productController.deleteProduct);

router.get('/:productId/variants',        productVariantController.getVariants);
router.post('/:productId/variants',       protect, authorize('admin'), productVariantController.createVariant);
router.post('/:productId/variants/bulk',  protect, authorize('admin'), productVariantController.bulkCreateVariants);
router.delete('/:productId/variants/all', protect, authorize('admin'), productVariantController.deleteVariantsByProduct);

module.exports = router;
