import { api } from '@/lib/axios';

const API_SERVER = process.env.API_SERVER_URL || process.env.NEXT_PUBLIC_API_SERVER_URL || 'http://localhost:5000/api/v1';

export const comboService = {
  /**
   * SSR fetch active combos for homepage
   */
  getServerCombos: async () => {
    try {
      const res = await fetch(`${API_SERVER}/combos`, {
        cache: 'no-store',
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json?.data || [];
    } catch (err) {
      console.error('SSR getCombos error:', err?.message);
      return [];
    }
  },

  /**
   * Client-side fetch active combos
   */
  getCombos: async () => {
    try {
      const res = await api.get('/combos');
      return res.data?.data || [];
    } catch (err) {
      console.error('CSR getCombos error:', err?.message);
      return [];
    }
  },

  /**
   * Get single combo detail
   */
  getComboById: async (id) => {
    try {
      const res = await api.get(`/combos/${id}`);
      return res.data?.data || null;
    } catch (err) {
      console.error('CSR getComboById error:', err?.message);
      return null;
    }
  },

  /**
   * Add full combo bundle to cart with discounted pricing
   */
  addComboToCart: async (comboId, quantity = 1) => {
    const res = await api.post('/cart/combo', { comboId, quantity });
    return res.data;
  },
};

export default comboService;
