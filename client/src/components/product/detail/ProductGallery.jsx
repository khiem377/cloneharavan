'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Maximize2 } from 'lucide-react';
import ProductGalleryLightbox from './ProductGalleryLightbox';
import ProductGalleryThumbs from './ProductGalleryThumbs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120' fill='none'%3E%3Crect width='120' height='120' rx='6' fill='%23f8fafc'/%3E%3Crect x='30' y='35' width='60' height='45' rx='4' stroke='%23cbd5e1' stroke-width='2' fill='none'/%3E%3Cpolyline points='48 80 40 90 80 90 72 80' stroke='%23cbd5e1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

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
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const imageContainerRef = useRef(null);
  const touchStartRef = useRef(null);

  const allImages = useMemo(() => {
    const list = [];
    const pushImg = (src) => {
      if (!src) return;
      const url = typeof src === 'string' ? src.trim() : (src.url ? String(src.url).trim() : '');
      if (
        url &&
        (url.startsWith('http://') || url.startsWith('https://')) &&
        !url.startsWith('data:image/svg+xml') &&
        !list.includes(url)
      ) {
        list.push(url);
      }
    };

    if (selectedVariant?.thumbnail) pushImg(selectedVariant.thumbnail);
    if (Array.isArray(selectedVariant?.images)) selectedVariant.images.forEach(pushImg);
    if (product?.thumbnail) pushImg(product.thumbnail);
    if (Array.isArray(product?.images)) product.images.forEach(pushImg);
    if (Array.isArray(variants)) {
      variants.forEach((v) => {
        if (v?.thumbnail) pushImg(v.thumbnail);
        if (Array.isArray(v?.images)) v.images.forEach(pushImg);
      });
    }

    if (list.length === 0) list.push(FALLBACK_IMAGE);
    return list;
  }, [product, selectedVariant, variants]);

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

  const handleMouseMove = useCallback((e) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setMousePos({ x, y });
  }, []);

  const handleThumbnailSelect = (index) => {
    setActiveIdx(index);
    const targetUrl = allImages[index];
    if (onSelectVariant && Array.isArray(variants)) {
      const matched = variants.find((v) => {
        const vUrl = typeof v?.thumbnail === 'string' ? v.thumbnail : v?.thumbnail?.url;
        return vUrl === targetUrl;
      });
      if (matched && matched._id !== selectedVariant?._id) {
        onSelectVariant(matched);
      }
    }
  };

  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartRef.current === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStartRef.current - touchEnd;
    touchStartRef.current = null;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setActiveIdx((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
      } else {
        setActiveIdx((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
      }
    }
  };

  return (
    <div className="flex flex-col gap-3 relative max-w-[440px] 2xl:max-w-[460px] mx-auto w-full">
      <div
        ref={imageContainerRef}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => setIsLightboxOpen(true)}
        className="relative w-full aspect-square bg-white border border-slate-200 rounded-[6px] overflow-hidden select-none flex items-center justify-center cursor-zoom-in group p-3 sm:p-4 shadow-2xs"
      >
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start pointer-events-none">
          {isFlashSale && (
            <Badge variant="destructive" className="px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold tracking-wider uppercase bg-red-600">
              FLASH SALE
            </Badge>
          )}
          {discountPercent > 0 && (
            <Badge variant="destructive" className="px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold font-mono tabular-nums bg-red-600">
              -{discountPercent}%
            </Badge>
          )}
          {product?.isHot && !isFlashSale && (
            <Badge variant="secondary" className="px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold tracking-wider uppercase bg-amber-500 text-white border-none">
              HOT
            </Badge>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          onClick={(e) => {
            e.stopPropagation();
            setIsLightboxOpen(true);
          }}
          className="absolute top-2.5 right-2.5 z-10 rounded-[4px] bg-white/90 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
          title="Xem ảnh toàn màn hình"
          aria-label="Phóng to ảnh"
        >
          <Maximize2 className="size-3.5" />
        </Button>

        <div className="absolute bottom-2.5 right-2.5 z-10 pointer-events-none">
          <Badge variant="secondary" className="font-mono tabular-nums text-[10px] bg-white/80 text-slate-700 border border-slate-200/80 px-1.5 py-0.5 rounded-[4px]">
            {activeIdx + 1} / {allImages.length}
          </Badge>
        </div>

        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <img
            src={currentImage}
            alt={product?.name || 'Ảnh sản phẩm'}
            className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-100 ease-out"
            style={{
              transform: isHovering ? 'scale(1.85)' : 'scale(1)',
              transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
            }}
            loading="eager"
          />
        </div>
      </div>

      <ProductGalleryThumbs
        allImages={allImages}
        activeIdx={activeIdx}
        onThumbnailSelect={handleThumbnailSelect}
      />

      <ProductGalleryLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        product={product}
        allImages={allImages}
        activeIdx={activeIdx}
        setActiveIdx={setActiveIdx}
        currentImage={currentImage}
      />
    </div>
  );
}
