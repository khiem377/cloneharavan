import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuService } from '@/services/menu.service';
import { toast } from '@/providers/ToastProvider';

const KEYS = {
  all: ['menus'],
  detail: (id) => ['menus', id],
};

export function useMenus() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn: menuService.getAll,
  });
}

export function useMenu(id) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => menuService.getById(id),
    enabled: !!id,
  });
}

export function useCreateMenu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: menuService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      toast.success('Đã tạo menu mới');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Lỗi tạo menu'),
  });
}

export function useUpdateMenu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => menuService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      toast.success('Đã lưu menu');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Lỗi lưu menu'),
  });
}

export function useDeleteMenu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: menuService.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      toast.success('Đã xoá menu');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Lỗi xoá menu'),
  });
}

export function useDuplicateMenu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: menuService.duplicate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      toast.success('Đã nhân bản menu');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Lỗi nhân bản menu'),
  });
}
