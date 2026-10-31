import { api } from '@/lib/axios';

const API_BASE = process.env.API_SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const giftProgramService = {
  // Client-side helper
  async getActiveGiftPrograms(params = {}) {
    try {
      const response = await api.get('/gift-programs', {
        params: {
          isActive: true,
          ...params,
        },
        timeout: 5000,
      });
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching gift programs:', error?.message);
      return [];
    }
  },

  // Server-side helper cho SSR
  async getServerActiveGiftPrograms(limit = 20) {
    try {
      const res = await fetch(`${API_BASE}/gift-programs?isActive=true&limit=${limit}`, {
        cache: 'no-store',
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json?.data || [];
    } catch (err) {
      console.error('SSR ActiveGiftPrograms error:', err?.message);
      return [];
    }
  },
};

export default giftProgramService;
