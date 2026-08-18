const Coupon = require('../models/coupon.model');
const { AppError } = require('../utils/AppError');

// Tính số tiền giảm dựa trên coupon và tổng đơn hàng
const calcDiscount = (coupon, orderTotal) => {
  if (coupon.type === 'percent') {
    const discount = Math.round((orderTotal * coupon.value) / 100);
    return coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount;
  }
  // fixed
  return Math.min(coupon.value, orderTotal);
};

const getAllCoupons = async (query = {}) => {
  const filter = {};
  if (query.keyword) filter.name = { $regex: query.keyword, $options: 'i' };
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';

  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, parseInt(query.limit) || 10);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Coupon.countDocuments(filter),
  ]);

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
};

const getCouponById = async (id) => {
  const coupon = await Coupon.findById(id);
  if (!coupon) throw new AppError('Không tìm thấy mã giảm giá', 404);
  return coupon;
};

const createCoupon = async (data) => {
  const existing = await Coupon.findOne({ code: data.code.toUpperCase() });
  if (existing) throw new AppError('Mã code đã tồn tại', 400);
  return Coupon.create(data);
};

const updateCoupon = async (id, data) => {
  const coupon = await Coupon.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!coupon) throw new AppError('Không tìm thấy mã giảm giá', 404);
  return coupon;
};

const deleteCoupon = async (id) => {
  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) throw new AppError('Không tìm thấy mã giảm giá', 404);
  return { message: 'Đã xóa mã giảm giá' };
};

const toggleCouponStatus = async (id, isActive) => {
  const coupon = await Coupon.findByIdAndUpdate(id, { isActive }, { new: true });
  if (!coupon) throw new AppError('Không tìm thấy mã giảm giá', 404);
  return coupon;
};

// Validate mã khi user nhập ở checkout — trả về số tiền giảm
const validateCoupon = async (code, orderTotal, userId) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) throw new AppError('Mã giảm giá không tồn tại', 404);
  if (!coupon.isActive) throw new AppError('Mã giảm giá không còn hiệu lực', 400);

  const now = new Date();
  if (now < coupon.startDate) throw new AppError('Mã giảm giá chưa đến ngày áp dụng', 400);
  if (now > coupon.endDate) throw new AppError('Mã giảm giá đã hết hạn', 400);

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError('Mã giảm giá đã hết lượt sử dụng', 400);
  }

  if (orderTotal < coupon.minOrderValue) {
    throw new AppError(
      `Đơn hàng tối thiểu ${coupon.minOrderValue.toLocaleString('vi-VN')}đ để áp dụng mã này`,
      400
    );
  }

  const discountAmount = calcDiscount(coupon, orderTotal);

  return {
    coupon: {
      _id: coupon._id,
      code: coupon.code,
      name: coupon.name,
      type: coupon.type,
      value: coupon.value,
      maxDiscount: coupon.maxDiscount,
    },
    discountAmount,
    finalTotal: orderTotal - discountAmount,
  };
};

// Đánh dấu đã dùng sau khi đặt hàng thành công
const applyCoupon = async (couponId) => {
  await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
};

// Xóa nhiều mã cùng lúc
const deleteBulkCoupons = async (ids) => {
  if (!ids || !ids.length) throw new AppError('Không có mã nào được chọn', 400);
  const result = await Coupon.deleteMany({ _id: { $in: ids } });
  return { deleted: result.deletedCount };
};

module.exports = {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  deleteBulkCoupons,
  toggleCouponStatus,
  validateCoupon,
  applyCoupon,
  calcDiscount,
};
