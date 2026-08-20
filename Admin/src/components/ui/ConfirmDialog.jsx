import { AlertTriangle, Loader2, X } from '@/components/ui/Icons';

export default function ConfirmDialog({
  open,
  title = 'Xác nhận',
  message,
  description,
  onConfirm,
  onCancel,
  confirmText = 'Xác nhận',
  variant = 'danger',
  loading = false,
}) {
  if (!open) return null;

  const body = description || message;
  return (
    <div className="fixed inset-0 z-[10100] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4" onClick={onCancel}>
      <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-background shadow-xl text-foreground" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${variant === 'danger' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
              <AlertTriangle size={17} />
            </div>
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
          </div>
          <button className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" onClick={onCancel}>
            <X size={16} />
          </button>
        </div>

        <div className="p-5 text-sm text-muted-foreground leading-relaxed">
          {body}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/40 px-5 py-3">
          <button type="button" className="inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" onClick={onCancel}>Hủy</button>
          <button
            type="button"
            className={`inline-flex h-8 items-center justify-center gap-1 rounded-md px-3 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 ${variant === 'danger' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
