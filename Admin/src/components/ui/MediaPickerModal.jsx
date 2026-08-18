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

function FolderCtxMenu({ x, y, folder, folderMap, onClose, onAddChild, onRename, onDelete }) {
  const ref = useRef(null);
  const depth = getDepth(folderMap, folder._id);
  const canAddChild = depth < 2;

  useEffect(() => {
    const handleClick = () => onClose();
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed z-[10060] min-w-44 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md text-sm"
      style={{ position: 'fixed', top: y, left: x }}
      onClick={e => e.stopPropagation()}
      onContextMenu={e => e.preventDefault()}
    >
      {canAddChild && (
        <button className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer text-left" onClick={() => { onClose(); onAddChild(folder._id); }}>
          <FolderPlus size={13} /> Tạo thư mục con
        </button>
      )}
      <button className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer text-left" onClick={() => { onClose(); onRename(folder); }}>
        <Pencil size={13} /> Đổi tên
      </button>
      <div className="my-1 h-px bg-border" />
      <button className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer text-left" onClick={() => { onClose(); onDelete(folder); }}>
        <Trash2 size={13} /> Xóa thư mục
      </button>
    </div>
  );
}

function FolderNode({ folder, depth = 0, selectedId, folderMap, onSelect, onCtxMenu }) {
  const [open, setOpen] = useState(depth === 0);
  const hasChildren = folder.children?.length > 0;
  const isActive = folder._id === selectedId;

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 w-full rounded-md px-2 py-1 text-xs transition-colors cursor-pointer select-none ${isActive ? 'bg-accent font-semibold text-foreground' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'}`}
        style={{ paddingLeft: 8 + depth * 14 }}
        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onCtxMenu(e, folder); }}
      >
        <button
          className={`shrink-0 p-0.5 rounded hover:bg-muted text-muted-foreground ${!hasChildren ? 'invisible' : ''}`}
          onClick={() => setOpen(!open)}
        >
          <ChevronRight size={11} className={`transition-transform ${open ? 'rotate-90' : ''}`} />
        </button>
        <button className="flex flex-1 items-center gap-1.5 text-left truncate cursor-pointer" onClick={() => onSelect(folder._id)}>
          <FolderOpen size={13} className="shrink-0 text-muted-foreground" />
          <span className="truncate">{folder.name}</span>
        </button>
      </div>
      {open && hasChildren && folder.children.map(c => (
        <FolderNode key={c._id} folder={c} depth={depth + 1} selectedId={selectedId}
          folderMap={folderMap} onSelect={onSelect} onCtxMenu={onCtxMenu} />
      ))}
    </div>
  );
}

function NewFolderInput({ parentId, folderMap, onCreated, onCancel }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const depth = parentId ? getDepth(folderMap, parentId) + 1 : 0;
  const blocked = depth >= 3;

  if (blocked) {
    return (
      <div className="flex items-center gap-2 p-2 text-xs text-muted-foreground">
        <span>Đã đạt tối đa 3 cấp</span>
        <button className="inline-flex h-7 items-center justify-center rounded px-2 text-xs font-medium hover:bg-accent cursor-pointer" onClick={onCancel}>Đóng</button>
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
    <div className="flex items-center gap-1.5 p-2 bg-muted/40 rounded-md border border-border my-1">
      <FolderPlus size={13} className="text-muted-foreground shrink-0" />
      <input
        className="h-7 flex-1 rounded border border-input bg-background px-2 text-xs text-foreground outline-none focus:border-ring"
        autoFocus
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Tên thư mục..."
        onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') onCancel(); }}
      />
      <button className="inline-flex h-7 items-center justify-center rounded bg-primary px-2.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer disabled:opacity-50" onClick={handleCreate} disabled={loading || !name.trim()}>
        {loading ? <Loader2 size={12} className="animate-spin" /> : 'Tạo'}
      </button>
      <button className="inline-flex h-7 items-center justify-center rounded px-2 text-xs font-medium text-muted-foreground hover:bg-accent cursor-pointer" onClick={onCancel}>×</button>
    </div>
  );
}

function UploadPanel({ folderId, onClose }) {
  const qc = useQueryClient();
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
    <div className="p-4 border-b border-border bg-muted/20 flex flex-col gap-3">
      <div className="flex border-b border-border gap-2 pb-2">
        <button className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded cursor-pointer ${!urlMode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`} onClick={() => setUrlMode(false)}>
          <Upload size={13} /> Tải lên
        </button>
        <button className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded cursor-pointer ${urlMode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`} onClick={() => setUrlMode(true)}>
          <Link size={13} /> Từ URL
        </button>
      </div>

      {!urlMode ? (
        <div {...getRootProps()} className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed transition-colors cursor-pointer text-center ${isDragActive ? 'border-primary bg-primary/10' : 'border-border bg-background hover:border-primary/50'}`}>
          <input {...getInputProps()} />
          {uploading ? <Loader2 size={24} className="animate-spin text-primary" /> : <Upload size={24} className="text-muted-foreground" />}
          <p className="text-xs font-medium text-foreground mt-2">{uploading ? 'Đang upload...' : isDragActive ? 'Thả ảnh vào đây' : 'Kéo thả hoặc click để chọn ảnh'}</p>
          {!folderId && <span className="text-[11px] text-destructive font-medium mt-1">⚠ Chọn thư mục trước</span>}
        </div>
      ) : (
        <div className="flex gap-2">
          <input className="h-8 flex-1 rounded border border-input bg-background px-2.5 text-xs text-foreground outline-none focus:border-ring" value={url} onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            onKeyDown={e => e.key === 'Enter' && handleUrlUpload()} />
          <button className="inline-flex h-8 items-center justify-center gap-1 rounded bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer disabled:opacity-50" onClick={handleUrlUpload} disabled={uploading || !url.trim()}>
            {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            Upload
          </button>
        </div>
      )}

      <button className="inline-flex h-7 items-center justify-center rounded px-2.5 text-xs font-medium text-muted-foreground hover:bg-accent cursor-pointer self-end" onClick={onClose}>Đóng</button>
    </div>
  );
}

export default function MediaPickerModal({ onSelect, onClose, isMultiple = false }) {
  const qc = useQueryClient();
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [pickedSingle, setPickedSingle] = useState(null);
  const [pickedMultiple, setPickedMultiple] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderParent, setNewFolderParent] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [ctxMenu, setCtxMenu] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameName, setRenameName] = useState('');
  const [deleteFolder, setDeleteFolder] = useState(null);

  const { data: folders = [] } = useFolders();
  const folderMap = buildFolderMap(folders);

  const isSearching = search.trim().length > 0;

  const { data: browseData, isLoading: lb } = useMedia({ folderId: selectedFolder, page, limit: 24 });
  const { data: searchData, isLoading: ls } = useMediaSearch({ q: search, page: 1, limit: 24 });

  const displayData = isSearching ? searchData : browseData;
  const mediaItems = displayData?.media ?? [];
  const total = displayData?.total ?? 0;
  const totalPages = displayData?.totalPages ?? 1;
  const isLoading = isSearching ? ls : lb;

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
  };

  const handleCardClick = (item) => {
    if (isMultiple) {
      setPickedMultiple((prev) => {
        const exists = prev.some((x) => x._id === item._id);
        if (exists) return prev.filter((x) => x._id !== item._id);
        return [...prev, item];
      });
    } else {
      setPickedSingle(item);
    }
  };

  const isSelected = (id) => {
    if (isMultiple) return pickedMultiple.some((x) => x._id === id);
    return pickedSingle?._id === id;
  };

  const handleConfirmRename = async () => {
    if (!renameName.trim() || !renameTarget) return;
    try {
      await folderService.rename(renameTarget._id, renameName.trim());
      invalidateFolders();
      toast.success('Đổi tên thư mục thành công');
      setRenameTarget(null);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi');
    }
  };

  const handleConfirmDeleteFolder = async () => {
    if (!deleteFolder) return;
    try {
      await folderService.delete(deleteFolder._id);
      if (selectedFolder === deleteFolder._id) setSelectedFolder(null);
      invalidateFolders();
      toast.success('Xóa thư mục thành công');
      setDeleteFolder(null);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi');
    }
  };

  const handleConfirmPick = () => {
    if (isMultiple) {
      if (pickedMultiple.length > 0) {
        onSelect(pickedMultiple);
        onClose();
      }
    } else {
      if (pickedSingle) {
        onSelect(pickedSingle);
        onClose();
      }
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl w-[92vw] h-[85vh] p-0 flex flex-col overflow-hidden gap-0 rounded-xl border border-border bg-background shadow-2xl">
        <DialogHeader className="px-5 py-3.5 border-b border-border flex flex-row items-center justify-between space-y-0 shrink-0 pr-12">
          <DialogTitle className="text-base font-bold text-foreground">Chọn ảnh từ thư viện</DialogTitle>
          <div className="flex items-center gap-2 mr-6">
            <button
              className="inline-flex h-8 items-center justify-center gap-1 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
              onClick={() => setShowUpload(!showUpload)}
            >
              <Upload size={13} /> Upload ảnh
            </button>
          </div>
        </DialogHeader>

        {showUpload && (
          <UploadPanel folderId={selectedFolder} onClose={() => setShowUpload(false)} />
        )}

        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div className="w-52 shrink-0 border-r border-border bg-muted/20 p-2 overflow-y-auto flex flex-col gap-1">
            <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <span>THƯ MỤC</span>
              <button
                className="inline-flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                title="Tạo thư mục gốc"
                onClick={() => { setNewFolderParent(null); setShowNewFolder(true); }}
              >
                <FolderPlus size={13} />
              </button>
            </div>

            <button
              className={`flex items-center gap-1.5 w-full rounded-md px-2 py-1 text-xs transition-colors cursor-pointer text-left select-none ${!selectedFolder ? 'bg-accent font-semibold text-foreground' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'}`}
              onClick={() => handleFolderSelect(null)}
            >
              <Home size={13} className="shrink-0 text-muted-foreground" />
              <span className="truncate">Tất cả</span>
            </button>

            {showNewFolder && !newFolderParent && (
              <NewFolderInput
                parentId={null}
                folderMap={folderMap}
                onCreated={() => setShowNewFolder(false)}
                onCancel={() => setShowNewFolder(false)}
              />
            )}

            {folders.map(f => (
              <div key={f._id}>
                <FolderNode
                  folder={f}
                  selectedId={selectedFolder}
                  folderMap={folderMap}
                  onSelect={handleFolderSelect}
                  onCtxMenu={(e, folder) => setCtxMenu({ x: e.clientX, y: e.clientY, folder })}
                />
                {showNewFolder && newFolderParent === f._id && (
                  <NewFolderInput
                    parentId={f._id}
                    folderMap={folderMap}
                    onCreated={() => setShowNewFolder(false)}
                    onCancel={() => setShowNewFolder(false)}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
            <div className="flex items-center justify-between gap-3 p-3 border-b border-border bg-muted/10 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <button className="hover:text-foreground transition-colors cursor-pointer" onClick={() => handleFolderSelect(null)}>
                  <Home size={13} />
                </button>
                {crumbs.map((c, i) => (
                  <span key={c._id} className="flex items-center gap-1.5">
                    <ChevronRight size={11} className="text-muted-foreground/60" />
                    <button className="hover:text-foreground transition-colors cursor-pointer font-medium text-foreground" onClick={() => handleFolderSelect(c._id)}>
                      {c.name}
                    </button>
                  </span>
                ))}
              </div>

              <div className="relative flex items-center w-56">
                <Search size={14} className="absolute left-2.5 text-muted-foreground pointer-events-none" />
                <input
                  className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-7 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Tìm tên file..."
                />
                {search && (
                  <button className="absolute right-2 text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => setSearch('')}>
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse border border-border" />
                  ))}
                </div>
              ) : (browseData?.type === 'parent' && browseData?.subFolders?.length > 0 && mediaItems.length === 0) ? (
                <div className="flex flex-wrap gap-2.5 p-2">
                  {browseData.subFolders.map((sf) => (
                    <button
                      key={sf._id}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground hover:border-primary/50 hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => handleFolderSelect(sf._id)}
                    >
                      <FolderOpen size={15} className="text-primary" />
                      <span>{sf.name}</span>
                    </button>
                  ))}
                </div>
              ) : mediaItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                  <p className="text-xs font-medium">Không có ảnh nào trong thư mục này</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {browseData?.subFolders?.length > 0 && (
                    <div className="flex flex-wrap gap-2 pb-3 border-b border-border">
                      {browseData.subFolders.map((sf) => (
                        <button
                          key={sf._id}
                          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/50 hover:bg-accent transition-colors cursor-pointer"
                          onClick={() => handleFolderSelect(sf._id)}
                        >
                          <FolderOpen size={14} className="text-primary" />
                          <span>{sf.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 align-content-start">
                    {mediaItems.map(item => {
                      const active = isSelected(item._id);
                      return (
                        <div
                          key={item._id}
                          className={`relative aspect-square rounded-lg border-2 overflow-hidden cursor-pointer transition-all bg-card ${active ? 'border-primary ring-2 ring-primary/30 shadow-md' : 'border-border hover:border-primary/50'}`}
                          onClick={() => handleCardClick(item)}
                          onDoubleClick={() => {
                            if (!isMultiple) { onSelect(item); onClose(); }
                          }}
                        >
                          <img src={item.url} alt={item.filename} loading="lazy" className="size-full object-cover" />
                          {active && (
                            <div className="absolute top-1.5 right-1.5 size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs z-10 font-bold text-[10px]">
                              {isMultiple ? (pickedMultiple.findIndex((x) => x._id === item._id) + 1) : <Check size={12} />}
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[10px] text-white truncate px-1.5 font-medium">
                            {item.filename}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/20 shrink-0 text-xs">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="inline-flex h-7 items-center justify-center rounded px-2.5 font-medium text-muted-foreground hover:bg-accent disabled:opacity-50 cursor-pointer">← Trước</button>
                <span className="text-muted-foreground">{page} / {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="inline-flex h-7 items-center justify-center rounded px-2.5 font-medium text-muted-foreground hover:bg-accent disabled:opacity-50 cursor-pointer">Sau →</button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-between shrink-0">
          <div className="text-xs text-muted-foreground">
            {isMultiple ? (
              pickedMultiple.length > 0 ? <span className="font-semibold text-foreground">Đã chọn {pickedMultiple.length} ảnh</span> : 'Click chọn 1 hoặc nhiều ảnh'
            ) : (
              pickedSingle ? <span className="font-semibold text-foreground">Đã chọn: {pickedSingle.filename}</span> : 'Click chọn ảnh hoặc nhấp đôi để xác nhận'
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>Hủy</Button>
            <Button size="sm" disabled={isMultiple ? pickedMultiple.length === 0 : !pickedSingle} onClick={handleConfirmPick}>
              {isMultiple ? `Chọn ${pickedMultiple.length} ảnh` : 'Chọn ảnh này'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {ctxMenu && (
        <FolderCtxMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          folder={ctxMenu.folder}
          folderMap={folderMap}
          onClose={() => setCtxMenu(null)}
          onAddChild={(id) => { setNewFolderParent(id); setShowNewFolder(true); }}
          onRename={(f) => { setRenameTarget(f); setRenameName(f.name); }}
          onDelete={(f) => setDeleteFolder(f)}
        />
      )}

      {renameTarget && (
        <Dialog open onOpenChange={() => setRenameTarget(null)}>
          <DialogContent className="max-w-xs p-5">
            <DialogHeader>
              <DialogTitle className="text-sm">Đổi tên thư mục</DialogTitle>
            </DialogHeader>
            <Input
              value={renameName}
              onChange={e => setRenameName(e.target.value)}
              placeholder="Tên mới..."
              autoFocus
            />
            <DialogFooter className="gap-2 sm:gap-0 mt-2">
              <Button variant="ghost" size="sm" onClick={() => setRenameTarget(null)}>Hủy</Button>
              <Button size="sm" onClick={handleConfirmRename}>Lưu</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {deleteFolder && (
        <ConfirmDialog
          open
          title="Xóa thư mục"
          description={`Xóa thư mục "${deleteFolder.name}"?`}
          onConfirm={handleConfirmDeleteFolder}
          onCancel={() => setDeleteFolder(null)}
        />
      )}
    </Dialog>
  );
}
