'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useCartStore from '@/store/cartStore';

export default function StickyPurchaseBar({
  product,
  selectedVariant,
}) {
  const router = useRouter();
  const { addToCart } = useCartStore();
  const [isVisible, setIsVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const target = document.getElementById('product-action-buttons');
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (!product) return null;

  const handleAction = async (isBuyNow = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const payload = {
      productId: product._id || product.id,
      variantId: selectedVariant?._id || selectedVariant?.id,
      sku: selectedVariant?.sku,
      quantity: 1,
    };

    const res = await addToCart(payload);
    setIsSubmitting(false);

    if (res?.success) {
      if (isBuyNow) {
        router.push('/cart');
      } else {
        setToastMessage('Đã thêm sản phẩm vào giỏ hàng!');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } else {
      setToastMessage(res?.message || 'Không thể thêm vào giỏ');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <>
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-sm transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          {/* Cột trái */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-[6px] border border-slate-200 bg-white p-0.5 shrink-0 overflow-hidden">
              <img
                src={thumb}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                {product.name}
              </span>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-extrabold text-red-600">
                  {displayPrice > 0 ? `${displayPrice.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                </span>
                {selectedVariant?.displayName &&
                  !['mặc định', 'mac dinh', 'default', 'default title'].includes(
                    selectedVariant.displayName.toLowerCase().trim()
                  ) && (
                    <span className="text-slate-500 text-[11px] truncate hidden sm:inline">
                      • {selectedVariant.displayName}
                    </span>
                  )}
              </div>
            </div>
          </div>

          {/* Cột phải: 2 Nút hành động không icon */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleAction('Thêm vào giỏ')}
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-[6px] border border-red-600 bg-white text-red-600 hover:bg-red-50 text-xs font-bold transition-all cursor-pointer active:scale-[0.98]"
            >
              Thêm vào giỏ
            </button>

            <button
              type="button"
              onClick={() => handleAction('Mua ngay')}
              className="inline-flex items-center px-5 py-2 rounded-[6px] bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-[0.98]"
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-16 right-4 z-50 bg-slate-900 text-white text-xs py-2 px-3 rounded-[6px] shadow-sm animate-fadeIn">
          {toastMessage}
        </div>
      )}
    </>
  );
}
