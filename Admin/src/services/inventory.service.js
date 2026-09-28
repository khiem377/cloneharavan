import api from '@/lib/axios';

export const inventoryService = {
  // Đơn nhập kho (Purchase Orders)
  getPurchaseOrders: (params) => api.get('/purchase-orders', { params }),
  getPurchaseOrderById: (id) => api.get(`/purchase-orders/${id}`),
  createPurchaseOrder: (data) => api.post('/purchase-orders', data),
  previewPOExcel: (data) => api.post('/purchase-orders/preview-excel', data, { responseType: 'arraybuffer' }),
  updatePurchaseOrderStatus: (id, payload) =>
    api.patch(`/purchase-orders/${id}/status`, typeof payload === 'string' ? { status: payload } : payload),
  downloadPOExcel: (id) => api.get(`/purchase-orders/${id}/download-excel`, { responseType: 'blob' }),
  previewPOEmail: (id) => api.get(`/purchase-orders/${id}/preview-email`),
  sendPOToSupplier: (id, payload) => api.post(`/purchase-orders/${id}/send-po`, payload),

  // Phiếu nhập kho (Stock Receivings - PNK)
  getStockReceivings: (params) => api.get('/stock-receivings', { params }),
  getStockReceivingById: (id) => api.get(`/stock-receivings/${id}`),
  createStockReceiving: (data) => api.post('/stock-receivings', data),
  syncStockReceivingsFromPOs: () => api.post('/stock-receivings/sync-from-pos'),

  // Phiếu xuất kho (Stock Exports)
  getStockExports: (params) => api.get('/stock-exports', { params }),
  getStockExportById: (id) => api.get(`/stock-exports/${id}`),
  createStockExport: (data) => api.post('/stock-exports', data),
  updateStockExportStatus: (id, payload) => api.patch(`/stock-exports/${id}/status`, payload),
  downloadExportExcel: (id) => api.get(`/stock-exports/${id}/download-excel`, { responseType: 'blob' }),

  // Phiếu kiểm kê kho (Stock Audits)
  getStockAudits: (params) => api.get('/stock-audits', { params }),
  getStockAuditById: (id) => api.get(`/stock-audits/${id}`),
  createStockAudit: (data) => api.post('/stock-audits', data),
  downloadAuditExcel: (id) => api.get(`/stock-audits/${id}/download-excel`, { responseType: 'blob' }),

  // Nhật ký kho (Stock Movements)
  getStockMovements: (params) => api.get('/stock-movements', { params }),

  // Trả hàng nhập (Purchase Returns)
  getPurchaseReturns: (params) => api.get('/purchase-returns', { params }),
  getPurchaseReturnById: (id) => api.get(`/purchase-returns/${id}`),
  createPurchaseReturn: (data) => api.post('/purchase-returns', data),
  updateRefundStatus: (id, payload) => api.patch(`/purchase-returns/${id}/refund-status`, payload),
  downloadReturnExcel: (id) => api.get(`/purchase-returns/${id}/download-excel`, { responseType: 'blob' }),

  // Cảnh báo tồn kho & Sắp hết hàng (Stock Alerts)
  getLowStockItems: (params) => api.get('/stock-alerts', { params }),
  updateCostPrice: (id, costPrice) => api.patch(`/stock-alerts/${id}/cost-price`, { costPrice }),

  // Tất cả Đơn & Phiếu Kho (Master Documents)
  getStockDocuments: (params) => api.get('/stock-documents', { params }),
};
