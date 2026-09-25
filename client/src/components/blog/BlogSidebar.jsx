'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

export const BlogSidebar = ({
  trendingPosts = [],
  categories = [],
  tags = [],
  currentCategory = '',
  currentTag = '',
}) => {
  return (
    <aside className="space-y-6">
      {/* 1. Trending / Most Read Posts */}
      <Card className="border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-4">
          <CardTitle className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">
            Đọc Nhiều Nhất
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 divide-y divide-slate-100">
          {trendingPosts.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">Chưa có bài viết xu hướng</p>
          ) : (
            trendingPosts.slice(0, 5).map((post, idx) => {
              const rankFormatted = String(idx + 1).padStart(2, '0');

              return (
                <Link
                  key={post._id || post.slug}
                  href={`/blogs/${post.slug}`}
                  className="flex items-start gap-3 py-3 group hover:bg-slate-50/80 rounded-xl px-2 transition-all duration-200"
                >
                  <span className="text-sm font-extrabold text-slate-300 group-hover:text-[#284ea1] transition-colors shrink-0 w-6 pt-0.5 tracking-tight font-mono">
                    {rankFormatted}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-[#284ea1] transition-colors leading-snug">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-medium">
                      <span className="text-[#284ea1] font-semibold">
                        {post.categories?.[0]?.name || 'Công nghệ'}
                      </span>
                      {typeof post.viewsCount === 'number' && (
                        <span>• {post.viewsCount.toLocaleString()} xem</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* 2. Blog Categories */}
      {categories.length > 0 && (
        <Card className="border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-4">
            <CardTitle className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">
              Danh Mục Bài Viết
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-1">
              {categories.map((cat) => {
                const isActive = currentCategory === cat.slug;
                return (
                  <Link
                    key={cat._id || cat.slug}
                    href={`/blogs?category=${cat.slug}`}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition-all font-medium',
                      isActive
                        ? 'bg-[#edf2fa] text-[#284ea1] font-bold shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-[#284ea1]'
                    )}
                  >
                    <span>{cat.name}</span>
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-bold',
                        isActive
                          ? 'bg-[#284ea1] text-white'
                          : 'bg-slate-100 text-slate-500'
                      )}
                    >
                      {cat.postCount || 0}
                    </span>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. Popular Tags */}
      {tags.length > 0 && (
        <Card className="border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-4">
            <CardTitle className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">
              Chủ Đề Nổi Bật
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => {
                const isActive = currentTag === tag.slug;
                return (
                  <Link
                    key={tag._id || tag.slug}
                    href={`/blogs?tag=${tag.slug}`}
                    className={cn(
                      'inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200',
                      isActive
                        ? 'bg-[#284ea1] text-white shadow-xs'
                        : 'bg-[#edf2fa] text-[#284ea1] hover:bg-[#284ea1] hover:text-white'
                    )}
                  >
                    <span>#{tag.name}</span>
                    {typeof tag.postCount === 'number' && tag.postCount > 0 && (
                      <span className="opacity-75 text-[10px] ml-1">({tag.postCount})</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </aside>
  );
};

export default BlogSidebar;
