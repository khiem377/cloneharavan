import api from '@/lib/axios';

export const warehouseService = {
  getWarehouses: (params) => api.get('/warehouses', { params }),
  getWarehouseById: (id) => api.get(`/warehouses/${id}`),
  createWarehouse: (data) => api.post('/warehouses', data),
  updateWarehouse: (id, data) => api.put(`/warehouses/${id}`, data),
  setDefault: (id) => api.patch(`/warehouses/${id}/set-default`),
  deleteWarehouse: (id) => api.delete(`/warehouses/${id}`),
  getWarehouseInventory: (id, params) => api.get(`/warehouses/${id}/inventory`, { params }),
  getStaffCandidates: () => api.get('/warehouses/staff-candidates'),

  // Stock Transfers
  getStockTransfers: (params) => api.get('/stock-transfers', { params }),
  getStockTransferById: (id) => api.get(`/stock-transfers/${id}`),
  createStockTransfer: (data) => api.post('/stock-transfers', data),
  updateTransferStatus: (id, status) => api.patch(`/stock-transfers/${id}/status`, { status }),
};

export default warehouseService;
