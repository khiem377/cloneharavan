const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/role.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

router.use(protect);

router.get('/permissions', requirePermission('role.manage'), ctrl.getPermissions);

router.get('/',            requirePermission('role.manage'), ctrl.getRoles);
router.post('/',           requirePermission('role.manage'), ctrl.createRole);
router.get('/:id',         requirePermission('role.manage'), ctrl.getRole);
router.put('/:id',         requirePermission('role.manage'), ctrl.updateRole);
router.delete('/:id',      requirePermission('role.manage'), ctrl.deleteRole);

router.patch('/users/:userId/assign', requirePermission('role.manage'), ctrl.assignUserRole);

module.exports = router;
