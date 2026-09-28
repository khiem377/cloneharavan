const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/menu.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

// ── Public routes (Client dùng) ──────────────────────────────────────────────
router.get('/handle/:handle', ctrl.getByHandle);

// ── Admin routes (cần auth & permission) ──────────────────────────────────────
router.use(protect);

router.get('/',            requirePermission('menu.view'), ctrl.getAll);
router.get('/:id',         requirePermission('menu.view'), ctrl.getById);
router.post('/',           requirePermission('menu.manage'), ctrl.create);
router.put('/:id',         requirePermission('menu.manage'), ctrl.update);
router.delete('/:id',      requirePermission('menu.manage'), ctrl.remove);
router.post('/:id/duplicate', requirePermission('menu.manage'), ctrl.duplicate);

module.exports = router;
