'use client';

import React from 'react';

export default function GiftSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-[6px] border border-slate-200 bg-white p-4 sm:p-5 flex flex-col justify-between animate-pulse"
        >
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="h-5 w-28 bg-slate-200 rounded-[4px]" />
              <div className="h-4 w-24 bg-slate-100 rounded-[3px]" />
            </div>
            <div className="space-y-2 mb-3">
              <div className="h-5 w-3/4 bg-slate-200 rounded-[4px]" />
              <div className="h-3.5 w-full bg-slate-100 rounded-[3px]" />
            </div>
            <div className="h-14 w-full bg-slate-100 rounded-[4px] mb-3" />
            <div className="h-12 w-full bg-slate-100 rounded-[4px] mb-3" />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="h-3.5 w-36 bg-slate-100 rounded-[3px]" />
            <div className="h-8 w-28 bg-slate-200 rounded-[6px]" />
          </div>
        </div>
      ))}
    </div>
  );
}
