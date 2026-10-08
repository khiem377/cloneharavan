const commentService = require('../services/comment.service');

const getComments = async (req, res, next) => {
  try {
    const { targetType, productId, postId, ratingFilter, page, limit } = req.query;
    const result = await commentService.getComments({
      targetType: targetType || 'product',
      productId,
      postId,
      ratingFilter,
      page,
      limit,
    });
    // Không cache comment — data thay đổi thường xuyên (xóa/thêm bình luận)
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

const createComment = async (req, res, next) => {
  try {
    const { targetType, productId, postId, rating, content, parentId, attachments } = req.body;
    const comment = await commentService.createComment({
      targetType,
      productId,
      postId,
      rating,
      content,
      parentId,
      attachments,
      user: req.user,
    });
    return res.status(201).json({ status: 'success', data: comment });
  } catch (error) {
    next(error);
  }
};

const toggleReaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type } = req.body;
    const result = await commentService.toggleReaction(id, req.user._id, type);
    return res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

const checkPurchaseStatus = async (req, res, next) => {
  try {
    const { productId } = req.query;
    const hasPurchased = await commentService.checkUserPurchased(req.user?._id, productId);
    return res.status(200).json({ status: 'success', data: { hasPurchased } });
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await commentService.deleteComment(id, req.user);
    return res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComments,
  createComment,
  toggleReaction,
  checkPurchaseStatus,
  deleteComment,
};
