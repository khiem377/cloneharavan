const auditLogService = require('../services/auditLog.service');
const { AppError } = require('../utils/AppError');

const getLogs = async (req, res, next) => {
  try {
    const result = await auditLogService.getAuditLogs(req.query);
    res.json({
      status: 'success',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

const getLogById = async (req, res, next) => {
  try {
    const log = await auditLogService.getAuditLogById(req.params.id);
    res.json({
      status: 'success',
      data: log,
    });
  } catch (err) {
    next(err);
  }
};

const rollback = async (req, res, next) => {
  try {
    const result = await auditLogService.rollbackAuditLog(req.params.id, req.user, req);
    res.json({
      status: 'success',
      message: result.message,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLogs,
  getLogById,
  rollback,
};
