const express = require('express');
const router  = express.Router();

const {
  getPublic, getAll, create, update, reorder, remove, removeBulk,
} = require('../controllers/banner.controller');

const { protect, authorize }   = require('../middleware/auth.middleware');
const { validate }             = require('../middleware/validate.middleware');
const { upload }               = require('../middleware/upload.middleware');
const {
  updateBannerSchema,
  reorderSchema,
  deleteBulkSchema,
} = require('../validators/banner.validator');

router.get('/', getPublic);

router.use(protect, authorize('admin'));

router.get('/admin',                        getAll);
router.post('/admin',                       upload.single('image'), create);
router.patch('/admin/reorder',              validate(reorderSchema),      reorder);
router.delete('/admin/bulk',                validate(deleteBulkSchema),   removeBulk);
router.patch('/admin/:id',                  validate(updateBannerSchema), update);
router.delete('/admin/:id',                 remove);

module.exports = router;
