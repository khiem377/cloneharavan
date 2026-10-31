import React from 'react';
import { Bell, Package, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function NotificationStats({
  notifications = [],
  stats = null,
  totalItems = 0,
  unreadCount = 0,
}) {
  const total = stats?.totalAll ?? (totalItems > 0 ? totalItems : notifications.length);
  const unread = stats?.unreadCount ?? unreadCount;
  const orderCount =
    stats?.orderCount ??
    notifications.filter(
      (n) => n.type === 'ORDER_NEW' || n.type === 'ORDER_CANCELLED' || n.type === 'ORDER_STATUS'
    ).length;
  const alertCount =
    stats?.alertCount ?? notifications.filter((n) => n.type === 'STOCK_LOW').length;

  const STATS = [
    {
      label: 'Tổng thông báo',
      value: total,
      icon: Bell,
      color: 'text-slate-600 dark:text-slate-300',
      bg: 'bg-slate-100 dark:bg-slate-800',
    },
    {
      label: 'Chưa đọc',
      value: unread,
      icon: CheckCircle2,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
    },
    {
      label: 'Đơn hàng',
      value: orderCount,
      icon: Package,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
    },
    {
      label: 'Cảnh báo kho',
      value: alertCount,
      icon: AlertTriangle,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
      {STATS.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="rounded-[6px] border border-border bg-card p-3 sm:p-4 flex items-center justify-between shadow-2xs"
          >
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider font-mono">
                {stat.label}
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground font-mono tabular-nums mt-0.5">
                {stat.value}
              </h3>
            </div>
            <div className={`size-9 rounded-[6px] flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
              <Icon size={18} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
