const mongoose = require('mongoose');

/**
 * UserInteraction Model — Layer 1: Event Tracking
 * Chuẩn Amazon/Netflix: implicit feedback với context + time decay support
 */
const userInteractionSchema = new mongoose.Schema(
  {
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    sessionId: { type: String, default: '', index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },

    // ── Interaction Types ──────────────────────────────────────────────────
    // Positive signals (weight > 0)
    // Negative signals (weight < 0) — quan trọng để tránh recommend sản phẩm xấu
    interactionType: {
      type: String,
      enum: [
        // Positive
        'view',             // xem danh sách          weight: 1.0
        'product_detail',   // xem trang chi tiết sp  weight: 1.8
        'search_click',     // click từ kết quả search weight: 2.0
        'filter_apply',     // dùng bộ lọc + xem sp   weight: 1.5
        'compare_add',      // thêm vào so sánh       weight: 1.5
        'wishlist_add',     // thêm vào yêu thích     weight: 2.5
        'share_product',    // chia sẻ sản phẩm       weight: 2.0
        'review_submit',    // viết đánh giá          weight: 3.0
        'add_to_cart',      // thêm vào giỏ hàng      weight: 5.0
        'purchase',         // đã mua                 weight: 10.0
        // Negative
        'cart_remove',         // xóa khỏi giỏ        weight: -1.0
        'checkout_abandon',    // bỏ thanh toán        weight: -0.5
        'search_noresult',     // search không ra gì   weight: -0.5
      ],
      required: true,
    },

    weight:    { type: Number, default: 1 },
    dwellTime: { type: Number, default: 0 }, // seconds — thời gian xem trang

    // ── Context metadata (chuẩn Lazada/Tiki) ────────────────────────────
    context: {
      device:        { type: String, enum: ['mobile', 'desktop', 'tablet', 'unknown'], default: 'unknown' },
      source:        { type: String, enum: ['search', 'recommendation', 'category', 'direct', 'trending', 'banner', 'unknown'], default: 'unknown' },
      position:      { type: Number, default: null },    // vị trí trong danh sách
      searchKeyword: { type: String, default: '' },       // keyword nếu đến từ search
      categoryId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
      brandId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', default: null },
      priceRangeMin: { type: Number, default: null },
      priceRangeMax: { type: Number, default: null },
    },

    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ── Indexes ────────────────────────────────────────────────────────────────
userInteractionSchema.index({ userId: 1, productId: 1 });
userInteractionSchema.index({ sessionId: 1, productId: 1 });
userInteractionSchema.index({ userId: 1, timestamp: -1 });
userInteractionSchema.index({ sessionId: 1, timestamp: -1 });
userInteractionSchema.index({ productId: 1, interactionType: 1 });
userInteractionSchema.index({ timestamp: -1 }); // for time-based queries

// ── Validate: phải có userId hoặc sessionId ────────────────────────────────
userInteractionSchema.pre('save', function (next) {
  if (!this.userId && !this.sessionId) {
    return next(new Error('UserInteraction phải có userId hoặc sessionId'));
  }
  next();
});

module.exports = mongoose.model('UserInteraction', userInteractionSchema);
