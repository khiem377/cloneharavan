const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/gift-program.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

router.post('/apply', ctrl.apply);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);

router.post('/', protect, requirePermission('gift_program.manage'), ctrl.create);
router.put('/:id', protect, requirePermission('gift_program.manage'), ctrl.update);
router.patch('/:id/status', protect, requirePermission('gift_program.manage'), ctrl.toggleStatus);
router.delete('/bulk', protect, requirePermission('gift_program.manage'), ctrl.removeBulk);
router.delete('/:id', protect, requirePermission('gift_program.manage'), ctrl.remove);

module.exports = router;
