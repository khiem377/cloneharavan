const mongoose = require('mongoose');

/**
 * ChatSession Model — Lưu trữ lịch sử hội thoại & Hồ sơ sở thích khách hàng (Customer Intelligence Profile)
 * Giúp Chatbot duy trì ngữ cảnh xuyên suốt, không bị mất khi reload, và học sở thích khách hàng qua thời gian.
 */
const chatSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    messages: [
      {
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        products: { type: Array, default: [] },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    // Hồ sơ khách hàng tự động tích lũy (Customer Memory & Preferences)
    profile: {
      preferredBrands: [{ type: String }],
      preferredCategories: [{ type: String }],
      budgetMin: { type: Number, default: null },
      budgetMax: { type: Number, default: null },
      preferredSizes: [{ type: String }],
      lastTopic: { type: String, default: '' },
      viewedProducts: [{ type: String }],
      inquiryCount: { type: Number, default: 0 },
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// Tự động dọn dẹp các session không hoạt động sau 60 ngày
chatSessionSchema.index({ lastActiveAt: 1 }, { expireAfterSeconds: 60 * 24 * 60 * 60 });

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

module.exports = ChatSession;
