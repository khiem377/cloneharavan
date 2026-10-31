import React from 'react';
import { CheckSquare, Globe, FileText, Trash2 } from '@/components/ui/Icons';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Can from '@/components/auth/Can';

export default function ProductBulkActionBar({
  selectedCount = 0,
  onPublish,
  onDraft,
  onDelete,
  onPrintBarcodes,
  onClearSelection,
  isStatusPending = false,
  variant = 'inline', // 'inline' | 'floating'
}) {
  if (selectedCount === 0) return null;

  if (variant === 'floating') {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-background border border-border shadow-xs rounded-[6px] px-4 py-2.5 flex items-center gap-3 animate-in slide-in-from-bottom-3 duration-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground pr-2 border-r border-border">
          <CheckSquare size={15} className="text-primary shrink-0" />
          <span>
            Đã chọn <span className="text-primary font-mono font-bold tabular-nums">{selectedCount}</span>
          </span>
        </div>

        <Can do="product.edit">
          <Button
            variant="outline"
            size="xs"
            className="rounded-[6px] text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 hover:bg-emerald-500/20 h-8"
            onClick={onPublish}
            disabled={isStatusPending}
          >
            <Globe size={13} className="mr-1" /> Xuất bản
          </Button>
          <Button
            variant="outline"
            size="xs"
            className="rounded-[6px] text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 hover:bg-amber-500/20 h-8"
            onClick={onDraft}
            disabled={isStatusPending}
          >
            <FileText size={13} className="mr-1" /> Chuyển Nháp
          </Button>
        </Can>

        <Can do="product.delete">
          <Button
            variant="destructive"
            size="xs"
            className="rounded-[6px] text-xs font-semibold h-8"
            onClick={onDelete}
          >
            <Trash2 size={13} className="mr-1" /> Xóa
          </Button>
        </Can>

        <Button
          variant="ghost"
          size="xs"
          className="text-xs text-muted-foreground hover:text-foreground h-8 rounded-[6px]"
          onClick={onClearSelection}
        >
          Bỏ chọn
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center flex-wrap gap-2 px-3.5 py-2.5 rounded-[6px] border border-primary/30 bg-primary/5">
      <CheckSquare size={14} className="text-primary shrink-0" />
      <span className="text-xs font-medium text-foreground">
        Đã chọn <span className="text-primary font-bold font-mono tabular-nums">{selectedCount}</span> sản phẩm
      </span>
      <div className="ml-auto flex items-center gap-2">
        <Can do="product.edit">
          <Button
            variant="outline"
            size="xs"
            className="rounded-[6px] text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 hover:bg-emerald-500/20 h-7"
            onClick={onPublish}
            disabled={isStatusPending}
          >
            <Globe size={13} className="mr-1" /> Xuất bản
          </Button>
          <Button
            variant="outline"
            size="xs"
            className="rounded-[6px] text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 hover:bg-amber-500/20 h-7"
            onClick={onDraft}
            disabled={isStatusPending}
          >
            <FileText size={13} className="mr-1" /> Chuyển Nháp
          </Button>
        </Can>
        <Can do="product.delete">
          <Button
            variant="outline"
            size="xs"
            className="rounded-[6px] text-xs font-medium bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20 h-7"
            onClick={onDelete}
          >
            <Trash2 size={13} className="mr-1" /> Xóa
          </Button>
        </Can>
        <Button
          variant="outline"
          size="xs"
          className="rounded-[6px] text-xs font-medium bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 h-7"
          onClick={onPrintBarcodes}
        >
          <Printer size={13} className="mr-1" /> In {selectedCount} tem
        </Button>
        <Button
          variant="ghost"
          size="xs"
          className="text-xs text-muted-foreground hover:text-foreground h-7 rounded-[6px]"
          onClick={onClearSelection}
        >
          Bỏ chọn
        </Button>
      </div>
    </div>
  );
}
