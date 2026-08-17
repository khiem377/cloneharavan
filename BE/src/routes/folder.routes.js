const express = require('express');
const router  = express.Router();

const { getTree, getContents, create, rename, reorder, remove } = require('../controllers/folder.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect, authorize('admin'));

router.get('/',              getTree);
router.get('/:id/contents',  getContents);
router.post('/',             create);
router.patch('/reorder',     reorder);
router.patch('/:id',         rename);
router.delete('/:id',        remove);

module.exports = router;
