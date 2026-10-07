'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Star,
  Trash2,
  CornerDownLeft,
  Loader2,
  AlertCircle,
  MoreHorizontal,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import useAuthStore from '@/store/authStore';
import commentService from '@/services/comment.client.service';
import { toast } from '@/components/ui/toast';
import { confirm } from '@/components/ui/confirm-dialog';
import ReactionIcon, { REACTION_SVG_MAP, ReactionFlyoutBar } from '@/components/common/ReactionIcons';

const REACTION_CONFIG = {
  like:  { label: 'Thích',     color: 'text-blue-600' },
  love:  { label: 'Yêu thích', color: 'text-rose-600' },
  haha:  { label: 'Haha',      color: 'text-amber-500' },
  wow:   { label: 'Wow',       color: 'text-amber-500' },
  sad:   { label: 'Buồn',      color: 'text-amber-500' },
  angry: { label: 'Phẫn nộ',   color: 'text-orange-600' },
};

const AVATAR_PALETTES = [
  'bg-rose-100 text-rose-600',
  'bg-orange-100 text-orange-600',
  'bg-purple-100 text-purple-600',
  'bg-sky-100 text-sky-600',
  'bg-emerald-100 text-emerald-600',
  'bg-amber-100 text-amber-700',
  'bg-indigo-100 text-indigo-600',
];

function getAvatarPalette(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

function formatTimeAgo(dateString) {
  if (!dateString) return 'Vừa xong';
  const now = new Date();
  const date = new Date(dateString);
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Vừa xong';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

export default function ProductReviewsAndComments({ productId, productName }) {
  const { user, accessToken, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [data, setData] = useState({ comments: [], stats: {}, pagination: {} });
  const [loading, setLoading] = useState(true);
  const [starFilter, setStarFilter] = useState(null);

  // Form viết đánh giá chính (Root)
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Trạng thái kiểm tra đã mua hàng
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(false);

  // Optimistic pending comments / replies list
  const [pendingItems, setPendingItems] = useState([]);

  // Trạng thái phản hồi (Reply)
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Reaction picker hover
  const [hoveredReactionCommentId, setHoveredReactionCommentId] = useState(null);
  const reactionHoverTimeoutRef = useRef(null);

  const handleReactionMouseEnter = (commentId) => {
    if (reactionHoverTimeoutRef.current) {
      clearTimeout(reactionHoverTimeoutRef.current);
      reactionHoverTimeoutRef.current = null;
    }
    setHoveredReactionCommentId(commentId);
  };

  const handleReactionMouseLeave = () => {
    if (reactionHoverTimeoutRef.current) {
      clearTimeout(reactionHoverTimeoutRef.current);
    }
    reactionHoverTimeoutRef.current = setTimeout(() => {
      setHoveredReactionCommentId(null);
    }, 280);
  };

  // 1. Tải danh sách bình luận & thống kê
  const loadComments = async (filter = starFilter) => {
    if (!productId) return;
    try {
      setLoading(true);
      const res = await commentService.getComments({
        targetType: 'product',
        productId,
        ratingFilter: filter,
      });
      setData(res || { comments: [], stats: {}, pagination: {} });
    } catch (err) {
      console.error('Lỗi tải đánh giá:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments(starFilter);
  }, [productId, starFilter]);

  // 2. Kiểm tra điều kiện mua hàng của user
  useEffect(() => {
    const verifyPurchase = async () => {
      if (!isAuthenticated() || !productId) {
        setHasPurchased(false);
        return;
      }
      try {
        setCheckingPurchase(true);
        const res = await commentService.checkPurchaseStatus({
          productId,
          token: accessToken,
        });
        setHasPurchased(Boolean(res?.hasPurchased));
      } catch {
        setHasPurchased(false);
      } finally {
        setCheckingPurchase(false);
      }
    };
    verifyPurchase();
  }, [productId, accessToken, user]);

  const stats = data.stats || {};
  const averageRating = stats.averageRating || 0;
  const totalReviews = stats.totalReviews || 0;
  const starPercentages = stats.starPercentages || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const starDistribution = stats.starDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  // 3. Gửi đánh giá gốc (Root Level 0) có Optimistic UI
  const handleSubmitReview = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!isAuthenticated()) {
      toast.warning('Vui lòng đăng nhập tài khoản để gửi đánh giá.');
      return;
    }
    if (!hasPurchased && user?.role !== 'admin') {
      toast.error('Chỉ khách hàng đã từng đặt mua thành công sản phẩm này mới có quyền gửi đánh giá.');
      return;
    }
    const text = content.trim();
    if (!text) {
      toast.warning('Vui lòng nhập nội dung đánh giá của bạn.');
      return;
    }

    const tempId = `temp-root-${Date.now()}`;
    const authorName = user?.fullName || user?.name || 'Khách hàng';
    const authorAvatar = user?.avatar?.url || user?.avatar || '';

    const optimisticNode = {
      _id: tempId,
      tempId,
      content: text,
      rating,
      isPurchased: true,
      authorInfo: {
        name: authorName,
        avatar: authorAvatar,
        role: user?.role === 'admin' ? 'admin' : 'customer',
      },
      createdAt: new Date().toISOString(),
      parentId: null,
      depth: 0,
      status: 'sending',
      replies: [],
      reactions: [],
      reactionCounts: { total: 0 },
    };

    setPendingItems((prev) => [optimisticNode, ...prev]);
    setContent('');

    try {
      setSubmitting(true);
      await commentService.createComment({
        targetType: 'product',
        productId,
        rating,
        content: text,
        token: accessToken,
      });
      setPendingItems((prev) => prev.filter((i) => i.tempId !== tempId));
      toast.success('Gửi đánh giá thành công! Cảm ơn bạn đã đóng góp ý kiến.');
      await loadComments(starFilter);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể gửi đánh giá.';
      setPendingItems((prev) =>
        prev.map((i) => (i.tempId === tempId ? { ...i, status: 'failed', errorMessage: msg } : i))
      );
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Thử lại đánh giá / bình luận hỏng
  const handleRetryItem = async (item) => {
    setPendingItems((prev) =>
      prev.map((i) => (i.tempId === item.tempId ? { ...i, status: 'sending' } : i))
    );
    try {
      await commentService.createComment({
        targetType: 'product',
        productId,
        parentId: item.parentId || null,
        rating: item.depth === 0 ? item.rating : null,
        content: item.content,
        token: accessToken,
      });
      setPendingItems((prev) => prev.filter((i) => i.tempId !== item.tempId));
      toast.success('Đã gửi lại thành công!');
      await loadComments(starFilter);
    } catch (err) {
      setPendingItems((prev) =>
        prev.map((i) => (i.tempId === item.tempId ? { ...i, status: 'failed' } : i))
      );
      toast.error('Gửi lại thất bại. Vui lòng kiểm tra lại.');
    }
  };

  const handleCancelFailed = (tempId) => {
    setPendingItems((prev) => prev.filter((i) => i.tempId !== tempId));
  };

  // 4. Gửi reply lồng nhau (Level 1, Level 2) có Optimistic UI
  const handleSubmitReply = async (parentComment) => {
    if (!isAuthenticated()) {
      toast.warning('Vui lòng đăng nhập để phản hồi bình luận.');
      return;
    }
    const text = replyContent.trim();
    if (!text) {
      toast.warning('Vui lòng nhập nội dung phản hồi.');
      return;
    }

    const tempId = `temp-reply-${Date.now()}`;
    const authorName = user?.fullName || user?.name || 'Bạn';
    const authorAvatar = user?.avatar?.url || user?.avatar || '';

    const optimisticReply = {
      _id: tempId,
      tempId,
      content: text,
      authorInfo: {
        name: authorName,
        avatar: authorAvatar,
        role: user?.role === 'admin' ? 'admin' : 'customer',
      },
      createdAt: new Date().toISOString(),
      parentId: parentComment._id,
      depth: Math.min(2, (parentComment.depth || 0) + 1),
      status: 'sending',
      replies: [],
      reactions: [],
      reactionCounts: { total: 0 },
    };

    setPendingItems((prev) => [...prev, optimisticReply]);
    setReplyContent('');
    setReplyingToId(null);

    try {
      setReplySubmitting(true);
      await commentService.createComment({
        targetType: 'product',
        productId,
        parentId: parentComment._id,
        content: text,
        token: accessToken,
      });
      setPendingItems((prev) => prev.filter((i) => i.tempId !== tempId));
      toast.success('Gửi phản hồi thành công!');
      await loadComments(starFilter);
    } catch (err) {
      setPendingItems((prev) =>
        prev.map((i) => (i.tempId === tempId ? { ...i, status: 'failed' } : i))
      );
      toast.error('Lỗi gửi phản hồi.');
    } finally {
      setReplySubmitting(false);
    }
  };

  // 5. Thả reaction cảm xúc Facebook
  const handleReaction = async (commentId, type = 'like') => {
    if (!isAuthenticated()) {
      toast.warning('Vui lòng đăng nhập để thả cảm xúc.');
      return;
    }
    try {
      await commentService.toggleReaction({ commentId, type, token: accessToken });
      setHoveredReactionCommentId(null);
      await loadComments(starFilter);
    } catch {
      toast.error('Không thể cập nhật cảm xúc.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!isAuthenticated()) return;
    const isConfirmed = await confirm({
      title: 'Xóa bình luận?',
      description: 'Bạn có chắc chắn muốn xóa bình luận này? Thao tác này không thể hoàn tác.',
      confirmText: 'Xóa bình luận',
      cancelText: 'Hủy bỏ',
      variant: 'destructive',
    });
    if (!isConfirmed) return;

    try {
      await commentService.deleteComment({ commentId, token: accessToken });
      toast.success('Đã xóa bình luận.');
      await loadComments(starFilter);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Không thể xóa bình luận.');
    }
  };

  // Merge pending root items
  const mergedComments = useMemo(() => {
    const list = [...(data.comments || [])];
    const pendingRoots = pendingItems.filter((i) => !i.parentId);
    return [...pendingRoots, ...list];
  }, [data.comments, pendingItems]);

  const totalDisplayCount = (stats.totalComments || 0) + pendingItems.length;

  return (
    <Card className="rounded-[6px] border border-slate-200 bg-white shadow-xs" id="product-reviews">
      {/* HEADER CARD */}
      <CardHeader className="border-b border-slate-100 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Đánh giá & Bình luận</span>
            <span className="font-mono text-slate-500 font-medium tabular-nums">
              {totalDisplayCount}
            </span>
          </CardTitle>

          {mounted && isAuthenticated() && (
            <Badge
              variant={hasPurchased ? 'default' : 'outline'}
              className={`text-[10px] rounded-[6px] ${
                hasPurchased
                  ? 'bg-emerald-600 text-white hover:bg-emerald-600'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              {hasPurchased ? '✓ ĐÃ MUA HÀNG' : 'CHƯA CÓ ĐƠN HÀNG'}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 flex flex-col gap-6">
        {/* ==================================================================== */}
        {/* PHẦN 1: TỔNG QUAN XẾP HẠNG & PHÂN BỔ SAO (SHADCN FLAT)                */}
        {/* ==================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50/70 p-4 sm:p-5 rounded-[6px] border border-slate-200">
          {/* CỘT ĐIỂM TRUNG BÌNH */}
          <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 pr-0 md:pr-4">
            <span className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
              {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
            </span>
            <div className="flex items-center gap-1 my-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-lg ${
                    star <= Math.round(averageRating) ? 'text-amber-400' : 'text-slate-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-xs font-medium text-slate-500">
              {totalReviews > 0 ? `Dựa trên ${totalReviews} đánh giá thực tế` : 'Chưa có lượt đánh giá nào'}
            </span>
          </div>

          {/* CỘT THANH TIẾN ĐỘ PHÂN BỔ 5 CẤP SAO */}
          <div className="md:col-span-8 flex flex-col justify-center gap-2">
            {[5, 4, 3, 2, 1].map((s) => (
              <div key={s} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-medium text-slate-700 flex items-center gap-0.5 shrink-0">
                  {s} <span className="text-amber-500">★</span>
                </span>
                <Progress value={starPercentages[s] || 0} className="h-2 flex-1 bg-slate-200" />
                <span className="w-16 text-right text-slate-500 shrink-0 font-mono text-[11px] tabular-nums">
                  {starDistribution[s] || 0} ({starPercentages[s] || 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* BỘ LỌC ĐÁNH GIÁ THEO SAO */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 mr-1">Lọc theo:</span>
          <Button
            type="button"
            size="sm"
            variant={starFilter === null ? 'default' : 'outline'}
            onClick={() => setStarFilter(null)}
            className="rounded-[6px] text-xs h-7 px-3 active:scale-[0.98] cursor-pointer"
          >
            Tất cả ({totalReviews})
          </Button>
          {[5, 4, 3, 2, 1].map((s) => (
            <Button
              key={s}
              type="button"
              size="sm"
              variant={starFilter === s ? 'default' : 'outline'}
              onClick={() => setStarFilter(starFilter === s ? null : s)}
              className="rounded-[6px] text-xs h-7 px-2.5 active:scale-[0.98] cursor-pointer"
            >
              {s} ★ ({starDistribution[s] || 0})
            </Button>
          ))}
        </div>

        <Separator className="bg-slate-100" />

        {/* ==================================================================== */}
        {/* PHẦN 2: FORM VIẾT ĐÁNH GIÁ GỐC                                       */}
        {/* ==================================================================== */}
        <div className="rounded-[6px] border border-slate-200 bg-white p-4 sm:p-5 flex flex-col gap-3">
          <div className="border-b border-slate-100 pb-2.5 mb-1 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Gửi đánh giá của bạn
            </h4>
          </div>

          <form onSubmit={handleSubmitReview} className="flex flex-col gap-3">
            {/* CHỌN SỐ SAO */}
            <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50/70 p-2.5 rounded-[6px] border border-slate-200">
              <span className="font-semibold text-slate-700">Chất lượng sản phẩm:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-xl transition-transform cursor-pointer active:scale-[0.98] ${
                      star <= rating ? 'text-amber-400' : 'text-slate-300 hover:text-amber-300'
                    }`}
                    title={`${star} sao`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-amber-600 ml-1">
                {rating === 5 && 'Tuyệt vời'}
                {rating === 4 && 'Hài lòng'}
                {rating === 3 && 'Bình thường'}
                {rating === 2 && 'Không hài lòng'}
                {rating === 1 && 'Rất tệ'}
              </span>
            </div>

            {/* KHUNG NHẬP NỘI DUNG */}
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ cảm nhận chân thực về chất lượng sản phẩm, dịch vụ giao hàng..."
              rows={3}
              className="text-xs sm:text-sm rounded-[6px] border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 bg-white"
            />

            <div className="flex items-center justify-between min-h-[32px]">
              <span className="text-[11px] text-slate-400" suppressHydrationWarning>
                {mounted ? (
                  !isAuthenticated()
                    ? 'Vui lòng đăng nhập để gửi đánh giá.'
                    : !hasPurchased && user?.role !== 'admin'
                    ? 'Chỉ khách hàng đã mua sản phẩm mới có quyền đánh giá.'
                    : 'Đánh giá của bạn sẽ được hiển thị công khai.'
                ) : (
                  'Đánh giá của bạn sẽ được hiển thị công khai.'
                )}
              </span>

              <Button
                type="submit"
                variant="default"
                disabled={!mounted || submitting || !content.trim() || (!hasPurchased && user?.role !== 'admin')}
                className="rounded-[6px] px-5 h-8 text-xs font-bold cursor-pointer"
              >
                {submitting ? 'ĐANG GỬI...' : 'GỬI ĐÁNH GIÁ'}
              </Button>
            </div>
          </form>
        </div>

        <Separator className="bg-slate-100" />

        {/* ==================================================================== */}
        {/* PHẦN 3: DANH SÁCH BÌNH LUẬN & ĐÁNH GIÁ LỒNG NHAU (3 CẤP SCREENSHOT 4) */}
        {/* ==================================================================== */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Tất cả nhận xét & thảo luận
            </span>
          </div>

          {loading && mergedComments.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin text-slate-400" />
              <span>Đang tải danh sách bình luận...</span>
            </div>
          ) : mergedComments.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-[6px] bg-slate-50/50">
              Chưa có bình luận nào cho sản phẩm này. Hãy là người đầu tiên để lại đánh giá!
            </div>
          ) : (
            <div className="flex flex-col gap-5 divide-y divide-slate-100">
              {mergedComments.map((root) => (
                <div key={root._id || root.tempId} className="pt-5 first:pt-0">
                  <ProductCommentNode
                    comment={root}
                    depth={0}
                    currentUser={user}
                    replyingToId={replyingToId}
                    setReplyingToId={setReplyingToId}
                    replyContent={replyContent}
                    setReplyContent={setReplyContent}
                    replySubmitting={replySubmitting}
                    onSubmitReply={handleSubmitReply}
                    onReaction={handleReaction}
                    onDelete={handleDeleteComment}
                    onRetry={handleRetryItem}
                    onCancelFailed={handleCancelFailed}
                    pendingReplies={pendingItems.filter((i) => String(i.parentId) === String(root._id))}
                    hoveredReactionCommentId={hoveredReactionCommentId}
                    onReactionMouseEnter={handleReactionMouseEnter}
                    onReactionMouseLeave={handleReactionMouseLeave}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// COMPONENT RENDER TỪNG NODE ĐÁNH GIÁ SẢN PHẨM (CHUẨN 3 TẦNG SCREENSHOT 4)
// -----------------------------------------------------------------------------
function ProductCommentNode({
  comment,
  depth = 0,
  currentUser,
  replyingToId,
  setReplyingToId,
  replyContent,
  setReplyContent,
  replySubmitting,
  onSubmitReply,
  onReaction,
  onDelete,
  onRetry,
  onCancelFailed,
  pendingReplies = [],
  hoveredReactionCommentId,
  onReactionMouseEnter,
  onReactionMouseLeave,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isReplying = replyingToId === comment._id;
  const isDeleted = Boolean(comment.isDeleted);
  const isSending = comment.status === 'sending';
  const isFailed = comment.status === 'failed';

  const authorName = isDeleted ? 'Bình luận đã bị xoá' : comment.authorInfo?.name || 'Khách hàng';
  const authorAvatar = comment.authorInfo?.avatar;
  const isAdmin = comment.authorInfo?.role === 'admin';
  const isPurchased = Boolean(comment.isPurchased);
  const timeAgo = formatTimeAgo(comment.createdAt);

  const currentUserId = currentUser?._id || currentUser?.id;
  const isAuthor = !isDeleted && currentUserId && String(comment.authorId) === String(currentUserId);
  const canDelete = isAuthor || (currentUser?.role === 'admin');

  const reactions = comment.reactionCounts || {};
  const totalReactions = reactions.total || 0;

  const myReactionType = useMemo(() => {
    if (!currentUserId || !Array.isArray(comment.reactions)) return null;
    const found = comment.reactions.find((r) => String(r.userId) === String(currentUserId));
    return found?.type || null;
  }, [comment.reactions, currentUserId]);
  const myReactionCfg = myReactionType ? REACTION_CONFIG[myReactionType] : null;

  const topReactions = useMemo(() => {
    const list = [];
    ['like', 'love', 'haha', 'wow', 'sad', 'angry'].forEach((type) => {
      if (reactions[type] > 0) {
        list.push({ type, count: reactions[type] });
      }
    });
    return list.sort((a, b) => b.count - a.count).slice(0, 3);
  }, [reactions]);

  const initialLetter = authorName.charAt(0).toUpperCase() || 'U';
  const avatarPalette = getAvatarPalette(authorName);

  // Indentation for 3-level tree
  const indentClass = depth === 0 ? '' : depth === 1 ? 'ml-6 sm:ml-8 border-l-2 border-slate-200 pl-4 mt-3.5' : 'ml-6 sm:ml-8 border-l-2 border-slate-200 pl-4 mt-3.5';

  return (
    <div className={`flex flex-col gap-2.5 transition-all ${indentClass}`}>
      {/* TRƯỜNG HỢP 1: BÌNH LUẬN ĐÃ BỊ XOÁ (GIỮ CHỖ CHO REPLIES DƯỚI) - SCREENSHOT 4 */}
      {isDeleted ? (
        <div className="flex items-center gap-2 py-1 text-slate-400 text-xs sm:text-sm italic">
          <Trash2 size={15} className="shrink-0 text-slate-400" />
          <span>Bình luận đã bị xoá</span>
          <span className="text-[11px] text-slate-400 not-italic ml-1" suppressHydrationWarning>{timeAgo}</span>
        </div>
      ) : (
        /* TRƯỜNG HỢP 2: BÌNH LUẬN HOẠT ĐỘNG */
        <div className={`flex items-start gap-3 ${isSending ? 'opacity-70' : ''}`}>
          {/* Avatar pastel với initial hoặc ảnh */}
          <div className="shrink-0">
            {authorAvatar ? (
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border border-slate-200">
                <AvatarImage src={authorAvatar} alt={authorName} />
                <AvatarFallback className={`${avatarPalette} font-bold text-xs`}>
                  {initialLetter}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div
                className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm select-none ${avatarPalette}`}
              >
                {initialLetter}
              </div>
            )}
          </div>

          {/* Khối nội dung comment */}
          <div className="flex-1 flex flex-col gap-1 min-w-0">
            {/* Header: Tên người + sao + badges + relative time */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-bold text-xs sm:text-sm text-slate-900">
                  {authorName}
                </span>

                {isAdmin && (
                  <Badge className="bg-slate-900 text-white text-[10px] h-4 px-1.5 font-bold rounded-[6px]">
                    Quản trị viên
                  </Badge>
                )}

                {isPurchased && !isAdmin && (
                  <Badge variant="outline" className="border-emerald-500 text-emerald-700 text-[10px] h-4 px-1.5 font-semibold rounded-[6px] bg-emerald-50/60">
                    Đã mua hàng
                  </Badge>
                )}

                <span className="text-[11px] text-slate-400 font-normal" suppressHydrationWarning>
                  {timeAgo}
                </span>

                {isSending && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-[4px]">
                    <Loader2 size={11} className="animate-spin" /> Đang gửi...
                  </span>
                )}

                {isFailed && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-[4px] font-medium">
                    <AlertCircle size={11} /> Gửi thất bại
                  </span>
                )}
              </div>

              {/* Three dots menu */}
              {!isSending && !isFailed && canDelete && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-[4px] hover:bg-slate-100 cursor-pointer"
                    title="Tuỳ chọn"
                  >
                    <MoreHorizontal size={14} />
                  </button>

                  {menuOpen && (
                    <div
                      className="absolute right-0 top-full mt-1 w-32 bg-white rounded-[6px] border border-slate-200 shadow-sm py-1 z-30 animate-in fade-in"
                      onMouseLeave={() => setMenuOpen(false)}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onDelete(comment._id);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 cursor-pointer font-medium"
                      >
                        <Trash2 size={12} /> Xoá bình luận
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Số sao đánh giá (nếu là comment gốc depth === 0) */}
            {comment.rating > 0 && depth === 0 && (
              <div className="flex items-center gap-0.5 my-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-xs ${
                      star <= comment.rating ? 'text-amber-400' : 'text-slate-200'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            )}

            {/* Nội dung text */}
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap mt-0.5">
              {comment.content}
            </p>

            {/* Khối xử lý gửi hỏng (Screenshot 4) */}
            {isFailed && (
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => onRetry(comment)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                >
                  <RotateCcw size={12} /> Thử lại
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => onCancelFailed(comment.tempId)}
                  className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Huỷ bỏ
                </button>
              </div>
            )}

            {/* Hàng hành động dưới comment: Thích Facebook + Trả lời (Screenshot 4) */}
            {!isSending && !isFailed && (
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-1 relative">
                {/* NÚT THẢ CẢM XÚC FACEBOOK KHI HOVER */}
                <div
                  className="relative inline-block"
                  onMouseEnter={() => onReactionMouseEnter?.(comment._id)}
                  onMouseLeave={onReactionMouseLeave}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (myReactionType) {
                        onReaction(comment._id, myReactionType);
                      } else {
                        onReaction(comment._id, 'like');
                      }
                    }}
                    className={`cursor-pointer active:scale-95 transition-colors flex items-center gap-1.5 py-0.5 ${
                      myReactionCfg ? `${myReactionCfg.color} font-bold` : 'text-slate-500 hover:text-blue-600'
                    }`}
                  >
                    {myReactionCfg ? (
                      <>
                        <ReactionIcon type={myReactionType} size={15} />
                        <span>{myReactionCfg.label}</span>
                      </>
                    ) : (
                      <>
                        <ReactionIcon type="like" size={15} />
                        <span>Thích</span>
                      </>
                    )}
                  </button>

                  {/* FLYOUT BAR ANIMATED */}
                  {hoveredReactionCommentId === comment._id && (
                    <div
                      className="absolute bottom-full left-0 pb-2 z-30"
                      onMouseEnter={() => onReactionMouseEnter?.(comment._id)}
                      onMouseLeave={onReactionMouseLeave}
                    >
                      <ReactionFlyoutBar
                        onSelect={(type) => {
                          onReaction(comment._id, type);
                          onReactionMouseLeave?.();
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* NÚT TRẢ LỜI (↩ Trả lời - chuẩn Screenshot 4) */}
                {depth < 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingToId(isReplying ? null : comment._id);
                      setReplyContent('');
                    }}
                    className={`inline-flex items-center gap-1 cursor-pointer active:scale-95 transition-colors py-0.5 ${
                      isReplying ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <CornerDownLeft size={13} />
                    <span>Trả lời</span>
                  </button>
                )}

                {/* Badge reaction counter */}
                {totalReactions > 0 && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    <span className="flex items-center -space-x-1">
                      {topReactions.map((r) => (
                        <ReactionIcon key={r.type} type={r.type} size={14} className="border border-white rounded-full" />
                      ))}
                    </span>
                    <span className="font-mono text-[10px] font-bold ml-0.5">{totalReactions}</span>
                  </div>
                )}
              </div>
            )}

            {/* FORM SOẠN PHẢN HỒI LỒNG */}
            {isReplying && (
              <div className="mt-3 p-3 rounded-[6px] border border-slate-200 bg-slate-50 flex flex-col gap-2.5 animate-in fade-in">
                <div className="text-xs text-slate-500">
                  Trả lời <span className="font-semibold text-slate-800">@{authorName}</span>
                </div>
                <Textarea
                  autoFocus
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Viết câu trả lời của bạn..."
                  rows={2}
                  className="text-xs bg-white rounded-[6px] border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                />
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setReplyingToId(null);
                      setReplyContent('');
                    }}
                    className="h-7 text-xs px-3 rounded-[6px] cursor-pointer"
                  >
                    HỦY
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    disabled={replySubmitting || !replyContent.trim()}
                    onClick={() => onSubmitReply(comment)}
                    className="h-7 text-xs px-4 rounded-[6px] cursor-pointer"
                  >
                    {replySubmitting ? 'ĐANG GỬI...' : 'TRẢ LỜI'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RENDER ĐỆ QUY CÁC CÂU TRẢ LỜI CON (3 CẤP TỐI ĐA) */}
      {((Array.isArray(comment.replies) && comment.replies.length > 0) || pendingReplies.length > 0) && (
        <div className="flex flex-col gap-2">
          {pendingReplies.map((pr) => (
            <ProductCommentNode
              key={pr.tempId}
              comment={pr}
              depth={depth + 1}
              currentUser={currentUser}
              replyingToId={replyingToId}
              setReplyingToId={setReplyingToId}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              replySubmitting={replySubmitting}
              onSubmitReply={onSubmitReply}
              onReaction={onReaction}
              onDelete={onDelete}
              onRetry={onRetry}
              onCancelFailed={onCancelFailed}
              hoveredReactionCommentId={hoveredReactionCommentId}
              onReactionMouseEnter={onReactionMouseEnter}
              onReactionMouseLeave={onReactionMouseLeave}
            />
          ))}

          {(comment.replies || []).map((child) => (
            <ProductCommentNode
              key={child._id}
              comment={child}
              depth={depth + 1}
              currentUser={currentUser}
              replyingToId={replyingToId}
              setReplyingToId={setReplyingToId}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              replySubmitting={replySubmitting}
              onSubmitReply={onSubmitReply}
              onReaction={onReaction}
              onDelete={onDelete}
              onRetry={onRetry}
              onCancelFailed={onCancelFailed}
              hoveredReactionCommentId={hoveredReactionCommentId}
              onReactionMouseEnter={onReactionMouseEnter}
              onReactionMouseLeave={onReactionMouseLeave}
            />
          ))}
        </div>
      )}
    </div>
  );
}
