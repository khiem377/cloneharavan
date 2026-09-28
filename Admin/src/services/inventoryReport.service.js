import api from '@/lib/axios';

export const inventoryReportService = {
  getBalanceReport: async (params) => {
    const res = await api.get('/inventory-reports/balance-report', { params });
    return res.data;
  },

  downloadExcel: async (params) => {
    const response = await api.get('/inventory-reports/export-excel', {
      params,
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bang-Tong-Hop-Nhap-Xuat-Ton_${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
