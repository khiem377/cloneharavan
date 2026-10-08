import { Eye, MousePointer2, Calendar } from '@/components/ui/Icons';
import { BANNER_TYPE_LABELS } from '@/services/banner.service';
import { Badge } from '@/components/ui/badge';

export function VisibleBadge({ isVisible }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[4px] px-2 py-0.5 text-xs font-medium border ${
        isVisible
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
          : 'bg-muted text-muted-foreground border-border'
      }`}
    >
      <span className={`size-1.5 rounded-full ${isVisible ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
      {isVisible ? 'Hiển thị' : 'Đang ẩn'}
    </span>
  );
}

export function TypeBadge({ type }) {
  const label = BANNER_TYPE_LABELS?.[type] || type || 'hero';
  return (
    <span className="inline-flex items-center rounded-[4px] bg-secondary border border-border text-foreground px-2 py-0.5 text-xs font-semibold font-mono">
      {label}
    </span>
  );
}

export function ScheduleBadge({ startAt, endAt }) {
  if (!startAt && !endAt) return <span className="text-muted-foreground text-xs font-mono">—</span>;
  const now = new Date();
  const start = startAt ? new Date(startAt) : null;
  const end = endAt ? new Date(endAt) : null;
  const fmt = (d) =>
    d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' });

  let statusCls = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
  let label = '';
  if (end && now > end) {
    statusCls = 'bg-muted text-muted-foreground border-border';
    label = 'Hết hạn';
  } else if (start && now < start) {
    label = `Bắt đầu ${fmt(start)}`;
  } else if (end) {
    label = `→ ${fmt(end)}`;
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-[4px] border px-2 py-0.5 text-[11px] font-medium font-mono ${statusCls}`}>
      <Calendar className="size-3" />
      {label}
    </span>
  );
}

export function AnalyticsChip({ views = 0, clicks = 0 }) {
  return (
    <div className="flex flex-col gap-0.5 text-[11px] text-muted-foreground font-mono tabular-nums">
      <span className="flex items-center gap-1">
        <Eye className="size-3 text-muted-foreground" />
        {views.toLocaleString()} views
      </span>
      <span className="flex items-center gap-1">
        <MousePointer2 className="size-3 text-muted-foreground" />
        {clicks.toLocaleString()} clicks
      </span>
    </div>
  );
}
