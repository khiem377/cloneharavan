import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@/components/ui/Icons';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

export default function DashboardRecentCustomers({ recentCustomers = [] }) {
  return (
    <div className="border border-border bg-card rounded-[6px] p-4 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Khách hàng mới gia nhập</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Tài khoản người dùng đăng ký gần đây</p>
        </div>
        <Link
          to="/customers"
          className="text-[11px] text-primary hover:underline flex items-center gap-0.5 font-medium font-mono"
        >
          Tất cả <ChevronRightIcon className="size-3" />
        </Link>
      </div>
      <div className="divide-y divide-border/60">
        {recentCustomers.length > 0 ? (
          recentCustomers.map((c) => {
            const initials = (c.fullName?.[0] || c.email?.[0] || '?').toUpperCase();
            return (
              <Link
                key={c._id}
                to="/customers"
                className="group py-2 flex items-center gap-3 hover:bg-accent/40 px-1 rounded-[4px] transition-colors"
              >
                {c.avatar?.url ? (
                  <img
                    src={c.avatar.url}
                    alt={c.fullName}
                    className="size-8 rounded-[4px] object-cover border border-border shrink-0"
                  />
                ) : (
                  <div className="size-8 rounded-[4px] bg-primary text-primary-foreground text-xs font-bold font-mono flex items-center justify-center shrink-0">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {c.fullName || 'Khách hàng'}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">{c.email}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span
                    className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded-[4px] border ${
                      c.isActive
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {c.isActive ? 'Hoạt động' : 'Đã khóa'}
                  </span>
                  <p className="text-[10px] text-muted-foreground font-mono tabular-nums mt-0.5">
                    {formatDate(c.createdAt)}
                  </p>
                </div>
              </Link>
            );
          })
        ) : (
          <p className="text-xs text-muted-foreground text-center py-8 font-mono">Chưa có khách hàng mới</p>
        )}
      </div>
    </div>
  );
}
