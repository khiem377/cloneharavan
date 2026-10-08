import { Link } from 'react-router-dom';
import {
  DashCategoryIcon,
  DashBrandIcon,
  DashCouponIcon,
  DashStockAlertIcon,
} from '@/components/ui/Icons';

export default function DashboardSecondaryMetrics({ stats = {} }) {
  const METRICS = [
    {
      label: 'Danh mục sản phẩm',
      value: stats.totalCategories,
      Icon: DashCategoryIcon,
      to: '/categories',
    },
    {
      label: 'Thương hiệu',
      value: stats.totalBrands,
      Icon: DashBrandIcon,
      to: '/brands',
    },
    {
      label: 'Mã giảm giá khả dụng',
      value: stats.activeCoupons,
      Icon: DashCouponIcon,
      to: '/promotions/coupons',
    },
    {
      label: 'Sản phẩm cảnh báo tồn',
      value: stats.lowStockProducts,
      Icon: DashStockAlertIcon,
      to: '/stock-alerts',
      isAlert: (stats.lowStockProducts || 0) > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {METRICS.map((c) => (
        <Link
          key={c.label}
          to={c.to}
          className="group border border-border bg-card rounded-[6px] p-3 flex items-center gap-3 hover:border-foreground/25 hover:bg-muted/30 hover:shadow-2xs transition-all duration-150 active:scale-[0.98]"
        >
          <div className="size-9 rounded-[6px] bg-secondary/80 border border-border text-foreground/80 flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-foreground group-hover:border-foreground/20 transition-all duration-150">
            <c.Icon size={20} className="transition-transform duration-150 group-hover:scale-105 pointer-events-none" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-muted-foreground truncate leading-tight font-medium">{c.label}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-base font-bold text-foreground font-mono tabular-nums leading-tight">{c.value ?? 0}</p>
              {c.isAlert && (
                <span className="inline-block size-1.5 rounded-full bg-amber-500 shrink-0" />
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
