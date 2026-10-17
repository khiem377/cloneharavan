import api from '@/lib/axios';

export const settingService = {
  getPublicSettings: async () => {
    try {
      const res = await api.get('/settings/public', {
        params: { _t: Date.now() },
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });
      return res.data?.data || null;
    } catch (err) {
      console.warn('[settingService] Không thể tải cấu hình công khai:', err?.response?.data || err.message);
      return null;
    }
  },
};

export default settingService;
