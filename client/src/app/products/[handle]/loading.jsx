import React from 'react';

export default function ProductDetailLoading() {
  return (
    <div className="min-h-[100dvh] bg-slate-50/60 pb-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Breadcrumb skeleton */}
        <div className="py-3 flex items-center gap-2">
          <div className="h-4 w-16 bg-slate-200 animate-pulse rounded-[6px]" />
          <div className="h-4 w-4 bg-slate-200 animate-pulse rounded-[6px]" />
          <div className="h-4 w-24 bg-slate-200 animate-pulse rounded-[6px]" />
          <div className="h-4 w-4 bg-slate-200 animate-pulse rounded-[6px]" />
          <div className="h-4 w-40 bg-slate-200 animate-pulse rounded-[6px]" />
        </div>

        {/* Main stage skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-[6px] border border-slate-200 p-4 sm:p-6 mb-6">
          {/* Cột trái: Gallery */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="w-full aspect-square bg-slate-200 animate-pulse rounded-[6px]" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-16 h-16 bg-slate-200 animate-pulse rounded-[6px]"
                />
              ))}
            </div>
            <div className="h-20 bg-slate-100 animate-pulse rounded-[6px] border border-slate-200" />
          </div>

          {/* Cột phải: Product Info */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="h-4 w-48 bg-slate-200 animate-pulse rounded-[6px]" />
            <div className="h-8 w-4/5 bg-slate-200 animate-pulse rounded-[6px]" />
            <div className="h-24 bg-slate-100 animate-pulse rounded-[6px] border border-slate-200" />
            <div className="h-14 bg-slate-100 animate-pulse rounded-[6px]" />
            <div className="h-10 w-36 bg-slate-200 animate-pulse rounded-[6px]" />
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="h-12 bg-slate-200 animate-pulse rounded-[6px]" />
              <div className="h-12 bg-slate-200 animate-pulse rounded-[6px]" />
            </div>
            <div className="h-28 bg-slate-100 animate-pulse rounded-[6px] border border-slate-200" />
          </div>
        </div>

        {/* Description & Specs skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          <div className="lg:col-span-8 h-96 bg-white rounded-[6px] border border-slate-200 animate-pulse p-6" />
          <div className="lg:col-span-4 h-96 bg-white rounded-[6px] border border-slate-200 animate-pulse p-6" />
        </div>
      </div>
    </div>
  );
}
