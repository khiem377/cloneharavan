'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import useCartStore from '@/store/cartStore';

// Inline trust strip — compact, ngang, ngay trước CTA
function TrustStrip() {
  const items = [
    { label: '100% Chính hãng' },
    { label: 'Bảo hành 12 tháng' },
    { label: 'Đổi trả 30 ngày' },
  ];
  return (
    <div className="flex items-center divide-x divide-slate-200 rounded-[6px] border border-slate-200 bg-slate-50 overflow-hidden">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5 px-3 py-2 flex-1 justify-center">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
            <svg width="7" height="7" viewBox="0 0 10 10" fill="none">
              <path d="M2 5.5L4 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="text-[11px] font-medium text-slate-700 leading-tight whitespace-nowrap">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// Star rating visual component
function StarRating({ rating = 0, count = 0 }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < fullStars;
          const half = !filled && i === fullStars && hasHalf;
          return (
            <svg key={i} width="13" height="13" viewBox="0 0 16 16" fill="none">
              {half ? (
                <>
                  <defs>
                    <linearGradient id={`half-${i}`}>
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="50%" stopColor="#e2e8f0" />
                    </linearGradient>
                  </defs>
                  <path d="M8 1.5l1.8 3.6 4 .58-2.9 2.83.68 4-3.58-1.88-3.58 1.88.68-4L2.2 5.68l4-.58z" fill={`url(#half-${i})`} />
                </>
              ) : (
                <path d="M8 1.5l1.8 3.6 4 .58-2.9 2.83.68 4-3.58-1.88-3.58 1.88.68-4L2.2 5.68l4-.58z" fill={filled ? '#f59e0b' : '#e2e8f0'} />
              )}
            </svg>
          );
        })}
      </div>
      <span className="text-xs font-semibold text-slate-800">{rating.toFixed(1)}</span>
      {count > 0 && (
        <a href="#product-reviews" className="text-xs text-slate-500 hover:text-red-600 hover:underline transition-colors">
          ({count.toLocaleString('vi-VN')} đánh giá)
        </a>
      )}
    </div>
  );
}

// High-end Ticker Digit Block with smooth vertical slide micro-animation
function CountdownDigitBlock({ value, isRed = false, label = '' }) {
  const display = String(Math.max(0, value)).padStart(2, '0');

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative overflow-hidden flex items-center justify-center min-w-[26px] sm:min-w-[28px] h-6 sm:h-7 px-1 rounded-[4px] font-mono font-black text-xs sm:text-[13px] tabular-nums tracking-wider ${
          isRed
            ? 'bg-red-600 text-white border border-red-700 shadow-2xs'
            : 'bg-slate-900 text-white border border-slate-800 shadow-2xs'
        }`}
      >
        <span
          key={display}
          style={{
            display: 'inline-block',
            animation: 'fsTickerSlide 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {display}
        </span>
      </div>
      {label && (
        <span className="text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase tracking-tight mt-0.5">
          {label}
        </span>
      )}
    </div>
  );
}

// Flash Sale Countdown component - Dynamic Ticker with Micro-Animations & Labels
function FlashSaleCountdown({ endDate }) {
  const calculate = () => {
    if (!endDate) return null;
    const target = new Date(endDate).getTime();
    if (isNaN(target)) return null;
    const diff = target - Date.now();
    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return {
      days: isNaN(days) ? 0 : days,
      hours: isNaN(hours) ? 0 : hours,
      minutes: isNaN(minutes) ? 0 : minutes,
      seconds: isNaN(seconds) ? 0 : seconds,
    };
  };

  const [time, setTime] = useState(null);

  useEffect(() => {
    setTime(calculate());
    const interval = setInterval(() => {
      const next = calculate();
      setTime(next);
    }, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  if (!time) {
    return (
      <span className="text-xs text-slate-500 font-medium">Đang diễn ra</span>
    );
  }

  const d = time.days ?? 0;
  const h = time.hours ?? time.h ?? 0;
  const m = time.minutes ?? time.m ?? 0;
  const s = time.seconds ?? time.s ?? 0;

  return (
    <div className="flex items-center gap-2">
      <style>{`
        @keyframes fsTickerSlide {
          0% {
            transform: translateY(-5px);
            opacity: 0.25;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
      <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline">Kết thúc trong:</span>
      <div className="flex items-start gap-1">
        {d > 0 && (
          <>
            <CountdownDigitBlock value={d} label="Ngày" />
            <span className="text-slate-400 font-bold text-xs mt-1 animate-pulse">:</span>
          </>
        )}
        <CountdownDigitBlock value={h} label="Giờ" />
        <span className="text-slate-400 font-bold text-xs mt-1 animate-pulse">:</span>
        <CountdownDigitBlock value={m} label="Phút" />
        <span className="text-slate-400 font-bold text-xs mt-1 animate-pulse">:</span>
        <CountdownDigitBlock value={s} isRed label="Giây" />
      </div>
    </div>
  );
}


export default function ProductInfo({
  product,
  dynamicProductName = '',
  variants = [],
  selectedVariant,
  onSelectVariant,
  deals = null,
}) {
  const [quantity, setQuantity] = useState(1);
  const [actionNotice, setActionNotice] = useState(null);

  const isDefaultVariantName = (name) => {
    if (!name) return true;
    const lower = String(name).trim().toLowerCase();
    return (
      lower === 'mặc định' ||
      lower === 'mac dinh' ||
      lower === 'default' ||
      lower === 'default title' ||
      lower === 'tiêu chuẩn' ||
      lower === 'tieu chuan'
    );
  };

  // Helper trích xuất nhãn thuộc tính chính xác
  const getVariantLabel = (v) => {
    if (!v) return '';
    if (Array.isArray(v.attributes) && v.attributes.length > 0) {
      const validAttrs = v.attributes.filter((a) => !isDefaultVariantName(a.value));
      if (validAttrs.length > 0) {
        return validAttrs.map((a) => a.value).join(' - ');
      }
    }
    if (v.displayName && !isDefaultVariantName(v.displayName)) {
      return v.displayName;
    }
    if (v.title && !isDefaultVariantName(v.title)) {
      return v.title;
    }
    if (v.name && !isDefaultVariantName(v.name)) {
      return v.name;
    }
    return '';
  };

  // Lọc biến thể thực
  const realVariants = useMemo(() => {
    if (!Array.isArray(variants) || variants.length <= 1) return [];
    return variants.filter((v) => {
      const label = getVariantLabel(v);
      return Boolean(label);
    });
  }, [variants]);

  // Chỉ hiển thị khối chọn biến thể khi có >= 2 biến thể thực
  const displayVariants = realVariants.length > 1 ? realVariants : [];

  const groupName =
    displayVariants[0]?.attributes?.[0]?.name || product.options?.[0]?.name || 'Phiên bản';

  const selectedVariantLabel =
    getVariantLabel(selectedVariant) || (displayVariants[0] ? getVariantLabel(displayVariants[0]) : '');

  // Thứ tự ưu tiên 1: Flash Sale từ deals API (deals.isFlashSale + deals.flashSale)
  const flashSaleDeal = deals?.flashSale || null;
  const flashSaleItems = deals?.flashSaleItems || [];
  const isFlashSale = Boolean(deals?.isFlashSale && flashSaleDeal?.price > 0);

  // Tìm flash sale item khớp với variant đang chọn
  const matchedFsItem = useMemo(() => {
    if (!isFlashSale || !flashSaleItems.length) return flashSaleDeal;
    if (!selectedVariant) return flashSaleDeal;
    const vId = selectedVariant._id?.toString();
    const byVariant = flashSaleItems.find((i) => i.variantId && i.variantId === vId);
    if (byVariant) return byVariant;
    const noVariant = flashSaleItems.find((i) => !i.variantId);
    return noVariant || flashSaleDeal;
  }, [isFlashSale, flashSaleItems, selectedVariant, flashSaleDeal]);

  const activeSalePrice =
    isFlashSale && matchedFsItem?.price > 0
      ? matchedFsItem.price
      : selectedVariant?.salePrice !== undefined && selectedVariant?.salePrice !== null && selectedVariant.salePrice > 0
      ? selectedVariant.salePrice
      : product.salePrice || product.cachedSalePrice || 0;

  const activeRegularPrice =
    isFlashSale && matchedFsItem?.originalPrice
      ? matchedFsItem.originalPrice
      : selectedVariant?.price !== undefined && selectedVariant?.price !== null && selectedVariant.price > 0
      ? selectedVariant.price
      : product.price || product.cachedPrice || 0;

  const hasDiscount = activeSalePrice > 0 && activeRegularPrice > activeSalePrice;
  const currentBasePrice = activeSalePrice > 0 ? activeSalePrice : activeRegularPrice;
  const originalPrice = hasDiscount ? activeRegularPrice : 0;
  const discountPercent = hasDiscount
    ? Math.round(((activeRegularPrice - activeSalePrice) / activeRegularPrice) * 100)
    : 0;
  const savingsAmount = hasDiscount ? activeRegularPrice - activeSalePrice : 0;

  const brand = product.brand;
  const currentSku =
    selectedVariant?.sku || product.sku || product.productCode || product._id?.slice(-8)?.toUpperCase();

  const currentStock = selectedVariant?.stock !== undefined ? selectedVariant.stock : (product.stock ?? 10);
  const isOutOfStock = currentStock <= 0;
  const isLowStock = !isOutOfStock && currentStock <= 5;

  const finalTotalPrice = currentBasePrice * quantity;

  // Thứ tự ưu tiên 3: Quà tặng kèm Mua X Tặng Y (chỉ áp dụng khi không Flash Sale)
  const primaryGift = !isFlashSale && deals?.giftPrograms?.length > 0 ? deals.giftPrograms[0] : null;
  const triggerQty = primaryGift?.triggerQty || 0;
  const isGiftUnlocked = primaryGift && quantity >= triggerQty;
  const giftProductNames =
    primaryGift?.giftType === 'same_product'
      ? 'Sản phẩm cùng loại'
      : primaryGift?.giftProducts?.map((p) => p.productId?.name || 'Quà tặng kèm').join(', ') || 'Quà tặng kèm';

  const router = useRouter();
  const { addToCart } = useCartStore();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleQtyChange = (type) => {
    if (type === 'inc') {
      setQuantity((prev) => Math.min(prev + 1, currentStock || 99));
    } else {
      setQuantity((prev) => Math.max(1, prev - 1));
    }
  };

  const handleAddToCart = async (isBuyNow = false) => {
    if (isOutOfStock || isAddingToCart) return;
    setIsAddingToCart(true);
    setActionNotice(null);

    const payload = {
      productId: product._id || product.id,
      variantId: selectedVariant?._id || selectedVariant?.id,
      sku: selectedVariant?.sku,
      quantity,
    };

    const res = await addToCart(payload);
    setIsAddingToCart(false);

    if (res?.success) {
      if (isBuyNow) {
        router.push('/cart');
      }
    } else {
      setActionNotice({
        type: 'error',
        message: res?.message || 'Không thể thêm sản phẩm vào giỏ hàng',
      });
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  return (
    <div className="flex flex-col gap-4">

      {/* 1. BRAND META BAR */}
      {brand?.name && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <Link
            href={`/search?brand=${encodeURIComponent(brand.slug || brand._id || brand.name)}`}
            className="inline-flex items-center hover:opacity-85 transition-opacity"
            title={`Thương hiệu: ${brand.name}`}
          >
            {brand.logo?.url ? (
              <img
                src={brand.logo.url}
                alt={brand.name}
                className="h-5 max-w-[64px] object-contain inline-block border border-slate-200 rounded-[4px] px-1 bg-white hover:border-slate-300"
              />
            ) : (
              <span className="font-bold text-red-600 hover:text-red-700 hover:underline">{brand.name}</span>
            )}
          </Link>
        </div>
      )}

      {/* 2. PRODUCT TITLE (H1) */}
      <h1 className="text-lg sm:text-2xl font-bold text-slate-900 leading-snug tracking-tight">
        {dynamicProductName || product.name}
      </h1>

      {/* 3. STAR RATING + STOCK STATUS */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pb-3 border-b border-slate-100">
        <StarRating
          rating={product.ratingsAverage ?? 0}
          count={product.ratingsQuantity || 0}
        />
        <span className="text-slate-200">|</span>
        {isOutOfStock ? (
          <span className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-[4px]">
            Hết hàng
          </span>
        ) : isLowStock ? (
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-[4px]">
            Chỉ còn {currentStock} sản phẩm
          </span>
        ) : (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-[4px]">
            Còn hàng
          </span>
        )}
      </div>


      {/* 4. KHỐI GIÁ CẢ & FLASH SALE (SEAMLESS INTEGRATED STYLE) */}
      <div className="rounded-[6px] border border-slate-200 bg-slate-50/70 p-3.5 sm:p-4 flex flex-col gap-2.5">
        {/* Flash Sale Header Bar: Ribbon trên cùng */}
        {isFlashSale && (
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
            <div className="flex items-center gap-2 min-w-0">
              <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-[3px] tracking-wider shrink-0">
                FLASH SALE
              </span>
              <span className="font-bold text-xs sm:text-sm text-slate-800 tracking-tight truncate max-w-[180px] sm:max-w-[260px] uppercase">
                {flashSaleDeal?.name || 'SỰ KIỆN GIẢM SỐC'}
              </span>
            </div>
            {deals?.flashSale?.endDate && (
              <FlashSaleCountdown endDate={deals.flashSale.endDate} />
            )}
          </div>
        )}

        {/* Hàng Giá chính */}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-red-600 tracking-tight font-mono tabular-nums">
            {currentBasePrice > 0 ? `${currentBasePrice.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
          </span>

          {hasDiscount && (
            <>
              <span className="text-sm sm:text-base text-slate-400 line-through font-mono tabular-nums">
                {originalPrice.toLocaleString('vi-VN')}₫
              </span>
              <Badge variant="destructive" className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 font-mono tabular-nums">
                -{discountPercent}%
              </Badge>
            </>
          )}
        </div>

        {/* Mức tiết kiệm tuyệt đối */}
        {hasDiscount && savingsAmount > 0 && (
          <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0" />
              <path d="M13 5l-5 5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Tiết kiệm: <strong className="font-mono tabular-nums">{savingsAmount.toLocaleString('vi-VN')}₫</strong> so với giá niêm yết</span>
          </div>
        )}

        {/* Thanh tiến độ số lượng mở bán & đã bán từ DB khi Flash Sale */}
        {isFlashSale && matchedFsItem?.stockLimit > 0 && (
          <div className="pt-2 border-t border-slate-200/80 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">
                Đã bán: <strong className="font-mono tabular-nums text-slate-900">{matchedFsItem.soldCount || 0} / {matchedFsItem.stockLimit}</strong> suất
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                {matchedFsItem.remaining > 0 ? (
                  <>Còn <strong className="font-mono tabular-nums text-red-600">{matchedFsItem.remaining}</strong> suất ưu đãi</>
                ) : (
                  <strong className="text-red-600">Đã bán hết suất</strong>
                )}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, matchedFsItem.stockLimit > 0 ? Math.round(((matchedFsItem.soldCount || 0) / matchedFsItem.stockLimit) * 100) : 0)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Mô tả / Thể lệ chương trình từ DB */}
        {isFlashSale && flashSaleDeal?.description && (
          <div className="text-xs text-slate-600 pt-2 border-t border-slate-200/80 leading-relaxed">
            {flashSaleDeal.description}
          </div>
        )}
      </div>

      {/* 5. CHỌN BIẾN THỂ */}
      {displayVariants.length > 0 && (
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              {groupName}:{' '}
              <span className="text-red-600 font-bold normal-case">
                {selectedVariantLabel}
              </span>
            </label>
            <span className="text-[11px] text-slate-500">
              Chọn phiên bản để xem giá
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {displayVariants.map((variant) => {
              const isSelected = (selectedVariant?._id || selectedVariant?.id) === (variant._id || variant.id);
              const label = getVariantLabel(variant) || 'Tùy chọn';
              const varPrice = variant.salePrice > 0 ? variant.salePrice : variant.price;
              const hasColor = variant.attributes?.find((a) => a.colorCode)?.colorCode;

              // Tính chênh lệch giá so với biến thể đang chọn (Inline Upsell)
              const priceDiff = varPrice - currentBasePrice;
              let diffLabel = '';
              if (!isSelected && priceDiff > 0) {
                const diffTr = (priceDiff / 1000000).toFixed(1);
                diffLabel = `(+${diffTr.endsWith('.0') ? parseInt(diffTr, 10) : diffTr}Tr)`;
              } else if (!isSelected && priceDiff < 0) {
                const diffTr = (Math.abs(priceDiff) / 1000000).toFixed(1);
                diffLabel = `(-${diffTr.endsWith('.0') ? parseInt(diffTr, 10) : diffTr}Tr)`;
              }

              return (
                <button
                  key={variant._id || variant.id}
                  type="button"
                  onClick={() => onSelectVariant?.(variant)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-[6px] text-xs font-medium transition-all cursor-pointer select-none active:scale-[0.98] ${isSelected
                    ? 'border-2 border-red-600 bg-red-50/40 text-red-700 font-bold'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                    }`}
                >
                  {hasColor && (
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"
                      style={{ backgroundColor: hasColor }}
                    />
                  )}

                  <span>{label}</span>

                  {isSelected ? (
                    <>
                      <span className="text-[11px] text-red-700 font-bold ml-1">
                        • {varPrice.toLocaleString('vi-VN')}₫
                      </span>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="ml-0.5 shrink-0">
                        <path d="M2 6.5L4.5 9L10 3" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  ) : (
                    diffLabel && (
                      <span className="text-[11px] text-slate-500 font-normal ml-0.5">
                        {diffLabel}
                      </span>
                    )
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. SỐ LƯỢNG */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Số lượng:</span>
          <div className="inline-flex items-center rounded-[6px] border border-slate-300 bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => handleQtyChange('dec')}
              disabled={quantity <= 1 || isOutOfStock}
              className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer text-sm font-bold active:scale-[0.98]"
              aria-label="Giảm"
            >
              −
            </button>
            <span className="w-10 text-center text-xs font-bold text-slate-900 select-none">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => handleQtyChange('inc')}
              disabled={quantity >= (currentStock || 99) || isOutOfStock}
              className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer text-sm font-bold active:scale-[0.98]"
              aria-label="Tăng"
            >
              +
            </button>
          </div>

          {/* Stock urgency inline */}
          {isLowStock && (
            <span className="text-xs text-amber-700 font-semibold animate-pulse">
              Chỉ còn {currentStock} — đặt ngay!
            </span>
          )}
          {!isLowStock && !isOutOfStock && (
            <span className="text-xs text-slate-500">
              Có sẵn {currentStock} sản phẩm
            </span>
          )}
        </div>

        {/* THÔNG BÁO TẶNG KÈM DỰA TRÊN SỐ LƯỢNG */}
        {primaryGift && (
          <div
            className={`p-2.5 rounded-[6px] border text-xs transition-colors ${isGiftUnlocked
              ? 'border-emerald-300 bg-emerald-50 text-emerald-800 font-medium'
              : 'border-blue-200 bg-blue-50/70 text-blue-900'
              }`}
          >
            {isGiftUnlocked ? (
              <span>
                <strong>ĐÃ ĐỦ ĐIỀU KIỆN NHẬN QUÀ:</strong> Bạn được tặng thêm {primaryGift.giftQty || 1} suất quà ({giftProductNames})!
              </span>
            ) : (
              <span>
                <strong>ƯU ĐÃI TẶNG KÈM ({primaryGift.name}):</strong> Mua {triggerQty} tặng {primaryGift.giftQty || 1} ({giftProductNames}). Mua thêm <strong>{triggerQty - quantity}</strong> sản phẩm nữa để kích hoạt quà tặng!
              </span>
            )}
          </div>
        )}
      </div>

      {/* 7. TRUST STRIP — INLINE TRƯỚC CTA */}
      <TrustStrip />

      {/* 8. CÁC NÚT HÀNH ĐỘNG */}
      <div id="product-action-buttons" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleAddToCart(false)}
          disabled={isOutOfStock || isAddingToCart}
          className="border-2 border-red-600 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 font-bold text-xs sm:text-sm tracking-wide h-12 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isAddingToCart ? (
            <>
              <Loader2 size={16} className="animate-spin text-red-600" />
              <span>ĐANG THÊM...</span>
            </>
          ) : (
            <span>THÊM VÀO GIỎ HÀNG</span>
          )}
        </Button>

        <Button
          type="button"
          variant="default"
          onClick={() => handleAddToCart(true)}
          disabled={isOutOfStock || isAddingToCart}
          className="flex flex-col items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm tracking-wide h-12 py-1 leading-tight cursor-pointer"
        >
          <span>MUA NGAY VỚI GIÁ NÀY</span>
          <span className="text-[11px] font-normal opacity-90 font-mono">
            {finalTotalPrice > 0 ? `Tổng: ${finalTotalPrice.toLocaleString('vi-VN')}₫` : ''}
          </span>
        </Button>
      </div>

      {/* Action notice */}
      {actionNotice && (
        <div
          className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-between gap-2 animate-fadeIn ${
            actionNotice.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === 'error' ? (
              <AlertTriangle size={15} className="shrink-0 text-red-600" />
            ) : (
              <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          {actionNotice.type === 'success' && (
            <Link
              href="/cart"
              className="text-xs font-bold text-red-600 hover:text-red-700 underline shrink-0 flex items-center gap-0.5"
            >
              <span>Xem giỏ hàng</span>
              <ArrowRight size={13} />
            </Link>
          )}
        </div>
      )}

      {/* 9. HOTLINE TƯ VẤN */}
      <div className="flex items-center justify-between p-2.5 rounded-[6px] border border-slate-200 bg-slate-50 text-xs text-slate-600">
        <span>Hỗ trợ tư vấn đặt hàng:</span>
        <a
          href="tel:19001000"
          className="font-bold text-red-600 hover:text-red-700 hover:underline"
        >
          Hotline: 1900 1000 (Miễn phí)
        </a>
      </div>
    </div>
  );
}
