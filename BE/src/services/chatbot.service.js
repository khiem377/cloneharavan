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
const { buildUserProfile } = require('./recommendation.service');

// ─── Gemini AI Init ───────────────────────────────────────────────────────────
let _genAI = null;
let _workingGeminiModel = 'gemini-flash-lite-latest';
const GEMINI_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
];

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

// ─── Vietnamese Conversational Stop Words for E-Commerce ─────────────────────
const VIETNAMESE_STOP_WORDS = new Set([
  'shop', 'có', 'co', 'bên', 'ben', 'mình', 'minh', 'không', 'khong', 'k', 'ko', 'nào', 'nao', 'gì', 'gi',
  'ơi', 'oi', 'ạ', 'a', 'hỏi', 'tư', 'vấn', 'cho', 'em', 'anh', 'chị', 'chi', 'giá', 'gia', 'bao', 'nhiêu',
  'nhieu', 'xem', 'bán', 'ban', 'được', 'duoc', 'cần', 'can', 'tìm', 'tim', 'với', 'voi', 'sản', 'san',
  'phẩm', 'pham', 'liên', 'lien', 'quan', 'đến', 'den', 'về', 've', 'của', 'cua', 'những', 'nhung', 'các',
  'cac', 'còn', 'con', 'hàng', 'hang', 'mẫu', 'mau', 'loại', 'loai', 'dòng', 'dong', 'nữa', 'nua', 'chứ',
  'chu', 'nhe', 'nha', 'nhé', 'hả', 'ha', 'giúp', 'giup', 'biết', 'biet', 'phải', 'phai', 'mà', 'ma', 'là',
  'la', 'đang', 'dang', 'sẵn', 'san', 'mua', 'muon', 'muốn', 'thì', 'thi', 'ở', 'o', 'đâu', 'dau',
]);

// ─── Extract Brands with Negation Guard (Chống nhận nhầm "không phải AULA") ──
const extractBrandsWithNegation = (cleanText = '', allBrands = []) => {
  const matchedBrands = [];
  const excludedBrands = [];

  for (const b of allBrands) {
    const bName = (b.name || '').toLowerCase().trim();
    const bSlug = (b.slug || '').toLowerCase().trim();
    if (!bName && !bSlug) continue;

    const pattern = `(?:^|\\s|[.,?!;])${escapeRegex(bName)}(?:$|\\s|[.,?!;])`;
    const regex = new RegExp(pattern, 'i');
    const slugRegex = bSlug ? new RegExp(`(?:^|\\s|[.,?!;])${escapeRegex(bSlug)}(?:$|\\s|[.,?!;])`, 'i') : null;

    let matched = false;
    let matchIdx = -1;

    const nameMatch = cleanText.search(regex);
    if (nameMatch !== -1) {
      matched = true;
      matchIdx = nameMatch;
    } else if (slugRegex) {
      const slugMatch = cleanText.search(slugRegex);
      if (slugMatch !== -1) {
        matched = true;
        matchIdx = slugMatch;
      }
    }

    if (matched) {
      const prefix = cleanText.substring(Math.max(0, matchIdx - 40), matchIdx);
      const isNegated = /(?:không phải|ko phải|chẳng phải|không thích|ko thích|trừ|bỏ|đừng lấy|không lấy|ko lấy|ngoại trừ|ngoài|chứ không|chứ ko)\s*[^\n\r]{0,25}$/iu.test(prefix);

      if (isNegated) {
        excludedBrands.push(b);
      } else {
        matchedBrands.push(b);
      }
    }
  }

  return { matchedBrands, excludedBrands };
};

// ─── Extract Clean Search Tokens (Bóc tách từ khóa đích danh, loại bỏ phủ định) ──
const extractCleanTokens = (text = '', excludedBrands = []) => {
  if (!text) return [];
  let clean = text.toLowerCase();
  // 1. Loại bỏ các cụm phủ định (ví dụ: "không phải aula guma", "ko phải samsung")
  clean = clean.replace(/(?:không phải|ko phải|chẳng phải|không thích|ko thích|trừ|bỏ|đừng lấy|không lấy|ko lấy|ngoại trừ|ngoài|chứ không|chứ ko)\s+[^\s,;?!.]+(?:\s+[^\s,;?!.]+)?/gi, ' ');
  // 2. Loại bỏ các từ trigger phủ định đứng rời
  clean = clean.replace(/\b(?:không phải|ko phải|chẳng phải|không thích|ko thích|trừ|bỏ|đừng lấy|không lấy|ko lấy|ngoại trừ|ngoài|chứ không|chứ ko)\b/gi, ' ');
  // 3. Loại bỏ thương hiệu bị loại trừ
  if (Array.isArray(excludedBrands) && excludedBrands.length > 0) {
    for (const eb of excludedBrands) {
      const ebName = (typeof eb === 'string' ? eb : eb?.name || '').toLowerCase().trim();
      if (ebName) {
        clean = clean.replace(new RegExp(`(?:^|\\s|[.,?!;])${escapeRegex(ebName)}(?:$|\\s|[.,?!;])`, 'gi'), ' ');
      }
    }
  }
  // 4. Bóc tách từ và lọc stop words tiếng Việt
  return clean
    .replace(/[?!.,;:()\[\]"'/\\-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !VIETNAMESE_STOP_WORDS.has(w));
};

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

  const underMatchK = clean.match(/(?:dưới|<|<=|không quá|nhỏ hơn|tối đa|tầm dưới|ít hơn)\s*(\d+(?:[.,]\d+)?)\s*(?:k|nghìn|ngàn)\b/i);
  if (underMatchK) {
    maxPrice = parseFloat(underMatchK[1].replace(',', '.')) * 1_000;
    return { minPrice: null, maxPrice };
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

// ─── AI AGENTIC REASONING (Tự suy luận ý định, ngữ cảnh & tiếng lóng 100%) ───
const reasonCustomerIntent = async (message = '', { history = [], profile = {}, allCategories = [], allBrands = [] } = {}) => {
  const clean = message.toLowerCase().trim();

  // 1. Fast-path: Chào hỏi đơn thuần (0ms)
  const isGreetingOnly =
    /^(dạ\s*)?(hi|hello|helo|chào|xin chào|kính chào|alo|cảm ơn|thanks|thank you|ok|oke|oki|okie|xong|tạm biệt|bye|bye bye|ê|shop ơi|ad ơi|admin ơi|em ơi|anh ơi|chị ơi)([\s,.-]+(bạn|shop|ad|admin|em|anh|chị|ơi|ạ|nha|nhé|nè|nhen|cả nhà|mọi người|với))*[\s?!.,]*$/i.test(clean) ||
    /^(cho (em|mình|tôi|anh|chị) hỏi( với| chút| xíu| một câu)?|hỏi tí|hỏi xíu|shop ơi cho hỏi|tư vấn giúp( mình| em| anh| chị)?|shop có đó không|có ai trực không|cần hỗ trợ|cần tư vấn|bên mình có bán gì|shop bán những gì)[\s?!.,]*$/i.test(clean);
  if (isGreetingOnly) {
    return {
      isGreetingOnly: true,
      isOrderInquiry: false,
      category: null,
      brand: null,
      negatedBrands: [],
      targetPrice: null,
      minPrice: null,
      maxPrice: null,
      searchKeywords: '',
      reasoningNote: 'Khách chào hỏi xã giao',
    };
  }

  // 2. Fast-path: Tra cứu đơn hàng (0ms)
  const isOrderInquiry = /(đơn hàng|tra cứu đơn|kiểm tra đơn|xem đơn|tình trạng đơn|mã vận đơn|khi nào giao|ship hàng|vận chuyển)/i.test(clean);
  if (isOrderInquiry) {
    return {
      isGreetingOnly: false,
      isOrderInquiry: true,
      category: null,
      brand: null,
      negatedBrands: [],
      targetPrice: null,
      minPrice: null,
      maxPrice: null,
      searchKeywords: '',
      reasoningNote: 'Khách hỏi tra cứu đơn hàng',
    };
  }

  // 3. AI Reasoning (Gemini Flash-Lite -> Flash -> Flash-Lite fallback)
  const catNames = (allCategories || []).map((c) => c.name || c).filter(Boolean);
  const brandNames = (allBrands || []).map((b) => b.name || b).filter(Boolean);

  const recentHistorySummary = (history || [])
    .slice(-3)
    .map((h) => `${h.role === 'user' ? 'Khách' : 'Bot'}: ${h.content}`)
    .join('\n');

  const prompt = `Bạn là hệ thống suy luận ý định (NLU & Reasoning) cho website thương mại điện tử điện máy SHOP.
Nhiệm vụ: Phân tích câu nói của khách hàng (có thể chứa tiếng lóng Việt Nam, từ địa phương, tiếng lóng tiền tệ: củ, củ khoai, củ tỏi, cành, chai, lít, xị, dế, dế gập, máy cỏ, 1 ngựa, pin trâu, máy giặt êm...):
Lịch sử hội thoại gần đây:
${recentHistorySummary || '(Chưa có)'}

Câu mới của khách: "${message}"

Danh mục cửa hàng hiện có: ${JSON.stringify(catNames)}
Thương hiệu cửa hàng hiện có: ${JSON.stringify(brandNames)}

Quy tắc suy luận:
1. Hiểu ngữ cảnh đời sống Việt Nam: "củ khoai", "củ tỏi", "cành", "chai" = triệu VNĐ khi mua đồ công nghệ/điện tử. "lít", "xị" = trăm nghìn VNĐ. "dế" = điện thoại, "dế gập" = điện thoại gập (Z Flip/Fold). "máy cỏ" = điện thoại cơ bản phím bấm. "1 ngựa" = điều hòa 1 HP (9.000 BTU). "tv" / "tivi" / "vô tuyến" = Tivi. "máy giặc" = "Máy giặt" (lỗi chính tả phổ biến). Chữ "k" ở cuối câu (ví dụ "dưới 20 củ k") là chữ "không" (từ để hỏi), không phải nghìn.
2. BẮT BUỘC: Đơn vị tiền tệ trong JSON phải là VNĐ đầy đủ dạng số nguyên (ví dụ: 20 củ = 20000000, 15 triệu = 15000000, 8tr = 8000000, 500k = 500000, tuyệt đối không trả về 20 hay 15).
3. Nếu khách nói "tầm X" hoặc "khoảng X", hãy tự động suy luận khoảng giá minPrice = X * 0.85 và maxPrice = X * 1.2 tính theo VNĐ đầy đủ.
4. Nếu khách nói "dưới X", minPrice = null, maxPrice = X (VNĐ đầy đủ). Nếu khách nói "trên X", minPrice = X (VNĐ đầy đủ), maxPrice = null.
5. NHẬN DIỆN PHỦ ĐỊNH (Negation Guard - Cực kỳ quan trọng):
   - Nếu khách nói "không phải X", "ko phải X", "trừ X", "bỏ X", "không thích X", "đừng lấy X" (ví dụ: "không phải aula", "không lấy samsung"):
     + "negatedBrands": mảng chứa tên thương hiệu bị phủ định (ví dụ ["AULA"]).
     + "brand": TUYỆT ĐỐI KHÔNG để thương hiệu bị phủ định vào đây! Chỉ điền "brand" khi khách thực sự muốn tìm thương hiệu đó một cách chủ động.
6. TRÍCH XUẤT TỪ KHÓA TÌM KIẾM CỐT LÕI ("searchKeywords"):
   - Trích xuất tên model, dòng sản phẩm, phiên bản giới hạn, tên tuyển thủ/nhân vật, mã sản phẩm (ví dụ: "gumayusi", "guma", "vanguard", "s24", "f75", "115 inch").
   - LOẠI BỎ hoàn toàn các từ giao tiếp như "không phải", "mà là", "có sản phẩm nào liên quan đến", "còn không", "bên shop có", "tư vấn", "cho mình hỏi".
7. CHỌN DANH MỤC ("category"):
   - Chọn 1 "category" chuẩn từ danh mục của cửa hàng nếu khách hỏi rõ một ngành hàng (ví dụ "chuột", "bàn phím cơ", "tivi", "điện thoại").
   - NẾU khách hỏi tổng quát hoặc hỏi tìm mọi thứ liên quan đến một cái tên/từ khóa (ví dụ: "có sản phẩm nào liên quan đến gumayusi k", "bên mình có gì của ronaldo"): ĐẶT "category": null để hệ thống tìm kiếm trên TOÀN BỘ các ngành hàng (chuột, lót chuột, bàn phím, v.v.).
8. Trả về DUY NHẤT một chuỗi JSON hợp lệ:
{
  "isGreetingOnly": boolean,
  "isOrderInquiry": boolean, // CHỈ TRUE KHI KHÁCH HỎI TRA CỨU ĐƠN HÀNG ĐÃ ĐẶT (ví dụ "kiểm tra đơn hàng", "khi nào giao", "mã vận đơn"). TUYỆT ĐỐI FALSE KHI KHÁCH HỎI TÌM MUA SẢN PHẨM HOẶC HỎI HÀNG TRONG KHO.
  "category": string hoặc null,
  "brand": string hoặc null,
  "negatedBrands": string[],
  "targetPrice": number hoặc null,
  "minPrice": number hoặc null,
  "maxPrice": number hoặc null,
  "searchKeywords": string,
  "reasoningNote": string
}`;

  const genAI = getGeminiClient();
  if (genAI) {
    const reasoningModels = ['gemini-flash-lite-latest', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    for (const mName of reasoningModels) {
      try {
        const m = genAI.getGenerativeModel({
          model: mName,
          generationConfig: { responseMimeType: 'application/json', temperature: 0.1 }
        });
        const res = await m.generateContent(prompt);
        const parsed = JSON.parse(res.response.text());
        if (parsed) {
          if (!Array.isArray(parsed.negatedBrands)) parsed.negatedBrands = [];
          return parsed;
        }
      } catch (err) {
        console.warn(`[reasonCustomerIntent ${mName} Failed]:`, err.message);
      }
    }
  }

  // Graceful fallback nếu không thể gọi AI
  return fallbackRegexIntent(clean, { history, profile, allCategories, allBrands });
};

const fallbackRegexIntent = (clean, { history = [], profile = {}, allCategories = [], allBrands = [] } = {}) => {
  const { minPrice, maxPrice } = parsePriceFilter(clean);
  let category = null;
  if (/(\btv\b|tivi|ti vi|smart tv)/i.test(clean)) category = 'Tivi';
  else if (/(điện thoại|dien thoai|smartphone|galaxy|iphone|dế)/i.test(clean)) category = 'Điện thoại';
  else if (/(laptop|macbook)/i.test(clean)) category = 'Laptop';
  else if (/(máy tính bảng|tablet|ipad)/i.test(clean)) category = 'Máy tính bảng';
  else if (/(tủ lạnh|tu lanh)/i.test(clean)) category = 'Tủ lạnh';
  else if (/(máy giặt|máy giặc|may giat|may giac|máy sấy|may say)/i.test(clean)) category = 'Máy giặt';
  else if (/(điều hòa|dieu hoa|máy lạnh|may lanh)/i.test(clean)) category = 'Điều hòa';
  else if (/(lót chuột|lot chuot|mouse pad|pad chuột)/i.test(clean)) category = 'Lót chuột Gaming';
  else if (/(chuột|chuot|mouse)/i.test(clean)) category = 'Chuột Gaming';
  else if (/(bàn phím|ban phim|keyboard|phím cơ|phim co)/i.test(clean)) category = 'Bàn phím cơ';
  else if (/(loa|soundbar|tai nghe)/i.test(clean)) category = 'Âm thanh';
  else if (/(đồng hồ|smartwatch)/i.test(clean)) category = 'Đồng hồ';

  // Tách thương hiệu với cơ chế chống phủ định
  const { matchedBrands: directMatched, excludedBrands: directExcluded } = extractBrandsWithNegation(clean, allBrands);
  const brand = directMatched[0]?.name || null;
  const negatedBrands = directExcluded.map((b) => b.name);

  // Trích xuất từ khóa sạch (loại bỏ từ nối, từ phủ định)
  const meaningfulWords = extractCleanTokens(clean, directExcluded);

  // CHỈ kế thừa chủ đề từ hội thoại gần nhất nếu khách KHÔNG nhắc đến từ khóa riêng biệt nào
  if (!category && meaningfulWords.length === 0 && clean.split(/\s+/).length <= 3) {
    if (profile.lastTopic) {
      category = profile.lastTopic;
    } else {
      const recentChat = (history || []).slice(-3).map((h) => h.content || '').join(' ').toLowerCase();
      if (/(bàn phím|phím cơ|keyboard)/i.test(recentChat)) category = 'Bàn phím cơ';
      else if (/(chuột|mouse)/i.test(recentChat)) category = 'Chuột Gaming';
      else if (/(tivi|smart tv)/i.test(recentChat)) category = 'Tivi';
      else if (/(điện thoại|smartphone|iphone)/i.test(recentChat)) category = 'Điện thoại';
      else if (/(laptop|macbook)/i.test(recentChat)) category = 'Laptop';
    }
  }

  return {
    isGreetingOnly: false,
    isOrderInquiry: false,
    category,
    brand,
    negatedBrands,
    targetPrice: null,
    minPrice,
    maxPrice,
    searchKeywords: meaningfulWords.join(' ') || category || '',
    reasoningNote: 'Fallback regex parsing with smart keywords and negation handling',
  };
};

// ─── TÍNH ĐIỂM ĐỘ TƯƠNG THÍCH SẢN PHẨM (RELEVANCE SCORING) ───────────────────
const scoreProductRelevance = (p, ctx = {}) => {
  const {
    clean = '',
    rawTokens = [],
    isPhoneQuery = false,
    isLaptopQuery = false,
    isTabletQuery = false,
    isTvQuery = false,
    isFridgeQuery = false,
    isWashingQuery = false,
    isAcQuery = false,
    isAudioQuery = false,
    isWatchQuery = false,
    isMouseQuery = false,
    isKeyboardQuery = false,
    isPadQuery = false,
    matchedBrands = [],
    excludedBrands = [],
  } = ctx;

  const pName = (p.name || '').toLowerCase();
  const brandName = (p.brand?.name || p.brand || '').toString().toLowerCase();
  const catNames = (p.categories || []).map((c) => (c.name || '').toLowerCase()).join(' ');

  let score = 0;

  // 1. Phạt nặng nếu thuộc thương hiệu khách đã từ chối (Negated Brands)
  if (excludedBrands && excludedBrands.length > 0) {
    const isExcluded = excludedBrands.some((b) => {
      const bName = (b.name || '').toLowerCase().trim();
      return bName && (brandName.includes(bName) || pName.includes(bName));
    });
    if (isExcluded) {
      return -2500;
    }
  }

  // 1b. Khớp thương hiệu (Brand match)
  if (matchedBrands && matchedBrands.length > 0) {
    const isBrand = matchedBrands.some((b) => {
      const bName = (b.name || '').toLowerCase();
      return brandName.includes(bName) || pName.includes(bName);
    });
    if (isBrand) {
      score += 120;
    } else if (ctx.hasExplicitBrand) {
      score -= 300; // CHỈ phạt nặng nếu khách đích danh hỏi hãng này trong câu hiện tại mà sản phẩm thuộc hãng khác
    }
  }

  // 2. Khớp ngành hàng chính xác (Category & Keyword Intent)
  if (isPhoneQuery) {
    if (/(điện thoại|smartphone|galaxy s\d+|galaxy z|iphone|redmi|xiaomi 14)/i.test(pName) || /(điện thoại|smartphone|phone|mobile)/i.test(catNames)) {
      score += 150;
    }
    if (/^điện thoại/i.test(pName)) {
      score += 50; // Ưu tiên hàng đầu cho các sản phẩm có tiền tố chuẩn "Điện thoại ..."
    }
    // Trừ điểm triệt để các sản phẩm không phải điện thoại (máy tính bảng, tablet, tab, đồng hồ, tai nghe, âm thanh, phụ kiện,...)
    if (/(đồng hồ|watch|smartwatch|tai nghe|earbuds|airpods|headphone|loa\b|soundbar|\btab\b|galaxy tab|tab s|tablet|ipad|máy tính bảng|tivi|tủ lạnh|máy giặt|điều hòa|cáp sạc|ốp lưng|bao da)/i.test(pName) || /(tablet|máy tính bảng|đồng hồ|tai nghe|phụ kiện)/i.test(catNames)) {
      score -= 1000;
    }
  } else if (isLaptopQuery) {
    if (/(laptop|macbook|máy tính xách tay)/i.test(pName) || /laptop/i.test(catNames)) {
      score += 150;
    }
    if (/(đồng hồ|tai nghe|tivi|điện thoại|máy giặt|tủ lạnh)/i.test(pName)) {
      score -= 1000;
    }
  } else if (isTabletQuery) {
    if (/(máy tính bảng|tablet|ipad|galaxy tab|tab s)/i.test(pName) || /tablet|máy tính bảng/i.test(catNames)) {
      score += 150;
    }
    if (/(đồng hồ|tai nghe|tivi|điện thoại|máy giặt|tủ lạnh)/i.test(pName)) {
      score -= 1000;
    }
  } else if (isTvQuery) {
    if (/(tivi|smart tv|qled|oled|ti vi|4k tv)/i.test(pName) || /tivi|tv/i.test(catNames)) {
      score += 150;
    }
    if (/(điện thoại|laptop|tai nghe|máy giặt|tủ lạnh)/i.test(pName)) {
      score -= 1000;
    }
  } else if (isWatchQuery) {
    if (/(đồng hồ|smartwatch|apple watch|galaxy watch)/i.test(pName) || /(đồng hồ|smartwatch)/i.test(catNames)) {
      score += 150;
    }
    if (/(điện thoại|laptop|tivi|tai nghe|máy giặt)/i.test(pName)) {
      score -= 1000;
    }
  } else if (isAudioQuery) {
    if (/(loa|soundbar|tai nghe|airpods|headphone|earbuds)/i.test(pName) || /loa|âm thanh|tai nghe/i.test(catNames)) {
      score += 150;
    }
    if (/(điện thoại|laptop|tivi|máy giặt|tủ lạnh)/i.test(pName)) {
      score -= 1000;
    }
  } else if (isFridgeQuery) {
    if (/(tủ lạnh|tủ đông|tủ mát|side by side)/i.test(pName) || /tủ lạnh/i.test(catNames)) {
      score += 150;
    }
    if (/(tivi|máy giặt|điều hòa|điện thoại)/i.test(pName)) {
      score -= 1000;
    }
  } else if (isWashingQuery) {
    if (/(máy giặt|máy giặc|may giat|may giac|máy sấy|may say)/i.test(pName) || /(máy giặt|giặt|sấy)/i.test(catNames)) {
      score += 150;
    }
    if (/(tivi|tủ lạnh|điều hòa|điện thoại)/i.test(pName)) {
      score -= 1000;
    }
  } else if (isAcQuery) {
    if (/(điều hòa|máy lạnh)/i.test(pName) || /điều hòa|máy lạnh/i.test(catNames)) {
      score += 150;
    }
    if (/(tivi|tủ lạnh|máy giặt|điện thoại)/i.test(pName)) {
      score -= 1000;
    }
  } else if (isMouseQuery) {
    if (/(chuột|mouse)/i.test(pName) || /chuột/i.test(catNames)) {
      score += 180;
    }
    if (/(tivi|tủ lạnh|máy giặt|điều hòa|máy tính bảng)/i.test(pName)) {
      score -= 1000;
    }
  } else if (isKeyboardQuery) {
    if (/(bàn phím|keyboard|phím cơ)/i.test(pName) || /bàn phím/i.test(catNames)) {
      score += 180;
    }
    if (/(tivi|tủ lạnh|máy giặt|điều hòa|điện thoại)/i.test(pName)) {
      score -= 1000;
    }
  } else if (isPadQuery) {
    if (/(lót chuột|pad chuột|mouse pad)/i.test(pName) || /lót chuột/i.test(catNames)) {
      score += 180;
    }
    if (/(tivi|tủ lạnh|máy giặt|điều hòa)/i.test(pName)) {
      score -= 1000;
    }
  }

  // 3. Khớp các từ khóa dòng máy / model / edition / tuyển thủ (Gumayusi, Vanguard, F75, S24...)
  if (rawTokens && rawTokens.length > 0) {
    for (const token of rawTokens) {
      if (token.length >= 2) {
        if (pName.includes(token)) {
          score += 350; // Ưu tiên hàng đầu cho sản phẩm khớp chính xác từ khóa khách hỏi!
        } else if (p.slug && p.slug.includes(token)) {
          score += 200;
        } else if (p.productCode && p.productCode.toLowerCase().includes(token)) {
          score += 200;
        } else if (p.keywords && p.keywords.some((k) => (k || '').toLowerCase().includes(token))) {
          score += 150;
        } else if (p.specifications && p.specifications.some((s) => (s.value || '').toLowerCase().includes(token))) {
          score += 120;
        }
      }
    }
  }

  // 4. Ưu tiên hàng còn trong kho
  if (p.stock > 0) {
    score += 25;
  }

  // 5. Ưu tiên sản phẩm đang có chương trình giảm giá thật hoặc flash sale
  if (p.isFlashSale || p.hasRealDiscount) {
    score += 15;
  }

  return score;
};

// ─── REAL-TIME MONGODB RAG FETCH ──────────────────────────────────────────────
const fetchProductContext = async (message = '', { history = [], profile = {}, sessionId = '', userId = null, currentProductSlug = null, currentUrl = null } = {}) => {
  try {
    const clean = message.toLowerCase().trim();
    const { allBrands, allCategories } = await getTaxonomyData();

    // 1. TỰ SUY LUẬN Ý ĐỊNH, NGỮ CẢNH & TIẾNG LÓNG BẰNG AI REASONING (Zero Hardcoding)
    const intent = await reasonCustomerIntent(message, {
      history,
      profile,
      allCategories,
      allBrands,
    });

    if (intent.isGreetingOnly) {
      return {
        text: '(Khách hàng đang chào hỏi / giao tiếp xã giao. Hãy chào lại lễ phép, xưng "em" và gọi "anh/chị", tự giới thiệu em là chuyên viên tư vấn bán hàng của SHOP và hỏi xem anh/chị cần hỗ trợ tìm kiếm sản phẩm nào hay cần tư vấn thông tin gì hôm nay ạ. TUYỆT ĐỐI KHÔNG tự ý liệt kê hay gợi ý danh sách sản phẩm nào khi khách chưa hỏi sản phẩm cụ thể.)',
        products: [],
        coupons: [],
        updatedProfile: profile,
      };
    }

    const isRealOrderInquiry = intent.isOrderInquiry && /(đơn hàng|tra cứu đơn|kiểm tra đơn|xem đơn|tình trạng đơn|mã vận đơn|khi nào giao|ship hàng|vận chuyển)/i.test(clean);
    if (isRealOrderInquiry) {
      return {
        text: '(Khách hàng đang hỏi về tra cứu hoặc kiểm tra đơn hàng. Hãy xưng "em" và gọi "anh/chị". Hướng dẫn lễ phép: Anh/chị có thể xem danh sách và trạng thái chi tiết tất cả đơn hàng đã đặt tại mục "Đơn hàng của tôi" trong trang Tài khoản (/tai-khoan?tab=orders). Hoặc anh/chị có thể cung cấp Mã đơn hàng và Số điện thoại đặt hàng ngay tại đây để em hỗ trợ kiểm tra trực tiếp giúp mình ạ.)',
        products: [],
        coupons: [],
        updatedProfile: profile,
      };
    }

    // 2. Nhận diện sản phẩm khách đang xem trực tiếp trên màn hình
    let resolvedProductSlug = currentProductSlug;
    if (!resolvedProductSlug && currentUrl && currentUrl.includes('/products/')) {
      resolvedProductSlug = currentUrl.split('/products/')[1]?.split('?')[0]?.split('/')[0] || null;
    }

    let currentViewedProduct = null;
    if (resolvedProductSlug) {
      try {
        currentViewedProduct = await Product.findOne({ slug: resolvedProductSlug, isActive: true })
          .select('name slug brand categories price salePrice stock status productCode specifications isFeatured isHot thumbnail images cachedPrice cachedSalePrice')
          .populate('brand', 'name')
          .populate('categories', 'name')
          .lean();
      } catch (err) {
        console.warn('[Fetch Current Product Warn]', err?.message);
      }
    }

    // 3. Tích hợp User Profile từ cỗ máy Recommendation (Real-time Profile)
    let userBrowsingProfile = null;
    try {
      if (typeof buildUserProfile === 'function' && (userId || sessionId)) {
        userBrowsingProfile = await buildUserProfile(userId, sessionId);
      }
    } catch (e) {
      // non-blocking
    }

    // 4. Giải mã các thuộc tính đã suy luận bởi AI
    const resolvedCategory = intent.category || null;
    const resolvedBrand = intent.brand || null;
    let minPrice = intent.minPrice;
    let maxPrice = intent.maxPrice;

    // Chuẩn hóa tiền tệ: Nếu AI trả về dạng rút gọn (ví dụ 20 thay vì 20.000.000)
    if (minPrice !== null && minPrice > 0 && minPrice < 1000) {
      minPrice = minPrice * 1_000_000;
    }
    if (maxPrice !== null && maxPrice > 0 && maxPrice < 1000) {
      maxPrice = maxPrice * 1_000_000;
    }

    // Bổ sung chuẩn hóa bằng parsePriceFilter từ câu nói thực tế
    const regexPrice = parsePriceFilter(clean);
    if (minPrice === null && regexPrice.minPrice !== null) minPrice = regexPrice.minPrice;
    if (maxPrice === null && regexPrice.maxPrice !== null) maxPrice = regexPrice.maxPrice;

    const hasPriceFilter = minPrice !== null || maxPrice !== null;
    const reasoningNote = intent.reasoningNote || '';

    const normCategory = (resolvedCategory || '').toLowerCase();
    const isPhoneQuery   = normCategory.includes('điện thoại') || normCategory.includes('phone') || /(điện thoại|dien thoai|smartphone|dế\b|dế gập|máy cỏ|iphone)/i.test(clean);
    const isLaptopQuery  = normCategory.includes('laptop') || /(laptop|macbook|máy tính xách tay)/i.test(clean);
    const isTabletQuery  = normCategory.includes('máy tính bảng') || normCategory.includes('tablet') || /(máy tính bảng|tablet|ipad|tab s)/i.test(clean);
    const isTvQuery      = normCategory.includes('tivi') || normCategory.includes('tv') || /(\btv\b|tivi|ti vi|smart tv|vô tuyến)/i.test(clean);
    const isFridgeQuery  = normCategory.includes('tủ lạnh') || /(tủ lạnh|tu lanh|tủ đông|tủ mát|side by side)/i.test(clean);
    const isWashingQuery = normCategory.includes('máy giặt') || normCategory.includes('giặt') || /(máy giặt|máy giặc|may giat|may giac|máy sấy|may say|giặt sấy)/i.test(clean);
    const isAcQuery      = normCategory.includes('điều hòa') || normCategory.includes('máy lạnh') || /(điều hòa|dieu hoa|máy lạnh|may lanh|1 ngựa|2 ngựa)/i.test(clean);
    const isAudioQuery   = normCategory.includes('âm thanh') || normCategory.includes('loa') || normCategory.includes('tai nghe') || /(loa\b|soundbar|tai nghe|headphone|earbuds|airpods|dàn âm thanh)/i.test(clean);
    const isWatchQuery   = normCategory.includes('đồng hồ') || normCategory.includes('watch') || /(đồng hồ|smartwatch|apple watch|galaxy watch)/i.test(clean);
    const isMouseQuery   = normCategory.includes('chuột') || /(chuột|chuot|mouse)/i.test(clean);
    const isKeyboardQuery = normCategory.includes('bàn phím') || /(bàn phím|ban phim|keyboard|phím cơ|phim co)/i.test(clean);
    const isPadQuery     = normCategory.includes('lót chuột') || /(lót chuột|lot chuot|mouse pad|pad chuột)/i.test(clean);

    // Nhận diện thương hiệu & loại trừ thương hiệu bị phủ định
    const { matchedBrands: directMatched, excludedBrands: directExcluded } = extractBrandsWithNegation(clean, allBrands);
    const negatedBrandsFromIntent = Array.isArray(intent.negatedBrands) ? intent.negatedBrands : [];

    const allExcludedNames = new Set([
      ...negatedBrandsFromIntent.map((b) => b.toLowerCase().trim()),
      ...directExcluded.map((b) => (b.name || '').toLowerCase().trim()),
    ]);

    const excludedBrands = allBrands.filter((b) => allExcludedNames.has((b.name || '').toLowerCase().trim()));
    const excludedBrandIds = excludedBrands.map((b) => b._id);

    let matchedBrands = [];
    if (resolvedBrand && !allExcludedNames.has(resolvedBrand.toLowerCase().trim())) {
      matchedBrands = allBrands.filter((b) => {
        const bName = (b.name || '').toLowerCase();
        return bName === resolvedBrand.toLowerCase() || bName.includes(resolvedBrand.toLowerCase()) || resolvedBrand.toLowerCase().includes(bName);
      });
    }

    if (matchedBrands.length === 0) {
      matchedBrands = directMatched.filter((b) => !allExcludedNames.has((b.name || '').toLowerCase().trim()));
    }

    // Từ khóa sạch: Lấy từ intent hoặc tự trích xuất qua extractCleanTokens
    let rawTokens = [];
    if (intent.searchKeywords && typeof intent.searchKeywords === 'string' && intent.searchKeywords.trim()) {
      rawTokens = intent.searchKeywords
        .toLowerCase()
        .replace(/[?!.,;:()\[\]"'/\\-]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= 2 && !VIETNAMESE_STOP_WORDS.has(w));
    }
    if (rawTokens.length === 0) {
      rawTokens = extractCleanTokens(clean, excludedBrands);
    }

    // CHỈ kế thừa preferredBrands từ profile nếu câu ngắn VÀ khách KHÔNG nhắc từ khóa sản phẩm cụ thể
    if (matchedBrands.length === 0 && profile.preferredBrands?.length > 0 && clean.split(/\s+/).length <= 2 && rawTokens.length === 0) {
      matchedBrands = allBrands.filter((b) => profile.preferredBrands.includes(b.name) && !allExcludedNames.has((b.name || '').toLowerCase().trim()));
    }
    const matchedBrandIds = matchedBrands.map((b) => b._id);

    // Nhận diện danh mục
    let matchedCategories = [];
    if (resolvedCategory) {
      matchedCategories = allCategories.filter((c) => {
        const cName = (c.name || '').toLowerCase();
        return cName === resolvedCategory.toLowerCase() || cName.includes(resolvedCategory.toLowerCase()) || resolvedCategory.toLowerCase().includes(cName);
      });
    }
    const matchedCategoryIds = matchedCategories.map((c) => c._id);

    const updatedProfile = { ...profile };
    // Nếu khách phủ định thương hiệu, xóa ngay khỏi preferredBrands để tránh lây nhiễm các lượt chat sau
    if (excludedBrands.length > 0 && updatedProfile.preferredBrands?.length > 0) {
      const excludedNames = new Set(excludedBrands.map((b) => (b.name || '').toLowerCase()));
      updatedProfile.preferredBrands = updatedProfile.preferredBrands.filter((b) => !excludedNames.has(b.toLowerCase()));
    }
    if (matchedBrands.length > 0) {
      updatedProfile.preferredBrands = matchedBrands.map((b) => b.name);
    }
    if (resolvedCategory) {
      updatedProfile.preferredCategories = [resolvedCategory];
      updatedProfile.lastTopic = resolvedCategory;
    }
    if (minPrice !== null) updatedProfile.budgetMin = minPrice;
    if (maxPrice !== null) updatedProfile.budgetMax = maxPrice;
    updatedProfile.inquiryCount = (updatedProfile.inquiryCount || 0) + 1;

    // 7. MULTI-STRATEGY RETRIEVAL
    // CHIẾN LƯỢC 1: Tìm kiếm trực tiếp theo từ khóa đích danh (Model / Tuyển thủ / Edition: Gumayusi, F75, Vanguard, S24...)
    let keywordProducts = [];
    if (rawTokens.length > 0) {
      const kwQueries = rawTokens.map((t) => {
        const reg = new RegExp(escapeRegex(t), 'i');
        return {
          $or: [
            { name: reg },
            { slug: reg },
            { keywords: reg },
            { productCode: reg },
            { sku: reg },
            { searchTokens: reg },
            { description: reg },
            { 'specifications.value': reg },
          ],
        };
      });

      const kwFilter = {
        isActive: true,
        status: 'published',
        ...(excludedBrandIds.length > 0 ? { brand: { $nin: excludedBrandIds } } : {}),
        $or: kwQueries,
      };

      keywordProducts = await Product.find(kwFilter)
        .select('name slug brand categories price salePrice stock status productCode specifications isFeatured isHot thumbnail images cachedPrice cachedSalePrice keywords')
        .populate('brand', 'name')
        .populate('categories', 'name')
        .limit(15)
        .lean();
    }

    // CHIẾN LƯỢC 2: Xây dựng câu truy vấn theo Danh mục & Thương hiệu có cấu trúc
    const queryAnd = [{ isActive: true }, { status: 'published' }];

    if (excludedBrandIds.length > 0) {
      queryAnd.push({ brand: { $nin: excludedBrandIds } });
    }

    if (matchedBrands.length > 0) {
      const brandRegexes = matchedBrands.map((b) => new RegExp(escapeRegex(b.name), 'i'));
      queryAnd.push({
        $or: [
          { brand: { $in: matchedBrandIds } },
          { name: { $in: brandRegexes } },
        ],
      });
    }

    const notTvRegex = /(màn hình gaming|màn hình máy tính|máy hút bụi|dyson|tủ lạnh|máy giặt|điều hòa|âm thanh|loa\b|điện thoại|phone|smartphone|laptop)/i;

    if (isPhoneQuery) {
      queryAnd.push({
        $and: [
          {
            $or: [
              { name: /(điện thoại|smartphone|iphone|z flip|z fold|s24|s23|s22|s21|redmi|xiaomi 14)/i },
              ...(matchedCategoryIds.length > 0 ? [{ categories: { $in: matchedCategoryIds } }] : []),
            ],
          },
          {
            name: {
              $not: /(đồng hồ|watch|smartwatch|tai nghe|headphone|earbuds|airpods|buds|\btab\b|galaxy tab|tab s|tablet|ipad|máy tính bảng|tivi|smart tv|tủ lạnh|máy giặt|điều hòa|soundbar|loa thanh|máy hút bụi|dyson)/i,
            },
          },
        ],
      });
    } else if (isLaptopQuery) {
      queryAnd.push({
        $and: [
          {
            $or: [
              { name: /(laptop|macbook|thinkpad|zenbook|vivobook|legion|ideapad|pavilion|spectre|gram)/i },
              ...(matchedCategoryIds.length > 0 ? [{ categories: { $in: matchedCategoryIds } }] : []),
            ],
          },
          { name: { $not: /(tivi|smart tv|tủ lạnh|máy giặt|điều hòa|loa\b|soundbar)/i } },
        ],
      });
    } else if (isTabletQuery) {
      queryAnd.push({
        $and: [
          {
            $or: [
              { name: /(máy tính bảng|tablet|ipad|galaxy tab|tab s)/i },
              ...(matchedCategoryIds.length > 0 ? [{ categories: { $in: matchedCategoryIds } }] : []),
            ],
          },
          { name: { $not: /(tivi|smart tv|tủ lạnh|máy giặt|điều hòa)/i } },
        ],
      });
    } else if (isTvQuery) {
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
              { name: /(máy giặt|máy giặc|may giat|may giac|máy sấy|may say)/i },
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
    } else if (isWatchQuery) {
      queryAnd.push({
        $and: [
          {
            $or: [
              { name: /(đồng hồ|smartwatch|apple watch|galaxy watch)/i },
              ...(matchedCategoryIds.length > 0 ? [{ categories: { $in: matchedCategoryIds } }] : []),
            ],
          },
          { name: { $not: /(tivi|smart tv|tủ lạnh|máy giặt|điều hòa)/i } },
        ],
      });
    } else if (isMouseQuery) {
      queryAnd.push({
        $and: [
          {
            $or: [
              { name: /(chuột|mouse)/i },
              ...(matchedCategoryIds.length > 0 ? [{ categories: { $in: matchedCategoryIds } }] : []),
            ],
          },
          { name: { $not: /(lót chuột|pad chuột|tivi|tủ lạnh|máy giặt|điều hòa)/i } },
        ],
      });
    } else if (isKeyboardQuery) {
      queryAnd.push({
        $and: [
          {
            $or: [
              { name: /(bàn phím|keyboard|phím cơ)/i },
              ...(matchedCategoryIds.length > 0 ? [{ categories: { $in: matchedCategoryIds } }] : []),
            ],
          },
          { name: { $not: /(tivi|tủ lạnh|máy giặt|điều hòa)/i } },
        ],
      });
    } else if (isPadQuery) {
      queryAnd.push({
        $and: [
          {
            $or: [
              { name: /(lót chuột|pad chuột|mouse pad)/i },
              ...(matchedCategoryIds.length > 0 ? [{ categories: { $in: matchedCategoryIds } }] : []),
            ],
          },
        ],
      });
    }

    let structuredProducts = [];
    const minConditions = excludedBrandIds.length > 0 ? 3 : 2;
    if (queryAnd.length > minConditions) {
      structuredProducts = await Product.find({ $and: queryAnd })
        .select('name slug brand categories price salePrice stock status productCode specifications isFeatured isHot thumbnail images cachedPrice cachedSalePrice keywords')
        .populate('brand', 'name')
        .populate('categories', 'name')
        .limit(15)
        .lean();
    }

    // Hợp nhất 2 chiến lược: Ưu tiên hàng đầu cho sản phẩm khớp chính xác từ khóa!
    const productMap = new Map();
    keywordProducts.forEach((p) => productMap.set(p._id.toString(), p));
    structuredProducts.forEach((p) => {
      if (!productMap.has(p._id.toString())) {
        productMap.set(p._id.toString(), p);
      }
    });

    let rawProducts = Array.from(productMap.values());

    // 7b. TỰ ĐỘNG TÌM KIẾM THEO TỪ KHÓA THÔNG MINH NẾU VẪN CHƯA CÓ SẢN PHẨM NÀO
    if (rawProducts.length === 0) {
      const smartTokens = extractCleanTokens(clean, excludedBrands);

      if (smartTokens.length > 0) {
        const tokenRegexes = smartTokens.map((t) => new RegExp(escapeRegex(t), 'i'));
        const orConditions = [];
        tokenRegexes.forEach((rgx) => {
          orConditions.push(
            { name: rgx },
            { slug: rgx },
            { keywords: rgx },
            { sku: rgx },
            { productCode: rgx },
            { searchTokens: rgx }
          );
        });

        rawProducts = await Product.find({
          isActive: true,
          status: 'published',
          ...(excludedBrandIds.length > 0 ? { brand: { $nin: excludedBrandIds } } : {}),
          $or: orConditions,
        })
          .select('name slug brand categories price salePrice stock status productCode specifications isFeatured isHot thumbnail images cachedPrice cachedSalePrice keywords')
          .populate('brand', 'name')
          .populate('categories', 'name')
          .limit(15)
          .lean();
      }
    }

    // Đưa sản phẩm đang xem vào danh sách nếu khách đang hỏi về trang đó hoặc cùng thương hiệu
    if (currentViewedProduct) {
      const alreadyHas = rawProducts.some((p) => p._id.toString() === currentViewedProduct._id.toString());
      if (!alreadyHas) {
        const prodBrandId = (currentViewedProduct.brand?._id || currentViewedProduct.brand)?.toString();
        const brandMatch = !matchedBrands.length || matchedBrands.some((b) => b._id.toString() === prodBrandId);
        const askingThis = /(này|sản phẩm này|máy này|con này|điện thoại này|xem chi tiết|đây là gì|còn hàng không)/i.test(clean);
        if (brandMatch || askingThis) {
          rawProducts.unshift(currentViewedProduct);
        }
      }
    }

    // 8. Nếu không tìm thấy sản phẩm khớp chính xác thương hiệu / yêu cầu
    const topicName = isPhoneQuery ? 'Điện thoại' :
      (isLaptopQuery ? 'Laptop' :
      (isTabletQuery ? 'Máy tính bảng' :
      (isTvQuery ? 'Tivi' :
      (isFridgeQuery ? 'Tủ lạnh' :
      (isWashingQuery ? 'Máy giặt' :
      (isAcQuery ? 'Điều hòa' :
      (isMouseQuery ? 'Chuột máy tính' :
      (isKeyboardQuery ? 'Bàn phím cơ' :
      (isPadQuery ? 'Lót chuột' :
      (isAudioQuery ? 'Thiết bị âm thanh' :
      (isWatchQuery ? 'Đồng hồ thông minh' : 'sản phẩm')))))))))));

    if (rawProducts.length === 0) {
      const requestedBrandName = matchedBrands[0]?.name || '';

      let notFoundMessage = requestedBrandName
        ? `(KHO HÀNG CỦA SHOP HIỆN CHƯA CÓ sản phẩm ${topicName} của thương hiệu ${requestedBrandName}. Hãy giải thích lịch sự rằng dòng ${topicName} ${requestedBrandName} bên em tạm thời chưa về hàng hoặc đã hết hàng. TUYỆT ĐỐI KHÔNG tự ý bịa đặt hay nêu các sản phẩm/hãng khác khi không có trong dữ liệu.)`
        : `(Kho hàng của shop hiện chưa có sản phẩm khớp với tiêu chí tìm kiếm này. Hãy lịch sự thông báo và hỏi khách cần tìm dòng sản phẩm nào khác để em hỗ trợ tư vấn. TUYỆT ĐỐI KHÔNG tự bịa ra bất kỳ sản phẩm nào ngoài kho hàng.)`;

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
    const keywordProductIds = new Set(keywordProducts.map((p) => p._id.toString()));

    if (isPhoneQuery) {
      candidatePool = candidatePool.filter((p) => {
        if (keywordProductIds.has(p._id.toString())) return true;
        const n = (p.name || '').toLowerCase();
        if (/(đồng hồ|watch|smartwatch|tai nghe|headphone|earbuds|airpods|buds|\btab\b|galaxy tab|tab s|tablet|ipad|máy tính bảng|tivi|smart tv|tủ lạnh|máy giặt|điều hòa|loa thanh|soundbar|máy hút bụi|dyson)/i.test(n)) return false;
        return /(điện thoại|smartphone|iphone|z flip|z fold|s24|s23|s22|s21|redmi|xiaomi 14)/i.test(n) ||
          p.categories?.some((c) => /(điện thoại|smartphone|phone|mobile)/i.test(c.name || ''));
      });
    } else if (isLaptopQuery) {
      candidatePool = candidatePool.filter((p) => {
        if (keywordProductIds.has(p._id.toString())) return true;
        const n = (p.name || '').toLowerCase();
        if (/(tivi|smart tv|tủ lạnh|máy giặt|điều hòa|loa\b|soundbar)/i.test(n)) return false;
        return /(laptop|macbook|thinkpad|zenbook|vivobook|legion|ideapad|pavilion|spectre|gram)/i.test(n) ||
          p.categories?.some((c) => /laptop|máy tính/i.test(c.name || ''));
      });
    } else if (isTabletQuery) {
      candidatePool = candidatePool.filter((p) => {
        if (keywordProductIds.has(p._id.toString())) return true;
        const n = (p.name || '').toLowerCase();
        if (/(tivi|smart tv|tủ lạnh|máy giặt|điều hòa)/i.test(n)) return false;
        return /(máy tính bảng|tablet|ipad|galaxy tab|tab s)/i.test(n) ||
          p.categories?.some((c) => /tablet|máy tính bảng/i.test(c.name || ''));
      });
    } else if (isTvQuery) {
      candidatePool = candidatePool.filter((p) => {
        if (keywordProductIds.has(p._id.toString())) return true;
        const n = (p.name || '').toLowerCase();
        if (notTvRegex.test(n)) return false;
        return /(\btv\b|tivi|ti vi|smart tv|qled|oled|4k tv|tivi led|google tivi|android tivi)/i.test(n) ||
          p.categories?.some((c) => /tivi|tv|smart tv/i.test(c.name || ''));
      });
    } else if (isFridgeQuery) {
      candidatePool = candidatePool.filter((p) => {
        if (keywordProductIds.has(p._id.toString())) return true;
        const n = (p.name || '').toLowerCase();
        if (n.includes('tivi') || n.includes('tv') || n.includes('máy giặt') || n.includes('máy sấy') || n.includes('máy lạnh') || n.includes('tablet')) return false;
        return /(tủ lạnh|tủ đông|tủ mát|side by side)/i.test(n) || p.categories?.some((c) => /tủ lạnh|tu lanh/i.test(c.name || ''));
      });
    } else if (isWashingQuery) {
      candidatePool = candidatePool.filter((p) => {
        if (keywordProductIds.has(p._id.toString())) return true;
        const n = (p.name || '').toLowerCase();
        if (n.includes('tivi') || n.includes('tv') || n.includes('tủ lạnh') || n.includes('máy lạnh')) return false;
        return /(máy giặt|máy giặc|máy sấy)/i.test(n) || p.categories?.some((c) => /máy giặt|may giat|giặt|sấy/i.test(c.name || ''));
      });
    } else if (isAudioQuery) {
      candidatePool = candidatePool.filter((p) => {
        if (keywordProductIds.has(p._id.toString())) return true;
        const n = (p.name || '').toLowerCase();
        if (n.includes('tủ lạnh') || n.includes('máy giặt') || n.includes('máy lạnh')) return false;
        return /(loa|soundbar|tai nghe|âm thanh)/i.test(n) || p.categories?.some((c) => /loa|âm thanh/i.test(c.name || ''));
      });
    } else if (isWatchQuery) {
      candidatePool = candidatePool.filter((p) => {
        if (keywordProductIds.has(p._id.toString())) return true;
        const n = (p.name || '').toLowerCase();
        return /(đồng hồ|smartwatch|apple watch|galaxy watch)/i.test(n) || p.categories?.some((c) => /(đồng hồ|smartwatch)/i.test(c.name || ''));
      });
    }

    // Lọc bỏ triệt để sản phẩm thuộc thương hiệu bị phủ định
    if (excludedBrandIds.length > 0 || excludedBrands.length > 0) {
      candidatePool = candidatePool.filter((p) => {
        const pBrandId = (p.brand?._id || p.brand)?.toString();
        const pBrandName = (p.brand?.name || p.brand || '').toString().toLowerCase().trim();
        const pName = (p.name || '').toLowerCase();
        const isExcluded = excludedBrandIds.some((id) => id.toString() === pBrandId) ||
          excludedBrands.some((b) => {
            const bName = (b.name || '').toLowerCase().trim();
            return bName && (pBrandName.includes(bName) || pName.includes(bName));
          });
        return !isExcluded;
      });
    }

    // CHỈ lọc theo thương hiệu khi khách đích danh yêu cầu brand VÀ không có sản phẩm khớp từ khóa đích danh từ hãng khác
    if (matchedBrands.length > 0 && keywordProducts.length === 0) {
      const brandMatched = candidatePool.filter((p) => {
        const pBrand = (p.brand?.name || p.brand || '').toString().toLowerCase();
        const pName = (p.name || '').toLowerCase();
        return matchedBrands.some((b) => {
          const bName = (b.name || '').toLowerCase();
          return pBrand.includes(bName) || pName.includes(bName);
        });
      });

      if (brandMatched.length > 0) {
        candidatePool = brandMatched;
      }
    }

    const queryContextForScore = {
      clean,
      rawTokens,
      isPhoneQuery,
      isLaptopQuery,
      isTabletQuery,
      isTvQuery,
      isFridgeQuery,
      isWashingQuery,
      isAcQuery,
      isAudioQuery,
      isWatchQuery,
      isMouseQuery,
      isKeyboardQuery,
      isPadQuery,
      matchedBrands,
      excludedBrands,
    };

    // Sắp xếp toàn bộ candidatePool theo độ tương thích thực tế cao nhất
    candidatePool.sort((a, b) => {
      const scoreB = scoreProductRelevance(b, queryContextForScore);
      const scoreA = scoreProductRelevance(a, queryContextForScore);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return (b.stock > 0 ? 1 : 0) - (a.stock > 0 ? 1 : 0);
    });

    // Nếu khách đang ở trang một sản phẩm cụ thể, đưa sản phẩm đó vào đầu candidatePool
    if (currentViewedProduct) {
      const alreadyInPool = candidatePool.some((p) => p._id.toString() === currentViewedProduct._id.toString());
      if (!alreadyInPool) {
        const processedCurrent = processedProducts.find((p) => p._id.toString() === currentViewedProduct._id.toString());
        if (processedCurrent) {
          candidatePool.unshift(processedCurrent);
        }
      }
    }

    if (candidatePool.length === 0) {
      const requestedBrandName = matchedBrands[0]?.name || '';
      const searchKW = rawTokens.join(' ');

      let notFoundMessage = '';
      if (searchKW) {
        notFoundMessage = `(KHO HÀNG CỦA SHOP HIỆN CHƯA CÓ sản phẩm khớp với từ khóa "${searchKW}". Hãy giải thích lịch sự rằng dòng sản phẩm này bên em tạm thời chưa về hàng hoặc đã hết hàng. Lịch sự hỏi xem anh/chị có muốn tham khảo các mẫu ${topicName} đang có sẵn khác trong cửa hàng không. TUYỆT ĐỐI KHÔNG tự bịa ra sản phẩm ngoài kho hàng.)`;
      } else if (requestedBrandName) {
        notFoundMessage = `(KHO HÀNG CỦA SHOP HIỆN CHƯA CÓ sản phẩm ${topicName} của thương hiệu ${requestedBrandName}. Hãy giải thích lịch sự rằng dòng ${topicName} ${requestedBrandName} bên em tạm thời chưa về hàng hoặc đã hết hàng. Lịch sự hỏi xem anh/chị có muốn tham khảo các mẫu ${topicName} đang có sẵn từ các thương hiệu khác trong cửa hàng không. TUYỆT ĐỐI KHÔNG tự ý hiển thị thẻ sản phẩm hay thông số của hãng khác khi khách chưa đồng ý.)`;
      } else {
        notFoundMessage = `(Kho hàng của shop hiện chưa có sản phẩm khớp với tiêu chí tìm kiếm này. Hãy lịch sự thông báo và hỏi khách cần tìm sản phẩm nào khác để em hỗ trợ tư vấn.)`;
      }

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
        inRange.sort((a, b) => {
          const scoreB = scoreProductRelevance(b, queryContextForScore);
          const scoreA = scoreProductRelevance(a, queryContextForScore);
          if (scoreB !== scoreA) return scoreB - scoreA;
          return (b.stock > 0 ? 1 : 0) - (a.stock > 0 ? 1 : 0);
        });
        matchedProducts = inRange;
        priceNoteForPrompt = `(KHO HÀNG CÓ ${inRange.length} SẢN PHẨM PHÙ HỢP CÓ GIÁ BÁN THỰC TẾ ĐÚNG TRONG TẦM GIÁ ${priceRangeLabel}. HÃY TƯ VẤN CÁC SẢN PHẨM NÀY, NÊU RÕ GIÁ BÁN THỰC TẾ VÀ CÁC LỰA CHỌN PHIÊN BẢN KÈM THEO.)`;
      } else {
        // Tìm các sản phẩm khác trong cửa hàng có giá thực sự thỏa mãn ngân sách khách yêu cầu
        const alternativeInRange = processedProducts.filter((p) => {
          const pPrice = p.effectivePrice;
          return pPrice > 0 && (minPrice === null || pPrice >= minPrice) && (maxPrice === null || pPrice <= maxPrice);
        });

        if (alternativeInRange.length > 0) {
          matchedProducts = alternativeInRange;
          priceNoteForPrompt = `(LƯU Ý: Kho của shop hiện chưa có dòng sản phẩm khách vừa hỏi ở tầm giá ${priceRangeLabel} (mẫu giá thấp nhất hiện có là ${candidatePool[0]?.name || ''} - ${candidatePool[0]?.effectivePrice?.toLocaleString('vi-VN')}đ). Tuy nhiên shop CÓ CÁC SẢN PHẨM GIA DỤNG/CÔNG NGHỆ KHÁC THỎA MÃN TẦM GIÁ ${priceRangeLabel}. Hãy giải thích rõ ràng và gợi ý các mẫu này.)`;
        } else {
          matchedProducts = [];
          priceNoteForPrompt = `(LƯU Ý: Hiện tại toàn bộ kho của shop chưa có sản phẩm nào có giá đúng trong khoảng ${priceRangeLabel}. Hãy giải thích lịch sự và gợi ý các mẫu đang có sẵn gần với tầm giá đó nhất.)`;
        }
      }
    } else {
      matchedProducts = candidatePool;
    }

    const lines = [];

    if (reasoningNote) {
      lines.push('=== SUY LUẬN Ý ĐỊNH & NGỮ NGHĨA TỰ NHIÊN (AGENTIC REASONING) ===');
      lines.push(`- Ý định & Tiếng lóng nhận diện: "${reasoningNote}"`);
      lines.push('=> Khách hàng dùng ngôn ngữ tự nhiên/tiếng lóng đời thường. Hãy phản hồi thật tự nhiên, duyên dáng, thân thiện, tư vấn đúng sản phẩm và tầm giá khách mong muốn mà không bắt bẻ câu chữ.\n');
    }

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

    if (currentViewedProduct) {
      lines.push(`\n[SẢN PHẨM KHÁCH HÀNG ĐANG MỞ XEM TRỰC TIẾP TRÊN TRANG WEB]:`);
      lines.push(`- Tên: "${currentViewedProduct.name}"`);
      lines.push(`- Tình trạng kho: ${currentViewedProduct.stock > 0 ? `Còn hàng (${currentViewedProduct.stock} sản phẩm sẵn sàng giao)` : 'Tạm hết hàng'}`);
      lines.push(`- Giá niêm yết: ${(currentViewedProduct.price || 0).toLocaleString('vi-VN')}đ | Giá bán: ${(currentViewedProduct.salePrice || currentViewedProduct.price || 0).toLocaleString('vi-VN')}đ`);
      lines.push(`=> Khách hàng đang đứng tại trang chi tiết sản phẩm này. Nếu câu hỏi liên quan hoặc khách hỏi "máy này", "sản phẩm này", hãy tư vấn chính xác và nhiệt tình!\n`);
    }

    const displayProducts = (matchedProducts.length > 0 ? matchedProducts : candidatePool)
      .filter((p) => scoreProductRelevance(p, queryContextForScore) >= 0)
      .slice(0, 5);

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

    // ĐỒNG BỘ TUYỆT ĐỐI: Thẻ sản phẩm gửi lên UI (Product Card) phải trùng khớp 100% với danh sách displayProducts mà AI đang tư vấn
    const finalProductsForUI = (displayProducts.length > 0 ? displayProducts : (matchedProducts.length > 0 ? matchedProducts : candidatePool))
      .filter((p) => scoreProductRelevance(p, queryContextForScore) >= 0)
      .slice(0, 3);

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
2. TUYỆT ĐỐI CẤM TỰ BỊA ĐẶT SẢN PHẨM (ZERO HALLUCINATION):
   - Chỉ được tư vấn và giới thiệu các sản phẩm CÓ TÊN, CÓ GIÁ xuất hiện trong mục "DỮ LIỆU KHO HÀNG THỰC TẾ" bên dưới.
   - TUYỆT ĐỐI KHÔNG TỰ BỊA RA bất kỳ dòng sản phẩm, thương hiệu hoặc mức giá nào ngoài danh sách kho hàng (CẤM nhắc đến các hãng như AKKO, Razer DeathAdder, Logitech M331 nếu chúng không có trong DỮ LIỆU KHO HÀNG THỰC TẾ).
   - Nếu trong mục DỮ LIỆU KHO HÀNG thông báo không có sản phẩm phù hợp hoặc chưa về hàng, hãy giải thích lịch sự, ngắn gọn rằng sản phẩm đó bên em hiện tạm thời chưa về hàng hoặc đã hết hàng. Lịch sự hỏi khách xem có muốn tham khảo các dòng sản phẩm khác không. Tuyệt đối không tự bịa ra thông số hoặc giá bán của hãng ngoài.
3. Tốc độ & Độ súc tích: Đi thẳng vào sản phẩm phù hợp nhất với yêu cầu của khách. Nêu rõ tên sản phẩm, giá bán thực tế và các phiên bản kích thước/màu sắc đang sẵn hàng. Trả lời súc tích trong 2-3 đoạn ngắn, không viết dông dài.
4. Định dạng: Dùng gạch đầu dòng (-) rõ ràng, dễ nhìn. Tuyệt đối KHÔNG dùng bảng biểu Markdown (|...|), KHÔNG dùng emoji.
5. Thấu hiểu tiếng lóng & ngôn ngữ tự nhiên: Khách có thể dùng từ ngữ đời thường, tiếng lóng Việt Nam (như "củ khoai", "cành", "chai" chỉ triệu đồng; "lít", "xị" chỉ trăm nghìn; "dế", "dế gập" chỉ điện thoại; "máy cỏ" chỉ máy phím bấm; "1 ngựa" chỉ điều hòa 1 HP...). Hãy trò chuyện một cách cởi mở, tự nhiên, chuẩn xác theo đúng ý của khách mà không bao giờ bắt bẻ từ ngữ.
6. Khi khách hỏi tìm sản phẩm liên quan đến một cái tên, bộ sưu tập, phiên bản giới hạn hoặc tuyển thủ (ví dụ: Gumayusi): Hãy nhiệt tình giới thiệu TẤT CẢ các sản phẩm thuộc bộ sưu tập/tuyển thủ đó đang có trong danh sách kho hàng bên dưới (ví dụ cả bàn phím cơ, lót chuột, chuột không dây...) kèm mức giá bán thực tế của từng món.

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

  // Gemini API yêu cầu lịch sử bắt buộc phải kết thúc bằng model trước khi gọi sendMessage()
  if (result.length > 0 && result[result.length - 1].role === 'user') {
    result.pop();
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
const chatStream = async ({ sessionId, message, userId = null, currentProductSlug = null, currentUrl = null }, res) => {
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
      { history, profile, sessionId: sid, userId, currentProductSlug, currentUrl }
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

    // 4. Fallback sang Gemini nếu Groq chưa thành công (Ưu tiên model hoạt động trực tiếp không delay 404)
    if (!streamedSuccess) {
      const genAI = getGeminiClient();
      if (genAI) {
        const orderedModels = [
          _workingGeminiModel,
          ...GEMINI_MODELS.filter((m) => m !== _workingGeminiModel),
        ];

        for (const geminiModel of orderedModels) {
          try {
            const geminiHistory = cleanHistoryForGemini(history);
            const model = genAI.getGenerativeModel({
              model: geminiModel,
              systemInstruction: systemPrompt,
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 600,
              },
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

            if (fullText.trim()) {
              _workingGeminiModel = geminiModel;
              streamedSuccess = true;
              break;
            }
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
const chat = async ({ sessionId, message, userId = null, currentProductSlug = null, currentUrl = null }) => {
  const sid = sessionId || require('crypto').randomUUID();
  const { messages: history, profile } = await getSessionData(sid, userId);

  const { text: dbDataContext, products: matchedProducts, updatedProfile } = await fetchProductContext(
    message,
    { history, profile, sessionId: sid, userId, currentProductSlug, currentUrl }
  );
  const systemPrompt = buildSystemPrompt(dbDataContext);

  let reply = '';

  const genAI = getGeminiClient();
  if (genAI) {
    const orderedModels = [
      _workingGeminiModel,
      ...GEMINI_MODELS.filter((m) => m !== _workingGeminiModel),
    ];
    for (const geminiModel of orderedModels) {
      try {
        const geminiHistory = cleanHistoryForGemini(history);
        const model = genAI.getGenerativeModel({
          model: geminiModel,
          systemInstruction: systemPrompt,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 600,
          },
        });

        const chatSession = model.startChat({ history: geminiHistory });
        const result = await chatSession.sendMessage(message);
        const response = await result.response;
        reply = removeEmojis(response.text() || '');
        if (reply) {
          _workingGeminiModel = geminiModel;
          break;
        }
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
