import { api } from '@/lib/axios';

const API_BASE = process.env.API_SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const commentService = {

  getComments: async ({ targetType = 'product', productId = null, postId = null, ratingFilter = null, page = 1, limit = 10 } = {}) => {
    try {
      const params = { targetType, page, limit };
      if (productId) params.productId = productId;
      if (postId) params.postId = postId;
      if (ratingFilter) params.ratingFilter = ratingFilter;

      const res = await api.get('/comments', { params });
      return res.data?.data || { comments: [], stats: {}, pagination: {} };
    } catch (error) {
      console.error('Error fetching comments:', error?.message);
      return { comments: [], stats: {}, pagination: {} };
    }
  },

  createComment: async ({ targetType = 'product', productId = null, postId = null, rating = null, content = '', parentId = null, token = null } = {}) => {
    const config = {};
    if (token) {
      config.headers = { Authorization: `Bearer ${token}` };
    }
    const res = await api.post(
      '/comments',
      {
        targetType,
        productId,
        postId,
        rating,
        content,
        parentId,
      },
      config
    );
    return res.data?.data;
  },

  toggleReaction: async ({ commentId, type = 'like', token = null } = {}) => {
    const config = {};
    if (token) {
      config.headers = { Authorization: `Bearer ${token}` };
    }
    const res = await api.post(`/comments/${commentId}/reactions`, { type }, config);
    return res.data?.data;
  },

  checkPurchaseStatus: async ({ productId, token = null } = {}) => {
    if (!productId) return { hasPurchased: false };
    try {
      const config = { params: { productId } };
      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }
      const res = await api.get('/comments/check-purchase', config);
      return res.data?.data || { hasPurchased: false };
    } catch {
      return { hasPurchased: false };
    }
  },

  deleteComment: async ({ commentId, token = null } = {}) => {
    const config = {};
    if (token) {
      config.headers = { Authorization: `Bearer ${token}` };
    }
    const res = await api.delete(`/comments/${commentId}`, config);
    return res.data?.data;
  },


  getServerComments: async ({ targetType = 'product', productId = null, postId = null, ratingFilter = null, page = 1, limit = 10 } = {}) => {
    try {
      const params = new URLSearchParams({
        targetType,
        page: String(page),
        limit: String(limit),
      });
      if (productId) params.append('productId', productId);
      if (postId) params.append('postId', postId);
      if (ratingFilter) params.append('ratingFilter', String(ratingFilter));

      const res = await fetch(`${API_BASE}/comments?${params.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) return { comments: [], stats: {}, pagination: {} };

      const json = await res.json();
      return json?.data || { comments: [], stats: {}, pagination: {} };
    } catch (error) {
      console.error('SSR Error fetching comments:', error?.message);
      return { comments: [], stats: {}, pagination: {} };
    }
  },
};

export default commentService;
