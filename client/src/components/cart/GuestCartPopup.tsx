'use client';

/**
 * GuestCartPopup
 * Hiển thị MỘT LẦN khi Guest thêm sản phẩm đầu tiên vào giỏ.
 * Thông báo rằng giỏ đang được lưu tạm thời và khuyến khích đăng nhập.
 */

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export function GuestCartPopup() {
  const { showGuestPopup, closeGuestPopup } = useCart();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (showGuestPopup) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [showGuestPopup]);

  if (!showGuestPopup) return null;

  return (
    <dialog
      ref={dialogRef}
      id="guest-cart-popup"
      className="fixed inset-0 z-50 m-auto w-full max-w-md rounded-2xl border-0 bg-white p-0 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      onClose={closeGuestPopup}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-6">
        <div className="flex items-center gap-3">
          {/* Giỏ hàng icon */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
            <svg
              className="h-5 w-5 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-gray-900">
            Giỏ hàng tạm thời
          </h2>
        </div>

        {/* Nút đóng */}
        <button
          onClick={closeGuestPopup}
          aria-label="Đóng thông báo"
          id="guest-cart-popup-close"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="p-6">
        <p className="text-sm leading-relaxed text-gray-600">
          Giỏ hàng của bạn đang được lưu tạm thời trên thiết bị này.{' '}
          <strong className="font-medium text-gray-800">
            Đăng nhập hoặc tạo tài khoản
          </strong>{' '}
          để lưu và đồng bộ giỏ hàng với tài khoản của bạn, tránh mất dữ liệu
          khi đổi thiết bị hoặc xóa lịch sử trình duyệt.
        </p>

        {/* Lợi ích khi đăng nhập */}
        <ul className="mt-4 space-y-2">
          {[
            'Giỏ hàng được lưu vĩnh viễn trên tài khoản',
            'Đồng bộ trên mọi thiết bị',
            'Theo dõi lịch sử đơn hàng',
          ].map((benefit) => (
            <li key={benefit} className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="h-4 w-4 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      {/* Footer actions */}
      <div className="flex flex-col gap-2 border-t border-gray-100 p-6 sm:flex-row">
        <Link
          href="/dang-nhap"
          id="guest-cart-popup-login"
          onClick={closeGuestPopup}
          className="flex flex-1 items-center justify-center rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
        >
          Đăng nhập
        </Link>
        <Link
          href="/dang-ky"
          id="guest-cart-popup-register"
          onClick={closeGuestPopup}
          className="flex flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Tạo tài khoản
        </Link>
        <button
          onClick={closeGuestPopup}
          id="guest-cart-popup-continue"
          className="flex-1 px-4 py-2.5 text-sm text-gray-400 transition-colors hover:text-gray-600 sm:flex-none"
        >
          Tiếp tục mua sắm
        </button>
      </div>
    </dialog>
  );
}
