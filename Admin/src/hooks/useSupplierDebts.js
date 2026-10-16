import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplierDebtService } from '@/services/supplierDebt.service';

const DEBTS_KEY = ['supplier-debts'];
const HISTORY_KEY = ['supplier-debt-history'];
const SUPPLIERS_KEY = ['suppliers'];

export const useSupplierDebts = (supplierId, params) =>
  useQuery({
    queryKey: [...DEBTS_KEY, supplierId, params],
    queryFn: () =>
      supplierDebtService.getSupplierDebts(supplierId, params).then((r) => r.data?.data || {}),
    enabled: Boolean(supplierId),
    staleTime: 5_000,
  });

export const useCreateSupplierDebt = (supplierId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => supplierDebtService.createManualDebt(supplierId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...DEBTS_KEY, supplierId] });
      qc.invalidateQueries({ queryKey: [...HISTORY_KEY, supplierId] });
      qc.invalidateQueries({ queryKey: SUPPLIERS_KEY });
    },
  });
};

export const usePaySupplierDebt = (supplierId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ debtId, data }) => supplierDebtService.payDebt(supplierId, debtId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...DEBTS_KEY, supplierId] });
      qc.invalidateQueries({ queryKey: [...HISTORY_KEY, supplierId] });
      qc.invalidateQueries({ queryKey: SUPPLIERS_KEY });
    },
  });
};

export const useOffsetSupplierDebts = (supplierId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => supplierDebtService.offsetDebts(supplierId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...DEBTS_KEY, supplierId] });
      qc.invalidateQueries({ queryKey: [...HISTORY_KEY, supplierId] });
      qc.invalidateQueries({ queryKey: SUPPLIERS_KEY });
    },
  });
};

export const useSupplierDebtHistory = (supplierId, params) =>
  useQuery({
    queryKey: [...HISTORY_KEY, supplierId, params],
    queryFn: () =>
      supplierDebtService.getDebtHistory(supplierId, params).then((r) => r.data?.data || {}),
    enabled: Boolean(supplierId),
    staleTime: 5_000,
  });

export const useSyncAllSupplierDebts = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => supplierDebtService.syncAllDebts(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SUPPLIERS_KEY });
      qc.invalidateQueries({ queryKey: DEBTS_KEY });
      qc.invalidateQueries({ queryKey: HISTORY_KEY });
    },
  });
};

