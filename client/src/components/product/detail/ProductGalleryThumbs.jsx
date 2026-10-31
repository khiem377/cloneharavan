'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProductGalleryThumbs({
  allImages = [],
  activeIdx,
  onThumbnailSelect,
}) {
  const thumbsContainerRef = useRef(null);

  const scrollThumbs = (direction) => {
    if (!thumbsContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -180 : 180;
    thumbsContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  if (allImages.length <= 1) return null;

  return (
    <div className="relative flex items-center w-full">
      {allImages.length > 5 && (
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          onClick={() => scrollThumbs('left')}
          className="mr-1 shrink-0 rounded-[4px] border-slate-200 text-slate-600 hover:text-slate-900"
          aria-label="Ảnh trước"
        >
          <ChevronLeft className="size-3.5" />
        </Button>
      )}

      <div
        ref={thumbsContainerRef}
        className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 w-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {allImages.map((imgUrl, index) => {
          const isActive = index === activeIdx;
          return (
            <Button
              key={index}
              type="button"
              variant="ghost"
              onClick={() => onThumbnailSelect(index)}
              onMouseEnter={() => onThumbnailSelect(index)}
              className={`relative w-13 h-13 sm:w-14 sm:h-14 shrink-0 rounded-[6px] bg-white transition-all overflow-hidden p-1 h-auto ${
                isActive
                  ? 'border border-slate-900 ring-1 ring-slate-900 shadow-2xs hover:bg-white'
                  : 'border border-slate-200 hover:border-slate-400 opacity-75 hover:opacity-100 hover:bg-white'
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
            </Button>
          );
        })}
      </div>

      {allImages.length > 5 && (
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          onClick={() => scrollThumbs('right')}
          className="ml-1 shrink-0 rounded-[4px] border-slate-200 text-slate-600 hover:text-slate-900"
          aria-label="Ảnh tiếp theo"
        >
          <ChevronRight className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
