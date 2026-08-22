const mongoose = require('mongoose');

const flashSaleItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Sản phẩm là bắt buộc'],
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductVariant',
      default: null,
    },
    originalPrice: {
      type: Number,
      required: [true, 'Giá gốc là bắt buộc'],
      min: [0, 'Giá gốc không được âm'],
    },
    flashSalePrice: {
      type: Number,
      required: [true, 'Giá Flash Sale là bắt buộc'],
      min: [0, 'Giá Flash Sale không được âm'],
    },
    stockLimit: {
      type: Number,
      required: [true, 'Số lượng mở bán Flash Sale là bắt buộc'],
      min: [1, 'Số lượng bán phải lớn hơn 0'],
    },
    soldCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: true }
);

const flashSaleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên chương trình Flash Sale là bắt buộc'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    banner: {
      mediaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media',
        default: null,
      },
      url: {
        type: String,
        default: '',
      },
    },
    startDate: {
      type: Date,
      required: [true, 'Thời gian bắt đầu là bắt buộc'],
    },
    endDate: {
      type: Date,
      required: [true, 'Thời gian kết thúc là bắt buộc'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    items: [flashSaleItemSchema],
  },
  { timestamps: true }
);

flashSaleSchema.virtual('status').get(function () {
  if (!this.isActive) return 'disabled';
  const now = new Date();
  if (now < this.startDate) return 'upcoming';
  if (now > this.endDate) return 'ended';
  return 'active';
});

flashSaleSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
flashSaleSchema.index({ 'items.productId': 1, 'items.variantId': 1 });

flashSaleSchema.set('toJSON', { virtuals: true });
flashSaleSchema.set('toObject', { virtuals: true });

const FlashSale = mongoose.model('FlashSale', flashSaleSchema);
module.exports = FlashSale;
