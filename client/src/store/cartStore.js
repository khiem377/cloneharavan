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
  cartHud: {
    visible: false,
    status: 'idle', // 'idle' | 'loading' | 'success' | 'error'
    message: '',
  },
  _hudTimeout: null,

  showCartHud: (status = 'loading', message = '') => {
    const prev = get()._hudTimeout;
    if (prev) clearTimeout(prev);
    set({
      cartHud: { visible: true, status, message },
      _hudTimeout: null,
    });
  },

  hideCartHud: () => {
    const prev = get()._hudTimeout;
    if (prev) clearTimeout(prev);
    set({
      cartHud: { visible: false, status: 'idle', message: '' },
      _hudTimeout: null,
    });
  },
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
  _setCartData: (data, overrideSelectedIds = null) => {
    const cart = data?.cart || INITIAL_CART;
    const items = cart.items || [];
    const validIds = new Set(items.map((i) => i._id));

    let updatedSelected = [];

    if (Array.isArray(overrideSelectedIds)) {
      // Ưu tiên lựa chọn chỉ định (ví dụ Mua Ngay chỉ chọn đúng món vừa thêm)
      updatedSelected = overrideSelectedIds.filter((id) => validIds.has(id));
    } else {
      const currentSelected = get().selectedItemIds || [];
      let storedIds = [];
      if (typeof window !== 'undefined') {
        try {
          const raw = sessionStorage.getItem('checkoutItemIds');
          if (raw) storedIds = JSON.parse(raw);
        } catch (_) {}
      }

      const candidateIds = currentSelected.length > 0 ? currentSelected : storedIds;
      updatedSelected = candidateIds.filter((id) => validIds.has(id));

      // Chỉ khi chưa hề có lựa chọn nào trước đó mới chọn tất cả sản phẩm còn hàng
      if (updatedSelected.length === 0 && candidateIds.length === 0 && items.length > 0) {
        updatedSelected = items
          .filter(
            (i) =>
              !i.isOutOfStock &&
              (i.availableStock === undefined || i.availableStock > 0)
          )
          .map((i) => i._id);
      }
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('checkoutItemIds', JSON.stringify(updatedSelected));
    }

    // ĐỒNG BỘ TOÀN VẸN GÓI COMBO:
    // Nếu có bất kỳ món nào trong combo được chọn, toàn bộ các món cùng combo (còn hàng) phải được chọn
    const comboMap = new Map();
    items.forEach((item) => {
      if (item.isComboItem && item.comboId) {
        const cId = String(item.comboId);
        if (!comboMap.has(cId)) comboMap.set(cId, []);
        comboMap.get(cId).push(item);
      }
    });

    comboMap.forEach((cItems) => {
      const selectedCount = cItems.filter((it) => updatedSelected.includes(it._id)).length;
      if (selectedCount > 0 && selectedCount < cItems.length) {
        const anyOos = cItems.some((it) => it.isOutOfStock || (it.availableStock !== undefined && it.availableStock <= 0));
        if (anyOos) {
          // Bỏ chọn tất cả nếu có món hết hàng
          updatedSelected = updatedSelected.filter((id) => !cItems.some((it) => it._id === id));
        } else {
          // Tự động chọn trọn bộ combo
          cItems.forEach((it) => {
            if (!updatedSelected.includes(it._id)) {
              updatedSelected.push(it._id);
            }
          });
        }
      }
    });

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
   * Chọn / Bỏ chọn một sản phẩm (Kèm đồng bộ trọn bộ Combo)
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

    // RÀNG BUỘC GÓI COMBO: Tự động chọn hoặc bỏ chọn toàn bộ sản phẩm cùng combo
    if (target.isComboItem && target.comboId) {
      const comboItems = items.filter(
        (i) => i.isComboItem && String(i.comboId) === String(target.comboId)
      );

      const hasOosComboItem = comboItems.some(
        (i) => Boolean(i.isOutOfStock) || (i.availableStock !== undefined && i.availableStock <= 0)
      );

      if (hasOosComboItem) {
        get().showCartHud('error', 'Một số sản phẩm trong gói combo hiện đã hết hàng, không thể đặt mua combo.');
        return;
      }

      const comboItemIds = comboItems.map((i) => i._id);
      const isCurrentlySelected = selectedItemIds.includes(itemId);

      if (isCurrentlySelected) {
        // Bỏ chọn tất cả sản phẩm thuộc combo này
        const newSelected = selectedItemIds.filter((id) => !comboItemIds.includes(id));
        set({ selectedItemIds: newSelected });
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('checkoutItemIds', JSON.stringify(newSelected));
        }
      } else {
        // Chọn tất cả sản phẩm thuộc combo này
        const newSelected = Array.from(new Set([...selectedItemIds, ...comboItemIds]));
        set({ selectedItemIds: newSelected });
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('checkoutItemIds', JSON.stringify(newSelected));
        }
      }
      return;
    }

    let newSelected = [];
    if (selectedItemIds.includes(itemId)) {
      newSelected = selectedItemIds.filter((id) => id !== itemId);
    } else {
      newSelected = [...selectedItemIds, itemId];
    }
    set({ selectedItemIds: newSelected });
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('checkoutItemIds', JSON.stringify(newSelected));
    }
  },

  /**
   * Chọn tất cả hoặc Bỏ chọn tất cả
   */
  toggleSelectAll: (checked) => {
    const { items } = get();
    const newSelected = !checked
      ? []
      : items
          .filter(
            (i) =>
              !i.isOutOfStock &&
              (i.availableStock === undefined || i.availableStock > 0)
          )
          .map((i) => i._id);
    set({ selectedItemIds: newSelected });
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('checkoutItemIds', JSON.stringify(newSelected));
    }
  },

  /**
   * Xóa tất cả các sản phẩm đang được tích chọn (Tối ưu hóa: 1 request duy nhất, xử lý hàng nghìn sản phẩm tức thì)
   */
  removeSelectedItems: async () => {
    const { selectedItemIds, items, clearCart } = get();
    if (!selectedItemIds || selectedItemIds.length === 0)
      return { success: false, count: 0 };

    set({ isUpdating: true, error: null });
    try {
      const count = selectedItemIds.length;

      // TRƯỜNG HỢP 1: Nếu đã chọn toàn bộ sản phẩm trong giỏ -> dùng clearCart trong 1 request duy nhất!
      if (selectedItemIds.length >= items.length) {
        const res = await clearCart();
        return { success: res?.success !== false, count };
      }

      // TRƯỜNG HỢP 2: Xóa nhiều sản phẩm đã chọn cùng lúc qua API Batch remove trong 1 request duy nhất!
      const res = await cartService.removeItems(selectedItemIds);
      if (res?.success && res?.data) {
        get()._setCartData(res.data);
        set({ selectedItemIds: [] });
        return { success: true, count };
      }

      return {
        success: false,
        message: res?.message || 'Không thể xóa các sản phẩm đã chọn',
      };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Không thể xóa các sản phẩm đã chọn';
      set({ error: msg });
      return { success: false, message: msg };
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
   * Tính tổng tiền niêm yết (giá gốc) của các sản phẩm được chọn
   */
  getSelectedOriginalSubtotal: () => {
    const { items, selectedItemIds } = get();
    return items
      .filter((i) => selectedItemIds.includes(i._id))
      .reduce((sum, item) => {
        const orig =
          Number(item.originalPrice) > 0
            ? Number(item.originalPrice)
            : Number(item.unitPrice) || 0;
        return sum + orig * (Number(item.quantity) || 1);
      }, 0);
  },

  /**
   * Tính số tiền giảm giá của Coupon cho các sản phẩm ĐƯỢC CHỌN
   */
  getSelectedCouponDiscount: () => {
    const { cart, getSelectedSubtotal, selectedItemIds, items } = get();
    const coupon = cart?.appliedCoupon;
    const subtotal = getSelectedSubtotal();

    if (!cart?.couponCode || subtotal <= 0) return 0;

    // Nếu chọn toàn bộ giỏ hàng và có sẵn couponDiscount từ backend
    if (selectedItemIds.length >= items.length && items.length > 0 && cart.couponDiscount !== undefined) {
      return Number(cart.couponDiscount) || 0;
    }

    if (!coupon) {
      // Fallback nếu chưa có appliedCoupon object: tính tỷ lệ theo subtotal / cart.subtotal
      if (cart.subtotal > 0 && cart.couponDiscount > 0) {
        return Math.min(subtotal, Math.round((subtotal / cart.subtotal) * cart.couponDiscount));
      }
      return 0;
    }

    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      return 0;
    }

    if (coupon.type === 'percent') {
      const discount = Math.round((subtotal * (Number(coupon.value) || 0)) / 100);
      return coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount;
    }

    return Math.min(Number(coupon.value) || 0, subtotal);
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
  addToCart: async (payload, options = {}) => {
    const { silent = false, isBuyNow = false } = options;
    try {
      set({ isUpdating: true, error: null });
      if (!silent) {
        get().showCartHud('loading', 'Đang thêm vào giỏ...');
      }

      // Đảm bảo hiệu ứng loading hiển thị mượt mà ít nhất 300ms
      const [res] = await Promise.all([
        cartService.addToCart(payload),
        new Promise((resolve) => setTimeout(resolve, 320)),
      ]);

      if (res?.success && res?.data) {
        const cart = res.data.cart;
        const items = cart?.items || [];
        const addedItem = items.find(
          (it) =>
            (payload.variantId && String(it.variantId) === String(payload.variantId)) ||
            (payload.sku && it.sku === payload.sku) ||
            (payload.productId && String(it.productId) === String(payload.productId))
        ) || items[items.length - 1];

        if (isBuyNow && addedItem) {
          get()._setCartData(res.data, [addedItem._id]);
        } else {
          get()._setCartData(res.data);
        }
        if (!silent) {
          get().showCartHud('success', 'Thêm vào giỏ hàng thành công!');
          const timeout = setTimeout(() => {
            get().hideCartHud();
          }, 1500);
          set({ _hudTimeout: timeout });
        }
        return {
          success: true,
          message: res.message || 'Đã thêm vào giỏ hàng',
        };
      }

      const errMsg = res?.message || 'Thêm vào giỏ thất bại';
      if (!silent) {
        get().showCartHud('error', errMsg);
        const timeout = setTimeout(() => {
          get().hideCartHud();
        }, 2000);
        set({ _hudTimeout: timeout });
      }
      return {
        success: false,
        message: errMsg,
      };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Thêm vào giỏ hàng thất bại';
      set({ error: msg });
      if (!silent) {
        get().showCartHud('error', msg);
        const timeout = setTimeout(() => {
          get().hideCartHud();
        }, 2000);
        set({ _hudTimeout: timeout });
      }
      return { success: false, message: msg };
    } finally {
      set({ isUpdating: false });
    }
  },

  /**
   * Thêm trọn bộ Combo vào giỏ hàng
   */
  addComboToCart: async (comboId, quantity = 1, options = {}) => {
    const { silent = false } = options;
    try {
      set({ isUpdating: true, error: null });
      if (!silent) {
        get().showCartHud('loading', 'Đang thêm combo vào giỏ...');
      }

      const [res] = await Promise.all([
        cartService.addComboToCart(comboId, quantity),
        new Promise((resolve) => setTimeout(resolve, 320)),
      ]);

      if (res?.success && res?.data) {
        get()._setCartData(res.data);
        if (!silent) {
          get().showCartHud('success', 'Đã thêm trọn bộ combo vào giỏ hàng!');
          const timeout = setTimeout(() => {
            get().hideCartHud();
          }, 1800);
          set({ _hudTimeout: timeout });
        }
        return {
          success: true,
          message: res.message || 'Đã thêm combo vào giỏ hàng',
        };
      }

      const errMsg = res?.message || 'Không thể thêm combo vào giỏ hàng';
      if (!silent) {
        get().showCartHud('error', errMsg);
        const timeout = setTimeout(() => {
          get().hideCartHud();
        }, 2500);
        set({ _hudTimeout: timeout });
      }
      return { success: false, message: errMsg };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Không thể thêm combo vào giỏ hàng';
      set({ error: msg });
      if (!silent) {
        get().showCartHud('error', msg);
        const timeout = setTimeout(() => {
          get().hideCartHud();
        }, 2500);
        set({ _hudTimeout: timeout });
      }
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
   * Kiểm tra tính hợp lệ trước khi checkout (Kèm xác thực tính trọn bộ của toàn bộ combo)
   */
  validateCheckout: async () => {
    try {
      const { items, selectedItemIds } = get();

      // Kiểm tra xem có gói combo nào bị chọn thiếu sản phẩm không
      const comboMap = new Map();
      items.forEach((it) => {
        if (it.isComboItem && it.comboId) {
          const cId = String(it.comboId);
          if (!comboMap.has(cId)) comboMap.set(cId, []);
          comboMap.get(cId).push(it);
        }
      });

      for (const [cId, cItems] of comboMap.entries()) {
        const selectedOfThisCombo = cItems.filter((it) => selectedItemIds.includes(it._id));
        if (selectedOfThisCombo.length > 0 && selectedOfThisCombo.length < cItems.length) {
          const comboName = cItems[0]?.comboName || 'Gói combo';
          return {
            success: false,
            message: `Gói "${comboName}" bắt buộc phải đặt mua trọn bộ. Vui lòng chọn đầy đủ các sản phẩm của gói combo để tiếp tục đặt hàng.`,
          };
        }
      }

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
