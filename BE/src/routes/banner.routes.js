const express = require('express');
const router  = express.Router();

const {
  getPublic, getAll, create, update, reorder, remove, removeBulk, view, click,
} = require('../controllers/banner.controller');

const { protect }            = require('../middleware/auth.middleware');
const { requirePermission }  = require('../middleware/permission.middleware');
const { validate }           = require('../middleware/validate.middleware');
const { upload }             = require('../middleware/upload.middleware');
const {
  createBannerSchema,
  updateBannerSchema,
  reorderSchema,
  deleteBulkSchema,
} = require('../validators/banner.validator');

// ── Public ─────────────────────────────────────────────────────────────────
// GET /banners?type=hero
router.get('/', getPublic);

// Analytics — public (không cần auth, FE gọi tự động)
router.post('/:id/view',  view);
router.post('/:id/click', click);

// ── Admin (cần auth) ───────────────────────────────────────────────────────
router.use(protect);

const bannerSvc = require('../services/banner.service');

router.get('/admin',                       requirePermission('banner.view'),   getAll);
router.post('/admin',                      requirePermission('banner.manage'), upload.single('image'), validate(createBannerSchema), create);
router.patch('/admin/reorder',             requirePermission('banner.manage'), validate(reorderSchema),      reorder);
router.delete('/admin/bulk',               requirePermission('banner.manage'), validate(deleteBulkSchema),   removeBulk);
router.get('/admin/locate',                requirePermission('banner.view'), async (req, res, next) => {
  try {
    const { id, limit } = req.query;
    if (!id) return res.status(400).json({ message: 'Thiếu param id' });
    const result = await bannerSvc.locateBanner(id, Number(limit) || 10);
    res.json({ status: 'success', data: result });
  } catch (e) { next(e); }
});
router.patch('/admin/:id',                 requirePermission('banner.manage'), validate(updateBannerSchema), update);
router.delete('/admin/:id',                requirePermission('banner.manage'), remove);

module.exports = router;
