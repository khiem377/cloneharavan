import api from '@/lib/axios';

export const dashboardService = {
  getOverview: (period = '30days') => api.get('/dashboard/overview', { params: { period } }),
  searchGlobal: (query) => api.get('/dashboard/search', { params: { q: query } }),
};
