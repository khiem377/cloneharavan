const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);
router.use(authorize('admin', 'staff'));

router.get('/overview', dashboardController.getOverviewStats);
router.get('/search', dashboardController.searchGlobal);

module.exports = router;
