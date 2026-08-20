import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { promotionService } from '@/services/promotion.service';

export const PROMOTIONS_KEY = ['promotions'];

export const usePromotions = (params) =>
  useQuery({
    queryKey: [...PROMOTIONS_KEY, params],
    queryFn: () => promotionService.getAll(params).then((r) => r.data),
    staleTime: 30_000,
  });

export const usePromotion = (id) =>
  useQuery({
    queryKey: [...PROMOTIONS_KEY, id],
    queryFn: () => promotionService.getById(id).then((r) => r.data.data),
    enabled: !!id,
    staleTime: 30_000,
  });

export const useCreatePromotion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => promotionService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROMOTIONS_KEY }),
  });
};

export const useUpdatePromotion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => promotionService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROMOTIONS_KEY }),
  });
};

export const useTogglePromotionStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }) => promotionService.toggleStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROMOTIONS_KEY }),
  });
};

export const useDeletePromotion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => promotionService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROMOTIONS_KEY }),
  });
};

export const useDeleteBulkPromotions = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids) => promotionService.removeBulk(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROMOTIONS_KEY }),
  });
};
