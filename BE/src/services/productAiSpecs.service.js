const axios = require('axios');
const cheerio = require('cheerio');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const GroqLib = require('groq-sdk');
const Groq = GroqLib.default ?? GroqLib;
const AppError = require('../utils/AppError');

/**
 * productAiSpecs.service.js
 *
 * Tự động tìm kiếm & trích xuất kích thước, khối lượng và thông số kỹ thuật sản phẩm
 * phục vụ tính cước vận chuyển chuẩn Pancake POS / GHN / GHTK / ViettelPost.
 *
 * Kiến trúc dự phòng 2 tầng (Dual-Fallback / High-Availability):
 * - Tầng Tìm kiếm:  1. Ưu tiên SearXNG (Bing/Yahoo/DuckDuckGo) -> 2. Fallback Google Custom Search API
 * - Tầng Đọc trang: 1. Ưu tiên Jina Reader (r.jina.ai)        -> 2. Fallback Axios + Cheerio
 * - Tầng AI:        1. Ưu tiên Ollama (VPS / Local)           -> 2. Fallback Google Gemini Flash -> 3. Fallback Groq
 */

// Danh sách domain rác / mạng xã hội không chứa bảng thông số kỹ thuật chuẩn
const BLOCKED_DOMAINS = [
  'youtube.com',
  'youtu.be',
  'facebook.com',
  'fb.com',
  'tiktok.com',
  'instagram.com',
  'pinterest.com',
  'twitter.com',
  'x.com',
  'reddit.com',
  'wikipedia.org',
];

/**
 * 1. TẦNG TÌM KIẾM
 */

/**
 * Tìm kiếm qua SearXNG (Mã nguồn mở, cấu hình ưu tiên Bing, DuckDuckGo, Yahoo để tránh bị Google chặn IP)
 */
const searchWithSearxng = async (query) => {
  const searxngUrl = (process.env.SEARXNG_URL || 'http://localhost:8080').replace(/\/+$/, '');
  const url = `${searxngUrl}/search`;

  console.log(`[ProductAiSpecs] Đang tìm kiếm qua SearXNG: "${query}" tại ${url}`);
  const response = await axios.get(url, {
    params: {
      q: query,
      format: 'json',
      engines: 'bing,duckduckgo,yahoo',
      language: 'vi-VN',
    },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
    timeout: 7000,
  });

  const results = response.data?.results || [];
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error('SearXNG không trả về kết quả nào');
  }

  // Lọc lấy URL hợp lệ đầu tiên
  const valid = results.find((r) => {
    if (!r.url || typeof r.url !== 'string') return false;
    const lower = r.url.toLowerCase();
    if (BLOCKED_DOMAINS.some((d) => lower.includes(d))) return false;
    if (lower.endsWith('.pdf') || lower.endsWith('.jpg') || lower.endsWith('.png')) return false;
    return true;
  });

  if (!valid?.url) {
    throw new Error('Không tìm thấy liên kết phù hợp từ SearXNG');
  }

  return {
    url: valid.url,
    title: valid.title || '',
    engine: 'SearXNG (Bing/Yahoo/DDG)',
  };
};

/**
 * Tìm kiếm trực tiếp qua Bing Web (Zero-Config: Chạy độc lập không cần Docker hay API Key)
 */
const searchWithBingDirect = async (query) => {
  console.log(`[ProductAiSpecs] Đang tìm kiếm trực tiếp qua Bing Web: "${query}"`);
  const response = await axios.get('https://www.bing.com/search', {
    params: { q: query },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
    },
    timeout: 7000,
  });

  const $ = cheerio.load(response.data);
  const candidates = [];

  $('li.b_algo').each((i, el) => {
    const title = $(el).find('h2 a').text().trim();
    const href = $(el).find('h2 a').attr('href');
    let finalUrl = href;
    if (href && href.includes('/ck/a?!') && href.includes('&u=')) {
      try {
        const uParam = href.split('&u=')[1].split('&')[0];
        const b64 = uParam.startsWith('a1') || uParam.startsWith('a0') ? uParam.slice(2) : uParam;
        const decoded = Buffer.from(b64, 'base64').toString('utf-8');
        if (decoded.startsWith('http')) finalUrl = decoded;
      } catch (e) {}
    }

    if (finalUrl && finalUrl.startsWith('http')) {
      const lower = finalUrl.toLowerCase();
      if (!BLOCKED_DOMAINS.some((d) => lower.includes(d))) {
        const isDetail = lower.includes('/products/') || lower.includes('/product/') || lower.includes('/chi-tiet') || lower.endsWith('.html');
        candidates.push({ url: finalUrl, title, isDetail });
      }
    }
  });

  if (candidates.length === 0) {
    throw new Error('Bing Web Search không tìm thấy liên kết phù hợp');
  }

  // Ưu tiên link trang chi tiết sản phẩm
  candidates.sort((a, b) => (b.isDetail ? 1 : 0) - (a.isDetail ? 1 : 0));

  return {
    url: candidates[0].url,
    title: candidates[0].title,
    engine: 'Bing Web Search (Direct Zero-Config)',
    allCandidates: candidates.map((c) => c.url),
  };
};

/**
 * Tìm kiếm qua Google Custom Search JSON API (Fallback chính thức khi SearXNG lỗi)
 */
const searchWithGoogleCse = async (query) => {
  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;

  if (!apiKey || !cx) {
    throw new Error('Chưa cấu hình GOOGLE_CSE_API_KEY hoặc GOOGLE_CSE_ID trong .env');
  }

  console.log(`[ProductAiSpecs] Kích hoạt Fallback sang Google Custom Search API: "${query}"`);
  const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
    params: {
      key: apiKey,
      cx: cx,
      q: query,
      num: 5,
      lr: 'lang_vi',
    },
    timeout: 8000,
  });

  const items = response.data?.items || [];
  const valid = items.find((item) => {
    if (!item.link) return false;
    const lower = item.link.toLowerCase();
    return !BLOCKED_DOMAINS.some((d) => lower.includes(d));
  });

  if (!valid?.link) {
    throw new Error('Google Custom Search không tìm thấy link thông số phù hợp');
  }

  return {
    url: valid.link,
    title: valid.title || '',
    engine: 'Google Custom Search API',
  };
};

/**
 * 2. TẦNG ĐỌC NỘI DUNG TRANG WEB
 */

/**
 * Đọc nội dung qua Jina Reader (chuyển URL thành Markdown sạch sẽ) kèm fallback Cheerio
 */
const fetchPageMarkdown = async (targetUrl) => {
  console.log(`[ProductAiSpecs] Đang đọc nội dung trang qua Jina Reader: ${targetUrl}`);
  try {
    const res = await axios.get(`https://r.jina.ai/${targetUrl}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'text/markdown, text/plain',
      },
    });

    if (res.data && typeof res.data === 'string' && res.data.length > 100) {
      return {
        content: res.data.slice(0, 12000), // Lấy tối đa 12.000 ký tự đầu tiên
        method: 'Jina Reader (r.jina.ai)',
      };
    }
  } catch (jinaErr) {
    console.warn(`[ProductAiSpecs] Jina Reader thất bại (${jinaErr.message}), chuyển sang Cheerio scraper...`);
  }

  // Fallback: Tự cào trực tiếp bằng Cheerio
  try {
    const res = await axios.get(targetUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const $ = cheerio.load(res.data);
    // Xóa thẻ rác
    $('script, style, noscript, nav, footer, header, svg, iframe, form, button').remove();

    // Lấy nội dung text của body
    let rawText = $('body').text().replace(/\s+/g, ' ').trim();
    if (rawText.length > 12000) {
      rawText = rawText.slice(0, 12000);
    }

    return {
      content: rawText,
      method: 'Direct Scraper (Cheerio)',
    };
  } catch (scrapErr) {
    throw new AppError(`Không thể đọc nội dung trang web: ${scrapErr.message}`, 502);
  }
};

/**
 * 3. TẦNG TRÍCH XUẤT AI (Ollama -> Gemini -> Groq)
 */

const SYSTEM_PROMPT = `Bạn là một AI chuyên gia Logistics & E-Commerce Việt Nam (chuẩn Pancake POS, GHN, GHTK, ViettelPost).
Nhiệm vụ của bạn là đọc nội dung thông tin sản phẩm và trích xuất CHÍNH XÁC hai bộ thông số riêng biệt:

1. BỘ THÔNG SỐ SẢN PHẨM TRẦN (Dùng để hiển thị thông số kỹ thuật cho khách hàng xem trên website):
   - "productWeight": Khối lượng của bản thân sản phẩm trần (chưa tính vỏ hộp/bao bì) tính bằng GRAM (1kg = 1000g, 1lb = 453.6g).
   - "productDimensions": Kích thước thật của sản phẩm { "length": ..., "width": ..., "height": ... } tính bằng CENTIMET (cm).
     (Ví dụ: Áo hoodie dài 72cm x rộng 55cm; Điện thoại 16.0 x 7.5 x 0.8 cm; Chuột máy tính 12.5 x 6.8 x 4.0 cm).

2. BỘ THÔNG SỐ ĐÓNG GÓI KIỆN HÀNG (Dùng ĐỘC QUYỀN cho Backend tính cước bưu điện GHN/GHTK, KHÔNG hiển thị cho khách xem):
   - "packageWeight": Khối lượng cả kiện hàng sau khi đóng gói/gấp túi ni-lông tính bằng GRAM.
   - "packageDimensions": Kích thước kiện hàng { "length": ..., "width": ..., "height": ... } tính bằng CENTIMET (cm).
   - "shippingDataStatus": Trạng thái dữ liệu vận chuyển ("verified" nếu nguồn web hãng ghi rõ kích thước hộp/đóng gói; "estimated" nếu AI tự quy đổi theo quy chuẩn bao bì đóng gói; "missing" nếu không tìm thấy dữ liệu).

⚠️ QUY TẮC ĐẶC BIỆT THEO NGÀNH HÀNG (BẮT BUỘC TUÂN THỦ ĐỂ TRÁNH BỊ PHẠT CƯỚC BƯU ĐIỆN):
A. NGÀNH HÀNG THỜI TRANG (Áo thun, sơ mi, hoodie, áo khoác, quần jean, váy, đồ lót, phụ kiện vải):
   - productDimensions là số đo áo/quần trần (VD: dài áo 70-80cm, rộng ngực 50-60cm).
   - NHƯNG packageDimensions BẮT BUỘC là kích thước sau khi GẤP GỌN BỎ VÀO TÚI NI-LÔNG NIÊM PHONG / TÚI ZIP BƯU ĐIỆN:
     * Áo thun / sơ mi / đồ mỏng: packageDimensions là { "length": 25, "width": 18, "height": 2.5 }, packageWeight ~ 200 - 250g.
     * Quần jean / quần dài / chân váy: packageDimensions là { "length": 28, "width": 20, "height": 4.0 }, packageWeight ~ 500 - 650g.
     * Áo hoodie / áo khoác dày: packageDimensions là { "length": 32, "width": 24, "height": 6.0 }, packageWeight ~ 650 - 850g.
     * TUYỆT ĐỐI KHÔNG ĐƯỢC lấy chiều dài áo (70-80cm) làm packageDimensions vì GHN sẽ phạt cước hàng cồng kềnh (từ 25k nhảy lên 80k)!
     * shippingDataStatus: "estimated".

B. NGÀNH ĐIỆN MÁY / CÔNG NGHỆ / GIA DỤNG (Điện thoại, tai nghe, chuột, bàn phím, nồi chiên, máy xay):
   - Nếu nguồn có thông số nguyên hộp (Package size / Gross weight): lấy chính xác và đặt shippingDataStatus = "verified".
   - Nếu nguồn chỉ có kích thước máy trần: packageDimensions = thân máy + 2 đến 4cm mỗi chiều (xốp chống sốc) và packageWeight = thân máy + 100 đến 250g vỏ hộp carton. shippingDataStatus = "estimated".

C. CÁC THÔNG TIN KHÁC:
3. "specifications": Mảng các thông số kỹ thuật cốt lõi (tối đa 8 thông số quan trọng):
   [ { "group": "Thông số kỹ thuật", "key": "Tên thông số", "value": "Giá trị" } ]
4. "description": Một bài viết mô tả sản phẩm hấp dẫn chuẩn SEO HTML sạch (dùng <h3>, <p>, <ul>, <li>, <strong>; tuyệt đối KHÔNG bọc thẻ <html>, <body> hay markdown \`\`\`).
5. "suggestedOptions": Mảng phân loại biến thể [ { "name": "Màu sắc", "values": ["Trắng", "Đen"] } ]. Nếu không có biến thể thì để [].
6. "marketPrice": Giá bán tham khảo trên thị trường tính bằng VNĐ (số nguyên, ví dụ: 1250000; nếu không tìm thấy để 0).
7. "modelCode": Mã hiệu sản phẩm / model của nhà sản xuất (ví dụ: "VT9-PRO", "HD9252").
8. "confidence": "high" | "medium" | "low".
9. "notes": Ghi chú ngắn gọn về nguồn và cách quy đổi đóng gói.

QUY TẮC BẮT BUỘC:
- Trả về DUY NHẤT một JSON Object hợp lệ (không kèm markdown \`\`\`json).
- Cấu trúc JSON bắt buộc:
{
  "productWeight": 120,
  "productDimensions": { "length": 12.5, "width": 6.8, "height": 4.0 },
  "packageWeight": 250,
  "packageDimensions": { "length": 16.0, "width": 11.0, "height": 6.5 },
  "shippingDataStatus": "verified",
  "specifications": [
    { "group": "Thông số chung", "key": "Chất liệu", "value": "Nhựa ABS" }
  ],
  "description": "<h3>Đặc điểm nổi bật</h3><p>Thiết kế công thái học hiện đại...</p>",
  "suggestedOptions": [
    { "name": "Màu sắc", "values": ["Đen", "Trắng"] }
  ],
  "marketPrice": 1250000,
  "modelCode": "VT9-PRO",
  "confidence": "high",
  "notes": "Đã trích xuất kích thước nguyên hộp từ website chính thức."
}`;

/**
 * Trích xuất qua Ollama (Chạy trên VPS hoặc Localhost)
 */
const extractWithOllama = async (content, productName, brand) => {
  const ollamaBaseUrl = (process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/+$/, '');
  const model = process.env.OLLAMA_MODEL || 'qwen2.5:7b';
  const timeoutMs = Number(process.env.OLLAMA_TIMEOUT_MS) || 18000;

  console.log(`[ProductAiSpecs] Đang gọi Ollama model "${model}" tại ${ollamaBaseUrl} (Timeout: ${timeoutMs}ms)...`);

  const userMessage = `SẢN PHẨM CẦN TRÍCH XUẤT: "${productName}" (Thương hiệu: "${brand || 'Không rõ'}").\n\nNỘI DUNG TRANG WEB:\n${content}`;

  const response = await axios.post(
    `${ollamaBaseUrl}/api/chat`,
    {
      model: model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      format: 'json',
      stream: false,
      options: {
        temperature: 0.1,
      },
    },
    {
      timeout: timeoutMs,
      headers: { 'Content-Type': 'application/json' },
    }
  );

  const rawJson = response.data?.message?.content;
  if (!rawJson) {
    throw new Error('Ollama không trả về nội dung text');
  }

  const parsed = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
  return {
    ...parsed,
    aiModel: `Ollama (${model})`,
  };
};

/**
 * Fallback 1: Trích xuất qua Google Gemini Flash
 */
let _genAI = null;
const getGeminiClient = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'your_gemini_api_key' || key.trim() === '') return null;
  if (!_genAI) {
    _genAI = new GoogleGenerativeAI(key);
  }
  return _genAI;
};

const extractWithGemini = async (content, productName, brand) => {
  const genAI = getGeminiClient();
  if (!genAI) {
    throw new Error('Chưa cấu hình GEMINI_API_KEY');
  }

  console.log('[ProductAiSpecs] Kích hoạt Fallback sang Google Gemini Flash...');
  const candidateModels = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-1.5-flash'];
  let lastErr = null;

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const prompt = `${SYSTEM_PROMPT}\n\nSẢN PHẨM: "${productName}" (Thương hiệu: "${brand || 'Không rõ'}").\n\nNỘI DUNG TRANG WEB:\n${content}`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);

      return {
        ...parsed,
        aiModel: `Google Gemini (${modelName})`,
      };
    } catch (err) {
      lastErr = err;
      console.warn(`[ProductAiSpecs] Gemini ${modelName} thất bại, thử model tiếp theo...`);
    }
  }

  throw lastErr || new Error('Tất cả các model Gemini đều thất bại');
};

/**
 * Fallback 2: Trích xuất qua Groq AI
 */
let _groq = null;
const getGroqClient = () => {
  const key = process.env.GROQ_API_KEY;
  if (!key || key === 'your_groq_api_key' || key.trim() === '') return null;
  if (!_groq || _groq.apiKey !== key) {
    _groq = new Groq({ apiKey: key });
  }
  return _groq;
};

const extractWithGroq = async (content, productName, brand) => {
  const groq = getGroqClient();
  if (!groq) {
    throw new Error('Chưa cấu hình GROQ_API_KEY');
  }

  const candidateModels = [
    'qwen/qwen3.8-27b',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
  ];

  let lastErr = null;
  for (const model of candidateModels) {
    try {
      console.log(`[ProductAiSpecs] Đang gọi Groq model "${model}"...`);
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `SẢN PHẨM: "${productName}" (Thương hiệu: "${brand || 'Không rõ'}").\n\nNỘI DUNG:\n${content}` },
        ],
        model: model,
        temperature: 0.1,
        response_format: { type: 'json_object' },
      });

      const rawJson = chatCompletion.choices?.[0]?.message?.content;
      const parsed = JSON.parse(rawJson);
      return {
        ...parsed,
        aiModel: `Groq (${model})`,
      };
    } catch (err) {
      lastErr = err;
      console.warn(`[ProductAiSpecs] Groq ${model} thất bại (${err.message}), thử model tiếp theo...`);
    }
  }

  throw lastErr || new Error('Tất cả các model Groq đều thất bại');
};

/**
 * Chuẩn hóa số liệu logistics để đảm bảo luôn hợp lệ với GHN/GHTK/ViettelPost
 */
const sanitizeLogisticsData = (raw) => {
  // 1. Trọng lượng & Kích thước sản phẩm trần (cho khách xem)
  let productWeight = Number(raw.productWeight) || Number(raw.weight) || 0;
  let pLength = Number(raw.productDimensions?.length) || Number(raw.dimensions?.length) || 0;
  let pWidth = Number(raw.productDimensions?.width) || Number(raw.dimensions?.width) || 0;
  let pHeight = Number(raw.productDimensions?.height) || Number(raw.dimensions?.height) || 0;

  productWeight = Math.max(0, Math.round(productWeight));
  pLength = Math.max(0, Math.round(pLength * 10) / 10);
  pWidth = Math.max(0, Math.round(pWidth * 10) / 10);
  pHeight = Math.max(0, Math.round(pHeight * 10) / 10);

  // 2. Trọng lượng & Kích thước kiện hàng đóng gói (tính cước GHN)
  let packageWeight = Number(raw.packageWeight) || Number(raw.weight) || productWeight;
  let pkgLength = Number(raw.packageDimensions?.length) || Number(raw.dimensions?.length) || pLength;
  let pkgWidth = Number(raw.packageDimensions?.width) || Number(raw.dimensions?.width) || pWidth;
  let pkgHeight = Number(raw.packageDimensions?.height) || Number(raw.dimensions?.height) || pHeight;

  packageWeight = Math.max(0, Math.round(packageWeight));
  pkgLength = Math.max(0, Math.round(pkgLength * 10) / 10);
  pkgWidth = Math.max(0, Math.round(pkgWidth * 10) / 10);
  pkgHeight = Math.max(0, Math.round(pkgHeight * 10) / 10);

  // Fallback an toàn cho kiện hàng nếu thiếu
  if (pkgLength === 0 && pLength > 0) pkgLength = pLength;
  if (pkgWidth === 0 && pWidth > 0) pkgWidth = pWidth;
  if (pkgHeight === 0 && pHeight > 0) pkgHeight = pHeight;
  if (packageWeight === 0 && productWeight > 0) packageWeight = productWeight;

  // Trạng thái dữ liệu vận chuyển
  const validStatus = ['verified', 'estimated', 'missing'];
  const shippingDataStatus = validStatus.includes(raw.shippingDataStatus)
    ? raw.shippingDataStatus
    : (packageWeight > 0 ? 'estimated' : 'missing');

  // Chuẩn hóa danh sách specifications
  const specs = Array.isArray(raw.specifications)
    ? raw.specifications
        .filter((s) => s && s.key && s.value)
        .map((s) => ({
          group: s.group || 'Thông số chung',
          key: String(s.key).trim(),
          value: String(s.value).trim(),
        }))
    : [];

  // Chuẩn hóa mô tả sản phẩm HTML
  let description = typeof raw.description === 'string' ? raw.description.trim() : '';
  // Lọc sạch nếu AI vô tình bọc markdown ```html
  if (description.startsWith('```html')) {
    description = description.replace(/^```html\s*/i, '').replace(/\s*```$/, '');
  } else if (description.startsWith('```')) {
    description = description.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  // Chuẩn hóa danh sách phân loại biến thể đề xuất (suggestedOptions)
  const suggestedOptions = Array.isArray(raw.suggestedOptions)
    ? raw.suggestedOptions
        .filter((opt) => opt && typeof opt.name === 'string' && opt.name.trim() && Array.isArray(opt.values) && opt.values.length > 0)
        .map((opt) => ({
          name: opt.name.trim(),
          values: opt.values
            .map((v) => (typeof v === 'string' ? v.trim() : String(v).trim()))
            .filter(Boolean),
        }))
        .filter((opt) => opt.values.length > 0)
    : [];

  // Chuẩn hóa giá bán tham khảo thị trường
  const marketPrice = Math.max(0, Math.round(Number(raw.marketPrice) || 0));

  // Chuẩn hóa mã hiệu model nhà sản xuất
  const modelCode = typeof raw.modelCode === 'string' ? raw.modelCode.trim() : '';

  return {
    // Tương thích ngược: weight & dimensions trỏ về kiện hàng đóng gói
    weight: packageWeight,
    dimensions: { length: pkgLength, width: pkgWidth, height: pkgHeight },

    // Phân tách 2 bộ số liệu
    productWeight,
    productDimensions: { length: pLength, width: pWidth, height: pHeight },
    packageWeight,
    packageDimensions: { length: pkgLength, width: pkgWidth, height: pkgHeight },
    shippingDataStatus,

    specifications: specs,
    description,
    suggestedOptions,
    marketPrice,
    modelCode,
    confidence: raw.confidence || 'medium',
    notes: raw.notes || '',
    aiModel: raw.aiModel || 'Unknown',
  };
};

/**
 * 4. HÀM ĐIỀU PHỐI CHÍNH (PIPELINE ORCHESTRATOR)
 */
const extractProductSpecs = async ({ productName, brand, modelCode, productUrl }) => {
  const pName = (productName || '').trim();
  const pBrand = (brand || '').trim();
  const pModel = (modelCode || '').trim();
  const directUrl = (productUrl || '').trim();

  if (!pName && !directUrl) {
    throw new AppError('Vui lòng cung cấp Tên sản phẩm hoặc Đường dẫn (URL) sản phẩm', 400);
  }

  let targetUrl = directUrl;
  let searchEngineUsed = 'Direct URL (Không qua tìm kiếm)';

  // Bước 1: Tìm kiếm liên kết sản phẩm nếu chưa có URL trực tiếp
  if (!targetUrl) {
    const queryParts = [pName];
    if (pBrand && !pName.toLowerCase().includes(pBrand.toLowerCase())) {
      queryParts.push(pBrand);
    }
    if (pModel) {
      queryParts.push(pModel);
    }
    queryParts.push('thông số kỹ thuật kích thước trọng lượng');
    const searchQuery = queryParts.join(' ');

    // Thử SearXNG trước (nếu người dùng có host)
    try {
      const searchRes = await searchWithSearxng(searchQuery);
      targetUrl = searchRes.url;
      searchEngineUsed = searchRes.engine;
    } catch (searxErr) {
      console.warn(`[ProductAiSpecs] SearXNG không khả dụng (${searxErr.message}), chuyển sang Bing Web Search tự động...`);

      // Tự động chuyển sang Bing Web Search trực tiếp (Không cần cài Docker)
      try {
        const bingRes = await searchWithBingDirect(searchQuery);
        targetUrl = bingRes.url;
        searchEngineUsed = bingRes.engine;
      } catch (bingErr) {
        console.warn(`[ProductAiSpecs] Bing Web Search thất bại (${bingErr.message}), chuyển sang Google CSE...`);

        // Thử Google CSE nếu có cấu hình
        try {
          const cseRes = await searchWithGoogleCse(searchQuery);
          targetUrl = cseRes.url;
          searchEngineUsed = cseRes.engine;
        } catch (cseErr) {
          console.warn(`[ProductAiSpecs] Không tìm thấy URL ngoài web, kích hoạt AI Knowledge Engine...`);
        }
      }
    }
  }

  // Bước 2: Đọc nội dung trang web (Jina Reader -> Cheerio) hoặc dùng AI Knowledge nếu không có URL
  let pageContent = '';
  let readerMethod = 'AI Knowledge Engine (Tự tổng hợp từ tri thức sản phẩm)';

  if (targetUrl) {
    try {
      const pageRes = await fetchPageMarkdown(targetUrl);
      pageContent = pageRes.content;
      readerMethod = pageRes.method;
    } catch (readErr) {
      console.warn(`[ProductAiSpecs] Lỗi đọc trang ${targetUrl} (${readErr.message}), chuyển sang AI Knowledge Engine...`);
      pageContent = `Sản phẩm "${pName}". Không thể tải nội dung trang web ${targetUrl}. Hãy sử dụng cơ sở tri thức kỹ thuật của bạn để trích xuất hoặc ước tính chính xác thông số.`;
    }
  } else {
    searchEngineUsed = 'AI Knowledge Engine (Không cần link tìm kiếm)';
    pageContent = `Sản phẩm "${pName}" (Thương hiệu: "${pBrand || 'Chưa rõ'}"). Hãy sử dụng cơ sở tri thức kỹ thuật e-commerce phong phú của bạn về thiết bị này để cung cấp đầy đủ thông số kích thước, khối lượng, thông số kỹ thuật và bài viết mô tả.`;
  }

  // Bước 3: Trích xuất AI (Ollama -> Gemini -> Groq)
  let aiResult = null;
  let aiErrors = [];

  // 3.1. Thử Ollama trước
  try {
    aiResult = await extractWithOllama(pageContent, pName, pBrand);
  } catch (ollamaErr) {
    console.warn(`[ProductAiSpecs] Ollama thất bại hoặc timeout (${ollamaErr.message}), chuyển sang Fallback Gemini...`);
    aiErrors.push(`Ollama: ${ollamaErr.message}`);

    // 3.2. Fallback sang Google Gemini
    try {
      aiResult = await extractWithGemini(pageContent, pName, pBrand);
    } catch (geminiErr) {
      console.warn(`[ProductAiSpecs] Gemini thất bại (${geminiErr.message}), chuyển sang Fallback Groq...`);
      aiErrors.push(`Gemini: ${geminiErr.message}`);

      // 3.3. Fallback sang Groq
      try {
        aiResult = await extractWithGroq(pageContent, pName, pBrand);
      } catch (groqErr) {
        aiErrors.push(`Groq: ${groqErr.message}`);
        throw new AppError(
          `Tất cả các mô hình AI đều không thể trích xuất dữ liệu: [${aiErrors.join(' | ')}]`,
          500
        );
      }
    }
  }

  // Bước 4: Làm sạch & chuẩn hóa dữ liệu logistics
  const sanitized = sanitizeLogisticsData(aiResult);

  return {
    ...sanitized,
    shippingDataSource: targetUrl || 'AI Knowledge Engine',
    sourceUrl: targetUrl,
    engineUsed: searchEngineUsed,
    readerMethod,
  };
};

module.exports = {
  extractProductSpecs,
  searchWithSearxng,
  searchWithGoogleCse,
  fetchPageMarkdown,
  extractWithOllama,
  extractWithGemini,
  extractWithGroq,
};
