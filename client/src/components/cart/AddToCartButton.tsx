'use client';

/**
 * AddToCartButton — nút thêm vào giỏ hàng.
 * Dùng ở trang sản phẩm / danh sách sản phẩm.
 *
 * Props:
 *  - variantId: ID của ProductVariant cần thêm
 *  - quantity: Số lượng (mặc định 1)
 *  - disabled: Vô hiệu hóa khi hết hàng / variant không active
 *  - className: Class tuỳ chỉnh
 *  - children: Label tùy chỉnh (mặc định "Thêm vào giỏ")
 */

import { useState } from 'react';
import { useCart } from '@/context/CartContext';

interface AddToCartButtonProps {
  variantId:  string;
  quantity?:  number;
  disabled?:  boolean;
  className?: string;
  children?:  React.ReactNode;
}

export function AddToCartButton({
  variantId,
  quantity  = 1,
  disabled  = false,
  className = '',
  children,
}: AddToCartButtonProps) {
  const { addItem, loading } = useCart();
  const [localLoading, setLocalLoading] = useState(false);
  const [success,      setSuccess]      = useState(false);
  const [errorMsg,     setErrorMsg]     = useState<string | null>(null);

  const handleClick = async () => {
    if (localLoading || disabled) return;

    setLocalLoading(true);
    setErrorMsg(null);
    setSuccess(false);

    try {
      await addItem(variantId, quantity);
      setSuccess(true);
      // Reset trạng thái success sau 2s
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi thêm vào giỏ hàng');
    } finally {
      setLocalLoading(false);
    }
  };

  const isLoading = loading || localLoading;

  return (
    <div className="flex flex-col gap-1">
      <button
        id={`add-to-cart-${variantId}`}
        type="button"
        onClick={handleClick}
        disabled={isLoading || disabled}
        aria-label={disabled ? 'Sản phẩm hết hàng' : 'Thêm vào giỏ hàng'}
        className={[
          'relative flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200',
          disabled
            ? 'cursor-not-allowed bg-gray-100 text-gray-400'
            : success
              ? 'bg-green-600 text-white'
              : 'bg-gray-900 text-white hover:bg-gray-700 active:scale-95',
          isLoading ? 'opacity-70' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Loading spinner */}
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}

        {/* Success checkmark */}
        {!isLoading && success && (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}

        {/* Cart icon */}
        {!isLoading && !success && !disabled && (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        )}

        {/* Label */}
        {isLoading
          ? 'Đang thêm...'
          : success
            ? 'Đã thêm vào giỏ!'
            : disabled
              ? 'Hết hàng'
              : children ?? 'Thêm vào giỏ hàng'}
      </button>

      {/* Error message */}
      {errorMsg && (
        <p className="text-xs text-red-500" role="alert">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
