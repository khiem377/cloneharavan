const { GoogleGenerativeAI } = require('@google/generative-ai');
const sharp = require('sharp');
const crypto = require('crypto');

const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const Category = require('../models/category.model');
const Brand = require('../models/brand.model');
const { getSellingPrice } = require('../utils/pricing.helper');

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

// Cache danh mục & thương hiệu từ DB (5 phút) để nạp ngữ cảnh vào AI Vision
let _catalogCache = null;
let _catalogCacheTime = 0;
const getDynamicCatalogContext = async () => {
  const now = Date.now();
  if (_catalogCache && now - _catalogCacheTime < 5 * 60 * 1000) {
    return _catalogCache;
  }
  try {
    const [categories, brands] = await Promise.all([
      Category.find({ isActive: { $ne: false } }).select('name slug').lean(),
      Brand.find({ isActive: { $ne: false } }).select('name slug').lean(),
    ]);
    _catalogCache = {
      categoryNames: categories.map((c) => c.name).filter(Boolean),
      brandNames: brands.map((b) => b.name).filter(Boolean),
    };
    _catalogCacheTime = now;
  } catch (err) {
    console.error('Failed to load dynamic catalog context for visual search:', err);
    _catalogCache = { categoryNames: [], brandNames: [] };
  }
  return _catalogCache;
};

const buildDynamicPrompt = (catalogContext) => {
  const categoriesList = catalogContext.categoryNames.slice(0, 35).join(', ');
  const brandsList = catalogContext.brandNames.slice(0, 35).join(', ');

  return `Bạn là trợ lý AI phân tích và tìm kiếm sản phẩm thương mại điện tử qua hình ảnh.
Hãy quan sát kỹ và nhận diện ảnh này một cách trung thực, linh hoạt theo đúng những gì xuất hiện trong ảnh:

1. Đọc và nhận diện TOÀN BỘ chữ, logo, nhãn hiệu hoặc ký hiệu xuất hiện trong ảnh (detectedText). Ví dụ: OAK, Sony, Apple, mã số...
2. Xác định loại vật thể/sản phẩm thực tế trong ảnh (productType): Đừng ép buộc, hãy gọi đúng tên vật thể (ví dụ: Loa, Bàn phím, Đồng hồ, Tivi, Giày, Áo thun, Tai nghe, Điện thoại, Logo thương hiệu...).
3. So khớp với Danh mục sản phẩm hiện có trong cơ sở dữ liệu cửa hàng:
   [${categoriesList}]
   - Nếu sản phẩm thuộc hoặc gần nhất với danh mục nào ở trên, hãy điền vào "category".
   - Nếu vật thể/ảnh không thuộc danh mục nào trong danh sách trên, hãy điền tên loại sản phẩm thực tế vào "category" hoặc để rỗng.
4. So khớp với Thương hiệu có trong cửa hàng:
   [${brandsList}]
   - Nếu logo/chữ trong ảnh trùng hoặc tương tự, điền vào "brand". Nếu có thương hiệu riêng (như OAK, v.v.), điền tên thương hiệu đó.
5. Trích xuất 3-4 từ khóa tìm kiếm tiếng Việt ("searchKeywords") sát nhất với ảnh để truy vấn sản phẩm tương đồng.

Trả về DUY NHẤT một chuỗi JSON chuẩn (không dùng markdown codeblock, không thêm text):
{
  "productType": "loại sản phẩm thực tế trong ảnh",
  "category": "danh mục phù hợp hoặc rỗng",
  "brand": "thương hiệu nhận diện được hoặc rỗng",
  "model": "mã model nếu đọc được hoặc rỗng",
  "color": "màu sắc chủ đạo",
  "detectedText": "tất cả chữ/logo đọc được trong ảnh",
  "searchKeywords": ["từ khóa 1", "từ khóa 2", "từ khóa 3"]
}`;
};

// Resize xuống 480px — tốc độ xử lý sharp siêu nhanh, giảm kích thước payload gửi lên AI
const compressImageForAI = async (buffer) => {
  return sharp(buffer)
    .resize({ width: 480, height: 480, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 65 })
    .toBuffer();
};

const analyzeImageWithGemini = async (buffer) => {
  const hash = crypto.createHash('md5').update(buffer).digest('hex');
  const cached = getCached(hash);
  if (cached) return cached;

  const genAI = getGeminiClient();
  if (!genAI) throw new Error('GEMINI_API_KEY not configured');

  const [catalogContext, compressed] = await Promise.all([
    getDynamicCatalogContext(),
    compressImageForAI(buffer),
  ]);

  const prompt = buildDynamicPrompt(catalogContext);
  // Các model Flash chuẩn 2026 theo khuyến nghị chính thức từ Google Generative AI API
  const candidateModels = [
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-flash-lite-latest',
  ];

  let lastError = null;
  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
          maxOutputTokens: 250,
        },
      });

      // Giới hạn timeout 4.5s cho mỗi model, tránh treo request
      const timeoutMs = 4500;
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout sau ${timeoutMs}ms trên model ${modelName}`)), timeoutMs)
      );

      const result = await Promise.race([
        model.generateContent([
          prompt,
          { inlineData: { data: compressed.toString('base64'), mimeType: 'image/jpeg' } },
        ]),
        timeoutPromise,
      ]);

      const responseText = result.response.text();
      const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      setCache(hash, parsed);
      return parsed;
    } catch (err) {
      lastError = err;
      console.warn(`Visual search with model ${modelName} failed, trying fallback:`, err.message);
    }
  }

  // Graceful fallback nếu toàn bộ AI model đều timeout hoặc lỗi mạng — tuyệt đối không để treo request người dùng
  console.warn('All Gemini vision models failed, using graceful fallback:', lastError?.message);
  return {
    productType: 'Sản phẩm',
    category: '',
    brand: '',
    model: '',
    color: '',
    detectedText: '',
    searchKeywords: ['phụ kiện', 'công nghệ'],
  };
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
      ? getSellingPrice(defaultVariant)
      : getSellingPrice(product);

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

  const detectedInfo = {
    productType: metadata.productType || metadata.category || '',
    category: category || '',
    brand: brand || '',
    model: model || '',
    color: metadata.color || '',
    screenSize: screenSize || '',
    detectedText: detectedText || '',
    searchKeywords: searchKeywords || [],
  };

  return {
    detected: detectedInfo,
    metadata: detectedInfo,
    totalFound: results.length,
    products: results.slice(0, effectiveLimit),
  };
};


module.exports = {
  searchByImage,
  extractProductMetadataFromImage,
};
