import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import { getSocket } from '@/services/socket.service';
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

/**
 * Hook lấy số lượng đơn hàng cần duyệt (PENDING) và cập nhật Realtime qua WebSocket
 */
export const usePendingOrdersCount = () => {
  const queryClient = useQueryClient();
  const queryKey = ['admin-orders', 'pending-count'];

  const { data: pendingCount = 0, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      return await orderService.getPendingCount();
    },
    staleTime: 1000 * 60 * 5, // 5 phút cache
  });

  useEffect(() => {
    let socket = null;
    try {
      socket = getSocket();
    } catch (e) {
      console.warn('[usePendingOrdersCount] Lỗi khởi tạo socket:', e);
      return;
    }

    if (!socket) return;

    const handlePendingCount = (payload) => {
      if (typeof payload?.pendingCount === 'number') {
        queryClient.setQueryData(queryKey, payload.pendingCount);
      }

      // Tự động làm mới danh sách đơn hàng cho các trang đang mở
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.lists() });

      // Nếu có đơn mới tạo, phát thông báo nổi bật cho Admin
      if (payload?.type === 'ORDER_CREATED' && payload?.order) {
        const amount = payload.order.totalAmount
          ? ` (${Number(payload.order.totalAmount).toLocaleString('vi-VN')}₫)`
          : '';
        toast.info(`🔔 Đơn hàng mới #${payload.order.orderCode || ''}${amount} đang chờ bạn duyệt!`, {
          duration: 6000,
        });
      }
    };

    socket.on('order:pending_count', handlePendingCount);

    return () => {
      socket.off('order:pending_count', handlePendingCount);
    };
  }, [queryClient]);

  return {
    pendingCount: typeof pendingCount === 'number' ? pendingCount : 0,
    isLoading,
  };
};


