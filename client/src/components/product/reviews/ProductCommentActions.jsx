'use client';

import React, { useMemo } from 'react';
import { CornerDownLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactionIcon from '@/components/common/ReactionIcons';
import { ReactionLottieFlyoutBar } from '@/components/common/ReactionLottie';
import { REACTION_CONFIG } from './commentNodeUtils';

export default function ProductCommentActions({
  comment,
  depth,
  currentUser,
  isReplying,
  setReplyingToId,
  setReplyContent,
  onReaction,
  onRetry,
  onCancelFailed,
  hoveredReactionCommentId,
  onReactionMouseEnter,
  onReactionMouseLeave,
}) {
  const isFailed = comment.status === 'failed';
  const isSending = comment.status === 'sending';
  const currentUserId = currentUser?._id || currentUser?.id;
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
      if (reactions[type] > 0) list.push({ type, count: reactions[type] });
    });
    return list.sort((a, b) => b.count - a.count).slice(0, 3);
  }, [reactions]);

  if (isFailed) {
    return (
      <div className="flex items-center gap-2 mt-1">
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={() => onRetry(comment)}
          className="h-auto p-0 inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline"
        >
          <RotateCcw size={12} />
          <span>Thử lại</span>
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
    );
  }

  if (isSending) return null;

  return (
    <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 pt-1 relative">
      <div
        className="relative inline-block"
        onMouseEnter={() => onReactionMouseEnter?.(comment._id)}
        onMouseLeave={onReactionMouseLeave}
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onReaction(comment._id, myReactionType || 'like')}
          className={`h-7 px-2 text-xs flex items-center gap-1.5 active:scale-[0.98] ${
            myReactionCfg ? `${myReactionCfg.color} font-bold` : 'text-slate-500 hover:text-blue-600'
          }`}
        >
          <ReactionIcon type={myReactionType || 'like'} size={15} />
          <span>{myReactionCfg ? myReactionCfg.label : 'Thích'}</span>
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
          className={`h-7 px-2 text-xs inline-flex items-center gap-1 active:scale-[0.98] ${
            isReplying ? 'text-slate-900 font-bold bg-slate-100' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <CornerDownLeft size={13} />
          <span>Trả lời</span>
        </Button>
      )}

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
  );
}
