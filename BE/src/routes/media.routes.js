const express = require('express');
const router  = express.Router();

const {
  upload, uploadFromUrl,
  browse, search,
  checkUsages,
  getUsage,
  getByIds,
  unused,
  rename, updateMeta,
  bulkMove,
  remove, removeBulk,
  stats,
} = require('../controllers/media.controller');
const { moveMediaCtrl } = require('../controllers/product.import.controller');
const { protect }            = require('../middleware/auth.middleware');
const { requirePermission }  = require('../middleware/permission.middleware');
const { validate }           = require('../middleware/validate.middleware');
const { upload: multerUpload } = require('../middleware/upload.middleware');
const {
  uploadMediaSchema,
  deleteMediaSchema,
  bulkMoveMediaSchema,
  updateMediaMetaSchema,
  renameMediaSchema,
} = require('../validators/media.validator');

router.use(protect);

// ── Read ───────────────────────────────────────────────────────────────────
router.get('/stats',        requirePermission('media.view'), stats);
router.get('/search',       requirePermission('media.view'), search);
router.get('/unused',       requirePermission('media.view'), unused);
router.get('/by-ids',       requirePermission('media.view'), getByIds);
router.get('/',             requirePermission('media.view'), browse);
router.post('/check-usages', requirePermission('media.view'), checkUsages);
router.get('/:id/usages',   requirePermission('media.view'), getUsage);

// ── Upload ─────────────────────────────────────────────────────────────────
router.post('/',           requirePermission('media.upload'), multerUpload.single('file'), validate(uploadMediaSchema), upload);
router.post('/upload-url', requirePermission('media.upload'), uploadFromUrl);

// ── Update ─────────────────────────────────────────────────────────────────
router.patch('/bulk-move',     requirePermission('media.upload'), validate(bulkMoveMediaSchema), bulkMove);
router.patch('/:id/move',      requirePermission('folder.manage'), moveMediaCtrl);
router.patch('/:id/rename',    requirePermission('media.upload'), validate(renameMediaSchema), rename);
router.patch('/:id/meta',      requirePermission('media.upload'), validate(updateMediaMetaSchema), updateMeta);

// ── Delete ─────────────────────────────────────────────────────────────────
router.delete('/bulk', requirePermission('media.delete'), validate(deleteMediaSchema), removeBulk);
router.delete('/:id',  requirePermission('media.delete'), remove);

module.exports = router;
