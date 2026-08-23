const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    cart_id: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Cart',
      required: [true, 'cart_id là bắt buộc'],
      index:    true,
    },

    product_id: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Product',
      required: [true, 'product_id là bắt buộc'],
    },

    variant_id: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'ProductVariant',
      required: [true, 'variant_id là bắt buộc'],
    },

    quantity: {
      type:     Number,
      required: [true, 'Số lượng là bắt buộc'],
      min:      [1, 'Số lượng phải lớn hơn 0'],
    },

    // Snapshot giá tại thời điểm thêm vào giỏ — chỉ dùng cho hiển thị/audit
    // KHÔNG được dùng làm giá thanh toán cuối cùng
    unit_price_snapshot: {
      type:    Number,
      default: null,
      min:     [0, 'Giá không được âm'],
    },
  },
  { timestamps: true }
);

// UNIQUE constraint: một variant chỉ xuất hiện 1 lần trong 1 cart
// Ngăn chặn duplicate item, đảm bảo merge/add luôn update quantity
cartItemSchema.index(
  { cart_id: 1, variant_id: 1 },
  { unique: true, name: 'unique_cart_variant' }
);

const CartItem = mongoose.model('CartItem', cartItemSchema);
module.exports = CartItem;
