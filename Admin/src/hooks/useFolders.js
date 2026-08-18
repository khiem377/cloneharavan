import { useQuery } from '@tanstack/react-query';
import { folderService } from '@/services/folder.service';

// Cache vĩnh viễn trong session, invalidate chỉ khi tạo/xóa folder
export const FOLDERS_KEY = ['folders'];

export const useFolders = () =>
  useQuery({
    queryKey: FOLDERS_KEY,
    queryFn: () => folderService.getTree().then((r) => r.data.data.folders),
    staleTime: 5 * 60 * 1000, // 5 phút
  });
