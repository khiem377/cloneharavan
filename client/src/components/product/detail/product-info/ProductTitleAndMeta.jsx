'use client';

import React from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
            <span key={i} className="inline-flex">
              <Star
                size={13}
                className={
                  filled
                    ? 'fill-amber-400 text-amber-400'
                    : half
                    ? 'fill-amber-400 text-amber-400 opacity-60'
                    : 'fill-slate-200 text-slate-200'
                }
              />
            </span>
          );
        })}
      </div>
      <span className="text-xs font-semibold text-slate-800 tabular-nums font-mono">{rating.toFixed(1)}</span>
      {count > 0 && (
        <a href="#product-reviews" className="text-xs text-slate-500 hover:text-red-600 hover:underline transition-colors tabular-nums font-mono">
          ({count.toLocaleString('vi-VN')} đánh giá)
        </a>
      )}
    </div>
  );
}

export default function ProductTitleAndMeta({
  brand,
  dynamicProductName = '',
  productName = '',
  ratingsAverage = 0,
  ratingsQuantity = 0,
  isOutOfStock = false,
  isLowStock = false,
  currentStock = 0,
}) {
  return (
    <div className="flex flex-col gap-2.5">
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

      <h1 className="text-lg sm:text-2xl font-bold text-slate-900 leading-snug tracking-tight">
        {dynamicProductName || productName}
      </h1>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pb-3 border-b border-slate-200">
        <StarRating rating={ratingsAverage} count={ratingsQuantity} />
        <Separator orientation="vertical" className="h-3.5 bg-slate-200" />
        {isOutOfStock ? (
          <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold">
            Hết hàng
          </Badge>
        ) : isLowStock ? (
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold tabular-nums font-mono">
            Chỉ còn {currentStock} sản phẩm
          </Badge>
        ) : (
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold">
            Còn hàng
          </Badge>
        )}
      </div>
    </div>
  );
}
