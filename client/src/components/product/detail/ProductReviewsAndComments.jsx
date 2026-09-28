'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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

const REACTION_CONFIG = {
  like:  { label: 'Thích', emoji: '👍', color: 'text-blue-600', activeIcon: '👍' },
  love:  { label: 'Yêu thích', emoji: '❤️', color: 'text-rose-600', activeIcon: '❤️' },
  haha:  { label: 'Haha', emoji: '😆', color: 'text-amber-500', activeIcon: '😆' },
  wow:   { label: 'Wow', emoji: '😮', color: 'text-amber-500', activeIcon: '😮' },
  sad:   { label: 'Buồn', emoji: '😢', color: 'text-amber-500', activeIcon: '😢' },
  angry: { label: 'Phẫn nộ', emoji: '😡', color: 'text-red-600', activeIcon: '😡' },
};

export default function ProductReviewsAndComments({ productId, productName }) {
  const { user, accessToken, isAuthenticated } = useAuthStore();
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

  // Trạng thái phản hồi (Reply)
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Reaction picker hover with smooth debounce bridge
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
      setData(res);
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

  // 3. Xử lý gửi đánh giá gốc
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
    if (!content.trim()) {
      toast.warning('Vui lòng nhập nội dung đánh giá của bạn.');
      return;
    }

    try {
      setSubmitting(true);
      await commentService.createComment({
        targetType: 'product',
        productId,
        rating,
        content: content.trim(),
        token: accessToken,
      });
      setContent('');
      toast.success('Gửi đánh giá thành công! Cảm ơn bạn đã đóng góp ý kiến.');
      await loadComments(starFilter);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || '';
      if (err?.response?.status === 401 || msg.includes('hết hạn') || msg.includes('jwt')) {
        useAuthStore.getState().clearAuth();
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        toast.error(msg || 'Không thể gửi đánh giá.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Xử lý gửi reply lồng nhau (Level 1, Level 2)
  const handleSubmitReply = async (parentComment) => {
    if (!isAuthenticated()) {
      toast.warning('Vui lòng đăng nhập để phản hồi bình luận.');
      return;
    }
    if (!replyContent.trim()) {
      toast.warning('Vui lòng nhập nội dung phản hồi.');
      return;
    }

    try {
      setReplySubmitting(true);
      await commentService.createComment({
        targetType: 'product',
        productId,
        parentId: parentComment._id,
        content: replyContent.trim(),
        token: accessToken,
      });
      setReplyContent('');
      setReplyingToId(null);
      toast.success('Gửi phản hồi thành công!');
      await loadComments(starFilter);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || '';
      if (err?.response?.status === 401 || msg.includes('hết hạn') || msg.includes('jwt')) {
        useAuthStore.getState().clearAuth();
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        toast.error(msg || 'Lỗi gửi phản hồi.');
      }
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
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || '';
      if (err?.response?.status === 401 || msg.includes('hết hạn') || msg.includes('jwt')) {
        useAuthStore.getState().clearAuth();
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        toast.error(msg || 'Không thể cập nhật cảm xúc.');
      }
    }
  };

  return (
    <Card className="rounded-[6px] border border-slate-200 bg-white mb-6">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-tight">
              ĐÁNH GIÁ & BÌNH LUẬN SẢN PHẨM
            </CardTitle>
            <span className="text-xs text-slate-500">
              Nhận xét thực tế từ khách hàng đã trải nghiệm sản phẩm {productName ? `"${productName}"` : ''}
            </span>
          </div>
          {totalReviews > 0 && (
            <Badge variant="secondary" className="rounded-[6px] self-start sm:self-auto font-bold text-slate-700">
              {totalReviews} đánh giá đã xác thực
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 flex flex-col gap-6">
        {/* ==================================================================== */}
        {/* PHẦN 1: BẢNG TỔNG QUAN RATINGS OVERVIEW (CHUẨN ẢNH 1) */}
        {/* ==================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-4 rounded-[6px] bg-slate-50/70 border border-slate-200">
          {/* CỘT ĐIỂM SỐ TRUNG BÌNH */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-3 text-center border-b md:border-b-0 md:border-r border-slate-200">
            <span className="text-4xl sm:text-5xl font-black text-amber-500 tracking-tight">
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
            <span className="text-xs font-semibold text-slate-600">
              {totalReviews > 0 ? `Dựa trên ${totalReviews} đánh giá thực tế` : 'Chưa có lượt đánh giá nào'}
            </span>
          </div>

          {/* CỘT THANH TIẾN ĐỘ PHÂN BỔ 5 CẤP SAO (SHADCN PROGRESS) */}
          <div className="md:col-span-8 flex flex-col justify-center gap-2">
            {[5, 4, 3, 2, 1].map((s) => (
              <div key={s} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-medium text-slate-700 flex items-center gap-0.5 shrink-0">
                  {s} <span className="text-amber-500">★</span>
                </span>
                <Progress value={starPercentages[s] || 0} className="h-2 flex-1 bg-slate-200" />
                <span className="w-16 text-right text-slate-500 shrink-0 font-mono text-[11px]">
                  {starDistribution[s] || 0} ({starPercentages[s] || 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* BỘ LỌC ĐÁNH GIÁ THEO SAO */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700 mr-1 uppercase">Lọc theo:</span>
          <Button
            type="button"
            size="sm"
            variant={starFilter === null ? 'default' : 'outline'}
            onClick={() => setStarFilter(null)}
            className="rounded-[6px] text-xs h-7 px-3 active:scale-[0.98]"
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
              className="rounded-[6px] text-xs h-7 px-2.5 active:scale-[0.98]"
            >
              {s} ★ ({starDistribution[s] || 0})
            </Button>
          ))}
        </div>

        <Separator />

        {/* ==================================================================== */}
        {/* PHẦN 2: FORM VIẾT ĐÁNH GIÁ (LUÔN HIỂN THỊ, THAO TÁC CÓ TOAST RÕ RÀNG) */}
        {/* ==================================================================== */}
        <div className="rounded-[6px] border border-slate-200 bg-white p-4">
          <div className="border-b border-slate-100 pb-2.5 mb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              GỬI ĐÁNH GIÁ CỦA BẠN
            </h3>
            {isAuthenticated() && (
              <Badge
                variant={hasPurchased ? 'default' : 'outline'}
                className={`text-[10px] rounded-[6px] ${
                  hasPurchased
                    ? 'bg-emerald-600 text-white hover:bg-emerald-600'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                {hasPurchased ? 'ĐÃ MUA HÀNG (ĐỦ ĐIỀU KIỆN)' : 'CHƯA CÓ LỊCH SỬ ĐƠN HÀNG'}
              </Badge>
            )}
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

            {/* THANH HÀNH ĐỘNG DƯỚI FORM */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                * Nhận xét thực tế sẽ được hiển thị công khai để hỗ trợ cộng đồng mua sắm.
              </span>

              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="rounded-[6px] px-6 font-bold text-xs h-8 bg-red-600 hover:bg-red-700 cursor-pointer active:scale-[0.98] transition-all ml-auto"
              >
                {submitting ? 'ĐANG GỬI...' : 'GỬI ĐÁNH GIÁ'}
              </Button>
            </div>
          </form>
        </div>

        {/* ==================================================================== */}
        {/* PHẦN 3: FEED BÌNH LUẬN & THẢO LUẬN LỒNG NHAU 3 CẤP (CHUẨN ẢNH 2, 3) */}
        {/* ==================================================================== */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              TẤT CẢ BÌNH LUẬN & PHẢN HỒI ({data.comments?.length || 0})
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Đang tải danh sách bình luận...
            </div>
          ) : data.comments.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-[6px]">
              Chưa có bình luận nào cho sản phẩm này. Hãy là người đầu tiên để lại đánh giá!
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {data.comments.map((root) => (
                <CommentItem
                  key={root._id}
                  comment={root}
                  level={0}
                  currentUser={user}
                  replyingToId={replyingToId}
                  setReplyingToId={setReplyingToId}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  replySubmitting={replySubmitting}
                  onSubmitReply={handleSubmitReply}
                  hoveredReactionCommentId={hoveredReactionCommentId}
                  setHoveredReactionCommentId={setHoveredReactionCommentId}
                  onReactionMouseEnter={handleReactionMouseEnter}
                  onReactionMouseLeave={handleReactionMouseLeave}
                  onReaction={handleReaction}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// COMPONENT ĐỆ QUY RENDER COMMENT CÂY LỒNG NHAU TỐI ĐA 3 CẤP (DEPTH 0 -> 1 -> 2)
// -----------------------------------------------------------------------------
function CommentItem({
  comment,
  level = 0,
  currentUser,
  replyingToId,
  setReplyingToId,
  replyContent,
  setReplyContent,
  replySubmitting,
  onSubmitReply,
  hoveredReactionCommentId,
  setHoveredReactionCommentId,
  onReactionMouseEnter,
  onReactionMouseLeave,
  onReaction,
}) {
  const isReplying = replyingToId === comment._id;
  const isPurchased = comment.isPurchased;
  const isAdmin = comment.authorInfo?.role === 'admin';
  const authorName = comment.authorInfo?.name || 'Khách hàng';
  const avatarUrl = comment.authorInfo?.avatar;
  const reactions = comment.reactionCounts || {};
  const totalReactions = reactions.total || 0;

  // Lấy reaction của user hiện tại trên bình luận này
  const currentUserId = currentUser?._id || currentUser?.id;
  const myReactionType = useMemo(() => {
    if (!currentUserId || !Array.isArray(comment.reactions)) return null;
    const found = comment.reactions.find((r) => String(r.userId) === String(currentUserId));
    return found?.type || null;
  }, [comment.reactions, currentUserId]);
  const myReactionCfg = myReactionType ? REACTION_CONFIG[myReactionType] : null;

  // Top các reactions có count > 0 để hiển thị badge tổng hợp góc dưới (chuẩn Facebook/F8)
  const topReactions = useMemo(() => {
    const list = [];
    ['like', 'love', 'haha', 'wow', 'sad', 'angry'].forEach((type) => {
      if (reactions[type] > 0) {
        list.push({ type, count: reactions[type], emoji: REACTION_CONFIG[type].emoji });
      }
    });
    return list.sort((a, b) => b.count - a.count).slice(0, 3);
  }, [reactions]);

  // Lề thụt vào theo cấp (Level 0: 0, Level 1: ml-6 sm:ml-10, Level 2: ml-10 sm:ml-16)
  const indentClass =
    level === 0 ? '' : level === 1 ? 'ml-6 sm:ml-10' : 'ml-10 sm:ml-16';

  const timeAgo = formatTimeAgo(comment.createdAt);

  return (
    <div className={`flex flex-col gap-2.5 transition-all ${indentClass}`}>
      <div className="flex items-start gap-3">
        {/* AVATAR SHADCN */}
        <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border border-slate-200 shrink-0">
          <AvatarImage src={avatarUrl} alt={authorName} />
          <AvatarFallback className={isAdmin ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'}>
            {authorName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* NỘI DUNG BÌNH LUẬN */}
        <div className="flex-1 flex flex-col gap-1 min-w-0">
          <div className="p-3 rounded-[6px] bg-slate-50 border border-slate-200 relative group">
            {/* TÊN TÁC GIẢ & BADGES */}
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="font-bold text-xs text-slate-900">
                {authorName}
              </span>
              {isAdmin && (
                <Badge className="bg-red-600 hover:bg-red-600 text-[10px] h-4 px-1.5 font-bold rounded-[6px]">
                  QUẢN TRỊ VIÊN
                </Badge>
              )}
              {isPurchased && !isAdmin && (
                <Badge variant="outline" className="border-emerald-500 text-emerald-700 text-[10px] h-4 px-1.5 font-semibold rounded-[6px]">
                  ĐÃ MUA HÀNG
                </Badge>
              )}
            </div>

            {/* SỐ SAO (NẾU CÓ Ở ROOT LEVEL 0) */}
            {comment.rating > 0 && (
              <div className="flex items-center gap-1 mb-1">
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

            {/* TEXT BÌNH LUẬN */}
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>

            {/* HIỂN THỊ ICON REACTION TỔNG HỢP GÓC PHẢI DƯỚI (CHUẨN FACEBOOK/F8) */}
            {totalReactions > 0 && (
              <div
                className="absolute -bottom-2.5 right-3 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white border border-slate-200 shadow-xs text-[11px] select-none cursor-default"
                title={topReactions.map((r) => `${r.emoji} ${r.count}`).join(' · ')}
              >
                <div className="flex items-center -space-x-1">
                  {topReactions.map((r) => (
                    <span key={r.type} className="inline-block text-xs leading-none">
                      {r.emoji}
                    </span>
                  ))}
                </div>
                <span className="font-semibold text-slate-700 text-[10px] ml-0.5">
                  {totalReactions}
                </span>
              </div>
            )}
          </div>

          {/* THANH HÀNH ĐỘNG DƯỚI BÌNH LUẬN (THÍCH PHONG CÁCH FACEBOOK, PHẢN HỒI, THỜI GIAN) */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 px-1 pt-1 relative">
            {/* NÚT THẢ CẢM XÚC VỚI POPOVER FACEBOOK KHI HOVER */}
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
                  myReactionCfg ? `${myReactionCfg.color} font-bold` : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                {myReactionCfg ? (
                  <>
                    <span className="text-sm leading-none">{myReactionCfg.activeIcon}</span>
                    <span>{myReactionCfg.label}</span>
                  </>
                ) : (
                  <>
                    <span className="text-xs leading-none">👍</span>
                    <span>Thích</span>
                  </>
                )}
              </button>

              {/* FLYOUT BAR CẢM XÚC FACEBOOK KHI HOVER (CÓ PB-2.5 BRIDGE KHÔNG BỊ MẤT KHI RÊ CHUỘT) */}
              {hoveredReactionCommentId === comment._id && (
                <div
                  className="absolute bottom-full left-0 pb-2.5 z-30"
                  onMouseEnter={() => onReactionMouseEnter?.(comment._id)}
                  onMouseLeave={onReactionMouseLeave}
                >
                  <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white border border-slate-200 rounded-full shadow-md animate-fadeIn">
                    {Object.entries(REACTION_CONFIG).map(([type, cfg]) => (
                      <div key={type} className="relative group/emoji">
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-medium px-2 py-0.5 rounded-full pointer-events-none opacity-0 group-hover/emoji:opacity-100 transition-opacity whitespace-nowrap z-40">
                          {cfg.label}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onReaction(comment._id, type);
                          }}
                          className="text-xl p-1 hover:scale-130 active:scale-95 transition-transform cursor-pointer origin-bottom flex items-center justify-center leading-none"
                          title={cfg.label}
                        >
                          {cfg.emoji}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* NÚT PHẢN HỒI (CHO PHÉP TỐI ĐA LEVEL 2) */}
            {level < 2 && (
              <button
                type="button"
                onClick={() => {
                  setReplyingToId(isReplying ? null : comment._id);
                  setReplyContent('');
                }}
                className={`cursor-pointer active:scale-95 transition-colors py-0.5 ${
                  isReplying ? 'text-red-600 font-bold' : 'hover:text-red-600'
                }`}
              >
                Phản hồi
              </button>
            )}

            <span className="text-[10px] text-slate-400 font-normal">
              {timeAgo}
            </span>
          </div>

          {/* FORM SOẠN THẢO PHẢN HỒI CON (TỰA TỰA FACEBOOK & F8, GỌN GÀNG, KHÔNG EMOJI THÔ) */}
          {isReplying && (
            <div className="mt-2.5 p-3 rounded-[6px] bg-slate-50 border border-slate-200 flex flex-col gap-2.5 animate-fadeIn">
              {/* Mention tác giả & Avatar người phản hồi */}
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 border border-slate-200 shrink-0">
                  <AvatarImage src={currentUser?.avatar} alt={currentUser?.name || 'Bạn'} />
                  <AvatarFallback className="bg-slate-200 text-slate-700 text-[10px] font-bold">
                    {(currentUser?.name || 'B').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-slate-500">
                  Trả lời{' '}
                  <span className="font-semibold text-blue-600 bg-blue-50/80 border border-blue-200/60 px-1.5 py-0.5 rounded-[4px]">
                    @{authorName}
                  </span>
                </span>
              </div>

              {/* Khung nhập phản hồi */}
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Viết câu trả lời của bạn..."
                rows={2}
                className="text-xs bg-white rounded-[6px] border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                autoFocus
              />

              {/* Nút hành động chuẩn chỉ */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReplyingToId(null);
                    setReplyContent('');
                  }}
                  className="h-7 text-xs px-3 rounded-[6px] cursor-pointer active:scale-[0.98] border-slate-200 hover:bg-slate-100"
                >
                  HỦY
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={replySubmitting || !replyContent.trim()}
                  onClick={() => onSubmitReply(comment)}
                  className="h-7 text-xs px-4 rounded-[6px] bg-red-600 hover:bg-red-700 font-bold text-white cursor-pointer active:scale-[0.98] transition-all"
                >
                  {replySubmitting ? 'ĐANG GỬI...' : 'TRẢ LỜI'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RENDER ĐỆ QUY CÁC REPLIES CON (CẤP TIẾP THEO) */}
      {Array.isArray(comment.replies) && comment.replies.length > 0 && (
        <div className="flex flex-col gap-2.5 mt-1 border-l-2 border-slate-100 pl-2 sm:pl-3">
          {comment.replies.map((child) => (
            <CommentItem
              key={child._id}
              comment={child}
              level={level + 1}
              currentUser={currentUser}
              replyingToId={replyingToId}
              setReplyingToId={setReplyingToId}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              replySubmitting={replySubmitting}
              onSubmitReply={onSubmitReply}
              hoveredReactionCommentId={hoveredReactionCommentId}
              setHoveredReactionCommentId={setHoveredReactionCommentId}
              onReactionMouseEnter={onReactionMouseEnter}
              onReactionMouseLeave={onReactionMouseLeave}
              onReaction={onReaction}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Helper tính khoảng thời gian tương đối
function formatTimeAgo(dateString) {
  if (!dateString) return '';
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

