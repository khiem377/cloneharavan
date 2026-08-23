/**
 * Cart API helpers — gọi BE API
 * Tất cả request đều kèm credentials (cookie) để BE nhận được
 * guest_cart_token hoặc refreshToken/accessToken
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface CartItem {
  _id: string;
  cart_id: string;
  product_id: {
    _id: string;
    name: string;
    slug: string;
    thumbnail: { url: string };
    status: string;
    isActive: boolean;
  };
  variant_id: {
    _id: string;
    sku: string;
    displayName: string;
    attributes: { name: string; value: string; colorCode?: string }[];
    thumbnail: { url: string };
    stock: number;
    isActive: boolean;
  };
  quantity: number;
  unit_price_snapshot: number | null;
  currentPrice: number;
  lineTotal: number;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
}

export interface Cart {
  _id: string;
  cartType: 'guest' | 'user';
  status: string;
  version: number;
  items: CartItem[];
  summary: CartSummary;
  warnings: { itemId: string; message: string; status: string }[];
}

export interface ValidationItemResult {
  itemId: string;
  variantId: string;
  productId: string;
  quantity: number;
  status: string;
  message: string | null;
  currentPrice?: number;
  oldPrice?: number;
  requestedQuantity?: number;
  availableQuantity?: number;
}

export interface CartValidationResult {
  isValid: boolean;
  items: ValidationItemResult[];
  message?: string;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include', // Gửi cookie (guest_cart_token, refreshToken)
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || `API Error: ${res.status}`);
  }

  return data;
}

export const cartApi = {
  getCart: () =>
    apiFetch<{ status: string; data: { cart: Cart | null } }>('/cart'),

  addItem: (variantId: string, quantity: number) =>
    apiFetch<{ status: string; data: { cart: Cart; isFirstAdd: boolean } }>('/cart/items', {
      method: 'POST',
      body:   JSON.stringify({ variantId, quantity }),
    }),

  updateItem: (itemId: string, quantity: number) =>
    apiFetch<{ status: string; data: { cart: Cart } }>(`/cart/items/${itemId}`, {
      method: 'PATCH',
      body:   JSON.stringify({ quantity }),
    }),

  removeItem: (itemId: string) =>
    apiFetch<{ status: string; data: { cart: Cart } }>(`/cart/items/${itemId}`, {
      method: 'DELETE',
    }),

  clearCart: () =>
    apiFetch<{ status: string; data: { cart: Cart } }>('/cart', {
      method: 'DELETE',
    }),

  mergeCart: () =>
    apiFetch<{
      status: string;
      data: { cart: Cart; adjustedItems: unknown[]; warnings: unknown[] };
    }>('/cart/merge', {
      method: 'POST',
    }),

  validateCart: () =>
    apiFetch<{ status: string; data: CartValidationResult }>('/cart/validate', {
      method: 'POST',
    }),
};

// ─── Formatters ───────────────────────────────────────────────────────────────

export const formatPrice = (price: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
