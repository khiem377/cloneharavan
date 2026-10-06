'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Eye, ArrowLeftRight, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import useQuickViewStore from '@/store/quickViewStore';
import useCompareStore from '@/store/compareStore';
import trackingService from '@/services/tracking.service';

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120' fill='none'%3E%3Crect width='120' height='120' rx='6' fill='%23f8fafc'/%3E%3Crect x='30' y='35' width='60' height='45' rx='4' stroke='%23cbd5e1' stroke-width='2' fill='none'/%3E%3Cpolyline points='48 80 40 90 80 90 72 80' stroke='%23cbd5e1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

export default function FlashSaleProductCard({ item, onAddToCartMock, onBuyNowMock }) {
  const { openQuickView } = useQuickViewStore();
  const { addProduct, isCompared } = useCompareStore();
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  if (!item) return null;

  const currentItem = (Array.isArray(item.variantsList) && item.variantsList[selectedVariantIdx]) || item;

  const product = typeof currentItem.productId === 'object' ? currentItem.productId : currentItem.product || {};
  const variant = typeof currentItem.variantId === 'object' ? currentItem.variantId : null;

  const productId = product._id || product.id || currentItem.productId;
  const productName = product.name || currentItem.productName || 'Sản phẩm Flash Sale';
  const productSlug = product.slug || productId;

  const thumbnail =
    variant?.thumbnail?.url ||
    variant?.image?.url ||
    (typeof product.thumbnail === 'string' ? product.thumbnail : product.thumbnail?.url) ||
    product.images?.[0]?.url ||
    FALLBACK_IMAGE;

  // Pricing calculations
  const flashSalePrice = currentItem.flashSalePrice || 0;
  const originalPrice = currentItem.originalPrice || product.price || 0;
  const discountSavings = Math.max(0, originalPrice - flashSalePrice);
  const discountPercent = originalPrice > 0 ? Math.round(((originalPrice - flashSalePrice) / originalPrice) * 100) : 0;

  // Core Metrics
  const soldInFlashSale = currentItem.soldCount || 0;
  const stockLimit = currentItem.stockLimit || 10;
  const flashSaleRemaining = Math.max(0, stockLimit - soldInFlashSale);
  const inventoryStock = (variant?.stock !== undefined ? variant.stock : product.stock) ?? 0;
  const actualAvailable = Math.min(flashSaleRemaining, inventoryStock);

  // Progress bar ratio
  const progressRatio = Math.min(100, Math.max(0, Math.round((soldInFlashSale / stockLimit) * 100)));

  // Status flags
  const isOutOfWarehouse = inventoryStock <= 0;
  const isOutOfFlashSale = flashSaleRemaining <= 0;
  const isSoldOut = actualAvailable <= 0;

  let statusText = 'Đang mở bán';
  let statusBadgeClass = 'bg-slate-900 text-white';
  if (isOutOfWarehouse) {
    statusText = 'Hết hàng';
    statusBadgeClass = 'bg-slate-600 text-white';
  } else if (isOutOfFlashSale) {
    statusText = 'Hết suất FS';
    statusBadgeClass = 'bg-slate-700 text-white';
  } else if (actualAvailable <= 3) {
    statusText = 'Sắp hết hàng';
    statusBadgeClass = 'bg-red-600 text-white';
  } else if (progressRatio >= 50) {
    statusText = 'Bán chạy';
    statusBadgeClass = 'bg-amber-600 text-white';
  }

  const compared = isCompared(productId);

  const handleQuickViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (productId) {
      trackingService.recordInteraction({
        productId,
        interactionType: 'product_detail',
        context: { source: 'flash_sale_quickview' },
      });
    }
    openQuickView({
      ...product,
      isFlashSale: true,
      flashSalePrice: flashSalePrice,
      flashSaleOriginalPrice: originalPrice,
      price: originalPrice,
      salePrice: flashSalePrice,
    });
  };

  const handleCompareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (productId) {
      trackingService.recordInteraction({
        productId,
        interactionType: 'compare_add',
        context: { source: 'flash_sale_compare' },
      });
    }
    addProduct(product);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCartMock) {
      onAddToCartMock(item);
    }
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onBuyNowMock) {
      onBuyNowMock(item);
    }
  };

  return (
    <div className="relative group h-full">
      <Link
        href={`/products/${productSlug}`}
        className="block h-full"
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
        <Card className="h-full flex flex-col justify-between overflow-hidden rounded-[6px] border border-slate-200 bg-white hover:border-slate-400 transition-colors duration-150 p-2.5 sm:p-3 relative">

          {/* Top Badges */}
          <div className="flex items-center justify-between gap-1 mb-2 z-10">
            {discountPercent > 0 ? (
              <span className="px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold text-white bg-red-600">
                GIẢM {discountPercent}%
              </span>
            ) : (
              <span />
            )}

            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] uppercase ${statusBadgeClass}`}>
              {statusText}
            </span>
          </div>

          {/* Product Image Area */}
          <div className="relative aspect-square w-full rounded-[4px] overflow-hidden bg-white flex items-center justify-center p-2 mb-2">
            <img
              src={thumbnail}
              alt={productName}
              onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
              className="w-full h-full object-contain p-1"
              loading="lazy"
            />

            {/* Quick Actions */}
            <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-20">
              <button
                type="button"
                data-no-progress="true"
                onClick={handleQuickViewClick}
                title="Xem nhanh"
                className="size-7 rounded-[4px] bg-white border border-slate-200 hover:bg-slate-900 hover:text-white text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Eye size={13} />
              </button>
              <button
                type="button"
                data-no-progress="true"
                onClick={handleCompareClick}
                title="So sánh"
                className={`size-7 rounded-[4px] border flex items-center justify-center transition-colors cursor-pointer ${
                  compared ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 hover:bg-slate-900 hover:text-white text-slate-700'
                }`}
              >
                {compared ? <Check size={13} /> : <ArrowLeftRight size={13} />}
              </button>
            </div>

            {/* Sold out overlay */}
            {isSoldOut && (
              <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center z-10 p-2 text-center">
                <span className="px-2 py-0.5 bg-slate-900 text-white font-bold text-[10px] uppercase rounded-[4px] border border-slate-700">
                  {isOutOfWarehouse ? 'TẠM HẾT HÀNG' : 'HẾT SUẤT SALE'}
                </span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {product.brand?.name && (
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 truncate">
                  {product.brand.name}
                </span>
              )}

              <h3 className="text-xs font-semibold text-slate-900 line-clamp-2 group-hover:text-red-600 transition-colors leading-snug h-8" title={productName}>
                {productName}
              </h3>

              {Array.isArray(item.variantsList) && item.variantsList.length > 1 && (
                <div className="flex flex-wrap items-center gap-1 mt-1 pt-1 border-t border-slate-100">
                  {item.variantsList.map((vItem, vIdx) => {
                    const vObj = typeof vItem.variantId === 'object' ? vItem.variantId : null;
                    const vLabel = vObj?.attributes?.map((a) => a.value).join(' ') || vObj?.nameOverride || vObj?.sku || `Bản ${vIdx + 1}`;
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
                        className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-medium border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 font-bold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {vLabel}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Price Box */}
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

              {discountSavings > 0 && (
                <div className="text-[10px] font-semibold text-slate-500 mt-0.5">
                  Tiết kiệm: <strong className="text-emerald-700 font-mono tabular-nums">{discountSavings.toLocaleString('vi-VN')}₫</strong>
                </div>
              )}

              {/* Simple Flat Progress Bar */}
              <div className="mt-2">
                <div className="relative w-full h-3.5 bg-slate-100 rounded-[3px] overflow-hidden flex items-center border border-slate-200">
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-red-600 transition-all duration-300"
                    style={{ width: `${Math.max(6, progressRatio)}%` }}
                  />
                  <span className="relative z-10 w-full text-center text-[9px] font-bold text-slate-800 tracking-tight px-1 truncate mix-blend-multiply">
                    {isSoldOut ? 'HẾT SUẤT' : `Đã bán ${soldInFlashSale}/${stockLimit} suất`}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-2.5 grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSoldOut}
                  onClick={handleAddToCart}
                  title="Thêm vào giỏ"
                  className="h-7 rounded-[4px] border-slate-300 bg-white text-slate-800 hover:bg-slate-100 text-[10px] font-bold gap-1 px-1"
                >
                  <ShoppingCart size={12} className="shrink-0" />
                  <span className="truncate">Thêm giỏ</span>
                </Button>

                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  disabled={isSoldOut}
                  onClick={handleBuyNow}
                  title="Mua ngay"
                  className="h-7 rounded-[4px] bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] uppercase tracking-wider gap-1 px-1"
                >
                  <span className="truncate">Mua ngay</span>
                </Button>
              </div>

            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
}
