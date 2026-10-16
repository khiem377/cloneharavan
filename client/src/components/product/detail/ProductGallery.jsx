'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120' fill='none'%3E%3Crect width='120' height='120' rx='6' fill='%23f8fafc'/%3E%3Crect x='30' y='35' width='60' height='45' rx='4' stroke='%23cbd5e1' stroke-width='2' fill='none'/%3E%3Cpolyline points='48 80 40 90 80 90 72 80' stroke='%23cbd5e1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

const ZOOM_LEVEL = 2.2;
const ZOOM_BOX_SIZE = 380;

export default function ProductGallery({
  product,
  variants = [],
  selectedVariant,
  onSelectVariant,
  discountPercent = 0,
  isFlashSale = false,
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Kích thước tự nhiên của ảnh gốc
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  // Tọa độ và kích thước tính toán cho Lens và Zoom Box (chính xác theo vùng ảnh thực tế)
  const [lensStyle, setLensStyle] = useState({
    width: '120px',
    height: '120px',
    left: '0px',
    top: '0px',
    display: 'none',
  });
  const [zoomedImageStyle, setZoomedImageStyle] = useState({
    width: '100%',
    height: '100%',
    left: '0px',
    top: '0px',
  });

  const imageContainerRef = useRef(null);
  const mainImageRef = useRef(null);
  const thumbsContainerRef = useRef(null);

  // Tổng hợp ảnh từ selectedVariant, tất cả variants, và product
  const allImages = useMemo(() => {
    const list = [];
    const pushImg = (src) => {
      if (!src) return;
      const url = typeof src === 'string' ? src.trim() : (src.url ? String(src.url).trim() : '');
      // Chỉ chấp nhận URL http/https hợp lệ, loại trừ SVG fallback hoặc chuỗi rỗng
      if (
        url &&
        (url.startsWith('http://') || url.startsWith('https://')) &&
        !url.startsWith('data:image/svg+xml') &&
        !list.includes(url)
      ) {
        list.push(url);
      }
    };

    // 1. Ảnh của variant đang chọn
    if (selectedVariant?.thumbnail) pushImg(selectedVariant.thumbnail);
    if (Array.isArray(selectedVariant?.images)) {
      selectedVariant.images.forEach(pushImg);
    }

    // 2. Ảnh chính và gallery của product
    if (product?.thumbnail) pushImg(product.thumbnail);
    if (Array.isArray(product?.images)) {
      product.images.forEach(pushImg);
    }

    // 3. Ảnh từ tất cả các biến thể khác của sản phẩm
    if (Array.isArray(variants)) {
      variants.forEach((v) => {
        if (v?.thumbnail) pushImg(v.thumbnail);
        if (Array.isArray(v?.images)) {
          v.images.forEach(pushImg);
        }
      });
    }

    if (list.length === 0) list.push(FALLBACK_IMAGE);
    return list;
  }, [product, selectedVariant, variants]);

  // Cập nhật activeIdx khi đổi selectedVariant
  useEffect(() => {
    if (!selectedVariant) return;
    const vThumb = typeof selectedVariant.thumbnail === 'string'
      ? selectedVariant.thumbnail
      : selectedVariant.thumbnail?.url;
    if (vThumb) {
      const idx = allImages.findIndex((img) => img === vThumb);
      if (idx !== -1) {
        setActiveIdx(idx);
        return;
      }
    }
    setActiveIdx(0);
  }, [selectedVariant?._id, allImages]);

  const currentImage = allImages[activeIdx] || allImages[0] || FALLBACK_IMAGE;

  // Cập nhật naturalWidth/Height khi ảnh load hoặc đổi
  const handleImageLoad = (e) => {
    if (e.target.naturalWidth && e.target.naturalHeight) {
      setNaturalSize({
        width: e.target.naturalWidth,
        height: e.target.naturalHeight,
      });
    }
  };

  useEffect(() => {
    if (mainImageRef.current?.complete && mainImageRef.current.naturalWidth) {
      setNaturalSize({
        width: mainImageRef.current.naturalWidth,
        height: mainImageRef.current.naturalHeight,
      });
    }
  }, [currentImage]);

  /**
   * Tính toán vị trí Zoom CHUẨN XÁC cho ảnh dạng object-contain
   */
  const handleMouseMove = useCallback((e) => {
    if (!imageContainerRef.current || !mainImageRef.current) return;

    const container = imageContainerRef.current;
    const rect = container.getBoundingClientRect();
    const cw = rect.width;
    const ch = rect.height;

    // Kích thước tự nhiên của ảnh gốc
    const nw = naturalSize.width || mainImageRef.current.naturalWidth || cw;
    const nh = naturalSize.height || mainImageRef.current.naturalHeight || ch;

    // Tính kích thước và toạ độ hiển thị thực tế của ảnh dưới cơ chế object-contain
    const padding = 16;
    const availW = cw - padding * 2;
    const availH = ch - padding * 2;
    const containScale = Math.min(availW / nw, availH / nh);
    const rw = nw * containScale;
    const rh = nh * containScale;
    const offsetX = (cw - rw) / 2;
    const offsetY = (ch - rh) / 2;

    // Kích thước ô Lens trên khung ảnh chính
    const lensW = Math.min(rw, ZOOM_BOX_SIZE / ZOOM_LEVEL);
    const lensH = Math.min(rh, ZOOM_BOX_SIZE / ZOOM_LEVEL);

    // Tọa độ con trỏ chuột trong container
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Giới hạn lens nằm trọn vẹn trong vùng hiển thị ảnh thực tế
    const targetLensX = mouseX - lensW / 2;
    const targetLensY = mouseY - lensH / 2;

    const clampedLensX = Math.max(offsetX, Math.min(targetLensX, offsetX + rw - lensW));
    const clampedLensY = Math.max(offsetY, Math.min(targetLensY, offsetY + rh - lensH));

    setLensStyle({
      width: `${lensW}px`,
      height: `${lensH}px`,
      left: `${clampedLensX}px`,
      top: `${clampedLensY}px`,
      display: 'block',
    });

    // Cập nhật vị trí và kích thước ảnh phóng to trong Zoom Box
    setZoomedImageStyle({
      width: `${rw * ZOOM_LEVEL}px`,
      height: `${rh * ZOOM_LEVEL}px`,
      left: `${(offsetX - clampedLensX) * ZOOM_LEVEL}px`,
      top: `${(offsetY - clampedLensY) * ZOOM_LEVEL}px`,
    });
  }, [naturalSize]);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const scrollThumbs = (direction) => {
    if (!thumbsContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -180 : 180;
    thumbsContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Điều hướng bằng bàn phím trong Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft') {
        setActiveIdx((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
      }
      if (e.key === 'ArrowRight') {
        setActiveIdx((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, allImages.length]);

  const handleThumbnailSelect = (index) => {
    setActiveIdx(index);
    const targetUrl = allImages[index];
    if (targetUrl && Array.isArray(variants) && onSelectVariant) {
      const matchingVariant = variants.find((v) => {
        const thumb = typeof v.thumbnail === 'string' ? v.thumbnail : v.thumbnail?.url;
        if (thumb === targetUrl) return true;
        if (Array.isArray(v.images)) {
          return v.images.some((img) => (typeof img === 'string' ? img : img?.url) === targetUrl);
        }
        return false;
      });
      if (matchingVariant && ((matchingVariant._id || matchingVariant.id) !== (selectedVariant?._id || selectedVariant?.id))) {
        onSelectVariant(matchingVariant);
      }
    }
  };

  return (
    <div className="flex flex-col gap-3 relative max-w-[440px] 2xl:max-w-[460px] mx-auto w-full">
      {/* KHUNG ẢNH CHÍNH & VÙNG HOVER KÍNH LÚP */}
      <div
        ref={imageContainerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onClick={() => setIsLightboxOpen(true)}
        className="relative w-full aspect-square bg-white border border-slate-200 rounded-[6px] overflow-hidden select-none flex items-center justify-center cursor-zoom-in group p-3 sm:p-4 shadow-2xs"
      >
        {/* Badges dạng text thuần túy - Chuẩn quy tắc không emoji */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start pointer-events-none">
          {isFlashSale && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-[4px] bg-red-600 text-white text-[10px] font-bold tracking-wider uppercase">
              FLASH SALE
            </span>
          )}
          {discountPercent > 0 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-[4px] bg-red-600 text-white text-[10px] font-bold">
              -{discountPercent}%
            </span>
          )}
          {product?.isHot && !isFlashSale && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-[4px] bg-amber-500 text-white text-[10px] font-bold tracking-wider uppercase">
              HOT
            </span>
          )}
        </div>

        {/* Nút phóng to toàn màn hình góc trên bên phải */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsLightboxOpen(true);
          }}
          className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-[4px] bg-white/90 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          title="Xem ảnh toàn màn hình"
          aria-label="Phóng to ảnh"
        >
          <Maximize2 className="size-3.5" />
        </button>

        {/* Ảnh chính hiển thị vừa vặn, cân đối (object-contain) */}
        <div className="relative w-full h-full flex items-center justify-center pointer-events-none p-1 sm:p-2">
          <img
            ref={mainImageRef}
            src={currentImage}
            alt={product?.name || 'Ảnh sản phẩm'}
            className="max-w-full max-h-full w-auto h-auto object-contain"
            onLoad={handleImageLoad}
            loading="eager"
          />
        </div>

        {/* Khung ô kính mờ (Lens) bám sát vùng ảnh thực tế */}
        {isHovering && (
          <div
            className="hidden lg:block absolute border border-[#284ea1] bg-[#284ea1]/10 pointer-events-none rounded-[4px]"
            style={lensStyle}
          />
        )}
      </div>

      {/* CỬA SỔ ZOOM CHI TIẾT (LOUPE ZOOM BOX) */}
      {isHovering && (
        <div
          className="hidden lg:block absolute left-[103%] top-0 w-[380px] h-[380px] bg-white border border-slate-200 rounded-[6px] overflow-hidden z-40 shadow-md pointer-events-none"
        >
          <img
            src={currentImage}
            alt="Zoom chi tiết sản phẩm"
            className="absolute max-w-none pointer-events-none select-none"
            style={zoomedImageStyle}
          />
        </div>
      )}

      {/* DẢI THUMBNAILS (Rê chuột qua là đổi ảnh ngay) */}
      {allImages.length > 1 && (
        <div className="relative flex items-center">
          {allImages.length > 5 && (
            <button
              type="button"
              onClick={() => scrollThumbs('left')}
              className="p-1 rounded-[4px] border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 mr-1 shrink-0 transition-colors cursor-pointer active:scale-[0.98]"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="size-3.5" />
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
                  onClick={() => handleThumbnailSelect(index)}
                  onMouseEnter={() => handleThumbnailSelect(index)}
                  className={`relative w-13 h-13 sm:w-14 sm:h-14 shrink-0 rounded-[4px] bg-white transition-all cursor-pointer overflow-hidden p-1 active:scale-[0.98] ${
                    isActive
                      ? 'border-2 border-[#284ea1] ring-1 ring-[#284ea1]'
                      : 'border border-slate-200 hover:border-slate-400 opacity-75 hover:opacity-100'
                  }`}
                  aria-label={`Xem ảnh ${index + 1}`}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.parentElement.style.display = 'none';
                    }}
                  />
                </button>
              );
            })}
          </div>

          {allImages.length > 5 && (
            <button
              type="button"
              onClick={() => scrollThumbs('right')}
              className="p-1 rounded-[4px] border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 ml-1 shrink-0 transition-colors cursor-pointer active:scale-[0.98]"
              aria-label="Ảnh tiếp theo"
            >
              <ChevronRight className="size-3.5" />
            </button>
          )}
        </div>
      )}

      {/* MODAL LIGHTBOX XEM ẢNH FULL MÀN HÌNH CHẤT LƯỢNG CAO */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 flex flex-col items-center justify-between p-4 sm:p-8 animate-in fade-in duration-200 select-none cursor-default"
        >
          {/* Header Lightbox */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl flex items-center justify-between text-white pb-3 border-b border-white/20"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold tracking-wide">
                {product?.name || 'Chi tiết hình ảnh'}
              </span>
              <span className="text-xs text-white/60 font-mono">
                {activeIdx + 1} / {allImages.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-1.5 rounded-[6px] hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Đóng xem ảnh (Esc)"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Vùng hiển thị ảnh phóng to chính giữa */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-4 overflow-hidden"
          >
            <img
              src={currentImage}
              alt={product?.name || 'Ảnh chi tiết'}
              className="max-w-full max-h-[75vh] object-contain rounded-[6px] select-none"
            />

            {/* Nút lùi ảnh */}
            {allImages.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setActiveIdx((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))
                }
                className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all cursor-pointer active:scale-95"
                title="Ảnh trước (Mũi tên trái)"
              >
                <ChevronLeft className="size-6" />
              </button>
            )}

            {/* Nút tiến ảnh */}
            {allImages.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setActiveIdx((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all cursor-pointer active:scale-95"
                title="Ảnh tiếp theo (Mũi tên phải)"
              >
                <ChevronRight className="size-6" />
              </button>
            )}
          </div>

          {/* Dải thumbnail phụ dưới đáy modal */}
          {allImages.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 overflow-x-auto max-w-3xl py-2 px-3 bg-black/40 rounded-[6px] border border-white/10"
            >
              {allImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className={`w-12 h-12 rounded-[4px] overflow-hidden bg-white p-0.5 shrink-0 transition-all cursor-pointer ${
                    idx === activeIdx
                      ? 'ring-2 ring-blue-500 scale-105'
                      : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumb ${idx + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
