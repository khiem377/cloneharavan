'use client';

import React from 'react';

export default function FlashSaleSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-2.5 sm:gap-3.5 2xl:gap-4.5 mt-5">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-[6px] border border-slate-200 bg-white p-2.5 sm:p-3 flex flex-col justify-between animate-pulse"
        >
          {/* Top Badge placeholder */}
          <div className="flex justify-between items-center mb-2">
            <div className="h-4 w-12 bg-slate-200 rounded-[4px]" />
          </div>

          {/* Image placeholder */}
          <div className="aspect-square w-full bg-slate-100 rounded-[4px] mb-2.5" />

          {/* Title lines placeholder */}
          <div className="space-y-1.5 mb-3">
            <div className="h-3 w-16 bg-slate-200 rounded-[3px]" />
            <div className="h-3.5 w-full bg-slate-200 rounded-[3px]" />
            <div className="h-3.5 w-3/4 bg-slate-200 rounded-[3px]" />
          </div>

          {/* Pricing & Progress placeholder */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-5 w-24 bg-slate-200 rounded-[4px]" />
              <div className="h-3 w-16 bg-slate-100 rounded-[3px]" />
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full" />
            <div className="h-8 w-full bg-slate-200 rounded-[6px]" />
          </div>
        </div>
      ))}
    </div>
  );
}
