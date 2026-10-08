import { Users, CheckCircle2, XCircle } from '@/components/ui/Icons';

export default function CustomerStatsGrid({ stats = {} }) {
  const ITEMS = [
    {
      label: 'Tổng khách hàng',
      value: stats.total || 0,
      sub: `${stats.newThisMonth || 0} mới tháng này`,
      icon: Users,
      color: 'text-primary',
    },
    {
      label: 'Đang hoạt động',
      value: stats.active || 0,
      sub: 'Tài khoản bình thường',
      icon: CheckCircle2,
      color: 'text-emerald-500',
    },
    {
      label: 'Đã tạm khóa',
      value: stats.inactive || 0,
      sub: 'Bị giới hạn đăng nhập',
      icon: XCircle,
      color: 'text-rose-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {ITEMS.map((item) => (
        <div
          key={item.label}
          className="border border-border bg-card rounded-[6px] p-4 flex flex-col justify-between gap-2 shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              {item.label}
            </span>
            <div className="size-7 rounded-[4px] bg-secondary flex items-center justify-center">
              <item.icon className={`size-4 ${item.color}`} />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono tabular-nums text-foreground">
              {(item.value || 0).toLocaleString('vi-VN')}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">{item.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
