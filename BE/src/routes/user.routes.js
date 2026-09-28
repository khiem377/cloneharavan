const express = require('express');
const router = express.Router();

const {
  // Profile & Avatar
  getProfile,
  updateProfile,
  updateAvatar,
  deleteAvatar,
  // Address Book
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  syncOrderAddress,
  // Admin
  getAllUsers,
  getUserById,
  toggleUserStatus,
  updateUserRole,
  deleteUser,
  createAdmin,
} = require('../controllers/user.controller');

const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');
const { validate } = require('../middleware/validate.middleware');
const { upload } = require('../middleware/upload.middleware');
const {
  updateProfileSchema,
  addressSchema,
  updateAddressSchema,
  updateStatusSchema,
  updateRoleSchema,
  createAdminSchema,
} = require('../validators/user.validator');

// ==========================================
// 1. PROFILE & AVATAR (User Protected)
// ==========================================
router.get('/profile', protect, getProfile);
router.get('/me', protect, getProfile);
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);

router.post('/avatar', protect, upload.single('avatar'), updateAvatar);
router.delete('/avatar', protect, deleteAvatar);

// ==========================================
// 2. ADDRESS BOOK (User Protected)
// ==========================================
router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, validate(addressSchema), addAddress);
router.put('/addresses/:addressId', protect, validate(updateAddressSchema), updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);
router.patch('/addresses/:addressId/default', protect, setDefaultAddress);
router.post('/addresses/sync-order', protect, validate(addressSchema), syncOrderAddress);

// ==========================================
// 3. ADMIN MANAGEMENT (RBAC Protected)
// ==========================================
router.post('/admin', protect, requirePermission('user.create'), validate(createAdminSchema), createAdmin);
router.post('/', protect, requirePermission('user.create'), validate(createAdminSchema), createAdmin);
router.get('/', protect, requirePermission('user.view'), getAllUsers);
router.get('/:id', protect, requirePermission('user.view'), getUserById);
router.patch('/:id/status', protect, requirePermission('user.edit'), validate(updateStatusSchema), toggleUserStatus);
router.patch('/:id/role', protect, requirePermission('role.assign'), validate(updateRoleSchema), updateUserRole);
router.delete('/:id', protect, requirePermission('user.delete'), deleteUser);

module.exports = router;

