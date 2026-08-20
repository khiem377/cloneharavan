const express = require('express');
const router = express.Router();

const {
  register,
  registerAdmin,
  login,
  refreshToken,
  getProfile,
  changePassword,
  logout,
  forgotPassword,
  resetPassword,
  sendVerifyEmail,
  verifyEmail,
  sendVerifyPhone,
  verifyPhone,
} = require('../controllers/auth.controller');

const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  registerSchema,
  registerAdminSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  verifyPhoneSchema,
} = require('../validators/auth.validator');

// Auth cơ bản
router.post('/register', validate(registerSchema), register);
router.post('/register-admin', validate(registerAdminSchema), registerAdmin);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', refreshToken);
router.get('/me', protect, getProfile);
router.post('/logout', protect, logout);


// Đổi & Khôi phục mật khẩu
router.post('/change-password', protect, validate(changePasswordSchema), changePassword);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), resetPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

// Xác minh Email
router.post('/send-verify-email', protect, sendVerifyEmail);
router.post('/verify-email/:token', verifyEmail);
router.post('/verify-email', validate(verifyEmailSchema), verifyEmail);

// Xác minh Số điện thoại (OTP)
router.post('/send-verify-phone', protect, sendVerifyPhone);
router.post('/verify-phone', protect, validate(verifyPhoneSchema), verifyPhone);

module.exports = router;
