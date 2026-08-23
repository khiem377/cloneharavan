'use client';

/**
 * GuestCartBanner
 * Banner nhỏ hiển thị ở đầu trang Cart cho người dùng chưa đăng nhập.
 * Có nút Đăng nhập và × để đóng.
 * Trạng thái đóng được lưu vào localStorage (cart_notice_dismissed).
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';

const DISMISSED_KEY = 'cart_notice_dismissed';

export function GuestCartBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Chỉ hiển thị nếu chưa dismiss
    try {
      const dismissed = localStorage.getItem(DISMISSED_KEY);
      if (!dismissed) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISSED_KEY, 'true');
    } catch {}
  };

  if (!visible) return null;

  return (
    <div
      id="guest-cart-banner"
      role="alert"
      className="relative mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm"
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        <svg
          className="h-5 w-5 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      {/* Message */}
      <p className="flex-1 text-amber-800">
        Bạn đang sử dụng giỏ hàng tạm thời.{' '}
        <Link
          href="/dang-nhap"
          id="guest-cart-banner-login"
          className="font-semibold underline underline-offset-2 transition-opacity hover:opacity-70"
        >
          Đăng nhập
        </Link>{' '}
        để lưu và đồng bộ giỏ hàng với tài khoản của bạn.
      </p>

      {/* Nút đóng */}
      <button
        onClick={dismiss}
        aria-label="Đóng thông báo"
        id="guest-cart-banner-dismiss"
        className="flex-shrink-0 rounded-full p-1 text-amber-600 transition-colors hover:bg-amber-100 hover:text-amber-800"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
