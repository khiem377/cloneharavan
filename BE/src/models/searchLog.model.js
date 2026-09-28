const mongoose = require('mongoose');

const searchLogSchema = new mongoose.Schema(
  {
    keyword:       { type: String, required: true, trim: true, lowercase: true },
    count:         { type: Number, default: 1 },
    count24h:      { type: Number, default: 1 },
    countPrev24h:  { type: Number, default: 0 },
    count7d:       { type: Number, default: 1 }, // rolling 7 ngày — dùng cho weekly trending
    clickCount:    { type: Number, default: 0 }, // số click vào kết quả sau khi search
    resultsCount:  { type: Number, default: 1 },
    isTrending:    { type: Boolean, default: false },
    trendingScore: { type: Number, default: 0 },
    lastSearchedAt:  { type: Date, default: Date.now },
    count24hResetAt: { type: Date, default: Date.now }, // khi nào cần rotate window 24h

    // ── v2 Trending Signals ─────────────────────────────────────────────────
    // Twitter-style micro-window: bắt burst ngắn trong 6h (phát hiện trend nhanh hơn 24h)
    count6h:          { type: Number, default: 0 },
    count6hResetAt:   { type: Date, default: Date.now },

    // Shopee/Lazada-style: số lần keyword này dẫn đến purchase — signal mạnh nhất
    purchaseCount:    { type: Number, default: 0 },

    // TikTok-style diversity: số session KHÁC NHAU đã search keyword này
    // 100 người khác nhau >> 1 người search 100 lần
    uniqueSessionCount: { type: Number, default: 0 },
    // Set session IDs đã search trong 24h — dùng để đếm unique (reset cùng count24h)
    // Lưu dạng array, max 500 phần tử để tránh document quá lớn
    sessionIds24h:    { type: [String], default: [], select: false },
  },
  { timestamps: true }
);

searchLogSchema.index({ keyword: 1 }, { unique: true });
searchLogSchema.index({ isTrending: -1, trendingScore: -1, count: -1 });
searchLogSchema.index({ trendingScore: -1, count24h: -1 }); // for trending query

module.exports = mongoose.model('SearchLog', searchLogSchema);
