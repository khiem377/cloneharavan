'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Eye, ArrowLeftRight, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import trackingService from '@/services/tracking.service';
import { useFlashSaleCard } from './useFlashSaleCard';

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120' fill='none'%3E%3Crect width='120' height='120' rx='6' fill='%23f8fafc'/%3E%3Crect x='30' y='35' width='60' height='45' rx='4' stroke='%23cbd5e1' stroke-width='2' fill='none'/%3E%3Cpolyline points='48 80 40 90 80 90 72 80' stroke='%23cbd5e1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

export default function FlashSaleProductCard({ item, onAddToCartMock, onBuyNowMock }) {
  const {
    productId,
    product,
    productName,
    productSlug,
    thumbnail,
    originalPrice,
    flashSalePrice,
    discountPercent,
    stockLimit,
    soldInFlashSale,
    progressRatio,
    isOutOfWarehouse,
    isSoldOut,
    effectiveVariantsList,
    selectedVariantIdx,
    setSelectedVariantIdx,
    getVariantLabel,
    compared,
    isAdding,
    handleQuickViewClick,
    handleCompareClick,
    handleAddToCart,
  } = useFlashSaleCard({ item, onAddToCartMock, onBuyNowMock });

  if (!item) return null;

  return (
    <div className="group h-full flex flex-col justify-between overflow-hidden rounded-[6px] border border-slate-200 bg-white hover:border-slate-400 transition-colors duration-150 p-2.5 sm:p-3 relative">
      <Link
        href={`/products/${productSlug}`}
        className="block"
        onClick={() => {
          if (productId) {
            trackingService.recordInteraction({
              productId,
              interactionType: 'view',
              context: { source: 'flash_sale_card_click' },
            });
          }
        }}
      >
        {/* Top: 1 Single Discount Badge (Anti-chip soup) */}
        <div className="flex items-center justify-between gap-1 mb-1.5 h-5">
          {discountPercent > 0 ? (
            <Badge className="px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold text-white bg-red-600 border-none font-mono tabular-nums">
              -{discountPercent}%
            </Badge>
          ) : <span />}
          {isSoldOut && (
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-[4px] uppercase font-mono">
              {isOutOfWarehouse ? 'Hết hàng' : 'Hết suất'}
            </span>
          )}
        </div>

        {/* Thumbnail with subtle hover zoom */}
        <div className="relative aspect-square w-full rounded-[4px] overflow-hidden bg-slate-50 flex items-center justify-center p-2 mb-2">
          <img
            src={thumbnail}
            alt={productName}
            onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
            className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Quick Action Tools */}
          <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-20">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleQuickViewClick}
              aria-label={`Xem nhanh ${productName}`}
              className="size-7 rounded-[4px] bg-white border border-slate-200 hover:bg-slate-900 hover:text-white text-slate-700 flex items-center justify-center cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <Eye size={13} />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCompareClick}
              aria-label={compared ? `Đã thêm vào so sánh` : `Thêm vào so sánh`}
              className={`size-7 rounded-[4px] border flex items-center justify-center cursor-pointer shadow-xs active:scale-[0.98] ${
                compared ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 hover:bg-slate-900 hover:text-white text-slate-700'
              }`}
            >
              {compared ? <Check size={13} /> : <ArrowLeftRight size={13} />}
            </Button>
          </div>

          {isSoldOut && (
            <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center z-10 p-2 text-center">
              <span className="px-2 py-0.5 bg-slate-900 text-white font-bold text-[10px] uppercase rounded-[4px] border border-slate-700 font-mono">
                {isOutOfWarehouse ? 'TẠM HẾT HÀNG' : 'HẾT SUẤT FLASH SALE'}
              </span>
            </div>
          )}
        </div>

        {/* Brand & Name */}
        <div>
          {product.brand?.name && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 truncate font-mono">
              {product.brand.name}
            </span>
          )}
          <h3 className="text-xs font-semibold text-slate-900 line-clamp-2 group-hover:text-red-600 transition-colors leading-snug h-8" title={productName}>
            {productName}
          </h3>
        </div>
      </Link>

      {/* Variants (if any) */}
      {Array.isArray(effectiveVariantsList) && effectiveVariantsList.length > 1 && (
        <div className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-slate-100 overflow-x-auto no-scrollbar py-0.5">
          {effectiveVariantsList.map((vItem, vIdx) => {
            const vLabel = getVariantLabel(vItem) || `Bản ${vIdx + 1}`;
            const isSelected = selectedVariantIdx === vIdx;
            return (
              <button
                key={vItem._id || vIdx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedVariantIdx(vIdx);
                }}
                className={`h-5 px-1.5 rounded-[4px] text-[10px] font-medium shrink-0 cursor-pointer transition active:scale-[0.98] ${
                  isSelected
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title={vLabel}
              >
                <span className="truncate max-w-[100px]">{vLabel}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Pricing Block */}
      <div className="mt-2 pt-2 border-t border-slate-100">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-sm sm:text-base font-bold text-red-600 font-mono tabular-nums">
            {flashSalePrice > 0 ? `${flashSalePrice.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
          </span>
          {originalPrice > flashSalePrice && (
            <span className="text-[11px] text-slate-400 line-through font-mono tabular-nums">
              {originalPrice.toLocaleString('vi-VN')}₫
            </span>
          )}
        </div>

        {/* Stock Progress Bar */}
        <div className="mt-2">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono tabular-nums mb-1">
            <span>{isSoldOut ? 'Hết suất' : 'Tiến độ'}</span>
            <span className="font-semibold text-slate-700">
              {isSoldOut ? '100%' : `${soldInFlashSale}/${stockLimit} suất`}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full transition-all duration-300 ${isSoldOut ? 'bg-slate-400' : 'bg-red-600'}`}
              style={{ width: `${Math.max(6, progressRatio)}%` }}
            />
          </div>
        </div>

        {/* Primary CTA Button (1 Action Only) */}
        <div className="mt-2.5">
          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={isSoldOut || isAdding}
            onClick={handleAddToCart}
            className="w-full h-8 rounded-[6px] bg-red-600 hover:bg-red-700 text-white text-xs font-bold gap-1.5 transition active:scale-[0.98] cursor-pointer shadow-xs"
          >
            {isAdding ? (
              <Loader2 size={13} className="shrink-0 animate-spin" />
            ) : (
              <ShoppingCart size={13} className="shrink-0" />
            )}
            <span>{isAdding ? 'Đang thêm...' : isSoldOut ? 'Hết hàng' : 'Thêm vào giỏ'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
