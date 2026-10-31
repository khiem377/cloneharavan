import { useState } from 'react';
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
import { DashTrendSignatureIcon } from '@/components/ui/SignatureIcons';

function CustomChartTooltip({ active, payload, label, mode }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-[6px] border border-border bg-popover/95 p-2.5 text-popover-foreground shadow-sm text-xs font-sans min-w-36">
      <p className="font-semibold text-foreground border-b border-border/60 pb-1 mb-1.5 font-mono text-[11px]">
        {label}
      </p>
      <div className="space-y-1 font-mono text-[11px]">
        {payload.map((entry, index) => {
          let val = entry.value;
          if (mode === 'revenue' && entry.dataKey === 'revenue') {
            val = (val || 0).toLocaleString('vi-VN') + ' ₫';
          } else {
            val = (val || 0).toLocaleString('vi-VN');
          }

          return (
            <div key={index} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-muted-foreground font-sans">
                <span className="size-2 rounded-[2px]" style={{ background: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-bold text-foreground tabular-nums">{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardRevenueChart({
  revenueGrowthTrend = [],
  userGrowthTrend = [],
  productGrowthTrend = [],
}) {
  const [tab, setTab] = useState('revenue'); // 'revenue' | 'growth'

  // Prepare growth data
  const growthData = (() => {
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

  const formatYAxisCurrency = (val) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(0)}Tr`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
    return val;
  };

  return (
    <div className="border border-border bg-card rounded-[6px] p-4 flex flex-col justify-between shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 pb-3 border-b border-border/60">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <DashTrendSignatureIcon size={18} className="text-slate-900 dark:text-slate-100" />
            <span>{tab === 'revenue' ? 'Biến động Doanh thu & Đơn hàng' : 'Tăng trưởng Khách hàng & Sản phẩm'}</span>
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Số liệu thống kê 6 tháng gần nhất</p>
        </div>

        <div className="flex items-center border border-border bg-secondary/60 rounded-[6px] p-0.5 gap-0.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTab('revenue')}
            className={`px-2.5 py-1 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer active:scale-[0.98] ${
              tab === 'revenue'
                ? 'bg-background text-foreground shadow-2xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Doanh thu (₫)
          </button>
          <button
            type="button"
            onClick={() => setTab('growth')}
            className={`px-2.5 py-1 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer active:scale-[0.98] ${
              tab === 'growth'
                ? 'bg-background text-foreground shadow-2xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tăng trưởng Người dùng
          </button>
        </div>
      </div>

      <div className="w-full h-[270px] min-h-[270px] relative">
        {tab === 'revenue' ? (
          revenueGrowthTrend && revenueGrowthTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueGrowthTrend} margin={{ top: 12, right: 12, left: -5, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad-rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f172a" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#0f172a" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <YAxis
                  tickFormatter={formatYAxisCurrency}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomChartTooltip mode="revenue" />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: '10px' }} />
                <Area
                  dataKey="revenue"
                  name="Doanh thu"
                  stroke="#0f172a"
                  fill="url(#grad-rev)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#0f172a' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground font-mono">
              Chưa có phát sinh doanh thu trong kỳ
            </div>
          )
        ) : growthData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="grad-kh-tab" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f172a" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grad-sp-tab" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#64748b" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#64748b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} allowDecimals={false} />
              <Tooltip content={<CustomChartTooltip mode="growth" />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: '10px' }} />
              <Area
                dataKey="kh_moi"
                name="Khách hàng mới"
                stroke="#0f172a"
                fill="url(#grad-kh-tab)"
                strokeWidth={2}
                dot={{ r: 3, fill: '#0f172a' }}
              />
              <Area
                dataKey="sp_moi"
                name="Sản phẩm mới"
                stroke="#64748b"
                fill="url(#grad-sp-tab)"
                strokeWidth={2}
                dot={{ r: 3, fill: '#64748b' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground font-mono">
            Chưa có dữ liệu tăng trưởng
          </div>
        )}
      </div>
    </div>
  );
}
