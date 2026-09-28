'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import toast from '@/components/ui/toast';
import useAuthStore from '@/store/authStore';
import commentService from '@/services/comment.client.service';

const REACTION_CONFIG = {
  like:  { label: 'Thích',    emoji: '👍', color: 'text-blue-600',   activeIcon: '👍' },
  love:  { label: 'Yêu thích', emoji: '❤️', color: 'text-rose-600',   activeIcon: '❤️' },
  haha:  { label: 'Haha',     emoji: '😆', color: 'text-amber-500',  activeIcon: '😆' },
  wow:   { label: 'Wow',      emoji: '😮', color: 'text-amber-500',  activeIcon: '😮' },
  sad:   { label: 'Buồn',     emoji: '😢', color: 'text-amber-500',  activeIcon: '😢' },
  angry: { label: 'Phẫn nộ',  emoji: '😡', color: 'text-orange-600', activeIcon: '😡' },
};

export default function BlogCommentsSection({ postId, postTitle }) {
  const { user, accessToken, isAuthenticated } = useAuthStore();
  const [data, setData] = useState({ comments: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // State điều khiển luồng phản hồi lồng nhau
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Hover reaction popup với debounce timeout chống tắt đột ngột
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

  // Gửi bình luận bài viết (Cấp 0)
  const handleSubmitComment = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!isAuthenticated()) {
      toast.warning('Vui lòng đăng nhập tài khoản để gửi bình luận.');
      return;
    }
    if (!content.trim()) {
      toast.warning('Vui lòng nhập nội dung bình luận.');
      return;
    }

    try {
      setSubmitting(true);
      await commentService.createComment({
        targetType: 'blog',
        postId,
        content: content.trim(),
        token: accessToken,
      });
      setContent('');
      toast.success('Bình luận của bạn đã được đăng thành công!');
      await loadComments();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || '';
      if (err?.response?.status === 401 || msg.includes('hết hạn') || msg.includes('jwt')) {
        useAuthStore.getState().clearAuth();
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        toast.error(msg || 'Lỗi gửi bình luận.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Gửi phản hồi bình luận con (Cấp 1 & Cấp 2)
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
        targetType: 'blog',
        postId,
        parentId: parentComment._id,
        content: replyContent.trim(),
        token: accessToken,
      });
      setReplyContent('');
      setReplyingToId(null);
      toast.success('Gửi phản hồi thành công!');
      await loadComments();
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

  // Thả / gỡ reaction cảm xúc cho bình luận
  const handleReaction = async (commentId, type = 'like') => {
    if (!isAuthenticated()) {
      toast.warning('Vui lòng đăng nhập để thả cảm xúc.');
      return;
    }
    try {
      await commentService.toggleReaction({ commentId, type, token: accessToken });
      setHoveredReactionCommentId(null);
      await loadComments();
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
    <Card className="rounded-[6px] border border-slate-200 bg-white mt-8" id="blog-comments">
      <CardHeader className="border-b border-slate-100 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-slate-900 uppercase tracking-tight">
            BÌNH LUẬN & THẢO LUẬN BÀI VIẾT
          </CardTitle>
          <Badge variant="secondary" className="font-bold text-slate-700 rounded-[6px]">
            {data.stats?.totalComments || 0} bình luận
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 flex flex-col gap-6">
        {/* FORM GỬI BÌNH LUẬN BLOG (GỌN GÀNG, KHÔNG EMOJI THÔ TRONG KHUNG NHẬP) */}
        <div className="rounded-[6px] border border-slate-200 bg-slate-50/70 p-3.5 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border border-slate-200 shrink-0">
              <AvatarImage src={user?.avatar} alt={user?.name || 'Bạn'} />
              <AvatarFallback className="bg-slate-200 text-slate-700 text-xs font-bold">
                {(user?.name || 'B').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 flex flex-col gap-2.5">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  isAuthenticated()
                    ? 'Chia sẻ quan điểm hoặc đặt câu hỏi về bài viết...'
                    : 'Đăng nhập để tham gia thảo luận bài viết này...'
                }
                rows={3}
                className="bg-white text-xs sm:text-sm rounded-[6px] border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
              />

              <div className="flex items-center justify-end">
                <Button
                  type="button"
                  size="sm"
                  disabled={submitting || !content.trim()}
                  onClick={handleSubmitComment}
                  className="rounded-[6px] px-5 font-bold text-xs h-8 bg-red-600 hover:bg-red-700 text-white cursor-pointer active:scale-[0.98] transition-all"
                >
                  {submitting ? 'ĐANG GỬI...' : 'BÌNH LUẬN'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* FEED BÌNH LUẬN LỒNG NHAU */}
        {loading ? (
          <div className="py-6 text-center text-xs text-slate-500">Đang tải bình luận...</div>
        ) : (data.comments || []).length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-[6px] bg-slate-50/50">
            Chưa có bình luận nào cho bài viết này. Hãy là người đầu tiên để lại ý kiến!
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {data.comments.map((root) => (
              <BlogCommentNode
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
                onReactionMouseEnter={handleReactionMouseEnter}
                onReactionMouseLeave={handleReactionMouseLeave}
                onReaction={handleReaction}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// COMPONENT RENDER BÌNH LUẬN BÀI VIẾT (HỖ TRỢ 3 CẤP ĐỆ QUY VÀ CẢM XÚC FACEBOOK)
// -----------------------------------------------------------------------------
function BlogCommentNode({
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
  onReactionMouseEnter,
  onReactionMouseLeave,
  onReaction,
}) {
  const isReplying = replyingToId === comment._id;
  const isAdmin = comment.authorInfo?.role === 'admin';
  const authorName = comment.authorInfo?.name || 'Độc giả';
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

  // Top reaction badges
  const topReactions = useMemo(() => {
    const list = [];
    ['like', 'love', 'haha', 'wow', 'sad', 'angry'].forEach((type) => {
      if (reactions[type] > 0) {
        list.push({ type, count: reactions[type], emoji: REACTION_CONFIG[type].emoji });
      }
    });
    return list.sort((a, b) => b.count - a.count).slice(0, 3);
  }, [reactions]);

  const indentClass = level === 0 ? '' : level === 1 ? 'ml-6 sm:ml-10' : 'ml-10 sm:ml-16';
  const timeAgo = formatTimeAgo(comment.createdAt);

  return (
    <div className={`flex flex-col gap-2.5 transition-all ${indentClass}`}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 border border-slate-200">
          <AvatarImage src={avatarUrl} alt={authorName} />
          <AvatarFallback className={isAdmin ? 'bg-red-600 text-white font-bold' : 'bg-slate-200 text-slate-700 text-xs font-bold'}>
            {authorName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Nội dung bình luận */}
        <div className="flex-1 flex flex-col gap-1 min-w-0">
          <div className="p-3 rounded-[6px] bg-slate-50 border border-slate-200 relative group">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="font-bold text-xs text-slate-900">{authorName}</span>
              {isAdmin && (
                <Badge className="bg-red-600 hover:bg-red-600 text-[10px] h-4 px-1.5 font-bold rounded-[6px]">
                  QUẢN TRỊ VIÊN
                </Badge>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>

            {/* BADGE REACTION TỔNG HỢP GÓC PHẢI DƯỚI */}
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

          {/* HÀNH ĐỘNG DƯỚI BÌNH LUẬN (THÍCH, PHẢN HỒI, THỜI GIAN) */}
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

            {/* Nút phản hồi */}
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

          {/* KHUNG SOẠN PHẢN HỒI (GỌN GÀNG, KHÔNG EMOJI THÔ) */}
          {isReplying && (
            <div className="mt-2.5 p-3 rounded-[6px] bg-slate-50 border border-slate-200 flex flex-col gap-2.5 animate-fadeIn">
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

              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Viết câu trả lời của bạn..."
                rows={2}
                className="text-xs bg-white rounded-[6px] border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                autoFocus
              />

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

      {/* RENDER ĐỆ QUY CÁC REPLIES CON */}
      {Array.isArray(comment.replies) && comment.replies.length > 0 && (
        <div className="flex flex-col gap-2.5 mt-1 border-l-2 border-slate-100 pl-2 sm:pl-3">
          {comment.replies.map((child) => (
            <BlogCommentNode
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

