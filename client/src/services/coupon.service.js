import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const couponService = {
  async getActiveCoupons(limit = 10) {
    try {
      const response = await axios.get(`${API_BASE_URL}/coupons`, {
        params: {
          isActive: true,
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

  async getServerActiveCoupons(limit = 10) {
    try {
      const res = await fetch(`${API_BASE_URL}/coupons?isActive=true&limit=${limit}`, {
        next: { revalidate: 60 },
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json?.data || [];
    } catch {
      return [];
    }
  },
};

export default couponService;
