import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import roleService from '@/services/role.service';
import { toast } from '@/providers/ToastProvider';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const ROLES_KEY = ['roles'];
export const PERMISSIONS_KEY = ['roles', 'permissions'];

// ─── Queries ──────────────────────────────────────────────────────────────────
export function useRoles() {
  return useQuery({
    queryKey: ROLES_KEY,
    queryFn: async () => {
      const res = await roleService.getRoles();
      return res.data || [];
    },
    staleTime: 60_000,
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: PERMISSIONS_KEY,
    queryFn: async () => {
      const res = await roleService.getPermissions();
      return res.data?.grouped || {};
    },
    staleTime: 5 * 60_000,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────
export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => roleService.createRole(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROLES_KEY });
      toast.success('Tạo vai trò thành công');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Lỗi tạo vai trò'),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => roleService.updateRole(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROLES_KEY });
      toast.success('Cập nhật vai trò thành công');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Lỗi cập nhật vai trò'),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => roleService.deleteRole(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROLES_KEY });
      toast.success('Đã xóa vai trò');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Lỗi xóa vai trò'),
  });
}

export function useSeedFullPermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => roleService.seedFullPermissions(),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ROLES_KEY });
      qc.invalidateQueries({ queryKey: PERMISSIONS_KEY });
      toast.success(res.data?.message || 'Đã khởi tạo Full Permissions thành công!');
    },
    onError: () => toast.error('Lỗi khi nâng cấp danh sách quyền & vai trò'),
  });
}
