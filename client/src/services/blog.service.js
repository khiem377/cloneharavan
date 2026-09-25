import api from '../lib/axios';

const API_BASE = process.env.API_SERVER_URL || 'http://127.0.0.1:5000/api/v1';

const fetchWithFallback = async (path, options = { cache: 'no-store' }) => {
  try {
    const res = await fetch(`${API_BASE}${path}`, options);
    return res;
  } catch (err) {
    const altBase = API_BASE.includes('localhost')
      ? API_BASE.replace('localhost', '127.0.0.1')
      : API_BASE.replace('127.0.0.1', 'localhost');
    try {
      return await fetch(`${altBase}${path}`, options);
    } catch {
      throw err;
    }
  }
};

export const blogService = {
  // ===================== SSR / SERVER COMPONENT METHODS =====================
  getServerBlogPosts: async (params = {}) => {
    try {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', String(params.page));
      if (params.limit) searchParams.set('limit', String(params.limit));
      if (params.keyword) searchParams.set('keyword', params.keyword);
      if (params.categoryId) searchParams.set('categoryId', params.categoryId);
      if (params.tag) searchParams.set('tag', params.tag);
      if (params.sort) searchParams.set('sort', params.sort);
      if (params.status) searchParams.set('status', params.status);
      if (params.isFeatured !== undefined) searchParams.set('isFeatured', String(params.isFeatured));
      if (params.isPinned !== undefined) searchParams.set('isPinned', String(params.isPinned));

      const query = searchParams.toString();
      const path = `/blog-posts${query ? `?${query}` : ''}`;

      const res = await fetchWithFallback(path, { cache: 'no-store' });
      if (!res.ok) return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } };
      const json = await res.json();
      return json?.data !== undefined ? json : { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } };
    } catch (err) {
      console.error('SSR getServerBlogPosts error:', err?.message);
      return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } };
    }
  },

  getServerBlogPostBySlug: async (slug) => {
    try {
      if (!slug) return null;
      const res = await fetchWithFallback(`/blog-posts/${encodeURIComponent(slug)}`, {
        cache: 'no-store',
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json || null;
    } catch (err) {
      console.error('SSR getServerBlogPostBySlug error:', err?.message);
      return null;
    }
  },

  getServerBlogCategories: async (params = {}) => {
    try {
      const searchParams = new URLSearchParams({ isActive: 'true', limit: '100' });
      if (params.keyword) searchParams.set('keyword', params.keyword);
      const res = await fetchWithFallback(`/blog-categories?${searchParams.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json?.data || [];
    } catch (err) {
      console.error('SSR getServerBlogCategories error:', err?.message);
      return [];
    }
  },

  getServerBlogTags: async (params = {}) => {
    try {
      const searchParams = new URLSearchParams({ isActive: 'true', limit: '30' });
      if (params.keyword) searchParams.set('keyword', params.keyword);
      const res = await fetchWithFallback(`/tags?${searchParams.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json?.data || [];
    } catch (err) {
      console.error('SSR getServerBlogTags error:', err?.message);
      return [];
    }
  },

  // ===================== CLIENT COMPONENT METHODS (AXIOS) =====================
  getBlogPosts: async (params = {}) => {
    const res = await api.get('/blog-posts', { params });
    return res.data || { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } };
  },

  getBlogPostBySlug: async (slug) => {
    const res = await api.get(`/blog-posts/${encodeURIComponent(slug)}`);
    return res.data;
  },

  getBlogCategories: async (params = {}) => {
    const res = await api.get('/blog-categories', { params });
    return res.data?.data || [];
  },

  getBlogTags: async (params = {}) => {
    const res = await api.get('/tags', { params });
    return res.data?.data || [];
  },

  incrementPostView: async (slug) => {
    try {
      await api.post(`/blog-posts/${encodeURIComponent(slug)}/view`);
    } catch {
      // Non-critical, ignore error
    }
  },
};

export default blogService;
