import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandService } from '@/services/brand.service';

export const BRANDS_KEY = ['brands'];

export const useBrands = (params) =>
  useQuery({
    queryKey: [...BRANDS_KEY, params],
    queryFn: () => brandService.getAll(params).then((r) => r.data.data),
    staleTime: 30_000,
  });

export const useAllBrands = () =>
  useQuery({
    queryKey: [...BRANDS_KEY, 'all'],
    queryFn: () => brandService.getAll({ all: 'true', limit: 1000 }).then((r) => r.data.data),
    staleTime: 10 * 60 * 1000, // 10 phút cache
  });

export const useCreateBrand = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => brandService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: BRANDS_KEY }),
  });
};

export const useUpdateBrand = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => brandService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: BRANDS_KEY }),
  });
};

export const useToggleBrandStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }) => brandService.toggleStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: BRANDS_KEY }),
  });
};

export const useDeleteBrand = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => brandService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: BRANDS_KEY }),
  });
};

export const useDeleteBulkBrands = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids) => brandService.removeBulk(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: BRANDS_KEY }),
  });
};
