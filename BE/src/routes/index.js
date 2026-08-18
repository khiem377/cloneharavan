const express = require('express');
const router  = express.Router();

const authRoutes     = require('./auth.routes');
const userRoutes     = require('./user.routes');
const bannerRoutes   = require('./banner.routes');
const mediaRoutes    = require('./media.routes');
const folderRoutes   = require('./folder.routes');
const categoryRoutes = require('./category.routes');
const brandRoutes    = require('./brand.routes');
const productRoutes  = require('./product.routes');

router.use('/auth',       authRoutes);
router.use('/users',      userRoutes);
router.use('/banners',    bannerRoutes);
router.use('/media',      mediaRoutes);
router.use('/folders',    folderRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands',     brandRoutes);
router.use('/products',   productRoutes);

module.exports = router;
