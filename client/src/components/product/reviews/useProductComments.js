'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import useAuthStore from '@/store/authStore';
import commentService from '@/services/comment.client.service';
import { toast } from '@/components/ui/toast';
import { confirm } from '@/components/ui/confirm-dialog';

export function useProductComments({ productId }) {
  const { user, accessToken, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState({ comments: [], stats: {}, pagination: {} });
  const [loading, setLoading] = useState(true);
  const [starFilter, setStarFilter] = useState(null);

  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [pendingItems, setPendingItems] = useState([]);

  const [replyingToId, setReplyingToId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [hoveredReactionCommentId, setHoveredReactionCommentId] = useState(null);
  const reactionHoverTimeoutRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReactionMouseEnter = (commentId) => {
    if (reactionHoverTimeoutRef.current) clearTimeout(reactionHoverTimeoutRef.current);
    setHoveredReactionCommentId(commentId);
  };

  const handleReactionMouseLeave = () => {
    if (reactionHoverTimeoutRef.current) clearTimeout(reactionHoverTimeoutRef.current);
    reactionHoverTimeoutRef.current = setTimeout(() => {
      setHoveredReactionCommentId(null);
    }, 280);
  };

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
      toast.error('Không thể tải bình luận');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      loadComments(starFilter);
    }
  }, [productId, starFilter]);

  useEffect(() => {
    const checkPurchase = async () => {
      if (!isAuthenticated() || !productId) return;
      try {
        const res = await commentService.checkUserPurchased(productId);
        if (res?.hasPurchased) {
          setHasPurchased(true);
        }
      } catch (err) {}
    };
    checkPurchase();
  }, [productId, accessToken]);

  const handleSubmitReview = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!isAuthenticated()) {
      toast.error('Vui lòng đăng nhập để gửi đánh giá');
      return;
    }
    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá');
      return;
    }

    try {
      setSubmitting(true);
      const res = await commentService.createComment({
        targetType: 'product',
        productId,
        rating,
        content: content.trim(),
      });

      if (res?.success) {
        toast.success(res.message || 'Gửi đánh giá thành công');
        setContent('');
        setRating(5);
        loadComments();
      } else {
        toast.error(res?.message || 'Không thể gửi đánh giá');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Lỗi khi gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId) => {
    if (!isAuthenticated()) {
      toast.error('Vui lòng đăng nhập để phản hồi');
      return;
    }
    if (!replyContent.trim()) {
      toast.error('Vui lòng nhập nội dung phản hồi');
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const optimisticReply = {
      _id: tempId,
      tempId,
      parentId,
      productId,
      content: replyContent.trim(),
      user: {
        _id: user?._id || user?.id,
        fullName: user?.fullName || 'Bạn',
        avatar: user?.avatar,
        role: user?.role || 'customer',
      },
      createdAt: new Date().toISOString(),
      reactions: {},
      reactionCount: 0,
      status: 'pending',
    };

    setPendingItems((prev) => [...prev, optimisticReply]);
    const sendText = replyContent.trim();
    setReplyContent('');
    setReplyingToId(null);

    try {
      setReplySubmitting(true);
      const res = await commentService.createComment({
        targetType: 'product',
        productId,
        parentId,
        content: sendText,
      });

      if (res?.success) {
        setPendingItems((prev) => prev.filter((i) => i.tempId !== tempId));
        toast.success('Phản hồi thành công');
        loadComments();
      } else {
        setPendingItems((prev) =>
          prev.map((i) => (i.tempId === tempId ? { ...i, status: 'error' } : i))
        );
        toast.error(res?.message || 'Không thể gửi phản hồi');
      }
    } catch (err) {
      setPendingItems((prev) =>
        prev.map((i) => (i.tempId === tempId ? { ...i, status: 'error' } : i))
      );
      toast.error('Lỗi khi gửi phản hồi');
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleRetryItem = async (tempItem) => {
    setPendingItems((prev) =>
      prev.map((i) => (i.tempId === tempItem.tempId ? { ...i, status: 'pending' } : i))
    );

    try {
      const res = await commentService.createComment({
        targetType: 'product',
        productId,
        parentId: tempItem.parentId,
        content: tempItem.content,
      });

      if (res?.success) {
        setPendingItems((prev) => prev.filter((i) => i.tempId !== tempItem.tempId));
        toast.success('Phản hồi thành công');
        loadComments();
      } else {
        setPendingItems((prev) =>
          prev.map((i) => (i.tempId === tempItem.tempId ? { ...i, status: 'error' } : i))
        );
        toast.error(res?.message || 'Thử lại thất bại');
      }
    } catch (err) {
      setPendingItems((prev) =>
        prev.map((i) => (i.tempId === tempItem.tempId ? { ...i, status: 'error' } : i))
      );
      toast.error('Lỗi khi thử lại');
    }
  };

  const handleReaction = async (commentId, reactionType) => {
    if (!isAuthenticated()) {
      toast.error('Vui lòng đăng nhập để thả biểu cảm');
      return;
    }

    try {
      const res = await commentService.reactToComment(commentId, reactionType);
      if (res?.success) {
        loadComments();
      }
    } catch (err) {
      toast.error('Không thể thao tác');
    }
  };

  const handleDeleteComment = async (commentId) => {
    const ok = await confirm({
      title: 'Xóa bình luận',
      message: 'Bạn có chắc chắn muốn xóa bình luận này không?',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      variant: 'destructive',
    });
    if (!ok) return;

    try {
      const res = await commentService.deleteComment(commentId);
      if (res?.success) {
        toast.success('Đã xóa bình luận');
        loadComments();
      }
    } catch (err) {
      toast.error('Không thể xóa');
    }
  };

  const comments = data?.comments || [];
  const stats = data?.stats || {};

  const mergedComments = useMemo(() => {
    const rootPending = pendingItems.filter((i) => !i.parentId);
    return [...rootPending, ...comments];
  }, [comments, pendingItems]);

  return {
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
  };
}
