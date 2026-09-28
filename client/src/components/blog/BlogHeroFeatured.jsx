'use client';

import React from 'react';
import Link from 'next/link';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const BlogHeroFeatured = ({ posts = [] }) => {
  if (!posts || posts.length === 0) return null;

  const mainPost = posts[0];
  const subPosts = posts.slice(1, 5);

  const mainCategory = mainPost?.categories?.[0]?.name || 'Tiêu điểm';
  const mainThumb =
    mainPost?.thumbnailUrl ||
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';

  return (
    <section className="w-full mb-10">
      {/* Section Title */}
      <div className="flex items-center justify-between gap-3 mb-5 pb-2 border-b border-slate-200">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight uppercase">
          Tin Nổi Bật Nhất
        </h2>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Biên tập viên chọn lọc
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Large Hero Card */}
        <div className="lg:col-span-7 xl:col-span-8">
          <Link
            href={`/blogs/${mainPost.slug}`}
            className="group relative block w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-slate-950 border border-slate-800/40"
          >
            {/* Background Image with Hover Scale */}
            <img
              src={mainThumb}
              alt={mainPost.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
              loading="eager"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-transparent to-transparent opacity-60" />

            {/* Content overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7 text-white">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#284ea1] text-white shadow-sm uppercase tracking-wide">
                  {mainCategory}
                </span>
                {mainPost.isPinned && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white">
                    Ghim đầu trang
                  </span>
                )}
              </div>

              <h3 className="text-lg sm:text-2xl md:text-3xl font-extrabold leading-snug line-clamp-2 group-hover:text-blue-200 transition-colors drop-shadow-md mb-2.5">
                {mainPost.title}
              </h3>

              {mainPost.excerpt && (
                <p className="text-xs sm:text-sm text-slate-300/90 line-clamp-2 font-normal leading-relaxed mb-4 hidden sm:block max-w-2xl">
                  {mainPost.excerpt}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-slate-300 font-medium pt-3 border-t border-white/10">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span>{formatDate(mainPost.publishedAt || mainPost.createdAt)}</span>
                  {mainPost.minRead && (
                    <span>• {mainPost.minRead} phút đọc</span>
                  )}
                  {typeof mainPost.viewsCount === 'number' && (
                    <span>• {mainPost.viewsCount.toLocaleString()} xem</span>
                  )}
                </div>

                <div className="text-xs font-bold text-white group-hover:text-blue-200 transition-colors">
                  Xem chi tiết &rarr;
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* 4 Secondary Sub-Cards Grid */}
        <div className="lg:col-span-5 xl:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
          {subPosts.map((post) => {
            const catName = post.categories?.[0]?.name || 'Tin công nghệ';
            const thumb =
              post.thumbnailUrl ||
              'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80';

            return (
              <Link
                key={post._id || post.slug}
                href={`/blogs/${post.slug}`}
                className="group flex gap-3.5 p-3 rounded-2xl border border-slate-200/90 bg-white hover:border-[#284ea1]/40 hover:shadow-md transition-all duration-300 items-center"
              >
                <div className="relative w-28 sm:w-32 h-20 sm:h-22 shrink-0 rounded-xl overflow-hidden bg-slate-100 shadow-2xs">
                  <img
                    src={thumb}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
                  <div>
                    <span className="inline-block text-[10px] font-bold text-[#284ea1] bg-[#edf2fa] px-2 py-0.5 rounded-md mb-1.5">
                      {catName}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-[#284ea1] transition-colors leading-snug">
                      {post.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                    <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                    {post.minRead && (
                      <span>• {post.minRead} phút đọc</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BlogHeroFeatured;
