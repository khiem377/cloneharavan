import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TrendingUpIcon } from '@/components/ui/Icons';
import DashboardChartsTooltip from './DashboardChartsTooltip';

export default function DashboardGrowthChart({ userGrowthTrend = [], productGrowthTrend = [] }) {
  const chartData = (() => {
    const map = {};
    (userGrowthTrend || []).forEach((d) => {
      map[d.month] = { month: d.month, kh_moi: d.kh_moi || 0, sp_moi: 0 };
    });
    (productGrowthTrend || []).forEach((d) => {
      if (map[d.month]) map[d.month].sp_moi = d.sp_moi || 0;
      else map[d.month] = { month: d.month, kh_moi: 0, sp_moi: d.sp_moi || 0 };
    });
    return Object.values(map);
  })();

  return (
    <div className="lg:col-span-2 border border-border bg-card rounded-[6px] p-4 flex flex-col justify-between shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Tăng trưởng Khách hàng & Sản phẩm</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Biến động 6 tháng gần nhất theo thời gian thực</p>
        </div>
        <TrendingUpIcon className="size-4 text-muted-foreground" />
      </div>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="grad-kh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="grad-sp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} allowDecimals={false} />
            <Tooltip content={<DashboardChartsTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: '8px' }} />
            <Area dataKey="kh_moi" name="Khách hàng mới" stroke="#10b981" fill="url(#grad-kh)" strokeWidth={2} dot={{ r: 3 }} />
            <Area dataKey="sp_moi" name="Sản phẩm mới" stroke="#3b82f6" fill="url(#grad-sp)" strokeWidth={2} dot={{ r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[230px] flex items-center justify-center text-xs text-muted-foreground font-mono">
          Chưa có dữ liệu tăng trưởng
        </div>
      )}
    </div>
  );
}
