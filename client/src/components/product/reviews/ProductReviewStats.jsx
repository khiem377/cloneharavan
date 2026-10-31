'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function ProductReviewStats({
  averageRating = 0,
  totalReviews = 0,
  starPercentages = {},
  starDistribution = {},
  starFilter = null,
  onSelectStarFilter,
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50/70 p-4 sm:p-5 rounded-[6px] border border-slate-200">
        <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 pr-0 md:pr-4">
          <span className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
            {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
          </span>
          <div className="flex items-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-lg ${
                  star <= Math.round(averageRating) ? 'text-amber-400' : 'text-slate-300'
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-xs font-medium text-slate-500">
            {totalReviews > 0 ? `Dựa trên ${totalReviews} đánh giá thực tế` : 'Chưa có lượt đánh giá nào'}
          </span>
        </div>

        <div className="md:col-span-8 flex flex-col justify-center gap-2">
          {[5, 4, 3, 2, 1].map((s) => (
            <div key={s} className="flex items-center gap-3 text-xs">
              <span className="w-12 font-medium text-slate-700 flex items-center gap-0.5 shrink-0">
                {s} <span className="text-amber-500">★</span>
              </span>
              <Progress value={starPercentages[s] || 0} className="h-2 flex-1 bg-slate-200" />
              <span className="w-16 text-right text-slate-500 shrink-0 font-mono text-[11px] tabular-nums">
                {starDistribution[s] || 0} ({starPercentages[s] || 0}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-600 mr-1">Lọc theo:</span>
        <Button
          type="button"
          size="sm"
          variant={starFilter === null ? 'default' : 'outline'}
          onClick={() => onSelectStarFilter(null)}
          className="rounded-[6px] text-xs h-7 px-3 active:scale-[0.98]"
        >
          Tất cả ({totalReviews})
        </Button>
        {[5, 4, 3, 2, 1].map((s) => (
          <Button
            key={s}
            type="button"
            size="sm"
            variant={starFilter === s ? 'default' : 'outline'}
            onClick={() => onSelectStarFilter(starFilter === s ? null : s)}
            className="rounded-[6px] text-xs h-7 px-2.5 active:scale-[0.98]"
          >
            {s} ★ ({starDistribution[s] || 0})
          </Button>
        ))}
      </div>
    </div>
  );
}
