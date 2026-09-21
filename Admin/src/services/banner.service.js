import api from '@/lib/axios';

export const BANNER_TYPES = ['hero', 'popup', 'sidebar', 'category-top', 'product-top'];

export const BANNER_TYPE_LABELS = {
  'hero':         'Hero (Slider chính)',
  'popup':        'Popup',
  'sidebar':      'Sidebar',
  'category-top': 'Đầu trang danh mục',
  'product-top':  'Đầu trang sản phẩm',
};

export const bannerService = {
  // ── Public ───────────────────────────────────────────────────────────────
  // FE storefront gọi — filter theo type, chỉ trả về banner đang active + đúng lịch
  getPublic: (type = null) => api.get('/banners', { params: type ? { type } : {} }),
  // Analytics (không cần auth)
  trackView:  (id) => api.post(`/banners/${id}/view`),
  trackClick: (id) => api.post(`/banners/${id}/click`),

  // ── Admin ─────────────────────────────────────────────────────────────────
  getAll:     (params = {}) => api.get('/banners/admin', { params }),
  locate:     (id, limit)   => api.get('/banners/admin/locate', { params: { id, limit } }),
  create:     (data)        => api.post('/banners/admin', data),
  update:     (id, data)    => api.patch(`/banners/admin/${id}`, data),
  remove:     (id)          => api.delete(`/banners/admin/${id}`),
  removeBulk: (ids)         => api.delete('/banners/admin/bulk', { data: { ids } }),
  reorder:    (items)       => api.patch('/banners/admin/reorder', { items }),
};
