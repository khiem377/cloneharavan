const mongoose = require('mongoose');

const giftProgramSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên chương trình tặng kèm là bắt buộc'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    triggerProducts: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        minQty: { type: Number, default: 1 },
      },
    ],
    triggerCategories: [
      {
        categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
        minQty: { type: Number, default: 1 },
      },
    ],
    giftProducts: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        qty: { type: Number, default: 1 },
      },
    ],
    giftLimit: { type: Number, default: null },
    giftUsedCount: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const GiftProgram = mongoose.model('GiftProgram', giftProgramSchema);
module.exports = GiftProgram;
