const express = require('express');
const router = express.Router();
const controller = require('../controllers/recommendation.controller');
const { optionalAuth, protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

router.post('/interactions', optionalAuth, controller.recordInteraction);
router.post('/interactions/batch', optionalAuth, controller.recordInteractionsBatch);

router.get('/personalized', optionalAuth, controller.getPersonalizedRecommendations);

router.get('/session-based', optionalAuth, controller.getSessionBasedRecommendations);

router.get('/trending', controller.getTrendingRecommendations);

router.get('/similar/:productId', controller.getSimilarProducts);

// ── Admin Internal Analytics & AI Training ──────────────────────────────────
router.post('/compute-item-cf', protect, requirePermission(['product.edit', 'setting.manage']), controller.computeItemCF);
router.post('/run-python-svd', protect, requirePermission(['product.edit', 'setting.manage']), controller.triggerPythonSVD);
router.get('/run-python-svd', protect, requirePermission(['product.edit', 'setting.manage']), controller.triggerPythonSVD);

module.exports = router;
