const express = require('express');
const router = express.Router();
const flashSaleController = require('../controllers/flashSale.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createFlashSaleSchema,
  updateFlashSaleSchema,
} = require('../validators/flashSale.validator');

router.get('/active', flashSaleController.getActive);
router.get('/available', flashSaleController.getAvailable);
router.get('/', flashSaleController.getAll);
router.get('/locate', protect, requirePermission('flash_sale.manage'), async (req, res, next) => {
  try {
    const { id, limit } = req.query;
    if (!id) return res.status(400).json({ message: 'Thiếu param id' });
    const svc = require('../services/flashSale.service');
    const result = await svc.locateFlashSale(id, Number(limit) || 10);
    res.json({ status: 'success', data: result });
  } catch (e) { next(e); }
});
router.get('/:id', flashSaleController.getById);

router.use(protect, requirePermission('flash_sale.manage'));

router.post('/', validate(createFlashSaleSchema), flashSaleController.create);
router.put('/:id', validate(updateFlashSaleSchema), flashSaleController.update);
router.patch('/:id', validate(updateFlashSaleSchema), flashSaleController.update);
router.delete('/:id', flashSaleController.remove);
router.patch('/:id/toggle-status', flashSaleController.toggleStatus);

module.exports = router;
