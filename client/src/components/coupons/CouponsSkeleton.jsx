'use client';

import React from 'react';

export default function CouponsSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-5">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-[6px] border border-slate-200 bg-white p-4 flex flex-col justify-between animate-pulse"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-[6px] bg-slate-200" />
              <div className="space-y-1.5">
                <div className="h-3 w-16 bg-slate-200 rounded-[3px]" />
                <div className="h-4 w-32 bg-slate-200 rounded-[4px]" />
              </div>
            </div>
            <div className="h-5 w-20 bg-slate-200 rounded-[4px]" />
          </div>

          <div className="space-y-2 mb-3">
            <div className="h-6 w-36 bg-slate-200 rounded-[4px]" />
            <div className="h-3 w-full bg-slate-100 rounded-[3px]" />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="h-3.5 w-24 bg-slate-200 rounded-[3px]" />
            <div className="h-7 w-20 bg-slate-200 rounded-[6px]" />
          </div>
        </div>
      ))}
    </div>
  );
}
