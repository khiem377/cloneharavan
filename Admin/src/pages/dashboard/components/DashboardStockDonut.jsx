import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@/components/ui/Icons';
import { DashStockDonutSignatureIcon } from '@/components/ui/SignatureIcons';

export default function DashboardStockDonut({ stats = {} }) {
  const published = stats.publishedProducts || 0;
  const lowStock = stats.lowStockProducts || 0;
  const outOfStock = stats.outOfStockProducts || 0;
  const total = published + lowStock + outOfStock || stats.totalProducts || 1;

  // Calculate percentages
  const pctPublished = Math.round((published / total) * 100);
  const pctLow = Math.round((lowStock / total) * 100);
  const pctOut = Math.max(0, 100 - pctPublished - pctLow);

  // SVG Donut calculation (Circumference of r=40 is 2 * PI * 40 ≈ 251.327)
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  const strokePublished = (pctPublished / 100) * circumference;
  const strokeLow = (pctLow / 100) * circumference;
  const strokeOut = (pctOut / 100) * circumference;

  const offsetPublished = 0;
  const offsetLow = -strokePublished;
  const offsetOut = -(strokePublished + strokeLow);

  return (
    <div className="border border-border bg-card rounded-[6px] p-4 flex flex-col justify-between shadow-2xs">
      <div className="flex items-center justify-between pb-2 border-b border-border/60 mb-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <DashStockDonutSignatureIcon size={18} className="text-emerald-600" />
            <span>Phân bổ Tồn kho</span>
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Tỷ lệ khả dụng và cảnh báo thiếu hàng</p>
        </div>
        <Link
          to="/inventory"
          className="text-[11px] text-primary hover:underline flex items-center gap-0.5 font-medium font-mono"
        >
          Kho hàng <ChevronRightIcon className="size-3" />
        </Link>
      </div>

      {/* SVG Donut */}
      <div className="relative py-2 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="size-36 -rotate-90">
          {/* Background circle track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--secondary)"
            strokeWidth="12"
          />

          {/* Published (Green) */}
          {pctPublished > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#10b981"
              strokeWidth="12"
              strokeDasharray={`${strokePublished} ${circumference}`}
              strokeDashoffset={offsetPublished}
              className="transition-all duration-300"
            />
          )}

          {/* Low Stock (Amber) */}
          {pctLow > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="12"
              strokeDasharray={`${strokeLow} ${circumference}`}
              strokeDashoffset={offsetLow}
              className="transition-all duration-300"
            />
          )}

          {/* Out of Stock (Red) */}
          {pctOut > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#ef4444"
              strokeWidth="12"
              strokeDasharray={`${strokeOut} ${circumference}`}
              strokeDashoffset={offsetOut}
              className="transition-all duration-300"
            />
          )}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold font-mono tabular-nums text-foreground leading-none">
            {stats.totalProducts || 0}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono mt-0.5">Sản phẩm</span>
        </div>
      </div>

      {/* Legend list */}
      <div className="space-y-1.5 pt-3 border-t border-border/60">
        {[
          { label: 'Sẵn sàng bán', value: published, color: '#10b981', pct: pctPublished },
          { label: 'Cảnh báo tồn ít', value: lowStock, color: '#f59e0b', pct: pctLow },
          { label: 'Hết hàng', value: outOfStock, color: '#ef4444', pct: pctOut },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2 rounded-[2px]" style={{ background: row.color }} />
              <span>{row.label}</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground">({row.pct}%)</span>
              <span className="font-semibold font-mono tabular-nums text-foreground">{row.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
