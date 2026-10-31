import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ChevronRight, Home, FolderOpen, FolderPlus,
  Loader2, Pencil, Trash2,
} from '@/components/ui/Icons';
import { folderService } from '@/services/folder.service';
import { FOLDERS_KEY } from '@/hooks/useFolders';
import { toast } from '@/providers/ToastProvider';
import { getDepth } from './mediaPickerUtils';

export function FolderCtxMenu({ x, y, folder, folderMap, onClose, onAddChild, onRename, onDelete }) {
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
      className="fixed z-[10060] min-w-44 rounded-[6px] border border-border bg-popover p-1 text-popover-foreground shadow-xs text-sm"
      style={{ position: 'fixed', top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {canAddChild && (
        <button
          className="flex w-full items-center gap-2 rounded-[6px] px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer text-left"
          onClick={() => { onClose(); onAddChild(folder._id); }}
        >
          <FolderPlus size={13} /> Tạo thư mục con
        </button>
      )}
      <button
        className="flex w-full items-center gap-2 rounded-[6px] px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer text-left"
        onClick={() => { onClose(); onRename(folder); }}
      >
        <Pencil size={13} /> Đổi tên
      </button>
      <div className="my-1 h-px bg-border" />
      <button
        className="flex w-full items-center gap-2 rounded-[6px] px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer text-left"
        onClick={() => { onClose(); onDelete(folder); }}
      >
        <Trash2 size={13} /> Xóa thư mục
      </button>
    </div>
  );
}

export function FolderNode({ folder, depth = 0, selectedId, folderMap, onSelect, onCtxMenu }) {
  const [open, setOpen] = useState(depth === 0);
  const hasChildren = folder.children?.length > 0;
  const isActive = folder._id === selectedId;

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 w-full rounded-[6px] px-2 py-1 text-xs transition-colors cursor-pointer select-none ${isActive ? 'bg-accent font-semibold text-foreground' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'}`}
        style={{ paddingLeft: 8 + depth * 14 }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onCtxMenu(e, folder);
        }}
      >
        <button
          type="button"
          className={`shrink-0 p-0.5 rounded hover:bg-muted text-muted-foreground ${!hasChildren ? 'invisible' : ''}`}
          onClick={() => setOpen(!open)}
        >
          <ChevronRight size={11} className={`transition-transform ${open ? 'rotate-90' : ''}`} />
        </button>
        <button
          type="button"
          className="flex flex-1 items-center gap-1.5 text-left truncate cursor-pointer"
          onClick={() => onSelect(folder._id)}
        >
          <FolderOpen size={13} className="shrink-0 text-muted-foreground" />
          <span className="truncate">{folder.name}</span>
        </button>
      </div>
      {open && hasChildren && folder.children.map((c) => (
        <FolderNode
          key={c._id}
          folder={c}
          depth={depth + 1}
          selectedId={selectedId}
          folderMap={folderMap}
          onSelect={onSelect}
          onCtxMenu={onCtxMenu}
        />
      ))}
    </div>
  );
}

export function NewFolderInput({ parentId, folderMap, onCreated, onCancel }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const depth = parentId ? getDepth(folderMap, parentId) + 1 : 0;
  const blocked = depth >= 3;

  if (blocked) {
    return (
      <div className="flex items-center gap-2 p-2 text-xs text-muted-foreground">
        <span>Đã đạt tối đa 3 cấp</span>
        <button
          className="inline-flex h-7 items-center justify-center rounded px-2 text-xs font-medium hover:bg-accent cursor-pointer"
          onClick={onCancel}
        >
          Đóng
        </button>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await folderService.create({ name: name.trim(), parentId: parentId || null });
      qc.invalidateQueries({ queryKey: FOLDERS_KEY });
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'media' });
      toast.success('Tạo thư mục thành công');
      onCreated();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi tạo thư mục');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 p-2 bg-muted/40 rounded-[6px] border border-border my-1">
      <FolderPlus size={13} className="text-muted-foreground shrink-0" />
      <input
        className="h-7 flex-1 rounded-[6px] border border-input bg-background px-2 text-xs text-foreground outline-none focus:border-ring"
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Tên thư mục..."
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleCreate();
          if (e.key === 'Escape') onCancel();
        }}
      />
      <button
        type="button"
        className="inline-flex h-7 items-center justify-center rounded-[6px] bg-primary px-2.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
        onClick={handleCreate}
        disabled={loading || !name.trim()}
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : 'Tạo'}
      </button>
      <button
        type="button"
        className="inline-flex h-7 items-center justify-center rounded px-2 text-xs font-medium text-muted-foreground hover:bg-accent cursor-pointer"
        onClick={onCancel}
      >
        ×
      </button>
    </div>
  );
}

export default function FolderTreeSidebar({
  folders,
  folderMap,
  selectedFolder,
  onSelectFolder,
  onCtxMenu,
  showNewFolder,
  setShowNewFolder,
  newFolderParent,
  setNewFolderParent,
}) {
  return (
    <div className="w-52 shrink-0 border-r border-border bg-muted/20 p-2 overflow-y-auto flex flex-col gap-1">
      <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        <span>THƯ MỤC</span>
        <button
          type="button"
          className="inline-flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          title="Tạo thư mục gốc"
          onClick={() => {
            setNewFolderParent(null);
            setShowNewFolder(true);
          }}
        >
          <FolderPlus size={13} />
        </button>
      </div>

      <button
        type="button"
        className={`flex items-center gap-1.5 w-full rounded-[6px] px-2 py-1 text-xs transition-colors cursor-pointer text-left select-none ${!selectedFolder ? 'bg-accent font-semibold text-foreground' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'}`}
        onClick={() => onSelectFolder(null)}
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

      {folders.map((f) => (
        <div key={f._id}>
          <FolderNode
            folder={f}
            selectedId={selectedFolder}
            folderMap={folderMap}
            onSelect={onSelectFolder}
            onCtxMenu={onCtxMenu}
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
  );
}
