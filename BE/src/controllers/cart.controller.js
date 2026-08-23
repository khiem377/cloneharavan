/**
 * Cart Controller
 * Xử lý các request liên quan đến giỏ hàng.
 * Tất cả business logic nằm trong cart.service.js.
 */

const cartService = require('../services/cart.service');
const { AppError }  = require('../utils/AppError');

// ─── GET /api/cart ────────────────────────────────────────────────────────────
/**
 * Lấy giỏ hàng hiện tại.
 * - Có JWT → User Cart
 * - Có guest_cart_token cookie → Guest Cart
 * - Không có gì → { cart: null }
 */
const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.resolveCart(req);

    if (!cart) {
      return res.status(200).json({
        status:  'success',
        data:    { cart: null },
        message: 'Giỏ hàng trống',
      });
    }

    const cartData = await cartService.getCartWithSummary(cart);

    res.status(200).json({
      status: 'success',
      data:   { cart: cartData },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/cart/items ─────────────────────────────────────────────────────
/**
 * Thêm sản phẩm/variant vào giỏ hàng.
 * Request body: { variantId, quantity }
 *
 * Backend tự lấy product_id, giá, trạng thái từ DB.
 * Tuyệt đối không tin price/productName/discount từ frontend.
 *
 * Response trả isFirstAdd=true khi Guest thêm lần đầu (để FE hiện popup).
 */
const addItem = async (req, res, next) => {
  try {
    const { variantId, quantity = 1 } = req.body;

    if (!variantId) {
      throw new AppError('variantId là bắt buộc', 400);
    }

    const { cart, isFirstAdd } = await cartService.addItemToCart(
      req,
      res,
      variantId,
      Number(quantity)
    );

    res.status(200).json({
      status:  'success',
      message: 'Đã thêm sản phẩm vào giỏ hàng',
      data: {
        cart,
        isFirstAdd, // Frontend dùng để hiện popup Guest Cart lần đầu
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/cart/items/:itemId ────────────────────────────────────────────
/**
 * Cập nhật số lượng CartItem.
 * Request body: { quantity }
 *
 * quantity phải > 0. Dùng DELETE để xóa item.
 * Backend kiểm tra tồn kho và trạng thái variant trước khi update.
 */
const updateItem = async (req, res, next) => {
  try {
    const { itemId }   = req.params;
    const { quantity } = req.body;

    if (quantity == null) {
      throw new AppError('quantity là bắt buộc', 400);
    }

    const cart = await cartService.updateItemQuantity(req, itemId, Number(quantity));

    res.status(200).json({
      status:  'success',
      message: 'Đã cập nhật số lượng',
      data:    { cart },
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/cart/items/:itemId ──────────────────────────────────────────
/**
 * Xóa một sản phẩm khỏi giỏ hàng.
 * Backend đảm bảo item thuộc cart hiện tại (tránh IDOR).
 */
const removeItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const cart = await cartService.removeItem(req, itemId);

    res.status(200).json({
      status:  'success',
      message: 'Đã xóa sản phẩm khỏi giỏ hàng',
      data:    { cart },
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/cart ─────────────────────────────────────────────────────────
/**
 * Xóa toàn bộ CartItem của giỏ hàng hiện tại.
 * Không xóa Cart document, không ảnh hưởng cart của user khác.
 */
const clearCart = async (req, res, next) => {
  try {
    const cart = await cartService.clearCart(req);

    res.status(200).json({
      status:  'success',
      message: 'Đã xóa toàn bộ giỏ hàng',
      data:    { cart },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/cart/merge ─────────────────────────────────────────────────────
/**
 * Merge Guest Cart vào User Cart sau khi đăng nhập/đăng ký.
 * Chỉ cho phép user đã đăng nhập (route dùng protect middleware).
 *
 * Backend lấy guest_token từ cookie, merge trong transaction:
 * - Cùng variant → cộng quantity, kiểm tra stock
 * - Khác variant → thêm item mới
 * - Guest Cart → chuyển MERGED
 *
 * Response trả: cart sau merge, adjustedItems và warnings.
 */
const mergeCart = async (req, res, next) => {
  try {
    const guestToken = req.cookies?.[cartService.GUEST_CART_COOKIE];

    const { cart, adjustedItems, warnings } = await cartService.mergeGuestCartToUser(
      guestToken,
      req.user._id,
      res
    );

    res.status(200).json({
      status:  'success',
      message: 'Đã hợp nhất giỏ hàng thành công',
      data: {
        cart,
        adjustedItems, // Items bị điều chỉnh số lượng do vượt tồn kho
        warnings,      // Sản phẩm không còn hoạt động, bỏ qua khi merge
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/cart/validate ──────────────────────────────────────────────────
/**
 * Validate toàn bộ Cart trước Checkout.
 * Kiểm tra từng item: product, variant, stock, giá thay đổi.
 *
 * Response chỉ rõ từng CartItem bị lỗi với status code cụ thể:
 * VALID | OUT_OF_STOCK | INSUFFICIENT_STOCK | PRODUCT_UNAVAILABLE |
 * VARIANT_UNAVAILABLE | PRICE_CHANGED | QUANTITY_ADJUSTED
 */
const validateCart = async (req, res, next) => {
  try {
    const result = await cartService.validateCart(req);

    res.status(200).json({
      status: 'success',
      data:   result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  mergeCart,
  validateCart,
};
