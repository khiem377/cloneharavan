const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Thêm route mới tại đây:
// router.use('/products', productRoutes);

module.exports = router;
