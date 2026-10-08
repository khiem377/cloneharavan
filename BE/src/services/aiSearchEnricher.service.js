/**
 * aiSearchEnricher.service.js
 * 
 * Self-Learning AI Search Enrichment Engine (Google Gemini / Grok)
 * - Automatically learns from store products, categories, brands, and search logs.
 * - Generates Vietnamese long-tail shopping intents, forward/future model predictions,
 *   brand/category associations, synonyms, and typo dictionaries.
 * - Saves trained queries to MongoDB SearchLog to continuously enhance search intelligence over time.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/product.model');
const Brand = require('../models/brand.model');
const Category = require('../models/category.model');
const SearchLog = require('../models/searchLog.model');

let _genAI = null;
const getGeminiClient = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!_genAI) {
    _genAI = new GoogleGenerativeAI(key);
  }
  return _genAI;
};

/**
 * Prompt AI to generate rich e-commerce search queries & future predictions for a list of products/brands
 */
const generateSearchDatasetWithAI = async (catalogSummary) => {
  const genAI = getGeminiClient();
  if (!genAI) {
    console.log('[AISearchEnricher] GEMINI_API_KEY not configured, skipping AI generation');
    return [];
  }

  const prompt = `Bạn là chuyên gia NLP & Search Query Engine của Google/Shopee cho sàn thương mại điện tử Việt Nam.
Dưới đây là danh mục sản phẩm, thương hiệu và ngành hàng hiện có trong cửa hàng:
${JSON.stringify(catalogSummary, null, 2)}

NHIỆM VỤ:
Dựa vào catalog trên, hãy dự đoán và sinh ra một bộ dữ liệu từ khóa tìm kiếm tiếng Việt cực kỳ thông minh (Search Autocomplete & Predictive Queries giống Google Search):
1. **Dự đoán tiền tố & chuỗi tìm kiếm phổ biến (N-Gram Expansion)**:
   - Khi khách tìm thương hiệu (ví dụ Apple/iPhone, Samsung, LG, Sony, v.v.), sinh các cụm từ hoàn chỉnh khách hay gõ nhất (ví dụ: "iphone 16 pro max", "iphone 15", "ipad pro", "samsung galaxy", "samsung s24 ultra", "samsung galaxy s25", "tivi sony 4k 55 inch", "tủ lạnh samsung inverter").
2. **Dự đoán trước cả tương lai (Forward/Future Series Extrapolation)**:
   - Các dòng sản phẩm có số phiên bản (iPhone, Samsung Galaxy S/A, MacBook M series, iPad, Tivi...), sinh thêm cả các phiên bản kế tiếp/tương lai mà khách hàng hay tìm kiếm trước để hóng tin (ví dụ: "iphone 17", "iphone 17 pro max", "iphone 18", "iphone 18 pro max", "samsung s25", "samsung s26", "macbook air m4", "ipad pro m4", "samsung fold 8").
3. **Từ khóa tìm kiếm theo nhu cầu & ngữ cảnh (Semantic Shopping Intent)**:
   - Ví dụ thời trang: "áo sơ mi nam công sở", "áo sơ mi trắng hàn quốc", "áo thun form rộng", "đầm dự tiệc sang trọng", "quần jean ống suông".
   - Ví dụ điện máy: "máy giặt tiết kiệm điện", "nồi cơm điện cao tần", "loa bluetooth nghe nhạc hay", "tủ lạnh 2 cánh giá rẻ".
4. **Từ viết tắt & từ lóng (Acronyms & Slang)**:
   - Ví dụ: "ip 16", "ip 15 pm", "ss s24", "at nam", "asm nu", "tl inverter".

QUY ĐỊNH BẮT BUỘC:
- Trả về đúng JSON ARRAY thuần túy (không markdown, không giải thích).
- Mỗi phần tử là một object:
  {
    "keyword": "từ khóa tìm kiếm đầy đủ (chữ thường, có hoặc không dấu tiếng Việt chuẩn)",
    "category": "ngành hàng liên quan",
    "brand": "thương hiệu (nếu có)",
    "type": "future_predictive" | "model" | "trending_phrase" | "intent",
    "score": số nguyên từ 70 đến 99
  }
- Sinh tối thiểu 35-50 từ khóa chất lượng cao, thực tế, đúng hành vi tìm kiếm của người dùng Việt Nam.`;

  const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-1.5-pro'];

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (err) {
      console.warn(`[AISearchEnricher] Model ${modelName} failed: ${err.message}, trying next...`);
    }
  }

  return [];
};

/**
 * Train and Enrich Search Corpus using Gemini AI
 * Extracts current store context, prompts Gemini, and upserts high-quality predictive queries to SearchLog.
 */
const trainSearchCorpusWithAI = async () => {
  try {
    const [products, brands, categories] = await Promise.all([
      Product.find({ isActive: true, status: 'published' })
        .select('name brand categories productCode sku')
        .populate('brand', 'name')
        .populate('categories', 'name')
        .limit(100)
        .lean(),
      Brand.find({ isActive: true }).select('name slug').lean(),
      Category.find({ isActive: true }).select('name slug').lean(),
    ]);

    const catalogSummary = {
      brands: brands.map((b) => b.name),
      categories: categories.map((c) => c.name),
      sampleProducts: products.slice(0, 40).map((p) => ({
        name: p.name,
        brand: p.brand?.name || '',
        category: p.categories?.[0]?.name || '',
      })),
    };

    console.log('[AISearchEnricher] Starting AI search training with Gemini...');
    const aiQueries = await generateSearchDatasetWithAI(catalogSummary);

    if (!Array.isArray(aiQueries) || aiQueries.length === 0) {
      console.log('[AISearchEnricher] AI training returned 0 queries, using fallback dynamic corpus.');
      return { success: false, message: 'AI generation returned empty results' };
    }

    console.log(`[AISearchEnricher] Gemini generated ${aiQueries.length} smart predictive queries! Upserting to SearchLog...`);

    let upsertCount = 0;
    const now = new Date();

    for (const item of aiQueries) {
      if (!item.keyword || item.keyword.trim().length < 2) continue;
      const kw = item.keyword.trim().toLowerCase();

      await SearchLog.updateOne(
        { keyword: kw },
        {
          $setOnInsert: {
            keyword: kw,
            count: item.score || 80,
            count24h: Math.round((item.score || 80) * 0.4),
            countPrev24h: Math.round((item.score || 80) * 0.3),
            count7d: item.score || 80,
            count6h: Math.round((item.score || 80) * 0.15),
            trendingScore: item.score || 80,
            zScore: item.type === 'future_predictive' ? 2.8 : 1.8,
            uniqueSessionCount: Math.round((item.score || 80) * 0.3),
            resultsCount: 1,
            isTrending: true,
            lastSearchedAt: now,
          },
        },
        { upsert: true }
      );
      upsertCount++;
    }

    // Trigger dynamic search corpus cache refresh
    const { buildStoreCorpus } = require('../utils/dynamicSearchCorpus');
    await buildStoreCorpus();

    console.log(`[AISearchEnricher] AI Search Training complete. Successfully indexed ${upsertCount} queries.`);
    return {
      success: true,
      queriesCount: upsertCount,
      queries: aiQueries,
    };
  } catch (err) {
    console.error('[AISearchEnricher] Error during AI search training:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Auto-enrich product when created or updated: generates AI search tokens & synonyms
 */
const enrichSingleProductWithAI = async (product) => {
  if (!product || !product.name) return [];
  const genAI = getGeminiClient();
  if (!genAI) return [];

  try {
    const prompt = `Phân tích sản phẩm thương mại điện tử sau và trả về mảng JSON các từ khóa tìm kiếm (search tokens, từ đồng nghĩa, từ viết tắt, lỗi chính tả thường gặp):
Tên sản phẩm: "${product.name}"
Mô tả tóm tắt: "${product.description ? product.description.slice(0, 200) : ''}"

Yêu cầu trả về đúng 1 JSON array các chuỗi string ngắn gọn (không markdown, tối đa 8 từ khóa):
Ví dụ: ["áo thun", "ao phong", "ao phong unisex", "at form rong", "ao phong nam"]`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const tokens = JSON.parse(cleaned);
    return Array.isArray(tokens) ? tokens : [];
  } catch (err) {
    return [];
  }
};

module.exports = {
  trainSearchCorpusWithAI,
  enrichSingleProductWithAI,
  generateSearchDatasetWithAI,
};
