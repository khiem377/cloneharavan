const Combo = require('../models/combo.model');
const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const Order = require('../models/order.model');
const mongoose = require('mongoose');
const { AppError } = require('../utils/AppError');

class ComboService {
  /**
   * Sinh mã combo tự động nếu user không nhập mã tùy chỉnh
   */
  static async generateComboCode() {
    const today = new Date();
    const dateStr = today.toISOString().slice(2, 10).replace(/-/g, '');
    const count = await Combo.countDocuments({
      createdAt: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lte: new Date(today.setHours(23, 59, 59, 999)),
      },
    });
    return `CB${dateStr}-${String(count + 1).padStart(3, '0')}`;
  }

  /**
   * Tính toán tồn kho khả dụng của một Combo dựa trên tồn kho các sản phẩm thành phần
   */
  static calculateVirtualStock(combo, productsMap) {
    if (!combo.items || combo.items.length === 0) return 0;
    let minStock = Infinity;

    for (const item of combo.items) {
      const pid = (item.productId?._id || item.productId).toString();
      const product = productsMap[pid];
      const currentStock = product ? (product.stock || 0) : 0;
      const possibleSets = Math.floor(currentStock / (item.quantity || 1));
      if (possibleSets < minStock) {
        minStock = possibleSets;
      }
    }

    return minStock === Infinity ? 0 : Math.max(0, minStock);
  }

  /**
   * Tạo Combo mới
   */
  static async createCombo(data, userId) {
    let {
      name,
      code,
      description = '',
      pricingStrategy = 'fixed_price',
      discountType = 'amount',
      discountValue = 0,
      comboPrice,
      totalOriginalPrice,
      items = [],
      startDate,
      endDate,
      usageLimit = 0,
      isActive = true,
    } = data;

    if (!name || !name.trim()) {
      throw new AppError('Tên combo sản phẩm là bắt buộc', 400);
    }

    if (!items || items.length < 2) {
      throw new AppError('Một combo phải bao gồm ít nhất 2 sản phẩm', 400);
    }

    // Tự sinh mã nếu không có
    if (!code || !code.trim()) {
      code = await this.generateComboCode();
    } else {
      code = code.trim().toUpperCase();
      const existing = await Combo.findOne({ code });
      if (existing) {
        throw new AppError(`Mã combo [${code}] đã tồn tại, vui lòng chọn mã khác`, 400);
      }
    }

    // Kiểm tra và lấy thông tin các sản phẩm
    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } })
      .select('name sku price cachedPrice stock thumbnail')
      .lean();

    if (products.length !== productIds.length) {
      throw new AppError('Một số sản phẩm được chọn không tồn tại trong hệ thống', 400);
    }

    const productMap = {};
    products.forEach((p) => {
      productMap[p._id.toString()] = p;
    });

    // Tính lại tổng tiền gốc thực tế từ DB để đảm bảo chính xác
    let calculatedOriginal = 0;
    const validatedItems = items.map((item) => {
      const p = productMap[item.productId.toString()];
      const price = p.cachedPrice ?? p.price ?? 0;
      const qty = Math.max(1, Number(item.quantity) || 1);
      calculatedOriginal += price * qty;
      return {
        productId: item.productId,
        quantity: qty,
        originalPrice: price,
      };
    });

    // Tính giá combo dựa trên chiến lược định giá
    let finalComboPrice = Number(comboPrice);
    if (pricingStrategy === 'discount') {
      const val = Number(discountValue) || 0;
      if (discountType === 'percent') {
        const discountAmt = Math.round((calculatedOriginal * val) / 100);
        finalComboPrice = Math.max(0, calculatedOriginal - discountAmt);
      } else {
        finalComboPrice = Math.max(0, calculatedOriginal - val);
      }
    }

    if (isNaN(finalComboPrice) || finalComboPrice < 0) {
      throw new AppError('Giá combo không hợp lệ', 400);
    }

    const combo = await Combo.create({
      name: name.trim(),
      code,
      description: description.trim(),
      pricingStrategy,
      discountType,
      discountValue: Number(discountValue) || 0,
      totalOriginalPrice: calculatedOriginal,
      comboPrice: finalComboPrice,
      items: validatedItems,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      usageLimit: Number(usageLimit) || 0,
      isActive: isActive !== false,
      createdById: userId || null,
    });

    return combo;
  }

  /**
   * Lấy danh sách Combo có phân trang, tìm kiếm và tính tồn kho động
   */
  static async getCombos(query = {}) {
    const { page = 1, limit = 10, keyword = '', status = '' } = query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (keyword && keyword.trim()) {
      filter.$or = [
        { name: { $regex: keyword.trim(), $options: 'i' } },
        { code: { $regex: keyword.trim(), $options: 'i' } },
      ];
    }

    const now = new Date();
    if (status === 'active') {
      filter.isActive = true;
      filter.$or = [{ endDate: null }, { endDate: { $gte: now } }];
    } else if (status === 'inactive') {
      filter.isActive = false;
    } else if (status === 'expired') {
      filter.endDate = { $lt: now };
    }

    const [combos, total] = await Promise.all([
      Combo.find(filter)
        .populate({
          path: 'items.productId',
          select: 'name sku price cachedPrice stock thumbnail unit',
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Combo.countDocuments(filter),
    ]);

    // Thu thập tất cả productIds để tính virtualStock chính xác
    const allProductIds = [];
    combos.forEach((c) => {
      c.items?.forEach((item) => {
        if (item.productId?._id) allProductIds.push(item.productId._id);
      });
    });

    const products = await Product.find({ _id: { $in: allProductIds } })
      .select('stock')
      .lean();
    const productStockMap = {};
    products.forEach((p) => {
      productStockMap[p._id.toString()] = p;
    });

    // Thêm trường virtualStock và savings cho mỗi combo
    const data = combos.map((c) => {
      const virtualStock = this.calculateVirtualStock(c, productStockMap);
      const savingsAmount = Math.max(0, (c.totalOriginalPrice || 0) - (c.comboPrice || 0));
      const savingsPercent =
        c.totalOriginalPrice > 0 ? Math.round((savingsAmount / c.totalOriginalPrice) * 100) : 0;

      return {
        ...c,
        virtualStock,
        savingsAmount,
        savingsPercent,
      };
    });

    return {
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  /**
   * Lấy chi tiết combo theo ID
   */
  static async getComboById(id) {
    const combo = await Combo.findById(id)
      .populate({
        path: 'items.productId',
        select: 'name sku price cachedPrice stock thumbnail unit',
      })
      .lean();

    if (!combo) throw new AppError('Combo sản phẩm không tồn tại', 404);

    const productIds = combo.items?.map((i) => i.productId?._id).filter(Boolean) || [];
    const products = await Product.find({ _id: { $in: productIds } })
      .select('stock')
      .lean();
    const productStockMap = {};
    products.forEach((p) => {
      productStockMap[p._id.toString()] = p;
    });

    const virtualStock = this.calculateVirtualStock(combo, productStockMap);
    const savingsAmount = Math.max(0, (combo.totalOriginalPrice || 0) - (combo.comboPrice || 0));
    const savingsPercent =
      combo.totalOriginalPrice > 0 ? Math.round((savingsAmount / combo.totalOriginalPrice) * 100) : 0;

    return {
      ...combo,
      virtualStock,
      savingsAmount,
      savingsPercent,
    };
  }

  /**
   * Cập nhật Combo
   */
  static async updateCombo(id, data) {
    const combo = await Combo.findById(id);
    if (!combo) throw new AppError('Combo sản phẩm không tồn tại', 404);

    let {
      name,
      code,
      description,
      pricingStrategy,
      discountType,
      discountValue,
      comboPrice,
      items,
      startDate,
      endDate,
      usageLimit,
      isActive,
    } = data;

    if (name) combo.name = name.trim();
    if (description !== undefined) combo.description = description.trim();
    if (usageLimit !== undefined) combo.usageLimit = Number(usageLimit) || 0;
    if (startDate) combo.startDate = new Date(startDate);
    if (endDate !== undefined) combo.endDate = endDate ? new Date(endDate) : null;
    if (isActive !== undefined) combo.isActive = Boolean(isActive);

    if (code && code.trim().toUpperCase() !== combo.code) {
      const newCode = code.trim().toUpperCase();
      const existing = await Combo.findOne({ code: newCode, _id: { $ne: id } });
      if (existing) throw new AppError(`Mã combo [${newCode}] đã được sử dụng`, 400);
      combo.code = newCode;
    }

    if (items && Array.isArray(items) && items.length >= 2) {
      const productIds = items.map((i) => i.productId);
      const products = await Product.find({ _id: { $in: productIds } })
        .select('price cachedPrice')
        .lean();
      const productMap = {};
      products.forEach((p) => {
        productMap[p._id.toString()] = p;
      });

      let calculatedOriginal = 0;
      combo.items = items.map((item) => {
        const p = productMap[item.productId.toString()];
        const price = p?.cachedPrice ?? p?.price ?? 0;
        const qty = Math.max(1, Number(item.quantity) || 1);
        calculatedOriginal += price * qty;
        return {
          productId: item.productId,
          quantity: qty,
          originalPrice: price,
        };
      });
      combo.totalOriginalPrice = calculatedOriginal;
    }

    if (pricingStrategy) combo.pricingStrategy = pricingStrategy;
    if (discountType) combo.discountType = discountType;
    if (discountValue !== undefined) combo.discountValue = Number(discountValue) || 0;

    if (combo.pricingStrategy === 'discount') {
      const val = combo.discountValue || 0;
      if (combo.discountType === 'percent') {
        const discountAmt = Math.round((combo.totalOriginalPrice * val) / 100);
        combo.comboPrice = Math.max(0, combo.totalOriginalPrice - discountAmt);
      } else {
        combo.comboPrice = Math.max(0, combo.totalOriginalPrice - val);
      }
    } else if (comboPrice !== undefined) {
      combo.comboPrice = Math.max(0, Number(comboPrice) || 0);
    }

    await combo.save();
    return combo;
  }

  /**
   * Xóa Combo
   */
  static async deleteCombo(id) {
    const combo = await Combo.findByIdAndDelete(id);
    if (!combo) throw new AppError('Combo không tồn tại', 404);
    return { success: true, message: 'Đã xóa combo thành công' };
  }

  /**
   * Bật/tắt trạng thái hoạt động của combo
   */
  static async toggleStatus(id) {
    const combo = await Combo.findById(id);
    if (!combo) throw new AppError('Combo không tồn tại', 404);
    combo.isActive = !combo.isActive;
    await combo.save();
    return combo;
  }

  /**
   * AI Gemini Gợi ý Giá Combo & Chiến Lược Định Giá Thông Minh
   */
  static async aiSuggestPricing({ items = [], totalOriginalPrice = 0, comboName = '' }) {
    if (!items || items.length === 0 || !totalOriginalPrice) {
      throw new AppError('Cần danh sách sản phẩm và tổng giá trị gốc để AI định giá', 400);
    }

    // 1. Thu thập dữ liệu thực tế về Giá vốn, Tồn kho, và Lịch sử bán hàng từ Database
    const productIds = items.map((it) => it.productId).filter(Boolean);
    const dbProducts = await Product.find({ _id: { $in: productIds } })
      .select('name costPrice stock sold cachedPrice price')
      .lean();

    const prodMap = {};
    dbProducts.forEach((p) => {
      prodMap[p._id.toString()] = p;
    });

    // 2. Thống kê số lượng bán và doanh thu 30 ngày gần nhất từ bảng Order
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const validObjectIds = productIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    let recentSales = [];
    try {
      recentSales = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
            status: { $nin: ['cancelled', 'returned'] },
          },
        },
        { $unwind: '$items' },
        {
          $match: {
            'items.productId': { $in: validObjectIds },
          },
        },
        {
          $group: {
            _id: '$items.productId',
            monthlySoldQty: { $sum: '$items.quantity' },
            monthlyRevenue: { $sum: { $multiply: ['$items.originalPrice', '$items.quantity'] } },
          },
        },
      ]);
    } catch (orderErr) {
      console.warn('[AI-Pricing] Could not aggregate recent orders:', orderErr.message);
    }

    const salesMap = {};
    recentSales.forEach((s) => {
      salesMap[s._id.toString()] = s;
    });

    // 3. Tính tổng giá vốn và đánh giá tốc độ tiêu thụ hàng hóa
    let totalCostPrice = 0;
    const enrichedItems = items.map((it) => {
      const p = prodMap[it.productId] || {};
      const s = salesMap[it.productId] || {};
      const cost = Number(p.costPrice) || Number(it.costPrice) || Math.round((it.originalPrice || 0) * 0.65);
      const stock = Number(p.stock) || 0;
      const soldLifetime = Number(p.sold) || 0;
      const monthlySoldQty = Number(s.monthlySoldQty) || 0;
      const monthlyRevenue = Number(s.monthlyRevenue) || 0;
      const reqQty = Number(it.quantity) || 1;

      totalCostPrice += cost * reqQty;

      let salesSpeed = 'Bán đều đặn';
      if (monthlySoldQty >= 15 || soldLifetime >= 50) {
        salesSpeed = 'Bán rất chạy (Hero Product - Sản phẩm chủ lực)';
      } else if (stock > 25 && monthlySoldQty <= 3) {
        salesSpeed = 'Bán chậm / Tồn kho nhiều (Cần kích cầu xả hàng)';
      }

      return {
        ...it,
        costPrice: cost,
        stock,
        soldLifetime,
        monthlySoldQty,
        monthlyRevenue,
        salesSpeed,
      };
    });

    const grossMargin = Math.max(0, totalOriginalPrice - totalCostPrice);
    const grossMarginPct = totalOriginalPrice > 0 ? Math.round((grossMargin / totalOriginalPrice) * 100) : 35;

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return this.fallbackPricingSuggestions(items, totalOriginalPrice, comboName, totalCostPrice, enrichedItems);
    }

    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(key);
      const prompt = `Bạn là Giám đốc Chiến lược Định giá Bán lẻ và TMĐT (Retail Pricing & Revenue Director).
Dưới đây là DỮ LIỆU KINH DOANH THỰC TẾ từ hệ thống kho và đơn hàng cho các sản phẩm dự kiến đóng combo:
- Tên combo dự kiến: "${comboName || 'Combo sản phẩm'}"
- Tổng giá niêm yết bán lẻ gốc: ${Number(totalOriginalPrice).toLocaleString('vi-VN')} VNĐ
- Tổng giá vốn nhập hàng (Cost Price): ${Number(totalCostPrice).toLocaleString('vi-VN')} VNĐ
- Biên độ lãi gộp tối đa: ~${grossMarginPct}%

DỮ LIỆU BÁN HÀNG VÀ TỒN KHO CHI TIẾT TỪNG MÓN:
${enrichedItems.map((it, idx) => `  ${idx + 1}. ${it.name} (SL trong combo: ${it.quantity || 1})
     • Đơn giá niêm yết: ${Number(it.originalPrice).toLocaleString('vi-VN')} đ | Giá vốn: ${Number(it.costPrice).toLocaleString('vi-VN')} đ
     • Tồn kho thực tế: ${it.stock} cái | Đã bán trong 30 ngày qua: ${it.monthlySoldQty} cái (Doanh thu tháng: ${Number(it.monthlyRevenue).toLocaleString('vi-VN')} đ)
     • Đánh giá hiệu suất: ${it.salesSpeed}`).join('\n')}

NGUYÊN TẮC ĐỊNH GIÁ DỰA TRÊN DỮ LIỆU KINH DOANH:
1. NGUYÊN TẮC AN TOÀN LỢI NHUẬN (PROFIT FLOOR):
   - Tuyệt đối KHÔNG ĐƯỢC bán dưới giá vốn. Cả 3 mức giá đề xuất PHẢI CAO HƠN tổng giá vốn (${Number(totalCostPrice).toLocaleString('vi-VN')} VNĐ).
2. CHIẾN LƯỢC KÉO - ĐẢY (CROSS-SELLING COMBO):
   - Với sản phẩm "Bán rất chạy": Giữ mức giảm tượng trưng (7% - 10%), dùng uy tín và độ hot của nó làm mồi nhử kéo khách.
   - Với sản phẩm "Bán chậm / Tồn kho nhiều": Đóng gói kèm vào và tăng tỷ lệ chiết khấu cho gói Flash Sale (18% - 22%) để kích thích khách mua, giải phóng vốn tồn đọng.
   - Với combo có biên lợi nhuận mỏng: Ưu tiên gói "Khuyên dùng" ở mức chiết khấu an toàn 12% - 15%.
3. Làm tròn số: Các mức giá combo PHẢI được làm tròn đến hàng nghìn (ví dụ 8.228.000đ hoặc 8.290.000đ).
4. Phân tích cụ thể: Trong trường "analysis", viết 1-2 câu giải thích rõ vì sao chọn mức giá đó dựa trên doanh thu, tồn kho và giá vốn của các sản phẩm trên.

Trả về kết quả DUY NHẤT là một chuỗi JSON hợp lệ theo định dạng sau (không chứa markdown backticks hay giải thích bên ngoài):
{
  "marketingTitle": "Tiêu đề bán hàng hấp dẫn",
  "slogan": "Câu slogan ngắn gọn cho combo",
  "analysis": "Phân tích chiến lược ngắn gọn dựa trên giá vốn X đ và tốc độ bán của các món",
  "options": [
    {
      "label": "Gói Khuyên Dùng",
      "strategy": "best_choice",
      "discountPercent": 15,
      "suggestedPrice": 8228000,
      "savingsAmount": 1452000,
      "reason": "Mức giá kích thích mua sắm tốt nhất với biên lợi nhuận ổn định"
    },
    {
      "label": "Gói Flash Sale",
      "strategy": "flash_sale",
      "discountPercent": 20,
      "suggestedPrice": 7744000,
      "savingsAmount": 1936000,
      "reason": "Thích hợp giải phóng hàng tồn kho nhiều và kích cầu doanh số"
    },
    {
      "label": "Gói Tiêu Chuẩn",
      "strategy": "standard",
      "discountPercent": 10,
      "suggestedPrice": 8712000,
      "savingsAmount": 968000,
      "reason": "Bảo toàn biên lợi nhuận cao cho sản phẩm chủ lực bán chạy"
    }
  ]
}`;

      const geminiModels = [
        'gemini-2.5-flash',
        'gemini-2.0-flash-lite',
        'gemini-1.5-flash',
      ];

      for (const modelName of geminiModels) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          });

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('AI request timeout')), 2500)
          );

          const result = await Promise.race([model.generateContent(prompt), timeoutPromise]);
          const responseText = result.response.text();
          const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          if (parsed && Array.isArray(parsed.options) && parsed.options.length > 0) {
            return parsed;
          }
        } catch (err) {
          console.warn(`[AI-Pricing] Fast fallback triggered: ${err.message}`);
          break; // Fallback ngay để không làm chậm người dùng
        }
      }

      return this.fallbackPricingSuggestions(items, totalOriginalPrice, comboName, totalCostPrice, enrichedItems);
    } catch (outerErr) {
      console.error('[AI-Pricing-Error]', outerErr.message);
      return this.fallbackPricingSuggestions(items, totalOriginalPrice, comboName, totalCostPrice, enrichedItems);
    }
  }

  /**
   * AI Gợi ý Tạo Combo Thông Minh Khi Form Trống
   * Tự động quét sản phẩm trong kho (Best seller + Tồn kho nhiều) để tạo 3 gói combo sẵn
   */
  static async aiSuggestBundles() {
    const products = await Product.find({
      isActive: true,
      stock: { $gt: 0 },
    })
      .select('name code productCode price costPrice stock sold thumbnail images sku')
      .sort({ sold: -1, stock: -1 })
      .limit(20)
      .lean();

    if (!products || products.length < 2) {
      return [];
    }

    const formatProductItem = (p) => {
      const thumb =
        p.thumbnail?.url ||
        (typeof p.thumbnail === 'string' ? p.thumbnail : '') ||
        (Array.isArray(p.images) && p.images[0]?.url) ||
        '';
      return {
        productId: p._id,
        name: p.name,
        sku: p.sku || p.productCode || p.code || '',
        thumbnail: thumb,
        stock: p.stock || 0,
        costPrice: p.costPrice || Math.round((p.price || 0) * 0.65),
        originalPrice: p.price || 0,
        quantity: 1,
      };
    };

    const bestSellers = [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0));
    const highStocks = [...products].sort((a, b) => (b.stock || 0) - (a.stock || 0));
    const roundK = (v) => Math.round(v / 1000) * 1000;

    const calculateBundlePrice = (totalOrig, totalCost, targetDiscountPct) => {
      let suggested = roundK(totalOrig * ((100 - targetDiscountPct) / 100));
      if (totalCost > 0 && totalCost < totalOrig) {
        suggested = Math.max(roundK(totalCost * 1.05), suggested);
      }
      if (suggested >= totalOrig) {
        suggested = roundK(totalOrig * 0.90);
      }
      const discountPct = Math.max(5, Math.round(((totalOrig - suggested) / totalOrig) * 100));
      const savings = Math.max(0, totalOrig - suggested);
      return { suggested, discountPct, savings };
    };

    const bundles = [];

    // Gói 1: Bán chạy + Xả kho
    if (bestSellers.length >= 1 && highStocks.length >= 1) {
      const p1 = bestSellers[0];
      const p2 = highStocks.find((p) => p._id.toString() !== p1._id.toString()) || products[1];
      if (p2) {
        const item1 = formatProductItem(p1);
        const item2 = formatProductItem(p2);
        const totalOrig = item1.originalPrice + item2.originalPrice;
        const totalCost = item1.costPrice + item2.costPrice;
        const { suggested, discountPct, savings } = calculateBundlePrice(totalOrig, totalCost, 15);

        bundles.push({
          id: 'bundle_hero_clearance',
          name: `Combo Tiết Kiệm: ${p1.name.slice(0, 24)} + ${p2.name.slice(0, 24)}`,
          strategyLabel: 'Bán chạy kèm Xả kho',
          description: `Kết hợp sản phẩm bán chạy nhất cùng sản phẩm tồn kho để tối ưu doanh thu và kích cầu xả hàng.`,
          items: [item1, item2],
          totalOriginalPrice: totalOrig,
          suggestedPrice: suggested,
          discountPercent: discountPct,
          savingsAmount: savings,
          virtualStock: Math.min(item1.stock, item2.stock),
        });
      }
    }

    // Gói 2: Bộ đôi Tiện ích Gia đình
    if (products.length >= 4) {
      const p1 = products[2];
      const p2 = products[3];
      const item1 = formatProductItem(p1);
      const item2 = formatProductItem(p2);
      const totalOrig = item1.originalPrice + item2.originalPrice;
      const totalCost = item1.costPrice + item2.costPrice;
      const { suggested, discountPct, savings } = calculateBundlePrice(totalOrig, totalCost, 12);

      bundles.push({
        id: 'bundle_lifestyle',
        name: `Combo Tiện Ích: ${p1.name.slice(0, 24)} & ${p2.name.slice(0, 24)}`,
        strategyLabel: 'Bộ đôi Tiện ích Gia đình',
        description: `Gói combo gia tăng giá trị đơn hàng trung bình (AOV), đem lại giải pháp đồng bộ cho khách hàng.`,
        items: [item1, item2],
        totalOriginalPrice: totalOrig,
        suggestedPrice: suggested,
        discountPercent: discountPct,
        savingsAmount: savings,
        virtualStock: Math.min(item1.stock, item2.stock),
      });
    } else if (products.length === 3) {
      const p1 = products[1];
      const p2 = products[2];
      const item1 = formatProductItem(p1);
      const item2 = formatProductItem(p2);
      const totalOrig = item1.originalPrice + item2.originalPrice;
      const totalCost = item1.costPrice + item2.costPrice;
      const { suggested, discountPct, savings } = calculateBundlePrice(totalOrig, totalCost, 12);

      bundles.push({
        id: 'bundle_duo',
        name: `Combo Tiết Kiệm: ${p1.name.slice(0, 24)} & ${p2.name.slice(0, 24)}`,
        strategyLabel: 'Bộ đôi Tiện ích',
        description: `Bộ đôi sản phẩm thiết yếu với mức giá chiết khấu tối ưu.`,
        items: [item1, item2],
        totalOriginalPrice: totalOrig,
        suggestedPrice: suggested,
        discountPercent: discountPct,
        savingsAmount: savings,
        virtualStock: Math.min(item1.stock, item2.stock),
      });
    }

    // Gói 3: Flash Sale Siêu Hời
    if (products.length >= 2) {
      const p1 = products[0];
      const p2 = products[products.length - 1];
      if (p1._id.toString() !== p2._id.toString()) {
        const item1 = formatProductItem(p1);
        const item2 = formatProductItem(p2);
        const totalOrig = item1.originalPrice + item2.originalPrice;
        const totalCost = item1.costPrice + item2.costPrice;
        const { suggested, discountPct, savings } = calculateBundlePrice(totalOrig, totalCost, 20);

        bundles.push({
          id: 'bundle_flash_sale',
          name: `Combo Siêu Sale: ${p1.name.slice(0, 24)} + ${p2.name.slice(0, 24)}`,
          strategyLabel: 'Flash Sale Siêu Hời',
          description: `Gói khuyến mãi giá sốc nhằm kích thích khách mua ngay trong các dịp mua sắm cao điểm.`,
          items: [item1, item2],
          totalOriginalPrice: totalOrig,
          suggestedPrice: suggested,
          discountPercent: discountPct,
          savingsAmount: savings,
          virtualStock: Math.min(item1.stock, item2.stock),
        });
      }
    }

    return bundles;
  }

  static fallbackPricingSuggestions(items, totalOriginalPrice, comboName, totalCostPrice = 0, enrichedItems = []) {
    const roundK = (val) => Math.round(val / 1000) * 1000;

    // Đảm bảo không bán dưới giá vốn + 5% lãi
    const floorPrice = totalCostPrice > 0 ? totalCostPrice * 1.05 : totalOriginalPrice * 0.70;

    let p15 = roundK(totalOriginalPrice * 0.85);
    let p20 = roundK(totalOriginalPrice * 0.80);
    let p10 = roundK(totalOriginalPrice * 0.90);

    if (p20 < floorPrice) p20 = roundK(floorPrice);
    if (p15 < floorPrice) p15 = roundK(floorPrice * 1.05);

    const hasSlowMoving = enrichedItems.some((it) => it.stock > 20 && it.monthlySoldQty <= 3);

    return {
      marketingTitle: comboName || `Combo Tiết Kiệm ${items.length} Món`,
      slogan: 'Mua trọn bộ - Tiết kiệm tối đa - Bảo hành chính hãng',
      analysis: `Phân tích dữ liệu: Tổng giá vốn ${totalCostPrice > 0 ? Number(totalCostPrice).toLocaleString('vi-VN') + ' đ' : 'ước tính'}. Hệ thống tự động cân đối giá combo để vừa đảm bảo biên lãi an toàn, vừa ${hasSlowMoving ? 'tối ưu giải phóng hàng tồn kho nhiều' : 'thúc đẩy giá trị trung bình trên đơn hàng'}.`,
      options: [
        {
          label: 'Gói Khuyên Dùng',
          strategy: 'best_choice',
          discountPercent: Math.round(((totalOriginalPrice - p15) / totalOriginalPrice) * 100),
          suggestedPrice: p15,
          savingsAmount: totalOriginalPrice - p15,
          reason: 'Mức giá lý tưởng được 75% khách hàng lựa chọn, cân bằng lợi nhuận và tốc độ bán.',
        },
        {
          label: 'Gói Flash Sale',
          strategy: 'flash_sale',
          discountPercent: Math.round(((totalOriginalPrice - p20) / totalOriginalPrice) * 100),
          suggestedPrice: p20,
          savingsAmount: totalOriginalPrice - p20,
          reason: 'Thích hợp cho chiến dịch xả kho hoặc kéo khách hàng mới mà vẫn giữ trên giá vốn.',
        },
        {
          label: 'Gói Tiêu Chuẩn',
          strategy: 'standard',
          discountPercent: Math.round(((totalOriginalPrice - p10) / totalOriginalPrice) * 100),
          suggestedPrice: p10,
          savingsAmount: totalOriginalPrice - p10,
          reason: 'Dành cho các mặt hàng cao cấp giữ vững giá trị thương hiệu và biên lãi cao.',
        },
      ],
    };
  }
}

module.exports = ComboService;
