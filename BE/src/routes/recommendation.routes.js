const express = require('express');
const router = express.Router();
const controller = require('../controllers/recommendation.controller');
const { optionalAuth, protect } = require('../middleware/auth.middleware');


router.post('/interactions', optionalAuth, controller.recordInteraction);
router.post('/interactions/batch', optionalAuth, controller.recordInteractionsBatch);


router.get('/personalized', optionalAuth, controller.getPersonalizedRecommendations);


router.get('/session-based', optionalAuth, controller.getSessionBasedRecommendations);


router.get('/trending', controller.getTrendingRecommendations);


router.get('/similar/:productId', controller.getSimilarProducts);


router.post('/compute-item-cf', protect, controller.computeItemCF);
router.post('/run-python-svd', controller.triggerPythonSVD);
router.get('/run-python-svd', controller.triggerPythonSVD);

module.exports = router;
