'use client';

import React, { useState } from 'react';
import { Trash2, Loader2, AlertCircle, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CommentRichEditor from '@/components/common/CommentRichEditor';
import CommentContentRenderer from '@/components/common/CommentContentRenderer';
import { getAvatarPalette, formatTimeAgo } from './commentNodeUtils';
import ProductCommentActions from './ProductCommentActions';

export default function ProductCommentNode({
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
  const canDelete = isAuthor || currentUser?.role === 'admin';

  const initialLetter = authorName.charAt(0).toUpperCase() || 'U';
  const avatarPalette = getAvatarPalette(authorName);
  const indentClass = depth === 0 ? '' : 'ml-6 sm:ml-8 border-l border-slate-200 pl-4 mt-3.5';

  return (
    <div className={`flex flex-col gap-2.5 transition-all ${indentClass}`}>
      {isDeleted ? (
        <div className="flex items-center gap-2 py-1 text-slate-400 text-xs sm:text-sm italic">
          <Trash2 size={15} className="shrink-0 text-slate-400" />
          <span>Bình luận đã bị xoá</span>
          <span className="text-[11px] text-slate-400 not-italic ml-1" suppressHydrationWarning>{timeAgo}</span>
        </div>
      ) : (
        <div className={`flex items-start gap-3 ${isSending ? 'opacity-70' : ''}`}>
          <div className="shrink-0">
            {authorAvatar ? (
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border border-slate-200">
                <AvatarImage src={authorAvatar} alt={authorName} />
                <AvatarFallback className={`${avatarPalette} font-bold text-xs`}>{initialLetter}</AvatarFallback>
              </Avatar>
            ) : (
              <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm select-none ${avatarPalette}`}>
                {initialLetter}
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-bold text-xs sm:text-sm text-slate-900">{authorName}</span>
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
                <span className="text-[11px] text-slate-400 font-normal" suppressHydrationWarning>{timeAgo}</span>
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

              {!isSending && !isFailed && canDelete && (
                <div className="relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="h-6 w-6 text-slate-400 hover:text-slate-600 rounded-[4px] hover:bg-slate-100"
                    aria-label="Tùy chọn bình luận"
                  >
                    <MoreHorizontal size={14} />
                  </Button>
                  {menuOpen && (
                    <div
                      className="absolute right-0 top-full mt-1 w-32 bg-white rounded-[6px] border border-slate-200 shadow-sm py-1 z-30 animate-fadeIn"
                      onMouseLeave={() => setMenuOpen(false)}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setMenuOpen(false);
                          onDelete(comment._id);
                        }}
                        className="w-full justify-start px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 gap-1.5 font-medium rounded-none h-auto"
                      >
                        <Trash2 size={12} />
                        <span>Xoá bình luận</span>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {comment.rating > 0 && depth === 0 && (
              <div className="flex items-center gap-0.5 my-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-xs ${star <= comment.rating ? 'text-amber-400' : 'text-slate-200'}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            )}

            <CommentContentRenderer content={comment.content} className="mt-0.5" />

            <ProductCommentActions
              comment={comment}
              depth={depth}
              currentUser={currentUser}
              isReplying={isReplying}
              setReplyingToId={setReplyingToId}
              setReplyContent={setReplyContent}
              onReaction={onReaction}
              onRetry={onRetry}
              onCancelFailed={onCancelFailed}
              hoveredReactionCommentId={hoveredReactionCommentId}
              onReactionMouseEnter={onReactionMouseEnter}
              onReactionMouseLeave={onReactionMouseLeave}
            />

            {isReplying && (
              <div className="mt-3 animate-fadeIn">
                <CommentRichEditor
                  autoFocus
                  value={replyContent}
                  onChange={setReplyContent}
                  onSubmit={() => onSubmitReply(comment)}
                  onCancel={() => {
                    setReplyingToId(null);
                    setReplyContent('');
                  }}
                  replyTo={{ name: authorName }}
                  placeholder="Viết câu trả lời của bạn..."
                  submitting={replySubmitting}
                  submitLabel="TRẢ LỜI"
                  minRows={2}
                />
              </div>
            )}
          </div>
        </div>
      )}

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
