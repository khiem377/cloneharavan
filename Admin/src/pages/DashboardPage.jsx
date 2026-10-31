import { useState } from 'react';
import { useDashboardOverview, useDashboardInventoryStats } from '@/hooks/useDashboard';
import { toast } from '@/providers/ToastProvider';

import DashboardHeader from './dashboard/components/DashboardHeader';
import DashboardKpiCards from './dashboard/components/DashboardKpiCards';
import DashboardRevenueChart from './dashboard/components/DashboardRevenueChart';
import DashboardRecentOrders from './dashboard/components/DashboardRecentOrders';
import DashboardStockDonut from './dashboard/components/DashboardStockDonut';
import DashboardLowStockAlerts from './dashboard/components/DashboardLowStockAlerts';
import DashboardTopProducts from './dashboard/components/DashboardTopProducts';
import DashboardInventoryMovement from './dashboard/components/DashboardInventoryMovement';

export default function DashboardPage() {
  const [period, setPeriod] = useState('30days');
  const [invRange, setInvRange] = useState('6months');

  const { data, isLoading, isFetching, refetch } = useDashboardOverview(period);
  const { data: invData } = useDashboardInventoryStats(invRange);

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success('Đã cập nhật số liệu mới nhất');
    } catch {
      toast.error('Không thể làm mới dữ liệu. Thử lại sau.');
    }
  };

  const {
    stats = {},
    topProducts = [],
    revenueGrowthTrend = [],
    recentOrders = [],
    userGrowthTrend = [],
    productGrowthTrend = [],
  } = data || {};

  return (
    <div className="space-y-5 max-w-full overflow-x-hidden pb-12 antialiased">
      {/* 1. Header & Controls */}
      <DashboardHeader
        period={period}
        setPeriod={setPeriod}
        onRefresh={handleRefresh}
        isFetching={isFetching}
      />

      {/* 2. Executive 4 KPI Cards (Revenue, Orders, Inventory, Customers) */}
      <DashboardKpiCards stats={stats} isLoading={isLoading || isFetching} />

      {/* 3. Golden Ratio Operational Grid (8 cols Left / 4 cols Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (8 / 12) — Financial Trends & Live Order Pipeline */}
        <div className="lg:col-span-8 space-y-5">
          {/* Revenue & Growth Area Chart */}
          <DashboardRevenueChart
            revenueGrowthTrend={revenueGrowthTrend}
            userGrowthTrend={userGrowthTrend}
            productGrowthTrend={productGrowthTrend}
          />

          {/* Recent Orders Processing Table */}
          <DashboardRecentOrders recentOrders={recentOrders} />

          {/* Warehouse Movement Flow */}
          <DashboardInventoryMovement
            invMonthlyData={invData?.monthlyData || []}
            invRange={invRange}
            setInvRange={setInvRange}
          />
        </div>

        {/* Right Column (4 / 12) — Actionable Pipeline, Stock Health & Top Items */}
        <div className="lg:col-span-4 space-y-5">
          {/* Urgent Low Stock Alerts */}
          <DashboardLowStockAlerts
            lowStockVariants={invData?.lowStockVariants || []}
          />

          {/* Stock Allocation SVG Donut */}
          <DashboardStockDonut stats={stats} />

          {/* Top Products */}
          <DashboardTopProducts topProducts={topProducts} />
        </div>
      </div>
    </div>
  );
}
