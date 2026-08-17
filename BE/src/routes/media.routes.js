const express = require('express');
const router  = express.Router();

const { upload, browse, search, remove, removeBulk } = require('../controllers/media.controller');
const { protect, authorize }   = require('../middleware/auth.middleware');
const { validate }             = require('../middleware/validate.middleware');
const { upload: multerUpload } = require('../middleware/upload.middleware');
const { uploadMediaSchema, deleteMediaSchema } = require('../validators/media.validator');

router.use(protect, authorize('admin'));

router.get('/search',  search);
router.get('/',        browse);
router.post('/',       multerUpload.single('file'), validate(uploadMediaSchema), upload);
router.delete('/bulk', validate(deleteMediaSchema), removeBulk);
router.delete('/:id',  remove);

module.exports = router;
