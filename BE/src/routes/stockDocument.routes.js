const express = require('express');
const stockDocumentController = require('../controllers/stockDocument.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

const router = express.Router();

router.use(protect);
router.get('/', requirePermission('stock_movement.view'), stockDocumentController.getAllDocuments);

module.exports = router;
