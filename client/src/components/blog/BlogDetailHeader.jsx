'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const BlogDetailHeader = ({ post }) => {
  const [copied, setCopied] = useState(false);

  if (!post) return null;

  const category = post.categories?.[0];
  const authorName =
    post.authorId?.firstName && post.authorId?.lastName
      ? `${post.authorId.lastName} ${post.authorId.firstName}`
      : post.authorId?.email?.split('@')[0] || 'Ban Biên Tập';

  const authorInitial = authorName.charAt(0).toUpperCase();

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full mb-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/blogs">Tin tức</BreadcrumbLink>
          </BreadcrumbItem>
          {category && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/blogs?category=${category.slug}`}>
                  {category.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="line-clamp-1 max-w-[200px] sm:max-w-md">
              {post.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Category Pill */}
      {category && (
        <div className="mb-3">
          <Link href={`/blogs?category=${category.slug}`}>
            <Badge className="bg-[#284ea1] hover:bg-[#1e3b82] text-white font-semibold text-xs px-3 py-1 shadow-xs cursor-pointer">
              {category.name}
            </Badge>
          </Link>
        </div>
      )}

      {/* H1 Title */}
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight mb-4">
        {post.title}
      </h1>

      {/* Excerpt / Lead */}
      {post.excerpt && (
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium mb-5 bg-[#edf2fa]/60 border-l-4 border-[#284ea1] p-4 rounded-r-xl">
          {post.excerpt}
        </p>
      )}

      {/* Author & Meta Row */}
      <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4 py-3 border-y border-gray-200 text-xs sm:text-sm text-slate-500">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#edf2fa] text-[#284ea1] font-bold flex items-center justify-center shrink-0 uppercase shadow-2xs border border-[#284ea1]/20">
            {post.authorId?.avatar ? (
              <img
                src={post.authorId.avatar}
                alt={authorName}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span>{authorInitial}</span>
            )}
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-xs sm:text-sm">
              {authorName}
            </div>
            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-400">
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
              {post.minRead && (
                <span>• {post.minRead} phút đọc</span>
              )}
              {typeof post.viewsCount === 'number' && (
                <span>• {post.viewsCount.toLocaleString()} lượt xem</span>
              )}
            </div>
          </div>
        </div>

        {/* Share Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="text-xs text-slate-700 bg-white hover:bg-slate-50 border-gray-300 shadow-2xs"
        >
          {copied ? (
            <span className="text-emerald-600 font-semibold">Đã sao chép link</span>
          ) : (
            <span>Chia sẻ</span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BlogDetailHeader;
