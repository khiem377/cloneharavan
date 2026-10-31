'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Flame, Sparkles } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { StaggerGrid, StaggerItem } from '@/components/common/ScrollReveal';

export default function HomeTrendingAndNewArrivals({
  trendingProducts = [],
  newArrivalProducts = [],
}) {
  const [activeMainTab, setActiveMainTab] = useState('hot_trend'); // 'hot_trend' | 'new_arrivals'
  const currentProducts = activeMainTab === 'hot_trend' ? trendingProducts : newArrivalProducts;
  const products = (Array.isArray(currentProducts) && currentProducts.length > 0)
    ? currentProducts
    : (Array.isArray(newArrivalProducts) && newArrivalProducts.length > 0 ? newArrivalProducts : trendingProducts);

  return (
    <section className="max-w-[1536px] 2xl:max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8 my-7" aria-label="Sản phẩm Hot Trend & Hàng Mới Về">
      <div className="bg-white border border-slate-200 rounded-[6px] p-4 sm:p-5 shadow-xs">
        {/* Header: Segmented Tab Switcher + View All Link */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="inline-flex p-1 bg-slate-100/90 border border-slate-200/60 rounded-[6px] gap-1 select-none">
            <button
              type="button"
              onClick={() => setActiveMainTab('hot_trend')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-[6px] text-xs sm:text-sm font-bold tracking-tight transition-all cursor-pointer ${
                activeMainTab === 'hot_trend'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Flame className={`w-4 h-4 shrink-0 ${activeMainTab === 'hot_trend' ? 'text-amber-300' : 'text-slate-500'}`} />
              <span>SẢN PHẨM HOT TREND</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab('new_arrivals')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-[6px] text-xs sm:text-sm font-bold tracking-tight transition-all cursor-pointer ${
                activeMainTab === 'new_arrivals'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Sparkles className={`w-4 h-4 shrink-0 ${activeMainTab === 'new_arrivals' ? 'text-amber-300' : 'text-slate-500'}`} />
              <span>HÀNG MỚI VỀ</span>
            </button>
          </div>

          <Link
            href={`/collections/${activeMainTab === 'hot_trend' ? 'hot' : 'new'}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand hover:text-brand-hover hover:underline transition-colors shrink-0"
          >
            <span>Xem tất cả {activeMainTab === 'hot_trend' ? 'sản phẩm Hot Trend' : 'hàng mới về'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Lưới sản phẩm: 5 cột x 2 hàng */}
        {products && products.length > 0 ? (
          <StaggerGrid
            key={activeMainTab}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-5 gap-2.5 sm:gap-3 2xl:gap-4 pt-4"
          >
            {products.slice(0, 10).map((prod) => (
              <StaggerItem key={prod._id || prod.id} className="h-full">
                <ProductCard product={prod} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        ) : (
          <div className="py-12 text-center text-slate-500 text-sm">
            Đang cập nhật danh sách sản phẩm...
          </div>
        )}
      </div>
    </section>
  );
}
