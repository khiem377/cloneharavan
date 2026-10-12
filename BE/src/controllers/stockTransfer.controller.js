const StockTransferService = require('../services/stockTransfer.service');
const catchAsync = require('../utils/catchAsync');

exports.getStockTransfers = catchAsync(async (req, res) => {
  const result = await StockTransferService.getStockTransfers(req.query);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.getStockTransferById = catchAsync(async (req, res) => {
  const transfer = await StockTransferService.getStockTransferById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: { transfer },
  });
});

exports.createStockTransfer = catchAsync(async (req, res) => {
  const transfer = await StockTransferService.createStockTransfer(req.body, req.user?._id);
  res.status(201).json({
    status: 'success',
    message: 'Tạo phiếu chuyển kho thành công',
    data: { transfer },
  });
});

exports.updateStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const transfer = await StockTransferService.updateStatus(req.params.id, status, req.user?._id);
  res.status(200).json({
    status: 'success',
    message: 'Cập nhật trạng thái chuyển kho thành công',
    data: { transfer },
  });
});
