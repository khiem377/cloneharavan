import { api } from '@/lib/axios';

const API_BASE = process.env.API_SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const couponService = {
  // Client-side helper (dùng instance api có interceptors)
  async getActiveCoupons(limit = 10) {
    try {
      const response = await api.get('/coupons', {
        params: {
          availableOnly: true,
          limit,
        },
        timeout: 5000,
      });
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching active coupons:', error?.message);
      return [];
    }
  },

  // Server-side helper cho SSR
  async getServerActiveCoupons(limit = 10) {
    try {
      const res = await fetch(`${API_BASE}/coupons?availableOnly=true&limit=${limit}`, {
        cache: 'no-store',
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json?.data || [];
    } catch (err) {
      console.error('SSR ActiveCoupons error:', err?.message);
      return [];
    }
  },
};

export default couponService;
