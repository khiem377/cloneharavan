const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên chương trình là bắt buộc'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    type: {
      type: String,
      enum: ['percent_discount', 'fixed_discount', 'buy_x_pay_y', 'quantity_discount'],
      required: [true, 'Loại chương trình là bắt buộc'],
    },
    triggerQty: {
      type: Number,
      default: null,
      min: [1, 'Số lượng kích hoạt phải lớn hơn 0'],
    },
    payQty: {
      type: Number,
      default: null,
      min: [1, 'Số lượng phải trả phải lớn hơn 0'],
    },
    discountType: {
      type: String,
      enum: ['percent', 'fixed'],
      default: null,
    },
    discountValue: {
      type: Number,
      default: null,
      min: [0, 'Giá trị giảm không được âm'],
    },
    maxDiscountValue: {
      type: Number,
      default: null,
      min: [0, 'Giới hạn giảm giá không được âm'],
    },
    scope: {
      type: {
        type: String,
        enum: ['all', 'products', 'categories'],
        default: 'all',
      },
      productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
      categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    },
    minOrderValue: {
      type: Number,
      default: null,
      min: [0, 'Giá trị đơn hàng tối thiểu không được âm'],
    },
    usageLimit: {
      type: Number,
      default: null,
      min: [1, 'Giới hạn sử dụng phải lớn hơn 0'],
    },
    usedCount: {
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
  },
  { timestamps: true }
);

promotionSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

const Promotion = mongoose.model('Promotion', promotionSchema);
module.exports = Promotion;
