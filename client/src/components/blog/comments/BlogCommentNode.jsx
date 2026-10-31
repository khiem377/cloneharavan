'use client';

import React, { useState, useMemo } from 'react';
import {
  Trash2,
  CornerDownLeft,
  Loader2,
  AlertCircle,
  MoreHorizontal,
  RotateCcw,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ReactionIcon from '@/components/common/ReactionIcons';
import { ReactionLottieFlyoutBar } from '@/components/common/ReactionLottie';
import CommentRichEditor from '@/components/common/CommentRichEditor';
import CommentContentRenderer from '@/components/common/CommentContentRenderer';
import { REACTION_CONFIG, getAvatarPalette, formatTimeAgo } from './blogCommentUtils';

export default function BlogCommentNode({
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
  const canDelete = isAuthor || currentUser?.role === 'admin';

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
  const indentClass = depth === 0 ? '' : 'ml-6 sm:ml-8 border-l border-slate-200 pl-4 mt-3.5';

  return (
    <div className={`flex flex-col gap-2.5 transition-all ${indentClass}`}>
      {isDeleted ? (
        <div className="flex items-center gap-2 py-1 text-slate-400 text-xs sm:text-sm italic">
          <Trash2 size={15} className="shrink-0 text-slate-400" />
          <span>Bình luận đã bị xoá</span>
          <span className="text-[11px] text-slate-400 not-italic ml-1">{timeAgo}</span>
        </div>
      ) : (
        <div className={`flex items-start gap-3 ${isSending ? 'opacity-70' : ''}`}>
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

          <div className="flex-1 flex flex-col gap-1 min-w-0">
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
                    size="icon-xs"
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="text-slate-400 hover:text-slate-600"
                    title="Tuỳ chọn"
                  >
                    <MoreHorizontal size={14} />
                  </Button>

                  {menuOpen && (
                    <div
                      className="absolute right-0 top-full mt-1 w-32 bg-white rounded-[6px] border border-slate-200 shadow-sm py-1 z-30 animate-in fade-in"
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
                        className="w-full justify-start text-xs text-rose-600 hover:bg-rose-50 gap-1.5 h-8 font-medium rounded-none px-3"
                      >
                        <Trash2 size={12} /> Xoá bình luận
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <CommentContentRenderer content={comment.content} className="mt-0.5" />

            {isFailed && (
              <div className="flex items-center gap-2 mt-1">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => onRetry(comment)}
                  className="h-auto p-0 gap-1 text-xs font-semibold text-rose-600 hover:underline"
                >
                  <RotateCcw size={12} /> Thử lại
                </Button>
                <span className="text-slate-300">·</span>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => onCancelFailed(comment.tempId)}
                  className="h-auto p-0 text-xs text-slate-400 hover:text-slate-600"
                >
                  Huỷ bỏ
                </Button>
              </div>
            )}

            {!isSending && !isFailed && (
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-1 relative">
                <div
                  className="relative inline-block"
                  onMouseEnter={() => onReactionMouseEnter?.(comment._id)}
                  onMouseLeave={onReactionMouseLeave}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (myReactionType) {
                        onReaction(comment._id, myReactionType);
                      } else {
                        onReaction(comment._id, 'like');
                      }
                    }}
                    className={`h-auto p-0 gap-1.5 font-semibold hover:bg-transparent ${
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
                  </Button>

                  {hoveredReactionCommentId === comment._id && (
                    <div
                      className="absolute bottom-full left-0 pb-2 z-50"
                      onMouseEnter={() => onReactionMouseEnter?.(comment._id)}
                      onMouseLeave={onReactionMouseLeave}
                    >
                      <ReactionLottieFlyoutBar
                        onSelect={(type) => {
                          onReaction(comment._id, type);
                          onReactionMouseLeave?.();
                        }}
                      />
                    </div>
                  )}
                </div>

                {depth < 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setReplyingToId(isReplying ? null : comment._id);
                      setReplyContent('');
                    }}
                    className={`h-auto p-0 gap-1 font-semibold hover:bg-transparent ${
                      isReplying ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <CornerDownLeft size={13} />
                    <span>Trả lời</span>
                  </Button>
                )}

                {totalReactions > 0 && (
                  <Badge variant="secondary" className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-normal">
                    <span className="flex items-center -space-x-1">
                      {topReactions.map((r) => (
                        <ReactionIcon key={r.type} type={r.type} size={14} className="border border-white rounded-full" />
                      ))}
                    </span>
                    <span className="font-mono text-[10px] font-bold ml-0.5">{totalReactions}</span>
                  </Badge>
                )}
              </div>
            )}

            {isReplying && (
              <div className="mt-3 animate-in fade-in">
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
            <BlogCommentNode
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
            <BlogCommentNode
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
