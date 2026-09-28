import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '@/services/inventory.service';

const PO_KEY = ['purchase-orders'];
const EXPORT_KEY = ['stock-exports'];
const AUDIT_KEY = ['stock-audits'];
const MOVEMENTS_KEY = ['stock-movements'];

// Purchase Orders
export const usePurchaseOrders = (params) =>
  useQuery({
    queryKey: [...PO_KEY, params],
    queryFn: () => inventoryService.getPurchaseOrders(params).then((r) => r.data),
    staleTime: 5_000,
  });

export const useCreatePurchaseOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => inventoryService.createPurchaseOrder(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PO_KEY });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdatePurchaseOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => inventoryService.updatePurchaseOrderStatus(id, payload.status ? payload : payload.payload || payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PO_KEY });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// Stock Exports
export const useStockExports = (params) =>
  useQuery({
    queryKey: [...EXPORT_KEY, params],
    queryFn: () => inventoryService.getStockExports(params).then((r) => r.data),
    staleTime: 5_000,
  });

export const useCreateStockExport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => inventoryService.createStockExport(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EXPORT_KEY });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// Stock Audits
export const useStockAudits = (params) =>
  useQuery({
    queryKey: [...AUDIT_KEY, params],
    queryFn: () => inventoryService.getStockAudits(params).then((r) => r.data),
    staleTime: 5_000,
  });

export const useCreateStockAudit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => inventoryService.createStockAudit(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AUDIT_KEY });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// Stock Movements Log
export const useStockMovements = (params) =>
  useQuery({
    queryKey: [...MOVEMENTS_KEY, params],
    queryFn: () => inventoryService.getStockMovements(params).then((r) => r.data),
    staleTime: 5_000,
  });

// Purchase Returns (Trả Hàng Nhập)
const RETURN_KEY = ['purchase-returns'];

export const usePurchaseReturns = (params) =>
  useQuery({
    queryKey: [...RETURN_KEY, params],
    queryFn: () => inventoryService.getPurchaseReturns(params).then((r) => r.data),
    staleTime: 5_000,
  });

export const useCreatePurchaseReturn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => inventoryService.createPurchaseReturn(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RETURN_KEY });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: MOVEMENTS_KEY });
    },
  });
};

// Stock Alerts & Low Stock (Cảnh Báo Tồn Kho)
const ALERTS_KEY = ['stock-alerts'];

export const useStockAlerts = (params) =>
  useQuery({
    queryKey: [...ALERTS_KEY, params],
    queryFn: () => inventoryService.getLowStockItems(params).then((r) => r.data),
    staleTime: 5_000,
  });

// Master Stock Documents List (Quản Lý Tất Cả Đơn & Phiếu Kho)
const DOCUMENTS_KEY = ['stock-documents'];

export const useStockDocuments = (params) =>
  useQuery({
    queryKey: [...DOCUMENTS_KEY, params],
    queryFn: () => inventoryService.getStockDocuments(params).then((r) => r.data),
    staleTime: 5_000,
  });
