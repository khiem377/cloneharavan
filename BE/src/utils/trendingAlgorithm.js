/**
 * trendingAlgorithm.js — Enterprise Grade (v3)
 * Unified Trending & Anomaly Detection Algorithm for E-Commerce
 *
 * Combines mathematical models from:
 *   1. Google Trends  — Anomaly Detection Z-Score (Z >= 2.0 / 3.0 Breakout) vs Rolling Baseline
 *   2. TikTok         — Multi-stage Engagement Velocity & Content Discussion Heat
 *   3. Facebook       — Meaningful Social Interactions (MSI: Reviews, Comments, Thread Depth)
 *   4. Twitter / X    — Conversational Acceleration & Micro-burst Window (6h)
 *   5. Reddit         — Logarithmic baseline scale (Early signals carry higher velocity)
 *   6. HackerNews     — Power-law Gravity Time Decay: 1 / (hoursOld + 2)^G
 *   7. Shopee/Amazon  — Commercial Intent Funnel (Search -> CTR -> AddToCart -> Purchase)
 */

// ── Constants ──────────────────────────────────────────────────────────────────
const GRAVITY          = 1.8;   // HackerNews power decay exponent
const WINDOW_24H_MS    = 24 * 60 * 60 * 1000;
const WINDOW_6H_MS     =  6 * 60 * 60 * 1000;
const BREAKOUT_Z_SCORE = 2.5;   // Google Trends Z-Score threshold for Breakout
const BREAKOUT_RATIO   = 4.0;   // Velocity multiplier threshold
const MAX_SESSION_IDS  = 500;   // Cap for unique session tracking

// ── Time Decay (HackerNews Gravity Model) ─────────────────────────────────────
const computeGravityDecay = (lastSearchedAt) => {
  if (!lastSearchedAt) return 0.287; // default for new
  const ageMs    = Math.max(0, Date.now() - new Date(lastSearchedAt).getTime());
  const hoursOld = ageMs / (1000 * 60 * 60);
  return 1 / Math.pow(hoursOld + 2, GRAVITY);
};

// ── Main Scoring Function ──────────────────────────────────────────────────────
/**
 * Tính Trending Score toàn diện v3
 *
 * @param {Object} keywordData
 * @param {number}  keywordData.count              — tổng lượt search all time
 * @param {number}  keywordData.count24h           — lượt search 24h gần nhất
 * @param {number}  keywordData.countPrev24h       — lượt search 24h trước đó
 * @param {number}  keywordData.count7d            — lượt search 7 ngày gần nhất
 * @param {number}  keywordData.count6h            — lượt search 6h gần nhất (Twitter micro-window)
 * @param {number}  keywordData.clickCount         — số click vào sản phẩm
 * @param {number}  keywordData.cartCount          — số lần thêm vào giỏ hàng từ kết quả
 * @param {number}  keywordData.purchaseCount      — số đơn hàng mua thành công (Shopee)
 * @param {number}  keywordData.discussionCount    — số review / comment thảo luận (TikTok/FB MSI)
 * @param {number}  keywordData.uniqueSessionCount — số session duy nhất (TikTok Diversity)
 * @param {number}  keywordData.resultsCount       — số sản phẩm tìm thấy
 * @param {Date}    keywordData.lastSearchedAt
 * @param {boolean} keywordData.isPinned           — admin ghim keyword
 */
const calculateTrendingScore = (keywordData = {}) => {
  const {
    count               = 1,
    count24h            = 1,
    countPrev24h        = 0,
    count7d             = count,
    count6h             = 0,
    clickCount          = 0,
    cartCount           = 0,
    purchaseCount       = 0,
    discussionCount     = 0,
    uniqueSessionCount  = 1,
    resultsCount        = 1,
    lastSearchedAt      = new Date(),
    isPinned            = false,
  } = keywordData;

  // 1. Admin Pinned Override
  if (isPinned) return 999999;

  // 2. Zero-results gate: Không có sản phẩm -> Không bao giờ được phép Trending
  if (!resultsCount || resultsCount <= 0) return 0;

  // 3. Statistical Significance Gate:
  // Chống hiện tượng 1 user tự gõ 1-2 lần rồi tạo "xu hướng ảo"
  // Bắt buộc phải có ít nhất 2 session hoặc có hành vi chuyển đổi (mua/thảo luận/giỏ hàng)
  const hasCommercialSignal = (purchaseCount > 0) || (cartCount > 0) || (discussionCount > 0);
  const hasVolumeThreshold  = (count24h >= 2 && uniqueSessionCount >= 2) || (count7d >= 3);
  if (!hasCommercialSignal && !hasVolumeThreshold) {
    return 0;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // A. Google Trends Anomaly Model (Z-Score vs Rolling Mean)
  // ─────────────────────────────────────────────────────────────────────────
  // Tính baseline trung bình hàng ngày kỳ vọng từ 7 ngày qua
  const expectedDailyMean = Math.max(1, count7d / 7);
  // Độ lệch chuẩn ước lượng theo phân phối Poisson của sự kiện tìm kiếm
  const estimatedStdDev   = Math.sqrt(expectedDailyMean);

  // Z-score 24h: Sự tăng trưởng bất thường trong ngày hôm nay
  const zScore24h = (count24h - expectedDailyMean) / (estimatedStdDev + 1.0);

  // Z-score 6h (Micro-burst của Twitter): Sự đột biến trong 6h qua
  const expected6hMean = expectedDailyMean / 4;
  const zScore6h       = (count6h - expected6hMean) / (Math.sqrt(Math.max(1, expected6hMean)) + 1.0);

  const anomalyVelocityScore = Math.max(0, zScore24h) * 1.5 + Math.max(0, zScore6h) * 2.0;

  // ─────────────────────────────────────────────────────────────────────────
  // B. TikTok & Facebook Discussion & Multi-stage Engagement Velocity
  // ─────────────────────────────────────────────────────────────────────────
  // 1. Logarithmic Base Signal (Reddit): Khối lượng nền tảng
  const logBaseScore = Math.log10(Math.max(1, count7d));

  // 2. Click-Through Rate (CTR)
  const ctr      = clickCount / Math.max(1, count);
  const ctrBonus = Math.min(ctr * 2.5, 2.5);

  // 3. Add to Cart Velocity (Ý định mua mạnh)
  const cartRate  = cartCount / Math.max(1, count);
  const cartBonus = Math.min(cartRate * 5.0, 3.5);

  // 4. Purchase Conversion (Shopee / Amazon CVR - Signal vàng)
  const purchaseRate  = purchaseCount / Math.max(1, count);
  const purchaseBonus = Math.min(purchaseRate * 10.0, 5.0);

  // 5. Discussion & Review Heat (TikTok & Facebook MSI)
  // Bình luận và đánh giá là thước đo độ nóng thảo luận của người dùng
  const discussionScore = Math.log10(1 + discussionCount * 2) * 2.0;

  const totalEngagementScore =
    logBaseScore +
    anomalyVelocityScore +
    ctrBonus +
    cartBonus +
    purchaseBonus +
    discussionScore;

  // ─────────────────────────────────────────────────────────────────────────
  // C. Twitter & TikTok Entropy / Session Diversity (Chống Thao Túng / Bot Flood)
  // ─────────────────────────────────────────────────────────────────────────
  // Tỉ lệ người dùng duy nhất trên tổng số lượt tìm
  const diversityRatio = uniqueSessionCount / Math.max(1, count24h);
  // Nếu 1 user gõ 50 lần -> diversity ~ 0.02 -> Multiplier ~ 0.32 (bị dìm sâu)
  // Nếu 50 user khác nhau cùng tìm -> diversity = 1.0 -> Multiplier = 1.5 (boost mạnh)
  const diversityMultiplier = Math.min(1.5, Math.max(0.3, 0.3 + 1.2 * diversityRatio));

  // ─────────────────────────────────────────────────────────────────────────
  // D. Google Breakout Multiplier
  // ─────────────────────────────────────────────────────────────────────────
  const isBreakout = (zScore24h >= BREAKOUT_Z_SCORE) ||
    (countPrev24h > 0 && count24h / countPrev24h >= BREAKOUT_RATIO);
  const breakoutMultiplier = isBreakout ? 1.6 : 1.0;

  // ─────────────────────────────────────────────────────────────────────────
  // E. HackerNews Power-law Time Decay (Suy giảm tự nhiên theo thời gian)
  // ─────────────────────────────────────────────────────────────────────────
  const gravityDecay = computeGravityDecay(lastSearchedAt);

  // Tổng hợp điểm cuối cùng
  const finalScore = totalEngagementScore * diversityMultiplier * breakoutMultiplier * gravityDecay;

  return {
    score: parseFloat(Math.max(0, finalScore).toFixed(4)),
    zScore: parseFloat(zScore24h.toFixed(2)),
    isBreakout,
    isRising: zScore24h > 1.2 || (count24h > countPrev24h * 1.3),
    diversityRatio: parseFloat(diversityRatio.toFixed(2)),
  };
};

// ── Window Rotation Helpers ────────────────────────────────────────────────────
const needsWindowRotation = (log) => {
  if (!log?.count24hResetAt) return true;
  return Date.now() - new Date(log.count24hResetAt).getTime() >= WINDOW_24H_MS;
};

const needs6hWindowRotation = (log) => {
  if (!log?.count6hResetAt) return true;
  return Date.now() - new Date(log.count6hResetAt).getTime() >= WINDOW_6H_MS;
};

// ── Anti-Spam: In-Memory IP Rate Limiter (Memory Leak Safe) ─────────────────────
const searchIpTracker  = new Map();
const MAX_TRACKER_SIZE = 50000;

setInterval(() => {
  const now    = Date.now();
  const cutoff = 60000;
  for (const [key, history] of searchIpTracker.entries()) {
    const recent = history.filter((t) => now - t < cutoff);
    if (recent.length === 0) {
      searchIpTracker.delete(key);
    } else {
      searchIpTracker.set(key, recent);
    }
  }
  if (searchIpTracker.size > MAX_TRACKER_SIZE) {
    const evictCount = Math.ceil(searchIpTracker.size * 0.1);
    let evicted = 0;
    for (const key of searchIpTracker.keys()) {
      if (evicted >= evictCount) break;
      searchIpTracker.delete(key);
      evicted++;
    }
  }
}, 2 * 60 * 1000);

const isSpamSearchRequest = (ip, keyword) => {
  if (!ip || !keyword) return false;
  const key     = `${ip}:${keyword.toLowerCase().trim()}`;
  const now     = Date.now();
  const history = searchIpTracker.get(key) || [];

  const recent  = history.filter((t) => now - t < 60000);
  recent.push(now);
  searchIpTracker.set(key, recent);

  return recent.length > 10;
};

module.exports = {
  calculateTrendingScore,
  isSpamSearchRequest,
  needsWindowRotation,
  needs6hWindowRotation,
  computeGravityDecay,
  MAX_SESSION_IDS,
  BREAKOUT_RATIO,
  BREAKOUT_Z_SCORE,
};
