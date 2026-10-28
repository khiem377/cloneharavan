const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * In-memory dictionary màu sắc chuẩn cho đồ điện tử, thời trang, nội thất tiếng Việt & tiếng Anh
 * Phản hồi tức thì < 1ms mà không cần gọi API lặp lại
 */
const COLOR_DICTIONARY = {
  // Apple Titanium Series
  'titan sa mạc': '#C5A880',
  'titan sa mac': '#C5A880',
  'desert titanium': '#C5A880',
  'titan tự nhiên': '#9E9E9E',
  'titan tu nhien': '#9E9E9E',
  'natural titanium': '#9E9E9E',
  'titan đen': '#333333',
  'titan den': '#333333',
  'black titanium': '#333333',
  'titan trắng': '#F5F5F5',
  'titan trang': '#F5F5F5',
  'white titanium': '#F5F5F5',
  'titan xanh': '#414856',
  'blue titanium': '#414856',

  // iPhone 16 Base / Plus Series
  'xanh lưu ly': '#7182DD',
  'xanh luu ly': '#7182DD',
  'ultramarine': '#7182DD',
  'xanh mòng két': '#99DDD3',
  'xanh mong ket': '#99DDD3',
  'teal': '#99DDD3',
  'hồng': '#F4C2CE',
  'hong': '#F4C2CE',
  'pink': '#F4C2CE',
  'trắng': '#F5F5F7',
  'trang': '#F5F5F7',
  'white': '#F5F5F7',
  'đen': '#3B3B3D',
  'den': '#3B3B3D',
  'black': '#3B3B3D',

  // Samsung & Android Flagship
  'xám titan': '#787878',
  'xam titan': '#787878',
  'vàng titan': '#E3D7B8',
  'vang titan': '#E3D7B8',
  'tím titan': '#68607A',
  'tim titan': '#68607A',
  'xám không gian': '#4B4E54',
  'xam khong gian': '#4B4E54',
  'space gray': '#4B4E54',
  'bạc': '#E3E4E5',
  'bac': '#E3E4E5',
  'silver': '#E3E4E5',
  'vàng gold': '#F7E7CE',
  'vang gold': '#F7E7CE',
  'vàng đồng': '#D4AF37',
  'vang dong': '#D4AF37',
  'gold': '#F7E7CE',
  'vàng champagne': '#F7E7CE',
  'vàng': '#EAB308',
  'vang': '#EAB308',
  'yellow': '#EAB308',
  'cam': '#EA580C',
  'orange': '#EA580C',
  'đỏ': '#DC2626',
  'do': '#DC2626',
  'red': '#DC2626',
  'đỏ đô': '#881337',
  'do do': '#881337',
  'đỏ rượu': '#881337',
  'do ruou': '#881337',
  'xanh dương': '#2563EB',
  'xanh duong': '#2563EB',
  'blue': '#2563EB',
  'xanh navy': '#1E3A8A',
  'navy': '#1E3A8A',
  'xanh coban': '#1D4ED8',
  'xanh cobalt': '#1D4ED8',
  'xanh lá': '#16A34A',
  'xanh la': '#16A34A',
  'green': '#16A34A',
  'xanh lục': '#16A34A',
  'xanh rêu': '#3F6212',
  'xanh reu': '#3F6212',
  'xanh ngọc': '#0D9488',
  'xanh ngoc': '#0D9488',
  'xanh pastel': '#A7F3D0',
  'tím': '#9333EA',
  'tim': '#9333EA',
  'purple': '#9333EA',
  'tím khói': '#A855F7',
  'tim khoi': '#A855F7',
  'tím than': '#581C87',
  'tim than': '#581C87',
  'hồng cánh sen': '#DB2777',
  'hong canh sen': '#DB2777',
  'rose gold': '#B76E79',
  'nâu': '#78350F',
  'nau': '#78350F',
  'brown': '#78350F',
  'nâu be': '#D6C0B3',
  'kem': '#FFFDD0',
  'ghi': '#9CA3AF',
  'xám': '#6B7280',
  'xam': '#6B7280',
  'gray': '#6B7280',
  'grey': '#6B7280',
};

// Hot cache cho các kết quả AI đã phân tích
const aiColorCache = new Map();

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
 * Tự động phân tích và sinh mã HEX thông minh cho màu sắc sản phẩm
 * @param {string} colorName - Tên màu (VD: "Titan Sa Mạc", "Xanh Mòng Két", "Xám Khói")
 * @param {string} [productName] - Tên sản phẩm đi kèm để AI hiểu ngữ cảnh (VD: "iPhone 16 Pro Max")
 * @returns {Promise<string>} Mã HEX chuẩn dạng "#RRGGBB"
 */
const resolveColorHex = async (colorName, productName = '') => {
  if (!colorName || typeof colorName !== 'string') return '#888888';
  const clean = colorName.trim().toLowerCase();

  // 1. Kiểm tra từ điển có sẵn
  if (COLOR_DICTIONARY[clean]) {
    return COLOR_DICTIONARY[clean];
  }

  // 2. Tìm kiếm chứa từ khóa trong từ điển (Substring matching)
  for (const [key, hex] of Object.entries(COLOR_DICTIONARY)) {
    if (clean === key || clean.includes(key) || key.includes(clean)) {
      return hex;
    }
  }

  // 3. Kiểm tra Hot Cache AI đã từng phân tích
  const cacheKey = `${productName || ''}:${clean}`;
  if (aiColorCache.has(cacheKey)) {
    return aiColorCache.get(cacheKey);
  }

  // 4. Gọi Google Gemini AI phân tích ngữ cảnh chính xác
  const genAI = getGeminiClient();
  if (genAI) {
    try {
      const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-3.5-flash', 'gemini-3.8-flash'];
      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const prompt = `Bạn là chuyên gia thiết kế sản phẩm và phối màu UI.
Hãy trích xuất mã màu HEX chính xác đại diện cho màu sắc sản phẩm sau:
- Tên màu sắc: "${colorName}"
${productName ? `- Sản phẩm: "${productName}"` : ''}

YÊU CẦU DUY NHẤT:
Chỉ trả về 1 mã màu HEX 7 ký tự theo định dạng #RRGGBB (ví dụ: #C5A880, #7182DD). Tuyệt đối không giải thích, không viết thêm bất kỳ chữ nào khác.`;

          const result = await model.generateContent(prompt);
          const rawText = result?.response?.text()?.trim();
          const hexMatch = rawText?.match(/#[0-9A-Fa-f]{6}/);
          if (hexMatch) {
            const hex = hexMatch[0].toUpperCase();
            aiColorCache.set(cacheKey, hex);
            return hex;
          }
        } catch (_) {
          // Fallback sang model tiếp theo trong chuỗi
        }
      }
    } catch (err) {
      console.warn('[AIColorService] Gemini resolution failed:', err?.message);
    }
  }

  // 5. Fallback thông minh: Thuật toán HSL Hash Deterministic
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  const hex = hslToHex(hue, 65, 55);
  aiColorCache.set(cacheKey, hex);
  return hex;
};

// Helper chuyển đổi HSL sang HEX
function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

module.exports = {
  resolveColorHex,
  COLOR_DICTIONARY,
};
