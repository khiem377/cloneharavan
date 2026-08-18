import { useState, useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Search, X, Check, ChevronRight, Home, FolderOpen,
  FolderPlus, Upload, Link, Loader2, Pencil, Trash2,
} from 'lucide-react';
import { useMedia, useMediaSearch } from '@/hooks/useMedia';
import { useFolders, FOLDERS_KEY } from '@/hooks/useFolders';
import { mediaService } from '@/services/media.service';
import { folderService } from '@/services/folder.service';
import { useDropzone } from 'react-dropzone';
import { toast } from '@/providers/ToastProvider';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function formatSize(b) {
  if (!b) return '';
  if (b < 1024 * 1024) return (b / 1024).toFixed(0) + ' KB';
  return (b / (1024 * 1024)).toFixed(1) + ' MB';
}

// Flatten folder tree
function buildFolderMap(folders) {
  const map = {};
  const walk = (items) => items.forEach(f => {
    map[f._id] = f;
    if (f.children) walk(f.children);
  });
  walk(folders);
  return map;
}

function buildBreadcrumb(map, id) {
  const crumbs = [];
  let cur = map[id];
  while (cur) { crumbs.unshift(cur); cur = cur.parentId ? map[cur.parentId] : null; }
  return crumbs;
}

function getDepth(map, id) {
  let depth = 0, cur = map[id];
  while (cur?.parentId) { depth++; cur = map[cur.parentId]; }
  return depth;
}

// ── Folder Context Menu ────────────────────────────────────────────────────────
function FolderCtxMenu({ x, y, folder, folderMap, onClose, onAddChild, onRename, onDelete }) {
  const ref = useRef(null);
  const depth = getDepth(folderMap, folder._id);
  const canAddChild = depth < 2; // max 3 levels (0,1,2)

  useEffect(() => {
    const handleClick = () => onClose();
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="ctx-menu"
      style={{ position: 'fixed', top: y, left: x, zIndex: 10060 }}
      onClick={e => e.stopPropagation()}
      onContextMenu={e => e.preventDefault()}
    >
      {canAddChild && (
        <button className="ctx-item" onClick={() => { onClose(); onAddChild(folder._id); }}>
          <FolderPlus size={13} /> Tạo thư mục con
        </button>
      )}
      <button className="ctx-item" onClick={() => { onClose(); onRename(folder); }}>
        <Pencil size={13} /> Đổi tên
      </button>
      <div className="ctx-divider" />
      <button className="ctx-item danger" onClick={() => { onClose(); onDelete(folder); }}>
        <Trash2 size={13} /> Xóa thư mục
      </button>
    </div>
  );
}

// ── Folder Tree item ───────────────────────────────────────────────────────────
function FolderNode({ folder, depth = 0, selectedId, folderMap, onSelect, onCtxMenu }) {
  const [open, setOpen] = useState(depth === 0);
  const hasChildren = folder.children?.length > 0;
  const isActive = folder._id === selectedId;

  return (
    <div>
      <div
        className={`picker-folder-node ${isActive ? 'active' : ''}`}
        style={{ paddingLeft: 8 + depth * 14 }}
        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onCtxMenu(e, folder); }}
      >
        <button className="picker-chevron" style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
          onClick={() => setOpen(!open)}>
          <ChevronRight size={11} style={{ transform: open ? 'rotate(90deg)' : '', transition: 'transform .15s' }} />
        </button>
        <button className="picker-folder-btn" onClick={() => onSelect(folder._id)}>
          <FolderOpen size={12} />
          <span>{folder.name}</span>
        </button>
      </div>
      {open && hasChildren && folder.children.map(c => (
        <FolderNode key={c._id} folder={c} depth={depth + 1} selectedId={selectedId}
          folderMap={folderMap} onSelect={onSelect} onCtxMenu={onCtxMenu} />
      ))}
    </div>
  );
}

// ── New Folder Input ───────────────────────────────────────────────────────────
function NewFolderInput({ parentId, folderMap, onCreated, onCancel }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const depth = parentId ? getDepth(folderMap, parentId) + 1 : 0;
  const blocked = depth >= 3;

  if (blocked) {
    return (
      <div className="new-folder-row">
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Đã đạt tối đa 3 cấp</span>
        <button className="btn-ghost-sm" onClick={onCancel}>Đóng</button>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await folderService.create({ name: name.trim(), parentId: parentId || null });
      qc.invalidateQueries({ queryKey: FOLDERS_KEY });
      qc.invalidateQueries({ predicate: q => q.queryKey[0] === 'media' });
      toast.success('Tạo thư mục thành công');
      onCreated();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi tạo thư mục');
    } finally { setLoading(false); }
  };

  return (
    <div className="new-folder-row">
      <FolderPlus size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
      <input
        className="new-folder-input"
        autoFocus
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Tên thư mục..."
        onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') onCancel(); }}
      />
      <button className="btn-primary-sm" onClick={handleCreate} disabled={loading || !name.trim()}>
        {loading ? <Loader2 size={12} className="spin" /> : 'Tạo'}
      </button>
      <button className="btn-ghost-sm" onClick={onCancel}>×</button>
    </div>
  );
}

// ── Upload Panel ───────────────────────────────────────────────────────────────
function UploadPanel({ folderId, onClose }) {
  const qc = useQueryClient();
  const [files, setFiles] = useState([]);
  const [urlMode, setUrlMode] = useState(false);
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const invalidate = () => {
    qc.invalidateQueries({ predicate: q => q.queryKey[0] === 'media' });
    qc.invalidateQueries({ queryKey: FOLDERS_KEY });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] }, multiple: true, disabled: uploading,
    onDrop: async (accepted) => {
      if (!folderId) { toast.error('Vui lòng chọn thư mục trước'); return; }
      setUploading(true);
      let ok = 0;
      for (const file of accepted) {
        try {
          const fd = new FormData();
          fd.append('file', file);
          fd.append('folderId', folderId);
          await mediaService.upload(fd, () => {});
          ok++;
        } catch (e) {
          toast.error(`Lỗi: ${file.name}`);
        }
      }
      invalidate();
      setUploading(false);
      if (ok > 0) { toast.success(`Đã upload ${ok} ảnh`); onClose(); }
    },
  });

  const handleUrlUpload = async () => {
    if (!url.trim()) { toast.error('Nhập URL ảnh'); return; }
    if (!folderId) { toast.error('Vui lòng chọn thư mục'); return; }
    setUploading(true);
    try {
      await mediaService.uploadUrl({ url: url.trim(), folderId });
      invalidate();
      toast.success('Upload từ URL thành công');
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Upload thất bại');
    } finally { setUploading(false); }
  };

  return (
    <div className="picker-upload-panel">
      <div className="picker-upload-tabs">
        <button className={`pup-tab ${!urlMode ? 'active' : ''}`} onClick={() => setUrlMode(false)}>
          <Upload size={13} /> Tải lên
        </button>
        <button className={`pup-tab ${urlMode ? 'active' : ''}`} onClick={() => setUrlMode(true)}>
          <Link size={13} /> Từ URL
        </button>
      </div>

      {!urlMode ? (
        <div {...getRootProps()} className={`picker-dropzone ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          {uploading ? <Loader2 size={24} className="spin" /> : <Upload size={24} />}
          <p>{uploading ? 'Đang upload...' : isDragActive ? 'Thả ảnh vào đây' : 'Kéo thả hoặc click để chọn ảnh'}</p>
          {!folderId && <span style={{ color: 'var(--danger)', fontSize: 12 }}>⚠ Chọn thư mục trước</span>}
        </div>
      ) : (
        <div className="picker-url-form">
          <input className="field-input" value={url} onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            onKeyDown={e => e.key === 'Enter' && handleUrlUpload()} />
          <button className="btn-primary-sm" onClick={handleUrlUpload} disabled={uploading || !url.trim()}>
            {uploading ? <Loader2 size={13} className="spin" /> : <Upload size={13} />}
            Upload
          </button>
        </div>
      )}

      <button className="btn-ghost-sm" style={{ alignSelf: 'flex-end' }} onClick={onClose}>Đóng</button>
    </div>
  );
}

// ── Main MediaPickerModal ──────────────────────────────────────────────────────
export default function MediaPickerModal({ onSelect, onClose }) {
  const qc = useQueryClient();
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [picked,         setPicked]         = useState(null);
  const [search,         setSearch]         = useState('');
  const [page,           setPage]           = useState(1);
  const [showNewFolder,  setShowNewFolder]  = useState(false);
  const [newFolderParent,setNewFolderParent]= useState(null);
  const [showUpload,     setShowUpload]     = useState(false);
  // Context menu
  const [ctxMenu, setCtxMenu] = useState(null); // { x, y, folder }
  // Rename
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameName,   setRenameName]   = useState('');
  // Delete folder
  const [deleteFolder, setDeleteFolder] = useState(null);

  const { data: folders = [] } = useFolders();
  const folderMap = buildFolderMap(folders);

  const isSearching = search.trim().length > 0;

  const { data: browseData, isLoading: lb } = useMedia({ folderId: selectedFolder, page, limit: 24 });
  const { data: searchData, isLoading: ls } = useMediaSearch({ q: search, page: 1, limit: 24 });

  const displayData = isSearching ? searchData : browseData;
  const mediaItems  = displayData?.media ?? [];
  const total       = displayData?.total ?? 0;
  const totalPages  = displayData?.totalPages ?? 1;
  const isLoading   = isSearching ? ls : lb;

  // Search cũng trả về folders từ backend
  const searchFolders = isSearching ? (searchData?.folders ?? []) : [];
  const crumbs = selectedFolder ? buildBreadcrumb(folderMap, selectedFolder) : [];

  const invalidateFolders = () => {
    qc.invalidateQueries({ queryKey: FOLDERS_KEY });
    qc.invalidateQueries({ predicate: q => q.queryKey[0] === 'media' });
  };

  const handleFolderSelect = (id) => {
    setSelectedFolder(id);
    setPage(1);
    setSearch('');
    setShowUpload(false);
  };

  // Context menu handlers
  const handleCtxMenu = useCallback((e, folder) => {
    setCtxMenu({ x: e.clientX, y: e.clientY, folder });
  }, []);

  const handleAddChild = (parentId) => {
    setNewFolderParent(parentId);
    setShowNewFolder(true);
  };

  const handleStartRename = (folder) => {
    setRenameTarget(folder);
    setRenameName(folder.name);
  };

  const handleRename = async () => {
    if (!renameName.trim() || renameName === renameTarget.name) { setRenameTarget(null); return; }
    try {
      await folderService.rename(renameTarget._id, renameName.trim());
      invalidateFolders();
      toast.success('Đổi tên thành công');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi');
    } finally { setRenameTarget(null); }
  };

  const handleDeleteFolder = async () => {
    try {
      await folderService.delete(deleteFolder._id);
      invalidateFolders();
      if (selectedFolder === deleteFolder._id) setSelectedFolder(null);
      toast.success('Đã xóa thư mục');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Xóa thất bại (thư mục có ảnh)');
    } finally { setDeleteFolder(null); }
  };

  const handleConfirm = () => {
    if (picked) { onSelect(picked); onClose(); }
  };

  return (
    <>
      <div className="modal-overlay" style={{ zIndex: 10050 }} onClick={onClose}>
        <div className="picker-modal" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="picker-header">
            <h3>Thư viện ảnh</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="btn-primary-sm" onClick={() => setShowUpload(!showUpload)}>
                <Upload size={13} /> Thêm file
              </button>
              <button className="icon-btn" onClick={onClose}><X size={16} /></button>
            </div>
          </div>

          {/* Search bar */}
          <div className="picker-search-bar">
            <Search size={14} className="picker-search-icon" />
            <input className="picker-search-input" placeholder="Tìm ảnh hoặc thư mục..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            {search && <button className="picker-search-clear" onClick={() => setSearch('')}><X size={12} /></button>}
          </div>

          {/* Upload panel (collapsible) */}
          {showUpload && (
            <UploadPanel folderId={selectedFolder} onClose={() => setShowUpload(false)} />
          )}

          {/* Body */}
          <div className="picker-body">
            {/* Sidebar */}
            {!isSearching && (
              <div className="picker-sidebar">
                <div className="picker-folder-header">
                  THƯ MỤC
                  <button className="picker-new-folder-btn" title="Tạo thư mục" onClick={() => {setNewFolderParent(null); setShowNewFolder(true);}}>
                    <FolderPlus size={13} />
                  </button>
                </div>

                {showNewFolder && (
                  <div style={{ padding: '4px 8px' }}>
                    <NewFolderInput
                      parentId={newFolderParent ?? selectedFolder}
                      folderMap={folderMap}
                      onCreated={() => { setShowNewFolder(false); setNewFolderParent(null); }}
                      onCancel={() => { setShowNewFolder(false); setNewFolderParent(null); }}
                    />
                  </div>
                )}

                {/* Tất cả */}
                <div
                  className={`picker-folder-node ${!selectedFolder ? 'active' : ''}`}
                  style={{ paddingLeft: 8 }}
                  onClick={() => handleFolderSelect(null)}
                >
                  <span style={{ width: 15 }} />
                  <span className="picker-folder-btn"><Home size={12} /><span>Tất cả</span></span>
                </div>
                {folders.map(f => (
                  <FolderNode key={f._id} folder={f} selectedId={selectedFolder}
                    folderMap={folderMap} onSelect={handleFolderSelect} onCtxMenu={handleCtxMenu} />
                ))}
              </div>
            )}

            {/* Main */}
            <div className="picker-main">
              {/* Topbar */}
              <div className="picker-topbar">
                {isSearching ? (
                  <span className="picker-search-label">
                    {searchFolders.length > 0 && <>{searchFolders.length} thư mục · </>}{total} ảnh
                  </span>
                ) : (
                  <div className="picker-breadcrumb">
                    <button className="bc-link" onClick={() => handleFolderSelect(null)}><Home size={11} /></button>
                    {crumbs.map((c, i) => (
                      <span key={c._id} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <ChevronRight size={10} style={{ color: 'var(--text-3)' }} />
                        {i === crumbs.length - 1
                          ? <span style={{ fontSize: 12, fontWeight: 500 }}>{c.name}</span>
                          : <button className="bc-link" onClick={() => handleFolderSelect(c._id)}>{c.name}</button>}
                      </span>
                    ))}
                  </div>
                )}
                <span className="media-count">{total} ảnh</span>
              </div>

              {/* Search folder results */}
              {isSearching && searchFolders.length > 0 && (
                <div className="picker-folder-results">
                  <p className="picker-result-label">Thư mục tìm thấy</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 12px 10px' }}>
                    {searchFolders.map(f => (
                      <button key={f._id} className="folder-chip" onClick={() => handleFolderSelect(f._id)}>
                        <FolderOpen size={12} /> {f.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Image grid */}
              {isLoading ? (
                <div className="picker-grid">
                  {Array.from({ length: 16 }).map((_, i) => <div key={i} className="picker-item skeleton" />)}
                </div>
              ) : mediaItems.length === 0 ? (
                <div className="picker-empty">Chưa có ảnh{selectedFolder ? ' trong thư mục này' : ''}</div>
              ) : (
                <div className="picker-grid">
                  {mediaItems.map(item => (
                    <button key={item._id}
                      className={`picker-item ${picked?._id === item._id ? 'selected' : ''}`}
                      onClick={() => setPicked(prev => prev?._id === item._id ? null : item)}
                      title={`${item.filename}\n${formatSize(item.size)}`}
                    >
                      <img src={item.url} alt={item.filename} loading="lazy" />
                      {picked?._id === item._id && (
                        <div className="picker-check"><Check size={13} /></div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="picker-pagination">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-ghost-sm">←</button>
                  <span>Trang {page} / {totalPages}</span>
                  <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn-ghost-sm">→</button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="picker-footer">
            <span className="picker-selection-info">
              {picked ? `✓ Đã chọn: ${picked.filename}` : 'Chưa chọn ảnh nào'}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-ghost-sm" onClick={onClose}>Hủy</button>
              <button className="btn-primary-sm" disabled={!picked} onClick={handleConfirm}>
                Chọn ảnh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {ctxMenu && (
        <FolderCtxMenu
          x={ctxMenu.x} y={ctxMenu.y} folder={ctxMenu.folder} folderMap={folderMap}
          onClose={() => setCtxMenu(null)}
          onAddChild={handleAddChild}
          onRename={handleStartRename}
          onDelete={(f) => setDeleteFolder(f)}
        />
      )}

      {/* Rename dialog */}
      <Dialog open={!!renameTarget} onOpenChange={(open) => { if (!open) setRenameTarget(null); }}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Đổi tên “{renameTarget?.name}”</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              autoFocus
              value={renameName}
              onChange={e => setRenameName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setRenameTarget(null); }}
              placeholder="Tên thư mục mới..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>Hủy</Button>
            <Button onClick={handleRename}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete folder confirm */}
      {deleteFolder && (
        <ConfirmDialog
          title="Xóa thư mục"
          message={`Xóa “${deleteFolder.name}”? Thư mục có ảnh sẽ không xóa được.`}
          confirmText="Xóa" variant="danger"
          onConfirm={handleDeleteFolder}
          onCancel={() => setDeleteFolder(null)}
        />
      )}
    </>
  );
}
