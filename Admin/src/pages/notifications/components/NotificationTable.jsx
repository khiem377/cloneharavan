import React from 'react';
import { Inbox } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import NotificationRow from './NotificationRow';

export default function NotificationTable({
  notifications = [],
  selectedIds = [],
  loading = false,
  onToggleSelect,
  onToggleSelectAll,
  onItemClick,
  onDeleteItem,
  onMarkReadItem,
}) {
  const isAllSelected =
    notifications.length > 0 && selectedIds.length === notifications.length;

  if (loading && notifications.length === 0) {
    return (
      <div className="rounded-[6px] border border-border bg-card overflow-hidden shadow-2xs">
        {/* Table Header Bar */}
        <div className="px-3.5 sm:px-4 py-2.5 bg-muted/30 border-b border-border flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="size-4 rounded bg-muted animate-pulse" />
            <span>Nội dung thông báo</span>
          </div>
          <div className="hidden sm:block text-right">Thời gian</div>
        </div>

        {/* Skeleton Rows matching 1:1 */}
        <div className="divide-y divide-border/60">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} className="p-3.5 sm:p-4 flex items-start gap-3.5 animate-pulse">
              <div className="pt-0.5">
                <div className="size-4 rounded bg-muted shrink-0" />
              </div>
              <div className="size-9 rounded-[6px] bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="h-3.5 bg-muted rounded-[4px] w-1/3" />
                  <div className="h-3 bg-muted rounded-[4px] w-24" />
                </div>
                <div className="h-3 bg-muted rounded-[4px] w-3/4" />
                <div className="h-2.5 bg-muted rounded-[4px] w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="rounded-[6px] border border-border bg-card p-12 text-center shadow-2xs">
        <div className="size-12 rounded-[6px] bg-muted/50 flex items-center justify-center mx-auto mb-3 text-muted-foreground/50">
          <Inbox size={24} />
        </div>
        <h4 className="text-sm font-bold text-foreground">Không tìm thấy thông báo nào</h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Các thông báo mới về đơn hàng, tồn kho và hệ thống sẽ hiển thị tại đây khi phát sinh.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[6px] border border-border bg-card overflow-hidden shadow-2xs">
      {/* Table Header Bar */}
      <div className="px-3.5 sm:px-4 py-2.5 bg-muted/30 border-b border-border flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={onToggleSelectAll}
            aria-label="Chọn tất cả thông báo trong trang"
          />
          <span>Nội dung thông báo</span>
        </div>
        <div className="hidden sm:block text-right">Thời gian</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/60">
        {notifications.map((item) => (
          <NotificationRow
            key={item._id}
            item={item}
            isSelected={selectedIds.includes(item._id)}
            onToggleSelect={onToggleSelect}
            onClick={onItemClick}
            onMarkRead={onMarkReadItem}
            onDelete={onDeleteItem}
          />
        ))}
      </div>
    </div>
  );
}
