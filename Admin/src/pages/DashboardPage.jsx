import { useState } from 'react';
import { useDashboardOverview, useDashboardInventoryStats } from '@/hooks/useDashboard';
import { toast } from '@/providers/ToastProvider';

import DashboardHeader from './dashboard/components/DashboardHeader';
import DashboardShortcuts from './dashboard/components/DashboardShortcuts';
import DashboardKpiCards from './dashboard/components/DashboardKpiCards';
import DashboardSecondaryMetrics from './dashboard/components/DashboardSecondaryMetrics';
import DashboardGrowthChart from './dashboard/components/DashboardGrowthChart';
import DashboardStockDonut from './dashboard/components/DashboardStockDonut';
import DashboardInventoryMovement from './dashboard/components/DashboardInventoryMovement';
import DashboardLowStockAlerts from './dashboard/components/DashboardLowStockAlerts';
import DashboardTopProducts from './dashboard/components/DashboardTopProducts';
import DashboardRecentCustomers from './dashboard/components/DashboardRecentCustomers';
import DashboardRecentProducts from './dashboard/components/DashboardRecentProducts';
import DashboardRecentBlogPosts from './dashboard/components/DashboardRecentBlogPosts';

export default function DashboardPage() {
  const [period, setPeriod] = useState('30days');
  const [invRange, setInvRange] = useState('6months');

  const { data, isLoading, isFetching, refetch } = useDashboardOverview(period);
  const { data: invData } = useDashboardInventoryStats(invRange);

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success('Đã làm mới dữ liệu thống kê');
    } catch {
      toast.error('Không thể tải dữ liệu. Thử lại sau.');
    }
  };

  const {
    stats = {},
    topProducts = [],
    userGrowthTrend = [],
    productGrowthTrend = [],
    recentProducts = [],
    recentBlogPosts = [],
    recentCustomers = [],
  } = data || {};

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden pb-12 antialiased">
      {/* 1. Header & Global Controls */}
      <DashboardHeader
        period={period}
        setPeriod={setPeriod}
        onRefresh={handleRefresh}
        isFetching={isFetching}
      />

      {/* 2. Quick Operations Navigation */}
      <DashboardShortcuts />

      {/* 3. Executive KPI Cards */}
      <DashboardKpiCards stats={stats} isLoading={isLoading} />

      {/* 4. Secondary Operations Metrics */}
      <DashboardSecondaryMetrics stats={stats} />

      {/* 5. Growth Area Chart + Stock Allocation Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DashboardGrowthChart
          userGrowthTrend={userGrowthTrend}
          productGrowthTrend={productGrowthTrend}
        />
        <DashboardStockDonut stats={stats} />
      </div>

      {/* 6. Inventory Flow Movement + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DashboardInventoryMovement
          invMonthlyData={invData?.monthlyData || []}
          invRange={invRange}
          setInvRange={setInvRange}
        />
        <DashboardLowStockAlerts
          lowStockVariants={invData?.lowStockVariants || []}
        />
      </div>

      {/* 7. Product Performance & Customer Acquisition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DashboardTopProducts topProducts={topProducts} />
        <DashboardRecentCustomers recentCustomers={recentCustomers} />
      </div>

      {/* 8. Recent Products & Tech Blog Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DashboardRecentProducts recentProducts={recentProducts} />
        <DashboardRecentBlogPosts recentBlogPosts={recentBlogPosts} />
      </div>
    </div>
  );
}
