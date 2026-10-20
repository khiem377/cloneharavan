import React from 'react';
import { CheckCheck, Trash2, X } from '@/components/ui/Icons';
import { Button } from '@/components/ui/button';

export default function NotificationBatchBar({
  selectedCount = 0,
  onClearSelection,
  onMarkReadSelected,
  onDeleteSelected,
  isProcessing = false,
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-[6px] bg-primary/10 border border-primary/20 text-foreground animate-in fade-in-50 duration-150">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold">
          Đã chọn <strong className="font-mono tabular-nums text-primary">{selectedCount}</strong> thông báo
        </span>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onMarkReadSelected}
          disabled={isProcessing}
          className="h-8 text-xs font-medium rounded-[6px] border-border bg-card hover:bg-accent text-foreground cursor-pointer"
        >
          <CheckCheck className="size-3.5 mr-1 text-primary" />
          Đánh dấu đã đọc
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDeleteSelected}
          disabled={isProcessing}
          className="h-8 text-xs font-medium rounded-[6px] border-rose-200 dark:border-rose-900/50 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 cursor-pointer"
        >
          <Trash2 className="size-3.5 mr-1" />
          Xóa thông báo
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground rounded-[6px] cursor-pointer"
          title="Bỏ chọn"
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
