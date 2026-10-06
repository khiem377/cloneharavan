const express = require('express');
const router = express.Router();
const controller = require('../controllers/recommendation.controller');
const { optionalAuth, protect } = require('../middleware/auth.middleware');


router.post('/interactions', optionalAuth, controller.recordInteraction);


router.get('/personalized', optionalAuth, controller.getPersonalizedRecommendations);


router.get('/session-based', optionalAuth, controller.getSessionBasedRecommendations);


router.get('/trending', controller.getTrendingRecommendations);


router.get('/similar/:productId', controller.getSimilarProducts);


router.post('/compute-item-cf', protect, controller.computeItemCF);
router.get('/sync-csv', controller.syncInteractionsCsv);
router.post('/sync-csv', controller.syncInteractionsCsv);

module.exports = router;
