import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

const STATUS_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'unread', label: 'Chưa đọc' },
  { id: 'read', label: 'Đã đọc' },
];

const TYPE_OPTIONS = [
  { id: 'all', label: 'Tất cả phân loại' },
  { id: 'ORDER_NEW', label: 'Đơn hàng mới' },
  { id: 'ORDER_CANCELLED', label: 'Đơn bị hủy' },
  { id: 'STOCK_LOW', label: 'Cảnh báo tồn kho' },
  { id: 'SYSTEM', label: 'Hệ thống & Kiểm toán' },
];

export default function NotificationFilters({
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  search,
  onSearchChange,
}) {
  return (
    <div className="rounded-[6px] border border-border bg-card p-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
      {/* Status Segmented Tabs */}
      <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-[6px] border border-border/50 shrink-0">
        {STATUS_TABS.map((tab) => {
          const isSelected = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onStatusChange(tab.id)}
              className={`h-7 px-3 rounded-[4px] text-xs font-semibold transition active:scale-[0.98] cursor-pointer ${
                isSelected
                  ? 'bg-background text-foreground shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Type Filter & Search Bar */}
      <div className="flex items-center gap-2 flex-1 sm:max-w-md justify-end">
        <select
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value)}
          aria-label="Lọc theo loại thông báo"
          className="h-8 px-2.5 rounded-[6px] border border-border bg-background text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-primary cursor-pointer shrink-0"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="relative w-full">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo nội dung, mã đơn..."
            className="h-8 pl-8 pr-7 text-xs rounded-[6px] border-border bg-background w-full"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
