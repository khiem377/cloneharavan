const Role = require('../models/role.model');
const Permission = require('../models/permission.model');
const User = require('../models/user.model');
const { AppError } = require('../utils/AppError');

const getAllPermissions = async () => {
  const permissions = await Permission.find({ isActive: true }).sort({ module: 1, name: 1 });
  
  // Gom nhóm theo module
  const grouped = permissions.reduce((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});

  return { permissions, grouped };
};

const getAllRoles = async () => {
  return Role.find().populate('permissions', 'name code module description');
};

const getRoleById = async (id) => {
  const role = await Role.findById(id).populate('permissions', 'name code module description');
  if (!role) throw new AppError('Không tìm thấy vai trò', 404);
  return role;
};

const createRole = async (data) => {
  const exists = await Role.findOne({ code: data.code?.toLowerCase() });
  if (exists) throw new AppError('Mã vai trò đã tồn tại', 400);

  return Role.create(data);
};

const updateRole = async (id, data) => {
  const role = await Role.findById(id);
  if (!role) throw new AppError('Không tìm thấy vai trò', 404);

  if (role.isSystem && data.code && data.code !== role.code) {
    throw new AppError('Không thể thay đổi mã vai trò hệ thống', 400);
  }

  return Role.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate('permissions', 'name code module description');
};

const deleteRole = async (id) => {
  const role = await Role.findById(id);
  if (!role) throw new AppError('Không tìm thấy vai trò', 404);
  if (role.isSystem) throw new AppError('Không thể xóa vai trò mặc định của hệ thống', 400);

  await Role.findByIdAndDelete(id);
  return { message: 'Đã xóa vai trò thành công' };
};

const assignUserRole = async (userId, roleId, customPermissionIds = []) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Không tìm thấy người dùng', 404);

  const role = await Role.findById(roleId);
  if (!role) throw new AppError('Vai trò không hợp lệ', 400);

  user.roleId = roleId;
  user.role = role.code;
  user.customPermissions = customPermissionIds;

  await user.save();
  return User.findById(userId)
    .populate({ path: 'roleId', populate: { path: 'permissions' } })
    .populate('customPermissions');
};

module.exports = {
  getAllPermissions,
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignUserRole,
};
