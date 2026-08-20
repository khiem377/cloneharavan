import { useState } from 'react';
import { Check, Trash2, ExternalLink, Copy, Eye, FolderInput, Folder, Loader2 } from '@/components/ui/Icons';
import { toast } from '@/providers/ToastProvider';

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
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

/* ── Wave-in animation ── */
const WAVE_CSS = `
@keyframes media-wave-in {
  from { opacity: 0; transform: translateY(6px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)   scale(1);    }
}
.media-wave-in { animation: media-wave-in 0.22s cubic-bezier(.22,.68,0,1.2) both; }
`;
let _waveInjected = false;
function injectWave() {
  if (_waveInjected) return;
  _waveInjected = true;
  const s = document.createElement('style');
  s.textContent = WAVE_CSS;
  document.head.appendChild(s);
}

function MediaCard({ item, selected, onToggle, onDeleteRequest, onPreview, onMove, animDelay = 0, isUsed = false }) {
  const [imgError, setImgError] = useState(false);
  injectWave();

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
      className={`media-wave-in group relative flex flex-col rounded-lg border transition-all bg-card overflow-hidden cursor-pointer select-none ${selected ? 'border-primary ring-2 ring-primary/25 shadow-md' : 'border-border hover:border-primary/40 shadow-2xs hover:shadow-sm'}`}
      style={{ animationDelay: `${animDelay}ms` }}
      onClick={() => onToggle(item._id)}
      draggable
      onDragStart={handleDragStart}
    >
      {/* Thumbnail — fixed 80px height, compact */}
      <div className="relative overflow-hidden bg-muted" style={{ height: 80 }}>
        {imgError ? (
          <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">Lỗi</div>
        ) : (
          <img src={item.url} alt={item.filename} loading="lazy" className="size-full object-cover transition-transform duration-200 group-hover:scale-105" onError={() => setImgError(true)} />
        )}
        {selected && (
          <div className="absolute top-1 right-1 size-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs z-10">
            <Check size={10} />
          </div>
        )}
        {isUsed && (
          <span className="absolute top-1 left-1 rounded bg-amber-500/85 text-amber-950 px-1 py-px text-[8px] font-bold tracking-wide uppercase z-10">
            Đang dùng
          </span>
        )}
        {/* Hover actions overlay */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-around bg-black/60 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button className="text-white/80 hover:text-white cursor-pointer p-0.5" title="Preview" onClick={(e) => { e.stopPropagation(); onPreview(item); }}>
            <Eye size={11} />
          </button>
          <button className="text-white/80 hover:text-white cursor-pointer p-0.5" title="Di chuyển" onClick={(e) => { e.stopPropagation(); onMove(item); }}>
            <FolderInput size={11} />
          </button>
          <button className="text-white/80 hover:text-white cursor-pointer p-0.5" title="Copy URL" onClick={copyUrl}>
            <Copy size={11} />
          </button>
          <a href={item.url} target="_blank" rel="noreferrer" className="text-white/80 hover:text-white cursor-pointer p-0.5" title="Mở tab mới" onClick={e => e.stopPropagation()}>
            <ExternalLink size={11} />
          </a>
          <button className="text-red-300 hover:text-red-200 cursor-pointer p-0.5" title="Xóa" onClick={(e) => { e.stopPropagation(); onDeleteRequest(item); }}>
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {/* Filename + size */}
      <div className="px-1.5 py-1 flex flex-col gap-px">
        <p className="text-[10px] font-medium text-foreground truncate leading-snug" title={item.filename}>{item.filename}</p>
        <span className="text-[9px] text-muted-foreground">{formatSize(item.size)}</span>
      </div>
    </div>
  );
}

function MediaRow({ item, selected, onToggle, onDeleteRequest, onPreview, onMove, animDelay = 0, isUsed = false }) {
  const [imgError, setImgError] = useState(false);
  injectWave();

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
      className={`media-wave-in flex items-center gap-3 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${selected ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border bg-card hover:bg-muted/40'}`}
      style={{ animationDelay: `${animDelay}ms` }}
      onClick={() => onToggle(item._id)}
      draggable
      onDragStart={handleDragStart}
    >
      <div className="size-9 rounded-md border border-border overflow-hidden bg-muted shrink-0">
        {imgError
          ? <div className="flex size-full items-center justify-center text-xs text-muted-foreground">!</div>
          : <img src={item.url} alt={item.filename} loading="lazy" className="size-full object-cover" onError={() => setImgError(true)} />}
      </div>
      <div className="flex flex-1 items-center gap-2 min-w-0">
        <span className="font-medium text-xs text-foreground truncate">{item.filename}</span>
        {isUsed && (
          <span className="rounded bg-amber-500/10 text-amber-700 border border-amber-500/20 px-1.5 py-px text-[9px] font-semibold shrink-0">đang dùng</span>
        )}
      </div>
      <span className="text-[10px] text-muted-foreground w-16 shrink-0">{formatSize(item.size)}</span>
      <span className="text-[10px] text-muted-foreground w-20 shrink-0 hidden lg:block">{item.width ? `${item.width}×${item.height}` : '—'}</span>
      <span className="text-[10px] text-muted-foreground w-20 shrink-0 hidden lg:block">{formatDate(item.createdAt)}</span>
      <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
        <button className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" title="Preview" onClick={() => onPreview(item)}><Eye size={11} /></button>
        <button className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" title="Move" onClick={() => onMove(item)}><FolderInput size={11} /></button>
        <button className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" onClick={copyUrl} title="Copy"><Copy size={11} /></button>
        <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" title="Mở"><ExternalLink size={11} /></a>
        <button className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer" title="Xóa" onClick={() => onDeleteRequest(item)}><Trash2 size={11} /></button>
      </div>
    </div>
  );
}

/**
 * MediaGrid — onPreview is called with the full item object to show the side panel.
 * ImageLightbox removed: preview is handled by the parent page's PreviewPanel.
 */
export default function MediaGrid({
  items = [], selectedIds, onToggle, onPreview,
  onDeleteRequest, onRefresh, isLoading, viewMode = 'grid', allFolders = [],
  columns = 6, usagesMap = {},
}) {
  const [moveTarget, setMoveTarget] = useState(null);

  // Internal preview handler: bubble up to parent if prop provided, else noop
  const handlePreview = (item) => {
    if (onPreview) onPreview(item);
  };

  if (isLoading) {
    return (
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, 120px)' }}>
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="rounded-lg bg-muted animate-pulse border border-border" style={{ height: 100 }} />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-center text-muted-foreground">
        <p className="font-semibold text-sm text-foreground">Chưa có ảnh nào</p>
        <span className="text-xs">Upload ảnh để bắt đầu</span>
      </div>
    );
  }

  return (
    <>
      {viewMode === 'grid' ? (
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, 120px)' }}>
          {items.map((item, idx) => (
            <MediaCard key={item._id} item={item} selected={selectedIds.has(item._id)}
              onToggle={onToggle} onPreview={handlePreview} onDeleteRequest={onDeleteRequest} onMove={setMoveTarget}
              animDelay={Math.min(idx * 15, 300)}
              isUsed={!!(usagesMap[item._id]?.length)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground uppercase border-b border-border mb-1">
            <span className="w-9 shrink-0" />
            <span className="flex-1">Tên file</span>
            <span className="w-16 shrink-0">Kích thước</span>
            <span className="w-20 shrink-0 hidden lg:block">Phân giải</span>
            <span className="w-20 shrink-0 hidden lg:block">Ngày</span>
            <span className="w-32 shrink-0 text-right">Thao tác</span>
          </div>
          {items.map((item, idx) => (
            <MediaRow key={item._id} item={item} selected={selectedIds.has(item._id)}
              onToggle={onToggle} onPreview={handlePreview} onDeleteRequest={onDeleteRequest} onMove={setMoveTarget}
              animDelay={Math.min(idx * 18, 220)}
              isUsed={!!(usagesMap[item._id]?.length)}
            />
          ))}
        </div>
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
