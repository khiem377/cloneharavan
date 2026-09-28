const stockReceivingService = require('../services/stockReceiving.service');

const createReceiving = async (req, res, next) => {
  try {
    const receiving = await stockReceivingService.createStockReceiving(req.body, req.user?._id);
    res.status(201).json({
      status: 'success',
      message: 'Tạo phiếu nhập kho thành công',
      data: receiving,
    });
  } catch (err) {
    next(err);
  }
};

const getReceivings = async (req, res, next) => {
  try {
    const result = await stockReceivingService.getAllStockReceivings(req.query);
    res.status(200).json({
      status: 'success',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

const getReceivingById = async (req, res, next) => {
  try {
    const receiving = await stockReceivingService.getStockReceivingById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: receiving,
    });
  } catch (err) {
    next(err);
  }
};

const syncFromPOs = async (req, res, next) => {
  try {
    const createdCount = await stockReceivingService.syncFromPOs(req.user?._id);
    res.status(200).json({
      status: 'success',
      message: `Đã đồng bộ ${createdCount} Phiếu Nhập Kho từ các Đơn Mua Hàng thành công`,
      data: { createdCount },
    });
  } catch (err) {
    next(err);
  }
};

const downloadExcelSlip = async (req, res, next) => {
  try {
    const { workbook, receivingNumber } = await stockReceivingService.generateExcelSlip(req.params.id);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Phieu_Nhap_Kho_${receivingNumber}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createReceiving,
  getReceivings,
  getReceivingById,
  syncFromPOs,
  downloadExcelSlip,
};
