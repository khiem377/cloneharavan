const Promotion = require('../models/promotion.model');
const { AppError } = require('../utils/AppError');

const isItemInScope = (item, scope) => {
  if (scope.type === 'all') return true;
  if (scope.type === 'products')
    return scope.productIds.some((id) => id.toString() === item.productId.toString());
  if (scope.type === 'categories')
    return scope.categoryIds.some((id) => id.toString() === item.categoryId?.toString());
  return false;
};

const calcItemDiscount = (promotion, item) => {
  const { type, triggerQty, payQty, discountType, discountValue, maxDiscountValue } = promotion;
  const { quantity, unitPrice } = item;
  const lineTotal = unitPrice * quantity;
  let discount = 0;

  if (type === 'percent_discount') {
    discount = Math.round((lineTotal * discountValue) / 100);
    if (maxDiscountValue) discount = Math.min(discount, maxDiscountValue);
  } else if (type === 'fixed_discount') {
    discount = Math.min(discountValue, lineTotal);
  } else if (type === 'buy_x_pay_y') {
    if (quantity < triggerQty) return 0;
    const freeSets = Math.floor(quantity / triggerQty);
    const freeUnits = freeSets * (triggerQty - payQty);
    discount = freeUnits * unitPrice;
  } else if (type === 'quantity_discount') {
    if (quantity < triggerQty) return 0;
    if (discountType === 'percent') {
      discount = Math.round((lineTotal * discountValue) / 100);
      if (maxDiscountValue) discount = Math.min(discount, maxDiscountValue);
    } else if (discountType === 'fixed') {
      discount = Math.min(discountValue * quantity, lineTotal);
    }
  }

  return discount;
};

const getAllPromotions = async (query = {}) => {
  const filter = {};
  if (query.keyword) filter.name = { $regex: query.keyword, $options: 'i' };
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
  if (query.type) filter.type = query.type;

  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, parseInt(query.limit) || 10);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Promotion.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Promotion.countDocuments(filter),
  ]);

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
};

const getPromotionById = async (id) => {
  const promotion = await Promotion.findById(id)
    .populate('scope.productIds', 'name thumbnail')
    .populate('scope.categoryIds', 'name');
  if (!promotion) throw new AppError('Không tìm thấy chương trình khuyến mãi', 404);
  return promotion;
};

const createPromotion = async (data) => {
  return Promotion.create(data);
};

const updatePromotion = async (id, data) => {
  const promotion = await Promotion.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!promotion) throw new AppError('Không tìm thấy chương trình khuyến mãi', 404);
  return promotion;
};

const deletePromotion = async (id) => {
  const promotion = await Promotion.findByIdAndDelete(id);
  if (!promotion) throw new AppError('Không tìm thấy chương trình khuyến mãi', 404);
};

const togglePromotionStatus = async (id, isActive) => {
  const promotion = await Promotion.findByIdAndUpdate(id, { isActive }, { new: true });
  if (!promotion) throw new AppError('Không tìm thấy chương trình khuyến mãi', 404);
  return promotion;
};

const deleteBulkPromotions = async (ids) => {
  if (!ids || !ids.length) throw new AppError('Không có chương trình nào được chọn', 400);
  const result = await Promotion.deleteMany({ _id: { $in: ids } });
  return { deleted: result.deletedCount };
};

const applyPromotions = async (cartItems, orderTotal) => {
  const now = new Date();
  const promotions = await Promotion.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    $or: [{ usageLimit: null }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }],
  });

  const result = cartItems.map((item) => {
    const applicable = promotions.filter((p) => {
      if (!isItemInScope(item, p.scope)) return false;
      if (p.minOrderValue && orderTotal < p.minOrderValue) return false;
      return true;
    });

    if (!applicable.length) return { productId: item.productId, promotionId: null, discountAmount: 0 };

    let bestDiscount = 0;
    let bestPromo = null;

    for (const promo of applicable) {
      const discount = calcItemDiscount(promo, item);
      if (discount > bestDiscount) {
        bestDiscount = discount;
        bestPromo = promo;
      }
    }

    return {
      productId: item.productId,
      promotionId: bestPromo?._id || null,
      promotionName: bestPromo?.name || null,
      discountAmount: bestDiscount,
    };
  });

  const totalDiscount = result.reduce((sum, r) => sum + r.discountAmount, 0);
  return { items: result, totalDiscount };
};

const markPromotionsUsed = async (promotionIds) => {
  if (!promotionIds || !promotionIds.length) return;
  const uniqueIds = [...new Set(promotionIds.map(String))];

  await Promise.all(
    uniqueIds.map((id) =>
      Promotion.findOneAndUpdate(
        {
          _id: id,
          $or: [
            { usageLimit: null },
            { $expr: { $lt: ['$usedCount', '$usageLimit'] } },
          ],
        },
        { $inc: { usedCount: 1 } }
      )
    )
  );
};

module.exports = {
  getAllPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
  deleteBulkPromotions,
  togglePromotionStatus,
  applyPromotions,
  markPromotionsUsed,
};
