/**
 * chatbot.service.js — AI Sales Assistant (RAG + Gemini 1.5 Flash Real-time MongoDB Injection)
 *
 * Architecture:
 * - Động cơ AI chính: Google Gemini 1.5 Flash
 * - Tự động đọc dữ liệu thực tế 100% từ MongoDB (Product & ProductVariant) trước mỗi câu hỏi của khách (RAG Pipeline).
 * - Bơm thẳng tên sản phẩm, các biến thể (kích thước, màu sắc, RAM/dung lượng), giá niêm yết và tồn kho thực tế vào Prompt.
 * - Nghiêm cấm bịa đặt thông tin hoặc giới thiệu các sàn đối thủ (Tiki, Lazada, Shopee, TGDD, Vinamilk...).
 * - Hỗ trợ SSE Streaming cho trải nghiệm gõ phím trực tiếp mượt mà.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const GroqLib = require('groq-sdk');
const Groq    = GroqLib.default ?? GroqLib;

const Product        = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const BlogPost       = require('../models/blogPost.model');
const Category       = require('../models/category.model');
const Brand          = require('../models/brand.model');
const Coupon         = require('../models/coupon.model');

// ─── Gemini AI Init ───────────────────────────────────────────────────────────
let _genAI;
const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY chưa được cấu hình trong .env');
  }
  if (!_genAI) {
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _genAI;
};

// ─── Groq client (Fallback) ───────────────────────────────────────────────────
let _groq;
const getGroq = () => {
  if (!_groq) {
    if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY chưa được cấu hình trong .env');
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
};

// ─── Session store (LRU-capped to prevent OOM) ───────────────────────────────
const sessions   = new Map();
const MAX_HIST   = 10;
const SESS_TTL   = 30 * 60 * 1000;
const MAX_SESSIONS = 10_000; // hard cap — phòng OOM khi traffic cao

// Evict oldest entry khi vượt cap (O(1) amortized với Map insertion order)
const _evictOldestSession = () => {
  const firstKey = sessions.keys().next().value;
  if (firstKey !== undefined) sessions.delete(firstKey);
};

// Cleanup sessions hết TTL mỗi 10 phút (tăng tần suất từ 15p → 10p)
setInterval(() => {
  const now = Date.now();
  for (const [sid, e] of sessions.entries()) {
    if (now - e.ts > SESS_TTL) sessions.delete(sid);
  }
}, 10 * 60 * 1000).unref();

const getHistory = (sid) => {
  if (!sid) return [];
  const e = sessions.get(sid);
  if (!e) return [];
  if (Date.now() - e.ts > SESS_TTL) { sessions.delete(sid); return []; }
  // Touch: move to end of Map (LRU order)
  sessions.delete(sid);
  sessions.set(sid, e);
  return e.msgs;
};

const saveHistory = (sid, msgs) => {
  // Evict oldest nếu vượt cap
  if (!sessions.has(sid) && sessions.size >= MAX_SESSIONS) {
    _evictOldestSession();
  }
  sessions.set(sid, { msgs: msgs.slice(-MAX_HIST), ts: Date.now() });
};

// Emoji remover helper (loại bỏ triệt để mọi emoji unicode)
const removeEmojis = (str = '') =>
  str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}]/gu, '');

// Escape regex special chars
const escapeRegex = (str = '') => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ─── REAL-TIME MONGODB RAG FETCH (Đọc dữ liệu kho thật 100%) ────────────────
/**
 * Đọc trực tiếp từ Product và ProductVariant trong MongoDB dựa theo câu hỏi của khách
 */
const fetchProductContext = async (message = '') => {
  try {
    const clean = message.toLowerCase().trim();

    // Bỏ qua các câu chào hỏi ngắn
    if (/^(hi|hello|chào|xin chào|alo|cảm ơn|thanks|ok|xong)$/i.test(clean) || clean.length < 2) {
      return '';
    }

    // Tách từ khóa quan trọng
    const ignore = new Set(['có', 'ko', 'không', 'mã', 'giá', 'shop', 'chốt', 'tư', 'vấn', 'bạn', 'mình', 'tôi', 'cái', 'con', 'chiếc', 'à', 'nhé', 'nha', 'tầm', 'dưới']);
    const tokens = clean.replace(/[?!.,;:()\[\]"']/g, ' ').split(/\s+/).filter((w) => w.length >= 2 && !ignore.has(w));

    // Tìm thương hiệu & danh mục trùng khớp
    const [brands, categories] = await Promise.all([
      Brand.find({ name: { $in: tokens.map((t) => new RegExp(escapeRegex(t), 'i')) } }).select('_id name').lean(),
      Category.find({ name: { $in: tokens.map((t) => new RegExp(escapeRegex(t), 'i')) } }).select('_id name').lean(),
    ]);

    const orArr = tokens.map((t) => ({ name: new RegExp(escapeRegex(t), 'i') }));
    tokens.forEach((t) => {
      orArr.push({ productCode: new RegExp(escapeRegex(t), 'i') });
      orArr.push({ description: new RegExp(escapeRegex(t), 'i') });
    });

    if (brands.length > 0)     orArr.push({ brand: { $in: brands.map((b) => b._id) } });
    if (categories.length > 0) orArr.push({ categories: { $in: categories.map((c) => c._id) } });

    let rawProducts = [];
    if (orArr.length > 0) {
      rawProducts = await Product.find({
        isActive: true,
        status: 'published',
        $or: orArr,
      })
        .select('name slug brand categories price salePrice stock status productCode specifications isFeatured isHot')
        .populate('brand', 'name')
        .populate('categories', 'name')
        .limit(10)
        .lean();
    }

    // Fallback: nếu câu hỏi quá lóng hoặc ít từ trùng khớp -> lấy các sản phẩm hot/active trong kho
    if (rawProducts.length === 0) {
      rawProducts = await Product.find({ isActive: true, status: 'published' })
        .sort({ isFeatured: -1, isHot: -1, createdAt: -1 })
        .select('name slug brand categories price salePrice stock status productCode specifications')
        .populate('brand', 'name')
        .populate('categories', 'name')
        .limit(8)
        .lean();
    }

    if (rawProducts.length === 0) return '(Kho hàng hiện tại chưa có sản phẩm nào)';

    // Lấy biến thể chi tiết từ ProductVariant
    const pids = rawProducts.map((p) => p._id);
    const variants = await ProductVariant.find({ productId: { $in: pids }, isActive: { $ne: false } }).lean();

    const variantsByProd = {};
    variants.forEach((v) => {
      const pid = v.productId.toString();
      if (!variantsByProd[pid]) variantsByProd[pid] = [];
      variantsByProd[pid].push(v);
    });

    // Fetch mã giảm giá còn hiệu lực
    const now = new Date();
    const activeCoupons = await Coupon.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).select('code name type value maxDiscount minOrderValue').limit(3).lean();

    // Dựng khối dữ liệu thực tế 100% từ MongoDB
    const lines = ['=== DỮ LIỆU THỰC TẾ TRONG KHO HÀNG CỦA CỬA HÀNG (DỮ LIỆU MONGODB THẬT 100%) ==='];

    rawProducts.forEach((p, i) => {
      const pid = p._id.toString();
      const pVars = variantsByProd[pid] || [];
      const defaultVar = pVars.find((v) => v.isDefault) || pVars[0];

      const price     = defaultVar?.price     ?? p.price     ?? 0;
      const salePrice = defaultVar?.salePrice ?? p.salePrice ?? 0;
      const stock     = defaultVar?.stock     ?? p.stock     ?? 0;
      const hasRealDiscount = salePrice > 0 && price > 0 && salePrice < price;

      const priceStr = hasRealDiscount
        ? `${salePrice.toLocaleString('vi-VN')}đ (giảm từ ${price.toLocaleString('vi-VN')}đ)`
        : price > 0
        ? `${price.toLocaleString('vi-VN')}đ`
        : 'Liên hệ';

      lines.push(`\n[Sản phẩm ${i + 1}] Tên chính xác: "${p.name}"`);
      lines.push(`- Hãng sản xuất: ${p.brand?.name || 'Khác'} | Danh mục: ${p.categories?.map((c) => c.name).join(', ') || 'Chung'}`);
      lines.push(`- Giá niêm yết: ${priceStr} | Tình trạng: ${stock > 0 ? 'Còn hàng' : 'Hết hàng'}`);

      if (pVars.length > 0) {
        lines.push(`- Các phiên bản / tùy chọn hiện có (${pVars.length} lựa chọn):`);
        pVars.forEach((v) => {
          const attrStr = v.attributes?.map((a) => `${a.name}: ${a.value}`).join(' / ') || v.displayName || 'Tiêu chuẩn';
          const vPrice  = v.salePrice ?? v.price ?? price;
          const vStock  = v.stock > 0 ? 'Còn hàng' : 'Hết hàng';
          lines.push(`  + Tùy chọn [${attrStr}] -> Giá: ${vPrice ? vPrice.toLocaleString('vi-VN') + 'đ' : priceStr} (${vStock})`);
        });
      }

      if (p.specifications?.length > 0) {
        const specsStr = p.specifications.slice(0, 6).map((s) => `${s.key}: ${s.value}`).join(' | ');
        lines.push(`- Thông số kỹ thuật: ${specsStr}`);
      }
    });

    if (activeCoupons.length > 0) {
      lines.push('\n=== MÃ GIẢM GIÁ ĐANG ÁP DỤNG TRONG STORE ===');
      activeCoupons.forEach((c) => {
        const desc = c.type === 'percent' ? `Giảm ${c.value}%` : `Giảm ${c.value.toLocaleString('vi-VN')}đ`;
        lines.push(`- Mã [${c.code}]: ${c.name} - ${desc}${c.minOrderValue ? ' (Đơn từ ' + c.minOrderValue.toLocaleString('vi-VN') + 'đ)' : ''}`);
      });
    }

    return lines.join('\n');
  } catch (err) {
    console.error('[fetchProductContext Error]', err);
    return '';
  }
};

// ─── Build System Prompt cho Gemini ──────────────────────────────────────────
const buildSystemPrompt = (dbDataContext) => `Mày là "Ega" — nhân viên tư vấn bán hàng tận tâm của cửa hàng. Trả lời cực kỳ tự nhiên, đời thường, lịch sự và chu đáo như người thật đang tư vấn trực tiếp cho khách qua chat.

QUY TẮC AN TOÀN & NGÔN NGỮ (BẮT BUỘC TUÂN THỦ 100%):
1. TUYỆT ĐỐI KHÔNG DÙNG CÁC THUẬT NGỮ KỸ THUẬT/ADMIN NHƯ: "biến thể", "default variant", "SKU", "MongoDB", "database", "backend", "dữ liệu". Khách hàng không hiểu những từ này!
   - Thay từ "biến thể" bằng các từ tự nhiên tùy sản phẩm: "phiên bản", "lựa chọn", "kích thước", "cỡ", "dung lượng", "màu sắc", "mẫu".
   - Ví dụ: Đừng viết "Các biến thể có sẵn" hay cột bảng tên "Biến thể". Hãy viết "Các cỡ màn hình / phiên bản có sẵn" hoặc tên cột là "Phiên bản / Kích thước".
2. KHÔNG VIẾT CỨNG NHẮC KIỂU BÁO CÁO MÁY MÓC: Tránh dùng các tiêu đề khô khan kiểu "### Các biến thể có sẵn" hay "### Thông số kỹ thuật chính". Hãy dẫn dắt tự nhiên bằng câu nói thân thiện, ví dụ: "Mẫu này shop mình đang có sẵn các lựa chọn kích thước sau nha bạn:" hoặc "Gửi bạn một số thông tin nổi bật của máy nè:".
3. TUYỆT ĐỐI KHÔNG DÙNG BẤT KỲ EMOJI NÀO (như 🚀, 😊, 🔥, 👍, ✨, 📱, 📺...). CẤM HOÀN TOÀN EMOJI.
4. Mày CHỈ LÀ nhân viên bán hàng của cửa hàng NÀY. TUYỆT ĐỐI KHÔNG bao giờ gợi ý hay nhắc tên các sàn/siêu thị khác (Shopee, Lazada, Tiki, Điện Máy Xanh, Thế Giới Di Động...).
5. CHỈ DÙNG DỮ LIỆU SẢN PHẨM TRONG KHO CỦA STORE BÊN DƯỚI ĐỂ TRẢ LỜI. Giá tiền, khuyến mãi, tình trạng còn hàng phải chuẩn 100%.
6. Nếu không có sản phẩm khách tìm: Lịch sự báo "Dòng này shop mình hiện chưa về hàng rồi bạn ơi, bạn tham khảo thử các mẫu khác bên mình nhé!".

PHONG CÁCH TƯ VẤN:
- Tự nhiên, gần gũi, xưng "mình" - gọi "bạn" hoặc "anh/chị".
- Tự dịch từ lóng ("củ" -> triệu VNĐ, "pin trâu" -> dung lượng pin lớn, "màn bự" -> màn hình lớn).
- Nếu dùng bảng Markdown để so sánh giá/kích thước, dùng tên cột dễ hiểu như | Phiên bản / Kích thước | Giá bán | Tình trạng |.

${dbDataContext || '(Chưa có dữ liệu kho)'}`;

// ─── Stream chat với Gemini + Real-time MongoDB Context Injection ────────────
const chatStream = async ({ sessionId, message }, res) => {
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
    const history = getHistory(sid);
    write({ type: 'session', sessionId: sid });

    // 1. ĐỌC DỮ LIỆU THỰC TẾ TỪ MONGODB (Product + ProductVariant)
    const dbDataContext = await fetchProductContext(message);
    const systemPrompt  = buildSystemPrompt(dbDataContext);

    // 2. Format Gemini history
    const geminiHistory = history.map((h) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }],
    }));

    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
    });

    const chatSession = model.startChat({ history: geminiHistory });
    const result = await chatSession.sendMessageStream(message);

    let fullText = '';
    for await (const chunk of result.stream) {
      const text = removeEmojis(chunk.text() || '');
      if (text) {
        fullText += text;
        write({ type: 'text', text });
      }
    }

    // Cập nhật lịch sử session
    history.push({ role: 'user',      content: message });
    history.push({ role: 'assistant', content: fullText });
    saveHistory(sid, history);

    write({ type: 'done' });
  } catch (geminiErr) {
    console.error('[Gemini Chat Error]', geminiErr?.message || geminiErr);

    // Fallback sang Groq nếu Gemini gặp sự cố
    try {
      const history = getHistory(sid);
      const dbDataContext = await fetchProductContext(message);
      const systemPrompt  = buildSystemPrompt(dbDataContext);

      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map((h) => ({ role: h.role, content: h.content })),
        { role: 'user', content: message },
      ];

      const groqStream = await getGroq().chat.completions.create({
        model: 'openai/gpt-oss-20b',
        messages,
        stream: true,
        max_tokens: 600,
        temperature: 0.7,
      });

      let full = '';
      for await (const chunk of groqStream) {
        const text = removeEmojis(chunk.choices[0]?.delta?.content || '');
        if (text) {
          full += text;
          write({ type: 'text', text });
        }
      }

      history.push({ role: 'user',      content: message });
      history.push({ role: 'assistant', content: full });
      saveHistory(sid, history);
      write({ type: 'done' });
    } catch (fallbackErr) {
      console.error('[Chatbot Fallback Error]', fallbackErr);
      write({
        type: 'error',
        message: 'Hệ thống AI đang bận, bạn vui lòng thử lại sau vài giây nhé!',
      });
    }
  } finally {
    res.end();
  }
};

// ─── Non-stream fallback ──────────────────────────────────────────────────────
const chat = async ({ sessionId, message }) => {
  const sid = sessionId || require('crypto').randomUUID();
  const history = getHistory(sid);

  const dbDataContext = await fetchProductContext(message);
  const systemPrompt  = buildSystemPrompt(dbDataContext);

  const geminiHistory = history.map((h) => ({
    role: h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: h.content }],
  }));

  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: systemPrompt,
  });

  const chatSession = model.startChat({ history: geminiHistory });
  const result = await chatSession.sendMessage(message);
  const response = await result.response;
  const reply = removeEmojis(response.text() || '');

  history.push({ role: 'user',      content: message });
  history.push({ role: 'assistant', content: reply });
  saveHistory(sid, history);

  return { reply, sessionId: sid };
};

const resetSession = (sid) => sessions.delete(sid);

module.exports = { chat, chatStream, resetSession };
