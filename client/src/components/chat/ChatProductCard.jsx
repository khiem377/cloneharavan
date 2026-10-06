'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ChatProductCard({ product, onSelect }) {
  if (!product) return null;

  const displayPrice = product.salePrice > 0 ? product.salePrice : product.price;
  const originalPrice = product.salePrice > 0 && product.price > product.salePrice ? product.price : 0;
  const isOutOfStock = product.stock <= 0;
  const thumbUrl =
    (typeof product.thumbnail === 'string' && product.thumbnail.trim()) ||
    product.thumbnail?.url ||
    (Array.isArray(product.images) &&
      (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url)) ||
    '/images/og-shop.png';

  return (
    <div className="rounded-[6px] border border-slate-200 bg-white p-3 flex flex-col gap-2 hover:border-[#284ea1] transition-all shadow-xs">
      {/* Huy hiệu ưu đãi đặc biệt (Flash Sale, Khuyến mãi, Quà tặng kèm) */}
      {(product.isFlashSale || product.bestPromotion || product.giftDeal || originalPrice > 0) && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {product.isFlashSale ? (
            <span className="text-[10px] font-bold text-white bg-[#e30019] px-2 py-0.5 rounded-[4px] font-mono">
              Flash Sale{product.discountPercent ? ` -${product.discountPercent}%` : ''}
            </span>
          ) : product.bestPromotion ? (
            <span className="text-[10px] font-bold text-white bg-[#284ea1] px-2 py-0.5 rounded-[4px]">
              Khuyến mãi: {product.bestPromotion.name}
            </span>
          ) : product.giftDeal ? (
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-[4px]">
              Có quà tặng kèm
            </span>
          ) : originalPrice > 0 ? (
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-[4px] font-mono">
              Giảm {product.discountPercent || Math.round(((originalPrice - displayPrice) / originalPrice) * 100)}%
            </span>
          ) : null}

          {product.isFlashSale && product.flashSaleDeal?.remaining > 0 && (
            <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-[4px] border border-amber-200 font-mono">
              Còn {product.flashSaleDeal.remaining} suất
            </span>
          )}
        </div>
      )}

      <div className="flex gap-2.5 items-start">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[6px] bg-slate-50 border border-slate-100 p-1 shrink-0 flex items-center justify-center overflow-hidden">
          <img
            src={thumbUrl}
            alt={product.name}
            className="w-full h-full object-contain"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/og-shop.png';
            }}
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
          <div>
            {product.brand && (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block line-clamp-1">
                {product.brand}
              </span>
            )}
            <Link
              href={`/products/${product.slug || product._id}`}
              onClick={onSelect}
              className="text-xs sm:text-[13px] font-semibold text-slate-900 line-clamp-2 hover:text-[#284ea1] transition-colors leading-snug"
            >
              {product.name}
            </Link>
          </div>

          <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-xs sm:text-sm font-bold text-[#e30019] font-mono tabular-nums">
              {displayPrice ? `${displayPrice.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
            </span>
            {originalPrice > 0 && (
              <span className="text-[11px] text-slate-400 line-through font-mono tabular-nums">
                {originalPrice.toLocaleString('vi-VN')}₫
              </span>
            )}
          </div>

          {/* Dòng ghi chú quà tặng kèm nếu có */}
          {product.giftDeal?.note && (
            <p className="text-[10px] text-emerald-700 font-medium line-clamp-1 mt-0.5">
              {product.giftDeal.summary || product.giftDeal.note}
            </p>
          )}

          <div className="mt-0.5 flex items-center gap-1 text-[10px]">
            <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            <span className={isOutOfStock ? 'text-amber-700 font-medium' : 'text-emerald-700 font-medium'}>
              {isOutOfStock ? 'Tạm hết hàng' : 'Còn hàng tại kho'}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center">
        <Link
          href={`/products/${product.slug || product._id}`}
          onClick={onSelect}
          className="w-full"
        >
          <Button
            type="button"
            className="w-full bg-[#284ea1] hover:bg-[#1e3b82] text-white text-xs font-semibold py-2 px-4 rounded-[6px] transition-colors active:scale-[0.98] inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs h-auto"
          >
            <span>Xem chi tiết</span>
            <ExternalLink className="size-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
