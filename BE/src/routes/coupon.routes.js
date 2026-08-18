const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/coupon.controller');

// Public — validate mã ở checkout storefront
router.post('/validate', ctrl.validate);

// Bulk
router.delete('/bulk', ctrl.removeBulk);

// Admin routes
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.patch('/:id/toggle-status', ctrl.toggleStatus);
router.delete('/:id', ctrl.remove);

module.exports = router;
