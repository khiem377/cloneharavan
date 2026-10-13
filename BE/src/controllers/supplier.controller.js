const SupplierService = require('../services/supplier.service');
const catchAsync = require('../utils/catchAsync');

const getSuppliers = catchAsync(async (req, res) => {
  const result = await SupplierService.getAllSuppliers(req.query);
  res.json({
    status: 'success',
    success: true,
    data: result.data,
    pagination: result.pagination,
    counts: result.counts,
    totalDebt: result.totalDebt,
  });
});

const getSupplierById = catchAsync(async (req, res) => {
  const data = await SupplierService.getSupplierById(req.params.id);
  res.json({
    status: 'success',
    success: true,
    data,
  });
});

const createSupplier = catchAsync(async (req, res) => {
  const data = await SupplierService.createSupplier(req.body);
  res.status(201).json({
    status: 'success',
    success: true,
    message: 'Tạo nhà cung cấp thành công',
    data,
  });
});

const updateSupplier = catchAsync(async (req, res) => {
  const data = await SupplierService.updateSupplier(req.params.id, req.body);
  res.json({
    status: 'success',
    success: true,
    message: 'Cập nhật nhà cung cấp thành công',
    data,
  });
});

const deleteSupplier = catchAsync(async (req, res) => {
  await SupplierService.deleteSupplier(req.params.id);
  res.json({
    status: 'success',
    success: true,
    message: 'Xóa nhà cung cấp thành công',
  });
});

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
