const express = require('express');
const router = express.Router();
const productVariantController = require('../controllers/productVariant.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

router.get('/:id',    protect, requirePermission('product_variant.view'), productVariantController.getVariantById);
router.put('/:id',    protect, requirePermission('product_variant.edit'), productVariantController.updateVariant);
router.delete('/:id', protect, requirePermission('product_variant.delete'), productVariantController.deleteVariant);

module.exports = router;
