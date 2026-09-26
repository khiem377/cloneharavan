const inventoryReportService = require('../services/inventoryReport.service');

const getBalanceReport = async (req, res, next) => {
  try {
    const reportData = await inventoryReportService.getInventoryBalanceReport(req.query);
    res.status(200).json({
      status: 'success',
      data: reportData,
    });
  } catch (err) {
    next(err);
  }
};

const exportExcel = async (req, res, next) => {
  try {
    await inventoryReportService.exportInventoryReportExcel(req.query, res);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getBalanceReport,
  exportExcel,
};
