const FlashSale = require('../models/flashSale.model');
const Promotion = require('../models/promotion.model');
const Coupon = require('../models/coupon.model');
const GiftProgram = require('../models/gift-program.model');
const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const { AppError } = require('../utils/AppError');
const promotionService = require('./promotion.service');
const couponService = require('./coupon.service');
const giftProgramService = require('./gift-program.service');
const flashSaleService = require('./flashSale.service');

/**
 * MASTER DISCOUNT CALCULATOR PIPELINE (Chống Xung Đột 4 Cấp Độ)
 *
 * Đường ống 4 bước:
 * Bước 1: Flash Sale (Đặc quyền giá sốc -> Đổi giá sản phẩm trực tiếp, gắn cờ isFlashSale)
 * Bước 2: Promotion (Chỉ áp dụng cho sản phẩm KHÔNG thuộc Flash Sale -> Chọn 1 Promo giảm sâu nhất)
 * Bước 3: Coupon (Mã giảm giá đơn hàng -> Áp dụng trên tổng tiền SAU KHI đã trừ Flash Sale & Promotion)
 * Bước 4: Gift Program (Chương trình tặng kèm -> Thêm các sản phẩm quà tặng 0đ vào đơn)
 */
const calculateCheckout = async ({ cartItems = [], couponCode = null }) => {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new AppError('Giỏ hàng không được để trống', 400);
  }

  // --------------------------------------------------------------------------
  // BƯỚC 1: XÁC ĐỊNH GIÁ GỐC & GIÁ FLASH SALE
  // --------------------------------------------------------------------------
  const activeFlashSale = await flashSaleService.getActiveFlashSale();
  const flashSaleItemMap = new Map();

  if (activeFlashSale && Array.isArray(activeFlashSale.items)) {
    for (const fsItem of activeFlashSale.items) {
      const pId = fsItem.productId?._id ? fsItem.productId._id.toString() : fsItem.productId?.toString();
      const vId = fsItem.variantId?._id ? fsItem.variantId._id.toString() : fsItem.variantId?.toString();
      const key = vId ? `${pId}_${vId}` : `${pId}_default`;
      flashSaleItemMap.set(key, fsItem);
    }
  }

  let subtotalOriginal = 0;
  let subtotalAfterFlashSale = 0;
  let totalFlashSaleDiscount = 0;

  const processedCartItems = await Promise.all(
    cartItems.map(async (item) => {
      const pId = item.productId?.toString();
      const vId = item.variantId?.toString();
      const qty = Number(item.quantity) || 1;

      // Tìm thông tin sản phẩm / variant từ DB nếu chưa có
      let originalPrice = Number(item.originalPrice) || 0;
      let productName = item.productName || '';
      let sku = item.sku || '';

      if (!originalPrice || !productName) {
        if (vId) {
          const variant = await ProductVariant.findById(vId).populate('productId');
          if (variant) {
            originalPrice = variant.salePrice || variant.price || 0;
            productName = variant.productId?.name || '';
            sku = variant.sku || '';
          }
        } else if (pId) {
          const prod = await Product.findById(pId);
          if (prod) {
            originalPrice = prod.salePrice || prod.price || 0;
            productName = prod.name || '';
          }
        }
      }

      const keyWithVariant = vId ? `${pId}_${vId}` : `${pId}_default`;
      const keyProductOnly = `${pId}_default`;
      const matchedFsItem = flashSaleItemMap.get(keyWithVariant) || flashSaleItemMap.get(keyProductOnly);

      let isFlashSale = false;
      let unitPrice = originalPrice;
      let flashSaleDiscount = 0;

      const fsPrice = matchedFsItem ? (matchedFsItem.flashSalePrice ?? matchedFsItem.flashPrice) : null;
      const fsStockRemaining = matchedFsItem ? Math.max(0, (matchedFsItem.stockLimit || 0) - (matchedFsItem.soldCount || 0)) : 0;

      if (matchedFsItem && fsPrice !== null && fsPrice < originalPrice && fsStockRemaining > 0) {
        isFlashSale = true;
        unitPrice = fsPrice;
        flashSaleDiscount = (originalPrice - fsPrice) * qty;
      }

      const itemSubtotal = unitPrice * qty;
      subtotalOriginal += originalPrice * qty;
      subtotalAfterFlashSale += itemSubtotal;
      totalFlashSaleDiscount += flashSaleDiscount;

      return {
        ...item,
        productId: pId,
        variantId: vId || null,
        productName,
        sku,
        quantity: qty,
        originalPrice,
        unitPrice,
        isFlashSale,
        flashSaleId: isFlashSale ? activeFlashSale._id : null,
        subtotal: itemSubtotal,
      };
    })
  );

  // --------------------------------------------------------------------------
  // BƯỚC 2: ÁP DỤNG PROMOTION (Chỉ với sản phẩm KHÔNG thuộc Flash Sale)
  // --------------------------------------------------------------------------
  const nonFlashSaleItems = processedCartItems.filter((item) => !item.isFlashSale);

  let totalPromoDiscount = 0;
  const promoAppliedItems = [];

  if (nonFlashSaleItems.length > 0) {
    const promoResult = await promotionService.applyPromotions(
      nonFlashSaleItems,
      subtotalAfterFlashSale
    );

    totalPromoDiscount = promoResult.totalDiscount || 0;

    for (const promoRes of promoResult.items) {
      if (promoRes.promotionId && promoRes.discountAmount > 0) {
        promoAppliedItems.push({
          productId: promoRes.productId,
          promotionId: promoRes.promotionId,
          promotionName: promoRes.promotionName,
          discountAmount: promoRes.discountAmount,
        });
      }
    }
  }

  const subtotalAfterPromo = Math.max(0, subtotalAfterFlashSale - totalPromoDiscount);

  // --------------------------------------------------------------------------
  // BƯỚC 3: ÁP DỤNG COUPON (Mã giảm giá tính trên subtotalAfterPromo)
  // --------------------------------------------------------------------------
  let couponDiscount = 0;
  let appliedCoupon = null;

  if (couponCode && couponCode.trim()) {
    const validated = await couponService.validateCoupon(couponCode, subtotalAfterPromo);
    couponDiscount = validated.discountAmount || 0;
    appliedCoupon = {
      ...validated.coupon,
      discountAmount: couponDiscount,
    };
  }

  const finalTotal = Math.max(0, subtotalAfterPromo - couponDiscount);

  // --------------------------------------------------------------------------
  // BƯỚC 4: TẶNG KÈM QUÀ TẶNG (Gift Program - Sản phẩm giá 0đ)
  // --------------------------------------------------------------------------
  const giftResult = await giftProgramService.applyGiftPrograms(processedCartItems);
  const giftItems = giftResult.flatMap((res) =>
    (res.gifts || []).map((g) => ({
      productId: g.productId,
      quantity: g.qty,
      unitPrice: 0,
      isGift: true,
      giftProgramId: res.giftProgramId,
      giftProgramName: res.giftProgramName,
    }))
  );

  return {
    summary: {
      subtotalOriginal,
      subtotalAfterFlashSale,
      totalFlashSaleDiscount,
      totalPromoDiscount,
      couponDiscount,
      totalDiscountAll: totalFlashSaleDiscount + totalPromoDiscount + couponDiscount,
      finalTotal,
    },
    items: processedCartItems,
    appliedPromotions: promoAppliedItems,
    appliedCoupon,
    giftItems,
    activeFlashSale: activeFlashSale
      ? { _id: activeFlashSale._id, name: activeFlashSale.name }
      : null,
  };
};

module.exports = {
  calculateCheckout,
};
