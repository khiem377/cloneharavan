const cartService = require('../services/cart.service');

const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getOrCreateCart(req.cartOwner);
    const result = await cartService.formatAndValidateCart(cart);
    res.json({
      success: true,
      message: 'Lấy dữ liệu giỏ hàng thành công',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { productId, variantId, sku, quantity } = req.body;
    const result = await cartService.addToCart(req.cartOwner, {
      productId,
      variantId,
      sku,
      quantity,
    });
    res.status(200).json({
      success: true,
      message: 'Đã thêm sản phẩm vào giỏ hàng thành công',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItemQuantity = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const result = await cartService.updateCartItemQuantity(req.cartOwner, itemId, quantity);
    res.json({
      success: true,
      message: 'Cập nhật số lượng sản phẩm trong giỏ thành công',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const result = await cartService.removeCartItem(req.cartOwner, itemId);
    res.json({
      success: true,
      message: 'Đã xóa sản phẩm khỏi giỏ hàng',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const result = await cartService.clearCart(req.cartOwner);
    res.json({
      success: true,
      message: 'Đã làm trống giỏ hàng thành công',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const applyCoupon = async (req, res, next) => {
  try {
    const { couponCode } = req.body;
    const result = await cartService.applyCoupon(req.cartOwner, couponCode);
    res.json({
      success: true,
      message: `Đã áp dụng mã giảm giá "${couponCode.trim().toUpperCase()}" thành công`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const removeCoupon = async (req, res, next) => {
  try {
    const result = await cartService.removeCoupon(req.cartOwner);
    res.json({
      success: true,
      message: 'Đã gỡ mã giảm giá khỏi giỏ hàng',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const mergeGuestCart = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const guestSessionId = req.body.sessionId || req.cartOwner.sessionId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Bạn cần đăng nhập để hợp nhất giỏ hàng',
      });
    }

    const result = await cartService.mergeGuestCart(userId, guestSessionId);
    res.json({
      success: true,
      message: 'Hợp nhất giỏ hàng thành công',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const validateCheckout = async (req, res, next) => {
  try {
    const result = await cartService.validateCheckout(req.cartOwner);
    res.json({
      success: true,
      message: 'Giỏ hàng hợp lệ, có thể tiến hành đặt hàng',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  applyCoupon,
  removeCoupon,
  mergeGuestCart,
  validateCheckout,
};
