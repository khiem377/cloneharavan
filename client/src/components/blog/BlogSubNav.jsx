'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '../../lib/utils';

export const BlogSubNav = ({ categories = [] }) => {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || '';

  return (
    <div className="w-full bg-white border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#284ea1] mb-1">
              Chuyên trang công nghệ &amp; Đời sống số
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tin Tức, Đánh Giá &amp; Review
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md">
            Cập nhật xu hướng thiết bị, mẹo thủ thuật công nghệ và kinh nghiệm chọn mua chính hãng từ chuyên gia.
          </p>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 border-t border-slate-100 pt-3">
          {/* All Posts Pill */}
          <Link
            href="/blogs"
            className={cn(
              'inline-flex items-center px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 select-none shadow-2xs',
              !currentCategory
                ? 'bg-[#284ea1] text-white shadow-[0_4px_12px_rgba(40,78,161,0.25)] ring-2 ring-[#284ea1]/20'
                : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200/60'
            )}
          >
            Tất cả bài viết
          </Link>

          {/* Category Tabs */}
          {categories.map((cat) => {
            const isActive = currentCategory === cat.slug;
            return (
              <Link
                key={cat._id || cat.slug}
                href={`/blogs?category=${cat.slug}`}
                className={cn(
                  'inline-flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 shrink-0 select-none shadow-2xs',
                  isActive
                    ? 'bg-[#284ea1] text-white font-semibold shadow-[0_4px_12px_rgba(40,78,161,0.25)] ring-2 ring-[#284ea1]/20'
                    : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200/60'
                )}
              >
                <span>{cat.name}</span>
                {typeof cat.postCount === 'number' && cat.postCount > 0 && (
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1',
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    )}
                  >
                    {cat.postCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BlogSubNav;
