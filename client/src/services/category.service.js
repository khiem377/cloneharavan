import api from '../lib/axios';

const API_BASE = process.env.API_SERVER_URL || 'http://localhost:5000/api/v1';

export const categoryService = {
  getServerCategoryTree: async () => {
    try {
      const res = await fetch(`${API_BASE}/categories?tree=true`, {
        cache: 'no-store',
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json?.data || [];
    } catch (err) {
      console.error('SSR CategoryTree error:', err?.message);
      return [];
    }
  },

  getCategoryTree: async () => {
    const res = await api.get('/categories', { params: { tree: 'true' } });
    return res.data?.data || [];
  },
};

export default categoryService;
