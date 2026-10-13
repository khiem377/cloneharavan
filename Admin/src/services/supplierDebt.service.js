import api from '@/lib/axios';

export const supplierDebtService = {
  getSupplierDebts: (supplierId, params) =>
    api.get(`/suppliers/${supplierId}/debts`, { params }),

  createManualDebt: (supplierId, data) =>
    api.post(`/suppliers/${supplierId}/debts`, data),

  payDebt: (supplierId, debtId, data) =>
    api.post(`/suppliers/${supplierId}/debts/${debtId}/pay`, data),

  offsetDebts: (supplierId) =>
    api.post(`/suppliers/${supplierId}/debts/offset`),

  getDebtHistory: (supplierId, params) =>
    api.get(`/suppliers/${supplierId}/debt-history`, { params }),

  syncAllDebts: () =>
    api.post('/suppliers/sync-debts'),
};

export default supplierDebtService;
