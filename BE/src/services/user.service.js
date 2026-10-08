const User = require('../models/user.model');
const { AppError } = require('../utils/AppError');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const sseService = require('./sse.service');

// ==========================================
// 1. AVATAR MANAGEMENT
// ==========================================

/**
 * Đổi / Cập nhật ảnh đại diện người dùng
 * - Upload buffer lên Cloudinary folder 'users/avatars'
 * - Xóa ảnh cũ trên Cloudinary nếu tồn tại publicId
 * - Cập nhật avatar trong DB
 */
const updateAvatar = async (userId, file) => {
  if (!file) {
    throw new AppError('Vui lòng chọn file ảnh đại diện', 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('Không tìm thấy người dùng', 404);
  }

  // Upload ảnh mới lên Cloudinary
  const result = await uploadToCloudinary(file.buffer, 'users/avatars');

  // Xóa ảnh cũ trên Cloudinary nếu có
  if (user.avatar && user.avatar.publicId) {
    try {
      await deleteFromCloudinary(user.avatar.publicId);
    } catch (err) {
      console.warn(`[Cloudinary] Không thể xóa avatar cũ (${user.avatar.publicId}):`, err.message);
    }
  }

  // Lưu avatar mới vào user
  user.avatar = {
    url: result.secure_url,
    publicId: result.public_id,
  };

  await user.save({ validateBeforeSave: false });
  return user;
};

/**
 * Xóa ảnh đại diện
 * - Xóa ảnh trên Cloudinary
 * - Cập nhật avatar = { url: null, publicId: null }
 */
const deleteAvatar = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('Không tìm thấy người dùng', 404);
  }

  if (user.avatar && user.avatar.publicId) {
    try {
      await deleteFromCloudinary(user.avatar.publicId);
    } catch (err) {
      console.warn(`[Cloudinary] Không thể xóa avatar (${user.avatar.publicId}):`, err.message);
    }
  }

  user.avatar = {
    url: null,
    publicId: null,
  };

  await user.save({ validateBeforeSave: false });
  return user;
};

// ==========================================
// 2. PROFILE MANAGEMENT
// ==========================================

/**
 * Lấy thông tin chi tiết người dùng
 */
const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('Không tìm thấy người dùng', 404);
  }
  return user;
};

/**
 * Cập nhật thông tin cá nhân
 */
const updateUserProfile = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('Không tìm thấy người dùng', 404);
  }

  // Kiểm tra trùng số điện thoại nếu thay đổi
  if (data.phone && data.phone !== user.phone) {
    const phoneExists = await User.findOne({ phone: data.phone, _id: { $ne: userId } });
    if (phoneExists) {
      throw new AppError('Số điện thoại đã được sử dụng bởi tài khoản khác', 400);
    }
    user.phone = data.phone;
    user.isPhoneVerified = false; // Reset trạng thái xác minh khi đổi SĐT
  }

  if (data.fullName !== undefined) user.fullName = data.fullName;
  if (data.gender !== undefined) user.gender = data.gender;
  if (data.dateOfBirth !== undefined) user.dateOfBirth = data.dateOfBirth;

  await user.save();
  return user;
};

// ==========================================
// 3. ADDRESS BOOK MANAGEMENT
// ==========================================

/**
 * Lấy danh sách địa chỉ của user
 */
const getUserAddresses = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('Không tìm thấy người dùng', 404);
  }
  return user.addresses;
};

/**
 * Thêm địa chỉ mới
 * - Nếu là địa chỉ đầu tiên hoặc isDefault = true -> set làm mặc định
 */
const addAddress = async (userId, addressData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('Không tìm thấy người dùng', 404);
  }

  const isFirstAddress = user.addresses.length === 0;

  if (addressData.isDefault || isFirstAddress) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
    addressData.isDefault = true;
  } else {
    addressData.isDefault = false;
  }

  user.addresses.push(addressData);
  await user.save();

  return user.addresses[user.addresses.length - 1];
};

/**
 * Sửa địa chỉ
 */
const updateAddress = async (userId, addressId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('Không tìm thấy người dùng', 404);
  }

  const address = user.addresses.id(addressId);
  if (!address) {
    throw new AppError('Không tìm thấy địa chỉ', 404);
  }

  if (updateData.isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
    address.isDefault = true;
  }

  if (updateData.fullName !== undefined) address.fullName = updateData.fullName;
  if (updateData.phone !== undefined) address.phone = updateData.phone;
  if (updateData.province !== undefined) address.province = updateData.province;
  if (updateData.provinceId !== undefined) address.provinceId = updateData.provinceId;
  if (updateData.district !== undefined) address.district = updateData.district;
  if (updateData.districtId !== undefined) address.districtId = updateData.districtId;
  if (updateData.ward !== undefined) address.ward = updateData.ward;
  if (updateData.wardCode !== undefined) address.wardCode = updateData.wardCode;
  if (updateData.detailAddress !== undefined) address.detailAddress = updateData.detailAddress;
  if (updateData.isDefault !== undefined) address.isDefault = updateData.isDefault;

  await user.save();
  return address;
};

/**
 * Xóa địa chỉ
 * - Nếu xóa địa chỉ mặc định, tự động gán địa chỉ đầu tiên còn lại làm mặc định
 */
const deleteAddress = async (userId, addressId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('Không tìm thấy người dùng', 404);
  }

  const address = user.addresses.id(addressId);
  if (!address) {
    throw new AppError('Không tìm thấy địa chỉ', 404);
  }

  const wasDefault = address.isDefault;
  user.addresses.pull({ _id: addressId });

  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  return user.addresses;
};

/**
 * Đặt địa chỉ làm mặc định
 */
const setDefaultAddress = async (userId, addressId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('Không tìm thấy người dùng', 404);
  }

  const address = user.addresses.id(addressId);
  if (!address) {
    throw new AppError('Không tìm thấy địa chỉ', 404);
  }

  user.addresses.forEach((addr) => {
    addr.isDefault = addr._id.toString() === addressId.toString();
  });

  await user.save();
  return user.addresses;
};

/**
 * Tự động đồng bộ / lưu địa chỉ khi đặt hàng nếu chưa tồn tại
 */
const syncOrderAddress = async (userId, orderAddress) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('Không tìm thấy người dùng', 404);
  }

  const existing = user.addresses.find(
    (addr) =>
      addr.phone === orderAddress.phone &&
      addr.province === orderAddress.province &&
      addr.district === orderAddress.district &&
      addr.ward === orderAddress.ward &&
      addr.detailAddress === orderAddress.detailAddress
  );

  if (existing) {
    return existing;
  }

  return addAddress(userId, {
    ...orderAddress,
    isDefault: user.addresses.length === 0,
  });
};

// ==========================================
// 4. ADMIN USER MANAGEMENT
// ==========================================

/**
 * Lấy danh sách người dùng cho Admin
 * Hỗ trợ userType: 'customer' (role: 'user') hoặc 'staff' (role khác 'user')
 */
const getAllUsers = async (query = {}) => {
  const {
    page = 1,
    limit = 10,
    q,
    role,
    userType,
    isActive,
    isEmailVerified,
    isPhoneVerified,
    sort = '-createdAt',
  } = query;

  const filter = {};

  if (q) {
    const searchRegex = { $regex: q.trim(), $options: 'i' };
    filter.$or = [
      { fullName: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }

  if (userType === 'customer') {
    filter.role = 'user';
  } else if (userType === 'staff') {
    filter.role = { $ne: 'user' };
    if (role && role !== 'all') {
      filter.role = role;
    }
  } else if (role && role !== 'all') {
    filter.role = role;
  }

  if (isActive !== undefined && isActive !== 'all') {
    filter.isActive = isActive === 'true' || isActive === true;
  }

  if (isEmailVerified !== undefined) {
    filter.isEmailVerified = isEmailVerified === 'true' || isEmailVerified === true;
  }

  if (isPhoneVerified !== undefined) {
    filter.isPhoneVerified = isPhoneVerified === 'true' || isPhoneVerified === true;
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const skip = (pageNum - 1) * limitNum;

  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .populate({
        path: 'roleId',
        select: 'name code description permissions',
        populate: { path: 'permissions', select: 'name code module description' },
      })
      .populate('customPermissions', 'name code module description')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
  ]);

  return {
    users,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

/**
 * Lấy chi tiết người dùng theo ID
 */
const getUserById = async (id) => {
  const user = await User.findById(id)
    .populate({
      path: 'roleId',
      select: 'name code description permissions',
      populate: { path: 'permissions', select: 'name code module description' },
    })
    .populate('customPermissions', 'name code module description');
  if (!user) throw new AppError('Không tìm thấy người dùng', 404);
  return user;
};

/**
 * Khóa / Mở khóa tài khoản người dùng
 * Nếu khóa (isActive = false): Hủy refreshToken và bắn SSE Force Logout tức thì
 */
const toggleUserStatus = async (adminUserId, targetUserId, isActive) => {
  if (adminUserId.toString() === targetUserId.toString()) {
    throw new AppError('Bạn không thể tự khóa/mở tài khoản của chính mình', 400);
  }

  const user = await User.findById(targetUserId);
  if (!user) throw new AppError('Không tìm thấy người dùng', 404);

  user.isActive = isActive !== undefined ? isActive : !user.isActive;

  // Nếu tài khoản bị khóa
  if (!user.isActive) {
    user.refreshToken = null; // Xóa refreshToken
    // Gửi realtime SSE Force Logout tới tất cả thiết bị của user này
    sseService.sendToUser(targetUserId.toString(), {
      type: 'FORCE_LOGOUT',
      reason: 'Tài khoản của bạn đã bị vô hiệu hóa bởi Quản trị viên.',
      timestamp: Date.now(),
    });
  }

  await user.save();
  return user;
};

const updateUser = async (id, updateData) => {
  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);

  Object.assign(user, updateData);
  await user.save();
  return user;
};

/**
 * Thay đổi vai trò người dùng (user / admin / staff...)
 */
const updateUserRole = async (adminUserId, targetUserId, role, roleId, customPermissions) => {
  if (adminUserId.toString() === targetUserId.toString()) {
    throw new AppError('Bạn không thể tự thay đổi vai trò của chính mình', 400);
  }

  const update = { role };
  if (roleId !== undefined) {
    update.roleId = roleId || null;
  }
  if (customPermissions !== undefined) {
    update.customPermissions = Array.isArray(customPermissions) ? customPermissions : [];
  }

  const user = await User.findByIdAndUpdate(
    targetUserId,
    update,
    { returnDocument: 'after', runValidators: true }
  )
    .populate('roleId', 'name code description')
    .populate('customPermissions', 'name code module description');

  if (!user) throw new AppError('Không tìm thấy người dùng', 404);
  return user;
};

/**
 * Xóa người dùng (kèm dọn dẹp avatar trên Cloudinary)
 */
const deleteUser = async (adminUserId, targetUserId) => {
  if (adminUserId.toString() === targetUserId.toString()) {
    throw new AppError('Bạn không thể tự xóa tài khoản của chính mình', 400);
  }

  const user = await User.findById(targetUserId);
  if (!user) throw new AppError('Không tìm thấy người dùng', 404);

  // Buộc đăng xuất trước khi xóa
  sseService.sendToUser(targetUserId.toString(), {
    type: 'FORCE_LOGOUT',
    reason: 'Tài khoản của bạn đã bị xóa khỏi hệ thống.',
    timestamp: Date.now(),
  });

  if (user.avatar && user.avatar.publicId) {
    try {
      await deleteFromCloudinary(user.avatar.publicId);
    } catch (err) {
      console.warn(`[Cloudinary] Không thể xóa avatar khi xóa user:`, err.message);
    }
  }

  await user.deleteOne();
  return user;
};

/**
 * Tạo tài khoản Nhân viên / Admin mới (do Admin quản lý tạo)
 */
const createAdminUser = async (data) => {
  const emailTaken = await User.findOne({ email: data.email.toLowerCase().trim() });
  if (emailTaken) {
    throw new AppError('Email đã được sử dụng', 400);
  }

  if (data.phone) {
    const phoneTaken = await User.findOne({ phone: data.phone.trim() });
    if (phoneTaken) {
      throw new AppError('Số điện thoại đã được sử dụng', 400);
    }
  }

  const newAdmin = await User.create({
    fullName: data.fullName.trim(),
    email: data.email.toLowerCase().trim(),
    password: data.password,
    phone: (data.phone || '').trim(),
    gender: data.gender || 'other',
    dateOfBirth: data.dateOfBirth || null,
    role: data.role || 'staff',
    roleId: data.roleId || null,
    isActive: data.isActive !== undefined ? data.isActive : true,
    isEmailVerified: data.isEmailVerified !== undefined ? data.isEmailVerified : true,
    isPhoneVerified: data.isPhoneVerified !== undefined ? data.isPhoneVerified : true,
  });

  const userObj = newAdmin.toObject();
  delete userObj.password;
  delete userObj.refreshToken;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpires;
  delete userObj.emailVerificationToken;
  delete userObj.emailVerificationExpires;
  delete userObj.phoneOtp;
  delete userObj.phoneOtpExpires;

  return userObj;
};

/**
 * Thống kê KPI người dùng (Customers hoặc Staffs)
 */
const getUserStats = async (userType = 'customer') => {
  const query = userType === 'customer' ? { role: 'user' } : { role: { $ne: 'user' } };
  const total = await User.countDocuments(query);
  const active = await User.countDocuments({ ...query, isActive: true });
  const inactive = await User.countDocuments({ ...query, isActive: false });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const newThisMonth = await User.countDocuments({ ...query, createdAt: { $gte: startOfMonth } });

  let roleDistribution = {};
  if (userType === 'staff') {
    const agg = await User.aggregate([
      { $match: { role: { $ne: 'user' } } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);
    agg.forEach((item) => {
      roleDistribution[item._id] = item.count;
    });
  }

  return { total, active, inactive, newThisMonth, roleDistribution };
};

/**
 * Cập nhật trạng thái hàng loạt (Khóa / Mở khóa)
 */
const bulkToggleUserStatus = async (adminUserId, userIds, isActive) => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new AppError('Danh sách tài khoản không hợp lệ', 400);
  }

  const validIds = userIds.filter((id) => id.toString() !== adminUserId.toString());
  await User.updateMany(
    { _id: { $in: validIds } },
    { $set: { isActive, ...(isActive ? {} : { refreshToken: null }) } }
  );

  if (!isActive) {
    validIds.forEach((id) => {
      sseService.sendToUser(id.toString(), {
        type: 'FORCE_LOGOUT',
        reason: 'Tài khoản của bạn đã bị vô hiệu hóa bởi Quản trị viên.',
        timestamp: Date.now(),
      });
    });
  }

  return { modifiedCount: validIds.length };
};

/**
 * Đặt lại mật khẩu nhân viên / người dùng (do Admin thực hiện)
 */
const resetUserPassword = async (adminUserId, targetUserId, newPassword) => {
  if (!newPassword || newPassword.length < 6) {
    throw new AppError('Mật khẩu mới phải có ít nhất 6 ký tự', 400);
  }

  const user = await User.findById(targetUserId);
  if (!user) throw new AppError('Không tìm thấy người dùng', 404);

  user.password = newPassword;
  user.refreshToken = null;
  await user.save();

  // Đăng xuất các phiên cũ để bắt buộc đăng nhập với mật khẩu mới
  sseService.sendToUser(targetUserId.toString(), {
    type: 'FORCE_LOGOUT',
    reason: 'Mật khẩu tài khoản của bạn đã được thay đổi bởi Quản trị viên. Vui lòng đăng nhập lại.',
    timestamp: Date.now(),
  });

  return { message: 'Đặt lại mật khẩu thành công' };
};

module.exports = {
  // Avatar
  updateAvatar,
  deleteAvatar,
  // Profile
  getUserProfile,
  updateUserProfile,
  // Addresses
  getUserAddresses,
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
  createAdminUser,
  getUserStats,
  bulkToggleUserStatus,
  resetUserPassword,
};


