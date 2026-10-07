const express = require('express');
const router = express.Router();

const {
  register,
  registerAdmin,
  login,
  googleLogin,
  getTikTokAuthUrl,
  tiktokLogin,
  getZaloAuthUrl,
  zaloLogin,
  linkGoogle,
  linkZalo,
  linkTikTok,
  unlinkSocial,
  getLinkedAccounts,
  refreshToken,
  getProfile,
  getMyPermissions,
  changePassword,
  setPassword,
  getSessions,
  logoutSession,
  logoutOtherSessions,
  logout,
  forgotPassword,
  resetPassword,
  sendVerifyEmail,
  verifyEmail,
  sendVerifyPhone,
  verifyPhone,
  sessionStream,
  // Admin exclusive OTP & Passkey
  requestAdminOtp,
  verifyAdminOtp,
  resendAdminOtp,
  getPasskeyLoginOptions,
  verifyPasskeyLogin,
  getPasskeyRegisterOptions,
  verifyPasskeyRegister,
  deletePasskey,
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
router.post('/google', googleLogin);
router.get('/tiktok/auth-url', getTikTokAuthUrl);
router.post('/tiktok', tiktokLogin);
router.get('/zalo/auth-url', getZaloAuthUrl);
router.post('/zalo', zaloLogin);
router.post('/refresh-token', refreshToken);
router.get('/me', protect, getProfile);
router.get('/my-permissions', protect, getMyPermissions);
router.post('/logout', protect, logout);

// ==========================================
// ADMIN EXCLUSIVE AUTH (OTP & PASSKEY)
// ==========================================
router.post('/admin/request-otp', requestAdminOtp);
router.post('/admin/verify-otp', verifyAdminOtp);
router.post('/admin/resend-otp', resendAdminOtp);

// Passkey (WebAuthn)
router.post('/admin/passkey/login-options', getPasskeyLoginOptions);
router.post('/admin/passkey/login-verify', verifyPasskeyLogin);
router.post('/admin/passkey/register-options', protect, getPasskeyRegisterOptions);
router.post('/admin/passkey/register-verify', protect, verifyPasskeyRegister);
router.delete('/admin/passkey/:credentialId', protect, deletePasskey);
router.delete('/admin/passkey', protect, deletePasskey);


// Liên kết & Hủy liên kết tài khoản Mạng xã hội (Google, Zalo, TikTok)
router.get('/linked-accounts', protect, getLinkedAccounts);
router.post('/link/google', protect, linkGoogle);
router.post('/link/zalo', protect, linkZalo);
router.post('/link/tiktok', protect, linkTikTok);
router.delete('/unlink/:provider', protect, unlinkSocial);
router.post('/unlink/:provider', protect, unlinkSocial);

// SSE Realtime Session Stream (Force Logout, Session Check)
router.get('/session-stream', sessionStream);

// Quản lý Phiên Đăng nhập & Thiết bị (Sessions)
router.get('/sessions', protect, getSessions);
router.delete('/sessions/:sessionId', protect, logoutSession);
router.post('/sessions/logout-others', protect, logoutOtherSessions);

// Đổi, Tạo & Khôi phục mật khẩu
router.post('/set-password', protect, setPassword);
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
