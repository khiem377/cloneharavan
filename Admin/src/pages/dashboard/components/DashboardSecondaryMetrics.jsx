import { Link } from 'react-router-dom';
import { CategoriesIcon, BrandsIcon, TagIcon, AlertTriangleIcon } from '@/components/ui/Icons';

export default function DashboardSecondaryMetrics({ stats = {} }) {
  const METRICS = [
    { label: 'Danh mục sản phẩm', value: stats.totalCategories, icon: CategoriesIcon, to: '/categories' },
    { label: 'Thương hiệu', value: stats.totalBrands, icon: BrandsIcon, to: '/brands' },
    { label: 'Mã giảm giá khả dụng', value: stats.activeCoupons, icon: TagIcon, to: '/promotions/coupons' },
    { label: 'Sản phẩm cảnh báo tồn', value: stats.lowStockProducts, icon: AlertTriangleIcon, to: '/stock-alerts' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {METRICS.map((c) => (
        <Link
          key={c.label}
          to={c.to}
          className="border border-border bg-card rounded-[6px] p-3 flex items-center gap-3 hover:border-foreground/30 hover:bg-accent/40 transition-colors active:scale-[0.98] shadow-2xs"
        >
          <div className="size-8 rounded-[4px] bg-secondary flex items-center justify-center shrink-0">
            <c.icon className="size-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-muted-foreground truncate">{c.label}</p>
            <p className="text-base font-bold text-foreground font-mono tabular-nums">{c.value ?? 0}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
