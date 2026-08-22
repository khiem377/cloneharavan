const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/menu.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// ── Public routes (Client dùng) ──────────────────────────────────────────────
// Lấy menu theo handle (không cần auth — client storefront dùng)
router.get('/handle/:handle', ctrl.getByHandle);

// ── Admin routes (cần auth) ──────────────────────────────────────────────────
router.use(protect, authorize('admin'));

router.get('/',            ctrl.getAll);
router.get('/:id',         ctrl.getById);
router.post('/',           ctrl.create);
router.put('/:id',         ctrl.update);
router.delete('/:id',      ctrl.remove);
router.post('/:id/duplicate', ctrl.duplicate);

module.exports = router;
