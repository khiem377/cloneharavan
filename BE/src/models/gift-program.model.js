const mongoose = require('mongoose');

const giftProgramSchema = new mongoose.Schema(
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
    giftType: {
      type: String,
      enum: ['same_product', 'different_product'],
      required: [true, 'Loại tặng kèm là bắt buộc'],
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
    triggerQty: {
      type: Number,
      required: [true, 'Số lượng kích hoạt là bắt buộc'],
      min: [1, 'Số lượng kích hoạt phải lớn hơn 0'],
    },
    giftQty: {
      type: Number,
      default: null,
      min: [1, 'Số lượng tặng phải lớn hơn 0'],
    },
    giftProducts: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        qty: {
          type: Number,
          default: 1,
          min: 1,
        },
      },
    ],
    giftLimit: {
      type: Number,
      default: null,
    },
    giftUsedCount: {
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

giftProgramSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

const GiftProgram = mongoose.model('GiftProgram', giftProgramSchema);
module.exports = GiftProgram;
