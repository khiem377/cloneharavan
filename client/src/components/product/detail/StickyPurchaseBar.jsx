'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import useCartStore from '@/store/cartStore';

export default function StickyPurchaseBar({
  product,
  dynamicProductName = '',
  selectedVariant,
}) {
  const router = useRouter();
  const { addToCart } = useCartStore();
  const [isVisible, setIsVisible] = useState(false);
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

  const handleAction = async (actionType = 'Thêm vào giỏ') => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const isBuyNow = actionType === 'Mua ngay' || actionType === true;

    const payload = {
      productId: product._id || product.id,
      variantId: selectedVariant?._id || selectedVariant?.id,
      sku: selectedVariant?.sku,
      quantity: 1,
    };

    const res = await addToCart(payload, { isBuyNow });
    setIsSubmitting(false);

    if (res?.success) {
      if (isBuyNow) {
        router.push('/checkout');
      }
    }
  };

  const thumb =
    selectedVariant?.thumbnail?.url ||
    selectedVariant?.image?.url ||
    (typeof product.thumbnail === 'string' ? product.thumbnail : product.thumbnail?.url) ||
    product.images?.[0]?.url ||
    '/logo-shop.jpg';

  const displayPrice =
    selectedVariant?.salePrice > 0
      ? selectedVariant.salePrice
      : selectedVariant?.price > 0
      ? selectedVariant.price
      : product.salePrice > 0
      ? product.salePrice
      : product.price || 0;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-sm transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="max-w-[1536px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-8 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-[6px] border border-slate-200 bg-white p-0.5 shrink-0 overflow-hidden">
            <img
              src={thumb}
              alt={product.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = '/logo-shop.jpg';
              }}
            />
          </div>

          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
              {dynamicProductName || product.name}
            </span>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-extrabold text-accent font-mono tabular-nums">
                {displayPrice > 0 ? `${displayPrice.toLocaleString('vi-VN')} ₫` : 'Liên hệ'}
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

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            onClick={() => handleAction('Thêm vào giỏ')}
            className="hidden sm:inline-flex h-9 px-4 font-bold text-xs rounded-[6px] border-slate-300 hover:border-slate-400 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5 text-slate-700" />
                <span>Đang thêm...</span>
              </>
            ) : (
              <span>Thêm vào giỏ</span>
            )}
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={isSubmitting}
            onClick={() => handleAction(true)}
            className="inline-flex h-9 px-5 bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-bold rounded-[6px] cursor-pointer"
          >
            Mua ngay
          </Button>
        </div>
      </div>
    </div>
  );
}
