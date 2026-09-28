const API_BASE = process.env.API_SERVER_URL || 'http://localhost:5000/api/v1';

export const bannerServerService = {
  async getPublicBanners(type = 'hero') {
    try {
      const url = `${API_BASE}/banners?type=${encodeURIComponent(type)}`;
      const res = await fetch(url, {
        cache: 'no-store',
      });
      if (!res.ok) return [];
      const json = await res.json();
      return (
        json.data?.banners ||
        json.data ||
        []
      );
    } catch (error) {
      console.error('SSR fetch public banners error:', error?.message);
      return [];
    }
  },
};

export default bannerServerService;