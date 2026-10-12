import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { comboService } from '@/services/combo.service';

export const COMBOS_KEY = ['combos'];

export const useCombos = (params) =>
  useQuery({
    queryKey: [...COMBOS_KEY, params],
    queryFn: () => comboService.getAll(params).then((r) => r.data),
    staleTime: 30_000,
  });

export const useCombo = (id) =>
  useQuery({
    queryKey: [...COMBOS_KEY, id],
    queryFn: () => comboService.getById(id).then((r) => r.data.data),
    enabled: !!id,
    staleTime: 30_000,
  });

export const useCreateCombo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => comboService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: COMBOS_KEY }),
  });
};

export const useUpdateCombo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => comboService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: COMBOS_KEY }),
  });
};

export const useToggleComboStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => comboService.toggleStatus(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: COMBOS_KEY }),
  });
};

export const useDeleteCombo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => comboService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: COMBOS_KEY }),
  });
};

export const useAiSuggestComboPricing = () => {
  return useMutation({
    mutationFn: (data) => comboService.aiSuggestPricing(data).then((r) => r.data.data),
  });
};

export const useAiSuggestBundles = () => {
  return useMutation({
    mutationFn: () => comboService.aiSuggestBundles().then((r) => r.data.data),
  });
};
