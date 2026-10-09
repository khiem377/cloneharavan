const mongoose = require('mongoose');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const checkoutService = require('./checkout.service');
const flashSaleService = require('./flashSale.service');
const { AppError } = require('../utils/AppError');
const { getSellingPrice } = require('../utils/pricing.helper');

/**
 * Service quản lý Giỏ hàng đồng bộ với Kho hàng (Real-Time Inventory Cart)
 */

/**
 * Tính toán tồn kho khả dụng để bán: availableStock = stock - allocated
 */
const getAvailableStock = (variant) => {
  if (!variant) return 0;
  const stock = Number(variant.stock) || 0;
  const allocated = Number(variant.allocated) || 0;
  return Math.max(0, stock - allocated);
};

/**
 * Phân giải sản phẩm & biến thể cho Giỏ hàng:
 * 1. ƯU TIÊN SỐ 1: variantId (Đơn vị lưu kho & bán hàng chuẩn nhất)
 *    - Tìm trực tiếp ProductVariant theo variantId và populate('productId').
 *    - Hoàn toàn KHÔNG cần client truyền productId vì biến thể đã liên kết chặt chẽ với sản phẩm cha.
 * 2. ƯU TIÊN SỐ 2: sku
 *    - Tìm trực tiếp ProductVariant theo mã SKU và populate('productId').
 * 3. FALLBACK LINH HOẠT: productId
 *    - Nếu ID truyền vào thực chất là ID của một variant (client gửi nhầm tên trường):
 *      Tự động nhận diện luôn là variant!
 *    - Nếu đúng là ID của Product cha:
 *      + Tự động chọn Default Variant (isDefault: true) đại diện của sản phẩm đó.
 *      + Nếu default variant hết hàng, tự động tìm biến thể đầu tiên còn hàng khả dụng.
 *      + Cho phép thêm ngay vào giỏ hàng mà không bị chặn lỗi 400.
 */
const resolveVariantAndProduct = async ({ productId, variantId, sku }) => {
  let targetProduct = null;
  let targetVariant = null;

  // 1. Trường hợp 1: Có variantId (Ưu tiên hàng đầu)
  if (variantId) {
    if (!mongoose.isValidObjectId(variantId)) {
      throw new AppError(`ID biến thể "${variantId}" không đúng định dạng ObjectId`, 400);
    }

    targetVariant = await ProductVariant.findById(variantId).populate('productId');
    if (!targetVariant) {
      throw new AppError(`Không tìm thấy biến thể sản phẩm với ID: "${variantId}"`, 404);
    }

    targetProduct = targetVariant.productId;
    if (!targetProduct) {
      throw new AppError(`Sản phẩm cha của biến thể "${variantId}" không tồn tại hoặc đã bị xóa`, 404);
    }

    return { product: targetProduct, variant: targetVariant };
  }

  // 2. Trường hợp 2: Có mã SKU
  if (sku && typeof sku === 'string' && sku.trim()) {
    const cleanSku = sku.trim().toUpperCase();
    targetVariant = await ProductVariant.findOne({ sku: cleanSku }).populate('productId');
    if (!targetVariant) {
      throw new AppError(`Không tìm thấy biến thể sản phẩm với mã SKU: "${cleanSku}"`, 404);
    }

    targetProduct = targetVariant.productId;
    if (!targetProduct) {
      throw new AppError(`Sản phẩm cha của SKU "${cleanSku}" không tồn tại hoặc đã bị xóa`, 404);
    }

    return { product: targetProduct, variant: targetVariant };
  }

  // 3. Trường hợp 3: Client chỉ truyền productId (hoặc gửi nhầm variantId vào trường productId)
  if (!productId) {
    throw new AppError('Vui lòng cung cấp variantId, sku hoặc productId của sản phẩm', 400);
  }

  // Nếu chuỗi không phải ObjectId -> thử tìm xem có phải mã SKU không
  if (!mongoose.isValidObjectId(productId)) {
    const maybeSku = String(productId).trim().toUpperCase();
    targetVariant = await ProductVariant.findOne({ sku: maybeSku }).populate('productId');
    if (targetVariant && targetVariant.productId) {
      return { product: targetVariant.productId, variant: targetVariant };
    }
    throw new AppError(`ID sản phẩm "${productId}" không đúng định dạng ObjectId`, 400);
  }

  // Kiểm tra trước: Liệu ID này có phải chính là ID của một ProductVariant không (do client gửi nhầm tên trường)?
  const variantById = await ProductVariant.findById(productId).populate('productId');
  if (variantById && variantById.productId) {
    return { product: variantById.productId, variant: variantById };
  }

  // Tìm Product cha
  targetProduct = await Product.findById(productId);
  if (!targetProduct) {
    throw new AppError(`Không tìm thấy sản phẩm với ID: "${productId}"`, 404);
  }

  // Lấy tất cả biến thể của sản phẩm
  const allVariants = await ProductVariant.find({ productId: targetProduct._id }).sort({
    isDefault: -1,
    position: 1,
  });

  if (!allVariants || allVariants.length === 0) {
    throw new AppError(
      `Sản phẩm "${targetProduct.name}" hiện chưa được tạo biến thể hoặc dữ liệu kho hàng`,
      400
    );
  }

  // Tự động phân giải biến thể khi chỉ có productId:
  // - Ưu tiên A: Biến thể mặc định (isDefault: true) còn hàng khả dụng
  // - Ưu tiên B: Biến thể đầu tiên còn hàng khả dụng
  // - Ưu tiên C: Biến thể mặc định hoặc biến thể đầu tiên
  let selectedVariant = allVariants.find((v) => v.isDefault && getAvailableStock(v) > 0);
  if (!selectedVariant) {
    selectedVariant = allVariants.find((v) => getAvailableStock(v) > 0);
  }
  if (!selectedVariant) {
    selectedVariant = allVariants.find((v) => v.isDefault) || allVariants[0];
  }

  return { product: targetProduct, variant: selectedVariant };
};

/**
 * Tìm giỏ hàng của khách vãng lai theo sessionId (linh hoạt nhận diện có hoặc không có tiền tố 'guest_')
 */
const findGuestCart = async (sessionId) => {
  if (!sessionId || typeof sessionId !== 'string') return null;
  const cleanId = sessionId.trim();
  const altId = cleanId.startsWith('guest_')
    ? cleanId.replace(/^guest_/, '')
    : `guest_${cleanId}`;
  return Cart.findOne({
    sessionId: { $in: [cleanId, altId] },
  });
};

/**
 * Tìm hoặc tạo mới giỏ hàng theo chủ sở hữu (User hoặc Guest)
 * Tự động hợp nhất (Auto-merge) giỏ hàng Guest vào User khi có cả userId và sessionId
 */
const getOrCreateCart = async (cartOwner) => {
  const { userId, sessionId } = cartOwner || {};

  if (!userId && !sessionId) {
    throw new AppError('Không thể xác định chủ sở hữu giỏ hàng (Thiếu userId hoặc sessionId)', 400);
  }

  // 1. Trường hợp người dùng ĐÃ ĐĂNG NHẬP (có userId)
  if (userId) {
    let userCart = await Cart.findOne({ userId });

    // TỰ ĐỘNG GỘP GIỎ HÀNG: Nếu có sessionId gửi lên kèm theo (từ local/guest)
    if (sessionId) {
      const guestCart = await findGuestCart(sessionId);

      // Nếu tìm thấy giỏ guest và giỏ guest có sản phẩm, và không phải chính userCart
      if (
        guestCart &&
        Array.isArray(guestCart.items) &&
        guestCart.items.length > 0 &&
        guestCart._id.toString() !== userCart?._id?.toString()
      ) {
        if (!userCart) {
          // User chưa có giỏ -> Chuyển thẳng giỏ guest thành giỏ user
          guestCart.userId = userId;
          guestCart.sessionId = null;
          await guestCart.save();
          return guestCart;
        }

        // User đã có giỏ -> Gộp từng sản phẩm từ guestCart vào userCart
        for (const guestItem of guestCart.items) {
          const existingIndex = userCart.items.findIndex(
            (it) => it.variantId.toString() === guestItem.variantId.toString()
          );

          const variant = await ProductVariant.findById(guestItem.variantId);
          const availableStock = getAvailableStock(variant);

          if (availableStock <= 0) continue; // Hết hàng thì bỏ qua không merge

          if (existingIndex > -1) {
            const mergedQty = Math.min(
              userCart.items[existingIndex].quantity + guestItem.quantity,
              availableStock
            );
            userCart.items[existingIndex].quantity = mergedQty;
            userCart.items[existingIndex].priceAtAdded = getSellingPrice(variant);
          } else {
            userCart.items.push({
              productId: guestItem.productId,
              variantId: guestItem.variantId,
              sku: guestItem.sku,
              quantity: Math.min(guestItem.quantity, availableStock),
              priceAtAdded: guestItem.priceAtAdded || getSellingPrice(variant),
              selectedAttributes: guestItem.selectedAttributes || [],
            });
          }
        }

        // Chuyển mã giảm giá nếu giỏ user chưa có
        if (guestCart.couponCode && !userCart.couponCode) {
          userCart.couponCode = guestCart.couponCode;
        }

        userCart.lastValidatedAt = new Date();
        await userCart.save();

        // Xóa giỏ guest sau khi đã gộp thành công để tránh gộp lại
        await Cart.findByIdAndDelete(guestCart._id);

        return userCart;
      }
    }

    // Nếu không có giỏ guest cần gộp, trả về userCart hoặc tạo mới nếu chưa có
    if (!userCart) {
      userCart = await Cart.create({
        userId,
        items: [],
        couponCode: null,
      });
    }

    return userCart;
  }

  // 2. Trường hợp KHÁCH VÃNG LAI (chỉ có sessionId)
  let guestCart = await findGuestCart(sessionId);
  if (!guestCart) {
    guestCart = await Cart.create({
      sessionId,
      items: [],
      couponCode: null,
    });
  }

  return guestCart;
};

/**
 * Đồng bộ giỏ hàng với Tồn kho & Giá thời gian thực:
 * - Kiểm tra stock - allocated của từng item
 * - Tự động hạ số lượng nếu tồn kho giảm
 * - Đánh dấu isOutOfStock nếu hết hàng
 * - Tích hợp Master Discount Pipeline (Flash Sale, Promotion, Coupon, Quà tặng)
 */
const formatAndValidateCart = async (cartDoc) => {
  const warnings = [];
  let hasStockIssue = false;
  let hasPriceChange = false;
  let hasCartMutation = false;

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

  const validatedItems = [];

  for (const item of cartDoc.items) {
    const variant = await ProductVariant.findById(item.variantId);
    const product = await Product.findById(item.productId);

    // 1. Sản phẩm hoặc biến thể bị xóa khỏi hệ thống
    if (!product || !variant) {
      warnings.push({
        type: 'ITEM_DELETED',
        itemId: item._id,
        productId: item.productId,
        variantId: item.variantId,
        message: 'Sản phẩm hoặc biến thể này không còn tồn tại trên hệ thống và đã được đánh dấu hết hàng.',
      });
      hasStockIssue = true;
      validatedItems.push({
        _id: item._id,
        productId: item.productId,
        variantId: item.variantId,
        sku: item.sku || '',
        name: 'Sản phẩm không tồn tại',
        thumbnail: '',
        attributes: item.selectedAttributes || [],
        quantity: item.quantity,
        availableStock: 0,
        isOutOfStock: true,
        canCheckout: false,
        unitPrice: item.priceAtAdded || 0,
        originalPrice: item.priceAtAdded || 0,
        subtotal: (item.priceAtAdded || 0) * item.quantity,
      });
      continue;
    }

    // 2. Sản phẩm tạm ngưng kinh doanh
    if (product.isActive === false) {
      warnings.push({
        type: 'PRODUCT_INACTIVE',
        itemId: item._id,
        productName: product.name,
        message: `Sản phẩm "${product.name}" hiện đang tạm ngừng kinh doanh.`,
      });
      hasStockIssue = true;
      validatedItems.push({
        _id: item._id,
        productId: product._id,
        variantId: variant._id,
        sku: variant.sku || '',
        name: product.name,
        thumbnail: variant.thumbnail?.url || product.thumbnail?.url || '',
        attributes: variant.attributes || [],
        quantity: item.quantity,
        availableStock: 0,
        isOutOfStock: true,
        canCheckout: false,
        unitPrice: getSellingPrice(variant),
        originalPrice: variant.price || 0,
        subtotal: 0,
      });
      continue;
    }

    // 3. Tính toán tồn kho khả dụng
    const availableStock = getAvailableStock(variant);
    let itemQuantity = item.quantity;
    let isOutOfStock = false;
    let canCheckout = true;

    if (availableStock <= 0) {
      isOutOfStock = true;
      canCheckout = false;
      hasStockIssue = true;
      warnings.push({
        type: 'OUT_OF_STOCK',
        itemId: item._id,
        productName: product.name,
        variantName: variant.displayName || variant.sku,
        message: `Sản phẩm "${product.name} ${!variant.isDefault ? `(${variant.displayName || variant.sku})` : ''}" hiện đã hết hàng trong kho.`,
        availableStock: 0,
      });
    } else if (itemQuantity > availableStock) {
      // Tồn kho giảm xuống thấp hơn số lượng khách đặt
      hasStockIssue = true;
      warnings.push({
        type: 'STOCK_ADJUSTED',
        itemId: item._id,
        productName: product.name,
        variantName: variant.displayName || variant.sku,
        message: `Sản phẩm "${product.name}" chỉ còn ${availableStock} cái trong kho. Số lượng trong giỏ đã được tự động giảm từ ${itemQuantity} xuống ${availableStock}.`,
        previousQty: itemQuantity,
        newQty: availableStock,
        availableStock,
      });
      itemQuantity = availableStock;
      item.quantity = availableStock;
      hasCartMutation = true;
    }

    // 4. Tính toán giá hiện tại (kiểm tra Flash Sale)
    const originalPrice = variant.price || 0;
    let unitPrice = getSellingPrice(variant);
    let isFlashSale = false;

    const fsKey = `${product._id.toString()}_${variant._id.toString()}`;
    const fsKeyProduct = `${product._id.toString()}_default`;
    const matchedFs = flashSaleMap.get(fsKey) || flashSaleMap.get(fsKeyProduct);

    if (matchedFs) {
      const fsPrice = matchedFs.flashSalePrice ?? matchedFs.flashPrice;
      const fsStock = Math.max(0, (matchedFs.stockLimit || 0) - (matchedFs.soldCount || 0));
      if (fsPrice !== null && fsPrice < unitPrice && fsStock > 0) {
        unitPrice = fsPrice;
        isFlashSale = true;
      }
    }

    // Kiểm tra biến động giá so với thời điểm thêm vào giỏ
    if (item.priceAtAdded && Math.abs(item.priceAtAdded - unitPrice) > 100) {
      hasPriceChange = true;
      warnings.push({
        type: 'PRICE_CHANGED',
        itemId: item._id,
        productName: product.name,
        message: `Đơn giá của "${product.name}" đã cập nhật từ ${item.priceAtAdded.toLocaleString('vi-VN')}đ sang ${unitPrice.toLocaleString('vi-VN')}đ.`,
        oldPrice: item.priceAtAdded,
        newPrice: unitPrice,
      });
      item.priceAtAdded = unitPrice;
      hasCartMutation = true;
    }

    validatedItems.push({
      _id: item._id,
      productId: product._id,
      variantId: variant._id,
      sku: variant.sku || '',
      name: product.name,
      displayName: variant.displayName || '',
      isDefaultVariant: Boolean(variant.isDefault),
      thumbnail: variant.thumbnail?.url || product.thumbnail?.url || '',
      attributes: variant.attributes || [],
      quantity: itemQuantity,
      availableStock,
      isOutOfStock,
      canCheckout,
      isFlashSale,
      unitPrice,
      originalPrice,
      subtotal: unitPrice * itemQuantity,
    });
  }

  // Lưu lại cartDoc nếu có thay đổi tự động
  if (hasCartMutation) {
    await cartDoc.save();
  }

  // 5. Tích hợp Master Discount Calculator (Promotion, Coupon, Gift Program)
  const checkoutPayload = {
    cartItems: validatedItems
      .filter((it) => it.canCheckout)
      .map((it) => ({
        productId: it.productId,
        variantId: it.variantId,
        quantity: it.quantity,
        originalPrice: it.originalPrice,
        productName: it.name,
        sku: it.sku,
      })),
    couponCode: cartDoc.couponCode || null,
  };

  let calculation = null;
  if (checkoutPayload.cartItems.length > 0) {
    try {
      calculation = await checkoutService.calculateCheckout(checkoutPayload);
    } catch (calcError) {
      // Nếu lỗi do Coupon không hợp lệ -> gỡ coupon và tính lại
      if (cartDoc.couponCode) {
        warnings.push({
          type: 'COUPON_INVALID',
          message: `Mã giảm giá "${cartDoc.couponCode}" không còn khả dụng hoặc không đủ điều kiện đơn hàng.`,
        });
        cartDoc.couponCode = null;
        await cartDoc.save();
        checkoutPayload.couponCode = null;
        calculation = await checkoutService.calculateCheckout(checkoutPayload);
      } else {
        throw calcError;
      }
    }
  }

  const subtotal = validatedItems.reduce((acc, it) => acc + (it.canCheckout ? it.subtotal : 0), 0);
  const totalItems = validatedItems.reduce((acc, it) => acc + (it.canCheckout ? it.quantity : 0), 0);

  return {
    cart: {
      _id: cartDoc._id,
      userId: cartDoc.userId,
      sessionId: cartDoc.sessionId,
      items: validatedItems,
      totalItems,
      totalKinds: validatedItems.length,
      subtotalOriginal: calculation?.subtotalOriginal || subtotal,
      subtotal: calculation?.subtotalAfterFlashSale || subtotal,
      totalFlashSaleDiscount: calculation?.totalFlashSaleDiscount || 0,
      totalPromotionDiscount: calculation?.totalPromotionDiscount || 0,
      appliedPromotion: calculation?.appliedPromotion || null,
      couponCode: cartDoc.couponCode || null,
      appliedCoupon: calculation?.appliedCoupon || null,
      couponDiscount: calculation?.couponDiscount || 0,
      totalDiscount: calculation?.totalDiscount || 0,
      finalTotal: calculation?.finalTotal ?? subtotal,
      giftPrograms: calculation?.gifts || [],
    },
    warnings,
    hasStockIssue,
    hasPriceChange,
  };
};

/**
 * Thêm một hoặc nhiều sản phẩm vào giỏ hàng (Check tồn kho khả dụng)
 * Hỗ trợ các định dạng:
 * - 1 item: { productId, variantId, sku, quantity }
 * - Mảng các items: [{ variantId, quantity }, { sku, quantity }]
 * - Object chứa items: { items: [...] }
 */
const addToCart = async (cartOwner, payload) => {
  let itemsList = [];
  if (Array.isArray(payload)) {
    itemsList = payload;
  } else if (payload && Array.isArray(payload.items)) {
    itemsList = payload.items;
  } else if (payload && typeof payload === 'object') {
    itemsList = [payload];
  }

  if (!itemsList || itemsList.length === 0) {
    throw new AppError('Vui lòng cung cấp ít nhất một sản phẩm để thêm vào giỏ hàng', 400);
  }

  // 1. Lấy hoặc tạo giỏ hàng
  const cart = await getOrCreateCart(cartOwner);

  // 2. Lặp qua từng item để phân giải và kiểm tra tồn kho
  for (let i = 0; i < itemsList.length; i++) {
    const item = itemsList[i];
    if (!item || typeof item !== 'object') {
      throw new AppError(`Dữ liệu sản phẩm tại vị trí #${i + 1} không hợp lệ`, 400);
    }

    const { productId, variantId, sku, quantity = 1 } = item;
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      throw new AppError(
        itemsList.length > 1
          ? `Số lượng sản phẩm tại vị trí #${i + 1} phải là số nguyên dương lớn hơn 0`
          : 'Số lượng sản phẩm thêm vào giỏ phải là số nguyên dương lớn hơn 0',
        400
      );
    }

    // Phân giải đúng Product và Variant theo SKU / variantId / productId
    const { product, variant } = await resolveVariantAndProduct({ productId, variantId, sku });

    if (product.isActive === false) {
      throw new AppError(`Sản phẩm "${product.name}" hiện đang tạm ngừng kinh doanh, không thể thêm vào giỏ`, 400);
    }

    // Kiểm tra tồn kho khả dụng
    const availableStock = getAvailableStock(variant);
    const variantTitle = `${product.name} ${!variant.isDefault ? `(${variant.displayName || variant.sku})` : ''}`.trim();

    if (availableStock <= 0) {
      throw new AppError(
        `Sản phẩm "${variantTitle}" (Mã SKU: ${variant.sku || 'N/A'}) hiện đã hết hàng trong kho`,
        400
      );
    }

    // Kiểm tra item đã tồn tại trong giỏ chưa (hoặc đã thêm ở vòng lặp trước đó trong cùng batch)
    const existingItemIndex = cart.items.findIndex(
      (cartItem) => cartItem.variantId.toString() === variant._id.toString()
    );

    const currentPrice = getSellingPrice(variant);

    if (existingItemIndex > -1) {
      const existingItem = cart.items[existingItemIndex];
      const newQty = existingItem.quantity + qty;

      if (newQty > availableStock) {
        const remainingCanAdd = Math.max(0, availableStock - existingItem.quantity);
        throw new AppError(
          `Bạn đã có ${existingItem.quantity} sản phẩm trong giỏ. Tồn kho khả dụng của "${variantTitle}" chỉ còn ${availableStock} cái (bạn chỉ có thể thêm tối đa ${remainingCanAdd} cái nữa)`,
          400
        );
      }

      existingItem.quantity = newQty;
      existingItem.priceAtAdded = currentPrice;
    } else {
      if (qty > availableStock) {
        throw new AppError(
          `Số lượng yêu cầu (${qty}) vượt quá tồn kho khả dụng hiện có (${availableStock}) của sản phẩm "${variantTitle}"`,
          400
        );
      }

      cart.items.push({
        productId: product._id,
        variantId: variant._id,
        sku: variant.sku || '',
        quantity: qty,
        priceAtAdded: currentPrice,
        selectedAttributes: variant.attributes || [],
      });
    }
  }

  cart.lastValidatedAt = new Date();
  await cart.save();

  return formatAndValidateCart(cart);
};

const addMultipleToCart = async (cartOwner, items) => {
  return addToCart(cartOwner, items);
};

/**
 * Cập nhật số lượng của một dòng sản phẩm trong giỏ
 */
const updateCartItemQuantity = async (cartOwner, itemId, quantity) => {
  if (!itemId || !mongoose.isValidObjectId(itemId)) {
    throw new AppError(`ID sản phẩm trong giỏ (itemId: "${itemId}") không hợp lệ`, 400);
  }

  const qty = parseInt(quantity, 10);
  if (isNaN(qty)) {
    throw new AppError('Số lượng cập nhật phải là một số hợp lệ', 400);
  }

  const cart = await getOrCreateCart(cartOwner);
  const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId.toString());

  if (itemIndex === -1) {
    throw new AppError('Không tìm thấy sản phẩm trong giỏ hàng để cập nhật', 404);
  }

  // Nếu số lượng <= 0 -> Xóa item khỏi giỏ
  if (qty <= 0) {
    cart.items.splice(itemIndex, 1);
    await cart.save();
    return formatAndValidateCart(cart);
  }

  // Nếu tăng số lượng -> Kiểm tra tồn kho khả dụng
  const targetItem = cart.items[itemIndex];
  const variant = await ProductVariant.findById(targetItem.variantId).populate('productId');

  if (!variant) {
    cart.items.splice(itemIndex, 1);
    await cart.save();
    throw new AppError('Biến thể sản phẩm này không còn tồn tại trên hệ thống và đã được gỡ khỏi giỏ hàng', 404);
  }

  const availableStock = getAvailableStock(variant);
  const variantTitle = `${variant.productId?.name || 'Sản phẩm'} (${variant.displayName || variant.sku})`;

  if (qty > availableStock) {
    throw new AppError(
      `Kho chỉ còn ${availableStock} sản phẩm khả dụng cho "${variantTitle}". Không thể tăng số lượng lên ${qty}`,
      400
    );
  }

  targetItem.quantity = qty;
  cart.lastValidatedAt = new Date();
  await cart.save();

  return formatAndValidateCart(cart);
};

/**
 * Xóa 1 dòng sản phẩm khỏi giỏ hàng
 */
const removeCartItem = async (cartOwner, itemId) => {
  if (!itemId || !mongoose.isValidObjectId(itemId)) {
    throw new AppError(`ID sản phẩm trong giỏ (itemId: "${itemId}") không hợp lệ`, 400);
  }

  const cart = await getOrCreateCart(cartOwner);
  const initialLength = cart.items.length;
  cart.items = cart.items.filter((item) => item._id.toString() !== itemId.toString());

  if (cart.items.length === initialLength) {
    throw new AppError('Không tìm thấy sản phẩm này trong giỏ hàng', 404);
  }

  cart.lastValidatedAt = new Date();
  await cart.save();

  return formatAndValidateCart(cart);
};

/**
 * Xóa sạch toàn bộ giỏ hàng
 */
const clearCart = async (cartOwner) => {
  const cart = await getOrCreateCart(cartOwner);
  cart.items = [];
  cart.couponCode = null;
  cart.lastValidatedAt = new Date();
  await cart.save();

  return formatAndValidateCart(cart);
};

/**
 * Áp dụng mã giảm giá Coupon vào giỏ hàng
 */
const applyCoupon = async (cartOwner, couponCode) => {
  if (!couponCode || typeof couponCode !== 'string' || !couponCode.trim()) {
    throw new AppError('Vui lòng nhập mã giảm giá', 400);
  }

  const cleanCode = couponCode.trim().toUpperCase();
  const cart = await getOrCreateCart(cartOwner);

  if (!cart.items || cart.items.length === 0) {
    throw new AppError('Giỏ hàng đang trống, không thể áp dụng mã giảm giá', 400);
  }

  cart.couponCode = cleanCode;
  await cart.save();

  // Validate qua formatAndValidateCart (gọi checkoutService)
  return formatAndValidateCart(cart);
};

/**
 * Gỡ mã giảm giá Coupon khỏi giỏ hàng
 */
const removeCoupon = async (cartOwner) => {
  const cart = await getOrCreateCart(cartOwner);
  cart.couponCode = null;
  await cart.save();

  return formatAndValidateCart(cart);
};

/**
 * Hợp nhất giỏ hàng của khách vãng lai (Guest) vào giỏ hàng người dùng khi Đăng nhập
 */
const mergeGuestCart = async (userId, sessionId) => {
  if (!userId) {
    return null;
  }
  const userCart = await getOrCreateCart({ userId, sessionId });
  return formatAndValidateCart(userCart);
};

/**
 * Kiểm tra xác thực tồn kho trước khi thanh toán (Checkout Guard)
 */
const validateCheckout = async (cartOwner) => {
  const result = await formatAndValidateCart(await getOrCreateCart(cartOwner));
  const { cart, warnings, hasStockIssue } = result;

  if (!cart.items || cart.items.length === 0) {
    throw new AppError('Giỏ hàng của bạn đang trống, không thể tiến hành đặt hàng', 400);
  }

  if (hasStockIssue) {
    const stockWarn = warnings.find(
      (w) => w.type === 'OUT_OF_STOCK' || w.type === 'STOCK_ADJUSTED'
    );
    throw new AppError(
      stockWarn?.message ||
        'Một số sản phẩm trong giỏ hàng đã hết hàng hoặc thay đổi tồn kho. Vui lòng kiểm tra lại giỏ hàng trước khi đặt hàng.',
      400
    );
  }

  return result;
};

module.exports = {
  getAvailableStock,
  resolveVariantAndProduct,
  getOrCreateCart,
  formatAndValidateCart,
  addToCart,
  addMultipleToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  applyCoupon,
  removeCoupon,
  mergeGuestCart,
  validateCheckout,
};
