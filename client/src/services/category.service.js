import { api } from '@/lib/axios';

const API_BASE = process.env.API_SERVER_URL || 'http://localhost:5000/api/v1';

export const categoryService = {
  /**
   * Lấy cây danh mục đa cấp phía Server (SSR)
   */
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

  /**
   * Lấy danh sách danh mục phẳng với bộ lọc phía Server (SSR)
   */
  getServerCategories: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
      });
      const qStr = query.toString() ? `?${query.toString()}` : '';
      const res = await fetch(`${API_BASE}/categories${qStr}`, {
        cache: 'no-store',
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json?.data || [];
    } catch (err) {
      console.error('SSR getCategories error:', err?.message);
      return [];
    }
  },

  /**
   * Lấy cây danh mục đa cấp phía Client
   */
  getCategoryTree: async () => {
    try {
      const res = await api.get('/categories', { params: { tree: 'true' } });
      return res.data?.data || [];
    } catch (err) {
      console.error('Client getCategoryTree error:', err?.message);
      return [];
    }
  },

  /**
   * Lấy danh mục phía Client
   */
  getCategories: async (params = {}) => {
    try {
      const res = await api.get('/categories', { params });
      return res.data?.data || [];
    } catch (err) {
      console.error('Client getCategories error:', err?.message);
      return [];
    }
  },
};

export default categoryService;
