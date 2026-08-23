const mongoose = require('mongoose');

const CART_STATUS = {
  ACTIVE:    'ACTIVE',
  MERGED:    'MERGED',
  CONVERTED: 'CONVERTED',
  ABANDONED: 'ABANDONED',
  EXPIRED:   'EXPIRED',
};

const cartSchema = new mongoose.Schema(
  {
    // null nếu là Guest Cart
    user_id: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'User',
      default: null,
      index:   true,
    },

    // null nếu là User Cart — cryptographically secure random token
    guest_token: {
      type:    String,
      default: null,
    },

    status: {
      type:    String,
      enum:    Object.values(CART_STATUS),
      default: CART_STATUS.ACTIVE,
    },

    // Optimistic concurrency control — tăng mỗi khi cart được update
    version: {
      type:    Number,
      default: 0,
    },

    // Chỉ dùng cho Guest Cart — tự động hết hạn sau 30 ngày
    expires_at: {
      type:    Date,
      default: null,
    },
  },
  { timestamps: true }
);

// User chỉ được có 1 Cart ACTIVE tại một thời điểm
cartSchema.index({ user_id: 1, status: 1 });

// Tra cứu Guest Cart nhanh
cartSchema.index({ guest_token: 1 }, { sparse: true });

// TTL index — MongoDB tự xóa Guest Cart sau khi expires_at
cartSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0, sparse: true });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
module.exports.CART_STATUS = CART_STATUS;
