import api from '@/lib/axios';

export const folderService = {
  getTree:  ()           => api.get('/folders'),
  create:   (data)       => api.post('/folders', data),
  rename:   (id, name)   => api.patch(`/folders/${id}`, { name }),
  reorder:  (items)      => api.patch('/folders/reorder', items),
  delete:   (id)         => api.delete(`/folders/${id}`),
};
