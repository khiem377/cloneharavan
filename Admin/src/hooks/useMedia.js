import { useQuery } from '@tanstack/react-query';
import { mediaService } from '@/services/media.service';

export const MEDIA_KEY = (params) => ['media', params];

export const useMedia = (params) =>
  useQuery({
    queryKey: MEDIA_KEY(params),
    queryFn: () => mediaService.browse(params).then((r) => r.data.data),
    staleTime: 30 * 1000,
    enabled: true,
  });

export const useMediaSearch = (params) =>
  useQuery({
    queryKey: ['media-search', params],
    queryFn: () => mediaService.search(params).then((r) => r.data.data),
    enabled: !!params?.q,
    staleTime: 30 * 1000,
  });
