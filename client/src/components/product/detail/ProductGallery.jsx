'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120' fill='none'%3E%3Crect width='120' height='120' rx='6' fill='%23f8fafc'/%3E%3Crect x='30' y='35' width='60' height='45' rx='4' stroke='%23cbd5e1' stroke-width='2' fill='none'/%3E%3Cpolyline points='48 80 40 90 80 90 72 80' stroke='%23cbd5e1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

export default function ProductGallery({
  product,
  selectedVariant,
  discountPercent = 0,
  isFlashSale = false,
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef(null);
  const thumbsContainerRef = useRef(null);

  // Tổng hợp ảnh từ product và variant
  const allImages = useMemo(() => {
    const list = [];
    const pushImg = (src) => {
      if (!src) return;
      const url = typeof src === 'string' ? src : src.url;
      if (url && !list.includes(url)) list.push(url);
    };

    if (selectedVariant?.thumbnail) pushImg(selectedVariant.thumbnail);
    if (Array.isArray(selectedVariant?.images)) {
      selectedVariant.images.forEach(pushImg);
    }
    if (product?.thumbnail) pushImg(product.thumbnail);
    if (Array.isArray(product?.images)) {
      product.images.forEach(pushImg);
    }

    if (list.length === 0) list.push(FALLBACK_IMAGE);
    return list;
  }, [product, selectedVariant]);

  useEffect(() => {
    setActiveIdx(0);
  }, [selectedVariant?._id]);

  const currentImage = allImages[activeIdx] || allImages[0] || FALLBACK_IMAGE;

  // Tính toán vị trí chuột khi di chuyển trên ảnh chính (Hiệu ứng kính lúp zoom chi tiết chuẩn IKY / Tiki)
  const handleMouseMove = (e) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Giới hạn trong khung ảnh
    const clampedX = Math.max(0, Math.min(x, rect.width));
    const clampedY = Math.max(0, Math.min(y, rect.height));

    const percentX = (clampedX / rect.width) * 100;
    const percentY = (clampedY / rect.height) * 100;

    // Vị trí khung tròng kính (lens)
    const lensSize = 120;
    const lensX = Math.max(0, Math.min(clampedX - lensSize / 2, rect.width - lensSize));
    const lensY = Math.max(0, Math.min(clampedY - lensSize / 2, rect.height - lensSize));

    setZoomPos({ x: percentX, y: percentY });
    setLensPos({ x: lensX, y: lensY });
  };

  const scrollThumbs = (direction) => {
    if (!thumbsContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -180 : 180;
    thumbsContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col gap-3 relative">
      {/* KHUNG ẢNH CHÍNH & VÙNG HOVER KÍNH LÚP */}
      <div
        ref={imageContainerRef}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
        className="relative w-full aspect-square bg-white border border-slate-200 rounded-[6px] overflow-hidden select-none flex items-center justify-center p-3 cursor-crosshair"
      >
        {/* Badges dạng text thuần túy - KHÔNG ICONS - KHÔNG EMOJI */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start pointer-events-none">
          {isFlashSale && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] bg-red-600 text-white text-[11px] font-bold tracking-wider uppercase">
              FLASH SALE
            </span>
          )}
          {discountPercent > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] bg-red-600 text-white text-[11px] font-bold">
              -{discountPercent}%
            </span>
          )}
          {product?.isHot && !isFlashSale && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] bg-amber-500 text-white text-[11px] font-bold tracking-wider uppercase">
              HOT
            </span>
          )}
        </div>

        {/* Ảnh chính hiển thị */}
        <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
          <img
            src={currentImage}
            alt={product?.name || 'Ảnh sản phẩm'}
            className="w-full h-full object-contain"
            loading="eager"
          />
        </div>

        {/* Khung ô kính mờ (Lens) theo con trỏ chuột */}
        {isHovering && (
          <div
            className="absolute border border-red-500 bg-red-500/10 pointer-events-none rounded-[4px]"
            style={{
              width: '120px',
              height: '120px',
              left: `${lensPos.x}px`,
              top: `${lensPos.y}px`,
            }}
          />
        )}

        {/* Ghi chú rê chuột góc dưới
        <div className="absolute bottom-2 right-2 text-[10px] text-slate-400 pointer-events-none bg-white/90 px-1.5 py-0.5 rounded-[4px] border border-slate-100">
          Rê chuột để soi chi tiết
        </div> */}
      </div>

      {/* CỬA SỔ ZOOM CHI TIẾT (LOUPE ZOOM BOX - CHUẨN IKY / AMAZON) */}
      {isHovering && (
        <div
          className="hidden lg:block absolute left-[103%] top-0 w-[460px] h-[460px] bg-white border-2 border-slate-300 rounded-[6px] overflow-hidden z-40 shadow-sm pointer-events-none"
          style={{
            backgroundImage: `url(${currentImage})`,
            backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
            backgroundSize: '280% 280%',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded-[4px]">
            Xem chi tiết góc nhìn
          </div>
        </div>
      )}

      {/* DẢI THUMBNAILS (Rê chuột qua là đổi ảnh ngay) */}
      {allImages.length > 1 && (
        <div className="relative flex items-center">
          {allImages.length > 4 && (
            <button
              type="button"
              onClick={() => scrollThumbs('left')}
              className="px-2 py-1 rounded-[6px] border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 mr-1.5 shrink-0 transition-colors cursor-pointer text-xs font-bold active:scale-[0.98]"
              aria-label="Ảnh trước"
            >
              &lt;
            </button>
          )}

          <div
            ref={thumbsContainerRef}
            className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 w-full"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {allImages.map((imgUrl, index) => {
              const isActive = index === activeIdx;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveIdx(index)}
                  onMouseEnter={() => setActiveIdx(index)}
                  className={`relative w-16 h-16 sm:w-18 sm:h-18 shrink-0 rounded-[6px] bg-white p-1 transition-all cursor-pointer overflow-hidden active:scale-[0.98] ${isActive
                      ? 'border-2 border-red-600'
                      : 'border border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                    }`}
                  aria-label={`Xem ảnh ${index + 1}`}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              );
            })}
          </div>

          {allImages.length > 4 && (
            <button
              type="button"
              onClick={() => scrollThumbs('right')}
              className="px-2 py-1 rounded-[6px] border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 ml-1.5 shrink-0 transition-colors cursor-pointer text-xs font-bold active:scale-[0.98]"
              aria-label="Ảnh kế tiếp"
            >
              &gt;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
