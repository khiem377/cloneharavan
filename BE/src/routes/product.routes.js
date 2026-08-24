const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const productVariantController = require('../controllers/productVariant.controller');
const { downloadTemplate, exportProductsCtrl, importProductsCtrl, syncImagesCtrl } = require('../controllers/product.import.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

router.get('/template',    protect, requirePermission('product.import'), downloadTemplate);
router.get('/export',      protect, requirePermission('product.import'), exportProductsCtrl);
router.post('/import',     protect, requirePermission('product.import'), importProductsCtrl);
router.post('/sync-images',protect, requirePermission('product.sync_images'), syncImagesCtrl);

router.get('/',         productController.getProducts);
router.get('/admin',    protect, requirePermission('product.view'), productController.getProductsAdmin);
router.post('/compare', productController.getProductsToCompare);

router.get('/:id/deals',    productController.getProductDeals);
router.get('/:id',          productController.getProductById);

router.post('/',            protect, requirePermission('product.create'), productController.createProduct);
router.put('/:id',          protect, requirePermission('product.edit'), productController.updateProduct);
router.patch('/:id/status', protect, requirePermission('product.edit'), productController.toggleProductStatus);
router.delete('/bulk',      protect, requirePermission('product.delete'), productController.deleteBulkProducts);
router.delete('/:id',       protect, requirePermission('product.delete'), productController.deleteProduct);

router.get('/:productId/variants',        productVariantController.getVariants);
router.post('/:productId/variants',       protect, requirePermission('product_variant.create'), productVariantController.createVariant);
router.post('/:productId/variants/bulk',  protect, requirePermission('product_variant.create'), productVariantController.bulkCreateVariants);
router.delete('/:productId/variants/all', protect, requirePermission('product_variant.delete'), productVariantController.deleteVariantsByProduct);

module.exports = router;
