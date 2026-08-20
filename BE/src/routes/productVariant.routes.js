const express = require('express');
const router = express.Router();
const productVariantController = require('../controllers/productVariant.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/:id',    protect, authorize('admin'), productVariantController.getVariantById);
router.put('/:id',    protect, authorize('admin'), productVariantController.updateVariant);
router.delete('/:id', protect, authorize('admin'), productVariantController.deleteVariant);

module.exports = router;
