'use client';

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
  selectedItemIds: [], // Danh sách ID các sản phẩm được chọn (mặc định rỗng: 0 sản phẩm, 0 đ)
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
    const items = cart.items || [];
    const validIds = new Set(items.map((i) => i._id));
    const currentSelected = get().selectedItemIds || [];
    // Lọc lại chỉ giữ các item id còn tồn tại trong giỏ
    const updatedSelected = currentSelected.filter((id) => validIds.has(id));

    set({
      cart,
      items,
      totalItems: cart.totalItems || 0,
      totalKinds: cart.totalKinds || items.length,
      selectedItemIds: updatedSelected,
      warnings: data?.warnings || [],
      hasStockIssue: Boolean(data?.hasStockIssue),
      hasPriceChange: Boolean(data?.hasPriceChange),
      error: null,
    });
  },

  /**
   * Chọn / Bỏ chọn một sản phẩm
   */
  toggleSelectItem: (itemId) => {
    const { selectedItemIds, items } = get();
    const target = items.find((i) => i._id === itemId);
    if (!target) return;
    // Không cho chọn sản phẩm hết hàng
    const isOutOfStock =
      Boolean(target.isOutOfStock) ||
      (target.availableStock !== undefined && target.availableStock <= 0);
    if (isOutOfStock) return;

    if (selectedItemIds.includes(itemId)) {
      set({ selectedItemIds: selectedItemIds.filter((id) => id !== itemId) });
    } else {
      set({ selectedItemIds: [...selectedItemIds, itemId] });
    }
  },

  /**
   * Chọn tất cả hoặc Bỏ chọn tất cả
   */
  toggleSelectAll: (checked) => {
    const { items } = get();
    if (!checked) {
      set({ selectedItemIds: [] });
    } else {
      // Chỉ chọn các sản phẩm còn hàng
      const availableIds = items
        .filter(
          (i) =>
            !i.isOutOfStock &&
            (i.availableStock === undefined || i.availableStock > 0)
        )
        .map((i) => i._id);
      set({ selectedItemIds: availableIds });
    }
  },

  /**
   * Xóa tất cả các sản phẩm đang được tích chọn
   */
  removeSelectedItems: async () => {
    const { selectedItemIds, removeItem } = get();
    if (!selectedItemIds || selectedItemIds.length === 0)
      return { success: false, count: 0 };
    set({ isUpdating: true });
    try {
      const idsToDelete = [...selectedItemIds];
      for (const id of idsToDelete) {
        await removeItem(id);
      }
      set({ selectedItemIds: [] });
      return { success: true, count: idsToDelete.length };
    } finally {
      set({ isUpdating: false });
    }
  },

  /**
   * Tính tổng tiền tạm tính của các sản phẩm được chọn
   */
  getSelectedSubtotal: () => {
    const { items, selectedItemIds } = get();
    return items
      .filter((i) => selectedItemIds.includes(i._id))
      .reduce(
        (sum, item) =>
          sum +
          (Number(item.subtotal) ||
            Number(item.unitPrice) * Number(item.quantity) ||
            0),
        0
      );
  },

  /**
   * Lấy danh sách item object đang được chọn
   */
  getSelectedItems: () => {
    const { items, selectedItemIds } = get();
    return items.filter((i) => selectedItemIds.includes(i._id));
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
        error:
          err.response?.data?.message || 'Không thể tải thông tin giỏ hàng',
        initialized: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Thêm 1 hoặc nhiều sản phẩm vào giỏ
   */
  addToCart: async (payload) => {
    try {
      set({ isUpdating: true, error: null });
      const res = await cartService.addToCart(payload);
      if (res?.success && res?.data) {
        get()._setCartData(res.data);
        return {
          success: true,
          message: res.message || 'Đã thêm vào giỏ hàng',
        };
      }
      return {
        success: false,
        message: res?.message || 'Thêm vào giỏ thất bại',
      };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Thêm vào giỏ hàng thất bại';
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
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Không thể cập nhật số lượng';
      set({ error: msg });
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
      const msg =
        err.response?.data?.message || err.message || 'Không thể xóa sản phẩm';
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
        set({ selectedItemIds: [] });
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || 'Không thể xóa giỏ hàng';
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
        return {
          success: true,
          message: res.message || 'Áp dụng mã giảm giá thành công',
        };
      }
      return {
        success: false,
        message: res?.message || 'Mã giảm giá không hợp lệ',
      };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Không thể áp dụng mã giảm giá';
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
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Không thể gỡ mã giảm giá';
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
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Giỏ hàng không đủ điều kiện đặt hàng';
      return { success: false, message: msg };
    }
  },
}));

export default useCartStore;
