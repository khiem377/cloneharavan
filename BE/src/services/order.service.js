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

const crypto = require('crypto');
const { escapeRegex } = require('../middleware/sanitize.middleware');

/**
 * Helper sinh mã đơn hàng độc nhất: ORD-YYYYMMDD-XXXX
 */
const generateOrderCode = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${dateStr}-${rand}`;
};

/**
 * Đếm số lượng đơn hàng đang chờ duyệt (PENDING)
 */
const getPendingOrdersCount = async () => {
  return await Order.countDocuments({ orderStatus: 'PENDING' });
};

/**
 * Phát tín hiệu Realtime qua WebSocket tới Admin room khi số lượng đơn PENDING thay đổi
 */
const broadcastPendingOrdersCount = async (additionalData = {}) => {
  try {
    const { emitToAdmin } = require('../config/socket');
    const pendingCount = await getPendingOrdersCount();
    emitToAdmin('order:pending_count', {
      pendingCount,
      ...additionalData,
    });
  } catch (err) {
    console.warn('[Socket Broadcast Error]:', err.message);
  }
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

  const { addressId, shippingAddress: customAddress, couponCode, shippingCouponCode, buyNowItem, items: directItems, itemIds } = previewData;

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

    // Kiểm tra ưu đãi Combo
    const isComboItem = Boolean(item.isComboItem || item.comboId || item.comboName);
    const comboPrice = item.comboPrice ? Number(item.comboPrice) : null;
    const comboName = item.comboName || '';
    const comboCode = item.comboCode || '';
    const comboId = item.comboId ? String(item.comboId) : null;

    if (isComboItem && comboPrice && comboPrice > 0) {
      unitPrice = comboPrice;
    } else {
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
      isComboItem,
      comboName,
      comboCode,
      comboId,
      comboPrice,
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
      const couponRes = await couponService.validateCoupon(codeToValidate.trim(), totalSubtotal, { userId });
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
      insuranceValue: 0,
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

  // 8. Áp dụng mã giảm giá vận chuyển (Shipping Coupon) nếu có
  let appliedShippingCouponCode = null;
  let totalShippingDiscount = 0;
  const shippingCodeToValidate = shippingCouponCode !== undefined
    ? shippingCouponCode
    : (userCart?.shippingCouponCode || null);

  if (shippingCodeToValidate && typeof shippingCodeToValidate === 'string' && shippingCodeToValidate.trim()) {
    try {
      const shipCouponRes = await couponService.validateCoupon(
        shippingCodeToValidate.trim(),
        totalSubtotal,
        { shippingFee, userId }
      );
      totalShippingDiscount = shipCouponRes.discountAmount || 0;
      appliedShippingCouponCode = shipCouponRes.coupon.code;
    } catch (shipCouponErr) {
      warnings.push(`Mã vận chuyển "${shippingCodeToValidate}": ${shipCouponErr.message}`);
    }
  }

  const finalShippingFee = Math.max(0, shippingFee - totalShippingDiscount);
  const finalTotalAmount = Math.max(0, totalSubtotal - totalCouponDiscount + finalShippingFee);

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
      shippingCouponCode: appliedShippingCouponCode,
      shippingDiscount: totalShippingDiscount,
      finalShippingFee,
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

  const {
    addressId,
    shippingAddress: customAddress,
    couponCode,
    shippingCouponCode,
    note = '',
    buyNowItem,
    items: directItems,
    itemIds,
    paymentMethod = 'COD',
    idempotencyKey = null,
  } = orderData;

  // 0. Idempotency Guard (Bảo vệ chống trùng lặp theo Idempotency-Key từ Client)
  if (idempotencyKey && userId) {
    const existingOrder = await Order.findOne({ userId, idempotencyKey });
    if (existingOrder) {
      console.log(`[Order Service] Trùng khớp Idempotency-Key (${idempotencyKey}) - trả về đơn đã tạo: ${existingOrder.orderCode}`);
      return existingOrder;
    }
  }

  // 1. Xác định người dùng & Địa chỉ giao hàng
  const user = await User.findById(userId);
  if (!user) throw new AppError('Không tìm thấy tài khoản người dùng', 404);

  let finalShippingAddress = null;

  if (addressId) {
    const matchedAddr = user.addresses.id(addressId);
    if (!matchedAddr) throw new AppError('Địa chỉ giao hàng đã chọn không tồn tại', 404);
    finalShippingAddress = {
      fullName: matchedAddr.fullName,
      email: (customAddress?.email || user.email || '').trim(),
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
      email: (customAddress?.email || user.email || '').trim(),
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
      email: (customAddress?.email || user.email || '').trim(),
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

    const isComboItem = Boolean(item.isComboItem || item.comboId || item.comboName);
    const comboPrice = item.comboPrice ? Number(item.comboPrice) : null;
    const comboName = item.comboName || '';
    const comboCode = item.comboCode || '';
    const comboId = item.comboId ? String(item.comboId) : null;

    if (isComboItem && comboPrice && comboPrice > 0) {
      unitPrice = comboPrice;
    } else {
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
      isComboItem,
      comboName,
      comboCode,
      comboId,
      comboPrice,
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
    const couponRes = await couponService.validateCoupon(codeToValidate.trim(), totalSubtotal, { userId });
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
        insuranceValue: 0,
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

  // 6a. Re-check Shipping Coupon từ Database
  let appliedShippingCouponCode = null;
  let totalShippingDiscount = 0;
  let shippingCouponDoc = null;

  const shippingCodeToValidate = shippingCouponCode !== undefined
    ? shippingCouponCode
    : (userCart?.shippingCouponCode || null);

  if (shippingCodeToValidate && typeof shippingCodeToValidate === 'string' && shippingCodeToValidate.trim()) {
    try {
      const shipCouponRes = await couponService.validateCoupon(
        shippingCodeToValidate.trim(),
        totalSubtotal,
        { shippingFee, userId }
      );
      totalShippingDiscount = shipCouponRes.discountAmount || 0;
      appliedShippingCouponCode = shipCouponRes.coupon.code;
      shippingCouponDoc = shipCouponRes.coupon;
    } catch (shipErr) {
      console.warn('[Order Service] Mã vận chuyển không hợp lệ khi tạo đơn:', shipErr.message);
    }
  }

  const finalShippingFee = Math.max(0, shippingFee - totalShippingDiscount);
  const finalTotalAmount = Math.max(0, totalSubtotal - totalCouponDiscount + finalShippingFee);

  // 6b. Chống tạo đơn trùng lặp (Fallback Idempotency Guard trong vòng 10 giây nếu không gửi Idempotency-Key)
  if (!idempotencyKey) {
    const tenSecondsAgo = new Date(Date.now() - 10000);
    const recentDuplicate = await Order.findOne({
      userId,
      orderStatus: 'PENDING',
      'pricing.subtotal': totalSubtotal,
      createdAt: { $gte: tenSecondsAgo },
    });

    if (recentDuplicate) {
      console.log(`[Order Service] Phát hiện đơn hàng trùng lặp gần đây (${recentDuplicate.orderCode}), trả về đơn đã tạo.`);
      return recentDuplicate;
    }
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

    // 7.2. Tăng số lượt dùng của Coupon đơn hàng
    if (couponDoc) {
      await couponService.applyCoupon(couponDoc._id, totalSubtotal, 0, session);
    }

    // 7.2b. Tăng số lượt dùng của Coupon vận chuyển
    if (shippingCouponDoc) {
      await couponService.applyCoupon(shippingCouponDoc._id, totalSubtotal, shippingFee, session);
    }

    // 7.2c. Tăng số lượt dùng (Quota) của Chương trình Quà tặng kèm
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
          paymentMethod: paymentMethod || 'COD',
          paymentStatus: orderData.paymentStatus || 'UNPAID',
          orderStatus: 'PENDING',
          idempotencyKey: idempotencyKey || null,
          pricing: {
            subtotal: totalSubtotal,
            shippingFee,
            couponCode: appliedCouponCode,
            couponDiscount: totalCouponDiscount,
            shippingCouponCode: appliedShippingCouponCode,
            shippingDiscount: totalShippingDiscount,
            finalShippingFee,
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
        $set: { couponCode: null, shippingCouponCode: null, lastValidatedAt: new Date() },
      },
      { session }
    );

    return order;
  });

  // Phát tín hiệu Realtime cho Admin Sidebar cập nhật số lượng đơn chờ duyệt
  broadcastPendingOrdersCount({
    type: 'ORDER_CREATED',
    order: {
      _id: createdOrder._id,
      orderCode: createdOrder.orderCode,
      totalAmount: createdOrder.pricing?.totalAmount,
      customerName: createdOrder.shippingAddress?.fullName,
      createdAt: createdOrder.createdAt,
    },
  });

  // 1. Lưu thông báo vào DB (TTL 30 ngày) và phát Socket.io Realtime tới Admin Topbar
  try {
    const notificationService = require('./notification.service');
    notificationService.createNotification({
      recipient: 'admin',
      type: 'ORDER_NEW',
      title: `Đơn hàng mới #${createdOrder.orderCode}`,
      message: `Khách hàng ${finalShippingAddress.fullName} vừa đặt đơn hàng trị giá ${finalTotalAmount.toLocaleString('vi-VN')}đ`,
      link: `/orders/${createdOrder._id}`,
      metadata: {
        orderId: createdOrder._id,
        orderCode: createdOrder.orderCode,
        totalAmount: finalTotalAmount,
        customerName: finalShippingAddress.fullName,
        customerPhone: finalShippingAddress.phone,
      },
    }).catch((err) => console.warn('[Order Service] Lỗi tạo notification đơn mới:', err.message));
  } catch (notifErr) {
    console.warn('[Order Service] Không thể tạo notification:', notifErr.message);
  }

  // 2. Gửi email xác nhận đơn hàng cho khách hàng
  try {
    const emailService = require('./email.service');
    emailService.sendOrderConfirmationEmail(createdOrder).catch((err) =>
      console.warn('[Order Service] Lỗi gửi email xác nhận:', err.message)
    );
  } catch (emailErr) {
    console.warn('[Order Service] Không thể gửi email xác nhận:', emailErr.message);
  }

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
    if (lockedOrder.pricing?.shippingCouponCode) {
      await couponService.releaseCoupon(lockedOrder.pricing.shippingCouponCode, session);
    }

    return await Order.findById(orderId).session(session);
  });

  // Nếu đơn bị hủy từng ở trạng thái PENDING thì cập nhật lại số lượng đơn chờ duyệt cho Admin
  if (existingOrder.orderStatus === 'PENDING') {
    broadcastPendingOrdersCount({
      type: 'ORDER_CANCELLED',
      orderId,
      orderCode: existingOrder.orderCode,
    });
  }

  // Bắn thông báo Socket Realtime & Lưu DB có TTL 30 ngày cho Admin
  try {
    const notificationService = require('./notification.service');
    notificationService.createNotification({
      recipient: 'admin',
      type: 'ORDER_CANCELLED',
      title: `Đơn hàng #${existingOrder.orderCode} đã bị hủy`,
      message: `Đơn hàng #${existingOrder.orderCode} vừa được hủy. Lý do: ${reason || 'Khách/Shop yêu cầu hủy đơn'}. Tồn kho giữ chỗ đã được hoàn trả.`,
      link: `/orders/${existingOrder._id}`,
      metadata: {
        orderId: existingOrder._id,
        orderCode: existingOrder.orderCode,
        reason,
      },
    }).catch(() => {});
  } catch (_) {}

  // Tự động hủy các vận đơn (Shipment) và lệnh xuất kho (StockExport) đang chờ xử lý của đơn hàng này
  try {
    const Shipment = require('../models/shipment.model');
    await Shipment.updateMany(
      { orderId: cancelledOrder._id, status: { $in: ['ready_to_pick', 'picking'] } },
      {
        $set: { status: 'cancelled', statusText: 'Đã hủy giao do đơn hàng bị hủy' },
        $push: {
          historyLogs: {
            status: 'cancelled',
            description: `Hủy vận đơn tự động do đơn hàng #${cancelledOrder.orderCode} bị hủy (${reason || 'N/A'})`,
            updatedAt: new Date(),
            updatedBy: userId || null,
          },
        },
      }
    );

    const StockExport = require('../models/stockExport.model');
    await StockExport.updateMany(
      { orderId: cancelledOrder._id, status: { $in: ['pending_pick', 'picking', 'packed'] } },
      {
        $set: { status: 'cancelled' },
        $push: {
          activityLogs: {
            status: 'cancelled',
            note: `Hủy lệnh xuất kho tự động do đơn hàng #${cancelledOrder.orderCode} bị hủy`,
            performedBy: userId || null,
            createdAt: new Date(),
          },
        },
      }
    );
  } catch (cancelCascadeErr) {
    console.warn('[Order Service] Lỗi đồng bộ hủy vận đơn/lệnh xuất kho:', cancelCascadeErr.message);
  }

  // Gửi email thông báo hủy đơn hàng cho khách (order_cancelled)
  try {
    const emailService = require('./email.service');
    emailService.sendOrderCancelledEmail(cancelledOrder, reason).catch((err) =>
      console.warn('[Order Service] Lỗi gửi email hủy đơn:', err.message)
    );
  } catch (cancelMailErr) {
    console.warn('[Order Service] Không thể kích hoạt gửi mail hủy đơn:', cancelMailErr.message);
  }

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

  // Nếu trạng thái cũ hoặc mới liên quan tới PENDING thì cập nhật lại số lượng cho Admin
  if (currentStatus === 'PENDING' || newStatus === 'PENDING') {
    broadcastPendingOrdersCount({
      type: 'STATUS_UPDATED',
      orderId: updatedOrder._id,
      orderCode: updatedOrder.orderCode,
      oldStatus: currentStatus,
      newStatus,
    });
  }

  // Tự động kích hoạt mẫu email tương ứng theo trạng thái đơn hàng (Email Triggers)
  try {
    const emailService = require('./email.service');
    if (newStatus === 'SHIPPING') {
      emailService.sendShippingConfirmationEmail(updatedOrder).catch((e) =>
        console.warn('[Order Service] Lỗi gửi email xác nhận giao vận:', e.message)
      );
    } else if (newStatus === 'DELIVERED') {
      emailService.sendShippingDeliveredEmail(updatedOrder).catch((e) =>
        console.warn('[Order Service] Lỗi gửi email giao hàng thành công:', e.message)
      );
    } else if (newStatus === 'CANCELLED') {
      emailService.sendOrderCancelledEmail(updatedOrder, updatedOrder.cancelReason).catch((e) =>
        console.warn('[Order Service] Lỗi gửi email hủy đơn hàng:', e.message)
      );
    } else if (newStatus === 'RETURNED') {
      emailService.sendOrderRefundedEmail(updatedOrder).catch((e) =>
        console.warn('[Order Service] Lỗi gửi email hoàn trả/hoàn tiền:', e.message)
      );
    }
  } catch (mailTriggerErr) {
    console.warn('[Order Service] Không thể kích hoạt email theo trạng thái:', mailTriggerErr.message);
  }

  // Tự động đồng bộ liên kết 2 chiều với Vận chuyển (Shipment) và Lệnh xuất kho (StockExport)
  try {
    const Shipment = require('../models/shipment.model');
    const StockExport = require('../models/stockExport.model');

    if (newStatus === 'SHIPPING') {
      await Shipment.updateMany(
        { orderId: updatedOrder._id, status: 'ready_to_pick' },
        {
          $set: { status: 'delivering', statusText: 'Đang giao hàng' },
          $push: {
            historyLogs: {
              status: 'delivering',
              description: 'Admin chuyển trạng thái đơn hàng sang Đang giao hàng',
              updatedAt: new Date(),
              updatedBy: adminUser?._id || null,
            },
          },
        }
      );
      await StockExport.updateMany(
        { orderId: updatedOrder._id, status: { $in: ['pending_pick', 'picking', 'packed'] } },
        {
          $set: { status: 'completed' },
          $push: {
            activityLogs: {
              status: 'completed',
              note: 'Hoàn tất lệnh xuất kho khi đơn hàng chuyển sang Đang giao hàng',
              performedBy: adminUser?._id || null,
              createdAt: new Date(),
            },
          },
        }
      );
    } else if (newStatus === 'DELIVERED') {
      await Shipment.updateMany(
        { orderId: updatedOrder._id, status: { $in: ['ready_to_pick', 'picking', 'delivering'] } },
        {
          $set: { status: 'delivered', statusText: 'Đã giao hàng' },
          $push: {
            historyLogs: {
              status: 'delivered',
              description: 'Admin xác nhận giao hàng thành công',
              updatedAt: new Date(),
              updatedBy: adminUser?._id || null,
            },
          },
        }
      );
    } else if (newStatus === 'CANCELLED') {
      await Shipment.updateMany(
        { orderId: updatedOrder._id, status: { $in: ['ready_to_pick', 'picking'] } },
        {
          $set: { status: 'cancelled', statusText: 'Đã hủy giao' },
          $push: {
            historyLogs: {
              status: 'cancelled',
              description: 'Hủy vận đơn do Admin hủy đơn hàng',
              updatedAt: new Date(),
              updatedBy: adminUser?._id || null,
            },
          },
        }
      );
      await StockExport.updateMany(
        { orderId: updatedOrder._id, status: { $in: ['pending_pick', 'picking', 'packed'] } },
        {
          $set: { status: 'cancelled' },
          $push: {
            activityLogs: {
              status: 'cancelled',
              note: 'Hủy lệnh xuất kho do Admin hủy đơn hàng',
              performedBy: adminUser?._id || null,
              createdAt: new Date(),
            },
          },
        }
      );
    } else if (newStatus === 'RETURNED') {
      await Shipment.updateMany(
        { orderId: updatedOrder._id, status: { $in: ['ready_to_pick', 'picking', 'delivering'] } },
        {
          $set: { status: 'returned', statusText: 'Đã hoàn hàng' },
          $push: {
            historyLogs: {
              status: 'returned',
              description: 'Admin xác nhận hàng đã hoàn về kho',
              updatedAt: new Date(),
              updatedBy: adminUser?._id || null,
            },
          },
        }
      );
    }
  } catch (crossSyncErr) {
    console.warn('[Order Service] Lỗi đồng bộ trạng thái sang Shipment/StockExport:', crossSyncErr.message);
  }

  return updatedOrder;
};

/**
 * 4. LẤY CHI TIẾT ĐƠN HÀNG (TRẢ VỀ SNAPSHOT ĐÓNG BĂNG, KHÔNG RE-QUERY GIÁ HIỆN TẠI)
 */
const getOrderById = async (orderIdOrCode, userId = null, userRole = 'user') => {
  let order = null;
  if (mongoose.Types.ObjectId.isValid(orderIdOrCode)) {
    order = await Order.findById(orderIdOrCode);
  }
  if (!order) {
    order = await Order.findOne({ orderCode: String(orderIdOrCode || '').trim().toUpperCase() });
  }
  if (!order) throw new AppError('Không tìm thấy đơn hàng', 404);

  // BẢO VỆ THÔNG TIN CÁ NHÂN & AN TOÀN DỮ LIỆU:
  // Người xem bắt buộc phải đăng nhập và là chính chủ đơn hàng (hoặc Admin/Nhân viên)
  const isStaffOrAdmin = ['admin', 'staff', 'manager'].includes(userRole);
  if (!isStaffOrAdmin) {
    if (!userId) {
      throw new AppError('Vui lòng đăng nhập để xem thông tin đơn hàng này', 401);
    }
    if (order.userId && order.userId.toString() !== userId.toString()) {
      throw new AppError('Bạn không có quyền xem thông tin đơn hàng của khách hàng khác', 403);
    }
  }

  const StockExport = require('../models/stockExport.model');
  const se = await StockExport.findOne({
    orderId: order._id,
    status: { $ne: 'cancelled' },
  })
    .sort({ createdAt: -1 })
    .lean();

  const Shipment = require('../models/shipment.model');
  const shipment = await Shipment.findOne({
    orderId: order._id,
    status: { $ne: 'cancelled' },
  })
    .sort({ createdAt: -1 })
    .lean();

  // Tự động đồng bộ nếu đơn hàng đã có vận đơn nhưng orderStatus vẫn là CONFIRMED
  if (shipment && order.orderStatus === 'CONFIRMED') {
    order.orderStatus = 'SHIPPING';
    order.save().catch((e) => console.warn('Lỗi auto-sync order status:', e.message));
  }

  const orderObj = order.toObject ? order.toObject() : { ...order };
  orderObj.orderStatus = order.orderStatus;
  orderObj.shipment = shipment || null;
  orderObj.stockExport = se
    ? {
        _id: se._id,
        exportNumber: se.exportNumber,
        status: se.status,
        warehouseId: se.warehouseId,
      }
    : null;
  orderObj.isStockExported = se ? se.status === 'completed' : false;

  return orderObj;
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
    const s = escapeRegex(query.search.trim());
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

  // Đính kèm shipment cho từng đơn hàng
  const orderIds = orders.map((o) => o._id);
  const Shipment = require('../models/shipment.model');
  const shipments = await Shipment.find({
    orderId: { $in: orderIds },
    status: { $ne: 'cancelled' },
  }).lean();
  const shipmentMap = new Map();
  shipments.forEach((s) => shipmentMap.set(s.orderId.toString(), s));

  const enrichedOrders = orders.map((o) => {
    const s = shipmentMap.get(o._id.toString()) || null;
    return {
      ...o,
      shipment: s,
      orderStatus: s && o.orderStatus === 'CONFIRMED' ? 'SHIPPING' : o.orderStatus,
    };
  });

  return {
    orders: enrichedOrders,
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
    if (query.status.includes(',')) {
      const statuses = query.status.split(',').map((s) => s.trim().toUpperCase());
      filter.orderStatus = { $in: statuses };
    } else {
      filter.orderStatus = query.status.toUpperCase();
    }
  }
  if (query.paymentStatus) {
    filter.paymentStatus = query.paymentStatus.toUpperCase();
  }
  if (query.search) {
    const safeSearch = escapeRegex(query.search.trim());
    filter.$or = [
      { orderCode: { $regex: safeSearch, $options: 'i' } },
      { 'shippingAddress.phone': { $regex: safeSearch, $options: 'i' } },
      { 'shippingAddress.fullName': { $regex: safeSearch, $options: 'i' } },
    ];
  }

  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, parseInt(query.limit) || 10);
  const skip = (page - 1) * limit;

  const [orders, total, statusCounts] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
    Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ['$orderStatus', 'DELIVERED'] }, '$pricing.totalAmount', 0],
            },
          },
        },
      },
    ]),
  ]);

  const stats = {
    total: 0,
    pending: 0,
    confirmed: 0,
    shipping: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0,
  };

  statusCounts.forEach((item) => {
    const st = (item._id || '').toUpperCase();
    stats.total += item.count;
    if (st === 'PENDING') stats.pending = item.count;
    else if (st === 'CONFIRMED') stats.confirmed = item.count;
    else if (st === 'SHIPPING') stats.shipping = item.count;
    else if (st === 'DELIVERED') {
      stats.delivered = item.count;
      stats.totalRevenue = item.totalRevenue || 0;
    } else if (st === 'CANCELLED' || st === 'RETURNED') {
      stats.cancelled += item.count;
    }
  });

  const StockExport = require('../models/stockExport.model');
  const orderIds = orders.map((o) => o._id);
  const stockExports = orderIds.length > 0
    ? await StockExport.find({
        orderId: { $in: orderIds },
        status: { $ne: 'cancelled' },
      })
        .sort({ createdAt: -1 })
        .lean()
    : [];

  const stockExportMap = {};
  stockExports.forEach((se) => {
    const k = se.orderId ? se.orderId.toString() : '';
    if (k && !stockExportMap[k]) {
      stockExportMap[k] = se;
    }
  });

  const enrichedOrders = orders.map((ord) => {
    const se = stockExportMap[ord._id.toString()];
    const isStockExported = se ? se.status === 'completed' : false;
    return {
      ...ord,
      stockExport: se
        ? {
            _id: se._id,
            exportNumber: se.exportNumber,
            status: se.status,
            warehouseId: se.warehouseId,
          }
        : null,
      isStockExported,
    };
  });

  return {
    orders: enrichedOrders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
    stats,
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
  getPendingOrdersCount,
};
