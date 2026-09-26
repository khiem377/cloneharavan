'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '../ui/card';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const BlogCard = ({ post, viewMode = 'grid' }) => {
  if (!post) return null;

  const category = post.categories?.[0]?.name || 'Tin công nghệ';
  const authorName =
    post.authorId?.firstName && post.authorId?.lastName
      ? `${post.authorId.lastName} ${post.authorId.firstName}`
      : post.authorId?.email?.split('@')[0] || 'Ban Biên Tập';

  const thumbnail =
    post.thumbnailUrl ||
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80';

  if (viewMode === 'horizontal') {
    return (
      <Card className="overflow-hidden border border-slate-200/90 rounded-2xl hover:border-[#284ea1]/50 hover:shadow-lg transition-all duration-300 bg-white group">
        <Link href={`/blogs/${post.slug}`} className="flex flex-col sm:flex-row gap-4 p-4">
          <div className="relative w-full sm:w-56 md:w-64 aspect-[16/10] shrink-0 rounded-xl overflow-hidden bg-slate-100 shadow-2xs">
            <img
              src={thumbnail}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute top-2.5 left-2.5">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#284ea1] text-white shadow-sm">
                {category}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between flex-1 min-w-0">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#284ea1] transition-colors line-clamp-2 leading-snug mb-2">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
              )}
            </div>

            <div className="flex items-center flex-wrap gap-y-1 gap-x-2 text-xs text-slate-400 font-medium pt-3 mt-3 border-t border-slate-100">
              <span className="text-slate-700 font-semibold truncate max-w-[140px]">{authorName}</span>
              <span>•</span>
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
              {post.minRead && (
                <>
                  <span>•</span>
                  <span>{post.minRead} phút đọc</span>
                </>
              )}
              {typeof post.viewsCount === 'number' && (
                <span className="ml-auto text-slate-400">
                  {post.viewsCount.toLocaleString()} xem
                </span>
              )}
            </div>
          </div>
        </Link>
      </Card>
    );
  }

  // Default Grid Card
  return (
    <Card className="overflow-hidden border border-slate-200/90 rounded-2xl hover:border-[#284ea1]/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white group flex flex-col h-full shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
      <Link href={`/blogs/${post.slug}`} className="block relative aspect-[16/10] overflow-hidden bg-slate-100 rounded-t-2xl">
        <img
          src={thumbnail}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#284ea1] text-white shadow-sm">
            {category}
          </span>
        </div>
      </Link>

      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
        <div>
          <Link href={`/blogs/${post.slug}`}>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#284ea1] transition-colors line-clamp-2 leading-snug mb-2">
              {post.title}
            </h3>
          </Link>
          {post.excerpt && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
              {post.excerpt}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 pt-3 border-t border-slate-100 font-medium">
          <div className="flex items-center gap-1.5 truncate">
            <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            {post.minRead && (
              <>
                <span>•</span>
                <span>{post.minRead} phút đọc</span>
              </>
            )}
          </div>
          {typeof post.viewsCount === 'number' && (
            <span className="shrink-0 text-slate-400">
              {post.viewsCount.toLocaleString()} xem
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default BlogCard;
