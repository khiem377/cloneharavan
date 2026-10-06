import { Link } from 'react-router-dom';
import { AlertTriangleIcon, ChevronRightIcon, CheckCircleIcon, PackageIcon } from '@/components/ui/Icons';
import { Badge } from '@/components/ui/badge';

export default function DashboardLowStockAlerts({ lowStockVariants = [] }) {
  return (
    <div className="border border-border bg-card rounded-[6px] p-4 flex flex-col justify-between shadow-2xs">
      <div className="flex items-center justify-between pb-2 border-b border-border mb-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <AlertTriangleIcon className="size-4 text-amber-500" />
            <span>Sản phẩm sắp hết hàng</span>
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Cần nhập thêm để duy trì kinh doanh</p>
        </div>
        <Link
          to="/stock-alerts"
          className="text-[11px] text-primary hover:underline flex items-center gap-0.5 font-medium font-mono"
        >
          Xem tất cả <ChevronRightIcon className="size-3" />
        </Link>
      </div>

      {lowStockVariants.length > 0 ? (
        <div className="divide-y divide-border/60">
          {lowStockVariants.slice(0, 5).map((v) => (
            <Link
              key={v._id}
              to={v.productId ? `/products/${v.productId}/edit` : '#'}
              className="group py-2 flex items-center gap-3 hover:bg-accent/40 px-1 rounded-[4px] transition-colors"
            >
              {v.thumbnail ? (
                <img
                  src={v.thumbnail}
                  alt={v.name}
                  className="size-8 rounded-[4px] object-cover border border-border shrink-0"
                />
              ) : (
                <div className="size-8 rounded-[4px] bg-secondary border border-border shrink-0 flex items-center justify-center">
                  <PackageIcon className="size-4 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {v.name}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono truncate">
                  {v.variant || v.sku || 'Mặc định'}
                </p>
              </div>
              <span
                className={`shrink-0 inline-flex items-center rounded-[4px] px-1.5 py-0.5 text-[11px] font-bold font-mono border ${
                  v.stock <= 3
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                }`}
              >
                Tồn: {v.stock}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="h-[200px] flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground font-mono">
          <CheckCircleIcon className="size-7 text-emerald-500" />
          Tồn kho hiện tại đang rất ổn định
        </div>
      )}
    </div>
  );
}
