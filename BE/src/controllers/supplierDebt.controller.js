const SupplierDebtService = require('../services/supplierDebt.service');
const catchAsync = require('../utils/catchAsync');

exports.getSupplierDebts = catchAsync(async (req, res) => {
  const result = await SupplierDebtService.getSupplierDebts(req.params.supplierId, req.query);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.createManualDebt = catchAsync(async (req, res) => {
  const debt = await SupplierDebtService.createManualDebt(req.params.supplierId, req.body, req.user);
  res.status(201).json({
    status: 'success',
    message: 'Tạo khoản công nợ thành công',
    data: { debt },
  });
});

exports.payDebt = catchAsync(async (req, res) => {
  const result = await SupplierDebtService.payDebt(
    req.params.supplierId,
    req.params.debtId,
    req.body,
    req.user
  );
  res.status(200).json({
    status: 'success',
    message: 'Thanh toán công nợ thành công, đã lập phiếu chi',
    data: result,
  });
});

exports.offsetDebts = catchAsync(async (req, res) => {
  const result = await SupplierDebtService.offsetDebts(req.params.supplierId, req.user);
  res.status(200).json({
    status: 'success',
    message: result.message,
    data: result,
  });
});

exports.getDebtHistory = catchAsync(async (req, res) => {
  const result = await SupplierDebtService.getDebtHistory(req.params.supplierId, req.query);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.syncAllExistingOrders = catchAsync(async (req, res) => {
  const result = await SupplierDebtService.syncAllExistingOrders();
  res.status(200).json({
    status: 'success',
    message: result.message,
    data: result,
  });
});

