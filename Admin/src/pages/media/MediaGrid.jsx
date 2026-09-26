import { useState } from 'react';
import { Check, Trash2, ExternalLink, Copy, Eye, FolderInput, Folder, Loader2, Pencil, Tag, Info } from '@/components/ui/Icons';
import { toast } from '@/providers/ToastProvider';
import { mediaService } from '@/services/media.service';

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

// ── Shared modal shell ──────────────────────────────────────────────────────
function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4" onClick={onClose}>
      <div className="flex w-full max-w-sm flex-col rounded-xl border border-border bg-background p-5 shadow-xl text-foreground" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-foreground mb-3 truncate">{title}</h3>
        {children}
      </div>
    </div>
  );
}

// ── Move Modal ──────────────────────────────────────────────────────────────
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
    <ModalShell title={`Di chuyển: ${item.filename}`} onClose={onClose}>
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
    </ModalShell>
  );
}

// ── Rename Modal ────────────────────────────────────────────────────────────
function RenameModal({ item, onClose, onRenamed }) {
  const [filename, setFilename] = useState(item.filename);
  const [saving, setSaving] = useState(false);

  const handleRename = async () => {
    const trimmed = filename.trim();
    if (!trimmed || trimmed === item.filename) { onClose(); return; }
    setSaving(true);
    try {
      await mediaService.rename(item._id, trimmed);
      toast.success('Đổi tên thành công');
      onRenamed();
      onClose();
    } catch { toast.error('Lỗi đổi tên file'); }
    finally { setSaving(false); }
  };

  return (
    <ModalShell title="Đổi tên file" onClose={onClose}>
      <input
        className="w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 mt-1"
        value={filename}
        onChange={(e) => setFilename(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') onClose(); }}
        autoFocus
      />
      <div className="flex items-center justify-end gap-2 mt-3">
        <button className="inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" onClick={onClose}>Hủy</button>
        <button className="inline-flex h-8 items-center justify-center gap-1 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50" onClick={handleRename} disabled={saving || !filename.trim()}>
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Pencil size={13} />}
          Lưu
        </button>
      </div>
    </ModalShell>
  );
}

// ── Meta Modal (altText + caption) ─────────────────────────────────────────
function MetaModal({ item, onClose, onSaved }) {
  const [altText, setAltText] = useState(item.altText || '');
  const [caption, setCaption] = useState(item.caption || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await mediaService.updateMeta(item._id, { altText, caption });
      toast.success('Cập nhật thông tin ảnh thành công');
      onSaved();
      onClose();
    } catch { toast.error('Lỗi cập nhật thông tin'); }
    finally { setSaving(false); }
  };

  return (
    <ModalShell title="Alt text & Caption" onClose={onClose}>
      <div className="flex flex-col gap-3 mt-1">
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-1">
            Alt text <span className="text-[10px]">(SEO, accessibility — không bắt buộc)</span>
          </label>
          <input
            className="w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Mô tả nội dung ảnh..."
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-1">
            Caption <span className="text-[10px]">(chú thích bên dưới ảnh — không bắt buộc)</span>
          </label>
          <textarea
            className="w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            rows={3}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Chú thích ảnh..."
          />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-3">
        <button className="inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" onClick={onClose}>Hủy</button>
        <button className="inline-flex h-8 items-center justify-center gap-1 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Tag size={13} />}
          Lưu
        </button>
      </div>
    </ModalShell>
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

function FolderCard({ folder, onClick, onDropMedia }) {
  const [dragOver, setDragOver] = useState(false);
  injectWave();

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const mediaId = e.dataTransfer.getData('mediaId');
    if (mediaId && onDropMedia) onDropMedia(mediaId, folder._id);
  };

  return (
    <div
      onClick={() => onClick?.(folder._id)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`media-wave-in group relative flex items-center gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer select-none shadow-2xs ${
        dragOver
          ? 'border-primary bg-primary/10 scale-[1.02]'
          : 'border-border bg-card hover:border-amber-500/60 hover:bg-amber-500/5'
      }`}
    >
      <div className={`size-9 rounded-md flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
        dragOver ? 'bg-primary/15 text-primary' : 'bg-amber-500/10 text-amber-600'
      }`}>
        <Folder size={18} />
      </div>
      <div className="overflow-hidden flex-1">
        <p className="text-xs font-semibold text-foreground truncate" title={folder.name}>{folder.name}</p>
        <span className="text-[10px] text-muted-foreground font-mono">
          {dragOver ? 'Thả vào đây' : 'Thư mục'}
        </span>
      </div>
    </div>
  );
}

function MediaCard({ item, selected, onToggle, onDeleteRequest, onPreview, onMove, onRename, onMeta, onUsage, animDelay = 0, isUsed = false }) {
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
      {/* Thumbnail */}
      <div className="relative overflow-hidden bg-muted" style={{ height: 80 }}>
        {imgError ? (
          <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">Lỗi</div>
        ) : (
          <img src={item.url} alt={item.altText || item.filename} loading="lazy" className="size-full object-cover transition-transform duration-200 group-hover:scale-105" onError={() => setImgError(true)} />
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
          <button className="text-white/80 hover:text-white cursor-pointer p-0.5" title="Doi ten" onClick={(e) => { e.stopPropagation(); onRename(item); }}>
            <Pencil size={11} />
          </button>
          <button className="text-white/80 hover:text-white cursor-pointer p-0.5" title="Alt text & Caption" onClick={(e) => { e.stopPropagation(); onMeta(item); }}>
            <Tag size={11} />
          </button>
          <button className="text-white/80 hover:text-white cursor-pointer p-0.5" title="Di chuyen" onClick={(e) => { e.stopPropagation(); onMove(item); }}>
            <FolderInput size={11} />
          </button>
          {isUsed && (
            <button className="text-amber-300 hover:text-amber-200 cursor-pointer p-0.5" title="Xem noi dung dang dung anh nay" onClick={(e) => { e.stopPropagation(); onUsage?.(item); }}>
              <Info size={11} />
            </button>
          )}
          <button className="text-white/80 hover:text-white cursor-pointer p-0.5" title="Copy URL" onClick={copyUrl}>
            <Copy size={11} />
          </button>
          <a href={item.url} target="_blank" rel="noreferrer" className="text-white/80 hover:text-white cursor-pointer p-0.5" title="Mo tab moi" onClick={e => e.stopPropagation()}>
            <ExternalLink size={11} />
          </a>
          <button className="text-red-300 hover:text-red-200 cursor-pointer p-0.5" title="Xoa" onClick={(e) => { e.stopPropagation(); onDeleteRequest(item); }}>
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

function MediaRow({ item, selected, onToggle, onDeleteRequest, onPreview, onMove, onRename, onMeta, animDelay = 0, isUsed = false }) {
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
          : <img src={item.url} alt={item.altText || item.filename} loading="lazy" className="size-full object-cover" onError={() => setImgError(true)} />}
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
        <button className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" title="Preview"    onClick={() => onPreview(item)}><Eye size={11} /></button>
        <button className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" title="Đổi tên"  onClick={() => onRename(item)}><Pencil size={11} /></button>
        <button className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" title="Alt & Caption" onClick={() => onMeta(item)}><Tag size={11} /></button>
        <button className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" title="Di chuyển" onClick={() => onMove(item)}><FolderInput size={11} /></button>
        <button className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" onClick={copyUrl} title="Copy"><Copy size={11} /></button>
        <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" title="Mở"><ExternalLink size={11} /></a>
        <button className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer" title="Xóa" onClick={() => onDeleteRequest(item)}><Trash2 size={11} /></button>
      </div>
    </div>
  );
}

export default function MediaGrid({
  items = [], folders = [], selectedIds, onToggle, onPreview,
  onDeleteRequest, onUsage, onRefresh, isLoading, viewMode = 'grid', allFolders = [],
  columns = 6, usagesMap = {}, onFolderClick, onDropToFolder,
}) {
  const [moveTarget,   setMoveTarget]   = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [metaTarget,   setMetaTarget]   = useState(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 w-full">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse border border-border" />
        ))}
      </div>
    );
  }

  const hasItems   = items.length > 0;
  const hasFolders = folders.length > 0;

  if (!hasItems && !hasFolders) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-center text-muted-foreground">
        <p className="font-semibold text-sm text-foreground">Chưa có kết quả nào</p>
        <span className="text-xs">Không tìm thấy ảnh hoặc thư mục phù hợp</span>
      </div>
    );
  }

  const sharedCardProps = (item) => ({
    item,
    selected:        selectedIds.has(item._id),
    onToggle,
    onPreview,
    onDeleteRequest,
    onUsage,
    onMove:          setMoveTarget,
    onRename:        setRenameTarget,
    onMeta:          setMetaTarget,
    isUsed:          !!(usagesMap[item._id]?.length),
  });

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Folder Cards */}
      {hasFolders && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Thư mục ({folders.length})</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {folders.map((f) => (
              <FolderCard key={f._id} folder={f} onClick={onFolderClick} onDropMedia={onDropToFolder} />
            ))}
          </div>
        </div>
      )}

      {/* Media Items */}
      {hasItems && (
        <div className="space-y-2">
          {hasFolders && (
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Hình ảnh & Video ({items.length})</p>
          )}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 w-full">
              {items.map((item, idx) => (
                <MediaCard key={item._id} {...sharedCardProps(item)} animDelay={Math.min(idx * 15, 300)} />
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
                <span className="w-40 shrink-0 text-right">Thao tác</span>
              </div>
              {items.map((item, idx) => (
                <MediaRow key={item._id} {...sharedCardProps(item)} animDelay={Math.min(idx * 18, 220)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {moveTarget && (
        <MoveModal item={moveTarget} folders={allFolders} onClose={() => setMoveTarget(null)} onMoved={onRefresh} />
      )}
      {renameTarget && (
        <RenameModal item={renameTarget} onClose={() => setRenameTarget(null)} onRenamed={onRefresh} />
      )}
      {metaTarget && (
        <MetaModal item={metaTarget} onClose={() => setMetaTarget(null)} onSaved={onRefresh} />
      )}
    </div>
  );
}
