import { create } from 'zustand';
import cartService from '@/services/cart.service';

const INITIAL_CART = {
  items: [],
  totalItems: 0,
  totalKinds: 0,
  subtotalOriginal: 0,
  subtotal: 0,
  totalFlashSaleDiscount: 0,
  totalPromotionDiscount: 0,
  appliedPromotion: null,
  couponCode: null,
  appliedCoupon: null,
  couponDiscount: 0,
  totalDiscount: 0,
  finalTotal: 0,
  giftPrograms: [],
};

export const useCartStore = create((set, get) => ({
  cart: INITIAL_CART,
  items: [],
  totalItems: 0,
  totalKinds: 0,
  warnings: [],
  hasStockIssue: false,
  hasPriceChange: false,
  isLoading: false,
  isUpdating: false,
  initialized: false,
  error: null,

  /**
   * Helper cập nhật state từ kết quả API Backend
   */
  _setCartData: (data) => {
    const cart = data?.cart || INITIAL_CART;
    set({
      cart,
      items: cart.items || [],
      totalItems: cart.totalItems || 0,
      totalKinds: cart.totalKinds || (cart.items?.length || 0),
      warnings: data?.warnings || [],
      hasStockIssue: Boolean(data?.hasStockIssue),
      hasPriceChange: Boolean(data?.hasPriceChange),
      error: null,
    });
  },

  /**
   * Tải giỏ hàng hiện tại từ Backend
   */
  fetchCart: async () => {
    try {
      set({ isLoading: true, error: null });
      const res = await cartService.getCart();
      if (res?.success && res?.data) {
        get()._setCartData(res.data);
      }
      set({ initialized: true });
    } catch (err) {
      console.error('Fetch cart error:', err);
      set({
        error: err.response?.data?.message || 'Không thể tải thông tin giỏ hàng',
        initialized: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Thêm 1 hoặc nhiều sản phẩm vào giỏ
   * @param {Object|Array} payload - { variantId, sku, productId, quantity } hoặc danh sách
   */
  addToCart: async (payload) => {
    try {
      set({ isUpdating: true, error: null });
      const res = await cartService.addToCart(payload);
      if (res?.success && res?.data) {
        get()._setCartData(res.data);
        return { success: true, message: res.message || 'Đã thêm vào giỏ hàng' };
      }
      return { success: false, message: res?.message || 'Thêm vào giỏ thất bại' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Thêm vào giỏ hàng thất bại';
      set({ error: msg });
      return { success: false, message: msg };
    } finally {
      set({ isUpdating: false });
    }
  },

  /**
   * Cập nhật số lượng của một dòng sản phẩm
   */
  updateQuantity: async (itemId, quantity) => {
    try {
      set({ isUpdating: true, error: null });
      const res = await cartService.updateItemQuantity(itemId, quantity);
      if (res?.success && res?.data) {
        get()._setCartData(res.data);
        return { success: true };
      }
      return { success: false, message: res?.message };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể cập nhật số lượng';
      set({ error: msg });
      // Re-fetch để khôi phục trạng thái chuẩn từ server
      get().fetchCart();
      return { success: false, message: msg };
    } finally {
      set({ isUpdating: false });
    }
  },

  /**
   * Xóa một sản phẩm khỏi giỏ hàng
   */
  removeItem: async (itemId) => {
    try {
      set({ isUpdating: true, error: null });
      const res = await cartService.removeItem(itemId);
      if (res?.success && res?.data) {
        get()._setCartData(res.data);
        return { success: true };
      }
      return { success: false, message: res?.message };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể xóa sản phẩm';
      set({ error: msg });
      return { success: false, message: msg };
    } finally {
      set({ isUpdating: false });
    }
  },

  /**
   * Xóa sạch toàn bộ giỏ hàng
   */
  clearCart: async () => {
    try {
      set({ isUpdating: true, error: null });
      const res = await cartService.clearCart();
      if (res?.success && res?.data) {
        get()._setCartData(res.data);
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể xóa giỏ hàng';
      set({ error: msg });
      return { success: false, message: msg };
    } finally {
      set({ isUpdating: false });
    }
  },

  /**
   * Áp dụng mã Coupon
   */
  applyCoupon: async (couponCode) => {
    try {
      set({ isUpdating: true, error: null });
      const res = await cartService.applyCoupon(couponCode);
      if (res?.success && res?.data) {
        get()._setCartData(res.data);
        return { success: true, message: res.message || 'Áp dụng mã giảm giá thành công' };
      }
      return { success: false, message: res?.message || 'Mã giảm giá không hợp lệ' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể áp dụng mã giảm giá';
      set({ error: msg });
      return { success: false, message: msg };
    } finally {
      set({ isUpdating: false });
    }
  },

  /**
   * Gỡ mã Coupon
   */
  removeCoupon: async () => {
    try {
      set({ isUpdating: true, error: null });
      const res = await cartService.removeCoupon();
      if (res?.success && res?.data) {
        get()._setCartData(res.data);
        return { success: true, message: 'Đã gỡ mã giảm giá' };
      }
      return { success: false };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể gỡ mã giảm giá';
      set({ error: msg });
      return { success: false, message: msg };
    } finally {
      set({ isUpdating: false });
    }
  },

  /**
   * Kiểm tra tính hợp lệ trước khi checkout
   */
  validateCheckout: async () => {
    try {
      const res = await cartService.validateCheckout();
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Giỏ hàng không đủ điều kiện đặt hàng';
      return { success: false, message: msg };
    }
  },
}));

export default useCartStore;
