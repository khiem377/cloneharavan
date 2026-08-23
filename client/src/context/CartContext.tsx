'use client';

/**
 * CartContext — quản lý trạng thái giỏ hàng toàn app
 *
 * - Fetch cart khi mount
 * - Expose actions: addItem, updateItem, removeItem, clearCart, mergeCart
 * - Track isFirstAdd → hiển thị GuestCartPopup một lần duy nhất
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { cartApi, type Cart } from '@/lib/cart';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartContextValue {
  cart:            Cart | null;
  loading:         boolean;
  error:           string | null;
  showGuestPopup:  boolean;           // Popup lần đầu khi Guest thêm sản phẩm
  closeGuestPopup: () => void;
  refresh:         () => Promise<void>;
  addItem:         (variantId: string, quantity?: number) => Promise<void>;
  updateItem:      (itemId: string, quantity: number) => Promise<void>;
  removeItem:      (itemId: string) => Promise<void>;
  clearCart:       () => Promise<void>;
  mergeCart:       () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart,           setCart]           = useState<Cart | null>(null);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [showGuestPopup, setShowGuestPopup] = useState(false);

  // Fetch giỏ hàng từ server
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cartApi.getCart();
      setCart(res.data.cart);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load cart khi component mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  const closeGuestPopup = useCallback(() => {
    setShowGuestPopup(false);
    // Lưu trạng thái — không hiển thị lại trong phiên này
    try {
      localStorage.setItem('guest_cart_popup_shown', 'true');
    } catch {}
  }, []);

  const addItem = useCallback(async (variantId: string, quantity = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await cartApi.addItem(variantId, quantity);
      setCart(res.data.cart);

      // Kiểm tra: hiện popup cho Guest lần đầu tiên
      if (res.data.isFirstAdd) {
        const alreadyShown = localStorage.getItem('guest_cart_popup_shown');
        if (!alreadyShown) {
          setShowGuestPopup(true);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi thêm sản phẩm');
      throw err; // Re-throw để AddToCartButton xử lý
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await cartApi.updateItem(itemId, quantity);
      setCart(res.data.cart);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi cập nhật số lượng');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await cartApi.removeItem(itemId);
      setCart(res.data.cart);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi xóa sản phẩm');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cartApi.clearCart();
      setCart(res.data.cart);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi xóa giỏ hàng');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const mergeCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cartApi.mergeCart();
      setCart(res.data.cart);
      // Xóa popup state sau khi merge (đã đăng nhập)
      try {
        localStorage.removeItem('guest_cart_popup_shown');
        localStorage.removeItem('cart_notice_dismissed');
      } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi hợp nhất giỏ hàng');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        showGuestPopup,
        closeGuestPopup,
        refresh,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        mergeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart phải được dùng bên trong <CartProvider>');
  }
  return ctx;
}
