'use client';

import { useState, useEffect, useRef } from 'react';
import useAuthStore from '@/store/authStore';
import commentService from '@/services/comment.client.service';
import toast from '@/components/ui/toast';
import { confirm } from '@/components/ui/confirm-dialog';

export function useBlogComments({ postId }) {
  const { user, accessToken, isAuthenticated } = useAuthStore();
  const [data, setData] = useState({ comments: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [pendingItems, setPendingItems] = useState([]);
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

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
        targetType: 'blog',
        postId,
        content: text,
        token: accessToken,
      });
      setPendingItems((prev) => prev.filter((item) => item.tempId !== tempId));
      toast.success('Bình luận của bạn đã được đăng thành công!');
      await loadComments();
    } catch (err) {
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

  const handleCancelFailed = (tempId) => {
    setPendingItems((prev) => prev.filter((i) => i.tempId !== tempId));
  };

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
      toast.success('Đã gửi phản hồi thành công!');
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

  const handleReaction = async (commentId, type) => {
    if (!isAuthenticated()) {
      toast.warning('Vui lòng đăng nhập để thả cảm xúc.');
      return;
    }
    try {
      await commentService.reactToComment({
        commentId,
        type,
        token: accessToken,
      });
      await loadComments();
    } catch (err) {
      toast.error('Lỗi khi thả cảm xúc.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    const isOk = await confirm({
      title: 'Xoá bình luận',
      description: 'Bạn có chắc chắn muốn xoá bình luận này? Nội dung sẽ bị gỡ bỏ.',
      confirmText: 'Xoá vĩnh viễn',
      variant: 'destructive',
    });
    if (!isOk) return;

    try {
      await commentService.deleteComment({
        commentId,
        token: accessToken,
      });
      toast.success('Đã xoá bình luận.');
      await loadComments();
    } catch (err) {
      toast.error('Không thể xoá bình luận.');
    }
  };

  const rawComments = data.comments || [];
  const rootPending = pendingItems.filter((item) => !item.parentId);
  const mergedComments = [...rootPending, ...rawComments];
  const stats = data.stats || {};
  const totalCommentsCount = stats.total || rawComments.length;

  return {
    user,
    data,
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
  };
}
