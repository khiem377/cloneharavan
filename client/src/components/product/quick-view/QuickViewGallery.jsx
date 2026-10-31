'use client';

import React from 'react';
import { Flame, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function QuickViewGallery({
  product,
  currentImage,
  images = [],
  activeImageIdx = 0,
  variantSelectedImage = null,
  onSelectImage,
}) {
  return (
    <div className="space-y-3">
      <div className="relative aspect-4/3 sm:aspect-square w-full bg-white rounded-[6px] border border-slate-200 flex items-center justify-center overflow-hidden p-3 shadow-2xs">
        {product?.isHot && (
          <Badge
            variant="default"
            className="absolute top-2.5 left-2.5 z-10 bg-[#e30019] hover:bg-[#e30019] text-white text-[10px] font-bold uppercase tracking-wider gap-1"
          >
            <Flame size={12} className="fill-current" />
            <span>SẢN PHẨM HOT</span>
          </Badge>
        )}
        {product?.isFeatured && !product?.isHot && (
          <Badge
            variant="default"
            className="absolute top-2.5 left-2.5 z-10 bg-amber-500 hover:bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider gap-1"
          >
            <Star size={12} className="fill-current" />
            <span>SẢN PHẨM NỔI BẬT</span>
          </Badge>
        )}

        <img
          src={currentImage}
          alt={product?.name || 'Sản phẩm'}
          className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = '/logo-shop.jpg';
          }}
        />
      </div>

      {images.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {images.map((img, idx) => (
            <Button
              key={idx}
              type="button"
              variant="outline"
              size="icon"
              onClick={() => onSelectImage(idx)}
              className={`w-14 h-14 rounded-[6px] border p-1 bg-white shrink-0 overflow-hidden ${
                activeImageIdx === idx && !variantSelectedImage
                  ? 'border-[#e30019] ring-2 ring-[#e30019]/20'
                  : 'border-slate-200 hover:border-slate-400'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-contain" />
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

