const StockExportService = require('../services/stockExport.service');

const getStockExports = async (req, res, next) => {
  try {
    const result = await StockExportService.getStockExports(req.query);
    res.json({ status: 'success', data: result.data, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
};

const getStockExportById = async (req, res, next) => {
  try {
    const data = await StockExportService.getStockExportById(req.params.id);
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

const createStockExport = async (req, res, next) => {
  try {
    const data = await StockExportService.createStockExport(req.body, req.user._id);
    res.status(201).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

const downloadExcelSlip = async (req, res, next) => {
  try {
    const { workbook, exportNumber } = await StockExportService.generateExcelSlip(req.params.id);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Phieu_Xuat_Kho_${exportNumber}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const data = await StockExportService.updateStatus(req.params.id, status, note, req.user._id);
    res.json({ status: 'success', message: 'Cập nhật quy trình xuất kho thành công', data });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStockExports,
  getStockExportById,
  createStockExport,
  downloadExcelSlip,
  updateStatus,
};
