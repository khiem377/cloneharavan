import api from '../lib/axios';

const API_BASE = process.env.API_SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const menuService = {
  // Client-side helper
  getByHandle: async (handle = 'main-menu') => {
    try {
      const res = await api.get(`/menus/handle/${handle}`);
      return res.data?.data || null;
    } catch (error) {
      console.error(`Error fetching menu ${handle}:`, error?.message);
      return null;
    }
  },

  // Server-side helper for SSR (does not expose in client devtools)
  getServerMenu: async (handle = 'main-menu') => {
    try {
      const res = await fetch(`${API_BASE}/menus/handle/${handle}`, {
        cache: 'no-store', // or next: { revalidate: 60 }
      });
      if (!res.ok) return null;

      const json = await res.json();
      return json?.data || null;
    } catch (error) {
      console.error(`SSR Error fetching menu ${handle}:`, error?.message);
      return null;
    }
  },
};

export default menuService;
