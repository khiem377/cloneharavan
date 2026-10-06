const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/role.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

router.use(protect);

router.get('/permissions', requirePermission(['role.manage', 'role.view']), ctrl.getPermissions);
router.post('/seed-full-permissions', requirePermission('role.manage'), ctrl.seedPermissions);

router.get('/',            requirePermission(['role.manage', 'role.view', 'role.assign', 'user.view', 'user.create']), ctrl.getRoles);
router.post('/',           requirePermission('role.manage'), ctrl.createRole);
router.get('/:id',         requirePermission(['role.manage', 'role.view']), ctrl.getRole);
router.put('/:id',         requirePermission('role.manage'), ctrl.updateRole);
router.delete('/:id',      requirePermission('role.manage'), ctrl.deleteRole);

router.patch('/users/:userId/assign', requirePermission(['role.manage', 'role.assign']), ctrl.assignUserRole);

module.exports = router;
