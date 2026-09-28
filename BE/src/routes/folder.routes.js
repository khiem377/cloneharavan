const express = require('express');
const router  = express.Router();

const { getTree, getContents, create, rename, reorder, remove } = require('../controllers/folder.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

router.use(protect);

router.get('/',              requirePermission('media.view'), getTree);
router.get('/:id/contents',  requirePermission('media.view'), getContents);
router.post('/',             requirePermission('folder.manage'), create);
router.patch('/reorder',     requirePermission('folder.manage'), reorder);
router.patch('/:id',         requirePermission('folder.manage'), rename);
router.delete('/:id',        requirePermission('folder.manage'), remove);

module.exports = router;
