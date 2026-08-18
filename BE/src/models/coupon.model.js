const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên mã giảm giá là bắt buộc'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Mã code là bắt buộc'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    type: {
      type: String,
      enum: ['percent', 'fixed'],
      required: [true, 'Loại giảm giá là bắt buộc'],
    },
    value: {
      type: Number,
      required: [true, 'Giá trị giảm là bắt buộc'],
      min: [0, 'Giá trị giảm không được âm'],
    },
    // Trần giảm tối đa, chỉ áp dụng khi type = percent. VD: giảm 20% nhưng tối đa 150,000đ
    maxDiscount: {
      type: Number,
      default: null,
    },
    // Giá trị đơn hàng tối thiểu để áp mã
    minOrderValue: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: [true, 'Ngày bắt đầu là bắt buộc'],
    },
    endDate: {
      type: Date,
      required: [true, 'Ngày kết thúc là bắt buộc'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Tổng số lần dùng tối đa toàn hệ thống, null = không giới hạn
    usageLimit: {
      type: Number,
      default: null,
    },
    // Đếm số lần đã dùng
    usedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index để tìm kiếm nhanh theo code
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
