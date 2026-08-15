const express = require('express');
const router = express.Router();
const { register, login, getMe, getAllUsers } = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);

// Admin only
router.get('/', protect, authorize('admin'), getAllUsers);

module.exports = router;
