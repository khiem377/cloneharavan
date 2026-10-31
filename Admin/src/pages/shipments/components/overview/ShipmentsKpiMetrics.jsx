import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ShippingBoxCustomIcon,
  ShippingCodMoneyCustomIcon,
  ShippingTruckCustomIcon,
  ShippingAlertCustomIcon,
} from '@/components/ui/Icons';

export default function ShipmentsKpiMetrics({
  totalShipments = 0,
  totalCodAmount = 0,
  totalShippingFee = 0,
  attentionCount = 0,
  successRate = 100,
  codPending = 0,
  loading = false,
}) {
  const avgFee = totalShipments > 0 ? Math.round(totalShippingFee / totalShipments) : 0;

  const cards = [
    {
      id: 'shipments',
      label: 'Tổng vận đơn',
      value: totalShipments,
      unit: 'đơn',
      subtext: `Tỷ lệ thành công: ${successRate}%`,
      icon: ShippingBoxCustomIcon,
      iconColor: 'text-sky-600 dark:text-sky-400',
      bgColor: 'bg-sky-50/60 dark:bg-sky-950/20',
      badgeColor: 'text-sky-700 bg-sky-100/70 dark:bg-sky-900/40 dark:text-sky-300',
    },
    {
      id: 'cod',
      label: 'Tiền thu hộ COD',
      value: `${totalCodAmount.toLocaleString('vi-VN')}₫`,
      subtext: `Chờ đối soát: ${codPending.toLocaleString('vi-VN')}₫`,
      icon: ShippingCodMoneyCustomIcon,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50/60 dark:bg-emerald-950/20',
      badgeColor: 'text-emerald-700 bg-emerald-100/70 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    {
      id: 'fee',
      label: 'Cước phí vận chuyển',
      value: `${totalShippingFee.toLocaleString('vi-VN')}₫`,
      subtext: `Trung bình: ${avgFee.toLocaleString('vi-VN')}₫ / đơn`,
      icon: ShippingTruckCustomIcon,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50/60 dark:bg-indigo-950/20',
      badgeColor: 'text-indigo-700 bg-indigo-100/70 dark:bg-indigo-900/40 dark:text-indigo-300',
    },
    {
      id: 'attention',
      label: 'Đơn cần xử lý gấp',
      value: attentionCount,
      unit: 'đơn',
      subtext: attentionCount > 0 ? 'Giao thất bại hoặc chờ chuyển hoàn' : 'Vận hành ổn định, không có lỗi',
      icon: ShippingAlertCustomIcon,
      iconColor: attentionCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500',
      bgColor: attentionCount > 0 ? 'bg-amber-50/60 dark:bg-amber-950/20' : 'bg-slate-50/60 dark:bg-slate-900/20',
      badgeColor: attentionCount > 0
        ? 'text-amber-800 bg-amber-100 dark:bg-amber-900/50 dark:text-amber-300'
        : 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-[6px] border border-border bg-card space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded-[4px]" />
              <Skeleton className="h-8 w-8 rounded-[6px]" />
            </div>
            <Skeleton className="h-6 w-32 rounded-[4px]" />
            <Skeleton className="h-3.5 w-40 rounded-[4px]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.id}
            className="p-4 rounded-[6px] border border-border bg-card shadow-xs transition-colors hover:border-slate-300 dark:hover:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-medium text-muted-foreground">{c.label}</span>
              <div className={`w-8 h-8 rounded-[6px] flex items-center justify-center ${c.bgColor}`}>
                <Icon size={16} className={c.iconColor} />
              </div>
            </div>

            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span className="text-[20px] font-bold text-foreground font-mono tabular-nums tracking-tight">
                {c.value}
              </span>
              {c.unit && <span className="text-[12px] text-muted-foreground font-medium">{c.unit}</span>}
            </div>

            <p className="mt-1 text-[11.5px] text-muted-foreground truncate font-mono">
              {c.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
