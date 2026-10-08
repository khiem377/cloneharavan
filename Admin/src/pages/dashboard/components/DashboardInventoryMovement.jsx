import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import DashboardChartsTooltip from './DashboardChartsTooltip';

export default function DashboardInventoryMovement({ invMonthlyData = [], invRange, setInvRange }) {
  return (
    <div className="border border-border bg-card rounded-[6px] p-4 shadow-2xs">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Biến động Nhập - Xuất kho</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Số lượng hàng hóa luân chuyển</p>
        </div>
        <div className="flex items-center border border-border bg-secondary/50 rounded-[4px] p-0.5 gap-0.5">
          {[
            { v: '7days', l: '7N' },
            { v: '30days', l: '30N' },
            { v: '6months', l: '6T' },
          ].map((opt) => (
            <button
              key={opt.v}
              onClick={() => setInvRange(opt.v)}
              className={`px-2 py-0.5 rounded-[3px] text-[10px] font-semibold font-mono transition-colors cursor-pointer ${
                invRange === opt.v
                  ? 'bg-background text-foreground shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {invMonthlyData.length > 0 ? (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={invMonthlyData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} allowDecimals={false} />
            <Tooltip content={<DashboardChartsTooltip />} />
            <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="nhap" name="Nhập kho" fill="#10b981" radius={[3, 3, 0, 0]} />
            <Bar dataKey="xuat" name="Xuất kho" fill="#3b82f6" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground font-mono">
          Chưa có dữ liệu biến động kho
        </div>
      )}
    </div>
  );
}
