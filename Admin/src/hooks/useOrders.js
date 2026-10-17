import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import { toast } from '@/providers/ToastProvider';

export const ORDER_KEYS = {
  all: ['admin-orders'],
  lists: () => [...ORDER_KEYS.all, 'list'],
  list: (params) => [...ORDER_KEYS.lists(), params],
  details: () => [...ORDER_KEYS.all, 'detail'],
  detail: (id) => [...ORDER_KEYS.details(), id],
};

export const useOrders = (params = {}) => {
  return useQuery({
    queryKey: ORDER_KEYS.list(params),
    queryFn: async () => {
      const res = await orderService.getAllOrders(params);
      return res; // { success: true, data: [...], pagination: { ... } }
    },
    placeholderData: (prev) => prev,
  });
};

export const useOrderDetail = (id) => {
  return useQuery({
    queryKey: ORDER_KEYS.detail(id),
    queryFn: async () => {
      const res = await orderService.getOrderById(id);
      return res?.data?.order || res?.data || res;
    },
    enabled: Boolean(id),
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }) =>
      orderService.updateStatus(id, { status, note }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all });
      toast.success(res?.message || 'Cập nhật trạng thái đơn hàng thành công');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng');
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) =>
      orderService.cancelOrder(id, { reason }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all });
      toast.success(res?.message || 'Đã hủy đơn hàng thành công');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể hủy đơn hàng');
    },
  });
};
