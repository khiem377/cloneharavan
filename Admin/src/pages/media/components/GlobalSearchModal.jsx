import React, { useState } from 'react';
import { Search, X, Copy, ExternalLink } from '@/components/ui/Icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DataTablePagination from '@/components/ui/DataTablePagination';
import { useMediaSearch } from '@/hooks/useMedia';
import { toast } from '@/providers/ToastProvider';

function SearchResultCard({ item, isActive, onClick, animDelay }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div
      className={`group relative flex flex-col rounded-[6px] border cursor-pointer overflow-hidden transition-all bg-card media-wave-in ${isActive ? 'border-primary ring-2 ring-primary/20 shadow-xs' : 'border-border hover:border-primary/40'}`}
      style={{ animationDelay: `${animDelay}ms` }}
      onClick={onClick}
    >
      <div className="relative overflow-hidden bg-muted" style={{ aspectRatio: '1' }}>
        {imgErr
          ? <div className="flex size-full items-center justify-center text-[9px] text-muted-foreground">Err</div>
          : <img src={item.url} alt={item.filename} loading="lazy" className="size-full object-cover group-hover:scale-105 transition-transform duration-200" onError={() => setImgErr(true)} />}
      </div>
      <div className="px-1.5 py-1">
        <p className="text-[9px] font-medium text-foreground truncate" title={item.filename}>{item.filename}</p>
      </div>
    </div>
  );
}

export default function GlobalSearchModal({ query, onClose }) {
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState(null);
  const { data, isLoading } = useMediaSearch({ q: query, page, limit: 24, sortBy: 'createdAt', sortDir: 'desc' });
  const items = data?.media ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const fmtSize = (b) => !b ? '' : b < 1024 * 1024 ? (b / 1024).toFixed(0) + ' KB' : (b / 1024 / 1024).toFixed(1) + ' MB';

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[85vh] h-[85vh] flex p-0 rounded-[6px] border border-border overflow-hidden">
        {/* Left: results */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <DialogHeader className="px-5 py-3.5 border-b border-border shrink-0 bg-muted/20 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <Search size={15} className="text-muted-foreground" />
              <DialogTitle className="text-sm font-semibold text-foreground">Kết quả tìm kiếm:</DialogTitle>
              <span className="text-sm font-bold font-mono text-primary tabular-nums">{total}</span>
              <span className="text-xs text-muted-foreground">ảnh khớp với</span>
              <Badge variant="secondary" className="rounded-[4px] text-xs font-semibold px-2 py-0">"{query}"</Badge>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))' }}>
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="rounded-[4px] bg-muted animate-pulse border border-border" style={{ aspectRatio: '1' }} />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <p className="text-xs font-mono">Không tìm thấy kết quả nào</p>
              </div>
            ) : (
              <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))' }}>
                {items.map((item, idx) => (
                  <SearchResultCard
                    key={item._id}
                    item={item}
                    isActive={preview?._id === item._id}
                    onClick={() => setPreview(item)}
                    animDelay={Math.min(idx * 15, 200)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="px-4 pb-3 shrink-0">
            <DataTablePagination
              page={page} pageSize={24} total={total} totalPages={totalPages}
              onPageChange={setPage} showPageSize={false} showJumpToPage={totalPages > 3}
            />
          </div>
        </div>

        {/* Right: Preview */}
        <div className="w-64 shrink-0 border-l border-border flex flex-col bg-muted/10">
          {preview ? (
            <>
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-border shrink-0">
                <span className="text-[11px] font-semibold text-foreground">Preview</span>
                <Button variant="ghost" size="icon" onClick={() => setPreview(null)} className="size-5 rounded-[4px]">
                  <X size={10} />
                </Button>
              </div>
              <div className="flex items-center justify-center border-b border-border bg-[repeating-conic-gradient(#80808015_0%_25%,transparent_0%_50%)] bg-[length:12px_12px]" style={{ height: 180 }}>
                {preview.mimetype?.startsWith('image/')
                  ? <img src={preview.url} alt={preview.filename} className="max-h-[176px] max-w-full object-contain" />
                  : <span className="text-3xl font-extrabold text-muted-foreground/20 font-mono">{preview.filename?.split('.').pop()?.toUpperCase()}</span>
                }
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3 text-xs">
                <p className="text-[11px] font-semibold text-foreground break-all leading-relaxed">{preview.filename}</p>
                <div className="rounded-[4px] border border-border overflow-hidden font-mono tabular-nums">
                  {[['Loại', preview.mimeType], ['Size', fmtSize(preview.size)], ['Ngày', preview.createdAt ? new Date(preview.createdAt).toLocaleDateString('vi-VN') : '—'], ['Folder', preview.folderId?.name || 'Gốc']].map(([l, v]) => (
                    <div key={l} className="flex gap-2 px-2.5 py-1.5 border-b border-border last:border-0">
                      <span className="text-[10px] text-muted-foreground w-12 shrink-0">{l}</span>
                      <span className="text-[10px] text-foreground break-all flex-1">{v || '—'}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-[4px] bg-muted/60 border border-border px-2 py-1.5 font-mono">
                  <p className="text-[9px] text-muted-foreground break-all leading-relaxed">{preview.url}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(preview.url); toast.success('Đã copy!'); }}
                  className="h-7 w-full rounded-[4px] text-[10px]">
                  <Copy size={11} className="mr-1" /> Copy URL
                </Button>
                <Button size="sm" asChild className="h-7 w-full rounded-[4px] text-[10px]">
                  <a href={preview.url} target="_blank" rel="noreferrer">
                    <ExternalLink size={11} className="mr-1" /> Mở ảnh
                  </a>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
              <Search size={24} className="mb-2 opacity-30" />
              <p className="text-xs">Click vào ảnh để xem preview</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
