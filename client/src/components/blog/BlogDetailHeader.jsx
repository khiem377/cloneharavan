'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, MessageSquare, Share2, Check } from 'lucide-react';
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
import toast from '../ui/toast';
import useAuthStore from '@/store/authStore';
import blogService from '@/services/blog.service';

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
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const [likesCount, setLikesCount] = useState(post?.likesCount || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    if (!post) return;
    setLikesCount(post.likesCount || 0);

    const userId = user?._id || user?.id;
    if (userId && Array.isArray(post.likedUsers)) {
      setIsLiked(post.likedUsers.map(String).includes(String(userId)));
    } else if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`blog_liked_${post.slug}`);
      setIsLiked(stored === 'true');
    }
  }, [post, user]);

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
      toast.success('Đã sao chép liên kết bài viết!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleLike = async () => {
    if (liking) return;
    const previousLiked = isLiked;
    const previousCount = likesCount;

    // Optimistic UI update
    const nextLiked = !previousLiked;
    const nextCount = nextLiked ? previousCount + 1 : Math.max(0, previousCount - 1);
    setIsLiked(nextLiked);
    setLikesCount(nextCount);

    if (typeof window !== 'undefined') {
      localStorage.setItem(`blog_liked_${post.slug}`, nextLiked ? 'true' : 'false');
    }

    try {
      setLiking(true);
      const userId = user?._id || user?.id;
      let anonymousId = null;
      if (!userId && typeof window !== 'undefined') {
        anonymousId = localStorage.getItem('blog_anonymous_client_id');
        if (!anonymousId) {
          anonymousId = 'anon_' + Math.random().toString(36).substring(2, 11);
          localStorage.setItem('blog_anonymous_client_id', anonymousId);
        }
      }

      const res = await blogService.togglePostLike(post.slug, { userId, anonymousId });
      if (res && typeof res.likesCount === 'number') {
        setLikesCount(res.likesCount);
      }
      if (nextLiked) {
        toast.success('Cảm ơn bạn đã yêu thích bài viết! ❤️');
      } else {
        toast.info('Đã bỏ yêu thích bài viết.');
      }
    } catch (err) {
      // Revert optimistic state on error
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      toast.error('Không thể cập nhật lượt thích. Vui lòng thử lại sau.');
    } finally {
      setLiking(false);
    }
  };

  const scrollToComments = () => {
    const el = document.getElementById('blog-comments');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
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
            <Badge className="bg-[#284ea1] hover:bg-[#1e3b82] text-white font-semibold text-xs px-3 py-1 rounded-[6px] shadow-xs cursor-pointer">
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
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium mb-5 bg-[#edf2fa]/60 border-l-4 border-[#284ea1] p-4 rounded-r-[6px]">
          {post.excerpt}
        </p>
      )}

      {/* Author & Meta Row */}
      <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4 py-3 border-y border-slate-200 text-xs sm:text-sm text-slate-500">
        {/* Tác giả & Thông tin bài */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#edf2fa] text-[#284ea1] font-bold flex items-center justify-center shrink-0 uppercase shadow-2xs border border-[#284ea1]/20">
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

        {/* Cụm hành động: Tim bài viết, Bình luận, Chia sẻ */}
        <div className="flex items-center gap-2">
          {/* Nút Thả tim bài viết (F8 style) */}
          <button
            type="button"
            onClick={handleToggleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[6px] border transition-all cursor-pointer select-none active:scale-[0.96] ${
              isLiked
                ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
            }`}
            title={isLiked ? 'Bỏ thích bài viết' : 'Thích bài viết'}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-500 group-hover:text-rose-500'
              }`}
            />
            <span className="font-bold">{likesCount}</span>
          </button>

          {/* Nút Đi đến bình luận */}
          <button
            type="button"
            onClick={scrollToComments}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[6px] border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all cursor-pointer active:scale-[0.96]"
            title="Xem bình luận"
          >
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <span className="font-bold">{post.commentsCount || 0}</span>
          </button>

          {/* Nút Chia sẻ */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="text-xs text-slate-700 bg-white hover:bg-slate-50 border-slate-200 rounded-[6px] shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-[0.96]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">Đã sao chép</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Chia sẻ</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailHeader;

