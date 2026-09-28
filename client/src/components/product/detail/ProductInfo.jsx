'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

export default function ProductInfo({
  product,
  variants = [],
  selectedVariant,
  onSelectVariant,
  deals = null,
}) {
  const [quantity, setQuantity] = useState(1);
  const [actionNotice, setActionNotice] = useState(null);

  // Helper trích xuất nhãn thuộc tính chính xác
  const getVariantLabel = (v) => {
    if (!v) return '';
    if (Array.isArray(v.attributes) && v.attributes.length > 0) {
      return v.attributes.map((a) => a.value).join(' - ');
    }
    if (v.displayName && v.displayName !== 'Mặc định') {
      return v.displayName;
    }
    return v.title || v.name || v.sku || '';
  };

  // Tính toán giá động theo variant và Flash Sale (Thứ tự ưu tiên 1: Flash Sale)
  const isFlashSale = Boolean(
    product.isFlashSale && (product.flashSale?.flashSalePrice || product.flashSalePrice)
  );

  const activeSalePrice = isFlashSale
    ? (product.flashSale?.flashSalePrice || product.flashSalePrice)
    : selectedVariant?.salePrice !== undefined && selectedVariant?.salePrice !== null && selectedVariant.salePrice > 0
      ? selectedVariant.salePrice
      : product.salePrice || product.cachedSalePrice || 0;

  const activeRegularPrice = isFlashSale && (product.flashSale?.originalPrice || product.flashSaleOriginalPrice)
    ? (product.flashSale?.originalPrice || product.flashSaleOriginalPrice)
    : selectedVariant?.price !== undefined && selectedVariant?.price !== null && selectedVariant.price > 0
      ? selectedVariant.price
      : product.price || product.cachedPrice || 0;

  const hasDiscount = activeSalePrice > 0 && activeRegularPrice > activeSalePrice;
  const currentBasePrice = activeSalePrice > 0 ? activeSalePrice : activeRegularPrice;
  const originalPrice = hasDiscount ? activeRegularPrice : 0;
  const discountPercent = hasDiscount
    ? Math.round(((activeRegularPrice - activeSalePrice) / activeRegularPrice) * 100)
    : 0;

  const brand = product.brand;
  const currentSku =
    selectedVariant?.sku || product.sku || product.productCode || product._id?.slice(-8)?.toUpperCase();

  const currentStock = selectedVariant?.stock !== undefined ? selectedVariant.stock : (product.stock ?? 10);
  const isOutOfStock = currentStock <= 0;

  // Lọc biến thể thực
  const realVariants = useMemo(() => {
    return variants.filter(
      (v) => (Array.isArray(v.attributes) && v.attributes.length > 0) || (v.displayName && v.displayName !== 'Mặc định')
    );
  }, [variants]);

  const displayVariants = realVariants.length > 0 ? realVariants : variants.length > 1 ? variants : [];

  const groupName =
    displayVariants[0]?.attributes?.[0]?.name || product.options?.[0]?.name || 'Phiên bản';

  const selectedVariantLabel =
    getVariantLabel(selectedVariant) || (displayVariants[0] ? getVariantLabel(displayVariants[0]) : 'Tiêu chuẩn');

  const finalTotalPrice = currentBasePrice * quantity;

  // Thứ tự ưu tiên 3: Quà tặng kèm Mua X Tặng Y (chỉ áp dụng khi không Flash Sale)
  const primaryGift = !isFlashSale && deals?.giftPrograms?.length > 0 ? deals.giftPrograms[0] : null;
  const triggerQty = primaryGift?.triggerQty || 0;
  const isGiftUnlocked = primaryGift && quantity >= triggerQty;
  const giftProductNames =
    primaryGift?.giftType === 'same_product'
      ? 'Sản phẩm cùng loại'
      : primaryGift?.giftProducts?.map((p) => p.productId?.name || 'Quà tặng kèm').join(', ') || 'Quà tặng kèm';

  const handleQtyChange = (type) => {
    if (type === 'inc') {
      setQuantity((prev) => Math.min(prev + 1, currentStock || 99));
    } else {
      setQuantity((prev) => Math.max(1, prev - 1));
    }
  };

  const handlePlaceholderAction = (actionName) => {
    setActionNotice(`Tính năng "${actionName}" đang được chuẩn bị và sẽ ra mắt cùng giỏ hàng.`);
    setTimeout(() => {
      setActionNotice(null);
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1. BRAND & SKU & RATING BAR (KHÔNG ICONS, KHÔNG EMOJI) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          {brand?.name && (
            <div className="flex items-center gap-1.5">
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
                  <>
                    <span className="font-semibold text-slate-700 mr-1">Thương hiệu:</span>
                    <span className="font-bold text-red-600 hover:text-red-700 hover:underline">{brand.name}</span>
                  </>
                )}
              </Link>
            </div>
          )}
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">
            Mã SP: <span className="text-slate-800 font-mono font-medium">{currentSku}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {product.ratingsQuantity > 0 ? (
            <>
              <span className="font-semibold text-slate-800 text-xs">
                Đánh giá: {(product.ratingsAverage || 5).toFixed(1)}/5
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 text-xs">
                {product.ratingsQuantity} nhận xét
              </span>
            </>
          ) : (
            <span className="text-slate-500 text-xs">
              Chưa có đánh giá
            </span>
          )}
          <span className="text-slate-300">|</span>
          <span
            className={`font-semibold ${isOutOfStock ? 'text-rose-600' : 'text-emerald-700'
              }`}
          >
            {isOutOfStock ? 'Hết hàng' : 'Còn hàng'}
          </span>
        </div>
      </div>

      {/* 2. PRODUCT TITLE (H1) */}
      <h1 className="text-lg sm:text-2xl font-bold text-slate-900 leading-snug tracking-tight">
        {product.name}
      </h1>

      {/* 3. KHỐI GIÁ CẢ & FLASH SALE (ƯU TIÊN 1: FLASH SALE) */}
      <div className="rounded-[6px] border border-slate-200 bg-slate-50/70 p-3.5 flex flex-col gap-2">
        {isFlashSale && (
          <div className="flex items-center justify-between pb-2 border-b border-red-200 text-xs">
            <span className="font-bold text-red-600 uppercase tracking-wide">
              FLASH SALE ĐANG DIỄN RA
            </span>
            <span className="text-slate-600 text-[11px] font-medium">
              Số lượng ưu đãi có hạn
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-2xl sm:text-3xl font-extrabold text-red-600 tracking-tight">
            {currentBasePrice > 0 ? `${currentBasePrice.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
          </span>

          {hasDiscount && (
            <>
              <span className="text-sm sm:text-base text-slate-400 line-through">
                {originalPrice.toLocaleString('vi-VN')}₫
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] bg-red-600 text-white text-xs font-bold">
                Tiết kiệm {discountPercent}%
              </span>
            </>
          )}
        </div>

        {/* <span className="text-[11px] text-slate-500">c
          (Đã bao gồm thuế VAT & Bảo hành chính hãng)
        </span> */}
      </div>

      {/* 4. CHỌN BIẾN THỂ (INLINE UPSELL CHUẨN APPLE & ĐIỆN MÁY XANH) */}
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
                      <span className="text-[10px] text-red-600 font-bold ml-0.5">
                        ✓
                      </span>
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

      {/* 5. BỘ ĐIỀU CHỈNH SỐ LƯỢNG (KÈM KIỂM TRA ĐIỀU KIỆN MUA MẤY TẶNG GÌ) */}
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

          <span className="text-xs text-slate-500">
            {currentStock > 0 ? `(Có sẵn ${currentStock} sản phẩm)` : '(Tạm thời hết hàng)'}
          </span>
        </div>

        {/* THÔNG BÁO TẶNG KÈM DỰA TRÊN SỐ LƯỢNG (LOGIC MUA X TẶNG Y) */}
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

      {/* 6. CÁC NÚT HÀNH ĐỘNG */}
      <div id="product-action-buttons" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => handlePlaceholderAction('Thêm vào giỏ hàng')}
          disabled={isOutOfStock}
          className="flex items-center justify-center py-3 px-4 rounded-[6px] border-2 border-red-600 bg-white text-red-600 hover:bg-red-50 font-bold text-xs sm:text-sm tracking-wide transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          THÊM VÀO GIỎ HÀNG
        </button>

        <button
          type="button"
          onClick={() => handlePlaceholderAction('Mua ngay')}
          disabled={isOutOfStock}
          className="flex flex-col items-center justify-center py-2.5 px-4 rounded-[6px] bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm tracking-wide transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>MUA NGAY VỚI GIÁ NÀY</span>
          <span className="text-[11px] font-normal opacity-90">
            {finalTotalPrice > 0 ? `Tổng: ${finalTotalPrice.toLocaleString('vi-VN')}₫` : ''}
          </span>
        </button>
      </div>

      {/* Thông báo tương tác placeholder */}
      {actionNotice && (
        <div className="p-2.5 rounded-[6px] border border-amber-200 bg-amber-50 text-amber-900 text-xs animate-fadeIn flex items-center justify-between">
          <span>{actionNotice}</span>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-amber-800 hover:text-amber-950 font-bold ml-2 text-xs"
          >
            [Đóng]
          </button>
        </div>
      )}

      {/* 8. DÒNG TƯ VẤN HOTLINE */}
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
