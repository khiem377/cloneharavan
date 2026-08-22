const express = require('express');
const router = express.Router();
const flashSaleController = require('../controllers/flashSale.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createFlashSaleSchema,
  updateFlashSaleSchema,
} = require('../validators/flashSale.validator');

router.get('/active', flashSaleController.getActive);
router.get('/', flashSaleController.getAll);
router.get('/:id', flashSaleController.getById);

router.use(protect);
router.use(authorize('admin'));

router.post('/', validate(createFlashSaleSchema), flashSaleController.create);
router.put('/:id', validate(updateFlashSaleSchema), flashSaleController.update);
router.patch('/:id', validate(updateFlashSaleSchema), flashSaleController.update);
router.delete('/:id', flashSaleController.remove);
router.patch('/:id/toggle-status', flashSaleController.toggleStatus);

module.exports = router;
