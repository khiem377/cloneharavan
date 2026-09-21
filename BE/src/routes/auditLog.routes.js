const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLog.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

router.use(protect);

router.get('/', requirePermission('audit_log.view'), auditLogController.getLogs);
router.get('/:id', requirePermission('audit_log.view'), auditLogController.getLogById);
router.post('/:id/rollback', requirePermission('audit_log.rollback'), auditLogController.rollback);

module.exports = router;
