'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CommentRichEditor from '@/components/common/CommentRichEditor';
import BlogCommentNode from './comments/BlogCommentNode';
import { useBlogComments } from './comments/useBlogComments';

export default function BlogCommentsSection({ postId, postTitle }) {
  const {
    user,
    loading,
    content,
    setContent,
    submitting,
    pendingItems,
    replyingToId,
    setReplyingToId,
    replyContent,
    setReplyContent,
    replySubmitting,
    hoveredReactionCommentId,
    handleReactionMouseEnter,
    handleReactionMouseLeave,
    handleSubmitComment,
    handleRetryComment,
    handleCancelFailed,
    handleSubmitReply,
    handleReaction,
    handleDeleteComment,
    mergedComments,
    totalCommentsCount,
  } = useBlogComments({ postId });

  return (
    <Card className="rounded-[6px] border-slate-200 bg-white p-4 sm:p-6 shadow-none mt-8 flex flex-col gap-6">
      <CardHeader className="p-0 border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Bình luận bài viết
          </CardTitle>
          <Badge variant="secondary" className="font-mono tabular-nums text-xs">
            {totalCommentsCount}
          </Badge>
        </div>
        {postTitle && (
          <span className="text-xs text-slate-400 hidden sm:inline truncate max-w-[280px]">
            {postTitle}
          </span>
        )}
      </CardHeader>

      <CardContent className="p-0 flex flex-col gap-6">
        <div>
          <CommentRichEditor
            value={content}
            onChange={setContent}
            onSubmit={handleSubmitComment}
            placeholder="Chia sẻ ý kiến hoặc thắc mắc của bạn về bài viết..."
            submitting={submitting}
            submitLabel="BÌNH LUẬN"
            minRows={3}
          />
        </div>

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
                <BlogCommentNode
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
      </CardContent>
    </Card>
  );
}
