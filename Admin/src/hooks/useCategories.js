import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/category.service';

export const CATEGORIES_KEY = ['categories'];

export const useCategories = (params) =>
  useQuery({
    queryKey: [...CATEGORIES_KEY, params],
    queryFn: () => categoryService.getAll(params).then((r) => r.data.data),
    staleTime: 30_000,
  });

// Query lấy TOÀN BỘ danh mục cho các Dropdown/Select với staleTime 10 phút
export const useAllCategoriesSelect = (tree = false) =>
  useQuery({
    queryKey: [...CATEGORIES_KEY, 'select-all', tree],
    queryFn: () => categoryService.getAll({ limit: 1000, tree: tree ? 'true' : 'false' }).then((r) => r.data.data || []),
    staleTime: 10 * 60 * 1000, // 10 phút cache
  });

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => categoryService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => categoryService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
};

export const useToggleCategoryStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }) => categoryService.toggleStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => categoryService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
};

export const useDeleteBulkCategories = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids) => categoryService.removeBulk(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
};
