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
} = require('../controllers/user.controller');

const { protect, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { upload } = require('../middleware/upload.middleware');
const {
  updateProfileSchema,
  addressSchema,
  updateAddressSchema,
  updateStatusSchema,
  updateRoleSchema,
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
// 3. ADMIN MANAGEMENT (Admin Only)
// ==========================================
router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/:id', protect, authorize('admin'), getUserById);
router.patch('/:id/status', protect, authorize('admin'), validate(updateStatusSchema), toggleUserStatus);
router.patch('/:id/role', protect, authorize('admin'), validate(updateRoleSchema), updateUserRole);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
