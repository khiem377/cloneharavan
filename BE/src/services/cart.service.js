/**
 * Cart Service
 * Toàn bộ business logic cho giỏ hàng:
 *  - Guest Cart (guest_token cookie)
 *  - User Cart (user_id)
 *  - Price Engine
 *  - Merge Cart (trong MongoDB transaction)
 *  - Cart Validation
 */

const crypto     = require('crypto');
const mongoose   = require('mongoose');
const Cart       = require('../models/cart.model');
const { CART_STATUS } = require('../models/cart.model');
const CartItem   = require('../models/cartItem.model');
const Product    = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const { AppError } = require('../utils/AppError');

// ─── Constants ──────────────────────────────────────────────────────────────

const GUEST_CART_COOKIE  = 'guest_cart_token';
const GUEST_CART_TTL_DAYS = 30;
const MAX_ITEM_QUANTITY  = 100;

// Validation status codes
const ITEM_STATUS = {
  VALID:                'VALID',
  OUT_OF_STOCK:         'OUT_OF_STOCK',
  INSUFFICIENT_STOCK:   'INSUFFICIENT_STOCK',
  PRODUCT_UNAVAILABLE:  'PRODUCT_UNAVAILABLE',
  VARIANT_UNAVAILABLE:  'VARIANT_UNAVAILABLE',
  PRICE_CHANGED:        'PRICE_CHANGED',
  QUANTITY_ADJUSTED:    'QUANTITY_ADJUSTED',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Tạo guest_token an toàn bằng crypto.randomBytes
 */
const generateGuestToken = () => crypto.randomBytes(32).toString('hex');

/**
 * Cookie options cho guest_cart_token
 */
const guestCookieOptions = () => ({
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge:   GUEST_CART_TTL_DAYS * 24 * 60 * 60 * 1000,
  path:     '/',
});

/**
 * Price Engine: lấy giá hiện tại của một variant từ DB
 * Ưu tiên: variant.salePrice > variant.price > product.salePrice > product.price
 * KHÔNG tin giá từ frontend.
 */
const getCurrentPrice = (variant, product) => {
  // Giá effective của variant
  if (variant.salePrice != null && variant.salePrice > 0) {
    return variant.salePrice;
  }
  if (variant.price != null && variant.price > 0) {
    return variant.price;
  }
  // Fallback về giá sản phẩm cha
  if (product.salePrice != null && product.salePrice > 0) {
    return product.salePrice;
  }
  return product.price;
};

// ─── Cart Resolution ──────────────────────────────────────────────────────────

/**
 * Tìm User Cart ACTIVE. Tạo mới nếu chưa tồn tại.
 */
const getOrCreateUserCart = async (userId) => {
  let cart = await Cart.findOne({ user_id: userId, status: CART_STATUS.ACTIVE });
  if (!cart) {
    cart = await Cart.create({ user_id: userId, status: CART_STATUS.ACTIVE });
  }
  return cart;
};

/**
 * Tìm Guest Cart từ token. Trả null nếu không tìm thấy.
 */
const findGuestCart = async (guestToken) => {
  if (!guestToken) return null;
  return Cart.findOne({ guest_token: guestToken, status: CART_STATUS.ACTIVE });
};

/**
 * Tạo Guest Cart mới + set cookie trên response.
 */
const createGuestCart = async (res) => {
  const token     = generateGuestToken();
  const expiresAt = new Date(Date.now() + GUEST_CART_TTL_DAYS * 24 * 60 * 60 * 1000);

  const cart = await Cart.create({
    guest_token: token,
    status:      CART_STATUS.ACTIVE,
    expires_at:  expiresAt,
  });

  res.cookie(GUEST_CART_COOKIE, token, guestCookieOptions());
  return cart;
};

/**
 * resolveCart: xác định Cart hiện tại từ request.
 * - Có JWT (req.user) → User Cart
 * - Có guest_cart_token cookie → Guest Cart
 * - Không có gì → null (chưa tạo Cart)
 */
const resolveCart = async (req) => {
  if (req.user) {
    return getOrCreateUserCart(req.user._id);
  }

  const guestToken = req.cookies?.[GUEST_CART_COOKIE];
  if (guestToken) {
    return findGuestCart(guestToken);
  }

  return null;
};

// ─── Cart Summary & Population ────────────────────────────────────────────────

/**
 * Populate items của cart và tính Cart Summary.
 * summary chỉ có giá trị tham khảo — Checkout phải tính lại.
 */
const getCartWithSummary = async (cart) => {
  if (!cart) return null;

  const items = await CartItem.find({ cart_id: cart._id })
    .populate({
      path:   'product_id',
      select: 'name slug thumbnail status isActive price salePrice',
    })
    .populate({
      path:   'variant_id',
      select: 'sku displayName attributes thumbnail price salePrice stock isActive',
    })
    .lean();

  // Tính summary dựa trên giá hiện tại từ DB (không dùng snapshot)
  let subtotal   = 0;
  let itemCount  = 0;
  const warnings = [];

  const enrichedItems = items.map((item) => {
    const product = item.product_id;
    const variant = item.variant_id;

    // Kiểm tra product/variant còn tồn tại
    if (!product || !variant) {
      warnings.push({
        itemId:  item._id,
        message: 'Sản phẩm không còn tồn tại trong hệ thống',
        status:  ITEM_STATUS.PRODUCT_UNAVAILABLE,
      });
      return item;
    }

    const currentPrice = getCurrentPrice(variant, product);
    const lineTotal    = currentPrice * item.quantity;

    subtotal  += lineTotal;
    itemCount += item.quantity;

    return {
      ...item,
      currentPrice,
      lineTotal,
    };
  });

  const cartObj = cart.toObject ? cart.toObject() : cart;

  return {
    ...cartObj,
    cartType: cart.user_id ? 'user' : 'guest',
    items:    enrichedItems,
    summary: {
      subtotal,
      discount: 0, // Promotion Engine sẽ bổ sung sau
      total:    subtotal,
      itemCount,
    },
    warnings,
  };
};

// ─── Core Cart Operations ─────────────────────────────────────────────────────

/**
 * Thêm sản phẩm vào giỏ.
 * - Nếu variant đã tồn tại → tăng quantity
 * - Nếu chưa có → tạo CartItem mới
 * - Tự động tạo Guest Cart + set cookie nếu chưa có cart
 *
 * @returns { cart, isFirstAdd } — isFirstAdd=true khi Guest thêm lần đầu tiên
 */
const addItemToCart = async (req, res, variantId, quantity) => {
  // 1. Validate input
  if (!variantId) throw new AppError('variantId là bắt buộc', 400);
  if (!quantity || quantity < 1) throw new AppError('Số lượng phải lớn hơn 0', 400);
  if (quantity > MAX_ITEM_QUANTITY) throw new AppError(`Số lượng tối đa là ${MAX_ITEM_QUANTITY}`, 400);

  // 2. Validate Variant + Product từ DB
  const variant = await ProductVariant.findById(variantId);
  if (!variant) throw new AppError('Biến thể sản phẩm không tồn tại', 404);
  if (!variant.isActive) throw new AppError('Biến thể sản phẩm không còn hoạt động', 400);

  const product = await Product.findById(variant.productId);
  if (!product) throw new AppError('Sản phẩm không tồn tại', 404);
  if (!product.isActive) throw new AppError('Sản phẩm không còn kinh doanh', 400);
  if (product.status === 'draft') throw new AppError('Sản phẩm chưa được công bố', 400);

  // 3. Kiểm tra tồn kho (chỉ cảnh báo tại đây, không lock stock)
  if (variant.stock <= 0) throw new AppError('Sản phẩm đã hết hàng', 400);

  // 4. Resolve / tạo cart
  let cart       = await resolveCart(req);
  let isFirstAdd = false;

  if (!cart) {
    if (req.user) {
      cart = await getOrCreateUserCart(req.user._id);
    } else {
      // Guest thêm sản phẩm đầu tiên → tạo Guest Cart
      cart       = await createGuestCart(res);
      isFirstAdd = true;
    }
  }

  // Kiểm tra xem đây là lần add đầu tiên của Guest (cart vừa tạo)
  // hoặc cart mới tạo (chưa có item nào)
  if (!req.user && !isFirstAdd) {
    const existingCount = await CartItem.countDocuments({ cart_id: cart._id });
    isFirstAdd = existingCount === 0;
  }

  // 5. Lấy giá hiện tại từ DB (Price Engine)
  const currentPrice = getCurrentPrice(variant, product);

  // 6. Kiểm tra số lượng sẽ thêm không vượt tồn kho
  const existingItem = await CartItem.findOne({
    cart_id:    cart._id,
    variant_id: variantId,
  });

  const currentQty  = existingItem?.quantity ?? 0;
  const newQty      = currentQty + quantity;

  if (newQty > variant.stock) {
    throw new AppError(
      `Số lượng yêu cầu (${newQty}) vượt quá tồn kho hiện có (${variant.stock})`,
      400
    );
  }

  // 7. Upsert: tăng qty nếu đã tồn tại, tạo mới nếu chưa có
  await CartItem.findOneAndUpdate(
    { cart_id: cart._id, variant_id: variantId },
    {
      $set: {
        product_id:           variant.productId,
        unit_price_snapshot:  currentPrice,
      },
      $inc: { quantity },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // 8. Tăng version (optimistic concurrency)
  await Cart.findByIdAndUpdate(cart._id, { $inc: { version: 1 } });

  // 9. Trả về cart với summary
  const updatedCart = await Cart.findById(cart._id);
  const cartData    = await getCartWithSummary(updatedCart);

  return { cart: cartData, isFirstAdd };
};

/**
 * Cập nhật số lượng CartItem.
 * quantity = 0 sẽ bị reject — dùng DELETE để xóa item.
 */
const updateItemQuantity = async (req, itemId, quantity) => {
  if (!quantity || quantity < 1) throw new AppError('Số lượng phải lớn hơn 0. Dùng DELETE để xóa sản phẩm', 400);
  if (quantity > MAX_ITEM_QUANTITY) throw new AppError(`Số lượng tối đa là ${MAX_ITEM_QUANTITY}`, 400);

  const cart = await resolveCart(req);
  if (!cart) throw new AppError('Không tìm thấy giỏ hàng', 404);

  // Tìm item và đảm bảo thuộc cart hiện tại (tránh IDOR)
  const item = await CartItem.findOne({ _id: itemId, cart_id: cart._id });
  if (!item) throw new AppError('Không tìm thấy sản phẩm trong giỏ hàng', 404);

  // Validate variant còn hoạt động
  const variant = await ProductVariant.findById(item.variant_id);
  if (!variant || !variant.isActive) throw new AppError('Biến thể sản phẩm không còn hoạt động', 400);

  const product = await Product.findById(item.product_id);
  if (!product || !product.isActive) throw new AppError('Sản phẩm không còn kinh doanh', 400);

  // Kiểm tra tồn kho
  if (quantity > variant.stock) {
    throw new AppError(
      `Số lượng yêu cầu (${quantity}) vượt quá tồn kho hiện có (${variant.stock})`,
      400
    );
  }

  // Cập nhật price snapshot (giá có thể thay đổi)
  const currentPrice = getCurrentPrice(variant, product);

  await CartItem.findByIdAndUpdate(itemId, {
    quantity,
    unit_price_snapshot: currentPrice,
  });

  // Tăng version
  await Cart.findByIdAndUpdate(cart._id, { $inc: { version: 1 } });

  const updatedCart = await Cart.findById(cart._id);
  return getCartWithSummary(updatedCart);
};

/**
 * Xóa một CartItem.
 * Đảm bảo item thuộc cart của user/guest hiện tại (tránh IDOR).
 */
const removeItem = async (req, itemId) => {
  const cart = await resolveCart(req);
  if (!cart) throw new AppError('Không tìm thấy giỏ hàng', 404);

  const item = await CartItem.findOne({ _id: itemId, cart_id: cart._id });
  if (!item) throw new AppError('Không tìm thấy sản phẩm trong giỏ hàng', 404);

  await CartItem.findByIdAndDelete(itemId);
  await Cart.findByIdAndUpdate(cart._id, { $inc: { version: 1 } });

  const updatedCart = await Cart.findById(cart._id);
  return getCartWithSummary(updatedCart);
};

/**
 * Xóa toàn bộ CartItem của cart hiện tại.
 * Chỉ xóa items, không xóa Cart document.
 */
const clearCart = async (req) => {
  const cart = await resolveCart(req);
  if (!cart) throw new AppError('Không tìm thấy giỏ hàng', 404);

  await CartItem.deleteMany({ cart_id: cart._id });
  await Cart.findByIdAndUpdate(cart._id, { $inc: { version: 1 } });

  const updatedCart = await Cart.findById(cart._id);
  return getCartWithSummary(updatedCart);
};

// ─── Merge Cart ───────────────────────────────────────────────────────────────

/**
 * Merge Guest Cart vào User Cart sau khi đăng nhập/đăng ký.
 * Chạy trong MongoDB transaction — rollback toàn bộ nếu có lỗi.
 *
 * Logic merge:
 * - Cùng variant_id → cộng quantity, kiểm tra stock, điều chỉnh nếu vượt
 * - Khác variant_id → thêm vào User Cart như CartItem mới
 * - Guest Cart sau merge → chuyển status = MERGED
 *
 * @returns { cart, adjustedItems, warnings }
 */
const mergeGuestCartToUser = async (guestToken, userId, res) => {
  if (!guestToken) {
    // Không có Guest Cart → trả User Cart hiện tại
    const userCart = await getOrCreateUserCart(userId);
    return { cart: await getCartWithSummary(userCart), adjustedItems: [], warnings: [] };
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Lấy Guest Cart
    const guestCart = await Cart.findOne({
      guest_token: guestToken,
      status:      CART_STATUS.ACTIVE,
    }).session(session);

    if (!guestCart) {
      // Guest Cart không còn tồn tại → trả User Cart
      await session.commitTransaction();
      session.endSession();
      const userCart = await getOrCreateUserCart(userId);
      return { cart: await getCartWithSummary(userCart), adjustedItems: [], warnings: [] };
    }

    // 2. Lấy/tạo User Cart
    let userCart = await Cart.findOne({
      user_id: userId,
      status:  CART_STATUS.ACTIVE,
    }).session(session);

    if (!userCart) {
      [userCart] = await Cart.create([{ user_id: userId, status: CART_STATUS.ACTIVE }], { session });
    }

    // 3. Lấy tất cả Guest Cart Items
    const guestItems = await CartItem.find({ cart_id: guestCart._id }).session(session);

    const adjustedItems = [];
    const warnings      = [];

    // 4. Merge từng item
    for (const guestItem of guestItems) {
      const variant = await ProductVariant.findById(guestItem.variant_id).session(session);
      const product = variant
        ? await Product.findById(variant.productId).session(session)
        : null;

      // Kiểm tra Product/Variant còn hoạt động
      if (!variant || !variant.isActive || !product || !product.isActive) {
        warnings.push({
          variantId: guestItem.variant_id,
          status:    ITEM_STATUS.VARIANT_UNAVAILABLE,
          message:   'Sản phẩm không còn hoạt động, đã bỏ qua khi merge',
        });
        continue;
      }

      const currentPrice = getCurrentPrice(variant, product);

      // Tìm item cùng variant trong User Cart
      const userItem = await CartItem.findOne({
        cart_id:    userCart._id,
        variant_id: guestItem.variant_id,
      }).session(session);

      if (userItem) {
        // Cùng variant → cộng quantity
        let mergedQty = userItem.quantity + guestItem.quantity;

        if (mergedQty > variant.stock) {
          adjustedItems.push({
            variantId:          guestItem.variant_id,
            requestedQuantity:  mergedQty,
            adjustedQuantity:   variant.stock,
            status:             ITEM_STATUS.QUANTITY_ADJUSTED,
            message:            `Số lượng đã được điều chỉnh từ ${mergedQty} xuống ${variant.stock} do tồn kho không đủ`,
          });
          mergedQty = variant.stock;
        }

        await CartItem.findByIdAndUpdate(
          userItem._id,
          { quantity: mergedQty, unit_price_snapshot: currentPrice },
          { session }
        );
      } else {
        // Khác variant → tạo item mới trong User Cart
        let qty = guestItem.quantity;

        if (qty > variant.stock) {
          adjustedItems.push({
            variantId:          guestItem.variant_id,
            requestedQuantity:  qty,
            adjustedQuantity:   variant.stock,
            status:             ITEM_STATUS.QUANTITY_ADJUSTED,
            message:            `Số lượng đã được điều chỉnh từ ${qty} xuống ${variant.stock} do tồn kho không đủ`,
          });
          qty = variant.stock;
        }

        if (qty > 0) {
          await CartItem.create(
            [{
              cart_id:             userCart._id,
              product_id:          variant.productId,
              variant_id:          guestItem.variant_id,
              quantity:            qty,
              unit_price_snapshot: currentPrice,
            }],
            { session }
          );
        }
      }
    }

    // 5. Đánh dấu Guest Cart đã merge
    await Cart.findByIdAndUpdate(
      guestCart._id,
      { status: CART_STATUS.MERGED },
      { session }
    );

    // 6. Tăng version User Cart
    await Cart.findByIdAndUpdate(userCart._id, { $inc: { version: 1 } }, { session });

    await session.commitTransaction();
    session.endSession();

    // 7. Xóa cookie Guest Cart
    res.clearCookie(GUEST_CART_COOKIE, { path: '/' });

    // 8. Trả về User Cart sau merge
    const finalCart = await Cart.findById(userCart._id);
    const cartData  = await getCartWithSummary(finalCart);

    return { cart: cartData, adjustedItems, warnings };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// ─── Cart Validation ──────────────────────────────────────────────────────────

/**
 * Validate toàn bộ Cart trước Checkout.
 * Kiểm tra từng item: product, variant, stock, price thay đổi.
 * Trả chi tiết từng item lỗi — không chỉ trả valid: false.
 */
const validateCart = async (req) => {
  const cart = await resolveCart(req);

  if (!cart) {
    return { isValid: false, items: [], message: 'Giỏ hàng trống hoặc không tồn tại' };
  }

  const items = await CartItem.find({ cart_id: cart._id }).lean();

  if (items.length === 0) {
    return { isValid: false, items: [], message: 'Giỏ hàng không có sản phẩm nào' };
  }

  const result  = [];
  let   isValid = true;

  for (const item of items) {
    const itemResult = {
      itemId:    item._id,
      variantId: item.variant_id,
      productId: item.product_id,
      quantity:  item.quantity,
      status:    ITEM_STATUS.VALID,
      message:   null,
    };

    // Kiểm tra Product
    const product = await Product.findById(item.product_id).lean();
    if (!product || !product.isActive) {
      itemResult.status  = ITEM_STATUS.PRODUCT_UNAVAILABLE;
      itemResult.message = 'Sản phẩm không còn tồn tại hoặc không còn kinh doanh';
      isValid            = false;
      result.push(itemResult);
      continue;
    }

    if (product.status === 'draft') {
      itemResult.status  = ITEM_STATUS.PRODUCT_UNAVAILABLE;
      itemResult.message = 'Sản phẩm chưa được công bố';
      isValid            = false;
      result.push(itemResult);
      continue;
    }

    // Kiểm tra Variant
    const variant = await ProductVariant.findById(item.variant_id).lean();
    if (!variant || !variant.isActive) {
      itemResult.status  = ITEM_STATUS.VARIANT_UNAVAILABLE;
      itemResult.message = 'Biến thể sản phẩm không còn hoạt động';
      isValid            = false;
      result.push(itemResult);
      continue;
    }

    // Kiểm tra tồn kho
    if (variant.stock <= 0) {
      itemResult.status             = ITEM_STATUS.OUT_OF_STOCK;
      itemResult.message            = 'Sản phẩm đã hết hàng';
      itemResult.availableQuantity  = 0;
      isValid                       = false;
      result.push(itemResult);
      continue;
    }

    if (item.quantity > variant.stock) {
      itemResult.status              = ITEM_STATUS.INSUFFICIENT_STOCK;
      itemResult.message             = `Tồn kho không đủ. Có sẵn: ${variant.stock}`;
      itemResult.requestedQuantity   = item.quantity;
      itemResult.availableQuantity   = variant.stock;
      isValid                        = false;
      result.push(itemResult);
      continue;
    }

    // Kiểm tra giá thay đổi
    const currentPrice = getCurrentPrice(variant, product);
    if (item.unit_price_snapshot != null && item.unit_price_snapshot !== currentPrice) {
      itemResult.status       = ITEM_STATUS.PRICE_CHANGED;
      itemResult.message      = 'Giá sản phẩm đã thay đổi';
      itemResult.oldPrice     = item.unit_price_snapshot;
      itemResult.currentPrice = currentPrice;
      // PRICE_CHANGED là warning — không block checkout nhưng cần thông báo
    }

    itemResult.currentPrice = currentPrice;
    result.push(itemResult);
  }

  return { isValid, items: result };
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  GUEST_CART_COOKIE,
  ITEM_STATUS,
  resolveCart,
  getCartWithSummary,
  addItemToCart,
  updateItemQuantity,
  removeItem,
  clearCart,
  mergeGuestCartToUser,
  validateCart,
};
