const PurchaseReturnService = require('../services/purchaseReturn.service');

const getPurchaseReturns = async (req, res, next) => {
  try {
    const result = await PurchaseReturnService.getPurchaseReturns(req.query);
    res.status(200).json({
      status: 'success',
      data: result.returns,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

const getPurchaseReturnById = async (req, res, next) => {
  try {
    const purchaseReturn = await PurchaseReturnService.getPurchaseReturnById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: purchaseReturn,
    });
  } catch (err) {
    next(err);
  }
};

const createPurchaseReturn = async (req, res, next) => {
  try {
    const purchaseReturn = await PurchaseReturnService.createPurchaseReturn(req.body, req.user._id);
    res.status(201).json({
      status: 'success',
      message: 'Tạo phiếu trả hàng nhập thành công',
      data: purchaseReturn,
    });
  } catch (err) {
    next(err);
  }
};

const updateRefundStatus = async (req, res, next) => {
  try {
    const purchaseReturn = await PurchaseReturnService.updateRefundStatus(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Cập nhật trạng thái hoàn tiền NCC thành công',
      data: purchaseReturn,
    });
  } catch (err) {
    next(err);
  }
};

const downloadExcelSlip = async (req, res, next) => {
  try {
    const { workbook, returnNumber } = await PurchaseReturnService.generateExcelSlip(req.params.id);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${returnNumber}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPurchaseReturns,
  getPurchaseReturnById,
  createPurchaseReturn,
  updateRefundStatus,
  downloadExcelSlip,
};
