const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/coupon.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

// Public — validate mã ở checkout storefront (nhận diện user nếu đã đăng nhập)
router.post('/validate', optionalAuth, ctrl.validate);

// Public / Admin view
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);

// Admin manage routes (cần auth & permission)
router.post('/', protect, requirePermission('coupon.manage'), ctrl.create);
router.put('/:id', protect, requirePermission('coupon.manage'), ctrl.update);
router.patch('/:id/toggle-status', protect, requirePermission('coupon.manage'), ctrl.toggleStatus);
router.delete('/bulk', protect, requirePermission('coupon.manage'), ctrl.removeBulk);
router.delete('/:id', protect, requirePermission('coupon.manage'), ctrl.remove);

module.exports = router;
