import { Trash2, X } from '@/components/ui/Icons';
import { Button } from '@/components/ui/button';

export default function BannerBulkBar({ selectedCount, onClear, onDeleteSelected }) {
  if (!selectedCount) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2.5 rounded-[6px] bg-card border border-border text-card-foreground shadow-lg animate-in fade-in slide-in-from-bottom-3 duration-150">
      <span className="text-xs font-semibold font-mono">
        Đã chọn <strong className="text-primary font-bold">{selectedCount}</strong> banner
      </span>
      <div className="h-4 w-px bg-border" />
      <Button
        variant="destructive"
        size="sm"
        onClick={onDeleteSelected}
        className="h-7 px-2.5 rounded-[4px] text-xs gap-1.5 active:scale-[0.98]"
      >
        <Trash2 className="size-3.5" />
        <span>Xóa tất cả</span>
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onClear}
        className="size-7 rounded-[4px] text-muted-foreground hover:text-foreground"
        title="Bỏ chọn"
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
}
