import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplierService } from '@/services/supplier.service';

const SUPPLIERS_KEY = ['suppliers'];

export const useSuppliers = (params) =>
  useQuery({
    queryKey: [...SUPPLIERS_KEY, params],
    queryFn: () => supplierService.getAll(params).then((r) => r.data),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes globally across pages
  });

export const useCreateSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => supplierService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: SUPPLIERS_KEY }),
  });
};

export const useUpdateSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => supplierService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: SUPPLIERS_KEY }),
  });
};

export const useDeleteSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => supplierService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: SUPPLIERS_KEY }),
  });
};

export const useSupplierActivity = (supplierId, params) =>
  useQuery({
    queryKey: ['supplier-activity', supplierId, params],
    queryFn: () => supplierService.getActivity(supplierId, params).then((r) => r.data?.data || {}),
    enabled: Boolean(supplierId),
    staleTime: 15_000,
    placeholderData: (prev) => prev, // giữ dữ liệu cũ khi đổi kỳ/trang, tránh nháy layout
  });

export const useSupplierStaffOptions = () =>
  useQuery({
    queryKey: ['supplier-staff-options'],
    queryFn: () => supplierService.getStaffOptions().then((r) => r.data?.data || []),
    staleTime: 5 * 60 * 1000,
  });
