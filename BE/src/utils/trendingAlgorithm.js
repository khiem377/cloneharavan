/**
 * trendingAlgorithm.js — v2
 * Enterprise Trending Keywords Algorithm
 *
 * Inspired by:
 *   Google Trends  — Velocity scoring + Breakout detection (>5× prev24h)
 *   Twitter/X      — Micro-window 6h burst score
 *   HackerNews     — Gravity decay: 1/(hoursOld+2)^G
 *   Reddit Hot     — Logarithmic base signal (early signals weight more)
 *   Shopee/Lazada  — Purchase-weighted CTR (dẫn đến mua > chỉ click)
 *   TikTok         — Session diversity (100 người khác >> 1 người 100 lần)
 *
 * Score Formula v2:
 *   score = (
 *     logScore        × 1.0   — Reddit: log10(count7d), volume nền
 *     + velocityScore × 1.0   — Google: growth rate 24h
 *     + microBurst    × 1.5   — Twitter: count6h spike
 *     + ctrBonus      × 1.0   — CTR: click/search
 *     + purchaseBonus × 3.0   — Shopee: dẫn đến mua (signal mạnh nhất)
 *     + diversityBonus× 0.8   — TikTok: unique sessions
 *     + breakoutBonus × 2.0   — Google: "Breakout" 24h > 5× prev24h
 *   ) × gravityDecay
 */

// ── Constants ──────────────────────────────────────────────────────────────────
const GRAVITY         = 1.8;   // HackerNews decay rate — higher = faster decay
const WINDOW_24H_MS   = 24 * 60 * 60 * 1000;
const WINDOW_6H_MS    =  6 * 60 * 60 * 1000;
const BREAKOUT_RATIO  = 5.0;   // Google Trends: "Breakout" nếu 24h > prev24h × 5
const MAX_SESSION_IDS = 500;   // giới hạn sessionIds24h trong SearchLog document

// ── Time Decay (HackerNews Gravity Model) ─────────────────────────────────────
/**
 * ageFactor = 1 / (hoursOld + 2)^GRAVITY
 * hoursOld = 0  → decay = 1/(0+2)^1.8 ≈ 0.287  (bài mới nhưng vẫn bị chiết khấu)
 * hoursOld = 6  → decay ≈ 0.025
 * hoursOld = 24 → decay ≈ 0.003
 */
const computeGravityDecay = (lastSearchedAt) => {
  const ageMs    = Date.now() - new Date(lastSearchedAt).getTime();
  const hoursOld = ageMs / (1000 * 60 * 60);
  return 1 / Math.pow(hoursOld + 2, GRAVITY);
};

// ── Main Scoring Function ──────────────────────────────────────────────────────
/**
 * Tính Trending Score tổng hợp v2
 *
 * @param {Object} keywordData
 * @param {number}  keywordData.count              — tổng lượt search all time
 * @param {number}  keywordData.count24h           — lượt search 24h gần nhất
 * @param {number}  keywordData.countPrev24h       — lượt search 24h trước đó (velocity)
 * @param {number}  keywordData.count7d            — lượt search 7 ngày gần nhất
 * @param {number}  keywordData.count6h            — lượt search 6h gần nhất [v2-Twitter]
 * @param {number}  keywordData.clickCount         — số click vào kết quả
 * @param {number}  keywordData.purchaseCount      — số lần dẫn đến mua [v2-Shopee]
 * @param {number}  keywordData.uniqueSessionCount — số session duy nhất [v2-TikTok]
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
    purchaseCount       = 0,
    uniqueSessionCount  = 0,
    resultsCount        = 1,
    lastSearchedAt      = new Date(),
    isPinned            = false,
  } = keywordData;

  // ── Admin Pinned Override ──
  if (isPinned) return 999999;

  // ── Zero-results penalty: keyword không có SP không nên trending ──
  if (resultsCount === 0) return 0;

  // ─────────────────────────────────────────────────────────────────────────
  // 1. Log Base Score — Reddit-style logarithmic weighting
  //    log10(count7d): 10 search = 1.0, 100 = 2.0, 1000 = 3.0
  //    Early searches carry proportionally more weight than later ones
  // ─────────────────────────────────────────────────────────────────────────
  const logScore = Math.log10(Math.max(1, count7d));

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Velocity Score — Google Trends growth rate 24h
  //    growthRate = (count24h - prev24h) / max(1, prev24h)
  //    × 5 để boost breakout keywords mạnh
  // ─────────────────────────────────────────────────────────────────────────
  const growthRate    = (count24h - countPrev24h) / Math.max(1, countPrev24h);
  const velocityScore = Math.max(0, growthRate) * 5.0;

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Micro-Burst Score — Twitter/X 6h window (×1.5 weight)
  //    Phát hiện trend đang bùng nổ trong 6h ngắn (nhanh hơn 24h nhiều)
  //    microBurst = log10(count6h + 1) — chống keyword không có data 6h
  // ─────────────────────────────────────────────────────────────────────────
  const microBurstScore = Math.log10(Math.max(1, count6h + 1));

  // ─────────────────────────────────────────────────────────────────────────
  // 4. CTR Bonus — Click-through rate
  //    Keyword có CTR cao → người search tìm thấy đúng thứ cần
  //    Cap tại 2.0 để tránh keyword ít search nhưng 1 lần click gây outlier
  // ─────────────────────────────────────────────────────────────────────────
  const ctr      = clickCount / Math.max(1, count);
  const ctrBonus = Math.min(ctr * 3.0, 2.0);

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Purchase Bonus — Shopee/Lazada style (×3.0 weight — signal mạnh nhất)
  //    Từ khóa dẫn đến mua hàng là dấu hiệu rõ nhất của commercial intent
  //    purchaseRate = purchaseCount / max(1, count)
  //    Cap tại 5.0 để tránh outlier khi ít data
  // ─────────────────────────────────────────────────────────────────────────
  const purchaseRate  = purchaseCount / Math.max(1, count);
  const purchaseBonus = Math.min(purchaseRate * 10.0, 5.0);

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Session Diversity Bonus — TikTok style (×0.8 weight)
  //    uniqueSessionCount / count24h → tỷ lệ người khác nhau trong 24h
  //    diversityRatio = 1.0: mỗi search là 1 người mới (tốt nhất)
  //    diversityRatio = 0.1: 1 người search 10 lần (spam)
  //    Bonus = min(diversityRatio × 1.5, 1.0) — cap tại 1.0
  // ─────────────────────────────────────────────────────────────────────────
  const diversityRatio  = uniqueSessionCount / Math.max(1, count24h);
  const diversityBonus  = Math.min(diversityRatio * 1.5, 1.0);

  // ─────────────────────────────────────────────────────────────────────────
  // 7. Breakout Bonus — Google Trends "Breakout" detection (×2.0 weight)
  //    Khi count24h > countPrev24h × BREAKOUT_RATIO (default 5×)
  //    → keyword đang bùng nổ đột biến — boost mạnh
  //    Breakout multiplier tăng tuyến tính theo mức độ "breakout"
  // ─────────────────────────────────────────────────────────────────────────
  const breakoutRatio = countPrev24h > 0
    ? count24h / countPrev24h
    : (count24h > 5 ? BREAKOUT_RATIO : 0); // nếu không có prev → estimate

  const breakoutBonus = breakoutRatio >= BREAKOUT_RATIO
    ? Math.min((breakoutRatio / BREAKOUT_RATIO) * 1.0, 3.0) // cap tại 3.0
    : 0;

  // ─────────────────────────────────────────────────────────────────────────
  // 8. Tổng hợp Base Signal với weighted sum
  // ─────────────────────────────────────────────────────────────────────────
  const baseSignal =
    logScore         * 1.0 +
    velocityScore    * 1.0 +
    microBurstScore  * 1.5 +
    ctrBonus         * 1.0 +
    purchaseBonus    * 3.0 +
    diversityBonus   * 0.8 +
    breakoutBonus    * 2.0;

  // ─────────────────────────────────────────────────────────────────────────
  // 9. HackerNews Gravity Decay — keyword mới nổi được ưu tiên, cũ bị kéo xuống
  //    Final = baseSignal × gravityDecay
  // ─────────────────────────────────────────────────────────────────────────
  const gravityDecay = computeGravityDecay(lastSearchedAt);
  const rawScore     = baseSignal * gravityDecay;

  return parseFloat(rawScore.toFixed(6));
};

// ── Window Rotation Helpers ────────────────────────────────────────────────────

/**
 * Kiểm tra cần rotate 24h window chưa
 */
const needsWindowRotation = (log) => {
  if (!log?.count24hResetAt) return true;
  return Date.now() - new Date(log.count24hResetAt).getTime() >= WINDOW_24H_MS;
};

/**
 * Kiểm tra cần rotate 6h window chưa (Twitter micro-window)
 */
const needs6hWindowRotation = (log) => {
  if (!log?.count6hResetAt) return true;
  return Date.now() - new Date(log.count6hResetAt).getTime() >= WINDOW_6H_MS;
};

// ── Anti-Spam: In-Memory IP Rate Limiter (capped to prevent memory leak) ────────────
const searchIpTracker  = new Map();
const MAX_TRACKER_SIZE = 50_000; // hard cap — phòng memory leak khi bot flood

// Cleanup map mỗi 2 phút (tăng tần suất) + emergency evict khi vượt cap
setInterval(() => {
  const now    = Date.now();
  const cutoff = 60_000;
  for (const [key, history] of searchIpTracker.entries()) {
    const recent = history.filter((t) => now - t < cutoff);
    if (recent.length === 0) {
      searchIpTracker.delete(key);
    } else {
      searchIpTracker.set(key, recent);
    }
  }
  // Emergency evict: nếu vẫn vượt cap sau cleanup, xóa 10% entries củ nhất
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

/**
 * Chống bot/spam: cùng IP search cùng keyword > 10 lần trong 60s → flag
 */
const isSpamSearchRequest = (ip, keyword) => {
  if (!ip || !keyword) return false;
  const key     = `${ip}:${keyword.toLowerCase().trim()}`;
  const now     = Date.now();
  const history = searchIpTracker.get(key) || [];

  const recent  = history.filter((t) => now - t < 60_000);
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
};
