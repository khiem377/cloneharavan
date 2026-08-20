import api from '@/lib/axios';

export const mediaService = {
  browse: (params) => api.get('/media', { params }),
  search: (params) => api.get('/media/search', { params }),
  upload: (formData, onProgress) =>
    api.post('/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => onProgress?.(Math.round((e.loaded / e.total) * 100)),
    }),
  uploadUrl: (data) => api.post('/media/upload-url', data), // upload từ URL
  move: (id, targetFolderId) => api.patch(`/media/${id}/move`, { targetFolderId }),
  checkUsages: (ids) => api.post('/media/check-usages', { ids }),
  deleteOne: (id) => api.delete(`/media/${id}`),
  deleteBulk: (ids) => api.delete('/media/bulk', { data: { ids } }),
};
