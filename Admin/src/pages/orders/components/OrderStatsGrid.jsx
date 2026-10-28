import React from 'react';
import { Package, Clock, CheckCircle2, Truck, Check, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function OrderStatsGrid({ orders = [], stats: apiStats, totalCount }) {
  const stats = React.useMemo(() => {
    if (apiStats && typeof apiStats === 'object' && apiStats.total !== undefined) {
      return {
        total: apiStats.total ?? totalCount ?? orders.length,
        pending: apiStats.pending ?? 0,
        confirmed: apiStats.confirmed ?? 0,
        shipping: apiStats.shipping ?? 0,
        delivered: apiStats.delivered ?? 0,
        cancelled: apiStats.cancelled ?? 0,
        totalRevenue: apiStats.totalRevenue ?? 0,
      };
    }

    let pending = 0;
    let confirmed = 0;
    let shipping = 0;
    let delivered = 0;
    let cancelled = 0;
    let totalRevenue = 0;

    orders.forEach((o) => {
      const st = (o.orderStatus || '').toUpperCase();
      if (st === 'PENDING') pending++;
      else if (st === 'CONFIRMED') confirmed++;
      else if (st === 'SHIPPING') shipping++;
      else if (st === 'DELIVERED') {
        delivered++;
        totalRevenue += Number(o.pricing?.totalAmount || 0);
      } else if (st === 'CANCELLED' || st === 'RETURNED') cancelled++;
    });

    return {
      total: totalCount !== undefined ? totalCount : orders.length,
      pending,
      confirmed,
      shipping,
      delivered,
      cancelled,
      totalRevenue,
    };
  }, [orders, apiStats, totalCount]);

  const ITEMS = [
    {
      label: 'Tổng đơn hàng',
      value: stats.total,
      sub: 'Tất cả đơn đặt',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Chờ xác nhận',
      value: stats.pending,
      sub: 'Đang giữ chỗ tồn kho',
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Đã xác nhận',
      value: stats.confirmed,
      sub: 'Chờ xuất kho giao đi',
      icon: CheckCircle2,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 text-indigo-700',
    },
    {
      label: 'Đang giao hàng',
      value: stats.shipping,
      sub: 'Đã trừ tồn kho vật lý',
      icon: Truck,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50 text-cyan-700',
    },
    {
      label: 'Giao thành công',
      value: stats.delivered,
      sub: 'Hoàn tất & thu tiền',
      icon: Check,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Đã hủy / Bom hàng',
      value: stats.cancelled,
      sub: 'Đã giải phóng/hoàn kho',
      icon: XCircle,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50 text-rose-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {ITEMS.map((item) => (
        <Card
          key={item.label}
          className="border-border bg-card rounded-[6px] p-3 sm:p-4 flex flex-col justify-between gap-1.5 shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-mono truncate">
              {item.label}
            </span>
            <div className={`size-6 sm:size-7 rounded-[4px] flex items-center justify-center shrink-0 ${item.bgColor}`}>
              <item.icon className="size-3.5 sm:size-4" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-foreground">
              {item.value.toLocaleString('vi-VN')}
            </span>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate mt-0.5">
              {item.sub}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
