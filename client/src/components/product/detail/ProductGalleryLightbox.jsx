'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ProductGalleryLightbox({
  isOpen,
  onClose,
  product,
  allImages = [],
  activeIdx,
  setActiveIdx,
  currentImage,
}) {
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (!isOpen) {
      setZoomLevel(1);
      return;
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        setActiveIdx((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
        setZoomLevel(1);
      }
      if (e.key === 'ArrowRight') {
        setActiveIdx((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
        setZoomLevel(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allImages.length, onClose, setActiveIdx]);

  if (!isOpen) return null;

  const handleZoomToggle = () => {
    setZoomLevel((prev) => (prev === 1 ? 2 : prev === 2 ? 3 : 1));
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-3 sm:p-6 animate-in fade-in duration-200 select-none cursor-default"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl flex items-center justify-between text-white pb-3 border-b border-white/10"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm font-bold tracking-tight line-clamp-1 max-w-[280px] sm:max-w-md">
            {product?.name || 'Chi tiết hình ảnh'}
          </span>
          <Badge variant="secondary" className="font-mono tabular-nums text-xs bg-white/15 text-white border-none">
            {activeIdx + 1} / {allImages.length}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handleZoomToggle}
            className="text-white/80 hover:text-white hover:bg-white/10"
            title="Thu phóng ảnh"
          >
            {zoomLevel === 1 ? <ZoomIn className="size-4" /> : zoomLevel === 2 ? <ZoomOut className="size-4" /> : <RotateCcw className="size-4" />}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10"
            title="Đóng (Esc)"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex-1 w-full max-w-6xl flex items-center justify-center overflow-hidden my-3"
      >
        {allImages.length > 1 && (
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => {
              setActiveIdx((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
              setZoomLevel(1);
            }}
            className="absolute left-2 sm:left-4 z-10 bg-black/60 hover:bg-black/90 text-white border-white/20 rounded-full"
            aria-label="Ảnh trước"
          >
            <ChevronLeft className="size-5" />
          </Button>
        )}

        <div
          onClick={handleZoomToggle}
          className={`w-full h-full flex items-center justify-center transition-transform duration-200 ${
            zoomLevel > 1 ? 'cursor-zoom-out' : 'cursor-zoom-in'
          }`}
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <img
            src={currentImage}
            alt={product?.name || 'Ảnh chi tiết'}
            className="max-w-full max-h-[75vh] object-contain"
          />
        </div>

        {allImages.length > 1 && (
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => {
              setActiveIdx((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
              setZoomLevel(1);
            }}
            className="absolute right-2 sm:right-4 z-10 bg-black/60 hover:bg-black/90 text-white border-white/20 rounded-full"
            aria-label="Ảnh tiếp theo"
          >
            <ChevronRight className="size-5" />
          </Button>
        )}
      </div>

      {allImages.length > 1 && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl flex items-center justify-center gap-2 overflow-x-auto py-2 scrollbar-none"
        >
          {allImages.map((imgUrl, idx) => (
            <Button
              key={idx}
              type="button"
              variant="ghost"
              onClick={() => {
                setActiveIdx(idx);
                setZoomLevel(1);
              }}
              className={`w-12 h-12 rounded-[4px] border overflow-hidden p-0.5 shrink-0 bg-white/5 transition-opacity h-auto ${
                idx === activeIdx ? 'border-white opacity-100 ring-2 ring-white/50 hover:bg-white/10' : 'border-white/20 opacity-50 hover:opacity-80 hover:bg-white/10'
              }`}
            >
              <img
                src={imgUrl}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-contain"
              />
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
