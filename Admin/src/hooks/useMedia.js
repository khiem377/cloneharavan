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

// Lấy danh sách nơi sử dụng của 1 media item
export const useMediaUsage = (mediaId) =>
  useQuery({
    queryKey: ['media', 'usage', mediaId],
    queryFn: () => mediaService.getUsage(mediaId).then((r) => r.data.data.usages),
    enabled: !!mediaId,
    staleTime: 15 * 1000,
  });

// Bulk-fetch media objects theo IDs (để lấy folder info trong form)
export const useMediaByIds = (ids = []) =>
  useQuery({
    queryKey: ['media', 'by-ids', ids.join(',')],
    queryFn: () => mediaService.getByIds(ids).then((r) => r.data.data.media),
    enabled: ids.length > 0,
    staleTime: 60 * 1000,
    select: (data) => {
      // Trả về Map<id, media> để tra cứu nhanh O(1)
      const map = {};
      data.forEach((m) => { map[m._id] = m; });
      return map;
    },
  });

// Ảnh không được dùng ở bất kỳ đâu (dọn kho)
export const useUnusedMedia = (params = {}) =>
  useQuery({
    queryKey: ['media', 'unused', params],
    queryFn: () => mediaService.getUnused(params).then((r) => r.data.data),
    staleTime: 60 * 1000,
  });

// Thống kê dung lượng kho ảnh
export const useMediaStats = () =>
  useQuery({
    queryKey: ['media', 'stats'],
    queryFn: () => mediaService.stats().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

