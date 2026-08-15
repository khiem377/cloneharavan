const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  getProfile,
  logout,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Public
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Private
router.get('/me', protect, getProfile);
router.post('/logout', protect, logout);

module.exports = router;
