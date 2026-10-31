'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ProductReviewStats from '../reviews/ProductReviewStats';
import ProductReviewForm from '../reviews/ProductReviewForm';
import ProductCommentNode from '../reviews/ProductCommentNode';
import { useProductComments } from '../reviews/useProductComments';

export default function ProductReviewsAndComments({ productId, productName }) {
  const {
    user,
    mounted,
    stats,
    loading,
    starFilter,
    setStarFilter,
    rating,
    setRating,
    content,
    setContent,
    submitting,
    hasPurchased,
    pendingItems,
    setPendingItems,
    replyingToId,
    setReplyingToId,
    replyContent,
    setReplyContent,
    replySubmitting,
    hoveredReactionCommentId,
    handleReactionMouseEnter,
    handleReactionMouseLeave,
    handleSubmitReview,
    handleSubmitReply,
    handleRetryItem,
    handleReaction,
    handleDeleteComment,
    mergedComments,
    isAuthenticated,
  } = useProductComments({ productId });

  return (
    <Card className="rounded-[6px] border-slate-200 bg-white shadow-none overflow-hidden">
      <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-bold text-slate-900">
            Đánh giá & Nhận xét
          </CardTitle>
          <Badge variant="secondary" className="font-mono tabular-nums text-xs">
            {stats.totalReviews || 0}
          </Badge>
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline truncate max-w-[280px]">
          {productName}
        </span>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 flex flex-col gap-6">
        <ProductReviewStats
          averageRating={stats.averageRating || 0}
          totalReviews={stats.totalReviews || 0}
          starPercentages={stats.starPercentages || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }}
          starDistribution={stats.starDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }}
          starFilter={starFilter}
          onSelectStarFilter={setStarFilter}
        />

        <Separator className="bg-slate-100" />

        <ProductReviewForm
          rating={rating}
          setRating={setRating}
          content={content}
          setContent={setContent}
          submitting={submitting}
          onSubmit={handleSubmitReview}
          mounted={mounted}
          isAuthenticated={Boolean(isAuthenticated())}
          hasPurchased={hasPurchased}
          userRole={user?.role}
        />

        <Separator className="bg-slate-100" />

        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Tất cả nhận xét & thảo luận
          </span>

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
                    onCancelFailed={(tempId) => setPendingItems((prev) => prev.filter((i) => i.tempId !== tempId))}
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
