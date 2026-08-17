const express = require('express');
const router  = express.Router();

const {
  register,
  login,
  refreshToken,
  getProfile,
  changePassword,
  logout,
} = require('../controllers/auth.controller');

const { protect }  = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} = require('../validators/auth.validator');

router.post('/register',       validate(registerSchema), register);
router.post('/login',          validate(loginSchema),    login);
router.post('/refresh-token',  refreshToken);

router.get('/me',               protect,                                  getProfile);
router.post('/logout',          protect,                                  logout);
router.post('/change-password', protect, validate(changePasswordSchema), changePassword);

module.exports = router;
