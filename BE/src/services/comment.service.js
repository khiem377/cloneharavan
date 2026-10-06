const path = require('path');
const fs = require('fs');
const readline = require('readline');
const Comment = require('../models/comment.model');
const Product = require('../models/product.model');
const { AppError } = require('../utils/AppError');
const { validateCommentContent } = require('../utils/profanityFilter');

// Đường dẫn file orders.csv để check lịch sử mua hàng mà KHÔNG đụng vào model Order/Cart/Checkout
const ORDERS_CSV_PATH = path.join(__dirname, '../../python-services/data/orders.csv');

/**
 * Kiểm tra xem User đã từng đặt đơn chứa sản phẩm này chưa (đọc từ orders.csv)
 */
const checkUserPurchased = async (userId, productId) => {
  if (!userId || !productId) return false;
  const targetUid = String(userId);
  const targetPid = String(productId);

  if (!fs.existsSync(ORDERS_CSV_PATH)) return false;

  return new Promise((resolve) => {
    let found = false;
    const rl = readline.createInterface({
      input: fs.createReadStream(ORDERS_CSV_PATH, { encoding: 'utf-8' }),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      if (found) return;
      const parts = line.split(',');
      if (parts.length >= 3) {
        const uId = parts[1]?.trim();
        const pId = parts[2]?.trim();
        if (uId === targetUid && pId === targetPid) {
          found = true;
          rl.close();
        }
      }
    });

    rl.on('close', () => {
      resolve(found);
    });

    rl.on('error', () => {
      resolve(false);
    });
  });
};

/**
 * Tạo bình luận / đánh giá mới
 */
const createComment = async ({
  targetType = 'product',
  productId = null,
  postId = null,
  rating = null,
  content = '',
  parentId = null,
  attachments = [],
  user,
}) => {
  if (!user || !user._id) {
    throw new AppError('Vui lòng đăng nhập để bình luận.', 401);
  }

  if (!content || !content.trim()) {
    throw new AppError('Nội dung bình luận không được để trống.', 400);
  }

  // 1. SMART CONTENT FILTER: Profanity + Anti-spam
  const { blocked, reason } = validateCommentContent(content, {
    isReply: !!parentId,
  });
  if (blocked) {
    throw new AppError(reason, 400);
  }

  // 2. RATE LIMIT: Chặn spam gửi liên tiếp (tối đa 1 comment / 20 giây / user)
  const RATE_LIMIT_SECONDS = 20;
  const recentCutoff = new Date(Date.now() - RATE_LIMIT_SECONDS * 1000);
  const recentComment = await Comment.findOne({
    authorId: user._id,
    createdAt: { $gte: recentCutoff },
  }).sort({ createdAt: -1 }).lean();

  if (recentComment) {
    const secondsAgo = Math.ceil((Date.now() - new Date(recentComment.createdAt).getTime()) / 1000);
    const remaining = RATE_LIMIT_SECONDS - secondsAgo;
    throw new AppError(
      `Vui lòng chờ ${remaining} giây trước khi gửi bình luận tiếp theo.`,
      429
    );
  }

  const role = user.role?.name || user.role || 'customer';
  const isAdminOrStaff = ['admin', 'superadmin', 'manager', 'staff'].includes(String(role).toLowerCase());

  let isPurchased = false;

  // 2. RÀNG BUỘC CHO PRODUCT: Phải từng đặt đơn sản phẩm đó mới được Rating & Comment
  if (targetType === 'product') {
    if (!productId) {
      throw new AppError('Thiếu productId cho đánh giá sản phẩm.', 400);
    }

    // Kiểm tra lịch sử mua hàng từ orders.csv (Admin/Staff được phép phản hồi hỗ trợ)
    if (!isAdminOrStaff) {
      const hasPurchased = await checkUserPurchased(user._id, productId);
      if (!hasPurchased) {
        throw new AppError(
          'Chỉ khách hàng đã từng đặt mua sản phẩm này mới có quyền gửi đánh giá & bình luận.',
          403
        );
      }
      isPurchased = true;
    } else {
      isPurchased = true;
    }

    // Nếu là comment gốc (depth 0), yêu cầu rating 1 - 5 sao
    if (!parentId && (rating === null || rating === undefined || rating < 1 || rating > 5)) {
      throw new AppError('Vui lòng chọn số sao đánh giá (từ 1 đến 5 sao).', 400);
    }
  } else if (targetType === 'blog') {
    // Blog: không cần điều kiện mua hàng, không có rating
    if (!postId) {
      throw new AppError('Thiếu postId cho bình luận bài viết.', 400);
    }
    rating = null;
    isPurchased = false;
  }

  // 3. XỬ LÝ CẤU TRÚC LỒNG NHAU (TỐI ĐA 3 CẤP: depth 0 -> 1 -> 2)
  let depth = 0;
  let rootId = null;
  let parentComment = null;

  if (parentId) {
    parentComment = await Comment.findById(parentId);
    if (!parentComment) {
      throw new AppError('Bình luận cha không tồn tại.', 404);
    }

    rootId = parentComment.rootId || parentComment._id;
    // Giới hạn tối đa 3 cấp (depth 0, 1, 2)
    depth = Math.min(2, (parentComment.depth || 0) + 1);
  }

  const authorName = user.fullName || user.name || user.email?.split('@')[0] || 'Khách hàng';
  const authorAvatar = user.avatar?.url || user.avatar || '';

  const newComment = await Comment.create({
    targetType,
    productId: targetType === 'product' ? productId : null,
    postId: targetType === 'blog' ? postId : null,
    rating: depth === 0 ? rating : null,
    isPurchased,
    authorId: user._id,
    authorInfo: {
      name: authorName,
      avatar: authorAvatar,
      role: isAdminOrStaff ? 'admin' : 'customer',
    },
    content: content.trim(),
    parentId: parentId || null,
    rootId,
    depth,
    attachments: Array.isArray(attachments) ? attachments : [],
    status: 'approved',
  });

  // Tăng replyCount của parent
  if (parentComment) {
    await Comment.findByIdAndUpdate(parentComment._id, { $inc: { replyCount: 1 } });
  }

  // Trigger TikTok/Facebook MSI Discussion Signal for Trending Engine
  try {
    if (targetType === 'product' && productId) {
      const Product = require('../models/product.model');
      const { recordDiscussionKeyword } = require('./search.service');
      Product.findById(productId).select('name').lean().then((prod) => {
        if (prod?.name) {
          recordDiscussionKeyword(prod.name);
        }
      }).catch(() => {});
    }
  } catch {}

  return newComment;
};

/**
 * Lấy danh sách bình luận (Cây lồng 3 cấp) + Thống kê Rating
 */
const getComments = async ({
  targetType = 'product',
  productId = null,
  postId = null,
  ratingFilter = null,
  page = 1,
  limit = 10,
}) => {
  const query = {
    targetType,
    status: 'approved',
    $or: [
      { isDeleted: false },
      { isDeleted: true, replyCount: { $gt: 0 } },
    ],
  };

  if (targetType === 'product') {
    if (!productId) throw new AppError('productId là bắt buộc', 400);
    query.productId = productId;
  } else {
    if (!postId) throw new AppError('postId là bắt buộc', 400);
    query.postId = postId;
  }

  // Lấy toàn bộ comments của sản phẩm / bài viết để thống kê & xây cây
  const allComments = await Comment.find(query)
    .sort({ createdAt: -1 })
    .lean();

  // Khử nội dung nhạy cảm của các bình luận đã xóa
  allComments.forEach((c) => {
    if (c.isDeleted) {
      c.content = 'Bình luận đã bị xoá';
      c.authorInfo = { name: 'Người dùng', avatar: '', role: 'customer' };
      c.reactions = [];
      c.reactionCounts = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0, total: 0 };
    }
  });

  // 1. Tính toán thống kê Rating (chỉ tính root review depth === 0 của product)
  const rootReviews = allComments.filter((c) => !c.parentId && c.rating > 0);
  const totalReviews = rootReviews.length;

  const starDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalScore = 0;

  rootReviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating)));
    starDistribution[star] = (starDistribution[star] || 0) + 1;
    totalScore += r.rating;
  });

  const averageRating = totalReviews > 0 ? parseFloat((totalScore / totalReviews).toFixed(1)) : 0;
  const starPercentages = {
    5: totalReviews > 0 ? Math.round((starDistribution[5] / totalReviews) * 100) : 0,
    4: totalReviews > 0 ? Math.round((starDistribution[4] / totalReviews) * 100) : 0,
    3: totalReviews > 0 ? Math.round((starDistribution[3] / totalReviews) * 100) : 0,
    2: totalReviews > 0 ? Math.round((starDistribution[2] / totalReviews) * 100) : 0,
    1: totalReviews > 0 ? Math.round((starDistribution[1] / totalReviews) * 100) : 0,
  };

  // 2. Lọc Root Comments theo ratingFilter nếu có
  let filteredRoots = allComments.filter((c) => !c.parentId);
  if (ratingFilter && parseInt(ratingFilter) >= 1 && parseInt(ratingFilter) <= 5) {
    filteredRoots = filteredRoots.filter((c) => Math.round(c.rating) === parseInt(ratingFilter));
  }

  // Phân trang Root Comments
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.max(1, parseInt(limit) || 10);
  const startIndex = (p - 1) * l;
  const paginatedRoots = filteredRoots.slice(startIndex, startIndex + l);

  // 3. Xây dựng cây lồng nhau 3 cấp (Depth 0 -> Depth 1 -> Depth 2)
  const repliesByParent = new Map();
  allComments.forEach((c) => {
    if (c.parentId) {
      const pKey = String(c.parentId);
      if (!repliesByParent.has(pKey)) repliesByParent.set(pKey, []);
      repliesByParent.get(pKey).push(c);
    }
  });

  const attachReplies = (node) => {
    const directReplies = (repliesByParent.get(String(node._id)) || []).sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
    node.replies = directReplies.map((r) => attachReplies(r));
    return node;
  };

  const commentTree = paginatedRoots.map((root) => attachReplies(root));

  return {
    comments: commentTree,
    pagination: {
      page: p,
      limit: l,
      totalRoots: filteredRoots.length,
      totalPages: Math.ceil(filteredRoots.length / l) || 1,
    },
    stats: {
      averageRating,
      totalReviews,
      totalComments: allComments.length,
      starDistribution,
      starPercentages,
    },
  };
};

/**
 * Thả Reaction cảm xúc kiểu Facebook
 */
const toggleReaction = async (commentId, userId, reactionType = 'like') => {
  if (!commentId || !userId) {
    throw new AppError('Thiếu thông tin thả reaction.', 400);
  }

  const validTypes = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];
  if (!validTypes.includes(reactionType)) {
    throw new AppError('Loại cảm xúc không hợp lệ.', 400);
  }

  const comment = await Comment.findById(commentId);
  if (!comment) throw new AppError('Bình luận không tồn tại.', 404);

  const existingIndex = comment.reactions.findIndex(
    (r) => String(r.userId) === String(userId)
  );

  if (existingIndex > -1) {
    const existing = comment.reactions[existingIndex];
    if (existing.type === reactionType) {
      // Hủy reaction nếu bấm lại cùng 1 loại
      comment.reactions.splice(existingIndex, 1);
    } else {
      // Đổi loại cảm xúc
      existing.type = reactionType;
    }
  } else {
    // Thêm reaction mới
    comment.reactions.push({ userId, type: reactionType, createdAt: new Date() });
  }

  // Tính lại bộ đếm reactionCounts
  const counts = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0, total: 0 };
  comment.reactions.forEach((r) => {
    if (counts[r.type] !== undefined) counts[r.type]++;
    counts.total++;
  });
  comment.reactionCounts = counts;

  await comment.save();
  return { reactionCounts: comment.reactionCounts, reactions: comment.reactions };
};

/**
 * Xóa bình luận (giữ chỗ nếu có câu trả lời con)
 */
const deleteComment = async (commentId, user) => {
  if (!commentId || !user) {
    throw new AppError('Thiếu thông tin xóa bình luận.', 400);
  }

  const comment = await Comment.findById(commentId);
  if (!comment) throw new AppError('Bình luận không tồn tại.', 404);

  const role = user.role?.name || user.role || 'customer';
  const isAdminOrStaff = ['admin', 'superadmin', 'manager', 'staff'].includes(String(role).toLowerCase());
  const isAuthor = String(comment.authorId) === String(user._id);

  if (!isAuthor && !isAdminOrStaff) {
    throw new AppError('Bạn không có quyền xóa bình luận này.', 403);
  }

  if (comment.replyCount > 0) {
    // Có câu trả lời con: giữ chỗ cho replies bên dưới (Soft delete)
    comment.isDeleted = true;
    comment.deletedAt = new Date();
    comment.content = 'Bình luận đã bị xoá';
    await comment.save();
  } else {
    // Không có câu trả lời con: đánh dấu xóa
    comment.isDeleted = true;
    comment.deletedAt = new Date();
    await comment.save();

    if (comment.parentId) {
      await Comment.findByIdAndUpdate(comment.parentId, {
        $inc: { replyCount: -1 },
      });
    }
  }

  return { success: true, message: 'Đã xóa bình luận thành công.' };
};

module.exports = {
  createComment,
  getComments,
  toggleReaction,
  checkUserPurchased,
  deleteComment,
};
