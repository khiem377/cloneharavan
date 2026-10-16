const mongoose = require('mongoose');

const comboItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: [1, 'Số lượng trong combo phải tối thiểu là 1'],
    },
    originalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: false }
);

const comboSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên combo là bắt buộc'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Mã combo là bắt buộc'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    // Định giá & Giảm giá
    pricingStrategy: {
      type: String,
      enum: ['fixed_price', 'discount'],
      default: 'fixed_price',
      required: true,
    },
    discountType: {
      type: String,
      enum: ['amount', 'percent'],
      default: 'amount',
    },
    discountValue: {
      type: Number,
      default: 0,
      min: [0, 'Giá trị giảm không được nhỏ hơn 0'],
    },
    // Tổng giá trị gốc các sản phẩm tại thời điểm thiết lập
    totalOriginalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    // Giá bán cuối cùng của combo
    comboPrice: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Giá bán combo không được nhỏ hơn 0'],
    },
    // Danh sách sản phẩm thành phần
    items: {
      type: [comboItemSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 2,
        message: 'Combo phải có ít nhất 2 sản phẩm',
      },
    },
    // Thời gian áp dụng
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null, // null = không giới hạn thời gian
    },
    usageLimit: {
      type: Number,
      default: 0, // 0 = không giới hạn
      min: 0,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

comboSchema.index({ code: 1 }, { unique: true });
comboSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Combo', comboSchema);
