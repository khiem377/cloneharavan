'use client';

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * HomeTechNews - Khối Tin Tức Công Nghệ & Đánh Giá
 * Tuân thủ 100% triết lý phẳng (Anti-Slop), không icon thừa, dùng shadcn/ui + Tailwind CSS
 */
export default function HomeTechNews({
  featuredPost = null,
  latestPosts = [],
}) {
  const heroPost = featuredPost || latestPosts[0] || null;
  const sidePosts = latestPosts.filter((p) => (p._id || p.slug) !== (heroPost?._id || heroPost?.slug)).slice(0, 4);

  if (!heroPost && sidePosts.length === 0) {
    return null;
  }

  const heroCategory = heroPost?.categories?.[0]?.name || 'Tin công nghệ';
  const heroThumb =
    heroPost?.thumbnailUrl ||
    heroPost?.thumbnail?.url ||
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80';

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 my-6" aria-label="Tin tức & Tư vấn chọn mua">
      <div className="bg-white rounded-[6px] border border-slate-200 p-3.5 sm:p-5">

        {/* ─── HEADER KHỐI ─── */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight uppercase">
            Tin tức nổi bật
          </h2>

          <Link
            href="/blogs"
            className="text-xs font-semibold text-slate-600 hover:text-red-600 transition-colors inline-flex items-center gap-1 active:scale-[0.98]"
          >
            <span>Xem tất cả bài viết</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* ─── NỘI DUNG 2 CỘT ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* CỘT TRÁI: 1 BÀI VIẾT NỔI BẬT NHẤT */}
          {heroPost && (
            <div className="lg:col-span-6 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                  Tin Tức Nổi Bật
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  (Xem nhiều nhất)
                </span>
              </div>

              <Link
                href={`/blogs/${heroPost.slug}`}
                className="group relative flex-1 min-h-[320px] rounded-[6px] border border-slate-200 overflow-hidden flex flex-col justify-end p-4 sm:p-5 bg-slate-950 transition-all duration-200 active:scale-[0.99]"
              >
                <img
                  src={heroThumb}
                  alt={heroPost.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-70 transition-all duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default" className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-wide rounded-[4px]">
                      {heroCategory}
                    </Badge>
                    <span className="text-[11px] text-slate-300 font-mono tabular-nums">
                      {(heroPost.viewsCount || heroPost.views || 1420).toLocaleString('vi-VN')} lượt xem
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                    {heroPost.title}
                  </h3>

                  {heroPost.excerpt && (
                    <p className="text-xs text-slate-300 line-clamp-2 mt-1.5 leading-relaxed font-normal">
                      {heroPost.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/15 text-[11px] text-slate-400 font-mono tabular-nums">
                    <div className="flex items-center gap-2">
                      <span>{formatDate(heroPost.publishedAt || heroPost.createdAt)}</span>
                      {heroPost.minRead && (
                        <>
                          <span className="text-slate-500">•</span>
                          <span>{heroPost.minRead} phút đọc</span>
                        </>
                      )}
                    </div>

                    <span className="text-xs font-medium text-white/90 group-hover:text-white transition-colors flex items-center gap-1">
                      <span>Đọc tiếp</span>
                      <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* CỘT PHẢI: 4 BÀI VIẾT MỚI NHẤT */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                Bài Viết Mới
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                (Cập nhật hàng ngày)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
              {sidePosts.map((post) => {
                const catName = post.categories?.[0]?.name || 'Công nghệ';
                const thumb =
                  post.thumbnailUrl ||
                  post.thumbnail?.url ||
                  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80';

                return (
                  <Link
                    key={post._id || post.slug}
                    href={`/blogs/${post.slug}`}
                    className="group flex flex-col rounded-[6px] border border-slate-200 bg-white hover:border-slate-400 transition-colors overflow-hidden active:scale-[0.99]"
                  >
                    <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden border-b border-slate-100">
                      <img
                        src={thumb}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="bg-slate-900/85 text-white text-[9px] font-bold uppercase tracking-wide border-transparent rounded-[4px]">
                          {catName}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-2.5 flex flex-col justify-between flex-1">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h4>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono tabular-nums pt-2 mt-2 border-t border-slate-100">
                        <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                        {post.minRead && (
                          <span>{post.minRead}p đọc</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

