const express = require('express');
const router  = express.Router();

const authRoutes   = require('./auth.routes');
const userRoutes   = require('./user.routes');
const bannerRoutes = require('./banner.routes');

router.use('/auth',    authRoutes);
router.use('/users',   userRoutes);
router.use('/banners', bannerRoutes);

module.exports = router;
