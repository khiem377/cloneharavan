const StockAuditService = require('../services/stockAudit.service');

const getStockAudits = async (req, res, next) => {
  try {
    const result = await StockAuditService.getStockAudits(req.query);
    res.json({ status: 'success', data: result.data, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
};

const getStockAuditById = async (req, res, next) => {
  try {
    const data = await StockAuditService.getStockAuditById(req.params.id);
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

const createStockAudit = async (req, res, next) => {
  try {
    const data = await StockAuditService.createStockAudit(req.body, req.user._id);
    res.status(201).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

const downloadExcelSlip = async (req, res, next) => {
  try {
    const { workbook, auditNumber } = await StockAuditService.generateExcelSlip(req.params.id);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Phieu_Kiem_Ke_${auditNumber}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStockAudits,
  getStockAuditById,
  createStockAudit,
  downloadExcelSlip,
};
