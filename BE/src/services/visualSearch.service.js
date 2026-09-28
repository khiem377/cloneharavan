const { GoogleGenerativeAI } = require('@google/generative-ai');
const sharp = require('sharp');
const crypto = require('crypto');

const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const Category = require('../models/category.model');
const Brand = require('../models/brand.model');

let _genAI = null;
const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!_genAI) _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return _genAI;
};

// Cache kết quả AI theo MD5 của ảnh — TTL 1 giờ
const _aiCache = new Map();
const AI_CACHE_TTL = 60 * 60 * 1000;
const getCached = (hash) => {
  const entry = _aiCache.get(hash);
  if (!entry) return null;
  if (Date.now() - entry.ts > AI_CACHE_TTL) { _aiCache.delete(hash); return null; }
  return entry.data;
};
const setCache = (hash, data) => _aiCache.set(hash, { data, ts: Date.now() });

// Prompt ngắn gọn → AI trả lời nhanh hơn
const PROMPT_INSTRUCTION = `Nhận diện sản phẩm điện máy trong ảnh, trả về JSON (không markdown):
{"category":"Tivi/Tủ lạnh/Máy giặt/Máy lạnh/Loa/Nồi/Quạt/Lò vi sóng/Máy lọc không khí/...","brand":"Samsung/Sony/LG/... hoặc rỗng","model":"mã model nếu đọc được hoặc rỗng","color":"màu sắc","screenSize":"55 inch/300 lít/... hoặc rỗng","detectedText":"chữ/logo đọc được","searchKeywords":["3-4 từ khóa tiếng Việt"]}`;

// Resize xuống 600px — đủ để AI nhận diện, giảm payload
const compressImageForAI = async (buffer) => {
  return sharp(buffer)
    .resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 70 })
    .toBuffer();
};

const analyzeImageWithGemini = async (buffer) => {
  const hash = crypto.createHash('md5').update(buffer).digest('hex');
  const cached = getCached(hash);
  if (cached) return cached;

  const genAI = getGeminiClient();
  if (!genAI) throw new Error('GEMINI_API_KEY not configured');

  const compressed = await compressImageForAI(buffer);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
  const result = await model.generateContent([
    PROMPT_INSTRUCTION,
    { inlineData: { data: compressed.toString('base64'), mimeType: 'image/jpeg' } },
  ]);

  const responseText = result.response.text();
  const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  setCache(hash, parsed);
  return parsed;
};

const extractProductMetadataFromImage = async (buffer, mimeType) => {
  try {
    return await analyzeImageWithGemini(buffer);
  } catch (err) {
    throw new Error(`AI Vision analysis failed: ${err.message}`);
  }

};

const searchByImage = async (buffer, mimeType, options = {}) => {
  const limit = Math.min(parseInt(options.limit, 10) || 12, 30);
  const metadata = await extractProductMetadataFromImage(buffer, mimeType);

  const { category, brand, model, screenSize, detectedText, searchKeywords } = metadata;

  let matchedBrandId = null;
  if (brand && brand.trim()) {
    const brandDoc = await Brand.findOne({
      name: { $regex: new RegExp(`^${brand.trim()}$`, 'i') },
      isActive: true,
    }).select('_id name slug');
    if (brandDoc) matchedBrandId = brandDoc._id;
  }

  let matchedCategoryIds = [];
  if (category && category.trim()) {
    const categoryDocs = await Category.find({
      name: { $regex: new RegExp(category.trim(), 'i') },
    }).select('_id name slug');
    matchedCategoryIds = categoryDocs.map((c) => c._id);
  }


  // Tách các token có nghĩa từ model + detectedText (loại bỏ từ quá ngắn/phổ biến)
  const extractModelTokens = (str) => {
    if (!str || !str.trim()) return [];
    return str.trim().split(/[\s,/|]+/).filter((t) => t.length >= 3);
  };
  const modelTokens = extractModelTokens(model);
  const detectedTokens = extractModelTokens(detectedText);
  // Ưu tiên các token trông giống mã model (có số + chữ hỗn hợp)
  const codelikeTokens = [...modelTokens, ...detectedTokens].filter((t) =>
    /[A-Z0-9]{3,}/i.test(t)
  );

  const queryOrConditions = [];
  const hasCategoryDetected = matchedCategoryIds.length > 0;

  if (hasCategoryDetected) {
    queryOrConditions.push({ categories: { $in: matchedCategoryIds } });
  } else if (matchedBrandId) {
    queryOrConditions.push({ brand: matchedBrandId });
  }

  // Thêm model code / detectedText vào query để tìm đúng sản phẩm
  codelikeTokens.slice(0, 4).forEach((token) => {
    queryOrConditions.push({ name: { $regex: new RegExp(token, 'i') } });
    queryOrConditions.push({ slug: { $regex: new RegExp(token, 'i') } });
  });

  // Fallback: keyword search khi không có gì cả
  if (!hasCategoryDetected && !matchedBrandId && codelikeTokens.length === 0) {
    const searchTerms = [];
    if (model && model.trim()) searchTerms.push(model.trim());
    if (screenSize && screenSize.trim()) searchTerms.push(screenSize.trim());
    if (Array.isArray(searchKeywords)) searchTerms.push(...searchKeywords.slice(0, 3));
    searchTerms.forEach((term) => {
      if (term && term.length >= 2) {
        queryOrConditions.push({ name: { $regex: new RegExp(term, 'i') } });
      }
    });

  }

  const filterQuery = {
    status: 'published',
    ...(queryOrConditions.length > 0 ? { $or: queryOrConditions } : {}),
  };

  const products = await Product.find(filterQuery)
    .populate('brand', 'name slug logo')
    .populate('categories', 'name slug')
    .limit(limit * 2)
    .lean();

  const productIds = products.map((p) => p._id);
  const variants = await ProductVariant.find({
    productId: { $in: productIds },
    isActive: true,
  }).lean();

  const variantMap = new Map();
  variants.forEach((v) => {
    const pId = v.productId.toString();
    if (!variantMap.has(pId)) variantMap.set(pId, []);
    variantMap.get(pId).push(v);
  });

  const matchedCategoryIdStrs = matchedCategoryIds.map((m) => m.toString());
  const hasSpecificInfo = !!(matchedBrandId || (model && model.trim()) || (screenSize && screenSize.trim()));

  const scoredProducts = products.map((product) => {
    let score = 30;
    const pBrandId = product.brand?._id?.toString();
    const pCategoryIds = (product.categories || []).map((c) => c._id.toString());
    const productNameLower = (product.name || '').toLowerCase();

    const categoryMatched =
      matchedCategoryIdStrs.length > 0 &&
      pCategoryIds.some((id) => matchedCategoryIdStrs.includes(id));

    if (categoryMatched) {
      score += 40;
    } else if (hasCategoryDetected) {
      score -= 30;
    }

    if (matchedBrandId && pBrandId === matchedBrandId.toString()) {
      score += 25;
    }

    // Model code / detectedText: boost cực mạnh nếu tên sản phẩm chứa mã model
    let modelCodeHits = 0;
    codelikeTokens.forEach((token) => {
      if (productNameLower.includes(token.toLowerCase()) ||
          (product.slug || '').includes(token.toLowerCase())) {
        modelCodeHits++;
      }
    });
    if (modelCodeHits > 0) {
      score += Math.min(modelCodeHits * 30, 60); // mỗi token khớp +30, tối đa +60
    }

    if (model && model.trim()) {
      if (productNameLower.includes(model.toLowerCase())) score += 15;
    }

    if (screenSize && screenSize.trim()) {
      if (productNameLower.includes(screenSize.toLowerCase())) score += 10;
    }

    // Keyword scoring
    let keywordScore = 0;
    if (Array.isArray(searchKeywords) && searchKeywords.length > 0) {
      searchKeywords.forEach((kw) => {
        const kwLower = kw.toLowerCase().trim();
        if (!kwLower) return;
        if (productNameLower.includes(kwLower)) {
          keywordScore += 6;
        } else {
          kwLower.split(/\s+/).forEach((word) => {
            if (word.length >= 3 && productNameLower.includes(word)) keywordScore += 2;
          });
        }
      });
      score += Math.min(keywordScore, 18);
    }

    const pVariants = variantMap.get(product._id.toString()) || [];
    const defaultVariant = pVariants.find((v) => v.isDefault) || pVariants[0] || null;
    const finalPrice = defaultVariant
      ? (defaultVariant.salePrice || defaultVariant.price)
      : (product.salePrice || product.price || 0);

    return {
      _id: product._id,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      categories: product.categories,
      thumbnail: product.thumbnail || defaultVariant?.images?.[0] || null,
      price: finalPrice,
      originalPrice: defaultVariant?.price || product.price || 0,
      variantsCount: pVariants.length,
      matchScore: Math.min(Math.max(score, 0), 99),
      _keywordScore: keywordScore,
    };
  });

  // Lọc theo ngưỡng tối thiểu
  const minScore = hasSpecificInfo ? 50 : 65;
  const filtered = scoredProducts.filter((p) => p.matchScore >= minScore);

  // Sort: score desc → keyword desc → variantsCount desc (phổ biến hơn lên trước)
  filtered.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    if (b._keywordScore !== a._keywordScore) return b._keywordScore - a._keywordScore;
    return b.variantsCount - a.variantsCount;
  });

  // Xoá field nội bộ trước khi trả về
  const results = filtered.map(({ _keywordScore, ...p }) => p);

  // Nếu không detect brand/model → limit chặt hơn (6 thay vì 12)
  const effectiveLimit = hasSpecificInfo ? limit : Math.min(limit, 6);

  return {
    detected: {
      category: category || '',
      brand: brand || '',
      model: model || '',
      color: metadata.color || '',
      screenSize: screenSize || '',
      detectedText: detectedText || '',
      searchKeywords: searchKeywords || [],
    },
    totalFound: results.length,
    products: results.slice(0, effectiveLimit),
  };
};


module.exports = {
  searchByImage,
  extractProductMetadataFromImage,
};
