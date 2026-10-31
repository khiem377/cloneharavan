import React from 'react';
import { Bell, CheckCheck, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotificationHeader({
  unreadCount = 0,
  onMarkAllRead,
  onRefresh,
  isProcessing = false,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground [text-wrap:balance]">
          Trung tâm thông báo
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Theo dõi các biến động về đơn hàng, tồn kho và tiến trình hệ thống theo thời gian thực.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isProcessing}
          className="h-8 rounded-[6px] gap-1.5 text-xs font-semibold cursor-pointer active:scale-[0.98]"
        >
          <RotateCcw size={13} className={isProcessing ? 'animate-spin' : ''} />
          <span>Làm mới</span>
        </Button>

        {unreadCount > 0 && (
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onMarkAllRead}
            disabled={isProcessing}
            className="h-8 rounded-[6px] gap-1.5 text-xs font-bold cursor-pointer active:scale-[0.98]"
          >
            <CheckCheck size={14} />
            <span>Đánh dấu tất cả đã đọc</span>
          </Button>
        )}
      </div>
    </div>
  );
}
