import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productVariantService } from '@/services/productVariant.service';

export const VARIANTS_KEY = ['product-variants'];

export const useProductVariants = (productId) =>
  useQuery({
    queryKey: [...VARIANTS_KEY, productId],
    queryFn: () => productVariantService.getByProduct(productId).then((r) => r.data.data),
    enabled: !!productId,
    staleTime: 30_000,
  });
export const useVariant = (variantId) =>
  useQuery({
    queryKey: [...VARIANTS_KEY, 'single', variantId],
    queryFn: () => productVariantService.getById(variantId).then((r) => r.data.data),
    enabled: !!variantId,
    staleTime: 30_000,
  });

export const useCreateVariant = (productId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => productVariantService.create(productId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...VARIANTS_KEY, productId] }),
  });
};

export const useBulkCreateVariants = (productId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variants) => productVariantService.bulkCreate(productId, variants),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...VARIANTS_KEY, productId] }),
  });
};

export const useUpdateVariant = (productId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => productVariantService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...VARIANTS_KEY, productId] }),
  });
};

export const useDeleteVariant = (productId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => productVariantService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...VARIANTS_KEY, productId] }),
  });
};

export const useDeleteAllVariants = (productId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => productVariantService.deleteAll(productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...VARIANTS_KEY, productId] }),
  });
};
