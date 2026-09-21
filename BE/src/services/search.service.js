const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const BlogPost = require('../models/blogPost.model');
const Brand = require('../models/brand.model');
const Category = require('../models/category.model');
const SearchLog = require('../models/searchLog.model');
const {
  removeVietnameseTones,
  extractAcronyms,
  parseSearchQuery,
  calculateRelevanceScore,
} = require('../utils/searchEngine');
const {
  calculateTrendingScore,
  isSpamSearchRequest,
  needsWindowRotation,
  needs6hWindowRotation,
  MAX_SESSION_IDS,
  BREAKOUT_RATIO,
} = require('../utils/trendingAlgorithm');

/**
 * Log or increment search keyword — với 24h window rotation + count7d rolling
 */
/**
 * recordSearchKeyword v2 — thêm sessionId để track unique sessions + count6h micro-window
 *
 * @param {string} rawKeyword   — keyword gốc từ user input
 * @param {number} resultsCount — số sản phẩm tìm thấy
 * @param {string} clientIp     — IP để chống spam
 * @param {string} sessionId    — browser sessionId (anonymousId) để đếm unique users [v2-TikTok]
 */
const recordSearchKeyword = async (rawKeyword, resultsCount = 1, clientIp = '', sessionId = '') => {
  if (!rawKeyword || rawKeyword.trim().length < 2) return;
  const keyword = rawKeyword.trim().toLowerCase();

  // Prevent Bot / Spam Manipulation
  if (clientIp && isSpamSearchRequest(clientIp, keyword)) return;

  try {
    // Lấy log hiện tại kèm sessionIds24h (select: false nên cần explicit)
    const log = await SearchLog.findOne({ keyword }).select('+sessionIds24h');
    const now = new Date();

    // ── 24h Window Rotation ─────────────────────────────────────────────────
    // nếu đã qua 24h → chuyển count24h → countPrev24h, reset sessionIds24h
    const shouldRotate24h = needsWindowRotation(log);
    const prevCount24h    = shouldRotate24h ? (log?.count24h || 0) : (log?.countPrev24h || 0);
    const new24h          = shouldRotate24h ? 1 : (log?.count24h || 0) + 1;

    // ── 6h Window Rotation (Twitter micro-window) ────────────────────────────
    const shouldRotate6h = needs6hWindowRotation(log);
    const new6h          = shouldRotate6h ? 1 : (log?.count6h || 0) + 1;

    // ── Unique Session Tracking (TikTok diversity) ───────────────────────────
    // Đếm unique sessionIds trong 24h — reset cùng 24h window
    let currentSessionIds = shouldRotate24h ? [] : (log?.sessionIds24h || []);
    let uniqueSessionCount = log?.uniqueSessionCount || 0;
    if (sessionId && !currentSessionIds.includes(sessionId)) {
      currentSessionIds.push(sessionId);
      // Giới hạn max size để tránh document quá lớn
      if (currentSessionIds.length > MAX_SESSION_IDS) {
        currentSessionIds = currentSessionIds.slice(-MAX_SESSION_IDS);
      }
      uniqueSessionCount = currentSessionIds.length;
    }

    const newCount       = (log?.count || 0) + 1;
    const new7d          = (log?.count7d || 0) + 1;
    const clickCount     = log?.clickCount || 0;
    const purchaseCount  = log?.purchaseCount || 0;
    const isPinned       = log?.isTrending || false;

    const trendingScore = calculateTrendingScore({
      count:              newCount,
      count24h:           new24h,
      countPrev24h:       prevCount24h,
      count7d:            new7d,
      count6h:            new6h,
      clickCount,
      purchaseCount,
      uniqueSessionCount,
      resultsCount,
      lastSearchedAt:     now,
      isPinned,
    });

    // Build update operation — tách 2 case: rotate 24h hay không
    const baseSet = {
      resultsCount,
      lastSearchedAt:  now,
      trendingScore,
      uniqueSessionCount,
      sessionIds24h: currentSessionIds,
    };

    if (shouldRotate24h) {
      // Reset cả 24h window lẫn 6h nếu cần
      await SearchLog.findOneAndUpdate(
        { keyword },
        {
          $set: {
            ...baseSet,
            count:           newCount,
            count24h:        1,
            countPrev24h:    prevCount24h,
            count7d:         new7d,
            count6h:         new6h,
            count24hResetAt: now,
            count6hResetAt:  now,
          },
        },
        { upsert: true, new: true }
      );
    } else if (shouldRotate6h) {
      // Chỉ reset 6h window
      await SearchLog.findOneAndUpdate(
        { keyword },
        {
          $inc: { count: 1, count24h: 1, count7d: 1 },
          $set: { ...baseSet, count6h: 1, count6hResetAt: now },
        },
        { upsert: true, new: true }
      );
    } else {
      // Tăng bình thường
      await SearchLog.findOneAndUpdate(
        { keyword },
        {
          $inc: { count: 1, count24h: 1, count7d: 1, count6h: 1 },
          $set: baseSet,
        },
        { upsert: true, new: true }
      );
    }
  } catch (err) {
    // Ignore error — không để search fail vì log
  }
};

/**
 * recordPurchaseKeyword — Shopee/Lazada style purchase signal
 * Gọi từ checkout service khi user mua thành công.
 * Tăng purchaseCount cho tất cả keywords mà user đã search trong session.
 *
 * @param {string[]} keywords — mảng keywords đã search trong session (lưu ở client)
 */
const recordPurchaseKeyword = async (keywords = []) => {
  if (!keywords || keywords.length === 0) return;
  try {
    const cleanKeywords = keywords
      .filter((k) => k && k.trim().length >= 2)
      .map((k) => k.trim().toLowerCase())
      .slice(0, 20); // giới hạn 20 keywords tối đa

    if (cleanKeywords.length === 0) return;

    // Bulk tăng purchaseCount cho tất cả keywords
    await SearchLog.updateMany(
      { keyword: { $in: cleanKeywords } },
      { $inc: { purchaseCount: 1 } }
    );
  } catch (err) {
    // Ignore — không để checkout fail vì log
  }
};

/**
 * Record search click — tăng clickCount khi user click vào kết quả
 * Gọi từ client khi user click vào sản phẩm từ search results
 */
const recordSearchClick = async (rawKeyword) => {
  if (!rawKeyword || rawKeyword.trim().length < 2) return;
  const keyword = rawKeyword.trim().toLowerCase();
  try {
    await SearchLog.findOneAndUpdate(
      { keyword },
      { $inc: { clickCount: 1 } },
      { upsert: false } // chỉ update nếu đã có, không tạo mới
    );
  } catch (err) {
    // Ignore
  }
};

/**
 * Builds MongoDB regex search conditions for a parsed query
 */
const buildSmartSearchRegex = (parsedQuery) => {
  const { normalized, tokens } = parsedQuery;
  const regexPatterns = [];

  // Match full normalized string
  if (normalized) {
    regexPatterns.push(new RegExp(normalized.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i'));
  }

  // Match each token
  tokens.forEach((t) => {
    if (t.length > 1) {
      regexPatterns.push(new RegExp(t.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i'));
    }
  });

  return regexPatterns;
};

/**
 * Global Multi-Domain Smart Search Engine
 * @param {Object} query  — req.query params (q, domain, page, limit)
 * @param {Object} req    — Express request object (optional, dùng để lấy sessionId + clientIp)
 */
const globalSearch = async (query = {}, req = null) => {
  const { q, domain = 'all', page = 1, limit = 20 } = query;
  const parsed = parseSearchQuery(q);

  if (!parsed.normalized) {
    return {
      products: [],
      blogs: [],
      brands: [],
      categories: [],
      total: 0,
    };
  }

  // Async record search keyword for analytics — lấy sessionId và clientIp từ req headers
  const sessionId = req?.headers?.['x-session-id'] || '';
  const clientIp  = req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim()
                 || req?.socket?.remoteAddress
                 || '';
  recordSearchKeyword(parsed.raw, 0, clientIp, sessionId);

  const regexList = buildSmartSearchRegex(parsed);

  // Construct MongoDB Or Conditions
  const nameOrCodeConditions = regexList.map((reg) => ({
    $or: [
      { name: reg },
      { slug: reg },
      { sku: reg },
      { productCode: reg },
      { description: reg },
    ],
  }));

  const results = {
    products: [],
    blogs: [],
    brands: [],
    categories: [],
  };

  // 1. SEARCH PRODUCTS
  if (domain === 'all' || domain === 'products') {
    // Ưu tiên $text index (nhanh nhất) — Product model đã có index { name: 'text', sku: 'text' }
    // $text không cần regex scan, dùng inverted index = O(log N)
    const textQuery = parsed.normalized
      ? {
          isActive: true,
          status: 'published',
          $text: { $search: parsed.normalized },
        }
      : null;

    const regexQuery = {
      isActive: true,
      status: 'published',
      $or: [
        ...nameOrCodeConditions.flatMap((c) => c.$or),
        { name: { $regex: parsed.normalized, $options: 'i' } },
        // searchTokens index — văn phóng tiếng Việt + viết tắt
        { searchTokens: { $in: parsed.tokens.filter((t) => t.length >= 2) } },
      ],
    };

    // Chạy cả 2 queries song song — merge result và deduplicate
    const [textResults, regexResults] = await Promise.all([
      textQuery
        ? Product.find(textQuery, { score: { $meta: 'textScore' } })
            .sort({ score: { $meta: 'textScore' } })
            .populate('categories', 'name slug')
            .populate('brand', 'name slug logo')
            .limit(30)
            .lean()
        : [],
      Product.find(regexQuery)
        .populate('categories', 'name slug')
        .populate('brand', 'name slug logo')
        .limit(50)
        .lean(),
    ]);

    // Merge + deduplicate by _id
    const seenIds = new Set();
    const rawProducts = [];
    for (const p of [...textResults, ...regexResults]) {
      const id = p._id.toString();
      if (!seenIds.has(id)) {
        seenIds.add(id);
        rawProducts.push(p);
      }
    }

    // Fetch variants & calculate default price/stock
    const productIds = rawProducts.map((p) => p._id);
    const variants = await ProductVariant.find({ productId: { $in: productIds } }).lean();

    const variantsByProd = {};
    variants.forEach((v) => {
      const pid = v.productId.toString();
      if (!variantsByProd[pid]) variantsByProd[pid] = [];
      variantsByProd[pid].push(v);
    });

    // Score & Enrich Products
    const scoredProducts = rawProducts.map((p) => {
      const pVariants  = variantsByProd[p._id.toString()] || [];
      const defaultVar = pVariants.find((v) => v.isDefault) || pVariants[0];
      const score      = calculateRelevanceScore(p, parsed);

      return {
        ...p,
        price:     defaultVar?.price     || p.cachedPrice     || p.price     || 0,
        salePrice: defaultVar?.salePrice || p.cachedSalePrice || p.salePrice || 0,
        stock:     defaultVar?.stock     || p.stock || 0,
        sku:       defaultVar?.sku       || p.sku || p.productCode || '',
        score,
      };
    });

    scoredProducts.sort((a, b) => b.score - a.score);
    results.products = scoredProducts.slice(0, parseInt(limit, 10));
  }

  // 2. SEARCH BLOG POSTS
  if (domain === 'all' || domain === 'blogs') {
    const blogRegex = new RegExp(parsed.normalized, 'i');
    const blogs = await BlogPost.find({
      status: 'published',
      $or: [{ title: blogRegex }, { slug: blogRegex }, { excerpt: blogRegex }],
    })
      .populate('categories', 'name slug')
      .limit(10)
      .lean();

    results.blogs = blogs.map((b) => ({
      ...b,
      score: calculateRelevanceScore(b, parsed),
    })).sort((a, b) => b.score - a.score);
  }

  // 3. SEARCH BRANDS
  if (domain === 'all' || domain === 'brands') {
    const brandRegex = new RegExp(parsed.normalized, 'i');
    const brands = await Brand.find({
      isActive: true,
      $or: [{ name: brandRegex }, { slug: brandRegex }],
    })
      .limit(10)
      .lean();

    results.brands = brands;
  }

  // 4. SEARCH CATEGORIES
  if (domain === 'all' || domain === 'categories') {
    const catRegex = new RegExp(parsed.normalized, 'i');
    const categories = await Category.find({
      isActive: true,
      $or: [{ name: catRegex }, { slug: catRegex }],
    })
      .limit(10)
      .lean();

    results.categories = categories;
  }

  const total =
    results.products.length +
    results.blogs.length +
    results.brands.length +
    results.categories.length;

  return {
    query: parsed.raw,
    domain,
    results,
    total,
  };
};

/**
 * Instant Autocomplete Search Suggestions Endpoint (Sub-20ms preview)
 */
const getInstantSuggestions = async (q = '') => {
  const parsed = parseSearchQuery(q);
  if (!parsed.normalized) {
    const trending = await getTrendingKeywords();
    return {
      products: [],
      blogs: [],
      brands: [],
      categories: [],
      trendingKeywords: trending.slice(0, 6),
    };
  }

  const regex  = new RegExp(parsed.normalized, 'i');
  const tokens = parsed.tokens;

  // Build token-based query — dùng searchTokens index thay vì full scan
  // searchTokens đã được index trên Product model (xem product.model.js L152)
  const tokenOrConditions = tokens.length > 0
    ? tokens.map((t) => ({ searchTokens: new RegExp(t, 'i') }))
    : [{ searchTokens: { $regex: parsed.normalized, $options: 'i' } }];

  const [matchedProducts, blogs, brands, categories, trendingKeywords] = await Promise.all([
    Product.find({
      isActive: true,
      status: 'published',
      $or: [
        // Ưu tiên searchTokens index (nhanh nhất)
        ...tokenOrConditions,
        // Fallback: text match trực tiếp
        { name: regex },
        { productCode: regex },
        { sku: regex },
      ],
    })
      .select('name slug price salePrice thumbnail productCode sku cachedPrice cachedSalePrice')
      .limit(20) // giảm từ 100 → 20 vì đã lọc phía DB
      .lean(),

    BlogPost.find({
      status: 'published',
      $or: [{ title: regex }, { slug: regex }],
    })
      .select('title slug thumbnail excerpt createdAt')
      .limit(3)
      .lean(),

    Brand.find({ isActive: true, name: regex })
      .select('name slug logo')
      .limit(3)
      .lean(),

    Category.find({ isActive: true, name: regex })
      .select('name slug icon image')
      .limit(3)
      .lean(),

    getTrendingKeywords(),
  ]);

  // Score đơn giản hơn — không cần lọc thỗ vì DB đã filter
  const scoredProducts = matchedProducts
    .map((p) => ({
      _id: p._id,
      name: p.name,
      slug: p.slug,
      price: p.cachedPrice || p.price || 0,
      salePrice: p.cachedSalePrice || p.salePrice || 0,
      thumbnail: p.thumbnail,
      productCode: p.productCode || p.sku || '',
      score: calculateRelevanceScore(p, parsed),
    }))
    .sort((a, b) => b.score - a.score);

  return {
    query: parsed.raw,
    products: scoredProducts.slice(0, 5),
    blogs,
    brands,
    categories,
    trendingKeywords: trendingKeywords.slice(0, 6),
  };
};

/**
 * Get Top Trending Search Keywords v2
 * Trả về trending keywords cho client search bar
 *
 * @param {number} limit — số keyword trả về (default 10)
 * @param {string} type  — 'all' | 'rising' | 'breakout' | 'hot'
 *   - 'all':      sort theo trendingScore (tổng hợp tất cả signal)
 *   - 'rising':   đang tăng nhanh trong 24h (count24h > prev24h × 1.3)
 *   - 'breakout': bùng nổ đột biến — Google Trends Breakout (count24h > prev24h × 5)
 *   - 'hot':      thuần theo volume 24h tuyệt đối (sort count24h)
 */
const getTrendingKeywords = async (limit = 10, type = 'all') => {
  let query = { resultsCount: { $gt: 0 } };
  let sortOpt = { isTrending: -1, trendingScore: -1, count24h: -1 };

  if (type === 'rising') {
    // Đang tăng nhanh ≥ 30% so với kỳ trước
    query = {
      ...query,
      $expr: { $gt: ['$count24h', { $multiply: ['$countPrev24h', 1.3] }] },
    };
  } else if (type === 'breakout') {
    // Google Trends Breakout: tăng > BREAKOUT_RATIO (5×) so với kỳ trước
    query = {
      ...query,
      countPrev24h: { $gt: 0 }, // chỉ lấy những keyword có data prev
      $expr: {
        $gte: [
          '$count24h',
          { $multiply: ['$countPrev24h', BREAKOUT_RATIO] },
        ],
      },
    };
    sortOpt = { count24h: -1 }; // sort theo volume khi breakout
  } else if (type === 'hot') {
    // Thuần volume 24h — không quan tâm growth rate
    sortOpt = { isTrending: -1, count24h: -1, count7d: -1 };
  }

  const logs = await SearchLog.find(query)
    .sort(sortOpt)
    .limit(parseInt(limit, 10))
    .lean();

  return logs.map((l) => {
    const breakoutRatio = l.countPrev24h > 0 ? (l.count24h || 0) / l.countPrev24h : 0;
    return {
      keyword:         l.keyword,
      count:           l.count,
      count24h:        l.count24h || 0,
      count6h:         l.count6h || 0,
      purchaseCount:   l.purchaseCount || 0,
      isTrending:      l.isTrending,
      isRising:        (l.count24h || 0) > (l.countPrev24h || 0) * 1.3,
      isBreakout:      breakoutRatio >= BREAKOUT_RATIO,   // Google Trends Breakout flag
      breakoutRatio:   parseFloat(breakoutRatio.toFixed(1)),
      score:           l.trendingScore || 0,
    };
  });
};

/**
 * Admin Toggle Trending Keyword
 */
const setKeywordTrending = async (keyword, isTrending = true) => {
  const log = await SearchLog.findOneAndUpdate(
    { keyword: keyword.trim().toLowerCase() },
    { isTrending },
    { upsert: true, new: true }
  );
  return log;
};

module.exports = {
  globalSearch,
  getInstantSuggestions,
  getTrendingKeywords,
  setKeywordTrending,
  recordSearchKeyword,
  recordSearchClick,
  recordPurchaseKeyword, // v2: Shopee-style purchase signal
};
