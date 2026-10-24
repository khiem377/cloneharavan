const Coupon = require('../models/coupon.model');
const { AppError } = require('../utils/AppError');

const calcDiscount = (coupon, orderTotal = 0, shippingFee = 0) => {
  if (coupon.category === 'shipping') {
    // 1. Giảm 100% toàn bộ cước ship (Free ship all)
    if (coupon.type === 'free_shipping') {
      return Math.max(0, Number(shippingFee) || 0);
    }
    // 2. Giảm theo % cước ship (có trần maxDiscount nếu có)
    if (coupon.type === 'percent') {
      const fee = Math.max(0, Number(shippingFee) || 0);
      const discount = Math.round((fee * (Number(coupon.value) || 0)) / 100);
      return coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount;
    }
    // 3. Giảm số tiền cố định vào cước ship
    return Math.min(Number(coupon.value) || 0, Math.max(0, Number(shippingFee) || 0));
  }

  // category === 'order' (Mã giảm giá đơn hàng)
  if (coupon.type === 'percent') {
    const discount = Math.round((orderTotal * (Number(coupon.value) || 0)) / 100);
    return coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount;
  }
  // fixed
  return Math.min(Number(coupon.value) || 0, orderTotal);
};

const getAllCoupons = async (query = {}) => {
  const filter = {};
  const now = new Date();

  // Lọc theo phân loại: 'order' | 'shipping'
  if (query.category) {
    filter.category = query.category;
  }

  // Tìm kiếm theo tên hoặc mã code
  if (query.keyword) {
    filter.$or = [
      { name: { $regex: query.keyword, $options: 'i' } },
      { code: { $regex: query.keyword, $options: 'i' } },
    ];
  }

  // 1. Dành cho Storefront: availableOnly = true (hoặc validOnly = true)
  // Chỉ lấy coupon ĐANG CÓ HIỆU LỰC:
  // - isActive = true
  // - startDate <= now (đã đến ngày bắt đầu)
  // - endDate >= now (chưa hết hạn)
  // - Chưa vượt giới hạn lượt dùng toàn hệ thống (usageLimit === null hoặc usedCount < usageLimit)
  if (query.availableOnly === 'true' || query.validOnly === 'true') {
    filter.isActive = true;
    filter.startDate = { $lte: now };
    filter.endDate = { $gte: now };
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } },
      ],
    });
  } else {
    // 2. Dành cho Admin: lọc theo isActive hoặc status nếu có
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === 'true';
    }

    if (query.status === 'active') {
      filter.isActive = true;
      filter.startDate = { $lte: now };
      filter.endDate = { $gte: now };
    } else if (query.status === 'expired') {
      filter.endDate = { $lt: now };
    } else if (query.status === 'upcoming') {
      filter.startDate = { $gt: now };
    }
  }

  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, parseInt(query.limit) || 10);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Coupon.find(filter)
      .populate('applicableCustomerGroups', 'name code color')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Coupon.countDocuments(filter),
  ]);

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
};

const getCouponById = async (id) => {
  const coupon = await Coupon.findById(id).populate('applicableCustomerGroups', 'name code color');
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

const validateCoupon = async (code, orderTotal = 0, options = {}) => {
  let shippingFee = 0;
  let userId = null;

  if (typeof options === 'number') {
    shippingFee = options;
  } else if (typeof options === 'string') {
    userId = options;
  } else if (options && typeof options === 'object') {
    shippingFee = Number(options.shippingFee) || 0;
    userId = options.userId || null;
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) throw new AppError('Mã giảm giá không tồn tại', 404);
  if (!coupon.isActive) throw new AppError('Mã giảm giá không còn hiệu lực', 400);

  const now = new Date();
  if (now < coupon.startDate) throw new AppError('Mã giảm giá chưa đến ngày áp dụng', 400);
  if (now > coupon.endDate) throw new AppError('Mã giảm giá đã hết hạn', 400);

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError('Mã giảm giá đã hết lượt sử dụng', 400);
  }

  // Kiểm tra giới hạn số lần sử dụng của riêng từng người dùng
  if (userId && coupon.usageLimitPerUser !== null && coupon.usageLimitPerUser !== undefined) {
    const Order = require('../models/order.model');
    const userUsedCount = await Order.countDocuments({
      userId,
      $or: [
        { 'pricing.couponCode': coupon.code },
        { 'pricing.shippingCouponCode': coupon.code },
      ],
      orderStatus: { $ne: 'CANCELLED' },
    });

    if (userUsedCount >= coupon.usageLimitPerUser) {
      throw new AppError(
        `Bạn đã sử dụng hết số lượt cho phép (${coupon.usageLimitPerUser} lần) của mã giảm giá này`,
        400
      );
    }
  }

  // Kiểm tra ràng buộc nhóm khách hàng
  if (coupon.customerGroupRestriction === 'specific') {
    if (!userId) {
      throw new AppError(
        'Mã giảm giá này chỉ dành riêng cho khách hàng thuộc nhóm ưu đãi. Vui lòng đăng nhập tài khoản.',
        400
      );
    }
    const User = require('../models/user.model');
    const user = await User.findById(userId).select('customerGroupId');
    const applicableGroupIds = (coupon.applicableCustomerGroups || []).map((g) =>
      g._id ? g._id.toString() : g.toString()
    );

    if (!user || !user.customerGroupId || !applicableGroupIds.includes(user.customerGroupId.toString())) {
      throw new AppError(
        'Tài khoản của bạn không thuộc nhóm khách hàng được áp dụng mã giảm giá này',
        400
      );
    }
  }

  if (orderTotal < coupon.minOrderValue) {
    throw new AppError(
      `Đơn hàng tối thiểu ${coupon.minOrderValue.toLocaleString('vi-VN')}đ để áp dụng mã này`,
      400
    );
  }

  const discountAmount = calcDiscount(coupon, orderTotal, shippingFee);

  return {
    coupon: {
      _id: coupon._id,
      code: coupon.code,
      name: coupon.name,
      category: coupon.category || 'order',
      type: coupon.type,
      value: coupon.value,
      maxDiscount: coupon.maxDiscount,
      minOrderValue: coupon.minOrderValue || 0,
      usageLimitPerUser: coupon.usageLimitPerUser,
    },
    category: coupon.category || 'order',
    discountAmount,
    finalTotal: coupon.category === 'shipping' ? orderTotal : Math.max(0, orderTotal - discountAmount),
  };
};

const applyCoupon = async (couponId, orderTotal = 0, shippingFeeOrSession = null, session = null) => {
  const now = new Date();
  let shippingFee = 0;
  let actualSession = session;

  if (shippingFeeOrSession && typeof shippingFeeOrSession === 'object' && shippingFeeOrSession.constructor?.name === 'ClientSession') {
    actualSession = shippingFeeOrSession;
  } else if (typeof shippingFeeOrSession === 'number') {
    shippingFee = shippingFeeOrSession;
  } else if (shippingFeeOrSession && typeof shippingFeeOrSession === 'object') {
    actualSession = shippingFeeOrSession;
  }

  const options = { new: true };
  if (actualSession) options.session = actualSession;

  const coupon = await Coupon.findOneAndUpdate(
    {
      _id: couponId,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } },
      ],
    },
    { $inc: { usedCount: 1 } },
    options
  );

  if (!coupon) {
    throw new AppError('Mã giảm giá đã hết lượt sử dụng hoặc không còn hiệu lực', 400);
  }

  return calcDiscount(coupon, orderTotal, shippingFee);
};

const releaseCoupon = async (couponCode, session = null) => {
  if (!couponCode) return;
  const options = {};
  if (session) options.session = session;
  await Coupon.updateOne(
    { code: couponCode.trim().toUpperCase(), usedCount: { $gt: 0 } },
    { $inc: { usedCount: -1 } },
    options
  );
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
  releaseCoupon,
  calcDiscount,
};
