import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';

export const DASHBOARD_KEY = ['dashboard'];

export const useDashboardOverview = (period = '30days') =>
  useQuery({
    queryKey: [...DASHBOARD_KEY, 'overview', period],
    queryFn: () => dashboardService.getOverview(period).then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useDashboardInventoryStats = (range = '6months') =>
  useQuery({
    queryKey: [...DASHBOARD_KEY, 'inventory-stats', range],
    queryFn: () => dashboardService.getInventoryStats(range).then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
