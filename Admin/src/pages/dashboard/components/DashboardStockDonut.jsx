import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import DashboardChartsTooltip from './DashboardChartsTooltip';

export default function DashboardStockDonut({ stats = {} }) {
  const stockPieData = [
    { name: 'Sẵn sàng bán', value: stats.publishedProducts || 0, color: '#10b981' },
    { name: 'Cảnh báo tồn ít', value: stats.lowStockProducts || 0, color: '#f59e0b' },
    { name: 'Hết hàng', value: stats.outOfStockProducts || 0, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  return (
    <div className="border border-border bg-card rounded-[6px] p-4 flex flex-col justify-between shadow-2xs">
      <div className="mb-2">
        <h2 className="text-sm font-semibold text-foreground">Trạng thái Tồn kho</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">Phân bổ sẵn có / cảnh báo / hết hàng</p>
      </div>

      {stockPieData.length > 0 ? (
        <>
          <div className="relative h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {stockPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<DashboardChartsTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold font-mono tabular-nums text-foreground">
                {stats.totalProducts || 0}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">Sản phẩm</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-border mt-2">
            {[
              { label: 'Sẵn sàng bán', value: stats.publishedProducts, color: '#10b981' },
              { label: 'Cảnh báo tồn ít', value: stats.lowStockProducts, color: '#f59e0b' },
              { label: 'Hết hàng', value: stats.outOfStockProducts, color: '#ef4444' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="size-2 rounded-[2px]" style={{ background: row.color }} />
                  {row.label}
                </span>
                <span className="font-semibold font-mono tabular-nums text-foreground">{row.value || 0}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="h-44 flex items-center justify-center text-xs text-muted-foreground font-mono">
          Không có dữ liệu
        </div>
      )}
    </div>
  );
}
