import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bannerService } from '@/services/banner.service';

export const BANNERS_KEY = ['banners'];

export const useBanners = () =>
  useQuery({
    queryKey: BANNERS_KEY,
    queryFn: () => bannerService.getAll().then((r) => r.data.data.banners ?? []),
    staleTime: 30_000,
  });

export const useCreateBanner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => bannerService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: BANNERS_KEY }),
  });
};

export const useUpdateBanner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => bannerService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: BANNERS_KEY }),
  });
};

export const useDeleteBanner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => bannerService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: BANNERS_KEY }),
  });
};

export const useDeleteBulkBanners = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids) => bannerService.removeBulk(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: BANNERS_KEY }),
  });
};
