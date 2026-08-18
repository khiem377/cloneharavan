import { useState } from 'react';
import { Check, Trash2, ExternalLink, Copy, Eye, FolderInput, Folder, Loader2 } from 'lucide-react';
import { toast } from '@/providers/ToastProvider';
import ImageLightbox from '@/components/ui/ImageLightbox';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { mediaService } from '@/services/media.service';

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function MoveModal({ item, folders, onClose, onMoved }) {
  const [selected, setSelected] = useState(item.folderId?._id || item.folderId || null);
  const [moving, setMoving] = useState(false);

  const handleMove = async () => {
    if (!selected) return;
    setMoving(true);
    try {
      await mediaService.move(item._id, selected);
      toast.success('Đã di chuyển file');
      onMoved();
      onClose();
    } catch { toast.error('Lỗi di chuyển file'); }
    finally { setMoving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4" onClick={onClose}>
      <div className="flex w-full max-w-sm flex-col rounded-xl border border-border bg-background p-5 shadow-xl text-foreground" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-foreground mb-3 truncate">Di chuyển: {item.filename}</h3>
        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto border border-border rounded-md p-1.5 bg-muted/20 my-2">
          {folders.map((f) => (
            <div
              key={f._id}
              className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${selected === f._id ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}
              onClick={() => setSelected(f._id)}
            >
              <Folder size={14} className="shrink-0" />
              <span style={{ paddingLeft: f.level * 12 }} className="truncate">{f.name}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 mt-3">
          <button className="inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" onClick={onClose}>Hủy</button>
          <button className="inline-flex h-8 items-center justify-center gap-1 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50" onClick={handleMove} disabled={!selected || moving}>
            {moving ? <Loader2 size={13} className="animate-spin" /> : <FolderInput size={13} />}
            Di chuyển
          </button>
        </div>
      </div>
    </div>
  );
}

function MediaCard({ item, selected, onToggle, onDelete, onPreview, onMove }) {
  const [imgError, setImgError] = useState(false);
  const isUsed = item.usedBy?.length > 0;

  const copyUrl = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.url);
    toast.success('Đã copy URL!');
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('mediaId', item._id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className={`group relative flex flex-col rounded-xl border-2 transition-all bg-card overflow-hidden cursor-pointer select-none ${selected ? 'border-primary ring-2 ring-primary/30 shadow-md' : 'border-border hover:border-primary/50 shadow-2xs'}`}
      onClick={() => onToggle(item._id)}
      draggable
      onDragStart={handleDragStart}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {imgError ? (
          <div className="flex size-full items-center justify-center text-xs text-muted-foreground">Lỗi ảnh</div>
        ) : (
          <img src={item.url} alt={item.filename} loading="lazy" className="size-full object-cover" onError={() => setImgError(true)} />
        )}
        {selected && (
          <div className="absolute top-2 right-2 size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs z-10">
            <Check size={12} />
          </div>
        )}
        {isUsed && (
          <span className="absolute top-2 left-2 rounded bg-amber-500/90 text-amber-950 px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase z-10" title={`Đang dùng bởi: ${[...new Set(item.usedBy.map(u => u.model))].join(', ')}`}>
            Đang dùng
          </span>
        )}
      </div>

      <div className="p-2.5 flex flex-col gap-0.5 border-t border-border">
        <p className="font-semibold text-xs text-foreground truncate" title={item.filename}>{item.filename}</p>
        <span className="text-[11px] text-muted-foreground">{formatSize(item.size)}</span>
      </div>

      <div className="flex items-center justify-around p-1.5 border-t border-border bg-muted/40 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" title="Preview" onClick={(e) => { e.stopPropagation(); onPreview(item); }}>
          <Eye size={12} />
        </button>
        <button className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" title="Di chuyển" onClick={(e) => { e.stopPropagation(); onMove(item); }}>
          <FolderInput size={12} />
        </button>
        <button className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" onClick={copyUrl} title="Copy URL"><Copy size={12} /></button>
        <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" title="Mở tab mới" onClick={e => e.stopPropagation()}>
          <ExternalLink size={12} />
        </a>
        <button className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer" title="Xóa" onClick={(e) => { e.stopPropagation(); onDelete(item); }}>
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

function MediaRow({ item, selected, onToggle, onDelete, onPreview, onMove }) {
  const [imgError, setImgError] = useState(false);
  const isUsed = item.usedBy?.length > 0;

  const copyUrl = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.url);
    toast.success('Đã copy URL!');
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('mediaId', item._id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors cursor-pointer ${selected ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border bg-card hover:bg-muted/40'}`}
      onClick={() => onToggle(item._id)}
      draggable
      onDragStart={handleDragStart}
    >
      <div className="size-10 rounded-md border border-border overflow-hidden bg-muted shrink-0">
        {imgError
          ? <div className="flex size-full items-center justify-center text-xs text-muted-foreground">!</div>
          : <img src={item.url} alt={item.filename} loading="lazy" className="size-full object-cover" onError={() => setImgError(true)} />}
      </div>
      <div className="flex flex-1 items-center gap-2 min-w-0">
        <span className="font-medium text-xs text-foreground truncate">{item.filename}</span>
        {isUsed && (
          <span className="rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold shrink-0" title={`Dùng bởi: ${[...new Set(item.usedBy.map(u => u.model))].join(', ')}`}>
            đang dùng
          </span>
        )}
      </div>
      <span className="text-xs text-muted-foreground w-20 shrink-0">{formatSize(item.size)}</span>
      <span className="text-xs text-muted-foreground w-24 shrink-0">{item.width ? `${item.width}×${item.height}` : '—'}</span>
      <span className="text-xs text-muted-foreground w-24 shrink-0">{formatDate(item.createdAt)}</span>
      <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
        <button className="inline-flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" title="Preview" onClick={() => onPreview(item)}><Eye size={12} /></button>
        <button className="inline-flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" title="Move" onClick={() => onMove(item)}><FolderInput size={12} /></button>
        <button className="inline-flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" onClick={copyUrl} title="Copy"><Copy size={12} /></button>
        <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" title="Mở"><ExternalLink size={12} /></a>
        <button className="inline-flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer" title="Xóa" onClick={() => onDelete(item)}><Trash2 size={12} /></button>
      </div>
    </div>
  );
}

export default function MediaGrid({ items = [], selectedIds, onToggle, onDeleteConfirmed, onRefresh, isLoading, viewMode = 'grid', allFolders = [] }) {
  const [preview, setPreview] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [moveTarget, setMoveTarget] = useState(null);

  if (isLoading) {
    return (
      <div className="flex-1 p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse border border-border" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-center text-muted-foreground flex-1">
        <p className="font-semibold text-sm text-foreground">Chưa có ảnh nào</p>
        <span className="text-xs">Upload ảnh để bắt đầu</span>
      </div>
    );
  }

  return (
    <>
      {viewMode === 'grid' ? (
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 align-content-start">
          {items.map((item) => (
            <MediaCard key={item._id} item={item} selected={selectedIds.has(item._id)}
              onToggle={onToggle} onPreview={setPreview} onDelete={setDeleteTarget} onMove={setMoveTarget} />
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          <div className="flex items-center gap-3 px-2 py-1 text-xs font-semibold text-muted-foreground uppercase border-b border-border mb-1">
            <span className="w-10 shrink-0" />
            <span className="flex-1">Tên file</span>
            <span className="w-20 shrink-0">Kích thước</span>
            <span className="w-24 shrink-0">Độ phân giải</span>
            <span className="w-24 shrink-0">Ngày upload</span>
            <span className="w-36 shrink-0 text-right">Thao tác</span>
          </div>
          {items.map((item) => (
            <MediaRow key={item._id} item={item} selected={selectedIds.has(item._id)}
              onToggle={onToggle} onPreview={setPreview} onDelete={setDeleteTarget} onMove={setMoveTarget} />
          ))}
        </div>
      )}

      {preview && <ImageLightbox image={preview} onClose={() => setPreview(null)} />}

      {deleteTarget && (
        <ConfirmDialog
          title="Xóa ảnh"
          message={`Xóa "${deleteTarget.filename}"?${deleteTarget.usedBy?.length ? ` File này đang được dùng bởi ${[...new Set(deleteTarget.usedBy.map(u => u.model))].join(', ')}.` : ''} Hành động không thể hoàn tác.`}
          confirmText="Xóa ảnh"
          variant="danger"
          onConfirm={() => { onDeleteConfirmed(deleteTarget._id); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {moveTarget && (
        <MoveModal
          item={moveTarget}
          folders={allFolders}
          onClose={() => setMoveTarget(null)}
          onMoved={onRefresh}
        />
      )}
    </>
  );
}
