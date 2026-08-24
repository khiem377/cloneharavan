import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';

export const DASHBOARD_KEY = ['dashboard'];

export const useDashboardOverview = () =>
  useQuery({
    queryKey: [...DASHBOARD_KEY, 'overview'],
    queryFn: () => dashboardService.getOverview().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000, // 5 phút Caching RAM siêu mượt
    refetchOnWindowFocus: false,
  });
