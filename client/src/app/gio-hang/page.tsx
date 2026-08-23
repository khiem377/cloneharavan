'use client';

/**
 * Trang Giỏ Hàng — /gio-hang
 *
 * - Guest: hiển thị GuestCartBanner
 * - Hiển thị danh sách CartItem với điều chỉnh số lượng
 * - Sidebar: Cart Summary (subtotal, total)
 * - Checkout button: dẫn tới /thanh-toan
 */

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { useCart } from '@/context/CartContext';
import { GuestCartBanner } from '@/components/cart/GuestCartBanner';
import { formatPrice, type CartItem } from '@/lib/cart';

// ─── CartItem Row ─────────────────────────────────────────────────────────────

function CartItemRow({ item }: { item: CartItem }) {
  const { updateItem, removeItem, loading } = useCart();
  const [qty, setQty] = useState(item.quantity);

  const product    = item.product_id;
  const variant    = item.variant_id;
  const thumbnail  = variant?.thumbnail?.url || product?.thumbnail?.url || '/placeholder.png';
  const variantLabel = variant?.displayName || variant?.attributes?.map(a => a.value).join(' / ') || '';

  const handleQtyChange = async (newQty: number) => {
    if (newQty < 1 || newQty > 100) return;
    setQty(newQty);
    try {
      await updateItem(item._id, newQty);
    } catch {
      // Revert nếu lỗi
      setQty(item.quantity);
    }
  };

  const handleRemove = () => removeItem(item._id);

  return (
    <div className="flex gap-4 border-b border-gray-100 py-5 last:border-0">
      {/* Thumbnail */}
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50">
        <Image
          src={thumbnail}
          alt={product?.name ?? 'Sản phẩm'}
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1">
        <Link
          href={`/san-pham/${product?.slug ?? ''}`}
          className="line-clamp-2 text-sm font-medium text-gray-900 hover:text-gray-600"
        >
          {product?.name ?? 'Sản phẩm'}
        </Link>

        {variantLabel && (
          <p className="text-xs text-gray-500">{variantLabel}</p>
        )}

        {variant?.sku && (
          <p className="text-xs text-gray-400">SKU: {variant.sku}</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2">
          {/* Quantity controls */}
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50">
            <button
              onClick={() => handleQtyChange(qty - 1)}
              disabled={loading || qty <= 1}
              aria-label="Giảm số lượng"
              className="flex h-8 w-8 items-center justify-center rounded-l-lg text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-40"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
              </svg>
            </button>

            <span className="min-w-[2rem] px-1 text-center text-sm font-medium text-gray-800">
              {qty}
            </span>

            <button
              onClick={() => handleQtyChange(qty + 1)}
              disabled={loading || qty >= (variant?.stock ?? 100)}
              aria-label="Tăng số lượng"
              className="flex h-8 w-8 items-center justify-center rounded-r-lg text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-40"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              {formatPrice(item.currentPrice * qty)}
            </p>
            {qty > 1 && (
              <p className="text-xs text-gray-400">
                {formatPrice(item.currentPrice)} / sản phẩm
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Remove button */}
      <button
        onClick={handleRemove}
        disabled={loading}
        aria-label="Xóa sản phẩm khỏi giỏ hàng"
        className="flex-shrink-0 self-start rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

// ─── Empty Cart ───────────────────────────────────────────────────────────────

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
        <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </div>
      <h2 className="mb-2 text-xl font-semibold text-gray-800">Giỏ hàng trống</h2>
      <p className="mb-8 text-sm text-gray-500">
        Bạn chưa có sản phẩm nào trong giỏ. Hãy khám phá cửa hàng!
      </p>
      <Link
        href="/"
        className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-700"
      >
        Tiếp tục mua sắm
      </Link>
    </div>
  );
}

// ─── Cart Summary Sidebar ─────────────────────────────────────────────────────

function CartSummary() {
  const { cart, loading, clearCart } = useCart();

  if (!cart) return null;

  const { subtotal, discount, total, itemCount } = cart.summary;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-900">Tóm tắt đơn hàng</h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Tạm tính ({itemCount} sản phẩm)</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Giảm giá</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-xs text-gray-400">
          <span>Phí vận chuyển</span>
          <span>Tính khi thanh toán</span>
        </div>

        <div className="border-t border-gray-100 pt-3">
          <div className="flex justify-between text-base font-semibold text-gray-900">
            <span>Tổng cộng</span>
            <span className="text-lg text-red-600">{formatPrice(total)}</span>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            * Chưa bao gồm phí vận chuyển và thuế
          </p>
        </div>
      </div>

      {/* Checkout button */}
      <Link
        href="/thanh-toan"
        id="checkout-button"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 active:scale-95"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
        Tiến hành thanh toán
      </Link>

      {/* Clear cart */}
      <button
        onClick={clearCart}
        disabled={loading}
        id="clear-cart-button"
        className="mt-3 w-full rounded-xl border border-gray-200 px-6 py-2.5 text-sm text-gray-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
      >
        Xóa toàn bộ giỏ hàng
      </button>
    </div>
  );
}

// ─── Cart Warnings ────────────────────────────────────────────────────────────

function CartWarnings({ warnings }: { warnings: { itemId: string; message: string }[] }) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
      <h3 className="mb-2 text-sm font-medium text-yellow-800">Thông báo về giỏ hàng</h3>
      <ul className="space-y-1">
        {warnings.map((w, i) => (
          <li key={i} className="text-xs text-yellow-700">
            • {w.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main Cart Page ───────────────────────────────────────────────────────────

export default function CartPage() {
  const { cart, loading, error } = useCart();

  const isGuest = cart?.cartType === 'guest';
  const items   = cart?.items ?? [];
  const isEmpty = items.length === 0;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
          {cart && !isEmpty && (
            <p className="mt-1 text-sm text-gray-500">
              {cart.summary.itemCount} sản phẩm trong giỏ
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Guest Banner */}
        {isGuest && <GuestCartBanner />}

        {/* Cart Warnings */}
        {cart?.warnings && <CartWarnings warnings={cart.warnings} />}

        {/* Loading skeleton */}
        {loading && !cart && (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4 rounded-2xl bg-white p-5">
                <div className="h-24 w-24 rounded-xl bg-gray-200" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-3 w-1/2 rounded bg-gray-200" />
                  <div className="h-8 w-28 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty cart */}
        {!loading && isEmpty && <EmptyCart />}

        {/* Cart content */}
        {!isEmpty && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Items list */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                {items.map((item) => (
                  <CartItemRow key={item._id} item={item} />
                ))}
              </div>

              {/* Continue shopping */}
              <div className="mt-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-800"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <CartSummary />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
