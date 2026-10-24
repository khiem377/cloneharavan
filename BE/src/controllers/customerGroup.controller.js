const CustomerGroupService = require('../services/customerGroup.service');
const catchAsync = require('../utils/catchAsync');

const getGroups = catchAsync(async (req, res) => {
  const result = await CustomerGroupService.getGroups(req.query);
  res.status(200).json({
    success: true,
    data: result.groups,
    pagination: result.pagination,
  });
});

const getOptions = catchAsync(async (req, res) => {
  const options = await CustomerGroupService.getOptions();
  res.status(200).json({
    success: true,
    data: options,
  });
});

const getGroupById = catchAsync(async (req, res) => {
  const group = await CustomerGroupService.getGroupById(req.params.id);
  res.status(200).json({
    success: true,
    data: group,
  });
});

const createGroup = catchAsync(async (req, res) => {
  const group = await CustomerGroupService.createGroup(req.body, req.user);
  res.status(201).json({
    success: true,
    message: `Đã tạo nhóm khách hàng "${group.name}" thành công`,
    data: group,
  });
});

const updateGroup = catchAsync(async (req, res) => {
  const group = await CustomerGroupService.updateGroup(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: `Đã cập nhật nhóm khách hàng "${group.name}" thành công`,
    data: group,
  });
});

const deleteGroup = catchAsync(async (req, res) => {
  const result = await CustomerGroupService.deleteGroup(req.params.id);
  res.status(200).json({
    success: true,
    message: result.message,
  });
});

const syncGroupMembers = catchAsync(async (req, res) => {
  const result = await CustomerGroupService.syncGroupMembers(req.params.id);
  res.status(200).json({
    success: true,
    message: result.message,
    data: result,
  });
});

const seedDefaultGroups = catchAsync(async (req, res) => {
  const seedCustomerGroups = require('../../scripts/seed-customer-groups-and-sync');
  await seedCustomerGroups(false);
  const result = await CustomerGroupService.getGroups();
  res.status(200).json({
    success: true,
    message: 'Đã khởi tạo và đồng bộ các nhóm khách hàng thành công',
    data: result.groups,
  });
});

module.exports = {
  getGroups,
  getOptions,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  syncGroupMembers,
  seedDefaultGroups,
};
