import api from '@/lib/axios';

export const settingService = {
  getPublicSettings: async () => {
    try {
      const res = await api.get('/settings/public');
      return res.data?.data || null;
    } catch (err) {
      console.warn('[settingService] Không thể tải cấu hình công khai:', err.message);
      return null;
    }
  },
};

export default settingService;
