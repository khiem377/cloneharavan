import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponService } from '@/services/coupon.service';

export const COUPONS_KEY = ['coupons'];

export const useCoupons = (params) =>
  useQuery({
    queryKey: [...COUPONS_KEY, params],
    queryFn: () => couponService.getAll(params).then((r) => r.data),
    staleTime: 30_000,
  });

export const useCreateCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => couponService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: COUPONS_KEY }),
  });
};

export const useUpdateCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => couponService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: COUPONS_KEY }),
  });
};

export const useToggleCouponStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }) => couponService.toggleStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: COUPONS_KEY }),
  });
};

export const useDeleteCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => couponService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: COUPONS_KEY }),
  });
};

export const useDeleteBulkCoupons = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids) => couponService.removeBulk(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: COUPONS_KEY }),
  });
};
