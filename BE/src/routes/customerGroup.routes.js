const express = require('express');
const router = express.Router();
const {
  getGroups,
  getOptions,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  syncGroupMembers,
  seedDefaultGroups,
} = require('../controllers/customerGroup.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

router.use(protect);

router.post('/seed-default', requirePermission(['user.edit', 'customer.manage', 'user.view']), seedDefaultGroups);
router.get('/options', requirePermission(['user.view', 'user.edit', 'customer.view', 'order.manage', 'setting.view']), getOptions);
router.get('/', requirePermission(['user.view', 'user.edit', 'customer.view']), getGroups);
router.get('/:id', requirePermission(['user.view', 'user.edit', 'customer.view']), getGroupById);
router.post('/', requirePermission(['user.edit', 'customer.manage']), createGroup);
router.put('/:id', requirePermission(['user.edit', 'customer.manage']), updateGroup);
router.delete('/:id', requirePermission(['user.delete', 'customer.manage']), deleteGroup);
router.post('/:id/sync', requirePermission(['user.edit', 'customer.manage']), syncGroupMembers);

module.exports = router;
