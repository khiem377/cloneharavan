import api from '../lib/axios';

const API_BASE = process.env.API_SERVER_URL || 'http://localhost:5000/api/v1';

export const flashSaleService = {
  getServerActiveFlashSale: async () => {
    try {
      const res = await fetch(`${API_BASE}/flash-sales/active`, {
        cache: 'no-store',
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json?.data || null;
    } catch (err) {
      console.error('SSR ActiveFlashSale error:', err?.message);
      return null;
    }
  },

  getServerAvailableFlashSales: async () => {
    try {
      const res = await fetch(`${API_BASE}/flash-sales/available`, {
        cache: 'no-store',
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json?.data || [];
    } catch (err) {
      console.error('SSR AvailableFlashSales error:', err?.message);
      return [];
    }
  },

  getServerFlashSaleById: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/flash-sales/${id}`, {
        cache: 'no-store',
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json?.data || null;
    } catch (err) {
      console.error('SSR FlashSaleById error:', err?.message);
      return null;
    }
  },

  getActiveFlashSale: async () => {
    try {
      const res = await api.get('/flash-sales/active');
      return res.data?.data || null;
    } catch (err) {
      console.error('CSR ActiveFlashSale error:', err?.message);
      return null;
    }
  },

  getAvailableFlashSales: async () => {
    try {
      const res = await api.get('/flash-sales/available');
      return res.data?.data || [];
    } catch (err) {
      console.error('CSR AvailableFlashSales error:', err?.message);
      return [];
    }
  },

  getFlashSaleById: async (id) => {
    try {
      const res = await api.get(`/flash-sales/${id}`);
      return res.data?.data || null;
    } catch (err) {
      console.error('CSR FlashSaleById error:', err?.message);
      return null;
    }
  },
};

export default flashSaleService;
