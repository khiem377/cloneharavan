const express = require('express');
const router = express.Router();
const controller = require('../controllers/upsell.controller');

router.get('/variant/:variantId', controller.getByVariant);
router.get('/product/:productId', controller.getByProduct);

module.exports = router;
