import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/product.service';

export const PRODUCTS_KEY = ['products'];

export const useProducts = (params) =>
  useQuery({
    queryKey: [...PRODUCTS_KEY, params],
    queryFn: () => productService.getAll(params).then((r) => r.data),
    staleTime: 30_000,
  });

export const useProduct = (id) =>
  useQuery({
    queryKey: [...PRODUCTS_KEY, id],
    queryFn: () => productService.getById(id).then((r) => r.data.data),
    enabled: !!id,
    staleTime: 30_000,
  });

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => productService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => productService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
};

export const useToggleProductStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }) => productService.toggleStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => productService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
};

export const useDeleteBulkProducts = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids) => productService.removeBulk(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
};
