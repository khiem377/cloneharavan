import React from 'react';
import {
  Package,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Bell,
  Clock,
  Check,
  ChevronRight,
} from 'lucide-react';

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 45) return 'Vừa xong';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
  return `${Math.floor(diffSec / 86400)} ngày trước`;
};

const getNotificationMeta = (type) => {
  switch (type) {
    case 'ORDER_NEW':
      return {
        icon: Package,
        colorClass: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900',
        badgeText: 'Đơn hàng mới',
      };
    case 'ORDER_CANCELLED':
      return {
        icon: XCircle,
        colorClass: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900',
        badgeText: 'Đơn đã hủy',
      };
    case 'STOCK_LOW':
      return {
        icon: AlertTriangle,
        colorClass: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900',
        badgeText: 'Cảnh báo kho',
      };
    case 'SYSTEM':
      return {
        icon: ShieldCheck,
        colorClass: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900',
        badgeText: 'Hệ thống',
      };
    default:
      return {
        icon: Bell,
        colorClass: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        badgeText: 'Thông báo',
      };
  }
};

export default function NotificationDropdownItem({ item, onClick, onMarkRead }) {
  const { icon: Icon, colorClass, badgeText } = getNotificationMeta(item.type);

  return (
    <div
      onClick={() => onClick(item)}
      className={`p-3 flex items-start gap-3 transition-colors cursor-pointer group text-left relative ${
        !item.isRead ? 'bg-primary/5 dark:bg-primary/10 hover:bg-primary/10' : 'hover:bg-muted/50'
      }`}
    >
      {/* Icon Badge */}
      <div className={`size-8 rounded-[6px] border flex items-center justify-center shrink-0 mt-0.5 ${colorClass}`}>
        <Icon size={16} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1.5 mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-muted-foreground truncate">
              {badgeText}
            </span>
            {!item.isRead && (
              <span className="size-1.5 rounded-full bg-rose-500 shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80 font-mono tabular-nums shrink-0">
            <Clock size={11} className="text-muted-foreground/60" />
            <span>{formatTimeAgo(item.createdAt)}</span>
          </div>
        </div>

        <h4 className={`text-xs leading-snug line-clamp-1 ${!item.isRead ? 'font-bold text-foreground' : 'font-medium text-foreground/90'}`}>
          {item.title}
        </h4>

        <p className="text-[11.5px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
          {item.message}
        </p>
      </div>

      {/* Quick Mark Read Button on Hover */}
      {!item.isRead && onMarkRead && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMarkRead(item._id);
          }}
          title="Đánh dấu đã đọc"
          className="opacity-0 group-hover:opacity-100 transition-opacity size-6 rounded-[4px] bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer shrink-0 mt-1 shadow-2xs"
        >
          <Check size={12} />
        </button>
      )}
    </div>
  );
}
