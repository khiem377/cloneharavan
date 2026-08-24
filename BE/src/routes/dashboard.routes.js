const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

router.use(protect);
router.use(requirePermission('dashboard.view'));

router.get('/overview', dashboardController.getOverviewStats);
router.get('/search', dashboardController.searchGlobal);

module.exports = router;
