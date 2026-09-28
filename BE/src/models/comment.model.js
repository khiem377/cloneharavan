const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'],
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const commentSchema = new mongoose.Schema(
  {
    // Đối tượng bình luận: 'product' hoặc 'blog'
    targetType: {
      type: String,
      enum: ['product', 'blog'],
      default: 'blog',
      required: true,
      index: true,
    },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null, index: true },
    postId:    { type: mongoose.Schema.Types.ObjectId, ref: 'BlogPost', default: null, index: true },

    // Đánh giá sao (1 - 5★) — Chỉ áp dụng cho sản phẩm và comment gốc (depth: 0)
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },

    // Xác nhận đã mua hàng (Verified Purchase)
    isPurchased: {
      type: Boolean,
      default: false,
    },

    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorInfo: {
      name:   { type: String, default: 'Khách hàng' },
      avatar: { type: String, default: '' },
      role:   { type: String, default: 'customer' }, // 'customer' | 'admin' | 'staff'
    },

    content: { type: String, required: true, maxlength: 5000 },

    // Cấu trúc lồng 3 cấp chuẩn Facebook (depth: 0 -> 1 -> 2)
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null, index: true },
    rootId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null, index: true },
    depth:    { type: Number, default: 0, min: 0, max: 2 },
    path:     { type: String, default: '' },

    reactions: [reactionSchema],
    reactionCounts: {
      like:  { type: Number, default: 0 },
      love:  { type: Number, default: 0 },
      haha:  { type: Number, default: 0 },
      wow:   { type: Number, default: 0 },
      sad:   { type: Number, default: 0 },
      angry: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },

    replyCount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['pending', 'approved', 'spam', 'rejected'],
      default: 'approved',
      index: true,
    },
    rejectionReason: { type: String, default: '' },

    isEdited:  { type: Boolean, default: false },
    editedAt:  { type: Date, default: null },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },

    mentions:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    attachments: [{ url: String, type: { type: String, default: 'image' } }],
  },
  { timestamps: true }
);

commentSchema.index({ targetType: 1, productId: 1, parentId: 1, status: 1, createdAt: -1 });
commentSchema.index({ targetType: 1, postId: 1, parentId: 1, status: 1, createdAt: -1 });
commentSchema.index({ authorId: 1 });
commentSchema.index({ path: 1 });
commentSchema.index({ 'reactions.userId': 1 });

module.exports = mongoose.model('Comment', commentSchema);
