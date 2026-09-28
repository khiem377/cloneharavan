import api from '@/lib/axios';

export const mediaService = {
  // ── Read ───────────────────────────────────────────────────────────────
  browse:      (params) => api.get('/media', { params }),
  search:      (params) => api.get('/media/search', { params }),
  stats:       ()       => api.get('/media/stats'),
  getUnused:   (params) => api.get('/media/unused', { params }),
  checkUsages: (ids)    => api.post('/media/check-usages', { ids }),
  // Lấy usage của 1 file — dùng để hiện panel "Đang dùng ở"
  getUsage:    (id)     => api.get(`/media/${id}/usages`),
  // Bulk fetch media info theo IDs — dùng để resolve folder info từ form
  getByIds:    (ids)    => api.get('/media/by-ids', { params: { ids: ids.join(',') } }),

  // ── Upload ─────────────────────────────────────────────────────────────
  upload: (formData, onProgress) =>
    api.post('/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => onProgress?.(Math.round((e.loaded / e.total) * 100)),
    }),
  uploadUrl: (data) => api.post('/media/upload-url', data),

  // ── Update ─────────────────────────────────────────────────────────────
  // Di chuyển 1 file (dùng trong product import)
  move:     (id, targetFolderId) => api.patch(`/media/${id}/move`, { targetFolderId }),
  // Di chuyển nhiều file cùng lúc
  bulkMove: (ids, targetFolderId) => api.patch('/media/bulk-move', { ids, targetFolderId }),
  // Đổi tên file
  rename:   (id, filename) => api.patch(`/media/${id}/rename`, { filename }),
  // Cập nhật altText / caption — cả 2 đều optional
  updateMeta: (id, { altText, caption } = {}) =>
    api.patch(`/media/${id}/meta`, { altText, caption }),

  // ── Delete ─────────────────────────────────────────────────────────────
  deleteOne:  (id)              => api.delete(`/media/${id}`),
  // force=true: xóa dù đang được dùng
  deleteBulk: (ids, force = false) => api.delete('/media/bulk', { data: { ids, force } }),
};
