const UserInteraction = require('../models/userInteraction.model');
const PersonalizedRecommendation = require('../models/personalizedRecommendation.model');
const ItemSimilarity = require('../models/itemSimilarity.model');
const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const SearchLog = require('../models/searchLog.model');

// ═══════════════════════════════════════════════════════════════════════════════
// IN-MEMORY TTL CACHE — Giảm DB queries cho hot paths
// Không dùng Redis — trong process, tự expire, thread-safe (single-threaded Node.js)
// ═══════════════════════════════════════════════════════════════════════════════

const TTL_MS = {
  userProfile: 5 * 60 * 1000, // 5 phút — profile đủ lâu để bắt kị session
  trending: 5 * 60 * 1000, // 5 phút — trending thay đổi cưởng độ cao
};

class TtlCache {
  constructor() {
    this._store = new Map();
  }
  get(key) {
    const entry = this._store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { this._store.delete(key); return null; }
    return entry.value;
  }
  set(key, value, ttlMs) {
    this._store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }
  delete(key) { this._store.delete(key); }
  // Cleanup hàng giờ — tránh memory leak
  startCleanup(intervalMs = 60 * 60 * 1000) {
    setInterval(() => {
      const now = Date.now();
      for (const [k, v] of this._store) {
        if (now > v.expiresAt) this._store.delete(k);
      }
    }, intervalMs).unref();
    return this;
  }
}

const cache = new TtlCache().startCleanup();


// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 1: INTERACTION WEIGHTS — Implicit Feedback Table (chuẩn Amazon/Netflix)
// ═══════════════════════════════════════════════════════════════════════════════

const INTERACTION_WEIGHTS = {
  // Positive signals
  view: 1.0,
  product_detail: 1.8,
  search_click: 2.0,
  filter_apply: 1.5,
  compare_add: 1.5,
  wishlist_add: 2.5,
  share_product: 2.0,
  review_submit: 3.0,
  add_to_cart: 5.0,
  purchase: 10.0,
  // Negative signals — quan trọng để học "không thích"
  cart_remove: -1.0,
  checkout_abandon: -0.5,
  search_noresult: -0.5,
};

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 2: TIME DECAY — Hành vi gần đây quan trọng hơn hành vi cũ
// Half-life 7 ngày: weight giảm 50% sau 7 ngày (chuẩn Netflix)
// ═══════════════════════════════════════════════════════════════════════════════

const HALF_LIFE_MS = 7 * 24 * 60 * 60 * 1000; // 7 ngày

const applyTimeDecay = (weight, timestamp) => {
  const ageMs = Date.now() - new Date(timestamp).getTime();
  const decayFactor = Math.exp(-0.693 * ageMs / HALF_LIFE_MS);
  return weight * decayFactor;
};

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 2: SESSION PROFILE BUILDER — Real-time, không cần Python
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Xây dựng user profile từ interaction history (24h gần nhất)
 * Trả về: category preference, brand preference, price range, purchased IDs
 */
const buildUserProfile = async (userId, sessionId) => {
  // Cache key: userId ưu tiên, fallback sessionId
  const cacheKey = `profile:${userId || sessionId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const query = userId
    ? { $or: [{ userId }, { sessionId }] }
    : { sessionId };

  const interactions = await UserInteraction.find({
    ...query,
    timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // 30 ngày
  })
    .sort({ timestamp: -1 })
    .limit(200)
    .populate('productId', 'categories brand cachedPrice')
    .lean();

  const categoryScore = {};
  const brandScore = {};
  const prices = [];
  const purchasedIds = new Set();
  const viewedIds = new Set();

  for (const interaction of interactions) {
    const baseWeight = INTERACTION_WEIGHTS[interaction.interactionType] || 1;
    const decayedWeight = applyTimeDecay(Math.abs(baseWeight), interaction.timestamp);
    const isNegative = baseWeight < 0;

    const product = interaction.productId;
    if (!product) continue;

    const pid = product._id?.toString();
    if (pid) viewedIds.add(pid);

    // Track purchased products — hard filter từ recommendations
    if (interaction.interactionType === 'purchase') {
      purchasedIds.add(pid);
    }

    if (!isNegative) {
      // Aggregate category scores
      if (Array.isArray(product.categories)) {
        for (const catId of product.categories) {
          const key = catId.toString();
          categoryScore[key] = (categoryScore[key] || 0) + decayedWeight;
        }
      }

      // Aggregate brand scores
      if (product.brand) {
        const bKey = product.brand.toString();
        brandScore[bKey] = (brandScore[bKey] || 0) + decayedWeight;
      }




      // Collect prices for range estimation
      // Dùng cachedPrice — luôn đúng kể cả khi product.price = 0
      const effectivePrice = product.cachedPrice || product.price;
      if (effectivePrice && interaction.interactionType !== 'view') {
        prices.push(effectivePrice);
      }
    }
  }

  // Sort by score descending
  const topCategories = Object.entries(categoryScore)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  const topBrands = Object.entries(brandScore)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id);

  // Estimate price range from interactions
  let priceRange = null;
  if (prices.length > 0) {
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const stdDev = Math.sqrt(prices.reduce((a, b) => a + (b - avg) ** 2, 0) / prices.length);
    priceRange = {
      min: Math.max(0, avg - stdDev * 1.5),
      max: avg + stdDev * 1.5,
    };
  }

  const profile = {
    topCategories,
    topBrands,
    priceRange,
    purchasedIds: Array.from(purchasedIds),
    viewedIds: Array.from(viewedIds),
    hasHistory: interactions.length > 0,
  };

  cache.set(cacheKey, profile, TTL_MS.userProfile);
  return profile;
};

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 3: ITEM-TO-ITEM COLLABORATIVE FILTERING — Chuẩn Amazon
// "Users who viewed X also viewed Y" — pre-computed Jaccard similarity
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Compute Item-to-Item co-occurrence matrix từ session data
 * Chạy như 1 batch job — gọi từ cron
 */
const computeItemSimilarityMatrix = async () => {
  console.log('[ItemCF] Computing item-to-item similarity matrix...');

  // Nhóm interactions theo session (cả userId và sessionId)
  // Giảm limit từ 50k → 20k và xử lý theo chunk để tránh O(N²) heap spike
  const CHUNK_SIZE    = 2_000; // số sessions mỗi lần xử lý
  const SESSION_LIMIT = 20_000;

  const sessionGroups = await UserInteraction.aggregate([
    {
      $match: {
        timestamp: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
        interactionType: { $in: ['view', 'product_detail', 'add_to_cart', 'purchase', 'wishlist_add'] },
      },
    },
    {
      $group: {
        _id: { $ifNull: ['$sessionId', { $toString: '$userId' }] },
        products: { $addToSet: '$productId' },
      },
    },
    { $match: { 'products.1': { $exists: true } } },
    { $limit: SESSION_LIMIT },
  ]);

  // ── Chunked processing — xử lý từng chunk, flush vào DB, giải phóng bộ nhớ ──
  const itemCounts  = {}; // thoát ngoài chunk — cần toàn bộ count
  const similarityAccum = {}; // accumulator final similarity (ngoài chunk)

  // Pass 1: Tính item counts toàn bộ (nẫm ngoài chunk loop)
  for (const group of sessionGroups) {
    const prods = group.products.map((p) => p.toString()).slice(0, 20);
    for (const pId of prods) {
      itemCounts[pId] = (itemCounts[pId] || 0) + 1;
    }
  }

  // Pass 2: Chunked co-occurrence computation
  let totalProcessed = 0;
  let bulkOpsTotal   = 0;

  for (let offset = 0; offset < sessionGroups.length; offset += CHUNK_SIZE) {
    const chunk      = sessionGroups.slice(offset, offset + CHUNK_SIZE);
    const coMatrix   = {}; // local to chunk — giải phóng sau mỗi iteration

    for (const group of chunk) {
      const prods = group.products.map((p) => p.toString()).slice(0, 20);
      for (let i = 0; i < prods.length; i++) {
        for (let j = 0; j < prods.length; j++) {
          if (i === j) continue;
          const key = `${prods[i]}__${prods[j]}`;
          coMatrix[key] = (coMatrix[key] || 0) + 1;
        }
      }
      totalProcessed++;
    }

    // Merge chunk co-occurrence vào similarity accumulator
    for (const [key, coCount] of Object.entries(coMatrix)) {
      const [aId, bId] = key.split('__');
      const unionCount = (itemCounts[aId] || 1) + (itemCounts[bId] || 1) - coCount;
      const jaccard    = coCount / Math.max(1, unionCount);

      if (!similarityAccum[aId]) similarityAccum[aId] = {};
      const prev = similarityAccum[aId][bId] || 0;
      // Lấy max jaccard giữa các chunk (vì cùng cặp có thể xuất hiện ở nhiều chunk)
      if (jaccard > prev) similarityAccum[aId][bId] = parseFloat(jaccard.toFixed(4));
    }
    // coMatrix giải phóng tự động khi ra khỏi scope

    // Yield event loop sau mỗi chunk
    await new Promise((r) => setImmediate(r));
  }

  // Upsert vào DB theo chunk 500 ops
  const bulkOps = Object.entries(similarityAccum).map(([itemId, simMap]) => ({
    updateOne: {
      filter: { itemId },
      update: {
        $set: {
          similar: Object.entries(simMap)
            .map(([productId, jaccardScore]) => ({ productId, jaccardScore, type: 'mixed', coOccurrence: 0 }))
            .sort((a, b) => b.jaccardScore - a.jaccardScore)
            .slice(0, 20),
          lastComputedAt: new Date(),
        },
      },
      upsert: true,
    },
  }));

  if (bulkOps.length > 0) {
    const chunkSize = 500;
    for (let i = 0; i < bulkOps.length; i += chunkSize) {
      await ItemSimilarity.bulkWrite(bulkOps.slice(i, i + chunkSize));
      await new Promise((r) => setImmediate(r));
    }
    bulkOpsTotal = bulkOps.length;
  }

  console.log(`[ItemCF] Done. Processed ${totalProcessed} sessions, updated ${bulkOpsTotal} products.`);
  return bulkOpsTotal;
};

/**
 * Query item-to-item similar products (real-time lookup từ pre-computed data)
 */
const getItemCFCandidates = async (productIds, limit = 50) => {
  if (!productIds || productIds.length === 0) return [];

  const docs = await ItemSimilarity.find({ itemId: { $in: productIds } })
    .select('similar')
    .lean();

  // Merge + aggregate scores từ nhiều seed products
  const scoreMap = {};
  for (const doc of docs) {
    for (const sim of doc.similar || []) {
      const pid = sim.productId.toString();
      scoreMap[pid] = (scoreMap[pid] || 0) + sim.jaccardScore;
    }
  }

  // Remove seed products themselves
  for (const pid of productIds.map((p) => p.toString())) {
    delete scoreMap[pid];
  }

  return Object.entries(scoreMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([productId, score]) => ({ productId, itemCFScore: score }));
};

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 4: CONTENT-BASED SIMILARITY SCORER — Multi-factor
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Score a candidate product against user profile
 * Returns numeric score — higher is better
 */
const computeContentScore = (product, userProfile) => {
  let score = 0;

  // Hard filter: đã mua rồi → loại khỏi recommendations
  if (userProfile.purchasedIds.includes(product._id.toString())) return -Infinity;

  // Category match: mỗi category trùng + 3 điểm
  const productCatIds = (product.categories || []).map((c) =>
    (c._id || c).toString()
  );
  const catOverlap = productCatIds.filter((c) => userProfile.topCategories.includes(c));
  score += catOverlap.length * 3;

  // Brand match: + 2 nếu là brand đang quan tâm
  const productBrand = (product.brand?._id || product.brand)?.toString();
  if (productBrand && userProfile.topBrands.includes(productBrand)) {
    score += 2;
  }

  // Price range match — dùng effectivePrice (variant price ưu tiên, fallback product.price)
  // product.price có thể = 0 nếu đã migrate sang variant model
  const effectivePrice = product._variantPrice || product.price || 0;
  if (userProfile.priceRange && effectivePrice > 0) {
    const { min, max } = userProfile.priceRange;
    if (effectivePrice >= min && effectivePrice <= max) {
      score += 1.5;
    } else {
      // Giảm nếu ngoài range xa
      const dist = Math.min(
        Math.abs(effectivePrice - min),
        Math.abs(effectivePrice - max)
      );
      score -= Math.min(1, dist / (max - min + 1));
    }
  }

  // isFeatured / isHot bonus
  if (product.isFeatured) score += 0.5;
  if (product.isHot) score += 0.3;

  // Freshness bonus: sản phẩm mới < 90 ngày
  if (product.createdAt) {
    const ageDays = (Date.now() - new Date(product.createdAt).getTime()) / 86400000;
    score += Math.max(0, 1 - ageDays / 90) * 0.5;
  }

  // Penalty: đã xem rồi (giảm nhưng không loại hẳn)
  if (userProfile.viewedIds.includes(product._id.toString())) {
    score *= 0.4;
  }

  return score;
};

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 5: HYBRID SCORER — Kết hợp SVD + Content + ItemCF + Trending
// ═══════════════════════════════════════════════════════════════════════════════

const HYBRID_WEIGHTS = {
  svd: 0.40, // Long-term preference (Python batch)
  content: 0.30, // Content-based (real-time)
  itemCF: 0.20, // Item-to-Item CF (Amazon style)
  trending: 0.10, // Trending score from SearchLog
};

/**
 * Normalize scores trong một array về [0, 1]
 */
const normalizeScores = (items, key) => {
  const values = items.map((i) => i[key] || 0);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  return items.map((i) => ({ ...i, [key]: ((i[key] || 0) - min) / range }));
};

/**
 * Hybrid scoring: tổng hợp tất cả signals
 */
const hybridScore = (item, weights = HYBRID_WEIGHTS) => {
  return (
    (item.svdScore || 0) * weights.svd +
    (item.contentScore || 0) * weights.content +
    (item.itemCFScore || 0) * weights.itemCF +
    (item.trendingScore || 0) * weights.trending
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 6: TWO-STAGE PIPELINE — Retrieval → Ranking (chuẩn Lazada/Tiki)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Stage 1: Candidate Retrieval — lấy ~200 candidates từ nhiều nguồn
 */
const retrieveCandidates = async (userProfile, svdProductIds = [], limit = 200) => {
  const candidateIds = new Set();

  // Source 1: SVD output từ Python batch
  for (const id of svdProductIds) candidateIds.add(id.toString());

  // Source 2: Item-CF "also viewed" từ viewed history
  if (userProfile.viewedIds.length > 0) {
    const itemCFCandidates = await getItemCFCandidates(
      userProfile.viewedIds.slice(0, 10),
      50
    );
    for (const c of itemCFCandidates) candidateIds.add(c.productId);
  }

  // Source 3: Same category products
  if (userProfile.topCategories.length > 0) {
    const catProds = await Product.find({
      categories: { $in: userProfile.topCategories.slice(0, 2) },
      isActive: true,
      status: 'published',
    })
      .select('_id')
      .limit(60)
      .lean();
    for (const p of catProds) candidateIds.add(p._id.toString());
  }

  // Source 4: Trending products (từ SearchLog + isFeatured)
  const trending = await Product.find({
    $or: [{ isFeatured: true }, { isHot: true }],
    isActive: true,
    status: 'published',
  })
    .select('_id')
    .limit(30)
    .lean();
  for (const p of trending) candidateIds.add(p._id.toString());

  // Remove already purchased
  const purchasedSet = new Set(userProfile.purchasedIds.map((id) => id.toString()));
  const filteredIds = Array.from(candidateIds)
    .filter((id) => !purchasedSet.has(id))
    .slice(0, limit);

  return filteredIds;
};

/**
 * Stage 2: Ranking — score + sort candidates → top N
 */
const rankCandidates = async (candidateIds, userProfile, svdScoreMap = {}, itemCFScoreMap = {}) => {
  if (!candidateIds || candidateIds.length === 0) return [];

  // Fetch full product data
  const products = await Product.find({
    _id: { $in: candidateIds },
    isActive: true,
    status: 'published',
  })
    .populate('brand', 'name logo')
    .populate('categories', 'name slug')
    .lean();

  if (products.length === 0) return [];

  // Trending score — cache 5 phút, tránh aggregation per-request
  const TRENDING_CACHE_KEY = 'trending:score_map';
  let trendingScoreMap = cache.get(TRENDING_CACHE_KEY);

  if (!trendingScoreMap) {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const interactionAgg = await UserInteraction.aggregate([
      {
        $match: {
          timestamp: { $gte: yesterday },
          interactionType: { $in: ['view', 'product_detail', 'add_to_cart', 'purchase'] },
        },
      },
      {
        $group: {
          _id: '$productId',
          score: {
            $sum: {
              $switch: {
                branches: [
                  { case: { $eq: ['$interactionType', 'purchase'] }, then: 10 },
                  { case: { $eq: ['$interactionType', 'add_to_cart'] }, then: 5 },
                  { case: { $eq: ['$interactionType', 'product_detail'] }, then: 1.8 },
                ],
                default: 1,
              },
            },
          },
        },
      },
    ]);
    trendingScoreMap = {};
    for (const t of interactionAgg) {
      trendingScoreMap[t._id.toString()] = t.score;
    }
    cache.set(TRENDING_CACHE_KEY, trendingScoreMap, TTL_MS.trending);
  }

  // Fallback: isFeatured/isHot nếu không có interaction data
  for (const p of products) {
    const pid = p._id.toString();
    if (!trendingScoreMap[pid]) {
      trendingScoreMap[pid] = (p.isFeatured ? 1 : 0) + (p.isHot ? 0.5 : 0);
    }
  }

  // Dùng cachedPrice từ Product model — không cần fetch default variant riêng
  let scoredItems = products.map((p) => {
    const pid = p._id.toString();
    const variantPrice = p.cachedPrice || p.price || 0;
    const contentScore = computeContentScore({ ...p, _variantPrice: variantPrice }, userProfile);

    if (contentScore === -Infinity) return null; // purchased → skip

    return {
      ...p,
      svdScore: svdScoreMap[pid] || 0,
      contentScore: Math.max(0, contentScore),
      itemCFScore: itemCFScoreMap[pid] || 0,
      trendingScore: trendingScoreMap[pid] || 0,
    };
  }).filter(Boolean);

  // Normalize scores về [0,1] trước khi hybrid
  scoredItems = normalizeScores(scoredItems, 'svdScore');
  scoredItems = normalizeScores(scoredItems, 'contentScore');
  scoredItems = normalizeScores(scoredItems, 'itemCFScore');
  scoredItems = normalizeScores(scoredItems, 'trendingScore');

  // Compute final hybrid score
  scoredItems = scoredItems.map((item) => ({
    ...item,
    finalScore: hybridScore(item),
  }));

  // Sort by final score
  scoredItems.sort((a, b) => b.finalScore - a.finalScore);

  // Diversity filter: không quá 3 sản phẩm cùng 1 category trong top results
  const categoryCount = {};
  const diverseItems = [];
  for (const item of scoredItems) {
    const catIds = (item.categories || []).map((c) => (c._id || c).toString());
    const mainCat = catIds[0] || 'none';
    categoryCount[mainCat] = (categoryCount[mainCat] || 0) + 1;
    if (categoryCount[mainCat] <= 3) {
      diverseItems.push(item);
    }
  }

  return diverseItems;
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS — Enrich với variant data
// ═══════════════════════════════════════════════════════════════════════════════

const enrichWithVariants = async (products) => {
  if (!products || products.length === 0) return [];
  const productIds = products.map((p) => p._id);

  // Chỉ fetch default variant để lấy stock — price/salePrice dùng cachedPrice
  const defaultVariants = await ProductVariant.find({
    productId: { $in: productIds },
    isDefault: true,
  }).select('productId stock').lean();

  const stockMap = {};
  defaultVariants.forEach((v) => { stockMap[v.productId.toString()] = v.stock ?? 0; });

  return products.map((p) => ({
    ...p,
    price: p.cachedPrice ?? p.price ?? 0,
    salePrice: p.cachedSalePrice ?? p.salePrice ?? 0,
    stock: stockMap[p._id.toString()] ?? p.stock ?? 0,
    recommendReason: buildRecommendReason(p),
  }));
};

const buildRecommendReason = (product) => {
  if (product.finalScore > 0.8) return 'Phù hợp nhất với bạn';
  if (product.svdScore > 0.6) return 'Dựa trên lịch sử mua hàng';
  if (product.itemCFScore > 0.5) return 'Người dùng tương tự đã xem';
  if (product.contentScore > 0.5) return 'Phù hợp với sở thích của bạn';
  if (product.trendingScore > 0) return 'Đang được nhiều người quan tâm';
  return 'Gợi ý cho bạn';
};

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API: recordUserInteraction
// ═══════════════════════════════════════════════════════════════════════════════

const recordUserInteraction = async (data = {}) => {
  const {
    userId,
    sessionId,
    productId,
    interactionType = 'view',
    dwellTime = 0,
    context = {},
  } = data;

  if (!sessionId && !userId) return null;
  if (!productId) return null;

  const baseWeight = INTERACTION_WEIGHTS[interactionType];
  if (baseWeight === undefined) return null; // unknown type

  const interaction = await UserInteraction.create({
    userId: userId || null,
    sessionId: sessionId || '',
    productId,
    interactionType,
    weight: baseWeight,
    dwellTime,
    context: {
      device: context.device || 'unknown',
      source: context.source || 'unknown',
      position: context.position || null,
      searchKeyword: context.searchKeyword || '',
      categoryId: context.categoryId || null,
      brandId: context.brandId || null,
      priceRangeMin: context.priceRangeMin || null,
      priceRangeMax: context.priceRangeMax || null,
    },
    timestamp: new Date(),
  });

  return interaction;
};

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API: getPersonalizedRecommendations (7-layer hybrid engine)
// ═══════════════════════════════════════════════════════════════════════════════

const getPersonalizedRecommendations = async (params = {}) => {
  const { userId, sessionId, limit = 10 } = params;

  if (!userId && !sessionId) {
    return getFallbackFeaturedProducts(limit);
  }

  // Profile có thể đã có trong cache từ recordUserInteraction gần nhất
  // Invalidate khi user mua hàng — hiện tại tự expire sau TTL
  const userProfile = await buildUserProfile(userId, sessionId);

  // Layer 4 (SVD): Lấy recommendations từ Python batch result
  let svdScoreMap = {};
  let svdProductIds = [];

  const query = userId ? { userId } : { sessionId };
  const recDoc = await PersonalizedRecommendation.findOne(query).lean();

  if (recDoc && recDoc.recommendedProducts?.length > 0) {
    for (const r of recDoc.recommendedProducts) {
      const pid = r.productId.toString();
      svdScoreMap[pid] = r.predictedScore;
      svdProductIds.push(pid);
    }
  }

  // Layer 3: Item-CF score map từ viewed history
  const itemCFCandidates = userProfile.viewedIds.length > 0
    ? await getItemCFCandidates(userProfile.viewedIds.slice(0, 10), 60)
    : [];

  const itemCFScoreMap = {};
  for (const c of itemCFCandidates) {
    itemCFScoreMap[c.productId] = c.itemCFScore;
  }

  // Layer 6 Stage 1: Candidate retrieval
  const candidateIds = await retrieveCandidates(userProfile, svdProductIds, 200);

  if (candidateIds.length === 0) {
    return getFallbackFeaturedProducts(limit);
  }

  // Layer 6 Stage 2: Ranking
  const ranked = await rankCandidates(candidateIds, userProfile, svdScoreMap, itemCFScoreMap);

  // Enrich với variant data
  const enriched = await enrichWithVariants(ranked.slice(0, parseInt(limit, 10)));

  // If still empty — fallback
  if (enriched.length === 0) {
    return getFallbackFeaturedProducts(limit);
  }

  return enriched;
};

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API: getSimilarProducts (nâng cấp từ simple $or → hybrid scoring)
// ═══════════════════════════════════════════════════════════════════════════════

const getSimilarProducts = async (productId, limit = 8, viewerProfile = null) => {
  const currentProduct = await Product.findById(productId)
    .populate('brand', 'name')
    .populate('categories', 'name slug')
    .lean();

  if (!currentProduct) return [];

  // Combine: Item-CF + Content-based
  const itemCFResults = await ItemSimilarity.findOne({ itemId: productId })
    .select('similar')
    .lean();

  const itemCFIds = (itemCFResults?.similar || []).map((s) => s.productId.toString());
  const itemCFScoreMap = {};
  for (const s of itemCFResults?.similar || []) {
    itemCFScoreMap[s.productId.toString()] = s.jaccardScore;
  }

  // Content-based: same category OR same brand
  const contentCandidates = await Product.find({
    _id: { $ne: productId },
    isActive: true,
    status: 'published',
    $or: [
      { categories: { $in: currentProduct.categories?.map((c) => c._id || c) } },
      { brand: currentProduct.brand?._id || currentProduct.brand },
    ],
  })
    .select('_id')
    .limit(60)
    .lean();

  const contentIds = contentCandidates.map((p) => p._id.toString());

  // Merge candidate pool
  const allIds = [...new Set([...itemCFIds, ...contentIds])].filter(
    (id) => id !== productId.toString()
  );

  if (allIds.length === 0) return [];

  // Fetch full products
  const products = await Product.find({ _id: { $in: allIds }, isActive: true, status: 'published' })
    .populate('brand', 'name logo')
    .populate('categories', 'name slug')
    .lean();

  // Build a simplified user profile from current product if no viewer profile
  const fakeProfile = viewerProfile || {
    topCategories: (currentProduct.categories || []).map((c) => (c._id || c).toString()),
    topBrands: [((currentProduct.brand?._id) || currentProduct.brand)?.toString()].filter(Boolean),
    priceRange: currentProduct.price
      ? { min: currentProduct.price * 0.5, max: currentProduct.price * 2 }
      : null,
    purchasedIds: [],
    viewedIds: [productId.toString()],
  };

  // Score each
  let scored = products.map((p) => {
    const pid = p._id.toString();
    const contentScore = computeContentScore(p, fakeProfile);
    if (contentScore === -Infinity) return null;

    return {
      ...p,
      itemCFScore: itemCFScoreMap[pid] || 0,
      contentScore: Math.max(0, contentScore),
      svdScore: 0,
      trendingScore: (p.isFeatured ? 1 : 0) + (p.isHot ? 0.5 : 0),
    };
  }).filter(Boolean);

  // Normalize + hybrid score
  scored = normalizeScores(scored, 'itemCFScore');
  scored = normalizeScores(scored, 'contentScore');
  scored = normalizeScores(scored, 'trendingScore');

  scored = scored.map((item) => ({
    ...item,
    finalScore: hybridScore(item, { svd: 0, content: 0.5, itemCF: 0.4, trending: 0.1 }),
  }));

  scored.sort((a, b) => b.finalScore - a.finalScore);

  // Enrich
  return enrichWithVariants(scored.slice(0, parseInt(limit, 10)));
};

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API: getTrendingRecommendations — Sản phẩm trending real-time
// ═══════════════════════════════════════════════════════════════════════════════

const getTrendingRecommendations = async (limit = 10) => {
  // Lấy interaction count 24h gần nhất theo sản phẩm
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const trending = await UserInteraction.aggregate([
    {
      $match: {
        timestamp: { $gte: yesterday },
        interactionType: { $in: ['view', 'add_to_cart', 'purchase', 'product_detail'] },
      },
    },
    {
      $group: {
        _id: '$productId',
        totalWeight: {
          $sum: {
            $switch: {
              branches: [
                { case: { $eq: ['$interactionType', 'purchase'] }, then: 10 },
                { case: { $eq: ['$interactionType', 'add_to_cart'] }, then: 5 },
                { case: { $eq: ['$interactionType', 'product_detail'] }, then: 1.8 },
                { case: { $eq: ['$interactionType', 'view'] }, then: 1 },
              ],
              default: 1,
            },
          },
        },
        interactCount: { $sum: 1 },
      },
    },
    { $sort: { totalWeight: -1 } },
    { $limit: limit * 2 },
  ]);

  if (trending.length === 0) return getFallbackFeaturedProducts(limit);

  const productIds = trending.map((t) => t._id);
  const trendScoreMap = {};
  for (const t of trending) {
    trendScoreMap[t._id.toString()] = t.totalWeight;
  }

  const products = await Product.find({
    _id: { $in: productIds },
    isActive: true,
    status: 'published',
  })
    .populate('brand', 'name logo')
    .populate('categories', 'name slug')
    .lean();

  const sorted = products
    .map((p) => ({ ...p, trendingScore: trendScoreMap[p._id.toString()] || 0 }))
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, parseInt(limit, 10));

  return enrichWithVariants(sorted);
};

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API: getSessionBasedRecommendations — Real-time, không cần Python
// ═══════════════════════════════════════════════════════════════════════════════

const getSessionBasedRecommendations = async (params = {}) => {
  const { userId, sessionId, limit = 8 } = params;
  if (!userId && !sessionId) return getTrendingRecommendations(limit);

  // Build profile từ session
  const userProfile = await buildUserProfile(userId, sessionId);

  if (!userProfile.hasHistory) {
    return getTrendingRecommendations(limit);
  }

  // Lấy candidates từ Item-CF + same category (không cần Python SVD)
  const itemCFCandidates = await getItemCFCandidates(
    userProfile.viewedIds.slice(0, 5),
    40
  );
  const itemCFScoreMap = {};
  const itemCFIds = [];
  for (const c of itemCFCandidates) {
    itemCFScoreMap[c.productId] = c.itemCFScore;
    itemCFIds.push(c.productId);
  }

  const catProds = await Product.find({
    categories: { $in: userProfile.topCategories.slice(0, 2) },
    isActive: true,
    status: 'published',
  }).select('_id').limit(40).lean();

  const allIds = [
    ...new Set([...itemCFIds, ...catProds.map((p) => p._id.toString())]),
  ].filter((id) => !userProfile.purchasedIds.includes(id));

  if (allIds.length === 0) return getTrendingRecommendations(limit);

  const ranked = await rankCandidates(allIds, userProfile, {}, itemCFScoreMap);
  return enrichWithVariants(ranked.slice(0, parseInt(limit, 10)));
};

// ═══════════════════════════════════════════════════════════════════════════════
// Fallback: Featured Products (cold start)
// ═══════════════════════════════════════════════════════════════════════════════

const getFallbackFeaturedProducts = async (limit = 10) => {
  const products = await Product.find({ isActive: true, status: 'published' })
    .sort({ isFeatured: -1, isHot: -1, createdAt: -1 })
    .limit(parseInt(limit, 10))
    .populate('brand', 'name logo')
    .populate('categories', 'name slug')
    .lean();

  return enrichWithVariants(
    products.map((p) => ({
      ...p,
      finalScore: 1.0,
      recommendReason: 'Sản phẩm nổi bật nhiều người quan tâm',
    }))
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Session merge (giữ nguyên)
// ═══════════════════════════════════════════════════════════════════════════════

const mergeSessionInteractions = async (sessionId, userId) => {
  if (!sessionId || !userId) return;
  try {
    await UserInteraction.updateMany(
      { sessionId, userId: null },
      { $set: { userId } }
    );

    const existingUserRec = await PersonalizedRecommendation.findOne({ userId });
    const sessionRec = await PersonalizedRecommendation.findOne({ sessionId, userId: null });

    if (sessionRec) {
      if (existingUserRec) {
        const existingPids = new Set(
          existingUserRec.recommendedProducts.map((r) => r.productId.toString())
        );
        const toAdd = sessionRec.recommendedProducts.filter(
          (r) => !existingPids.has(r.productId.toString())
        );
        if (toAdd.length > 0) {
          await PersonalizedRecommendation.updateOne(
            { _id: existingUserRec._id },
            { $push: { recommendedProducts: { $each: toAdd } } }
          );
        }
        await PersonalizedRecommendation.deleteOne({ _id: sessionRec._id });
      } else {
        await PersonalizedRecommendation.updateOne(
          { _id: sessionRec._id },
          { $set: { userId, sessionId: '' } }
        );
      }
    }
  } catch (err) {
    console.warn('[RecommendationService] mergeSessionInteractions error:', err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  recordUserInteraction,
  mergeSessionInteractions,
  getPersonalizedRecommendations,
  getSessionBasedRecommendations,
  getTrendingRecommendations,
  getSimilarProducts,
  computeItemSimilarityMatrix,
  buildUserProfile,
  applyTimeDecay,
};
