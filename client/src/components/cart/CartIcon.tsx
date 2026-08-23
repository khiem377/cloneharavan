'use client';

/**
 * CartIcon — hiển thị icon giỏ hàng với badge số lượng item.
 * Dùng trong Header.
 */

import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export function CartIcon() {
  const { cart, loading } = useCart();

  const itemCount = cart?.summary?.itemCount ?? 0;

  return (
    <Link
      href="/gio-hang"
      id="header-cart-icon"
      className="relative inline-flex items-center justify-center rounded-xl p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
      aria-label={`Giỏ hàng${itemCount > 0 ? ` (${itemCount} sản phẩm)` : ''}`}
    >
      {/* Cart SVG */}
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>

      {/* Badge */}
      {!loading && itemCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold leading-none text-white"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
}
