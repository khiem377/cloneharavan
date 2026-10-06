import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { toast } from '@/providers/ToastProvider';

export const USER_KEYS = {
  all: ['users'],
  lists: () => [...USER_KEYS.all, 'list'],
  list: (params) => [...USER_KEYS.lists(), params],
  details: () => [...USER_KEYS.all, 'detail'],
  detail: (id) => [...USER_KEYS.details(), id],
};

export const useUsers = (params = {}) => {
  return useQuery({
    queryKey: USER_KEYS.list(params),
    queryFn: () => userService.getUsers(params),
    keepPreviousData: true,
  });
};

export const useUserDetail = (id) => {
  return useQuery({
    queryKey: USER_KEYS.detail(id),
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }) => userService.toggleStatus(id, isActive),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
      toast.success(res?.message || 'Cập nhật trạng thái tài khoản thành công');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể cập nhật trạng thái tài khoản');
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role, roleId, customPermissions }) =>
      userService.updateRole(id, { role, roleId, customPermissions }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
      toast.success(res?.message || 'Cập nhật vai trò thành công');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể cập nhật vai trò');
    },
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => userService.createStaff(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
      toast.success(res?.message || 'Tạo nhân viên thành công');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể tạo nhân viên');
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => userService.deleteUser(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
      toast.success(res?.message || 'Xóa tài khoản thành công');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể xóa tài khoản');
    },
  });
};

export const useUserStats = (userType = 'customer') => {
  return useQuery({
    queryKey: [...USER_KEYS.all, 'stats', userType],
    queryFn: () => userService.getUserStats(userType),
    staleTime: 30_000,
  });
};

export const useBulkToggleUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userIds, isActive }) => userService.bulkToggleStatus({ userIds, isActive }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
      toast.success(res?.message || 'Cập nhật trạng thái hàng loạt thành công');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể cập nhật trạng thái hàng loạt');
    },
  });
};

export const useResetPassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newPassword }) => userService.resetPassword({ id, newPassword }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
      toast.success(res?.message || 'Đặt lại mật khẩu thành công');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể đặt lại mật khẩu');
    },
  });
};
