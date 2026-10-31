import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShippingRouteCustomIcon } from '@/components/ui/Icons';
import { ChevronRight } from 'lucide-react';

const STATUS_CONFIGS = [
  { key: 'ready_to_pick', label: 'Chờ lấy hàng', color: 'text-amber-600 dark:text-amber-400' },
  { key: 'picking', label: 'Đã lấy hàng', color: 'text-blue-600 dark:text-blue-400' },
  { key: 'delivering', label: 'Đang giao hàng', color: 'text-sky-600 dark:text-sky-400' },
  { key: 'delivery_fail', label: 'Chờ giao lại', color: 'text-orange-600 dark:text-orange-400', isAlert: true },
  { key: 'returning', label: 'Đang hoàn hàng', color: 'text-rose-600 dark:text-rose-400', isAlert: true },
  { key: 'returned', label: 'Đã hoàn hàng', color: 'text-rose-700 dark:text-rose-500' },
  { key: 'delivered', label: 'Đã giao hàng', color: 'text-emerald-600 dark:text-emerald-400', isSuccess: true },
  { key: 'cancelled', label: 'Hủy giao hàng', color: 'text-slate-500 dark:text-slate-400' },
];

export default function ShipmentsStatusPipeline({ statusSummary = {} }) {
  const navigate = useNavigate();

  return (
    <div className="bg-card border border-border rounded-[6px] shadow-xs overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShippingRouteCustomIcon size={14} className="text-muted-foreground" />
          <span className="text-[12.5px] font-semibold text-foreground">
            Hành trình luồng vận đơn
          </span>
          <span className="text-[11px] text-muted-foreground">
            (Bấm vào từng giai đoạn để lọc nhanh danh sách)
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/shipments')}
          className="text-[11.5px] text-primary hover:underline font-medium inline-flex items-center cursor-pointer"
        >
          Xem tất cả <ChevronRight size={12} className="ml-0.5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 divide-x divide-y lg:divide-y-0 divide-border min-w-[760px]">
          {STATUS_CONFIGS.map((item) => {
            const count = statusSummary[item.key]?.count || 0;
            const cod = statusSummary[item.key]?.cod || 0;
            const hasAlert = item.isAlert && count > 0;

            return (
              <div
                key={item.key}
                onClick={() => navigate(`/shipments?status=${item.key}`)}
                className={`p-3.5 hover:bg-muted/40 cursor-pointer transition-colors text-left group ${
                  hasAlert ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-muted-foreground group-hover:text-foreground font-medium truncate block">
                    {item.label}
                  </span>
                  {hasAlert && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                </div>

                <div className="mt-1 flex items-baseline gap-1">
                  <span className={`text-[18px] font-bold font-mono tabular-nums ${item.color}`}>
                    {count}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">đơn</span>
                </div>

                <span className="text-[11px] text-muted-foreground/80 font-mono tabular-nums block mt-1 truncate">
                  COD: {cod > 0 ? `${cod.toLocaleString('vi-VN')}₫` : '0₫'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
