import React from 'react';
import { ArrowLeft, Loader2, Save } from '@/components/ui/Icons';

export default function MenuEditorHeader({
  menuName,
  setMenuName,
  rootCount,
  onSave,
  isPending,
  onBack,
}) {
  return (
    <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 rounded-[6px] border border-border bg-card shadow-xs">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          className="inline-flex size-8 items-center justify-center rounded-[6px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer shrink-0 active:scale-[0.98]"
          onClick={onBack}
          title="Quay lại danh sách menu"
        >
          <ArrowLeft size={17} />
        </button>
        <input
          className="h-8 rounded-[6px] border border-transparent bg-transparent px-2 text-sm font-semibold text-foreground outline-none focus:border-input focus:bg-background focus:ring-2 focus:ring-ring/20 transition-colors min-w-0 max-w-56"
          value={menuName}
          onChange={(e) => setMenuName(e.target.value)}
          placeholder="Tên menu"
        />
        <span className="text-xs text-muted-foreground hidden sm:block tabular-nums font-mono">
          {rootCount} mục gốc
        </span>
      </div>
      <button
        type="button"
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[6px] bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer shrink-0 active:scale-[0.98]"
        onClick={onSave}
        disabled={isPending}
      >
        {isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
        <span className="hidden sm:inline">Lưu menu</span>
      </button>
    </div>
  );
}
