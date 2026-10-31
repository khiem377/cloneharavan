import React from 'react';
import { X, Copy } from '@/components/ui/Icons';
import { useMediaUsage } from '@/hooks/useMedia';
import { toast } from '@/providers/ToastProvider';
import { formatSize } from './mediaPickerUtils';

function PreviewUsageSection({ mediaId }) {
  const { data: usages = [], isLoading } = useMediaUsage(mediaId);
  if (isLoading) {
    return (
      <div className="flex flex-col gap-1 animate-pulse">
        <div className="h-5 rounded-[6px] bg-muted w-full" />
        <div className="h-5 rounded-[6px] bg-muted w-3/4" />
      </div>
    );
  }
  if (!usages.length) {
    return (
      <span className="inline-flex items-center rounded-[6px] bg-muted px-2 py-1 text-[10px] text-muted-foreground">
        Chưa sử dụng ở đâu
      </span>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      {usages.map((u, i) => (
        <a
          key={i}
          href={u.adminUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-[6px] bg-primary/5 border border-primary/15 px-2 py-1 text-[10px] font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          <span className="flex-1 truncate">{u.displayName}: {u.entityName}</span>
        </a>
      ))}
    </div>
  );
}

export default function MediaPreviewPanel({ pickerPreview, onClose }) {
  if (!pickerPreview) return null;

  return (
    <div className="w-56 shrink-0 border-l border-border bg-muted/10 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
        <span className="text-[11px] font-semibold text-foreground">Preview</span>
        <button
          onClick={onClose}
          className="size-5 flex items-center justify-center rounded-[6px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
        >
          <X size={11} />
        </button>
      </div>
      <div
        className="flex items-center justify-center bg-[repeating-conic-gradient(#80808015_0%_25%,transparent_0%_50%)] bg-[length:12px_12px] border-b border-border shrink-0"
        style={{ height: 150 }}
      >
        {((pickerPreview.mimeType || pickerPreview.mimetype || '').startsWith('image/') || pickerPreview.url) ? (
          <img src={pickerPreview.url} alt={pickerPreview.filename} className="max-h-[146px] max-w-full object-contain" />
        ) : (
          <span className="text-3xl font-extrabold text-muted-foreground/20">
            {pickerPreview.filename?.split('.').pop()?.toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3">
        <p className="text-[11px] font-semibold text-foreground break-all leading-relaxed">{pickerPreview.filename}</p>
        <div className="flex flex-col gap-0 rounded-[6px] border border-border overflow-hidden">
          {[
            ['Loại', pickerPreview.mimetype || '—'],
            ['Size', pickerPreview.size ? formatSize(pickerPreview.size) : '—'],
            ['Ngày', pickerPreview.createdAt ? new Date(pickerPreview.createdAt).toLocaleDateString('vi-VN') : '—'],
            ['Folder', pickerPreview.folderId?.name || '—'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start gap-2 px-2.5 py-1.5 border-b border-border last:border-0">
              <span className="text-[10px] text-muted-foreground font-medium w-12 shrink-0">{label}</span>
              <span className="text-[10px] text-foreground break-all flex-1 tabular-nums font-mono">{value}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Dùng ở</p>
          <PreviewUsageSection mediaId={pickerPreview._id} />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="rounded-[6px] bg-muted/60 border border-border px-2 py-1.5">
            <p className="text-[9px] text-muted-foreground break-all leading-relaxed font-mono">{pickerPreview.url}</p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(pickerPreview.url);
              toast.success('Đã copy URL');
            }}
            className="inline-flex h-7 w-full items-center justify-center gap-1 rounded-[6px] border border-border text-[10px] font-medium text-foreground hover:bg-accent transition-colors cursor-pointer active:scale-[0.98]"
          >
            <Copy size={11} /> Copy URL
          </button>
        </div>
      </div>
    </div>
  );
}
