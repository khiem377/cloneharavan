'use client';

import React from 'react';
import Link from 'next/link';

/**
 * HomeCategoryShortcuts - Dải Phím Tắt Danh Mục Nổi Bật (Thiết kế tối giản, sạch sẽ, không icon thừa thãi)
 * 100% dữ liệu từ Database MongoDB
 */
export default function HomeCategoryShortcuts({ categories = [] }) {
  const dbCategories = (categories || []).filter((c) => c && c.name && c.slug);

  if (dbCategories.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 my-5" aria-label="Danh mục ngành hàng">
      <div className="bg-white rounded-[6px] border border-slate-200 p-4 sm:p-5">
        {/* Header khối */}
        <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-wider uppercase">
              Danh mục ngành hàng
            </h2>
          </div>
          <Link
            href="/collections/all"
            className="text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors inline-flex items-center gap-1 active:scale-[0.98]"
          >
            <span>Tất cả ngành hàng</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        {/* Lưới danh mục tối giản - tập trung vào Typography & Nhóm sản phẩm thực tế */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-2.5">
          {dbCategories.slice(0, 8).map((cat) => {
            const iconUrl = cat.icon?.url || (typeof cat.icon === 'string' ? cat.icon : null);
            const childCount = Array.isArray(cat.children) ? cat.children.length : 0;
            const topChildName = cat.children?.[0]?.name;

            return (
              <Link
                key={cat._id || cat.slug}
                href={`/collections/${cat.slug}`}
                className="group relative flex flex-col justify-between p-3 rounded-[6px] border border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50/50 transition-all duration-150 active:scale-[0.98]"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                      {cat.name}
                    </span>
                    {childCount > 0 && (
                      <span className="text-[10px] font-mono font-semibold text-slate-400 shrink-0">
                        {childCount}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1 font-normal">
                    {topChildName || 'Xem sản phẩm'}
                  </p>
                </div>

                {iconUrl && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-center">
                    <img
                      src={iconUrl}
                      alt={cat.name}
                      className="h-7 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                      loading="lazy"
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
