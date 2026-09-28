const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/promotion.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

router.post('/apply', ctrl.apply);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);

router.post('/', protect, requirePermission('promotion.manage'), ctrl.create);
router.put('/:id', protect, requirePermission('promotion.manage'), ctrl.update);
router.patch('/:id/status', protect, requirePermission('promotion.manage'), ctrl.toggleStatus);
router.delete('/bulk', protect, requirePermission('promotion.manage'), ctrl.removeBulk);
router.delete('/:id', protect, requirePermission('promotion.manage'), ctrl.remove);

module.exports = router;
