import React from 'react';
import {
  Package,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Bell,
  Clock,
  Trash2,
  Check,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

const formatFullDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, '0');
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const formatVND = (amount) => {
  if (!amount && amount !== 0) return '';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const getMeta = (type) => {
  switch (type) {
    case 'ORDER_NEW':
      return {
        icon: Package,
        colorClass: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900',
        badge: 'Đơn hàng mới',
      };
    case 'ORDER_CANCELLED':
      return {
        icon: XCircle,
        colorClass: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900',
        badge: 'Hủy đơn',
      };
    case 'STOCK_LOW':
      return {
        icon: AlertTriangle,
        colorClass: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900',
        badge: 'Cảnh báo kho',
      };
    case 'SYSTEM':
      return {
        icon: ShieldCheck,
        colorClass: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900',
        badge: 'Hệ thống',
      };
    default:
      return {
        icon: Bell,
        colorClass: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        badge: 'Thông báo',
      };
  }
};

export default function NotificationRow({
  item,
  isSelected,
  onToggleSelect,
  onClick,
  onMarkRead,
  onDelete,
}) {
  const { icon: Icon, colorClass, badge } = getMeta(item.type);

  return (
    <div
      onClick={() => onClick(item)}
      className={`p-3.5 sm:p-4 flex items-start gap-3.5 transition-colors cursor-pointer group text-left relative ${
        !item.isRead
          ? 'bg-primary/[0.04] dark:bg-primary/10 hover:bg-primary/[0.08]'
          : 'hover:bg-muted/40'
      } ${isSelected ? 'bg-primary/15 hover:bg-primary/20' : ''}`}
    >
      {/* Checkbox */}
      <div
        className="pt-0.5"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(item._id)}
          aria-label={`Chọn thông báo ${item.title}`}
        />
      </div>

      {/* Avatar Icon (1px border, rounded 6px) */}
      <div className={`size-9 rounded-[6px] border flex items-center justify-center shrink-0 ${colorClass}`}>
        <Icon size={18} />
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-muted-foreground px-1.5 py-0.5 rounded-[4px] bg-muted/60">
              {badge}
            </span>
            <h4 className={`text-xs sm:text-sm ${!item.isRead ? 'font-bold text-foreground' : 'font-medium text-foreground/80'}`}>
              {item.title}
            </h4>
            {!item.isRead && (
              <span className="size-2 rounded-full bg-rose-500 shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono tabular-nums shrink-0">
            <Clock size={12} className="text-muted-foreground/60" />
            <span>{formatFullDate(item.createdAt)}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {item.message}
        </p>

        {/* Metadata pills (if available) */}
        {item.metadata && Object.keys(item.metadata).length > 0 && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {item.metadata.orderCode && (
              <span className="px-2 py-0.5 rounded-[4px] bg-muted text-[10px] font-mono font-bold text-foreground tabular-nums">
                Mã: {item.metadata.orderCode}
              </span>
            )}
            {item.metadata.totalAmount > 0 && (
              <span className="px-2 py-0.5 rounded-[4px] bg-muted text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatVND(item.metadata.totalAmount)}
              </span>
            )}
            {item.metadata.warehouseName && (
              <span className="px-2 py-0.5 rounded-[4px] bg-muted text-[10px] font-medium text-muted-foreground">
                {item.metadata.warehouseName}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Row Actions */}
      <div
        className="flex items-center gap-1 shrink-0 pt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        {!item.isRead && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onMarkRead(item._id)}
            title="Đánh dấu đã đọc"
            className="size-7 rounded-[4px] text-muted-foreground hover:text-foreground active:scale-[0.98] cursor-pointer"
          >
            <Check size={14} />
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onDelete(item._id)}
          title="Xóa thông báo"
          className="size-7 rounded-[4px] text-muted-foreground hover:text-rose-600 active:scale-[0.98] cursor-pointer"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
}
