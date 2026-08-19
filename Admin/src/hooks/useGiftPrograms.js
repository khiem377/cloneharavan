import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { giftProgramService } from '@/services/gift-program.service';

export const GIFT_PROGRAMS_KEY = ['gift-programs'];

export const useGiftPrograms = (params) =>
  useQuery({
    queryKey: [...GIFT_PROGRAMS_KEY, params],
    queryFn: () => giftProgramService.getAll(params).then((r) => r.data),
    staleTime: 30_000,
  });

export const useGiftProgram = (id) =>
  useQuery({
    queryKey: [...GIFT_PROGRAMS_KEY, id],
    queryFn: () => giftProgramService.getById(id).then((r) => r.data.data),
    enabled: !!id,
    staleTime: 30_000,
  });

export const useCreateGiftProgram = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => giftProgramService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: GIFT_PROGRAMS_KEY }),
  });
};

export const useUpdateGiftProgram = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => giftProgramService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: GIFT_PROGRAMS_KEY }),
  });
};

export const useToggleGiftProgramStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }) => giftProgramService.toggleStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: GIFT_PROGRAMS_KEY }),
  });
};

export const useDeleteGiftProgram = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => giftProgramService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: GIFT_PROGRAMS_KEY }),
  });
};

export const useDeleteBulkGiftPrograms = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids) => giftProgramService.removeBulk(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: GIFT_PROGRAMS_KEY }),
  });
};
