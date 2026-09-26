'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Flame, Zap, ShoppingCart, Eye, ArrowLeftRight, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import useQuickViewStore from '@/store/quickViewStore';
import useCompareStore from '@/store/compareStore';
import { useState } from 'react';

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120' fill='none'%3E%3Crect width='120' height='120' rx='8' fill='%23f8fafc'/%3E%3Crect x='30' y='35' width='60' height='45' rx='4' stroke='%23cbd5e1' stroke-width='2' fill='none'/%3E%3Cpolyline points='48 80 40 90 80 90 72 80' stroke='%23cbd5e1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

export default function FlashSaleProductCard({ item, onAddToCartMock, onBuyNowMock }) {
  const router = useRouter();
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

  // Secondary hover image
  let hoverImage = '';
  if (Array.isArray(product.images) && product.images.length > 1) {
    const candidate = product.images.find((img) => {
      const u = img?.url || (typeof img === 'string' ? img : '');
      return u && u !== thumbnail;
    });
    if (candidate) {
      hoverImage = candidate.url || (typeof candidate === 'string' ? candidate : '');
    }
  }

  // Pricing calculations
  const flashSalePrice = currentItem.flashSalePrice || 0;
  const originalPrice = currentItem.originalPrice || product.price || 0;
  const discountSavings = Math.max(0, originalPrice - flashSalePrice);
  const discountPercent = originalPrice > 0 ? Math.round(((originalPrice - flashSalePrice) / originalPrice) * 100) : 0;

  // 4 Core Metrics
  const soldInFlashSale = currentItem.soldCount || 0;
  const stockLimit = currentItem.stockLimit || 10;
  const flashSaleRemaining = Math.max(0, stockLimit - soldInFlashSale);
  const inventoryStock = (variant?.stock !== undefined ? variant.stock : product.stock) ?? 0;
  const totalSold = (variant?.sold !== undefined ? variant.sold : product.sold) ?? 0;
  const actualAvailable = Math.min(flashSaleRemaining, inventoryStock);

  // Progress bar ratio
  const progressRatio = Math.min(100, Math.max(0, Math.round((soldInFlashSale / stockLimit) * 100)));

  // Status flags
  const isOutOfWarehouse = inventoryStock <= 0;
  const isOutOfFlashSale = flashSaleRemaining <= 0;
  const isSoldOut = actualAvailable <= 0;

  let statusText = 'Vừa mở bán';
  let statusBadgeClass = 'bg-amber-500 text-white';
  if (isOutOfWarehouse) {
    statusText = 'Hết hàng';
    statusBadgeClass = 'bg-gray-600 text-white';
  } else if (isOutOfFlashSale) {
    statusText = 'Hết suất FS';
    statusBadgeClass = 'bg-gray-700 text-white';
  } else if (actualAvailable <= 3) {
    statusText = 'Sắp cháy hàng';
    statusBadgeClass = 'bg-red-600 text-white animate-pulse';
  } else if (progressRatio >= 50) {
    statusText = 'Đang bán chạy';
    statusBadgeClass = 'bg-orange-500 text-white';
  }

  const compared = isCompared(productId);

  const handleQuickViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
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
      <Link href={`/products/${productSlug}`} className="block h-full">
        <Card className="h-full flex flex-col justify-between overflow-hidden rounded-xl border border-red-100 bg-white hover:border-red-400 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 p-2.5 sm:p-3 relative">

          {/* Top Badges */}
          <div className="flex items-center justify-between gap-1 mb-2 z-10">
            {discountPercent > 0 ? (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-black tracking-tight text-white bg-gradient-to-r from-red-600 to-amber-500 shadow-sm animate-pulse">
                <Zap className="size-3 fill-yellow-200 text-yellow-200" />
                GIẢM {discountPercent}%
              </span>
            ) : (
              <span />
            )}

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${statusBadgeClass}`}>
              {statusText}
            </span>
          </div>

          {/* Product Image Area */}
          <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center p-2 mb-2">
            {hoverImage ? (
              <>
                <img
                  src={thumbnail}
                  alt={productName}
                  onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                  className="w-full h-full object-contain transition-opacity duration-300 group-hover:opacity-0"
                  loading="lazy"
                />
                <img
                  src={hoverImage}
                  alt={productName}
                  onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                  className="w-full h-full object-contain absolute inset-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </>
            ) : (
              <img
                src={thumbnail}
                alt={productName}
                onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            )}

            {/* Quick Actions (QuickView & Compare) */}
            <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 z-20">
              <button
                type="button"
                onClick={handleQuickViewClick}
                title="Xem nhanh"
                className="size-8 rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-red-600 shadow-md flex items-center justify-center transition-colors cursor-pointer"
              >
                <Eye size={15} />
              </button>
              <button
                type="button"
                onClick={handleCompareClick}
                title="So sánh"
                className={`size-8 rounded-full shadow-md flex items-center justify-center transition-colors cursor-pointer ${compared ? 'bg-red-600 text-white' : 'bg-white/90 hover:bg-white text-gray-700 hover:text-red-600'
                  }`}
              >
                {compared ? <Check size={14} /> : <ArrowLeftRight size={14} />}
              </button>
            </div>

            {/* Sold out overlay */}
            {isSoldOut && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 p-2 text-center">
                <span className="px-3 py-1 bg-red-600 text-white font-black text-xs uppercase tracking-wider rounded-md shadow-lg border border-white/20">
                  {isOutOfWarehouse ? 'TẠM HẾT HÀNG' : 'HẾT SUẤT GIÁ SỐC'}
                </span>
                <span className="text-[10px] text-white/90 mt-1 font-medium">Hẹn bạn đợt sale tới</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {product.brand?.name && (
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5 truncate">
                  {product.brand.name}
                </span>
              )}

              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors leading-snug" title={productName}>
                {productName}
              </h3>

              {Array.isArray(item.variantsList) && item.variantsList.length > 1 && (
                <div className="flex flex-wrap items-center gap-1 mt-1.5 pt-1 border-t border-gray-100">
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
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${isSelected
                          ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
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
            <div className="mt-2.5 pt-2 border-t border-red-50">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-base sm:text-lg font-black text-red-600 tracking-tight">
                  {flashSalePrice > 0 ? `${flashSalePrice.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                </span>
                {originalPrice > flashSalePrice && (
                  <span className="text-xs text-gray-400 line-through">
                    {originalPrice.toLocaleString('vi-VN')}₫
                  </span>
                )}
              </div>

              {discountSavings > 0 && (
                <div className="text-[11px] font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
                  <span>Tiết kiệm:</span>
                  <span className="text-red-600 font-bold">{discountSavings.toLocaleString('vi-VN')}₫</span>
                </div>
              )}

              {/* Fire Progress Bar */}
              <div className="mt-2.5">
                <div className="relative w-full h-4 sm:h-4.5 bg-red-100 rounded-full overflow-hidden shadow-inner flex items-center">
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 transition-all duration-500 rounded-full flex items-center justify-end pr-1"
                    style={{ width: `${Math.max(8, progressRatio)}%` }}
                  >
                    <Flame className="size-3 text-yellow-200 fill-yellow-200 animate-bounce shrink-0" />
                  </div>
                  <span className="relative z-10 w-full text-center text-[10px] font-bold text-gray-900 tracking-tight drop-shadow-xs px-2 truncate">
                    {isSoldOut ? 'HẾT SUẤT' : `Đã bán ${soldInFlashSale}/${stockLimit} suất`}
                  </span>
                </div>

                {/* Sub info: Flash sale quota vs total sold */}
                <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1 font-medium">
                  <span className="truncate">
                    {isSoldOut ? '0 suất còn' : `Còn lại: ${actualAvailable} suất`}
                  </span>
                  <span className="truncate text-gray-400">
                    Đã bán shop: {totalSold}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 grid grid-cols-2 gap-1.5 pt-2 border-t border-dashed border-gray-100">
                <button
                  type="button"
                  disabled={isSoldOut}
                  onClick={handleAddToCart}
                  title="Thêm vào giỏ hàng"
                  className={`h-8 rounded-lg border flex items-center justify-center gap-1 text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${isSoldOut
                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 active:scale-95'
                    }`}
                >
                  <ShoppingCart size={13} className="shrink-0" />
                  <span className="truncate">Thêm vào giỏ</span>
                </button>

                <button
                  type="button"
                  disabled={isSoldOut}
                  onClick={handleBuyNow}
                  title="Mua ngay với giá Flash Sale"
                  className={`h-8 rounded-lg text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer ${isSoldOut
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:brightness-110 active:scale-95 shadow-red-500/20'
                    }`}
                >
                  <Zap size={13} className="fill-white shrink-0" />
                  <span className="truncate">Mua ngay</span>
                </button>
              </div>

            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
}

