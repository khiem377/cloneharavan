import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ShippingTruckCustomIcon,
  ShippingBoxCustomIcon,
  SyncRefreshCustomIcon,
} from '@/components/ui/Icons';
import { Plus } from 'lucide-react';

const DATE_OPTIONS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'today', label: 'Hôm nay' },
  { id: '7d', label: '7 ngày qua' },
  { id: '30d', label: '30 ngày qua' },
];

export default function ShipmentsOverviewHeader({
  dateRange,
  onDateRangeChange,
  loading,
  onRefresh,
  onOpenCreate,
}) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
      <div>
        <h2 className="text-[18px] font-semibold text-foreground tracking-tight">
          Tổng quan vận chuyển
        </h2>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Theo dõi trạng thái giao hàng, dòng tiền COD và hiệu quả đối tác theo thời gian thực
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Bộ lọc thời gian nhanh */}
        <div className="inline-flex items-center p-0.5 bg-muted/60 dark:bg-muted/40 rounded-[6px] border border-border">
          {DATE_OPTIONS.map((opt) => {
            const isActive = dateRange === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onDateRangeChange(opt.id)}
                className={`px-2.5 py-1 text-[12px] font-medium rounded-[5px] transition-all cursor-pointer ${
                  isActive
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Nút Làm mới */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-8 px-2.5 text-[12.5px] border-border cursor-pointer active:scale-[0.98]"
        >
          <SyncRefreshCustomIcon
            size={14}
            className={`mr-1.5 text-muted-foreground ${loading ? 'animate-spin' : ''}`}
          />
          Làm mới
        </Button>

        {/* Nút Tạo vận đơn */}
        <Button
          type="button"
          size="sm"
          onClick={onOpenCreate}
          className="h-8 px-3 text-[12.5px] bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer active:scale-[0.98]"
        >
          <Plus size={14} className="mr-1.5" />
          Tạo vận đơn
        </Button>

        {/* Nút Kết nối vận chuyển */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate('/settings?tab=shipping-providers')}
          className="h-8 px-2.5 text-[12.5px] border-border cursor-pointer active:scale-[0.98]"
        >
          <ShippingTruckCustomIcon size={14} className="mr-1.5 text-muted-foreground" />
          Kết nối đối tác
        </Button>
      </div>
    </div>
  );
}
