const User = require('../models/user.model');
const { AppError } = require('../utils/AppError');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

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
  if (updateData.district !== undefined) address.district = updateData.district;
  if (updateData.ward !== undefined) address.ward = updateData.ward;
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
 */
const getAllUsers = async (query = {}) => {
  const {
    page = 1,
    limit = 10,
    q,
    role,
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

  if (role) {
    filter.role = role;
  }

  if (isActive !== undefined) {
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
    User.find(filter).sort(sort).skip(skip).limit(limitNum),
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
  const user = await User.findById(id);
  if (!user) throw new AppError('Không tìm thấy người dùng', 404);
  return user;
};

/**
 * Khóa / Mở khóa tài khoản người dùng
 */
const toggleUserStatus = async (adminUserId, targetUserId, isActive) => {
  if (adminUserId.toString() === targetUserId.toString()) {
    throw new AppError('Bạn không thể tự khóa/mở tài khoản của chính mình', 400);
  }

  const user = await User.findById(targetUserId);
  if (!user) throw new AppError('Không tìm thấy người dùng', 404);

  user.isActive = isActive !== undefined ? isActive : !user.isActive;
  await user.save();

  return user;
};

/**
 * Thay đổi vai trò người dùng (user / admin)
 */
const updateUserRole = async (adminUserId, targetUserId, role) => {
  if (adminUserId.toString() === targetUserId.toString()) {
    throw new AppError('Bạn không thể tự thay đổi vai trò của chính mình', 400);
  }

  const user = await User.findByIdAndUpdate(
    targetUserId,
    { role },
    { returnDocument: 'after', runValidators: true }
  );

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
};

