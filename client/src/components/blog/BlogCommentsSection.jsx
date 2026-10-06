'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Trash2,
  CornerDownLeft,
  Loader2,
  AlertCircle,
  MoreHorizontal,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import toast from '@/components/ui/toast';
import useAuthStore from '@/store/authStore';
import commentService from '@/services/comment.client.service';
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

export default function BlogCommentsSection({ postId, postTitle }) {
  const { user, accessToken, isAuthenticated } = useAuthStore();
  const [data, setData] = useState({ comments: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Optimistic pending comments / replies list
  const [pendingItems, setPendingItems] = useState([]);

  // Replying state
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Reaction hover popup
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

  const loadComments = async () => {
    if (!postId) return;
    try {
      setLoading(true);
      const res = await commentService.getComments({
        targetType: 'blog',
        postId,
      });
      setData(res || { comments: [], stats: {} });
    } catch (err) {
      console.error('Lỗi tải bình luận bài viết:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
    return () => {
      if (reactionHoverTimeoutRef.current) {
        clearTimeout(reactionHoverTimeoutRef.current);
      }
    };
  }, [postId]);

  // Gửi bình luận gốc (Cấp 0) có Optimistic UI
  const handleSubmitComment = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!isAuthenticated()) {
      toast.warning('Vui lòng đăng nhập tài khoản để gửi bình luận.');
      return;
    }
    const text = content.trim();
    if (!text) {
      toast.warning('Vui lòng nhập nội dung bình luận.');
      return;
    }

    const tempId = `temp-root-${Date.now()}`;
    const authorName = user?.fullName || user?.name || 'Bạn';
    const authorAvatar = user?.avatar?.url || user?.avatar || '';
    const optimisticNode = {
      _id: tempId,
      tempId,
      content: text,
      authorInfo: {
        name: authorName,
        avatar: authorAvatar,
        role: user?.role === 'admin' ? 'admin' : 'customer',
      },
      createdAt: new Date().toISOString(),
      parentId: null,
      depth: 0,
      status: 'sending', // 'sending' | 'failed'
      replies: [],
      reactions: [],
      reactionCounts: { total: 0 },
    };

    setPendingItems((prev) => [optimisticNode, ...prev]);
    setContent('');

    try {
      setSubmitting(true);
      await commentService.createComment({
        targetType: 'blog',
        postId,
        content: text,
        token: accessToken,
      });
      // Remove temp item and reload real data
      setPendingItems((prev) => prev.filter((item) => item.tempId !== tempId));
      toast.success('Bình luận của bạn đã được đăng thành công!');
      await loadComments();
    } catch (err) {
      // Mark as failed
      setPendingItems((prev) =>
        prev.map((item) =>
          item.tempId === tempId ? { ...item, status: 'failed', errorMessage: err?.message || 'Gửi thất bại' } : item
        )
      );
      toast.error('Gửi bình luận thất bại. Vui lòng bấm thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Thử lại bình luận gốc bị hỏng
  const handleRetryComment = async (item) => {
    setPendingItems((prev) =>
      prev.map((i) => (i.tempId === item.tempId ? { ...i, status: 'sending' } : i))
    );
    try {
      await commentService.createComment({
        targetType: 'blog',
        postId,
        parentId: item.parentId || null,
        content: item.content,
        token: accessToken,
      });
      setPendingItems((prev) => prev.filter((i) => i.tempId !== item.tempId));
      toast.success('Đã gửi lại bình luận thành công!');
      await loadComments();
    } catch (err) {
      setPendingItems((prev) =>
        prev.map((i) =>
          i.tempId === item.tempId ? { ...i, status: 'failed', errorMessage: err?.message || 'Gửi thất bại' } : i
        )
      );
      toast.error('Gửi lại thất bại. Vui lòng kiểm tra kết nối.');
    }
  };

  // Hủy bình luận bị hỏng
  const handleCancelFailed = (tempId) => {
    setPendingItems((prev) => prev.filter((i) => i.tempId !== tempId));
  };

  // Gửi phản hồi (Reply - Cấp 1 & Cấp 2) có Optimistic UI
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
        targetType: 'blog',
        postId,
        parentId: parentComment._id,
        content: text,
        token: accessToken,
      });
      setPendingItems((prev) => prev.filter((item) => item.tempId !== tempId));
      toast.success('Gửi phản hồi thành công!');
      await loadComments();
    } catch (err) {
      setPendingItems((prev) =>
        prev.map((item) =>
          item.tempId === tempId ? { ...item, status: 'failed', errorMessage: err?.message || 'Gửi thất bại' } : item
        )
      );
      toast.error('Gửi phản hồi thất bại.');
    } finally {
      setReplySubmitting(false);
    }
  };

  // Thả / gỡ cảm xúc Facebook
  const handleReaction = async (commentId, type = 'like') => {
    if (!isAuthenticated()) {
      toast.warning('Vui lòng đăng nhập để thả cảm xúc.');
      return;
    }
    try {
      await commentService.toggleReaction({ commentId, type, token: accessToken });
      setHoveredReactionCommentId(null);
      await loadComments();
    } catch {
      toast.error('Không thể cập nhật cảm xúc.');
    }
  };

  // Xóa bình luận (hỗ trợ tác giả hoặc Admin)
  const handleDeleteComment = async (commentId) => {
    if (!isAuthenticated()) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;

    try {
      await commentService.deleteComment({ commentId, token: accessToken });
      toast.success('Đã xóa bình luận.');
      await loadComments();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Không thể xóa bình luận.');
    }
  };

  // Gộp bình luận thật và pending items theo cây
  const mergedComments = useMemo(() => {
    const list = [...(data.comments || [])];
    const pendingRoots = pendingItems.filter((i) => !i.parentId);
    return [...pendingRoots, ...list];
  }, [data.comments, pendingItems]);

  const totalCommentCount = (data.stats?.totalComments || 0) + pendingItems.length;

  return (
    <div className="mt-8 rounded-[6px] border border-slate-200 bg-white p-5 sm:p-7 shadow-xs" id="blog-comments">
      {/* Header Evondev Style: Đơn giản, phẳng, rõ số lượng (Screenshot 4) */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Bình luận</span>
          <span className="font-mono text-slate-500 font-medium tabular-nums">
            {totalCommentCount}
          </span>
        </h3>
      </div>

      {/* FORM NHẬP BÌNH LUẬN GỐC (PHẲNG, GỌN GÀNG, BO GÓC 6PX) */}
      <div className="mb-8 rounded-[6px] border border-slate-200 bg-slate-50/70 p-4 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 border border-slate-200">
            <AvatarImage src={user?.avatar} alt={user?.name || 'Bạn'} />
            <AvatarFallback className="bg-slate-900 text-white text-xs font-bold">
              {(user?.name || user?.fullName || 'B').slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 flex flex-col gap-2.5">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ ý kiến hoặc thắc mắc của bạn về bài viết..."
              rows={3}
              className="bg-white text-xs sm:text-sm rounded-[6px] border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 resize-y"
            />

            <div className="flex items-center justify-end">
              <Button
                type="button"
                variant="default"
                disabled={submitting || !content.trim()}
                onClick={handleSubmitComment}
                className="h-8 rounded-[6px] px-5 text-xs font-bold cursor-pointer"
              >
                {submitting ? 'ĐANG GỬI...' : 'BÌNH LUẬN'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* DANH SÁCH BÌNH LUẬN LỒNG NHAU (3 CẤP CHUẨN SCREENSHOT 4) */}
      {loading && mergedComments.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="size-4 animate-spin text-slate-400" />
          <span>Đang tải bình luận...</span>
        </div>
      ) : mergedComments.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-[6px] bg-slate-50/50">
          Chưa có bình luận nào cho bài viết này. Hãy là người đầu tiên để lại ý kiến!
        </div>
      ) : (
        <div className="flex flex-col gap-5 divide-y divide-slate-100">
          {mergedComments.map((root) => (
            <div key={root._id || root.tempId} className="pt-5 first:pt-0">
              <CommentNode
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
                onRetry={handleRetryComment}
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
  );
}

// -----------------------------------------------------------------------------
// COMPONENT RENDER TỪNG NODE BÌNH LUẬN (ĐỦ TRẠNG THÁI: XOÁ, ĐANG GỬI, HỎNG, 3 TẦNG)
// -----------------------------------------------------------------------------
function CommentNode({
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

  const authorName = isDeleted ? 'Bình luận đã bị xoá' : comment.authorInfo?.name || 'Độc giả';
  const authorAvatar = comment.authorInfo?.avatar;
  const isAdmin = comment.authorInfo?.role === 'admin';
  const timeAgo = formatTimeAgo(comment.createdAt);

  const currentUserId = currentUser?._id || currentUser?.id;
  const isAuthor = !isDeleted && currentUserId && String(comment.authorId) === String(currentUserId);
  const canDelete = isAuthor || (currentUser?.role === 'admin');

  const reactions = comment.reactionCounts || {};
  const totalReactions = reactions.total || 0;

  // Lấy reaction của user hiện tại
  const myReactionType = useMemo(() => {
    if (!currentUserId || !Array.isArray(comment.reactions)) return null;
    const found = comment.reactions.find((r) => String(r.userId) === String(currentUserId));
    return found?.type || null;
  }, [comment.reactions, currentUserId]);
  const myReactionCfg = myReactionType ? REACTION_CONFIG[myReactionType] : null;

  // Top reaction types
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

  // Cấp lồng: Tầng 1 thụt vào + đường kẻ trái, Tầng 2 thụt tiếp
  const indentClass = depth === 0 ? '' : depth === 1 ? 'ml-6 sm:ml-8 border-l-2 border-slate-200 pl-4 mt-3.5' : 'ml-6 sm:ml-8 border-l-2 border-slate-200 pl-4 mt-3.5';

  return (
    <div className={`flex flex-col gap-2.5 transition-all ${indentClass}`}>
      {/* TRƯỜNG HỢP 1: BÌNH LUẬN ĐÃ BỊ XOÁ (GIỮ CHỖ CHO CÂU TRẢ LỜI CON BÊN DƯỚI) - SCREENSHOT 4 */}
      {isDeleted ? (
        <div className="flex items-center gap-2 py-1 text-slate-400 text-xs sm:text-sm italic">
          <Trash2 size={15} className="shrink-0 text-slate-400" />
          <span>Bình luận đã bị xoá</span>
          <span className="text-[11px] text-slate-400 not-italic ml-1">{timeAgo}</span>
        </div>
      ) : (
        /* TRƯỜNG HỢP 2: BÌNH LUẬN BÌNH THƯỜNG / ĐANG GỬI / GỬI HỎNG */
        <div className={`flex items-start gap-3 ${isSending ? 'opacity-70' : ''}`}>
          {/* Avatar initial tròn pastel hoặc ảnh */}
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
            {/* Header: Tên người + thời gian + role badge + three dots menu */}
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
                <span className="text-[11px] text-slate-400 font-normal">
                  {timeAgo}
                </span>

                {/* Trạng thái đang gửi (Screenshot 4) */}
                {isSending && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-[4px]">
                    <Loader2 size={11} className="animate-spin" /> Đang gửi...
                  </span>
                )}

                {/* Trạng thái gửi hỏng (Screenshot 4) */}
                {isFailed && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-[4px] font-medium">
                    <AlertCircle size={11} /> Gửi thất bại
                  </span>
                )}
              </div>

              {/* Three dots menu dropdown */}
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

            {/* Nội dung bài bình luận */}
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap mt-0.5">
              {comment.content}
            </p>

            {/* Khối xử lý gửi thất bại: Thử lại hoặc huỷ (Screenshot 4) */}
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

            {/* Hàng hành động dưới comment: Phản hồi (↩ Trả lời) + Cảm xúc Facebook (Screenshot 4) */}
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
          {/* Pending optimistic replies */}
          {pendingReplies.map((pr) => (
            <CommentNode
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

          {/* Real child replies */}
          {(comment.replies || []).map((child) => (
            <CommentNode
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
