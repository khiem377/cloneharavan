import React from 'react';
import { Card } from '@/components/ui/card';
import {
  OrderTotalBoxIcon,
  OrderPendingClockIcon,
  OrderConfirmedStampIcon,
  OrderShippingTruckIcon,
  OrderDeliveredSuccessIcon,
  OrderCancelledIcon,
} from './OrderCustomIcons';

export default function OrderStatsGrid({
  orders = [],
  stats: apiStats,
  totalCount,
  activeStatus = 'ALL',
  onSelectStatus,
}) {
  const stats = React.useMemo(() => {
    if (apiStats && typeof apiStats === 'object' && apiStats.total !== undefined) {
      return {
        total: apiStats.total ?? totalCount ?? orders.length,
        pending: apiStats.pending ?? 0,
        confirmed: apiStats.confirmed ?? 0,
        shipping: apiStats.shipping ?? 0,
        delivered: apiStats.delivered ?? 0,
        cancelled: apiStats.cancelled ?? 0,
      };
    }

    let pending = 0;
    let confirmed = 0;
    let shipping = 0;
    let delivered = 0;
    let cancelled = 0;

    orders.forEach((o) => {
      const st = (o.orderStatus || '').toUpperCase();
      if (st === 'PENDING') pending++;
      else if (st === 'CONFIRMED') confirmed++;
      else if (st === 'SHIPPING') shipping++;
      else if (st === 'DELIVERED') delivered++;
      else if (st === 'CANCELLED' || st === 'RETURNED') cancelled++;
    });

    return {
      total: totalCount !== undefined ? totalCount : orders.length,
      pending,
      confirmed,
      shipping,
      delivered,
      cancelled,
    };
  }, [orders, apiStats, totalCount]);

  const METRICS = [
    {
      key: 'ALL',
      label: 'Tổng đơn hàng',
      value: stats.total,
      sub: 'Tất cả đơn đặt',
      Icon: OrderTotalBoxIcon,
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      activeRing: 'border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/30',
    },
    {
      key: 'PENDING',
      label: 'Chờ xác nhận',
      value: stats.pending,
      sub: 'Đang giữ chỗ tồn kho',
      Icon: OrderPendingClockIcon,
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      activeRing: 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30',
    },
    {
      key: 'CONFIRMED',
      label: 'Đã xác nhận',
      value: stats.confirmed,
      sub: 'Chờ xuất kho giao đi',
      Icon: OrderConfirmedStampIcon,
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      activeRing: 'border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500/30',
    },
    {
      key: 'SHIPPING',
      label: 'Đang giao hàng',
      value: stats.shipping,
      sub: 'Đã trừ tồn kho vật lý',
      Icon: OrderShippingTruckIcon,
      badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      activeRing: 'border-cyan-500 bg-cyan-500/5 ring-1 ring-cyan-500/30',
    },
    {
      key: 'DELIVERED',
      label: 'Giao thành công',
      value: stats.delivered,
      sub: 'Hoàn tất & thu tiền',
      Icon: OrderDeliveredSuccessIcon,
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      activeRing: 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/30',
    },
    {
      key: 'CANCELLED',
      label: 'Đã hủy / Bom',
      value: stats.cancelled,
      sub: 'Đã giải phóng kho',
      Icon: OrderCancelledIcon,
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      activeRing: 'border-rose-500 bg-rose-500/5 ring-1 ring-rose-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {METRICS.map((item) => {
        const isActive = activeStatus === item.key;
        const IconComponent = item.Icon;

        return (
          <Card
            key={item.key}
            onClick={() => onSelectStatus && onSelectStatus(item.key)}
            className={`border rounded-[6px] p-3 sm:p-3.5 flex flex-col justify-between gap-2 shadow-none cursor-pointer transition-all duration-150 select-none active:scale-[0.98] ${
              isActive
                ? item.activeRing
                : 'border-border bg-card hover:bg-muted/40 hover:border-border/80'
            }`}
          >
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-mono truncate">
                {item.label}
              </span>
              <div
                className={`size-7 rounded-[5px] border flex items-center justify-center shrink-0 ${item.badgeColor}`}
              >
                <IconComponent size={16} />
              </div>
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-foreground tracking-tight">
                {item.value.toLocaleString('vi-VN')}
              </div>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate mt-0.5 font-sans">
                {item.sub}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
