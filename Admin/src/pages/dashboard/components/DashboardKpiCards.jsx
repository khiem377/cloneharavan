import { Link } from 'react-router-dom';
import {
  ArrowUpRightIcon,
  ArrowDownRightIcon,
} from '@/components/ui/Icons';
import {
  KpiRevenueSignatureIcon,
  KpiOrdersSignatureIcon,
  KpiStockSignatureIcon,
  KpiCustomersSignatureIcon,
} from '@/components/ui/SignatureIcons';

function KpiCard({ label, value, sub, growth, to, icon: Icon, badgeBg, iconColor }) {
  const isUp = (growth ?? 0) >= 0;

  const content = (
    <div className="border border-border bg-card rounded-[6px] p-4 flex flex-col justify-between hover:border-foreground/30 transition-all duration-150 cursor-pointer active:scale-[0.99] group shadow-2xs">
      {/* Top Header: Label & Trend Badge + Signature Icon */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-mono truncate">
            {label}
          </span>
          {growth !== undefined && (
            <span
              className={`inline-flex items-center gap-0.5 text-[11px] font-bold font-mono px-1.5 py-0.5 rounded-[4px] border shrink-0 w-fit ${
                isUp
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
              }`}
            >
              {isUp ? <ArrowUpRightIcon className="size-3" /> : <ArrowDownRightIcon className="size-3" />}
              {Math.abs(growth)}%
            </span>
          )}
        </div>

        {/* Squircle Signature Icon Badge */}
        {Icon && (
          <div
            className={`w-10 h-10 rounded-[6px] flex items-center justify-center shrink-0 border border-current/10 ${badgeBg} ${iconColor} transition-transform duration-200 group-hover:scale-105`}
          >
            <Icon size={24} />
          </div>
        )}
      </div>

      {/* Primary Metric Number */}
      <div className="my-2.5">
        <div className="text-2xl lg:text-[26px] font-bold text-foreground tracking-tight font-mono tabular-nums leading-none">
          {value}
        </div>
      </div>

      {/* Bottom Subtitle / Contextual Pipeline Info */}
      <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="truncate">{sub}</span>
        <span className="text-[10px] font-mono text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
          Chi tiết →
        </span>
      </div>
    </div>
  );

  return to ? <Link to={to} className="block">{content}</Link> : content;
}

function KpiCardSkeleton() {
  return <div className="animate-pulse bg-muted rounded-[6px] h-28 border border-border" />;
}

export default function DashboardKpiCards({ stats = {}, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString('vi-VN') + ' ₫';
  };

  const pendingCount = stats.ordersByStatus?.pending || 0;
  const shippingCount = stats.ordersByStatus?.shipping || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Revenue */}
      <KpiCard
        label="Doanh thu hệ thống"
        value={formatCurrency(stats.totalRevenue)}
        sub={`Trong kỳ: ${formatCurrency(stats.periodRevenue)}`}
        growth={stats.revenueGrowth}
        to="/orders"
        icon={KpiRevenueSignatureIcon}
        badgeBg="bg-slate-100 dark:bg-slate-800"
        iconColor="text-slate-900 dark:text-slate-100"
      />

      {/* 2. Orders Pipeline */}
      <KpiCard
        label="Đơn hàng"
        value={`${stats.totalOrders || 0} đơn`}
        sub={`${pendingCount} chờ duyệt · ${shippingCount} đang giao`}
        growth={stats.ordersGrowth}
        to="/orders"
        icon={KpiOrdersSignatureIcon}
        badgeBg="bg-slate-100 dark:bg-slate-800"
        iconColor="text-slate-900 dark:text-slate-100"
      />

      {/* 3. Catalog & Inventory */}
      <KpiCard
        label="Tồn kho & Sản phẩm"
        value={`${stats.totalProducts || 0} sản phẩm`}
        sub={`${stats.publishedProducts || 0} sẵn bán · ${stats.lowStockProducts || 0} cảnh báo`}
        growth={stats.productGrowth}
        to="/products"
        icon={KpiStockSignatureIcon}
        badgeBg="bg-slate-100 dark:bg-slate-800"
        iconColor="text-slate-900 dark:text-slate-100"
      />

      {/* 4. Customer Base */}
      <KpiCard
        label="Khách hàng"
        value={`${stats.totalCustomers || 0} khách`}
        sub={`${stats.newCustomers || 0} mới trong kỳ`}
        growth={stats.customerGrowth}
        to="/customers"
        icon={KpiCustomersSignatureIcon}
        badgeBg="bg-slate-100 dark:bg-slate-800"
        iconColor="text-slate-900 dark:text-slate-100"
      />
    </div>
  );
}
