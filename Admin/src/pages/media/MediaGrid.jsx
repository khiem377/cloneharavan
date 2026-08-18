import { useState } from 'react';
import { Check, Trash2, ExternalLink, Copy, Eye } from 'lucide-react';
import { toast } from '@/providers/ToastProvider';
import ImageLightbox from '@/components/ui/ImageLightbox';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

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

// ── Grid Card ─────────────────────────────────────────────────────────────────
function MediaCard({ item, selected, onToggle, onDelete, onPreview }) {
  const [imgError, setImgError] = useState(false);
  const isUsed = item.usedBy?.length > 0;

  const copyUrl = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.url);
    toast.success('Đã copy URL!');
  };

  return (
    <div className={`media-card ${selected ? 'selected' : ''}`} onClick={() => onToggle(item._id)}>
      <div className="media-thumb">
        {imgError ? (
          <div className="media-thumb-error">Lỗi ảnh</div>
        ) : (
          <img src={item.url} alt={item.filename} loading="lazy" onError={() => setImgError(true)} />
        )}
        {selected && <div className="media-check"><Check size={14} /></div>}
        {isUsed && (
          <span className="media-badge-used" title={`Đang dùng bởi: ${[...new Set(item.usedBy.map(u => u.model))].join(', ')}`}>
            Đang dùng
          </span>
        )}
      </div>
      <div className="media-info">
        <p className="media-name" title={item.filename}>{item.filename}</p>
        <span className="media-size">{formatSize(item.size)}</span>
      </div>
      <div className="media-actions">
        <button className="icon-btn-xs" title="Preview" onClick={(e) => { e.stopPropagation(); onPreview(item); }}>
          <Eye size={12} />
        </button>
        <button className="icon-btn-xs" onClick={copyUrl} title="Copy URL"><Copy size={12} /></button>
        <a href={item.url} target="_blank" rel="noreferrer" className="icon-btn-xs" title="Mở tab mới" onClick={e => e.stopPropagation()}>
          <ExternalLink size={12} />
        </a>
        <button className="icon-btn-xs danger" title="Xóa" onClick={(e) => { e.stopPropagation(); onDelete(item); }}>
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

// ── List Row ──────────────────────────────────────────────────────────────────
function MediaRow({ item, selected, onToggle, onDelete, onPreview }) {
  const [imgError, setImgError] = useState(false);
  const isUsed = item.usedBy?.length > 0;

  const copyUrl = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.url);
    toast.success('Đã copy URL!');
  };

  return (
    <div className={`media-row ${selected ? 'selected' : ''}`} onClick={() => onToggle(item._id)}>
      <div className="media-row-thumb">
        {imgError
          ? <div className="media-thumb-error" style={{ width: 36, height: 36 }}>!</div>
          : <img src={item.url} alt={item.filename} loading="lazy" onError={() => setImgError(true)} />}
      </div>
      <div className="media-row-name">
        <span>{item.filename}</span>
        {isUsed && (
          <span className="row-used-badge" title={`Dùng bởi: ${[...new Set(item.usedBy.map(u => u.model))].join(', ')}`}>
            đang dùng
          </span>
        )}
      </div>
      <span className="media-row-meta">{formatSize(item.size)}</span>
      <span className="media-row-meta">{item.width ? `${item.width}×${item.height}` : '—'}</span>
      <span className="media-row-meta">{formatDate(item.createdAt)}</span>
      <div className="media-row-actions" onClick={e => e.stopPropagation()}>
        <button className="icon-btn-xs" title="Preview" onClick={() => onPreview(item)}><Eye size={12} /></button>
        <button className="icon-btn-xs" onClick={copyUrl} title="Copy"><Copy size={12} /></button>
        <a href={item.url} target="_blank" rel="noreferrer" className="icon-btn-xs" title="Mở"><ExternalLink size={12} /></a>
        <button className="icon-btn-xs danger" title="Xóa" onClick={() => onDelete(item)}><Trash2 size={12} /></button>
      </div>
      {selected && <div className="media-row-check"><Check size={12} /></div>}
    </div>
  );
}

// ── Main MediaGrid ────────────────────────────────────────────────────────────
export default function MediaGrid({ items = [], selectedIds, onToggle, onDeleteConfirmed, isLoading, viewMode = 'grid' }) {
  const [preview, setPreview]           = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const skeletons = viewMode === 'grid'
    ? <div className="media-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="media-card skeleton" />)}</div>
    : <div className="media-list">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="media-row skeleton" style={{ height: 48 }} />)}</div>;

  if (isLoading) return skeletons;

  if (!items.length) {
    return (
      <div className="media-empty">
        <p>Chưa có ảnh nào</p>
        <span>Upload ảnh để bắt đầu</span>
      </div>
    );
  }

  return (
    <>
      {viewMode === 'grid' ? (
        <div className="media-grid">
          {items.map((item) => (
            <MediaCard key={item._id} item={item} selected={selectedIds.has(item._id)}
              onToggle={onToggle} onPreview={setPreview} onDelete={setDeleteTarget} />
          ))}
        </div>
      ) : (
        <div className="media-list">
          <div className="media-list-header">
            <span style={{ width: 40 }} />
            <span className="media-row-name">Tên file</span>
            <span className="media-row-meta">Kích thước</span>
            <span className="media-row-meta">Độ phân giải</span>
            <span className="media-row-meta">Ngày upload</span>
            <span style={{ width: 90 }} />
          </div>
          {items.map((item) => (
            <MediaRow key={item._id} item={item} selected={selectedIds.has(item._id)}
              onToggle={onToggle} onPreview={setPreview} onDelete={setDeleteTarget} />
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
    </>
  );
}
