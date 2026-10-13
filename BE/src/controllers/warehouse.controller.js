const WarehouseService = require('../services/warehouse.service');
const catchAsync = require('../utils/catchAsync');

exports.getWarehouses = catchAsync(async (req, res) => {
  const result = await WarehouseService.getWarehouses(req.query, req.user);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.getStaffCandidates = catchAsync(async (req, res) => {
  const staff = await WarehouseService.getStaffCandidates();
  res.status(200).json({
    status: 'success',
    data: staff,
  });
});

exports.getWarehouseById = catchAsync(async (req, res) => {
  const warehouse = await WarehouseService.getWarehouseById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: { warehouse },
  });
});

exports.createWarehouse = catchAsync(async (req, res) => {
  const warehouse = await WarehouseService.createWarehouse(req.body);
  res.status(201).json({
    status: 'success',
    message: 'Tạo kho hàng mới thành công',
    data: { warehouse },
  });
});

exports.updateWarehouse = catchAsync(async (req, res) => {
  const warehouse = await WarehouseService.updateWarehouse(req.params.id, req.body);
  res.status(200).json({
    status: 'success',
    message: 'Cập nhật thông tin kho hàng thành công',
    data: { warehouse },
  });
});

exports.setDefault = catchAsync(async (req, res) => {
  const warehouse = await WarehouseService.setDefault(req.params.id);
  res.status(200).json({
    status: 'success',
    message: `Đã thiết lập [${warehouse.name}] làm kho mặc định`,
    data: { warehouse },
  });
});

exports.deleteWarehouse = catchAsync(async (req, res) => {
  const result = await WarehouseService.deleteWarehouse(req.params.id);
  res.status(200).json({
    status: 'success',
    message: result.message,
  });
});

exports.getWarehouseInventory = catchAsync(async (req, res) => {
  const result = await WarehouseService.getWarehouseInventory(req.params.id, req.query);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});
