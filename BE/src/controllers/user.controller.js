const {
  // Avatar
  updateAvatar: updateAvatarService,
  deleteAvatar: deleteAvatarService,
  // Profile
  getUserProfile,
  updateUserProfile,
  // Addresses
  getUserAddresses,
  addAddress: addAddressService,
  updateAddress: updateAddressService,
  deleteAddress: deleteAddressService,
  setDefaultAddress: setDefaultAddressService,
  syncOrderAddress: syncOrderAddressService,
  // Admin
  getAllUsers: getAllUsersService,
  getUserById: getUserByIdService,
  toggleUserStatus: toggleUserStatusService,
  updateUserRole: updateUserRoleService,
  deleteUser: deleteUserService,
} = require('../services/user.service');

// ==========================================
// 1. PROFILE & AVATAR
// ==========================================

const getProfile = async (req, res, next) => {
  try {
    const user = await getUserProfile(req.user._id);
    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Lấy thông tin cá nhân thành công',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await updateUserProfile(req.user._id, req.body);
    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Cập nhật thông tin cá nhân thành công',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

const updateAvatar = async (req, res, next) => {
  try {
    const user = await updateAvatarService(req.user._id, req.file);
    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Đổi ảnh đại diện thành công',
      data: { avatar: user.avatar },
    });
  } catch (error) {
    next(error);
  }
};

const deleteAvatar = async (req, res, next) => {
  try {
    const user = await deleteAvatarService(req.user._id);
    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Xóa ảnh đại diện thành công',
      data: { avatar: user.avatar },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. ADDRESS BOOK
// ==========================================

const getAddresses = async (req, res, next) => {
  try {
    const addresses = await getUserAddresses(req.user._id);
    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Lấy danh sách địa chỉ thành công',
      data: { addresses },
    });
  } catch (error) {
    next(error);
  }
};

const addAddress = async (req, res, next) => {
  try {
    const address = await addAddressService(req.user._id, req.body);
    res.status(201).json({
      status: 'success',
      statusCode: 201,
      message: 'Thêm địa chỉ thành công',
      data: { address },
    });
  } catch (error) {
    next(error);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const address = await updateAddressService(req.user._id, req.params.addressId, req.body);
    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Cập nhật địa chỉ thành công',
      data: { address },
    });
  } catch (error) {
    next(error);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const addresses = await deleteAddressService(req.user._id, req.params.addressId);
    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Xóa địa chỉ thành công',
      data: { addresses },
    });
  } catch (error) {
    next(error);
  }
};

const setDefaultAddress = async (req, res, next) => {
  try {
    const addresses = await setDefaultAddressService(req.user._id, req.params.addressId);
    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Đặt làm địa chỉ mặc định thành công',
      data: { addresses },
    });
  } catch (error) {
    next(error);
  }
};

const syncOrderAddress = async (req, res, next) => {
  try {
    const address = await syncOrderAddressService(req.user._id, req.body);
    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Đồng bộ địa chỉ giao hàng thành công',
      data: { address },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. ADMIN MANAGEMENT
// ==========================================

const getAllUsers = async (req, res, next) => {
  try {
    const result = await getAllUsersService(req.query);
    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Lấy danh sách người dùng thành công',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await getUserByIdService(req.params.id);
    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Lấy chi tiết người dùng thành công',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await toggleUserStatusService(req.user._id, req.params.id, isActive);
    res.json({
      status: 'success',
      statusCode: 200,
      message: user.isActive ? 'Mở khóa tài khoản thành công' : 'Khóa tài khoản thành công',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await updateUserRoleService(req.user._id, req.params.id, role);
    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Cập nhật vai trò thành công',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await deleteUserService(req.user._id, req.params.id);
    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Xóa người dùng thành công',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  // Profile & Avatar
  getProfile,
  updateProfile,
  updateAvatar,
  deleteAvatar,
  // Address Book
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  syncOrderAddress,
  // Admin
  getAllUsers,
  getUserById,
  toggleUserStatus,
  updateUserRole,
  deleteUser,
};
