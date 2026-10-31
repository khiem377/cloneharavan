import React from 'react';
import { X, Copy, ExternalLink } from '@/components/ui/Icons';
import { Button } from '@/components/ui/button';
import { toast } from '@/providers/ToastProvider';

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function MediaPreviewPanel({ item, onClose }) {
  if (!item) return null;
  const mime = item.mimeType || item.mimetype || '';
  const isImage = mime.startsWith('image/') || /\.(jpe?g|png|gif|webp|svg|bmp|avif|ico)$/i.test(item.filename || '');
  const ext = item.filename?.split('.').pop()?.toUpperCase() || '—';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(item.url);
    toast.success('Đã copy URL');
  };

  return (
    <div className="flex flex-col h-full border-l border-border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <span className="text-xs font-semibold text-foreground">Preview</span>
        <Button variant="ghost" size="icon" onClick={onClose} className="size-6 rounded-[4px] text-muted-foreground hover:text-foreground">
          <X size={13} />
        </Button>
      </div>

      {/* Image preview area */}
      <div className="flex items-center justify-center bg-[repeating-conic-gradient(#80808015_0%_25%,transparent_0%_50%)] bg-[length:16px_16px] border-b border-border shrink-0" style={{ height: 200 }}>
        {isImage ? (
          <img src={item.url} alt={item.filename} className="max-h-[196px] max-w-full object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground font-mono">
            <span className="text-4xl font-extrabold text-muted-foreground/20">{ext}</span>
          </div>
        )}
      </div>

      {/* Meta info */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 text-xs">
        <p className="text-xs font-semibold text-foreground break-all leading-relaxed">{item.filename}</p>

        <div className="flex flex-col gap-0 rounded-[6px] border border-border overflow-hidden font-mono tabular-nums">
          {[
            ['Loại file', item.mimetype || ext],
            ['Kích thước', formatSize(item.size)],
            ['Ngày tạo', formatDate(item.createdAt)],
            ['Thư mục', item.folderId?.name || 'Gốc'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start gap-2 px-3 py-2 border-b border-border last:border-0">
              <span className="text-[11px] text-muted-foreground font-medium w-20 shrink-0 pt-px">{label}</span>
              <span className="text-[11px] text-foreground break-all flex-1">{value}</span>
            </div>
          ))}
        </div>

        {/* URL box */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Đường dẫn</span>
          <div className="rounded-[4px] bg-muted/50 border border-border px-2.5 py-2 font-mono">
            <p className="text-[10px] text-muted-foreground break-all leading-relaxed">{item.url}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 px-4 py-3 border-t border-border shrink-0">
        <Button variant="outline" size="sm" onClick={handleCopyUrl} className="h-8 w-full rounded-[6px] text-xs">
          <Copy size={13} className="mr-1.5" /> Copy URL
        </Button>
        <Button size="sm" asChild className="h-8 w-full rounded-[6px] text-xs active:scale-[0.98] transition-transform">
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={13} className="mr-1.5" /> Mở ảnh
          </a>
        </Button>
      </div>
    </div>
  );
}
