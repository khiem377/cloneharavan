const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'ID sản phẩm (productId) là bắt buộc'],
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductVariant',
      required: [true, 'ID biến thể / SKU (variantId) là bắt buộc'],
    },
    sku: {
      type: String,
      default: '',
      trim: true,
      uppercase: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Số lượng sản phẩm là bắt buộc'],
      min: [1, 'Số lượng sản phẩm tối thiểu là 1'],
      default: 1,
    },
    priceAtAdded: {
      type: Number,
      required: true,
      min: [0, 'Đơn giá không được nhỏ hơn 0'],
      default: 0,
    },
    selectedAttributes: [
      {
        name: { type: String, default: '' },
        value: { type: String, default: '' },
        colorCode: { type: String, default: '' },
      },
    ],
  },
  { _id: true, timestamps: true }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    sessionId: {
      type: String,
      default: null,
    },
    items: [cartItemSchema],
    couponCode: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
    },
    lastValidatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Tối ưu tìm kiếm và ràng buộc duy nhất
cartSchema.index({ userId: 1 }, { unique: true, sparse: true });
cartSchema.index({ sessionId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Cart', cartSchema);
