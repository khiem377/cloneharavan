const mongoose = require('mongoose');
const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const ProductVariant = require('../models/productVariant.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const { AppError } = require('../utils/AppError');
const { getSellingPrice } = require('../utils/pricing.helper');
const couponService = require('./coupon.service');
const flashSaleService = require('./flashSale.service');
const giftProgramService = require('./gift-program.service');
const ghnService = require('./ghn.service');

/**
 * Helper sinh mã đơn hàng độc nhất: ORD-YYYYMMDD-XXXX
 */
const generateOrderCode = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${dateStr}-${rand}`;
};

/**
 * Runner thực thi Transaction an toàn với rollback và retry khi có WriteConflict
 */
const withTransaction = async (work, maxRetries = 3) => {
  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const result = await work(session);
      await session.commitTransaction();
      return result;
    } catch (err) {
      if (session.inTransaction()) {
        try {
          await session.abortTransaction();
        } catch (_) {}
      }
      const isTransient =
        err.hasErrorLabel &&
        (err.hasErrorLabel('TransientTransactionError') || err.hasErrorLabel('UnknownTransactionCommitResult'));
      const isWriteConflict = err.code === 112 || (err.message && err.message.includes('WriteConflict'));

      if ((isTransient || isWriteConflict) && attempt < maxRetries) {
        console.warn(`[Transaction Retry] Gặp lỗi tạm thời (attempt ${attempt}/${maxRetries}): ${err.message}. Đang thử lại...`);
        await new Promise((resolve) => setTimeout(resolve, 100 * attempt));
        continue;
      }
      throw err;
    } finally {
      session.endSession();
    }
  }
};

/**
 * 0. KIỂM TRA ĐƠN HÀNG TRƯỚC KHI ĐẶT (PREVIEW ORDER)
 * - Chế độ Read-only, KHÔNG thay đổi DB, KHÔNG giữ chỗ kho
 * - Single source of truth: Re-check giá, tồn kho khả dụng (stock - allocated), Flash Sale
 * - Re-check Quà tặng kèm (Gift Program)
 * - Re-check Coupon
 * - Tính cước vận chuyển thực tế từ GHN nếu có thông tin địa chỉ
 * - Kiểm tra địa chỉ mặc định (không tự ép địa chỉ đầu tiên nếu chưa set isDefault)
 */
const previewOrder = async (userId, previewData = {}) => {
  if (!userId) {
    throw new AppError('Vui lòng đăng nhập để xem thông tin đơn hàng', 401);
  }

  const { addressId, shippingAddress: customAddress, couponCode, buyNowItem, items: directItems, itemIds } = previewData;

  const user = await User.findById(userId);
  if (!user) throw new AppError('Không tìm thấy tài khoản người dùng', 404);

  // 1. Xác định địa chỉ giao hàng
  let finalShippingAddress = null;
  let requiresAddressConfirmation = false;
  let addressWarning = null;

  if (addressId) {
    const matchedAddr = user.addresses.id(addressId);
    if (matchedAddr) {
      finalShippingAddress = {
        _id: matchedAddr._id,
        fullName: matchedAddr.fullName,
        phone: matchedAddr.phone,
        province: matchedAddr.province,
        district: matchedAddr.district,
        ward: matchedAddr.ward,
        detailAddress: matchedAddr.detailAddress,
        districtId: matchedAddr.districtId || null,
        wardCode: matchedAddr.wardCode || null,
        isDefault: Boolean(matchedAddr.isDefault),
      };
    }
  } else if (customAddress && customAddress.fullName && customAddress.phone && customAddress.detailAddress) {
    finalShippingAddress = {
      fullName: customAddress.fullName,
      phone: customAddress.phone,
      province: customAddress.province,
      district: customAddress.district,
      ward: customAddress.ward,
      detailAddress: customAddress.detailAddress,
      districtId: customAddress.districtId || customAddress.toDistrictId || null,
      wardCode: customAddress.wardCode || customAddress.toWardCode || null,
    };
  } else {
    // Chỉ lấy nếu có isDefault: true, KHÔNG tự ý bốc địa chỉ đầu tiên
    const defaultAddr = user.addresses.find((a) => a.isDefault);
    if (defaultAddr) {
      finalShippingAddress = {
        _id: defaultAddr._id,
        fullName: defaultAddr.fullName,
        phone: defaultAddr.phone,
        province: defaultAddr.province,
        district: defaultAddr.district,
        ward: defaultAddr.ward,
        detailAddress: defaultAddr.detailAddress,
        districtId: defaultAddr.districtId || null,
        wardCode: defaultAddr.wardCode || null,
        isDefault: true,
      };
    } else {
      requiresAddressConfirmation = true;
      addressWarning = user.addresses.length > 0
        ? 'Bạn chưa thiết lập địa chỉ mặc định. Vui lòng xác nhận địa chỉ nhận hàng trước khi đặt.'
        : 'Bạn chưa có địa chỉ nhận hàng. Vui lòng thêm địa chỉ nhận hàng.';
    }
  }

  // 2. Danh sách mặt hàng
  const isBuyNow = Boolean(buyNowItem || (Array.isArray(directItems) && directItems.length > 0));
  let rawItems = [];
  let userCart = null;

  if (isBuyNow) {
    if (buyNowItem) {
      if (!buyNowItem.variantId) {
        throw new AppError('Thiếu thông tin biến thể sản phẩm (variantId) khi mua ngay', 400);
      }
      rawItems = [{ variantId: buyNowItem.variantId, quantity: Number(buyNowItem.quantity) || 1 }];
    } else {
      rawItems = directItems;
    }
  } else {
    userCart = await Cart.findOne({ userId });
    if (!userCart || !userCart.items || userCart.items.length === 0) {
      rawItems = [];
    } else if (Array.isArray(itemIds) && itemIds.length > 0) {
      const idSet = new Set(itemIds.map((id) => String(id)));
      rawItems = userCart.items.filter(
        (it) => idSet.has(String(it._id)) || idSet.has(String(it.variantId))
      );
    } else {
      rawItems = userCart.items;
    }
  }

  if (rawItems.length === 0) {
    return {
      canCheckout: false,
      items: [],
      gifts: [],
      pricing: {
        subtotal: 0,
        couponDiscount: 0,
        couponCode: null,
        shippingFee: 0,
        totalAmount: 0,
      },
      shippingAddress: finalShippingAddress,
      suggestedAddress: (!finalShippingAddress && user.addresses.length > 0) ? user.addresses[0] : null,
      requiresAddressConfirmation,
      warnings: ['Giỏ hàng của bạn đang trống'],
      errors: ['Không có sản phẩm nào để kiểm tra đơn hàng'],
    };
  }

  // 3. Chuẩn bị Flash Sale Map
  const activeFlashSale = await flashSaleService.getActiveFlashSale();
  const flashSaleMap = new Map();
  if (activeFlashSale && Array.isArray(activeFlashSale.items)) {
    for (const fsItem of activeFlashSale.items) {
      const pId = fsItem.productId?._id ? fsItem.productId._id.toString() : fsItem.productId?.toString();
      const vId = fsItem.variantId?._id ? fsItem.variantId._id.toString() : fsItem.variantId?.toString();
      const key = vId ? `${pId}_${vId}` : `${pId}_default`;
      flashSaleMap.set(key, fsItem);
    }
  }

  // 4. Re-check giá và tồn kho từng item
  const previewItems = [];
  let totalSubtotal = 0;
  let canCheckout = true;
  const warnings = [];
  const errors = [];
  if (addressWarning) warnings.push(addressWarning);

  for (const item of rawItems) {
    const variant = await ProductVariant.findById(item.variantId).populate('productId');
    if (!variant || !variant.productId) {
      canCheckout = false;
      errors.push(`Sản phẩm (ID: ${item.variantId}) không tồn tại hoặc đã bị xóa`);
      continue;
    }

    const product = variant.productId;
    if (product.isActive === false || variant.isActive === false) {
      canCheckout = false;
      errors.push(`Sản phẩm "${product.name}" hiện đang tạm ngừng kinh doanh`);
      continue;
    }

    const qty = Number(item.quantity) || 1;
    const availableStock = Math.max(0, (variant.stock || 0) - (variant.allocated || 0));

    let itemAvailable = true;
    if (availableStock < qty) {
      canCheckout = false;
      itemAvailable = false;
      if (availableStock <= 0) {
        errors.push(`Sản phẩm "${product.name} (${variant.displayName || variant.sku})" đã hết hàng`);
      } else {
        errors.push(`Sản phẩm "${product.name} (${variant.displayName || variant.sku})" chỉ còn ${availableStock} cái trong kho, không đủ số lượng ${qty}`);
      }
    }

    const originalPrice = Number(variant.price) || 0;
    let unitPrice = getSellingPrice(variant);

    const fsKey = `${product._id.toString()}_${variant._id.toString()}`;
    const fsKeyProduct = `${product._id.toString()}_default`;
    const matchedFs = flashSaleMap.get(fsKey) || flashSaleMap.get(fsKeyProduct);

    let isFlashSale = false;
    if (matchedFs) {
      const fsPrice = matchedFs.flashSalePrice ?? matchedFs.flashPrice;
      const fsStock = Math.max(0, (matchedFs.stockLimit || 0) - (matchedFs.soldCount || 0));
      if (fsPrice !== null && fsPrice < unitPrice && fsStock >= qty) {
        unitPrice = fsPrice;
        isFlashSale = true;
      }
    }

    const itemSubtotal = unitPrice * qty;
    totalSubtotal += itemSubtotal;

    previewItems.push({
      productId: product._id,
      variantId: variant._id,
      productName: product.name,
      variantName: variant.displayName || '',
      sku: variant.sku || '',
      thumbnail: variant.thumbnail?.url || product.thumbnail?.url || '',
      attributes: variant.attributes || [],
      originalPrice,
      salePrice: variant.salePrice ?? null,
      unitPrice,
      quantity: qty,
      subtotal: itemSubtotal,
      availableStock,
      isAvailable: itemAvailable,
      isFlashSale,
    });
  }

  // 5. Quà tặng kèm (Gift Program)
  const nonFsCartItems = previewItems
    .filter((it) => it.isAvailable)
    .map((it) => ({
      productId: it.productId,
      variantId: it.variantId,
      quantity: it.quantity,
      productName: it.productName,
      unitPrice: it.unitPrice,
      originalPrice: it.originalPrice,
    }));

  const giftResult = await giftProgramService.applyGiftPrograms(nonFsCartItems);
  const giftsPreview = [];

  if (giftResult && Array.isArray(giftResult.appliedGifts)) {
    for (const applied of giftResult.appliedGifts) {
      for (const g of applied.gifts || []) {
        if (!g.variantId || g.qty <= 0) continue;
        const giftVariant = await ProductVariant.findById(g.variantId).populate('productId');
        if (!giftVariant) continue;

        giftsPreview.push({
          productId: giftVariant.productId?._id || giftVariant.productId,
          variantId: giftVariant._id,
          productName: g.name || giftVariant.productId?.name || 'Quà tặng',
          variantName: giftVariant.displayName || '',
          sku: giftVariant.sku || '',
          thumbnail: g.thumbnail || giftVariant.thumbnail?.url || '',
          quantity: g.qty,
          unitPrice: 0,
          originalPrice: g.originalPrice || Number(giftVariant.price) || 0,
          giftProgramId: applied.giftProgramId,
          giftProgramName: applied.giftProgramName,
        });
      }
    }
  }

  // 6. Mã giảm giá
  let appliedCouponCode = null;
  let totalCouponDiscount = 0;
  if (!userCart && userId) {
    userCart = await Cart.findOne({ userId });
  }
  const codeToValidate = couponCode !== undefined ? couponCode : (userCart?.couponCode || null);
  if (codeToValidate && typeof codeToValidate === 'string' && codeToValidate.trim()) {
    try {
      const couponRes = await couponService.validateCoupon(codeToValidate.trim(), totalSubtotal);
      totalCouponDiscount = couponRes.discountAmount || 0;
      appliedCouponCode = couponRes.coupon.code;
    } catch (couponErr) {
      warnings.push(`Mã giảm giá "${codeToValidate}": ${couponErr.message}`);
    }
  }

  // 7. Cước vận chuyển GHN
  let shippingFee = 0;
  let shippingInfo = {
    fee: 0,
    isEstimated: false,
    source: 'NONE',
    message: 'Chưa có thông tin địa chỉ để tính phí ship',
  };

  let targetDistrictId = finalShippingAddress?.districtId || finalShippingAddress?.toDistrictId;
  let targetWardCode = finalShippingAddress?.wardCode || finalShippingAddress?.toWardCode;

  // Tự động phân giải mã GHN từ tên địa giới nếu địa chỉ lưu chưa có mã bưu chính
  if ((!targetDistrictId || !targetWardCode) && finalShippingAddress?.province && finalShippingAddress?.ward) {
    try {
      const resolved = await ghnService.resolveAddressGhnCodes({
        province: finalShippingAddress.province,
        district: finalShippingAddress.district,
        ward: finalShippingAddress.ward,
      });
      if (resolved?.districtId && resolved?.wardCode) {
        targetDistrictId = resolved.districtId;
        targetWardCode = resolved.wardCode;
        finalShippingAddress.provinceId = resolved.provinceId;
        finalShippingAddress.districtId = resolved.districtId;
        finalShippingAddress.wardCode = resolved.wardCode;

        if (userId && (finalShippingAddress._id || addressId)) {
          const addrIdToUpdate = finalShippingAddress._id || addressId;
          User.updateOne(
            { _id: userId, 'addresses._id': addrIdToUpdate },
            {
              $set: {
                'addresses.$.provinceId': resolved.provinceId,
                'addresses.$.districtId': resolved.districtId,
                'addresses.$.wardCode': resolved.wardCode,
              },
            }
          ).catch(() => {});
        }
      }
    } catch (resolveErr) {
      console.warn('[Order Service] Không thể tự động phân giải mã GHN:', resolveErr.message);
    }
  }

  if (targetDistrictId && targetWardCode) {
    const feeRes = await ghnService.calculateShippingFee({
      toDistrictId: targetDistrictId,
      toWardCode: targetWardCode,
      weight: previewItems.reduce((acc, it) => acc + (it.quantity * 300), 200),
      insuranceValue: Math.max(0, totalSubtotal - totalCouponDiscount),
      allowEstimatedFallback: true,
    });

    if (feeRes.success) {
      shippingFee = feeRes.fee || 0;
      shippingInfo = feeRes;
      if (feeRes.isEstimated) {
        warnings.push(feeRes.message);
      }
    } else {
      warnings.push(`Không thể tính cước GHN: ${feeRes.message}`);
    }
  } else if (finalShippingAddress) {
    warnings.push('Địa chỉ giao hàng chưa có mã Quận/Phường GHN, cước vận chuyển sẽ được xác nhận khi đặt hàng.');
  }

  const finalTotalAmount = Math.max(0, totalSubtotal - totalCouponDiscount + shippingFee);

  if (requiresAddressConfirmation) {
    canCheckout = false;
  }

  return {
    canCheckout,
    items: previewItems,
    gifts: giftsPreview,
    pricing: {
      subtotal: totalSubtotal,
      couponDiscount: totalCouponDiscount,
      couponCode: appliedCouponCode,
      shippingFee,
      totalAmount: finalTotalAmount,
    },
    shippingInfo,
    shippingAddress: finalShippingAddress,
    suggestedAddress: (!finalShippingAddress && user.addresses.length > 0) ? user.addresses[0] : null,
    requiresAddressConfirmation,
    warnings,
    errors,
  };
};

/**
 * 1. TẠO ĐƠN HÀNG COD (CHECKOUT COD)
 * - BE re-check giá từ DB (Single Source of Truth)
 * - BE re-check tồn kho khả dụng (stock - allocated)
 * - Chống race condition: Atomic update với $expr điều kiện
 * - Chống tạo đơn trùng lặp (Idempotency Guard)
 * - Không tự ý lấy địa chỉ đầu tiên nếu chưa set isDefault
 * - Tính phí ship GHN thực tế
 * - Bọc trong MongoDB Transaction với retry an toàn
 */
const createOrderCOD = async (userId, orderData) => {
  if (!userId) {
    throw new AppError('Vui lòng đăng nhập tài khoản để tiến hành đặt hàng', 401);
  }

  const { addressId, shippingAddress: customAddress, couponCode, note = '', buyNowItem, items: directItems, itemIds } = orderData;

  // 1. Xác định người dùng & Địa chỉ giao hàng
  const user = await User.findById(userId);
  if (!user) throw new AppError('Không tìm thấy tài khoản người dùng', 404);

  let finalShippingAddress = null;

  if (addressId) {
    const matchedAddr = user.addresses.id(addressId);
    if (!matchedAddr) throw new AppError('Địa chỉ giao hàng đã chọn không tồn tại', 404);
    finalShippingAddress = {
      fullName: matchedAddr.fullName,
      phone: matchedAddr.phone,
      province: matchedAddr.province,
      district: matchedAddr.district,
      ward: matchedAddr.ward,
      detailAddress: matchedAddr.detailAddress,
      districtId: matchedAddr.districtId || null,
      wardCode: matchedAddr.wardCode || null,
    };
  } else if (customAddress && customAddress.fullName && customAddress.phone && customAddress.detailAddress) {
    finalShippingAddress = {
      fullName: customAddress.fullName,
      phone: customAddress.phone,
      province: customAddress.province,
      district: customAddress.district,
      ward: customAddress.ward,
      detailAddress: customAddress.detailAddress,
      districtId: customAddress.districtId || customAddress.toDistrictId || null,
      wardCode: customAddress.wardCode || customAddress.toWardCode || null,
    };
  } else {
    // Chỉ lấy nếu có isDefault: true, KHÔNG tự ý bốc địa chỉ đầu tiên
    const defaultAddr = user.addresses.find((a) => a.isDefault);
    if (!defaultAddr) {
      throw new AppError(
        user.addresses.length > 0
          ? 'Tài khoản chưa có địa chỉ mặc định. Vui lòng chọn và xác nhận địa chỉ giao hàng trước khi đặt hàng'
          : 'Vui lòng cung cấp hoặc tạo địa chỉ giao hàng trước khi đặt hàng',
        400
      );
    }
    finalShippingAddress = {
      fullName: defaultAddr.fullName,
      phone: defaultAddr.phone,
      province: defaultAddr.province,
      district: defaultAddr.district,
      ward: defaultAddr.ward,
      detailAddress: defaultAddr.detailAddress,
      districtId: defaultAddr.districtId || null,
      wardCode: defaultAddr.wardCode || null,
    };
  }

  // 2. Xác định danh sách mặt hàng: Hỗ trợ cả "Mua Ngay" (Buy Now) lẫn "Đặt từ Giỏ hàng"
  const isBuyNow = Boolean(buyNowItem || (Array.isArray(directItems) && directItems.length > 0));
  let rawItems = [];
  let userCart = null;

  if (isBuyNow) {
    if (buyNowItem) {
      if (!buyNowItem.variantId) {
        throw new AppError('Thiếu thông tin biến thể sản phẩm (variantId) khi mua ngay', 400);
      }
      rawItems = [{ variantId: buyNowItem.variantId, quantity: Number(buyNowItem.quantity) || 1 }];
    } else {
      rawItems = directItems;
    }
  } else {
    // Lấy từ giỏ hàng của User
    userCart = await Cart.findOne({ userId });
    if (!userCart || !userCart.items || userCart.items.length === 0) {
      throw new AppError('Giỏ hàng của bạn đang trống, không thể đặt hàng', 400);
    }
    if (Array.isArray(itemIds) && itemIds.length > 0) {
      const idSet = new Set(itemIds.map((id) => String(id)));
      rawItems = userCart.items.filter(
        (it) => idSet.has(String(it._id)) || idSet.has(String(it.variantId))
      );
      if (rawItems.length === 0) {
        throw new AppError('Không tìm thấy các sản phẩm đã chọn trong giỏ hàng', 400);
      }
    } else {
      rawItems = userCart.items;
    }
  }

  // 3. Chuẩn bị Flash Sale Map
  const activeFlashSale = await flashSaleService.getActiveFlashSale();
  const flashSaleMap = new Map();
  if (activeFlashSale && Array.isArray(activeFlashSale.items)) {
    for (const fsItem of activeFlashSale.items) {
      const pId = fsItem.productId?._id ? fsItem.productId._id.toString() : fsItem.productId?.toString();
      const vId = fsItem.variantId?._id ? fsItem.variantId._id.toString() : fsItem.variantId?.toString();
      const key = vId ? `${pId}_${vId}` : `${pId}_default`;
      flashSaleMap.set(key, fsItem);
    }
  }

  // 4. Re-check giá và tồn kho từng item từ Database
  const orderItemsData = [];
  let totalSubtotal = 0;

  for (const item of rawItems) {
    const variant = await ProductVariant.findById(item.variantId).populate('productId');
    if (!variant || !variant.productId) {
      throw new AppError('Một hoặc nhiều sản phẩm trong giỏ hàng không còn tồn tại trên hệ thống', 400);
    }

    const product = variant.productId;
    if (product.isActive === false || variant.isActive === false) {
      throw new AppError(`Sản phẩm "${product.name}" hiện đang tạm ngừng kinh doanh`, 400);
    }

    const qty = Number(item.quantity) || 1;
    const availableStock = Math.max(0, (variant.stock || 0) - (variant.allocated || 0));

    if (availableStock < qty) {
      throw new AppError(
        `Sản phẩm "${product.name} (${variant.displayName || variant.sku})" chỉ còn ${availableStock} cái trong kho, không đủ số lượng ${qty} cái để đặt hàng`,
        400
      );
    }

    // Giá niêm yết gốc
    const originalPrice = Number(variant.price) || 0;
    // Giá bán thực tế cơ sở
    let unitPrice = getSellingPrice(variant);

    // Kiểm tra ưu đãi Flash Sale
    const fsKey = `${product._id.toString()}_${variant._id.toString()}`;
    const fsKeyProduct = `${product._id.toString()}_default`;
    const matchedFs = flashSaleMap.get(fsKey) || flashSaleMap.get(fsKeyProduct);

    if (matchedFs) {
      const fsPrice = matchedFs.flashSalePrice ?? matchedFs.flashPrice;
      const fsStock = Math.max(0, (matchedFs.stockLimit || 0) - (matchedFs.soldCount || 0));
      if (fsPrice !== null && fsPrice < unitPrice && fsStock >= qty) {
        unitPrice = fsPrice;
      }
    }

    const itemSubtotal = unitPrice * qty;
    totalSubtotal += itemSubtotal;

    orderItemsData.push({
      productId: product._id,
      variantId: variant._id,
      productName: product.name,
      variantName: variant.displayName || '',
      sku: variant.sku || '',
      thumbnail: variant.thumbnail?.url || product.thumbnail?.url || '',
      attributes: variant.attributes || [],
      originalPrice,
      salePrice: variant.salePrice ?? null,
      unitPrice,
      quantity: qty,
      subtotal: itemSubtotal,
      couponDiscountAllocated: 0,
      lineTotal: itemSubtotal,
      isGift: false,
    });
  }

  // 4b. TÍNH TOÁN VÀ ĐÍNH KÈM QUÀ TẶNG (GIFT PROGRAM)
  const nonFsCartItems = orderItemsData
    .filter((it) => !it.isGift)
    .map((it) => ({
      productId: it.productId,
      variantId: it.variantId,
      quantity: it.quantity,
      productName: it.productName,
      unitPrice: it.unitPrice,
      originalPrice: it.originalPrice,
    }));

  const giftResult = await giftProgramService.applyGiftPrograms(nonFsCartItems);
  const giftProgramsUsed = [];

  if (giftResult && Array.isArray(giftResult.appliedGifts)) {
    for (const applied of giftResult.appliedGifts) {
      if (applied.setsApplied > 0) {
        giftProgramsUsed.push({
          giftProgramId: applied.giftProgramId,
          setsApplied: applied.setsApplied,
        });
      }

      for (const g of applied.gifts || []) {
        if (!g.variantId || g.qty <= 0) continue;
        const giftVariant = await ProductVariant.findById(g.variantId).populate('productId');
        if (!giftVariant) continue;

        orderItemsData.push({
          productId: giftVariant.productId?._id || giftVariant.productId,
          variantId: giftVariant._id,
          productName: g.name || giftVariant.productId?.name || 'Quà tặng',
          variantName: giftVariant.displayName || '',
          sku: giftVariant.sku || '',
          thumbnail: g.thumbnail || giftVariant.thumbnail?.url || '',
          attributes: giftVariant.attributes || [],
          originalPrice: g.originalPrice || Number(giftVariant.price) || 0,
          salePrice: 0,
          unitPrice: 0,
          quantity: g.qty,
          subtotal: 0,
          couponDiscountAllocated: 0,
          lineTotal: 0,
          isGift: true,
          giftProgramId: applied.giftProgramId,
          giftProgramName: applied.giftProgramName,
        });
      }
    }
  }

  // 5. Re-check Coupon từ Database (Cấm tin số tiền giảm từ FE)
  let appliedCouponCode = null;
  let totalCouponDiscount = 0;
  let couponDoc = null;

  if (!userCart && userId) {
    userCart = await Cart.findOne({ userId });
  }
  const codeToValidate = couponCode !== undefined ? couponCode : (userCart?.couponCode || null);
  if (codeToValidate && typeof codeToValidate === 'string' && codeToValidate.trim()) {
    const couponRes = await couponService.validateCoupon(codeToValidate.trim(), totalSubtotal);
    totalCouponDiscount = couponRes.discountAmount || 0;
    appliedCouponCode = couponRes.coupon.code;
    couponDoc = couponRes.coupon;
  }

  // 6. Phân bổ Coupon Discount (Prorated Allocation) cho từng Line Item (chỉ item trả phí)
  if (totalCouponDiscount > 0 && totalSubtotal > 0) {
    const paidItems = orderItemsData.filter((it) => !it.isGift);
    let allocatedSum = 0;
    for (let i = 0; i < paidItems.length; i++) {
      const it = paidItems[i];
      if (i === paidItems.length - 1) {
        // Món cuối cùng nhận phần còn lại để tránh chênh lệch do làm tròn
        it.couponDiscountAllocated = Math.max(0, totalCouponDiscount - allocatedSum);
      } else {
        const itemShare = Math.round((it.subtotal / totalSubtotal) * totalCouponDiscount);
        it.couponDiscountAllocated = itemShare;
        allocatedSum += itemShare;
      }
      it.lineTotal = Math.max(0, it.subtotal - it.couponDiscountAllocated);
    }
  }

  let shippingFee = 0;
  let targetDistrictId = finalShippingAddress.districtId || finalShippingAddress.toDistrictId;
  let targetWardCode = finalShippingAddress.wardCode || finalShippingAddress.toWardCode;

  // Tự động phân giải mã GHN từ tên địa giới nếu địa chỉ lưu chưa có mã bưu chính
  if ((!targetDistrictId || !targetWardCode) && finalShippingAddress?.province && finalShippingAddress?.ward) {
    try {
      const resolved = await ghnService.resolveAddressGhnCodes({
        province: finalShippingAddress.province,
        district: finalShippingAddress.district,
        ward: finalShippingAddress.ward,
      });
      if (resolved?.districtId && resolved?.wardCode) {
        targetDistrictId = resolved.districtId;
        targetWardCode = resolved.wardCode;
        finalShippingAddress.provinceId = resolved.provinceId;
        finalShippingAddress.districtId = resolved.districtId;
        finalShippingAddress.wardCode = resolved.wardCode;

        if (userId && (finalShippingAddress._id || addressId)) {
          const addrIdToUpdate = finalShippingAddress._id || addressId;
          User.updateOne(
            { _id: userId, 'addresses._id': addrIdToUpdate },
            {
              $set: {
                'addresses.$.provinceId': resolved.provinceId,
                'addresses.$.districtId': resolved.districtId,
                'addresses.$.wardCode': resolved.wardCode,
              },
            }
          ).catch(() => {});
        }
      }
    } catch (resolveErr) {
      console.warn('[Order Service] Không thể tự động phân giải mã GHN khi tạo đơn:', resolveErr.message);
    }
  }

  if (targetDistrictId && targetWardCode) {
    try {
      const feeRes = await ghnService.calculateShippingFee({
        toDistrictId: targetDistrictId,
        toWardCode: targetWardCode,
        weight: orderItemsData.reduce((acc, it) => acc + (it.quantity * 300), 200),
        insuranceValue: Math.max(0, totalSubtotal - totalCouponDiscount),
        allowEstimatedFallback: true,
      });
      if (feeRes.success && feeRes.fee) {
        shippingFee = feeRes.fee;
      }
    } catch (shipErr) {
      console.warn('[Order Service] Lỗi tính cước GHN khi tạo đơn:', shipErr.message);
    }
  } else if (orderData.shippingFee !== undefined && Number(orderData.shippingFee) >= 0) {
    shippingFee = Number(orderData.shippingFee);
  }

  const finalTotalAmount = Math.max(0, totalSubtotal - totalCouponDiscount + shippingFee);

  // 6b. Chống tạo đơn trùng lặp (Idempotency Guard trong vòng 10 giây)
  const tenSecondsAgo = new Date(Date.now() - 10000);
  const recentDuplicate = await Order.findOne({
    userId,
    orderStatus: 'PENDING',
    paymentMethod: 'COD',
    paymentStatus: 'UNPAID',
    'pricing.subtotal': totalSubtotal,
    createdAt: { $gte: tenSecondsAgo },
  });

  if (recentDuplicate) {
    console.log(`[Order Service] Phát hiện đơn hàng trùng lặp gần đây (${recentDuplicate.orderCode}), trả về đơn đã tạo.`);
    return recentDuplicate;
  }

  const orderCode = generateOrderCode();

  // 7. THỰC THI TRANSACTION MONGODB (ACID)
  const createdOrder = await withTransaction(async (session) => {
    // 7.1. Atomic check & Giữ chỗ kho hàng: allocated += qty (cho cả sản phẩm chính lẫn quà tặng)
    for (const it of orderItemsData) {
      const updatedVariant = await ProductVariant.findOneAndUpdate(
        {
          _id: it.variantId,
          $expr: {
            $gte: [{ $subtract: ['$stock', '$allocated'] }, it.quantity],
          },
        },
        {
          $inc: { allocated: it.quantity },
        },
        { session, new: true }
      );

      if (!updatedVariant) {
        throw new AppError(
          `Sản phẩm "${it.productName}" vừa hết hàng hoặc không đủ tồn kho để giữ chỗ. Vui lòng kiểm tra lại giỏ hàng`,
          400
        );
      }
    }

    // 7.2. Tăng số lượt dùng của Coupon
    if (couponDoc) {
      await couponService.applyCoupon(couponDoc._id, totalSubtotal, session);
    }

    // 7.2b. Tăng số lượt dùng (Quota) của Chương trình Quà tặng kèm
    if (giftProgramsUsed.length > 0) {
      await giftProgramService.markGiftProgramsUsed(giftProgramsUsed, session);
    }

    // 7.3. Tạo bản ghi Đơn hàng (Snapshot đóng băng bất biến)
    const [order] = await Order.create(
      [
        {
          orderCode,
          userId,
          items: orderItemsData,
          shippingAddress: finalShippingAddress,
          paymentMethod: 'COD',
          paymentStatus: 'UNPAID',
          orderStatus: 'PENDING',
          pricing: {
            subtotal: totalSubtotal,
            shippingFee,
            couponCode: appliedCouponCode,
            couponDiscount: totalCouponDiscount,
            totalAmount: finalTotalAmount,
          },
          note,
          statusHistory: [
            {
              status: 'PENDING',
              note: isBuyNow
                ? 'Đơn hàng Mua Ngay (COD) được tạo thành công, hàng đã được giữ chỗ trong kho.'
                : 'Đơn hàng COD được tạo từ giỏ hàng, hàng đã được giữ chỗ trong kho.',
              changedAt: new Date(),
              changedBy: userId,
            },
          ],
        },
      ],
      { session }
    );

    // 7.4. Xóa sạch các mặt hàng vừa đặt khỏi giỏ hàng (Chỉ xóa các sản phẩm vừa mua)
    const orderedVariantIds = orderItemsData.map((it) => it.variantId);
    await Cart.updateOne(
      { userId },
      {
        $pull: { items: { variantId: { $in: orderedVariantIds } } },
        $set: { couponCode: null, lastValidatedAt: new Date() },
      },
      { session }
    );

    return order;
  });

  return createdOrder;
};

/**
 * 2. KHÁCH / SHOP HỦY ĐƠN HÀNG (CANCEL ORDER)
 * - Chỉ hủy khi đơn đang ở PENDING hoặc CONFIRMED
 * - Atomic conditional locking chống race condition: chỉ hủy và hoàn kho/coupon ĐÚNG 1 LẦN
 * - Nhả tồn kho giữ chỗ: allocated -= qty
 * - Hoàn lại lượt dùng Coupon
 */
const cancelOrder = async (orderId, userId, reason = '', userRole = 'user') => {
  const existingOrder = await Order.findById(orderId);
  if (!existingOrder) throw new AppError('Không tìm thấy đơn hàng', 404);

  // Kiểm tra quyền hủy (Khách hàng sở hữu đơn hoặc Nhân viên/Admin)
  const isStaffOrAdmin = userRole !== 'user';
  if (!isStaffOrAdmin && userId && existingOrder.userId && existingOrder.userId.toString() !== userId.toString()) {
    throw new AppError('Bạn không có quyền hủy đơn hàng này', 403);
  }

  if (!['PENDING', 'CONFIRMED'].includes(existingOrder.orderStatus)) {
    throw new AppError(
      `Không thể hủy đơn hàng đang ở trạng thái "${existingOrder.orderStatus}". Chỉ được hủy khi đơn đang chờ xác nhận hoặc chuẩn bị hàng`,
      400
    );
  }

  const cancelledOrder = await withTransaction(async (session) => {
    // ATOMIC LOCK: Chỉ update nếu orderStatus vẫn còn là PENDING hoặc CONFIRMED
    const lockedOrder = await Order.findOneAndUpdate(
      {
        _id: orderId,
        orderStatus: { $in: ['PENDING', 'CONFIRMED'] },
      },
      {
        $set: {
          orderStatus: 'CANCELLED',
          cancelReason: reason || 'Khách hàng / Cửa hàng yêu cầu hủy đơn',
          cancelledAt: new Date(),
          cancelledBy: userId || null,
        },
        $push: {
          statusHistory: {
            status: 'CANCELLED',
            note: `Hủy đơn thành công: ${reason || 'Khách hàng / Cửa hàng yêu cầu hủy đơn'}. Tồn kho giữ chỗ và coupon đã được hoàn trả.`,
            changedAt: new Date(),
            changedBy: userId || null,
          },
        },
      },
      { session, new: false } // Trả về snapshot trước khi cập nhật để lấy danh sách items và coupon
    );

    if (!lockedOrder) {
      throw new AppError('Đơn hàng không thể hủy: đã bị hủy trước đó hoặc trạng thái đơn vừa thay đổi.', 400);
    }

    // 1. Nhả giữ chỗ trong kho ĐÚNG 1 LẦN
    for (const it of lockedOrder.items) {
      await ProductVariant.updateOne(
        { _id: it.variantId },
        { $inc: { allocated: -it.quantity } },
        { session }
      );
    }

    // 2. Hoàn lại lượt dùng Coupon (nếu có) ĐÚNG 1 LẦN
    if (lockedOrder.pricing?.couponCode) {
      await couponService.releaseCoupon(lockedOrder.pricing.couponCode, session);
    }

    return await Order.findById(orderId).session(session);
  });

  return cancelledOrder;
};

/**
 * 3. ADMIN CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (STATE MACHINE ĐIỀU PHỐI KHO NỘI BỘ - CÁCH A)
 * - CONFIRMED -> SHIPPING: Hàng rời kho -> stock -= qty, allocated -= qty
 * - SHIPPING -> DELIVERED: Thu tiền COD -> paymentStatus: PAID, sold += qty
 * - SHIPPING -> RETURNED: Khách bom/hàng về kho -> stock += qty
 * - DELIVERED -> RETURNED: Trả hàng sau giao -> stock += qty, sold -= qty
 */
const updateOrderStatus = async (orderId, { newStatus, note = '', adminUser = null }) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Không tìm thấy đơn hàng', 404);

  const currentStatus = order.orderStatus;
  if (currentStatus === newStatus) {
    return order;
  }

  // Định nghĩa các bước chuyển trạng thái hợp lệ
  const validTransitions = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['SHIPPING', 'CANCELLED'],
    SHIPPING: ['DELIVERED', 'RETURNED'],
    DELIVERED: ['RETURNED'],
    CANCELLED: [],
    RETURNED: [],
  };

  const allowedNext = validTransitions[currentStatus] || [];
  if (!allowedNext.includes(newStatus)) {
    throw new AppError(
      `Không thể chuyển trạng thái đơn hàng từ "${currentStatus}" sang "${newStatus}". Các trạng thái hợp lệ tiếp theo: [${allowedNext.join(', ')}]`,
      400
    );
  }

  const updatedOrder = await withTransaction(async (session) => {
    // 1. Chuyển sang SHIPPING (Đóng gói xuất kho giao đi)
    if (newStatus === 'SHIPPING' && ['PENDING', 'CONFIRMED'].includes(currentStatus)) {
      for (const it of order.items) {
        // Hàng chính thức rời kệ kho: trừ stock vật lý và trừ số lượng giữ chỗ
        await ProductVariant.updateOne(
          { _id: it.variantId },
          { $inc: { stock: -it.quantity, allocated: -it.quantity } },
          { session }
        );
      }
    }

    // 2. Chuyển sang DELIVERED (Giao thành công, thu tiền COD)
    if (newStatus === 'DELIVERED') {
      order.paymentStatus = 'PAID';
      for (const it of order.items) {
        // Ghi nhận doanh số đã bán
        await ProductVariant.updateOne(
          { _id: it.variantId },
          { $inc: { sold: it.quantity } },
          { session }
        );
      }
    }

    // 3. Chuyển sang RETURNED (Admin xác nhận hàng bom/trả đã về lại kệ kho)
    if (newStatus === 'RETURNED') {
      if (currentStatus === 'SHIPPING') {
        // Hàng giao không thành công, hoàn lại kệ kho vật lý
        for (const it of order.items) {
          await ProductVariant.updateOne(
            { _id: it.variantId },
            { $inc: { stock: it.quantity } },
            { session }
          );
        }
      } else if (currentStatus === 'DELIVERED') {
        // Đã giao rồi mới trả hàng: hoàn lại stock và trừ sold
        for (const it of order.items) {
          await ProductVariant.updateOne(
            { _id: it.variantId },
            { $inc: { stock: it.quantity, sold: -it.quantity } },
            { session }
          );
        }
      }
    }

    // 4. Chuyển sang CANCELLED (từ PENDING hoặc CONFIRMED)
    if (newStatus === 'CANCELLED' && ['PENDING', 'CONFIRMED'].includes(currentStatus)) {
      for (const it of order.items) {
        await ProductVariant.updateOne(
          { _id: it.variantId },
          { $inc: { allocated: -it.quantity } },
          { session }
        );
      }
      if (order.pricing.couponCode) {
        await couponService.releaseCoupon(order.pricing.couponCode, session);
      }
      order.cancelledAt = new Date();
      order.cancelledBy = adminUser?._id || null;
      order.cancelReason = note || 'Admin hủy đơn hàng';
    }

    order.orderStatus = newStatus;
    order.statusHistory.push({
      status: newStatus,
      note: note || `Chuyển trạng thái sang ${newStatus}`,
      changedAt: new Date(),
      changedBy: adminUser?._id || null,
    });

    await order.save({ session });
    return order;
  });

  return updatedOrder;
};

/**
 * 4. LẤY CHI TIẾT ĐƠN HÀNG (TRẢ VỀ SNAPSHOT ĐÓNG BĂNG, KHÔNG RE-QUERY GIÁ HIỆN TẠI)
 */
const getOrderById = async (orderId, userId = null, userRole = 'user') => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Không tìm thấy đơn hàng', 404);

  // Nếu user thường tra cứu thì phải đúng đơn của mình, Admin/Nhân viên được xem tất cả
  const isStaffOrAdmin = userRole !== 'user';
  if (!isStaffOrAdmin && userId && order.userId && order.userId.toString() !== userId.toString()) {
    throw new AppError('Bạn không có quyền xem đơn hàng này', 403);
  }

  return order;
};

/**
 * 5. LẤY DANH SÁCH ĐƠN HÀNG CỦA TÔI (MY ORDERS)
 */
const getMyOrders = async (userId, query = {}) => {
  const filter = { userId };
  if (query.status && query.status.toUpperCase() !== 'ALL') {
    filter.orderStatus = query.status.toUpperCase();
  }
  if (query.search && query.search.trim()) {
    const s = query.search.trim();
    filter.$or = [
      { orderCode: { $regex: s, $options: 'i' } },
      { 'items.productName': { $regex: s, $options: 'i' } },
    ];
  }

  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, parseInt(query.limit) || 10);
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * 6. LẤY TẤT CẢ ĐƠN HÀNG (DÀNH CHO ADMIN)
 */
const getAllOrders = async (query = {}) => {
  const filter = {};

  if (query.status) {
    filter.orderStatus = query.status.toUpperCase();
  }
  if (query.paymentStatus) {
    filter.paymentStatus = query.paymentStatus.toUpperCase();
  }
  if (query.search) {
    filter.$or = [
      { orderCode: { $regex: query.search.trim(), $options: 'i' } },
      { 'shippingAddress.phone': { $regex: query.search.trim(), $options: 'i' } },
      { 'shippingAddress.fullName': { $regex: query.search.trim(), $options: 'i' } },
    ];
  }

  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, parseInt(query.limit) || 10);
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * 7. LẤY TRẠNG THÁI NHANH ĐƠN HÀNG (ORDER STATUS)
 */
const getOrderStatus = async (orderId, userId = null) => {
  const order = await Order.findById(orderId).lean();
  if (!order) throw new AppError('Không tìm thấy đơn hàng', 404);

  if (userId && order.userId && order.userId.toString() !== userId.toString()) {
    throw new AppError('Bạn không có quyền xem trạng thái đơn hàng này', 403);
  }

  return {
    orderId: order._id,
    orderCode: order.orderCode,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    pricing: order.pricing,
    shippingAddress: order.shippingAddress,
    statusHistory: order.statusHistory || [],
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

module.exports = {
  previewOrder,
  createOrderCOD,
  cancelOrder,
  updateOrderStatus,
  getOrderById,
  getOrderStatus,
  getMyOrders,
  getAllOrders,
};
