const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const BlogPost = require('../models/blogPost.model');
const BlogCategory = require('../models/blogCategory.model');
const Media = require('../models/media.model');
const Brand = require('../models/brand.model');
const Category = require('../models/category.model');
const SearchLog = require('../models/searchLog.model');
const FlashSale = require('../models/flashSale.model');

async function getActiveFlashSaleMap() {
  try {
    const now = new Date();
    const activeSales = await FlashSale.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).lean();

    const fsMap = new Map();
    activeSales.forEach((sale) => {
      (sale.items || []).forEach((item) => {
        const pId = item.productId?.toString() || item.productId;
        if (pId) {
          const current = fsMap.get(pId);
          if (!current || (item.flashSalePrice && item.flashSalePrice < current.flashSalePrice)) {
            fsMap.set(pId, {
              flashSaleId: sale._id,
              flashSaleName: sale.name,
              flashSaleSlug: sale.slug,
              flashSalePrice: item.flashSalePrice,
              originalPrice: item.originalPrice,
              stockLimit: item.stockLimit,
              soldCount: item.soldCount,
            });
          }
        }
      });
    });
    return fsMap;
  } catch (err) {
    console.error('[SearchService] getActiveFlashSaleMap error:', err.message);
    return new Map();
  }
}

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
  const { normalized, tokens = [], synonyms = [] } = parsedQuery;
  const regexPatterns = [];

  const escapeRegExp = (str) => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

  if (normalized) {
    regexPatterns.push(new RegExp(escapeRegExp(normalized), 'i'));
  }

  tokens.forEach((t) => {
    if (t.length > 2) {
      regexPatterns.push(new RegExp(escapeRegExp(t), 'i'));
    } else if (t.length > 0) {
      regexPatterns.push(new RegExp(`(?:^|[^a-zA-Z0-9])${escapeRegExp(t)}(?:$|[^a-zA-Z0-9])`, 'i'));
    }
  });

  synonyms.forEach((syn) => {
    if (syn.length > 2) {
      regexPatterns.push(new RegExp(escapeRegExp(syn), 'i'));
    } else if (syn.length > 0) {
      regexPatterns.push(new RegExp(`(?:^|[^a-zA-Z0-9])${escapeRegExp(syn)}(?:$|[^a-zA-Z0-9])`, 'i'));
    }
  });

  return regexPatterns;
};

const extractProductAttributes = (p, pVariants = []) => {
  const attrMap = {};

  const addAttr = (key, val) => {
    if (!key || !val) return;
    let cleanKey = String(key).trim();
    let cleanVal = String(val).trim();
    if (!cleanKey || !cleanVal || cleanVal.length > 50) return;

    const lowerKey = cleanKey.toLowerCase();
    const lowerVal = cleanVal.toLowerCase();

    if (
      lowerKey === 'kích thước' ||
      lowerKey === 'kích thước màn hình' ||
      lowerKey === 'màn hình' ||
      lowerKey === 'screen size' ||
      lowerVal.includes('inch') ||
      lowerVal.endsWith('"')
    ) {
      const m = cleanVal.match(/(\d{2,3})\s*(?:inch|["”])/i);
      if (m) {
        cleanKey = 'Kích thước màn hình';
        cleanVal = `${m[1]}"`;
      }
    }

    if (!attrMap[cleanKey]) attrMap[cleanKey] = new Set();
    attrMap[cleanKey].add(cleanVal);
  };

  if (Array.isArray(p.specifications)) {
    p.specifications.forEach((s) => {
      if (s.key && s.value) addAttr(s.key, s.value);
    });
  }

  if (Array.isArray(p.options)) {
    p.options.forEach((opt) => {
      if (opt.name && Array.isArray(opt.values)) {
        opt.values.forEach((v) => addAttr(opt.name, v?.value || v));
      }
    });
  }

  if (Array.isArray(pVariants)) {
    pVariants.forEach((v) => {
      if (Array.isArray(v.attributes)) {
        v.attributes.forEach((a) => {
          if (a.name && a.value) addAttr(a.name, a.value);
        });
      }
    });
  }

  const name = p.name || '';
  const nameLower = name.toLowerCase();

  const inchMatch = name.match(/\b(32|40|42|43|48|50|55|58|60|65|70|75|77|85|86|98)\s*(?:["”]|inch\b)/i);
  if (inchMatch) {
    addAttr('Kích thước màn hình', `${inchMatch[1]}"`);
  } else {
    const modelMatch = name.match(/\b(?:[A-Z]{1,4}|KD-|XR-)?(32|40|42|43|48|50|55|58|60|65|70|75|77|85|86|98)[A-Z0-9-]{3,}\b/i);
    if (modelMatch) {
      addAttr('Kích thước màn hình', `${modelMatch[1]}"`);
    }
  }

  if (nameLower.includes('8k')) {
    addAttr('Độ phân giải', '8K UHD');
  } else if (nameLower.includes('4k')) {
    addAttr('Độ phân giải', '4K UHD');
  } else if (nameLower.includes('full hd') || nameLower.includes('fhd')) {
    addAttr('Độ phân giải', 'Full HD');
  } else if (nameLower.includes('hd')) {
    addAttr('Độ phân giải', 'HD');
  }

  if (nameLower.includes('qled')) {
    addAttr('Công nghệ màn hình', 'QLED');
  } else if (nameLower.includes('oled')) {
    addAttr('Công nghệ màn hình', 'OLED');
  } else if (nameLower.includes('nanocell')) {
    addAttr('Công nghệ màn hình', 'NanoCell');
  } else if (nameLower.includes('mini led')) {
    addAttr('Công nghệ màn hình', 'Mini LED');
  }

  const cpuMatch = name.match(/\b(Core i[3579]|Ryzen [3579]|M[1234](?:\s*Pro|\s*Max)?)\b/i);
  if (cpuMatch) {
    addAttr('Vi xử lý (CPU)', cpuMatch[0]);
  }
  const ramMatch = name.match(/\b(4GB|8GB|16GB|32GB|64GB)\s*(?:RAM)?\b/i);
  if (ramMatch) {
    addAttr('Dung lượng RAM', ramMatch[1].toUpperCase());
  }
  const storageMatch = name.match(/\b(128GB|256GB|512GB|1TB|2TB)\s*(?:SSD|HDD|ROM)?\b/i);
  if (storageMatch) {
    addAttr('Ổ cứng / Bộ nhớ', storageMatch[1].toUpperCase());
  }
  const gpuMatch = name.match(/\b(RTX\s*\d{4}|GTX\s*\d{4}|Radeon\s*\w+)\b/i);
  if (gpuMatch) {
    addAttr('Card đồ họa (GPU)', gpuMatch[0].toUpperCase());
  }

  const sizeMatch = name.match(/\bSize\s*([SMLXL]{1,3}|\d{2})\b/i);
  if (sizeMatch) {
    addAttr('Kích cỡ (Size)', sizeMatch[1].toUpperCase());
  }
  const colors = ['Đen', 'Trắng', 'Xám', 'Xanh', 'Đỏ', 'Vàng', 'Hồng', 'Be', 'Bạc'];
  colors.forEach((col) => {
    if (nameLower.includes(col.toLowerCase())) {
      addAttr('Màu sắc', col);
    }
  });

  const literMatch = name.match(/(\d{2,4})\s*(?:lít|lit|l)\b/i);
  if (literMatch) {
    const l = parseInt(literMatch[1], 10);
    if (l < 200) addAttr('Dung tích', 'Dưới 200 lít');
    else if (l <= 300) addAttr('Dung tích', '200 - 300 lít');
    else if (l <= 450) addAttr('Dung tích', '300 - 450 lít');
    else addAttr('Dung tích', 'Trên 450 lít');
  }

  if (nameLower.includes('inverter')) {
    addAttr('Công nghệ nổi bật', 'Inverter tiết kiệm');
  }

  const result = {};
  Object.entries(attrMap).forEach(([k, setVal]) => {
    result[k] = Array.from(setVal);
  });
  return result;
};

/**
 * Global Multi-Domain Smart Search Engine
 * @param {Object} query  — req.query params (q, domain, page, limit, category, brand, minPrice, maxPrice, inStock, sort, attrs)
 * @param {Object} req    — Express request object (optional, dùng để lấy sessionId + clientIp)
 */
const globalSearch = async (query = {}, req = null) => {
  const {
    q,
    domain = 'all',
    page = 1,
    limit = 24,
    category,
    brand,
    minPrice,
    maxPrice,
    inStock,
    sort = 'relevance',
    attrs,
  } = query;

  const parsed = parseSearchQuery(q);

  const hasKeyword = Boolean(parsed.normalized);
  const hasCollectionFilter = Boolean(category || brand);

  if (!hasKeyword && !hasCollectionFilter) {
    return {
      query: '',
      domain,
      results: {
        products: [],
        blogs: [],
        brands: [],
        categories: [],
      },
      facets: {
        brands: [],
        categories: [],
        priceRange: { min: 0, max: 0 },
      },
      pagination: {
        page: 1,
        limit: parseInt(limit, 10) || 24,
        totalItems: 0,
        totalPages: 0,
      },
      total: 0,
    };
  }

  // Async record search keyword for analytics
  if (hasKeyword) {
    const sessionId = req?.headers?.['x-session-id'] || '';
    const clientIp =
      req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
      req?.socket?.remoteAddress ||
      '';
    recordSearchKeyword(parsed.raw, 0, clientIp, sessionId);
  }

  // ── Resolve Category / Brand filter ──────────────────────────────────────
  let targetCategoryIds = null;
  let targetBrandId = null;

  const categoryAliases = {
    tivi: ['tivi-man-hinh', 'tivi', 'smart-tv', 'tv-4k', 'tv-oled-qled'],
    'smart-tv': ['tivi-man-hinh', 'smart-tv', 'tivi', 'smart-tivi'],
    'tv-oled-qled': ['tivi-man-hinh', 'tv-oled-qled', 'oled', 'tivi'],
    'tv-4k': ['tivi-man-hinh', 'tv-4k', 'tivi-4k', 'tivi'],
    'tu-lanh': ['tu-lanh-tu-dong', 'tu-lanh', 'tu-lanh-1-canh', 'tu-lanh-2-canh', 'tu-lanh-side-by-side', 'tu-lanh-multi-door'],
    'tu-dong': ['tu-lanh-tu-dong', 'tu-dong'],
    'tu-mat': ['tu-lanh-tu-dong', 'tu-mat'],
    'may-lanh': ['may-lanh-dieu-hoa', 'dieu-hoa-dien-lanh', 'dieu-hoa-lam-mat-phong-ngu'],
    'dieu-hoa': ['may-lanh-dieu-hoa', 'dieu-hoa-dien-lanh', 'dieu-hoa-lam-mat-phong-ngu'],
    'may-giat': ['may-giat-may-say', 'cot-may-giat-may-say', 'may-giat-cua-truoc', 'may-giat-cua-tren'],
    'may-say': ['may-giat-may-say', 'cot-may-giat-may-say', 'may-say-quan-ao'],
    'gia-dung': ['gia-dung-nha-bep', 'gia-dung', 'thiet-bi-gia-dung', 'cot-thiet-bi-gia-dung', 'thiet-bi-dien-may-khac'],
    'gia-dung-nha-bep': ['gia-dung-nha-bep', 'gia-dung', 'thiet-bi-bep', 'cot-thiet-bi-bep'],
    'gia-dung-sac-mau': ['gia-dung-sac-mau', 'gia-dung', 'cot-thiet-bi-gia-dung'],
    'gia-dung-suc-khoe': ['gia-dung-suc-khoe', 'gia-dung', 'cot-thiet-bi-gia-dung'],
    'san-pham-hot': [],
    'dien-thoai': ['dien-thoai-tablet', 'dien-thoai-phu-kien', 'dien-thoai-android'],
    'am-thanh': ['thiet-bi-am-thanh-loa', 'loa-am-thanh', 'nhom-loa-am-thanh', 'loa-bluetooth', 'loa-keo', 'dan-karaoke'],
    'loa-keo-karaoke': ['thiet-bi-am-thanh-loa', 'loa-keo-karaoke', 'loa-keo', 'dan-karaoke', 'nhom-thiet-bi-am-thanh', 'loa-karaoke-xach-tay'],
    'loa-keo': ['thiet-bi-am-thanh-loa', 'loa-keo-karaoke', 'loa-keo', 'dan-karaoke', 'nhom-thiet-bi-am-thanh'],
    'loa-bluetooth': ['thiet-bi-am-thanh-loa', 'loa-bluetooth', 'nhom-loa-am-thanh'],
  };

  const handleClean = (category || '').toLowerCase().trim();
  const isAllCategory = !handleClean || ['all', 'tat-ca', 'collections', 'san-pham', 'danh-muc'].includes(handleClean);

  if (handleClean && !isAllCategory) {
    const brandDoc = await Brand.findOne({
      $or: [
        { slug: handleClean },
        { name: new RegExp(`^${handleClean}$`, 'i') },
      ],
    }).select('_id');

    if (brandDoc) {
      targetBrandId = brandDoc._id;
    }

    const candidateSlugs = [
      handleClean,
      ...(categoryAliases[handleClean] || []),
    ];

    const matchedCats = await Category.find({
      $or: [
        { slug: { $in: candidateSlugs } },
        { slug: new RegExp(`^${handleClean}`, 'i') },
      ],
    }).select('_id').lean();

    if (matchedCats.length > 0) {
      const rootIds = matchedCats.map((c) => c._id);
      const [res] = await Category.aggregate([
        { $match: { _id: { $in: rootIds } } },
        {
          $graphLookup: {
            from: 'categories',
            startWith: '$_id',
            connectFromField: '_id',
            connectToField: 'parentId',
            as: 'descendants',
            maxDepth: 10,
          },
        },
        { $project: { descendants: '$descendants._id' } },
      ]);
      targetCategoryIds = [...rootIds, ...(res?.descendants || [])];
    }
  }

  let explicitBrandId = null;
  if (brand) {
    const isBrandObjId = /^[0-9a-fA-F]{24}$/.test(brand);
    const bDoc = await Brand.findOne(
      isBrandObjId ? { _id: brand } : { slug: brand }
    ).select('_id');
    if (bDoc) {
      explicitBrandId = bDoc._id;
    }
  }

  const escapeRegExp = (str) => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

  // Detect category intents and negative exclusions
  const normLower = (parsed.normalized || '').toLowerCase();
  const isTvQuery = /\b(?:tivi|ti vi|tv|smart tv|television|man hinh)\b/i.test(normLower);
  const isFridgeQuery = /\b(?:tu lanh|tủ lạnh|tu dong|tủ đông|side by side)\b/i.test(normLower);
  const isWasherQuery = /\b(?:may giat|máy giặt|may say|máy sấy)\b/i.test(normLower);
  const isAcQuery = /\b(?:may lanh|máy lạnh|dieu hoa|điều hòa)\b/i.test(normLower);

  let excludedCategoryIds = [];
  if (isTvQuery && !isFridgeQuery) {
    const excludedCats = await Category.find({
      name: { $regex: /tủ lạnh|tủ đông|máy giặt|máy lạnh/i },
    })
      .select('_id')
      .lean()
      .catch(() => []);
    excludedCategoryIds = excludedCats.map((c) => c._id);
  } else if (isFridgeQuery && !isTvQuery) {
    const excludedCats = await Category.find({
      name: { $regex: /tivi|màn hình|máy giặt|máy lạnh/i },
    })
      .select('_id')
      .lean()
      .catch(() => []);
    excludedCategoryIds = excludedCats.map((c) => c._id);
  }

  const baseExclusions = [{ isActive: true }, { status: 'published' }];

  if (category && !isAllCategory) {
    const collectionOr = [];
    if (targetBrandId) {
      collectionOr.push({ brand: targetBrandId });
    }
    if (targetCategoryIds && targetCategoryIds.length > 0) {
      collectionOr.push({ categories: { $in: targetCategoryIds } });
    }
    const keywordParts = handleClean
      .split('-')
      .filter((w) => w.length > 1 && !['thiet', 'bi', 'nhom', 'cot'].includes(w));
    if (keywordParts.length > 0) {
      collectionOr.push({
        name: new RegExp(keywordParts.join('.*'), 'i'),
      });
    }
    if (collectionOr.length > 0) {
      baseExclusions.push({ $or: collectionOr });
    }
  }

  if (explicitBrandId) {
    baseExclusions.push({ brand: explicitBrandId });
  }

  if (excludedCategoryIds.length > 0) {
    baseExclusions.push({ categories: { $nin: excludedCategoryIds } });
  }

  if (isTvQuery && !isFridgeQuery) {
    baseExclusions.push({
      name: {
        $not: /^(?:tủ lạnh|tu lanh|tủ đông|tu dong|máy giặt|may giat|máy lạnh|may lanh|điều hòa|dieu hoa)\b/i,
      },
    });
    baseExclusions.push({
      name: { $not: /\b(?:tủ lạnh|tủ đông|máy giặt|máy lạnh)\b/i },
    });
  }

  const regexList = buildSmartSearchRegex(parsed);

  const nameOrCodeConditions = regexList.map((reg) => ({
    $or: [{ name: reg }, { slug: reg }, { sku: reg }, { productCode: reg }],
  }));

  const results = {
    products: [],
    blogs: [],
    brands: [],
    categories: [],
  };

  let facets = {
    brands: [],
    categories: [],
    priceRange: { min: 0, max: 0 },
  };

  let totalProductCount = 0;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 24);

  // 1. SEARCH PRODUCTS
  if (domain === 'all' || domain === 'products') {
    const textQuery = parsed.normalized
      ? {
          $and: [
            ...baseExclusions,
            { $text: { $search: parsed.normalized } },
          ],
        }
      : null;

    // Build per-token conditions for multi-term AND matching
    const tokenConditions = parsed.tokens
      .filter((t) => t.length > 1)
      .map((t) => {
        const isShort = t.length <= 2;
        const reg = isShort
          ? new RegExp(`(?:^|[^a-zA-Z0-9])${escapeRegExp(t)}(?:$|[^a-zA-Z0-9])`, 'i')
          : new RegExp(escapeRegExp(t), 'i');
        const tokenSyns = (parsed.synonyms || []).filter(
          (s) => s.includes(t) || t.includes(s)
        );
        const synRegs = tokenSyns.map((s) =>
          s.length <= 2
            ? new RegExp(`(?:^|[^a-zA-Z0-9])${escapeRegExp(s)}(?:$|[^a-zA-Z0-9])`, 'i')
            : new RegExp(escapeRegExp(s), 'i')
        );
        const allTokenRegs = [reg, ...synRegs];

        return {
          $or: [
            ...allTokenRegs.map((r) => ({ name: r })),
            ...allTokenRegs.map((r) => ({ slug: r })),
            ...allTokenRegs.map((r) => ({ sku: r })),
            ...allTokenRegs.map((r) => ({ productCode: r })),
            { searchTokens: { $in: [t, ...tokenSyns] } },
          ],
        };
      });

    let regexResults = [];
    if (!hasKeyword) {
      regexResults = await Product.find({
        $and: [...baseExclusions],
      })
        .populate('categories', 'name slug')
        .populate('brand', 'name slug logo')
        .sort({ createdAt: -1 })
        .limit(200)
        .lean();
    } else {
      if (tokenConditions.length > 1) {
        regexResults = await Product.find({
          $and: [...baseExclusions, ...tokenConditions],
        })
          .populate('categories', 'name slug')
          .populate('brand', 'name slug logo')
          .limit(100)
          .lean();
      }

      if (regexResults.length === 0) {
        const orQuery = {
          $and: [
            ...baseExclusions,
            {
              $or: [
                { name: new RegExp(escapeRegExp(parsed.normalized), 'i') },
                ...nameOrCodeConditions.flatMap((c) => c.$or),
                { searchTokens: { $in: parsed.tokens.filter((t) => t.length >= 2) } },
              ],
            },
          ],
        };
        regexResults = await Product.find(orQuery)
          .populate('categories', 'name slug')
          .populate('brand', 'name slug logo')
          .limit(200)
          .lean();
      }
    }

    const textResults = textQuery
      ? await Product.find(textQuery, { score: { $meta: 'textScore' } })
          .sort({ score: { $meta: 'textScore' } })
          .populate('categories', 'name slug')
          .populate('brand', 'name slug logo')
          .limit(100)
          .lean()
          .catch(() => [])
      : [];

    const seenIds = new Set();
    const rawProducts = [];
    for (const p of [...regexResults, ...textResults]) {
      const id = p._id.toString();
      if (!seenIds.has(id)) {
        seenIds.add(id);
        rawProducts.push(p);
      }
    }

    const productIds = rawProducts.map((p) => p._id);
    const variants = productIds.length > 0
      ? await ProductVariant.find({ productId: { $in: productIds } }).lean()
      : [];

    const variantsByProd = {};
    variants.forEach((v) => {
      const pid = v.productId.toString();
      if (!variantsByProd[pid]) variantsByProd[pid] = [];
      variantsByProd[pid].push(v);
    });

    const activeFsMap = await getActiveFlashSaleMap();

    const scoredProducts = rawProducts
      .map((p) => {
        const pVariants = variantsByProd[p._id.toString()] || [];
        const defaultVar = pVariants.find((v) => v.isDefault) || pVariants[0];
        const score = calculateRelevanceScore(p, parsed);

        const basePrice = defaultVar?.price || p.cachedPrice || p.price || 0;
        const baseSalePrice = defaultVar?.salePrice || p.cachedSalePrice || p.salePrice || 0;

        const fsInfo = activeFsMap.get(p._id.toString());
        const isFs = Boolean(fsInfo && fsInfo.flashSalePrice > 0);
        const price = (isFs && fsInfo.originalPrice) ? fsInfo.originalPrice : basePrice;
        const salePrice = isFs ? fsInfo.flashSalePrice : baseSalePrice;

        const stock = defaultVar?.stock || p.stock || 0;
        const sku = defaultVar?.sku || p.sku || p.productCode || '';
        const extractedAttributes = extractProductAttributes(p, pVariants);

        return {
          ...p,
          price,
          salePrice,
          isFlashSale: isFs,
          flashSalePrice: isFs ? fsInfo.flashSalePrice : undefined,
          flashSaleOriginalPrice: (isFs && fsInfo.originalPrice) ? fsInfo.originalPrice : basePrice,
          flashSaleName: isFs ? fsInfo.flashSaleName : undefined,
          flashSaleSlug: isFs ? fsInfo.flashSaleSlug : undefined,
          stock,
          sku,
          variants: pVariants,
          extractedAttributes,
          score: hasKeyword ? score : 1,
        };
      })
      .filter((p) => (hasKeyword ? p.score > 0 : true));

    // Compute facets from all matching products before applying filters
    const brandMap = {};
    const categoryMap = {};
    const attrCounts = {};
    let minP = Infinity;
    let maxP = 0;

    scoredProducts.forEach((p) => {
      const effPrice = p.salePrice > 0 ? p.salePrice : p.price;
      if (effPrice > 0) {
        if (effPrice < minP) minP = effPrice;
        if (effPrice > maxP) maxP = effPrice;
      }

      if (p.brand && p.brand._id) {
        const bId = p.brand._id.toString();
        if (!brandMap[bId]) {
          brandMap[bId] = {
            _id: bId,
            name: p.brand.name,
            slug: p.brand.slug,
            count: 0,
          };
        }
        brandMap[bId].count++;
      }

      if (Array.isArray(p.categories)) {
        p.categories.forEach((cat) => {
          if (cat && cat._id) {
            const cId = cat._id.toString();
            if (!categoryMap[cId]) {
              categoryMap[cId] = {
                _id: cId,
                name: cat.name,
                slug: cat.slug,
                count: 0,
              };
            }
            categoryMap[cId].count++;
          }
        });
      }

      if (p.extractedAttributes) {
        Object.entries(p.extractedAttributes).forEach(([attrName, vals]) => {
          if (!attrCounts[attrName]) attrCounts[attrName] = {};
          vals.forEach((v) => {
            attrCounts[attrName][v] = (attrCounts[attrName][v] || 0) + 1;
          });
        });
      }
    });

    // Retrieve all active store brands so users can browse any brand
    const allStoreBrands = await Brand.find({ isActive: true })
      .select('name slug logo')
      .sort({ name: 1 })
      .lean()
      .catch(() => []);

    const mergedBrandsMap = new Map();
    allStoreBrands.forEach((b) => {
      const bId = b._id.toString();
      mergedBrandsMap.set(bId, {
        _id: bId,
        name: b.name,
        slug: b.slug,
        count: brandMap[bId]?.count || 0,
      });
    });
    Object.values(brandMap).forEach((b) => {
      if (!mergedBrandsMap.has(b._id)) {
        mergedBrandsMap.set(b._id, b);
      }
    });

    const allBrandsList = Array.from(mergedBrandsMap.values()).sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.name.localeCompare(b.name, 'vi');
    });

    const PRIORITY_ATTR_ORDER = [
      'Kích thước màn hình',
      'Độ phân giải',
      'Công nghệ màn hình',
      'Tần số quét',
      'Hệ điều hành',
      'Dung tích',
      'Khối lượng giặt',
      'Vi xử lý (CPU)',
      'Dung lượng RAM',
      'Ổ cứng / Bộ nhớ',
      'Card đồ họa (GPU)',
      'Kích cỡ (Size)',
      'Màu sắc',
      'Công nghệ nổi bật',
    ];

    const dynamicAttributes = Object.entries(attrCounts)
      .filter(([name]) => PRIORITY_ATTR_ORDER.includes(name))
      .map(([name, valMap]) => {
        const values = Object.entries(valMap).map(([value, count]) => ({ value, count }));
        if (name === 'Kích thước màn hình') {
          values.sort((a, b) => {
            const numA = parseInt(a.value, 10) || 0;
            const numB = parseInt(b.value, 10) || 0;
            return numA - numB;
          });
        } else {
          values.sort((a, b) => b.count - a.count);
        }
        return { name, values };
      })
      .filter((g) => g.values.length > 0)
      .sort((a, b) => {
        const idxA = PRIORITY_ATTR_ORDER.indexOf(a.name);
        const idxB = PRIORITY_ATTR_ORDER.indexOf(b.name);
        return (idxA >= 0 ? idxA : 99) - (idxB >= 0 ? idxB : 99);
      });

    facets = {
      brands: allBrandsList,
      categories: Object.values(categoryMap).sort((a, b) => b.count - a.count),
      attributes: dynamicAttributes,
      priceRange: {
        min: minP === Infinity ? 0 : minP,
        max: maxP,
      },
    };

    // Apply filters
    let filteredProducts = scoredProducts;

    if (explicitBrandId) {
      filteredProducts = filteredProducts.filter(
        (p) => p.brand?._id?.toString() === explicitBrandId.toString()
      );
    }

    if (minPrice && !isNaN(Number(minPrice))) {
      const minVal = Number(minPrice);
      filteredProducts = filteredProducts.filter((p) => {
        const effPrice = p.salePrice > 0 ? p.salePrice : p.price;
        return effPrice >= minVal;
      });
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      const maxVal = Number(maxPrice);
      filteredProducts = filteredProducts.filter((p) => {
        const effPrice = p.salePrice > 0 ? p.salePrice : p.price;
        return effPrice <= maxVal;
      });
    }

    if (inStock === 'true' || inStock === true || inStock === '1') {
      filteredProducts = filteredProducts.filter((p) => (p.stock || 0) > 0);
    }

    if (attrs) {
      let parsedAttrs = attrs;
      if (typeof attrs === 'string') {
        try {
          parsedAttrs = JSON.parse(attrs);
        } catch {
          parsedAttrs = {};
        }
      }
      if (typeof parsedAttrs === 'object' && parsedAttrs !== null) {
        Object.entries(parsedAttrs).forEach(([attrKey, targetVal]) => {
          if (!targetVal) return;
          const targetStr = String(targetVal).trim().toLowerCase();
          filteredProducts = filteredProducts.filter((p) => {
            const productAttrVals = p.extractedAttributes?.[attrKey] || [];
            return productAttrVals.some((v) =>
              String(v).toLowerCase().includes(targetStr)
            );
          });
        });
      }
    }

    // Apply sorting
    switch (sort) {
      case 'price_asc':
      case 'price-asc':
        filteredProducts.sort((a, b) => {
          const priceA = a.salePrice > 0 ? a.salePrice : a.price || 0;
          const priceB = b.salePrice > 0 ? b.salePrice : b.price || 0;
          return priceA - priceB;
        });
        break;
      case 'price_desc':
      case 'price-desc':
        filteredProducts.sort((a, b) => {
          const priceA = a.salePrice > 0 ? a.salePrice : a.price || 0;
          const priceB = b.salePrice > 0 ? b.salePrice : b.price || 0;
          return priceB - priceA;
        });
        break;
      case 'newest':
        filteredProducts.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        break;
      case 'name_asc':
      case 'name-asc':
        filteredProducts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name_desc':
      case 'name-desc':
        filteredProducts.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'relevance':
      default:
        filteredProducts.sort((a, b) => b.score - a.score);
        break;
    }

    totalProductCount = filteredProducts.length;
    const startIndex = (pageNum - 1) * limitNum;
    results.products = filteredProducts.slice(startIndex, startIndex + limitNum);
  }

  // 2. SEARCH BLOG POSTS
  if (domain === 'all' || domain === 'blogs') {
    const rawClean = (parsed.raw || '').trim();
    const normClean = (parsed.normalized || '').trim();
    const slugQuery = normClean ? normClean.replace(/\s+/g, '-') : '';

    const blogConditions = [];
    if (rawClean) {
      blogConditions.push({ title: new RegExp(escapeRegExp(rawClean), 'i') });
      blogConditions.push({ excerpt: new RegExp(escapeRegExp(rawClean), 'i') });
    }
    if (normClean) {
      blogConditions.push({ title: new RegExp(escapeRegExp(normClean), 'i') });
      blogConditions.push({ slug: new RegExp(escapeRegExp(normClean), 'i') });
    }
    if (slugQuery) {
      blogConditions.push({ slug: new RegExp(escapeRegExp(slugQuery), 'i') });
    }

    const allKeywords = [...new Set([...(parsed.tokens || []), ...(parsed.synonyms || [])])].filter((k) => k.length >= 2);
    for (const kw of allKeywords) {
      const esc = escapeRegExp(kw);
      blogConditions.push({ title: new RegExp(esc, 'i') });
      blogConditions.push({ slug: new RegExp(esc, 'i') });
      blogConditions.push({ excerpt: new RegExp(esc, 'i') });
    }

    const baseBlogQuery = {
      isActive: { $ne: false },
      status: { $ne: 'archived' },
    };

    let blogs = [];
    try {
      blogs = await BlogPost.find({
        ...baseBlogQuery,
        $or: blogConditions.length > 0 ? blogConditions : [{}],
      })
        .populate('categories', 'name slug')
        .populate('thumbnailMediaId', 'url')
        .limit(12)
        .lean();
    } catch (err) {
      console.error('[BlogSearch] Error querying blogs:', err.message);
    }

    if ((!blogs || blogs.length === 0) && domain === 'blogs') {
      try {
        blogs = await BlogPost.find(baseBlogQuery)
          .populate('categories', 'name slug')
          .populate('thumbnailMediaId', 'url')
          .limit(6)
          .lean();
      } catch (err) {
        console.error('[BlogSearch] Fallback error:', err.message);
      }
    }

    results.blogs = (blogs || [])
      .map((b) => ({
        ...b,
        thumbnailUrl: b.thumbnailUrl || b.thumbnailMediaId?.url || '',
        score: calculateRelevanceScore(b, parsed),
      }))
      .sort((a, b) => b.score - a.score);
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

  const grandTotal =
    totalProductCount +
    results.blogs.length +
    results.brands.length +
    results.categories.length;

  return {
    query: parsed.raw,
    domain,
    results,
    facets,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalItems: domain === 'blogs' ? results.blogs.length : totalProductCount,
      totalPages: Math.max(1, Math.ceil((domain === 'blogs' ? results.blogs.length : totalProductCount) / limitNum)),
    },
    total: domain === 'blogs' ? results.blogs.length : (totalProductCount > 0 ? totalProductCount : grandTotal),
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

  const activeFsMap = await getActiveFlashSaleMap();

  // Score đơn giản hơn — không cần lọc thỗ vì DB đã filter
  const scoredProducts = matchedProducts
    .map((p) => {
      const fsInfo = activeFsMap.get(p._id.toString());
      const basePrice = p.cachedPrice || p.price || 0;
      const baseSalePrice = p.cachedSalePrice || p.salePrice || 0;

      const isFs = Boolean(fsInfo && fsInfo.flashSalePrice > 0);
      const effSalePrice = isFs ? fsInfo.flashSalePrice : baseSalePrice;
      const effPrice = (isFs && fsInfo.originalPrice) ? fsInfo.originalPrice : basePrice;

      return {
        _id: p._id,
        name: p.name,
        slug: p.slug,
        price: effPrice,
        salePrice: effSalePrice,
        isFlashSale: isFs,
        flashSalePrice: isFs ? fsInfo.flashSalePrice : undefined,
        flashSaleOriginalPrice: isFs ? effPrice : undefined,
        flashSaleName: isFs ? fsInfo.flashSaleName : undefined,
        thumbnail: p.thumbnail,
        productCode: p.productCode || p.sku || '',
        score: calculateRelevanceScore(p, parsed),
      };
    })
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
const SEED_TRENDING_KEYWORDS = [
  { keyword: 'tivi samsung', count: 185, count24h: 42, countPrev24h: 18, count7d: 185, count6h: 12, resultsCount: 1, isTrending: true, trendingScore: 98, uniqueSessionCount: 28 },
  { keyword: 'tủ lạnh', count: 142, count24h: 31, countPrev24h: 15, count7d: 142, count6h: 9, resultsCount: 6, isTrending: true, trendingScore: 89, uniqueSessionCount: 22 },
  { keyword: 'smart tivi 4k', count: 128, count24h: 27, countPrev24h: 12, count7d: 128, count6h: 8, resultsCount: 8, isTrending: true, trendingScore: 84, uniqueSessionCount: 19 },
  { keyword: 'máy giặt toshiba', count: 96, count24h: 21, countPrev24h: 9, count7d: 96, count6h: 6, resultsCount: 4, isTrending: true, trendingScore: 78, uniqueSessionCount: 15 },
  { keyword: 'loa soundbar', count: 75, count24h: 16, countPrev24h: 7, count7d: 75, count6h: 5, resultsCount: 3, isTrending: true, trendingScore: 72, uniqueSessionCount: 12 },
];

const ensureSeedKeywordsInDb = async () => {
  try {
    for (const item of SEED_TRENDING_KEYWORDS) {
      await SearchLog.findOneAndUpdate(
        { keyword: item.keyword },
        {
          $set: {
            isTrending: true,
            resultsCount: item.resultsCount || 1,
          },
          $setOnInsert: {
            count: item.count,
            count24h: item.count24h,
            countPrev24h: item.countPrev24h,
            count7d: item.count7d,
            count6h: item.count6h,
            trendingScore: item.trendingScore,
            uniqueSessionCount: item.uniqueSessionCount,
          },
        },
        { upsert: true, new: true }
      );
    }
  } catch (err) {
  }
};

const getTrendingKeywords = async (limit = 5, type = 'all') => {
  await ensureSeedKeywordsInDb();

  let query = {
    count: { $gt: 0 },
    keyword: { $regex: /^[a-zA-Z0-9À-ỹ\s]{3,}$/i },
  };
  let sortOpt = { isTrending: -1, count24h: -1, count: -1, trendingScore: -1 };

  if (type === 'rising') {
    query = {
      ...query,
      $expr: { $gt: ['$count24h', { $multiply: ['$countPrev24h', 1.3] }] },
    };
  } else if (type === 'breakout') {
    query = {
      ...query,
      countPrev24h: { $gt: 0 },
      $expr: {
        $gte: [
          '$count24h',
          { $multiply: ['$countPrev24h', BREAKOUT_RATIO] },
        ],
      },
    };
    sortOpt = { count24h: -1 };
  } else if (type === 'hot') {
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
      isBreakout:      breakoutRatio >= BREAKOUT_RATIO,
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

/**
 * Export Search Data to CSV for Python ML/Analytics
 */
const exportSearchDataToCSV = async () => {
  await ensureSeedKeywordsInDb();
  const logs = await SearchLog.find()
    .sort({ trendingScore: -1, count: -1 })
    .lean();

  const headers = [
    'keyword',
    'count',
    'count24h',
    'countPrev24h',
    'count6h',
    'count7d',
    'resultsCount',
    'clickCount',
    'purchaseCount',
    'uniqueSessionCount',
    'trendingScore',
    'isTrending',
    'lastSearchedAt',
  ];

  const csvRows = [headers.join(',')];

  logs.forEach((log) => {
    const row = [
      `"${(log.keyword || '').replace(/"/g, '""')}"`,
      log.count || 0,
      log.count24h || 0,
      log.countPrev24h || 0,
      log.count6h || 0,
      log.count7d || 0,
      log.resultsCount || 0,
      log.clickCount || 0,
      log.purchaseCount || 0,
      log.uniqueSessionCount || 0,
      log.trendingScore || 0,
      log.isTrending ? 1 : 0,
      `"${log.lastSearchedAt ? new Date(log.lastSearchedAt).toISOString() : ''}"`,
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
};

module.exports = {
  globalSearch,
  getInstantSuggestions,
  getTrendingKeywords,
  setKeywordTrending,
  recordSearchKeyword,
  recordSearchClick,
  recordPurchaseKeyword,
  exportSearchDataToCSV,
};
