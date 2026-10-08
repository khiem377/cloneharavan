/**
 * chatbot.service.js — AI Sales Assistant (RAG + Persistent MongoDB Memory + Multi-LLM Resilience)
 *
 * Architecture:
 * - Động cơ AI: Tự động phát hiện mô hình còn hoạt động trên Groq (Auto-discovered Groq Models) + Google Gemini.
 * - Lưu trữ ngữ cảnh bền vững (Persistent ChatSession in MongoDB + Memory Cache): Không mất hội thoại khi reload hay server restart.
 * - Hồ sơ khách hàng tích lũy (Customer Intelligence Profile): Tự động học thương hiệu yêu thích, tầm giá, sở thích kích thước, ngành hàng quan tâm.
 * - Chuẩn hóa hội thoại đa lượt (Multi-turn Sanitization): Chống lỗi role order, role mismatch ('bot' -> 'assistant'), và tin nhắn rỗng.
 * - Đọc dữ liệu thực tế 100% từ MongoDB (Product & ProductVariant) trước mỗi câu hỏi của khách (RAG Pipeline).
 * - Hỗ trợ SSE Streaming cho trải nghiệm gõ phím trực tiếp mượt mà.
 */

const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const GroqLib = require('groq-sdk');
const Groq    = GroqLib.default ?? GroqLib;

const Product         = require('../models/product.model');
const ProductVariant  = require('../models/productVariant.model');
const Category        = require('../models/category.model');
const Brand           = require('../models/brand.model');
const Coupon          = require('../models/coupon.model');
const FlashSale       = require('../models/flashSale.model');
const Promotion       = require('../models/promotion.model');
const GiftProgram     = require('../models/gift-program.model');
const ChatSession     = require('../models/chatSession.model');
const UserInteraction = require('../models/userInteraction.model');

// ─── Gemini AI Init ───────────────────────────────────────────────────────────
let _genAI = null;
const getGeminiClient = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!_genAI) {
    _genAI = new GoogleGenerativeAI(key);
  }
  return _genAI;
};

// ─── Groq client ──────────────────────────────────────────────────────────────
let _groq = null;
const getGroq = () => {
  if (!_groq) {
    if (!process.env.GROQ_API_KEY) return null;
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
};

// ─── Hybrid Session Store (In-Memory Hot Cache + MongoDB Persistence) ─────────
const memoryCache = new Map();
const CACHE_TTL   = 30 * 60 * 1000;
const MAX_SESSIONS = 5_000;

const _evictOldestSession = () => {
  const firstKey = memoryCache.keys().next().value;
  if (firstKey !== undefined) memoryCache.delete(firstKey);
};

setInterval(() => {
  const now = Date.now();
  for (const [sid, e] of memoryCache.entries()) {
    if (now - e.ts > CACHE_TTL) memoryCache.delete(sid);
  }
}, 10 * 60 * 1000).unref();

const getSessionData = async (sessionId, userId = null) => {
  if (!sessionId) return { messages: [], profile: {} };

  const cached = memoryCache.get(sessionId);
  if (cached && Date.now() - cached.ts <= CACHE_TTL) {
    memoryCache.delete(sessionId);
    memoryCache.set(sessionId, cached);
    return { messages: cached.messages || [], profile: cached.profile || {} };
  }

  try {
    const dbSession = await ChatSession.findOne({ sessionId }).lean();
    if (dbSession) {
      const data = {
        messages: (dbSession.messages || []).map((m) => ({
          role: (m.role === 'bot' || m.role === 'assistant' || m.role === 'model') ? 'assistant' : 'user',
          content: m.content || '',
          products: m.products || [],
          timestamp: m.timestamp,
        })),
        profile: dbSession.profile || {},
      };
      memoryCache.set(sessionId, { ...data, ts: Date.now() });
      return data;
    }
  } catch (err) {
    console.warn('[getSessionData DB Warning]', err.message);
  }

  return { messages: [], profile: {} };
};

const saveSessionData = async (sessionId, { messages, profile = {}, userId = null }) => {
  if (!sessionId) return;

  const cleanMsgs = (messages || [])
    .filter((m) => m && typeof m.content === 'string' && m.content.trim())
    .slice(-15)
    .map((m) => ({
      role: (m.role === 'bot' || m.role === 'assistant' || m.role === 'model') ? 'assistant' : 'user',
      content: m.content.trim(),
      products: m.products || [],
      timestamp: m.timestamp || new Date(),
    }));

  memoryCache.set(sessionId, { messages: cleanMsgs, profile, ts: Date.now() });

  if (memoryCache.size > MAX_SESSIONS) {
    _evictOldestSession();
  }

  try {
    const validUserId = (userId && mongoose.Types.ObjectId.isValid(userId)) ? userId : null;
    await ChatSession.findOneAndUpdate(
      { sessionId },
      {
        $set: {
          sessionId,
          userId: validUserId,
          messages: cleanMsgs,
          profile,
          lastActiveAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.warn('[saveSessionData DB Warning]', err.message);
  }
};

const removeEmojis = (str = '') =>
  str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}]/gu, '');

const escapeRegex = (str = '') => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ─── Fast In-Memory Cache for Campaigns & Taxonomy ───────────────────────────
let _marketingCache = null;
let _marketingCacheTime = 0;
const MARKETING_CACHE_TTL = 60 * 1000;

const getMarketingData = async () => {
  const now = Date.now();
  if (_marketingCache && now - _marketingCacheTime < MARKETING_CACHE_TTL) {
    return _marketingCache;
  }
  const nowDate = new Date();
  const [activeFlashSales, activePromotions, activeGiftPrograms, activeCoupons] = await Promise.all([
    FlashSale.find({
      isActive: true,
      startDate: { $lte: nowDate },
      endDate: { $gte: nowDate },
    }).lean(),
    Promotion.find({
      isActive: true,
      startDate: { $lte: nowDate },
      endDate: { $gte: nowDate },
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } },
      ],
    }).sort({ createdAt: -1 }).lean(),
    GiftProgram.find({
      isActive: true,
      startDate: { $lte: nowDate },
      endDate: { $gte: nowDate },
      $or: [
        { giftLimit: null },
        { $expr: { $lt: ['$giftUsedCount', '$giftLimit'] } },
      ],
    }).populate('giftProducts.productId', 'name slug price thumbnail').sort({ createdAt: -1 }).lean(),
    Coupon.find({
      isActive: true,
      startDate: { $lte: nowDate },
      endDate: { $gte: nowDate },
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } },
      ],
    }).select('code name type value maxDiscount minOrderValue usageLimit usedCount').sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  _marketingCache = { activeFlashSales, activePromotions, activeGiftPrograms, activeCoupons };
  _marketingCacheTime = now;
  return _marketingCache;
};

let _taxonomyCache = null;
let _taxonomyCacheTime = 0;
const TAXONOMY_CACHE_TTL = 5 * 60 * 1000;

const getTaxonomyData = async () => {
  const now = Date.now();
  if (_taxonomyCache && now - _taxonomyCacheTime < TAXONOMY_CACHE_TTL) {
    return _taxonomyCache;
  }
  const [allBrands, allCategories] = await Promise.all([
    Brand.find({}).select('_id name slug').lean(),
    Category.find({}).select('_id name slug').lean(),
  ]);
  _taxonomyCache = { allBrands, allCategories };
  _taxonomyCacheTime = now;
  return _taxonomyCache;
};

const parsePriceFilter = (str = '') => {
  const clean = str.toLowerCase();
  let minPrice = null;
  let maxPrice = null;

  const rangeMatch = clean.match(/(?:từ\s*)?(\d+(?:[.,]\d+)?)\s*(?:-|đến|tới|\.\.)\s*(\d+(?:[.,]\d+)?)\s*(?:triệu|tr|củ|trđ|m)/i);
  if (rangeMatch) {
    minPrice = parseFloat(rangeMatch[1].replace(',', '.')) * 1_000_000;
    maxPrice = parseFloat(rangeMatch[2].replace(',', '.')) * 1_000_000;
    if (minPrice > maxPrice) [minPrice, maxPrice] = [maxPrice, minPrice];
    return { minPrice, maxPrice };
  }

  const underMatch = clean.match(/(?:dưới|<|<=|không quá|nhỏ hơn|tối đa|tầm dưới|ít hơn)\s*(\d+(?:[.,]\d+)?)\s*(?:triệu|tr|củ|trđ|m)/i);
  if (underMatch) {
    maxPrice = parseFloat(underMatch[1].replace(',', '.')) * 1_000_000;
    return { minPrice: null, maxPrice };
  }

  const overMatch = clean.match(/(?:trên|>|>=|hơn|từ)\s*(\d+(?:[.,]\d+)?)\s*(?:triệu|tr|củ|trđ|m)(?:\s*trở lên)?/i);
  if (overMatch && !clean.includes('-') && !clean.includes('đến') && !clean.includes('tới')) {
    minPrice = parseFloat(overMatch[1].replace(',', '.')) * 1_000_000;
    return { minPrice, maxPrice: null };
  }

  const approxMatch = clean.match(/(?:tầm|khoảng|cỡ|loanh quanh)\s*(\d+(?:[.,]\d+)?)\s*(?:triệu|tr|củ|trđ|m)/i);
  if (approxMatch) {
    const val = parseFloat(approxMatch[1].replace(',', '.')) * 1_000_000;
    minPrice = Math.max(0, val * 0.85);
    maxPrice = val * 1.2;
    return { minPrice, maxPrice };
  }

  return { minPrice: null, maxPrice: null };
};

const getRecentBrowsingContext = async (sessionId, userId = null) => {
  try {
    const query = {};
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = userId;
    } else if (sessionId) {
      query.sessionId = sessionId;
    } else {
      return [];
    }

    const interactions = await UserInteraction.find(query)
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('productId', 'name slug price brand categories')
      .lean();

    return interactions
      .map((it) => it.productId?.name)
      .filter(Boolean);
  } catch (err) {
    return [];
  }
};

// ─── REAL-TIME MONGODB RAG FETCH ──────────────────────────────────────────────
const fetchProductContext = async (message = '', { history = [], profile = {}, sessionId = '', userId = null } = {}) => {
  try {
    const clean = message.toLowerCase().trim();

    // 1. Kiểm tra yêu cầu tra cứu đơn hàng
    const isOrderInquiry = /(đơn hàng|tra cứu đơn|kiểm tra đơn|xem đơn|tình trạng đơn|mã vận đơn|khi nào giao|ship hàng|vận chuyển)/i.test(clean);
    if (isOrderInquiry) {
      return {
        text: '(Khách hàng đang hỏi về tra cứu hoặc kiểm tra đơn hàng. Hãy xưng "em" và gọi "anh/chị". Hướng dẫn lễ phép: Anh/chị có thể xem danh sách và trạng thái chi tiết tất cả đơn hàng đã đặt tại mục "Đơn hàng của tôi" trong trang Tài khoản (/tai-khoan?tab=orders). Hoặc anh/chị có thể cung cấp Mã đơn hàng và Số điện thoại đặt hàng ngay tại đây để em hỗ trợ kiểm tra trực tiếp giúp mình ạ.)',
        products: [],
        coupons: [],
        updatedProfile: profile,
      };
    }

    // 2. Kiểm tra chào hỏi xã giao (Tuyệt đối KHÔNG tự ý gợi ý sản phẩm khi khách chỉ mới chào hỏi)
    const isGreetingOnly =
      /^(dạ\s*)?(hi|hello|helo|chào|xin chào|kính chào|alo|cảm ơn|thanks|thank you|ok|oke|oki|okie|xong|tạm biệt|bye|bye bye|ê|shop ơi|ad ơi|admin ơi|em ơi|anh ơi|chị ơi)([\s,.-]+(bạn|shop|ad|admin|em|anh|chị|ơi|ạ|nha|nhé|nè|nhen|cả nhà|mọi người|với))*[\s?!.,]*$/i.test(clean) ||
      /^(cho (em|mình|tôi|anh|chị) hỏi( với| chút| xíu| một câu)?|hỏi tí|hỏi xíu|shop ơi cho hỏi|tư vấn giúp( mình| em| anh| chị)?|shop có đó không|có ai trực không|cần hỗ trợ|cần tư vấn|bên mình có bán gì|shop bán những gì)[\s?!.,]*$/i.test(clean);

    if (isGreetingOnly) {
      return {
        text: '(Khách hàng đang chào hỏi / giao tiếp xã giao. Hãy chào lại lễ phép, xưng "em" và gọi "anh/chị", tự giới thiệu em là chuyên viên tư vấn bán hàng của Siêu thị điện máy SHOP và hỏi xem anh/chị cần hỗ trợ tìm kiếm sản phẩm nào hay cần tư vấn thông tin gì hôm nay ạ. TUYỆT ĐỐI KHÔNG tự ý liệt kê hay gợi ý danh sách sản phẩm nào khi khách chưa hỏi sản phẩm cụ thể.)',
        products: [],
        coupons: [],
        updatedProfile: profile,
      };
    }

    // 3. Yêu cầu hỗ trợ chung
    const isGeneralHelp = /^(hỗ trợ mua hàng|tư vấn mua hàng|mua hàng trực tuyến|cần tư vấn|bán gì|có gì bán|tư vấn giúp)$/i.test(clean);
    if (isGeneralHelp) {
      return {
        text: '(Khách hàng cần hỗ trợ tư vấn mua hàng trực tuyến. Hãy xưng "em" và gọi "anh/chị". Chào đón lễ phép, giới thiệu: "Dạ bên em chuyên cung cấp Tivi, Tủ lạnh, Máy giặt, Điều hòa và Thiết bị âm thanh chính hãng 100%. Anh/chị đang quan tâm đến dòng sản phẩm, thương hiệu hoặc mức ngân sách nào để em tư vấn chi tiết cho mình ạ?". Tuyệt đối KHÔNG xưng "mình", KHÔNG gọi "bạn".)',
        products: [],
        coupons: [],
        updatedProfile: profile,
      };
    }

    const recentUserMessages = (history || [])
      .filter((h) => h.role === 'user')
      .slice(-3)
      .map((h) => h.content.toLowerCase())
      .join(' ');

    let { minPrice, maxPrice } = parsePriceFilter(clean);
    if (minPrice === null && maxPrice === null && clean.split(/\s+/).length <= 4) {
      const prevPrice = parsePriceFilter(recentUserMessages);
      if (prevPrice.minPrice !== null || prevPrice.maxPrice !== null) {
        if (!/(bỏ giá|tầm giá khác|ko cần giá|không cần giá|mức giá khác)/i.test(clean)) {
          minPrice = prevPrice.minPrice;
          maxPrice = prevPrice.maxPrice;
        }
      } else if (profile.budgetMin !== null || profile.budgetMax !== null) {
        minPrice = profile.budgetMin;
        maxPrice = profile.budgetMax;
      }
    }
    const hasPriceFilter = minPrice !== null || maxPrice !== null;

    const cleanNoPrice = clean
      .replace(/(?:từ\s*)?\d+(?:[.,]\d+)?\s*(?:-|đến|tới|\.\.)\s*\d+(?:[.,]\d+)?\s*(?:triệu|tr|củ|trđ|m)/gi, ' ')
      .replace(/(?:dưới|<|<=|không quá|nhỏ hơn|tối đa|trên|>|>=|hơn|từ|tầm|khoảng|cỡ|loanh quanh)\s*\d+(?:[.,]\d+)?\s*(?:triệu|tr|củ|trđ|m)(?:\s*trở lên)?/gi, ' ')
      .replace(/\d+\s*(?:triệu|tr|củ|trđ|m)/gi, ' ')
      .replace(/\b\d+\b/g, ' ');

    // 5. Phân tích danh mục (Ngành hàng)
    const isTvQuery = /(\btv\b|tivi|ti vi|smart tv|qled|oled|4k tv|tivi led|google tivi|android tivi)/i.test(clean) ||
      (clean.split(/\s+/).length <= 4 && /(\btv\b|tivi|ti vi|smart tv)/i.test(recentUserMessages));

    const isFridgeQuery = /(tủ lạnh|tu lanh|tủ đông|tủ mát|side by side)/i.test(clean) ||
      (clean.split(/\s+/).length <= 4 && /(tủ lạnh|tu lanh|tủ đông)/i.test(recentUserMessages));

    const isWashingQuery = /(máy giặt|may giat|máy sấy|may say)/i.test(clean) ||
      (clean.split(/\s+/).length <= 4 && /(máy giặt|may giat|máy sấy)/i.test(recentUserMessages));

    const isAcQuery = /(điều hòa|dieu hoa|máy lạnh|may lanh)/i.test(clean) ||
      (clean.split(/\s+/).length <= 4 && /(điều hòa|dieu hoa|máy lạnh)/i.test(recentUserMessages));

    const isAudioQuery = /(loa|soundbar|tai nghe|loa thanh|dàn âm thanh)/i.test(clean) ||
      (clean.split(/\s+/).length <= 4 && /(loa|soundbar|tai nghe)/i.test(recentUserMessages));

    const ignore = new Set([
      'có', 'ko', 'không', 'mã', 'giá', 'shop', 'chốt', 'tư', 'vấn', 'bạn', 'mình', 'tôi',
      'cái', 'con', 'chiếc', 'à', 'nhé', 'nha', 'tầm', 'dưới', 'chào', 'hello', 'hi', 'alo',
      'tìm', 'xem', 'mua', 'cho', 'nào', 'gì', 'được', 'hỗ', 'trợ', 'tuyến', 'triệu', 'khoảng',
      'trên', 'cần', 'loại', 'mẫu', 'mấy', 'bao', 'nhiêu', 'ơi', 'với', 'hỏi', 'bên', 'em', 'hàng'
    ]);

    const rawTokens = cleanNoPrice
      .replace(/[?!.,;:()\[\]"']/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 2 && !ignore.has(w));

    const { allBrands, allCategories } = await getTaxonomyData();

    // 6. Nhận diện thương hiệu chính xác từ câu hỏi hiện tại
    let matchedBrands = allBrands.filter((b) => {
      const bName = (b.name || '').toLowerCase();
      if (!bName) return false;
      return clean.includes(bName) || rawTokens.some((t) => bName === t || (t.length >= 3 && bName.includes(t)));
    });

    const isBrandExplicitInCurrentMsg = matchedBrands.length > 0;

    if (matchedBrands.length === 0 && clean.split(/\s+/).length <= 3 && profile.preferredBrands?.length > 0) {
      matchedBrands = allBrands.filter((b) => profile.preferredBrands.includes(b.name));
    }

    const matchedBrandIds = matchedBrands.map((b) => b._id);

    const matchedCategories = allCategories.filter((c) => {
      const cName = (c.name || '').toLowerCase();
      if (isTvQuery && /tivi|tv|smart tv/i.test(cName)) return true;
      if (isFridgeQuery && /tủ lạnh|tu lanh/i.test(cName)) return true;
      if (isWashingQuery && /máy giặt|may giat/i.test(cName)) return true;
      if (isAcQuery && /điều hòa|máy lạnh/i.test(cName)) return true;
      if (isAudioQuery && /loa|âm thanh/i.test(cName)) return true;
      return rawTokens.some((t) => cName.includes(t));
    });
    const matchedCategoryIds = matchedCategories.map((c) => c._id);

    const updatedProfile = { ...profile };
    if (isBrandExplicitInCurrentMsg) {
      const bNames = matchedBrands.map((b) => b.name);
      updatedProfile.preferredBrands = bNames;
    }
    if (isTvQuery) {
      updatedProfile.preferredCategories = ['Tivi'];
      updatedProfile.lastTopic = 'Tivi';
    } else if (isFridgeQuery) {
      updatedProfile.preferredCategories = ['Tủ lạnh'];
      updatedProfile.lastTopic = 'Tủ lạnh';
    } else if (isWashingQuery) {
      updatedProfile.preferredCategories = ['Máy giặt'];
      updatedProfile.lastTopic = 'Máy giặt';
    }
    if (minPrice !== null) updatedProfile.budgetMin = minPrice;
    if (maxPrice !== null) updatedProfile.budgetMax = maxPrice;
    updatedProfile.inquiryCount = (updatedProfile.inquiryCount || 0) + 1;

    // 7. Xây dựng câu truy vấn MongoDB chính xác tuyệt đối (AND logic)
    const queryAnd = [{ isActive: true }, { status: 'published' }];

    if (matchedBrands.length > 0) {
      const brandRegexes = matchedBrands.map((b) => new RegExp(escapeRegex(b.name), 'i'));
      queryAnd.push({
        $or: [
          { brand: { $in: matchedBrandIds } },
          { name: { $in: brandRegexes } },
        ],
      });
    }

    const notTvRegex = /(màn hình gaming|màn hình máy tính|máy hút bụi|dyson|tủ lạnh|máy giặt|điều hòa|âm thanh|loa\b)/i;

    if (isTvQuery) {
      queryAnd.push({
        $and: [
          {
            $or: [
              { name: /(tivi|smart tv|qled|oled|ti vi|4k tv|tivi led|google tivi|android tivi)/i },
              ...(matchedCategoryIds.length > 0 ? [{ categories: { $in: matchedCategoryIds } }] : []),
            ],
          },
          { name: { $not: notTvRegex } },
        ],
      });
    } else if (isFridgeQuery) {
      queryAnd.push({
        $and: [
          {
            $or: [
              { name: /(tủ lạnh|tu lanh|tủ đông|tủ mát|side by side)/i },
              ...(matchedCategoryIds.length > 0 ? [{ categories: { $in: matchedCategoryIds } }] : []),
            ],
          },
          { name: { $not: /(tivi|smart tv|máy giặt|điều hòa|máy hút bụi)/i } },
        ],
      });
    } else if (isWashingQuery) {
      queryAnd.push({
        $and: [
          {
            $or: [
              { name: /(máy giặt|may giat|máy sấy|may say)/i },
              ...(matchedCategoryIds.length > 0 ? [{ categories: { $in: matchedCategoryIds } }] : []),
            ],
          },
          { name: { $not: /(tivi|smart tv|tủ lạnh|điều hòa|máy hút bụi)/i } },
        ],
      });
    } else if (isAcQuery) {
      queryAnd.push({
        $and: [
          {
            $or: [
              { name: /(điều hòa|dieu hoa|máy lạnh|may lanh)/i },
              ...(matchedCategoryIds.length > 0 ? [{ categories: { $in: matchedCategoryIds } }] : []),
            ],
          },
          { name: { $not: /(tivi|smart tv|tủ lạnh|máy giặt|máy hút bụi)/i } },
        ],
      });
    } else if (isAudioQuery) {
      queryAnd.push({
        $and: [
          {
            $or: [
              { name: /(loa|soundbar|tai nghe|loa thanh|dàn âm thanh)/i },
              ...(matchedCategoryIds.length > 0 ? [{ categories: { $in: matchedCategoryIds } }] : []),
            ],
          },
          { name: { $not: /(tivi|smart tv|tủ lạnh|máy giặt|điều hòa|máy hút bụi)/i } },
        ],
      });
    } else if (rawTokens.length > 0) {
      queryAnd.push({
        $or: rawTokens.map((t) => ({ name: new RegExp(escapeRegex(t), 'i') })),
      });
    }

    let rawProducts = await Product.find({ $and: queryAnd })
      .select('name slug brand categories price salePrice stock status productCode specifications isFeatured isHot thumbnail images cachedPrice cachedSalePrice')
      .populate('brand', 'name')
      .populate('categories', 'name')
      .limit(15)
      .lean();

    // 8. Nếu không tìm thấy sản phẩm khớp chính xác thương hiệu / yêu cầu
    if (rawProducts.length === 0) {
      const requestedBrandName = matchedBrands[0]?.name || '';
      const topicName = isTvQuery ? 'Tivi' : (isFridgeQuery ? 'Tủ lạnh' : (isWashingQuery ? 'Máy giặt' : (isAcQuery ? 'Điều hòa' : 'sản phẩm')));

      let notFoundMessage = requestedBrandName
        ? `(KHO HÀNG CỦA SHOP HIỆN CHƯA CÓ sản phẩm ${topicName} của thương hiệu ${requestedBrandName}. Hãy giải thích lịch sự rằng dòng ${topicName} ${requestedBrandName} bên em tạm thời chưa về hàng hoặc đã hết hàng. Lịch sự hỏi xem anh/chị có muốn tham khảo các mẫu ${topicName} đang có sẵn từ các thương hiệu khác trong cửa hàng không. TUYỆT ĐỐI KHÔNG tự ý hiển thị thẻ sản phẩm hay thông số của hãng khác khi khách chưa đồng ý.)`
        : `(Kho hàng của shop hiện chưa có sản phẩm khớp với tiêu chí tìm kiếm này. Hãy lịch sự thông báo và hỏi khách cần tìm sản phẩm nào khác để em hỗ trợ tư vấn.)`;

      return {
        text: notFoundMessage,
        products: [],
        coupons: [],
        updatedProfile,
      };
    }

    const pids = rawProducts.map((p) => p._id);

    const [variants, { activeFlashSales, activePromotions, activeGiftPrograms, activeCoupons }] = await Promise.all([
      ProductVariant.find({ productId: { $in: pids }, isActive: { $ne: false } }).lean(),
      getMarketingData(),
    ]);

    const variantsByProd = {};
    variants.forEach((v) => {
      const pid = v.productId.toString();
      if (!variantsByProd[pid]) variantsByProd[pid] = [];
      variantsByProd[pid].push(v);
    });

    const flashSaleItemMap = new Map();
    const flashSaleProductMap = new Map();

    for (const sale of (activeFlashSales || [])) {
      for (const item of (sale.items || [])) {
        const pId = item.productId?.toString();
        const vId = item.variantId?.toString();
        const rem = Math.max(0, (item.stockLimit || 0) - (item.soldCount || 0));
        if (rem <= 0) continue;

        const itemData = {
          flashSaleId: sale._id,
          flashSaleName: sale.name,
          flashSaleSlug: sale.slug,
          originalPrice: item.originalPrice,
          flashSalePrice: item.flashSalePrice,
          stockLimit: item.stockLimit,
          soldCount: item.soldCount,
          remaining: rem,
          endDate: sale.endDate,
        };

        if (vId) {
          const key = `${pId}_${vId}`;
          const existing = flashSaleItemMap.get(key);
          if (!existing || item.flashSalePrice < existing.flashSalePrice) {
            flashSaleItemMap.set(key, itemData);
          }
        }

        const prodKey = pId;
        const existingProd = flashSaleProductMap.get(prodKey);
        if (!existingProd || item.flashSalePrice < existingProd.flashSalePrice) {
          flashSaleProductMap.set(prodKey, itemData);
        }
      }
    }

    const processedProducts = rawProducts.map((p) => {
      const pid = p._id.toString();
      const categoryIds = (p.categories || []).map((c) => (c._id || c).toString());
      const pVars = variantsByProd[pid] || [];
      const defaultVar = pVars.find((v) => v.isDefault) || pVars[0];

      const basePrice = defaultVar?.price ?? p.cachedPrice ?? p.price ?? 0;
      const baseSale  = defaultVar?.salePrice ?? p.cachedSalePrice ?? p.salePrice ?? 0;

      const defaultVarStock = defaultVar ? Math.max(0, (defaultVar.stock || 0) - (defaultVar.allocated || 0)) : 0;
      const totalStock = pVars.length > 0
        ? pVars.reduce((acc, v) => acc + Math.max(0, (v.stock || 0) - (v.allocated || 0)), 0)
        : Math.max(0, (p.stock || 0));

      const defaultVarId = defaultVar?._id?.toString();
      const matchedFs = (defaultVarId ? flashSaleItemMap.get(`${pid}_${defaultVarId}`) : null) || flashSaleProductMap.get(pid);

      let isFlashSale = false;
      let flashSaleDeal = null;
      let effectivePrice = (baseSale > 0 && basePrice > 0 && baseSale < basePrice) ? baseSale : (baseSale > 0 ? baseSale : basePrice);

      if (matchedFs && matchedFs.flashSalePrice > 0 && matchedFs.flashSalePrice < basePrice && matchedFs.remaining > 0) {
        isFlashSale = true;
        effectivePrice = matchedFs.flashSalePrice;
        flashSaleDeal = {
          name: matchedFs.flashSaleName,
          price: matchedFs.flashSalePrice,
          originalPrice: basePrice,
          remaining: matchedFs.remaining,
          stockLimit: matchedFs.stockLimit,
          soldCount: matchedFs.soldCount,
          discountPercent: Math.round(((basePrice - matchedFs.flashSalePrice) / basePrice) * 100),
          endDate: matchedFs.endDate,
        };
      }

      let bestPromotion = null;
      let applicablePromotions = [];

      if (!isFlashSale && activePromotions?.length > 0) {
        for (const promo of activePromotions) {
          let isScopeMatch = false;
          if (promo.scope?.type === 'all') {
            isScopeMatch = true;
          } else if (promo.scope?.type === 'products') {
            isScopeMatch = (promo.scope.productIds || []).some((id) => id.toString() === pid);
          } else if (promo.scope?.type === 'categories') {
            isScopeMatch = (promo.scope.categoryIds || []).some((id) => categoryIds.includes(id.toString()));
          }

          if (!isScopeMatch) continue;

          let discountedPrice = basePrice;
          let promoApplied = false;

          if (promo.type === 'percent_discount' && promo.discountValue > 0) {
            let discountAmount = (basePrice * promo.discountValue) / 100;
            if (promo.maxDiscountValue && promo.maxDiscountValue > 0) {
              discountAmount = Math.min(discountAmount, promo.maxDiscountValue);
            }
            discountedPrice = Math.round(basePrice - discountAmount);
            promoApplied = true;
          } else if (promo.type === 'fixed_discount' && promo.discountValue > 0) {
            discountedPrice = Math.max(0, basePrice - promo.discountValue);
            promoApplied = true;
          }

          if (promoApplied && discountedPrice < effectivePrice) {
            effectivePrice = discountedPrice;
            bestPromotion = {
              _id: promo._id,
              name: promo.name,
              type: promo.type,
              discountValue: promo.discountValue,
              maxDiscountValue: promo.maxDiscountValue,
              discountedPrice,
            };
          }

          if (promo.type === 'buy_x_pay_y') {
            applicablePromotions.push(`Mua ${promo.triggerQty} tính tiền ${promo.payQty}`);
          } else if (promo.type === 'quantity_discount') {
            applicablePromotions.push(`Mua từ ${promo.triggerQty} sản phẩm giảm ${promo.discountValue}${promo.discountType === 'percent' ? '%' : 'đ'}`);
          }
        }
      }

      let giftDeal = null;
      if (!isFlashSale && activeGiftPrograms?.length > 0) {
        for (const gift of activeGiftPrograms) {
          let isGiftScopeMatch = false;
          if (gift.scope?.type === 'all') {
            isGiftScopeMatch = true;
          } else if (gift.scope?.type === 'products') {
            isGiftScopeMatch = (gift.scope.productIds || []).some((id) => id.toString() === pid);
          } else if (gift.scope?.type === 'categories') {
            isGiftScopeMatch = (gift.scope.categoryIds || []).some((id) => categoryIds.includes(id.toString()));
          }

          if (!isGiftScopeMatch) continue;

          let giftDescription = '';
          let giftSummary = '';
          if (gift.giftType === 'same_product') {
            giftDescription = `Tặng ${gift.giftQty || 1} sản phẩm cùng loại khi mua từ ${gift.triggerQty} sản phẩm`;
            giftSummary = `Tặng thêm ${gift.giftQty || 1} sản phẩm cùng loại`;
          } else if (gift.giftType === 'different_product') {
            const giftItems = (gift.giftProducts || []).map((gp) => `${gp.qty || 1}x ${gp.productId?.name || 'Quà tặng chính hãng'}`).join(', ');
            giftDescription = `Tặng kèm ${giftItems} khi mua từ ${gift.triggerQty} sản phẩm`;
            giftSummary = giftItems ? `Tặng ${giftItems}` : 'Quà tặng kèm chính hãng';
          }

          giftDeal = {
            _id: gift._id,
            name: gift.name,
            triggerQty: gift.triggerQty,
            note: giftDescription,
            summary: giftSummary,
          };
          break;
        }
      }

      const processedVariants = pVars.map((v) => {
        const vId = v._id.toString();
        const vBasePrice = v.price || basePrice;
        const vSalePrice = v.salePrice || 0;
        const vAvailStock = Math.max(0, (v.stock || 0) - (v.allocated || 0));

        const vFs = flashSaleItemMap.get(`${pid}_${vId}`) || (v.isDefault ? flashSaleProductMap.get(pid) : null);
        let vEffPrice = (vSalePrice > 0 && vSalePrice < vBasePrice) ? vSalePrice : (vSalePrice > 0 ? vSalePrice : vBasePrice);
        let vIsFs = false;

        if (vFs && vFs.flashSalePrice > 0 && vFs.flashSalePrice < vBasePrice && vFs.remaining > 0) {
          vEffPrice = vFs.flashSalePrice;
          vIsFs = true;
        } else if (bestPromotion) {
          if (bestPromotion.type === 'percent_discount' && bestPromotion.discountValue > 0) {
            let disc = (vBasePrice * bestPromotion.discountValue) / 100;
            if (bestPromotion.maxDiscountValue > 0) disc = Math.min(disc, bestPromotion.maxDiscountValue);
            const calcPrice = Math.round(vBasePrice - disc);
            if (calcPrice < vEffPrice) vEffPrice = calcPrice;
          } else if (bestPromotion.type === 'fixed_discount' && bestPromotion.discountValue > 0) {
            const calcPrice = Math.max(0, vBasePrice - bestPromotion.discountValue);
            if (calcPrice < vEffPrice) vEffPrice = calcPrice;
          }
        }

        const attrStr = v.attributes?.map((a) => `${a.name}: ${a.value}`).join(' / ') || v.displayName || 'Tiêu chuẩn';

        return {
          _id: v._id,
          sku: v.sku || '',
          displayName: v.displayName || attrStr,
          attributes: v.attributes || [],
          price: vBasePrice,
          salePrice: vEffPrice < vBasePrice ? vEffPrice : vSalePrice,
          effectivePrice: vEffPrice,
          hasDiscount: vEffPrice < vBasePrice,
          isFlashSale: vIsFs,
          stock: vAvailStock,
          isDefault: Boolean(v.isDefault),
        };
      });

      const hasRealDiscount = effectivePrice < basePrice;
      const discountPercent = (hasRealDiscount && basePrice > 0) ? Math.round(((basePrice - effectivePrice) / basePrice) * 100) : 0;

      let dealBadge = '';
      if (isFlashSale) dealBadge = 'Flash Sale';
      else if (bestPromotion) dealBadge = 'Khuyến mãi';
      else if (giftDeal) dealBadge = 'Có quà tặng';
      else if (hasRealDiscount) dealBadge = `Giảm ${discountPercent}%`;

      const thumb =
        (typeof p.thumbnail === 'string' ? p.thumbnail : p.thumbnail?.url) ||
        p.images?.[0]?.url ||
        (typeof p.images?.[0] === 'string' ? p.images[0] : '') ||
        '';

      return {
        _id: p._id,
        name: p.name,
        slug: p.slug,
        brand: p.brand?.name || '',
        categories: p.categories || [],
        price: basePrice,
        salePrice: hasRealDiscount ? effectivePrice : (baseSale > 0 ? baseSale : 0),
        effectivePrice,
        hasRealDiscount,
        discountPercent,
        isFlashSale,
        flashSaleDeal,
        bestPromotion,
        applicablePromotions,
        giftDeal,
        dealBadge,
        stock: totalStock,
        availableStock: defaultVarStock,
        thumbnail: thumb,
        specifications: (p.specifications || []).slice(0, 4),
        variants: processedVariants,
      };
    });

    let candidatePool = processedProducts;

    if (isTvQuery) {
      candidatePool = candidatePool.filter((p) => {
        const n = (p.name || '').toLowerCase();
        if (notTvRegex.test(n)) return false;
        return /(\btv\b|tivi|ti vi|smart tv|qled|oled|4k tv|tivi led|google tivi|android tivi)/i.test(n) ||
          p.categories?.some((c) => /tivi|tv|smart tv/i.test(c.name || ''));
      });
    } else if (isFridgeQuery) {
      candidatePool = candidatePool.filter((p) => {
        const n = (p.name || '').toLowerCase();
        if (n.includes('tivi') || n.includes('tv') || n.includes('máy giặt') || n.includes('máy sấy') || n.includes('máy lạnh') || n.includes('tablet')) return false;
        return /(tủ lạnh|tủ đông|tủ mát|side by side)/i.test(n) || p.categories?.some((c) => /tủ lạnh|tu lanh/i.test(c.name || ''));
      });
    } else if (isWashingQuery) {
      candidatePool = candidatePool.filter((p) => {
        const n = (p.name || '').toLowerCase();
        if (n.includes('tivi') || n.includes('tv') || n.includes('tủ lạnh') || n.includes('máy lạnh')) return false;
        return /(máy giặt|máy sấy)/i.test(n) || p.categories?.some((c) => /máy giặt|may giat/i.test(c.name || ''));
      });
    } else if (isAudioQuery) {
      candidatePool = candidatePool.filter((p) => {
        const n = (p.name || '').toLowerCase();
        if (n.includes('tủ lạnh') || n.includes('máy giặt') || n.includes('máy lạnh')) return false;
        return /(loa|soundbar|tai nghe|âm thanh)/i.test(n) || p.categories?.some((c) => /loa|âm thanh/i.test(c.name || ''));
      });
    }

    // BẮT BUỘC: Khi khách đã hỏi đích danh thương hiệu (Samsung, Sony, LG, Aqua...),
    // CHỈ giữ lại sản phẩm của thương hiệu đó. Tuyệt đối KHÔNG giữ lại thương hiệu khác!
    if (matchedBrands.length > 0) {
      const brandMatched = candidatePool.filter((p) => {
        const pBrand = (p.brand || '').toLowerCase();
        const pName = (p.name || '').toLowerCase();
        return matchedBrands.some((b) => {
          const bName = (b.name || '').toLowerCase();
          return pBrand.includes(bName) || pName.includes(bName);
        });
      });

      candidatePool = brandMatched;
    }

    if (candidatePool.length === 0) {
      const requestedBrandName = matchedBrands[0]?.name || '';
      const topicName = isTvQuery ? 'Tivi' : (isFridgeQuery ? 'Tủ lạnh' : (isWashingQuery ? 'Máy giặt' : (isAcQuery ? 'Điều hòa' : 'sản phẩm')));

      let notFoundMessage = requestedBrandName
        ? `(KHO HÀNG CỦA SHOP HIỆN CHƯA CÓ sản phẩm ${topicName} của thương hiệu ${requestedBrandName}. Hãy giải thích lịch sự rằng dòng ${topicName} ${requestedBrandName} bên em tạm thời chưa về hàng hoặc đã hết hàng. Lịch sự hỏi xem anh/chị có muốn tham khảo các mẫu ${topicName} đang có sẵn từ các thương hiệu khác trong cửa hàng không. TUYỆT ĐỐI KHÔNG tự ý hiển thị thẻ sản phẩm hay thông số của hãng khác khi khách chưa đồng ý.)`
        : `(Kho hàng của shop hiện chưa có sản phẩm khớp với tiêu chí tìm kiếm này. Hãy lịch sự thông báo và hỏi khách cần tìm sản phẩm nào khác để em hỗ trợ tư vấn.)`;

      return {
        text: notFoundMessage,
        products: [],
        coupons: [],
        updatedProfile,
      };
    }

    let matchedProducts = [];
    let priceNoteForPrompt = '';

    if (hasPriceFilter) {
      const inRange = candidatePool.filter((p) => {
        const pPrice = p.effectivePrice;
        const pMatch = pPrice > 0 && (minPrice === null || pPrice >= minPrice) && (maxPrice === null || pPrice <= maxPrice);
        if (pMatch) return true;

        // Kiểm tra biến thể (ví dụ Smart Tivi Samsung 43" có giá 14.490.000đ <= 15M)
        const matchingVariant = p.variants?.find((v) => {
          const vPrice = v.effectivePrice || v.price;
          return vPrice > 0 && (minPrice === null || vPrice >= minPrice) && (maxPrice === null || vPrice <= maxPrice);
        });

        if (matchingVariant) {
          p.effectivePrice = matchingVariant.effectivePrice || matchingVariant.price;
          p.price = matchingVariant.price;
          p.salePrice = matchingVariant.effectivePrice || matchingVariant.salePrice || matchingVariant.price;
          p.dealBadge = matchingVariant.displayName ? `Phiên bản ${matchingVariant.displayName}` : p.dealBadge;
          return true;
        }

        return false;
      });

      const priceRangeLabel = `${minPrice ? (minPrice / 1e6) + ' triệu' : ''}${minPrice && maxPrice ? ' đến ' : ''}${maxPrice ? (maxPrice / 1e6) + ' triệu' : ''}`;

      if (inRange.length > 0) {
        inRange.sort((a, b) => (b.stock > 0 ? 1 : 0) - (a.stock > 0 ? 1 : 0));
        matchedProducts = inRange;
        priceNoteForPrompt = `(KHO HÀNG CÓ ${inRange.length} SẢN PHẨM PHÙ HỢP CÓ GIÁ BÁN THỰC TẾ ĐÚNG TRONG TẦM GIÁ ${priceRangeLabel}. HÃY TƯ VẤN CÁC SẢN PHẨM NÀY, NÊU RÕ GIÁ BÁN THỰC TẾ VÀ CÁC LỰA CHỌN PHIÊN BẢN KÈM THEO.)`;
      } else {
        matchedProducts = [];
        priceNoteForPrompt = `(LƯU Ý: Hiện tại kho của shop chưa có sản phẩm nào có giá đúng trong khoảng ${priceRangeLabel}. Hãy giải thích lịch sự và nhiệt tình tư vấn các mẫu đang có sẵn gần với tầm giá đó nhất.)`;
      }
    } else {
      matchedProducts = candidatePool;
    }

    const lines = [];

    if (updatedProfile.preferredBrands?.length > 0 || updatedProfile.lastTopic) {
      lines.push('=== HỒ SƠ & THÓI QUEN KHÁCH HÀNG (CUSTOMER PREFERENCES) ===');
      if (updatedProfile.lastTopic) lines.push(`- Ngành hàng đang quan tâm: ${updatedProfile.lastTopic}`);
      if (updatedProfile.preferredBrands?.length > 0) lines.push(`- Thương hiệu quan tâm gần đây: ${updatedProfile.preferredBrands.join(', ')}`);
      if (updatedProfile.budgetMax) lines.push(`- Ngân sách mong muốn: Dưới ${(updatedProfile.budgetMax / 1e6)} triệu VNĐ`);
      lines.push('=> Hãy tận dụng thông tin này để tư vấn cá nhân hóa, hiểu đúng ý khách hàng một cách tinh tế.\n');
    }

    lines.push('=== DỮ LIỆU THỰC TẾ TRONG KHO HÀNG CỦA CỬA HÀNG (DỮ LIỆU MONGODB THẬT 100%) ===');
    if (priceNoteForPrompt) {
      lines.push(priceNoteForPrompt);
    }

    const displayProducts = matchedProducts.length > 0 ? matchedProducts : candidatePool.slice(0, 5);

    displayProducts.forEach((p, i) => {
      let priceDetail = '';
      if (p.isFlashSale && p.flashSaleDeal) {
        priceDetail = `${p.effectivePrice.toLocaleString('vi-VN')}đ (GIÁ SỐC FLASH SALE "${p.flashSaleDeal.name}" - Giảm ${p.flashSaleDeal.discountPercent}% so với giá gốc ${p.price.toLocaleString('vi-VN')}đ, còn lại ${p.flashSaleDeal.remaining} suất)`;
      } else if (p.bestPromotion) {
        priceDetail = `${p.effectivePrice.toLocaleString('vi-VN')}đ (GIÁ KHUYẾN MÃI CHƯƠNG TRÌNH "${p.bestPromotion.name}" - Giá niêm yết cũ: ${p.price.toLocaleString('vi-VN')}đ)`;
      } else if (p.hasRealDiscount) {
        priceDetail = `${p.effectivePrice.toLocaleString('vi-VN')}đ (Đang giảm ${p.discountPercent}% - Giá gốc niêm yết cũ: ${p.price.toLocaleString('vi-VN')}đ)`;
      } else {
        priceDetail = p.effectivePrice > 0 ? `${p.effectivePrice.toLocaleString('vi-VN')}đ` : 'Liên hệ';
      }

      lines.push(`\n[Sản phẩm ${i + 1}] Tên chính xác: "${p.name}"`);
      lines.push(`- Hãng: ${p.brand || 'Khác'} | Danh mục: ${p.categories?.map((c) => c.name).join(', ') || 'Chung'}`);
      lines.push(`- GIÁ BÁN THỰC TẾ KHÁCH PHẢI TRẢ: ${priceDetail}`);
      lines.push(`- Tình trạng kho: ${p.stock > 0 ? `Còn hàng (${p.stock} sản phẩm sẵn sàng giao)` : 'Tạm hết hàng'}`);

      if (p.giftDeal) {
        lines.push(`- CHƯƠNG TRÌNH QUÀ TẶNG KÈM: ${p.giftDeal.note}`);
      }
      if (p.applicablePromotions && p.applicablePromotions.length > 0) {
        lines.push(`- ƯU ĐÃI ĐẶC BIỆT: ${p.applicablePromotions.join(' | ')}`);
      }

      if (p.variants?.length > 0) {
        lines.push(`- Các phiên bản / kích cỡ / tùy chọn hiện có (${p.variants.length} lựa chọn):`);
        p.variants.forEach((v) => {
          const vPriceStr = v.effectivePrice ? `${v.effectivePrice.toLocaleString('vi-VN')}đ` : 'Theo giá chuẩn';
          const vDealNote = v.isFlashSale ? ' [Flash Sale]' : (v.hasDiscount ? ' [Đang giảm]' : '');
          const vStockStr = v.stock > 0 ? `Còn ${v.stock} chiếc` : 'Hết hàng';
          lines.push(`  + Tùy chọn [${v.displayName}] -> Giá: ${vPriceStr}${vDealNote} (${vStockStr})`);
        });
      }

      if (p.specifications?.length > 0) {
        const specsStr = p.specifications.slice(0, 5).map((s) => `${s.key}: ${s.value}`).join(' | ');
        lines.push(`- Thông số kỹ thuật: ${specsStr}`);
      }
    });

    if (activeCoupons?.length > 0) {
      lines.push('\n=== MÃ GIẢM GIÁ (VOUCHER) ÁP DỤNG TRONG STORE KHI THANH TOÁN ===');
      activeCoupons.forEach((c) => {
        const discountStr = c.type === 'percent'
          ? `Giảm ${c.value}%${c.maxDiscount ? ' (tối đa ' + c.maxDiscount.toLocaleString('vi-VN') + 'đ)' : ''}`
          : `Giảm ${c.value.toLocaleString('vi-VN')}đ`;
        const minOrderStr = c.minOrderValue > 0 ? ` cho đơn từ ${c.minOrderValue.toLocaleString('vi-VN')}đ` : ' cho mọi đơn';
        lines.push(`- Mã [${c.code}]: ${c.name} - ${discountStr}${minOrderStr}`);
      });
    }

    // CHỈ hiển thị product cards khi có sản phẩm khớp với câu hỏi của khách
    const finalProductsForUI = (matchedProducts.length > 0 ? matchedProducts : candidatePool).slice(0, 3);

    return {
      text: lines.join('\n'),
      products: finalProductsForUI,
      coupons: activeCoupons || [],
      updatedProfile,
    };
  } catch (err) {
    console.error('[fetchProductContext Error]', err);
    return { text: '(Hệ thống đang đồng bộ kho hàng)', products: [], coupons: [], updatedProfile: profile };
  }
};

// ─── Build System Prompt cho Gemini / Groq ──────────────────────────────────
const buildSystemPrompt = (dbDataContext) => `Bạn là chuyên viên tư vấn bán hàng của Siêu thị điện máy & công nghệ SHOP.
Hãy trả lời khách hàng một cách ngắn gọn, nhanh chóng, lễ phép, đúng trọng tâm và tự nhiên như nhân viên tư vấn trực tiếp.

QUY TẮC BẮT BUỘC:
1. Xưng hô: Luôn xưng "em" và gọi khách hàng là "anh/chị". Tuyệt đối không xưng "mình", "tôi", "shop".
2. Tốc độ & Độ súc tích: Đi thẳng vào sản phẩm phù hợp nhất với yêu cầu của khách. Nêu rõ tên sản phẩm, giá bán thực tế và các phiên bản kích thước/màu sắc đang sẵn hàng. Trả lời súc tích trong 2-3 đoạn ngắn, không viết dông dài.
3. Định dạng: Dùng gạch đầu dòng (-) rõ ràng, dễ nhìn. Tuyệt đối KHÔNG dùng bảng biểu Markdown (|...|), KHÔNG dùng emoji.
4. Trung thực với kho hàng: Chỉ tư vấn thông tin dựa trên dữ liệu kho hàng thực tế bên dưới.

DỮ LIỆU KHO HÀNG THỰC TẾ:
${dbDataContext || '(Chưa có dữ liệu kho)'}`;

// ─── Helpers chuẩn hóa Message cho Groq & Gemini ─────────────────────────────
const cleanMessagesForGroq = (systemPrompt, history = [], currentMessage = '') => {
  const msgs = [{ role: 'system', content: systemPrompt }];
  const bodyMsgs = [];
  
  for (const h of history) {
    const role = (h.role === 'assistant' || h.role === 'model' || h.role === 'bot') ? 'assistant' : 'user';
    const content = typeof h.content === 'string' ? h.content.trim() : '';
    if (!content) continue;

    if (bodyMsgs.length === 0 && role === 'assistant') {
      continue;
    }
    if (bodyMsgs.length > 0 && bodyMsgs[bodyMsgs.length - 1].role === role) {
      bodyMsgs[bodyMsgs.length - 1].content += `\n${content}`;
    } else {
      bodyMsgs.push({ role, content });
    }
  }

  if (currentMessage && currentMessage.trim()) {
    const trimmed = currentMessage.trim();
    if (bodyMsgs.length > 0 && bodyMsgs[bodyMsgs.length - 1].role === 'user') {
      bodyMsgs[bodyMsgs.length - 1].content += `\n${trimmed}`;
    } else {
      bodyMsgs.push({ role: 'user', content: trimmed });
    }
  }

  return [...msgs, ...bodyMsgs];
};

const cleanHistoryForGemini = (history = []) => {
  const result = [];
  for (const h of history) {
    const role = (h.role === 'assistant' || h.role === 'model' || h.role === 'bot') ? 'model' : 'user';
    const content = typeof h.content === 'string' ? h.content.trim() : '';
    if (!content) continue;

    if (result.length === 0 && role === 'model') {
      continue;
    }
    if (result.length > 0 && result[result.length - 1].role === role) {
      result[result.length - 1].parts[0].text += `\n${content}`;
    } else {
      result.push({ role, parts: [{ text: content }] });
    }
  }
  return result;
};

// ─── Dynamic Groq Model Discovery (Tự động lấy danh sách model thật còn active từ Groq) ───
let _cachedGroqModels = null;
let _cachedGroqModelsTime = 0;

const getActiveGroqModels = async (groqClient) => {
  const now = Date.now();
  if (_cachedGroqModels && _cachedGroqModels.length > 0 && now - _cachedGroqModelsTime < 10 * 60 * 1000) {
    return _cachedGroqModels;
  }

  try {
    const list = await groqClient.models.list();
    const rawIds = (list.data || [])
      .filter((m) => m.active !== false)
      .map((m) => m.id);

    // Lọc bỏ các model không phải chat/text (whisper, guard, embed, vision)
    const chatModels = rawIds.filter((id) =>
      !id.includes('whisper') &&
      !id.includes('guard') &&
      !id.includes('embed') &&
      !id.includes('vision') &&
      !id.includes('1b') &&
      !id.includes('3b')
    );

    console.log('[Groq Active Chat Models Found]:', chatModels);

    if (chatModels.length > 0) {
      _cachedGroqModels = chatModels;
      _cachedGroqModelsTime = now;
      return chatModels;
    }
  } catch (err) {
    console.warn('[getActiveGroqModels Error]:', err.message);
  }

  return ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'];
};

// ─── Groq Resilience Stream Helper (Tốc độ cao ~200ms TTFT) ─────────────────
const streamGroqCompletion = async (groqClient, messages, onChunk) => {
  const activeModels = await getActiveGroqModels(groqClient);
  let lastError = null;

  for (const model of activeModels) {
    try {
      const groqStream = await groqClient.chat.completions.create({
        model,
        messages,
        stream: true,
        max_tokens: 650,
        temperature: 0.4,
        presence_penalty: 0.2,
        frequency_penalty: 0.2,
      });

      let fullText = '';
      let consecutiveRepeatCount = 0;
      let lastChunk = '';

      for await (const chunk of groqStream) {
        const text = removeEmojis(chunk.choices[0]?.delta?.content || '');
        if (text) {
          if (text === lastChunk && text.length > 3) {
            consecutiveRepeatCount++;
            if (consecutiveRepeatCount > 3) {
              console.warn(`[Anti-Repetition Triggered on model ${model}]`);
              break;
            }
          } else {
            consecutiveRepeatCount = 0;
          }
          lastChunk = text;

          fullText += text;
          onChunk(text);
        }
      }

      if (fullText.trim()) {
        return fullText;
      }
    } catch (err) {
      console.warn(`[Groq Model ${model} Failed]:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('Không thể kết nối đến máy chủ AI');
};

// ─── Stream chat với Fast Groq + Gemini Fallback ─────────────────────────────
const chatStream = async ({ sessionId, message, userId = null }, res) => {
  if (!message?.trim()) {
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Tin nhắn trống' })}\n\n`);
    return res.end();
  }

  res.setHeader('Content-Type',      'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control',     'no-cache, no-transform');
  res.setHeader('Connection',        'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();
  res.socket?.setNoDelay(true);

  const write = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    if (typeof res.flush === 'function') res.flush();
  };

  const sid = sessionId || require('crypto').randomUUID();

  try {
    // 1. TẢI NGỮ CẢNH BỀN VỮNG TỪ MONGODB / CACHE
    const { messages: history, profile } = await getSessionData(sid, userId);
    write({ type: 'session', sessionId: sid });

    // 2. ĐỌC DỮ LIỆU THỰC TẾ TỪ MONGODB KÈM NGỮ CẢNH HỘI THOẠI & HỒ SƠ KHÁCH
    const { text: dbDataContext, products: matchedProducts, updatedProfile } = await fetchProductContext(
      message,
      { history, profile, sessionId: sid, userId }
    );
    const systemPrompt = buildSystemPrompt(dbDataContext);

    // Gửi danh sách sản phẩm khớp câu hỏi ngay lập tức cho client hiển thị Product Card
    if (matchedProducts && matchedProducts.length > 0) {
      write({ type: 'products', products: matchedProducts });
    }

    let streamedSuccess = false;
    let fullText = '';

    // 3. Ưu tiên GROQ siêu tốc (< 200ms) để phản hồi tức thì cho người dùng
    const groqClient = getGroq();
    if (groqClient) {
      try {
        const groqMessages = cleanMessagesForGroq(systemPrompt, history, message);
        fullText = await streamGroqCompletion(groqClient, groqMessages, (textChunk) => {
          write({ type: 'text', text: textChunk });
        });
        streamedSuccess = Boolean(fullText.trim());
      } catch (groqErr) {
        console.warn('[Groq Stream Error, fallback to Gemini]:', groqErr?.message || groqErr);
      }
    }

    // 4. Fallback sang Gemini nếu Groq chưa thành công
    if (!streamedSuccess) {
      const genAI = getGeminiClient();
      if (genAI) {
        const geminiModels = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
        for (const geminiModel of geminiModels) {
          try {
            const geminiHistory = cleanHistoryForGemini(history);
            const model = genAI.getGenerativeModel({
              model: geminiModel,
              systemInstruction: systemPrompt,
            });

            const chatSession = model.startChat({ history: geminiHistory });
            const result = await chatSession.sendMessageStream(message);

            for await (const chunk of result.stream) {
              const text = removeEmojis(chunk.text() || '');
              if (text) {
                fullText += text;
                write({ type: 'text', text });
              }
            }
            streamedSuccess = true;
            break;
          } catch (geminiErr) {
            console.warn(`[Gemini Model ${geminiModel} Failed]:`, geminiErr?.message || geminiErr);
          }
        }
      }
    }

    if (!streamedSuccess && !fullText) {
      throw new Error('Không thể kết nối đến máy chủ AI tư vấn');
    }

    // 5. CẬP NHẬT LỊCH SỬ & HỒ SƠ VÀO MONGODB
    const updatedMessages = [
      ...history,
      { role: 'user', content: message, timestamp: new Date() },
      { role: 'assistant', content: fullText, products: matchedProducts || [], timestamp: new Date() },
    ];

    await saveSessionData(sid, {
      messages: updatedMessages,
      profile: updatedProfile,
      userId,
    });

    write({ type: 'done' });
  } catch (err) {
    console.error('[Chatbot Stream Error]', err?.message || err);
    write({
      type: 'error',
      message: 'Hệ thống tư vấn đang bận một chút, anh/chị vui lòng thử lại giúp em nhé!',
    });
  } finally {
    res.end();
  }
};

// ─── Non-stream fallback ──────────────────────────────────────────────────────
const chat = async ({ sessionId, message, userId = null }) => {
  const sid = sessionId || require('crypto').randomUUID();
  const { messages: history, profile } = await getSessionData(sid, userId);

  const { text: dbDataContext, products: matchedProducts, updatedProfile } = await fetchProductContext(
    message,
    { history, profile, sessionId: sid, userId }
  );
  const systemPrompt = buildSystemPrompt(dbDataContext);

  let reply = '';

  const genAI = getGeminiClient();
  if (genAI) {
    const geminiModels = ['gemini-1.5-flash', 'gemini-2.0-flash'];
    for (const geminiModel of geminiModels) {
      try {
        const geminiHistory = cleanHistoryForGemini(history);
        const model = genAI.getGenerativeModel({
          model: geminiModel,
          systemInstruction: systemPrompt,
        });

        const chatSession = model.startChat({ history: geminiHistory });
        const result = await chatSession.sendMessage(message);
        const response = await result.response;
        reply = removeEmojis(response.text() || '');
        if (reply) break;
      } catch (geminiErr) {
        console.warn(`[Gemini Non-Stream ${geminiModel} Error]`, geminiErr?.message || geminiErr);
      }
    }
  }

  if (!reply) {
    const groqClient = getGroq();
    if (!groqClient) {
      throw new Error('Không thể kết nối dịch vụ AI');
    }

    const activeModels = await getActiveGroqModels(groqClient);

    for (const model of activeModels) {
      try {
        const groqRes = await groqClient.chat.completions.create({
          model,
          messages: groqMessages,
          max_tokens: 650,
          temperature: 0.4,
          presence_penalty: 0.2,
          frequency_penalty: 0.2,
        });
        reply = removeEmojis(groqRes.choices[0]?.message?.content || '');
        if (reply) break;
      } catch (err) {
        console.warn(`[Groq Non-Stream Model ${model} Failed]:`, err.message);
      }
    }
  }

  const updatedMessages = [
    ...history,
    { role: 'user', content: message, timestamp: new Date() },
    { role: 'assistant', content: reply, products: matchedProducts || [], timestamp: new Date() },
  ];

  await saveSessionData(sid, {
    messages: updatedMessages,
    profile: updatedProfile,
    userId,
  });

  return { reply, sessionId: sid, products: matchedProducts || [] };
};

const resetSession = async (sid) => {
  memoryCache.delete(sid);
  try {
    await ChatSession.deleteOne({ sessionId: sid });
  } catch (err) {
    console.error('[resetSession Error]', err.message);
  }
};

const getHistoryFromDB = async (sessionId, userId = null) => {
  return await getSessionData(sessionId, userId);
};

module.exports = { chat, chatStream, resetSession, getHistoryFromDB };
