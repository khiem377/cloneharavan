import { useState, useRef, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronRight, ChevronDown, Folder, FolderOpen,
  Plus, FolderPlus, Pencil, Trash2,
} from '@/components/ui/Icons';
import { useFolders, FOLDERS_KEY } from '@/hooks/useFolders';
import { folderService } from '@/services/folder.service';
import { mediaService } from '@/services/media.service';
import { toast } from '@/providers/ToastProvider';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

function ContextMenu({ x, y, folder, depth, onClose, onCreateSub, onRename, onDelete }) {
  const ref = useRef(null);
  const isLeaf = depth >= 2;

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const style = { position: 'fixed', top: Math.min(y, window.innerHeight - 140), left: Math.min(x, window.innerWidth - 200), zIndex: 1000 };

  return (
    <div ref={ref} style={style} className="fixed z-50 min-w-44 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md text-sm">
      {!isLeaf && (
        <button className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer text-left" onClick={() => { onCreateSub(folder); onClose(); }}>
          <FolderPlus size={14} /> Tạo thư mục con
        </button>
      )}
      <button className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer text-left" onClick={() => { onRename(folder); onClose(); }}>
        <Pencil size={14} /> Đổi tên
      </button>
      <div className="my-1 h-px bg-border" />
      <button className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer text-left" onClick={() => { onDelete(folder); onClose(); }}>
        <Trash2 size={14} /> Xóa thư mục
      </button>
    </div>
  );
}

function FolderDialog({ mode, folder, onConfirm, onClose }) {
  const [name, setName] = useState(mode === 'rename' ? folder?.name : '');
  const ref = useRef(null);

  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);

  const titles = {
    create: 'Tạo thư mục gốc',
    createSub: `Tạo thư mục con trong "${folder?.name}"`,
    rename: `Đổi tên "${folder?.name}"`,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4" onClick={onClose}>
      <div className="flex w-full max-w-xs flex-col rounded-xl border border-border bg-background p-5 shadow-xl text-foreground" onClick={(e) => e.stopPropagation()}>
        <h4 className="text-sm font-semibold text-foreground mb-3">{titles[mode]}</h4>
        <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) onConfirm(name.trim()); }}>
          <input
            ref={ref}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên thư mục..."
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors"
          />
          <div className="flex items-center justify-end gap-2 mt-4">
            <button type="button" className="inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" onClick={onClose}>Huỷ</button>
            <button type="submit" className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50" disabled={!name.trim()}>
              {mode === 'rename' ? 'Lưu' : 'Tạo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SortableFolder({ folder, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: folder._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="select-none" {...attributes} {...listeners}>
      {children}
    </div>
  );
}

function FolderNode({ folder, depth = 0, selectedId, onSelect, onContextMenu, onMediaDrop }) {
  const [open, setOpen] = useState(depth === 0);
  const [dragOver, setDragOver] = useState(false);
  const hasChildren = folder.children?.length > 0;
  const isSelected = selectedId === folder._id;

  const handleDragOver = (e) => {
    if (e.dataTransfer.types.includes('mediaid')) {
      e.preventDefault();
      setDragOver(true);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const mediaId = e.dataTransfer.getData('mediaId');
    if (mediaId) onMediaDrop?.(mediaId, folder._id);
  };

  return (
    <div>
      <button
        className={`flex items-center gap-2 w-full rounded-md px-2.5 py-1.5 text-sm transition-colors text-left cursor-pointer select-none ${isSelected ? 'bg-accent font-medium text-foreground' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'} ${dragOver ? 'ring-2 ring-primary bg-primary/10' : ''}`}
        style={{ paddingLeft: `${10 + depth * 14}px` }}
        onClick={() => { setOpen(!open); onSelect(folder._id); }}
        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContextMenu(e, folder, depth); }}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <span className="shrink-0 text-muted-foreground">
          {hasChildren
            ? (open ? <ChevronDown size={13} /> : <ChevronRight size={13} />)
            : <span className="w-3.5 inline-block" />}
        </span>
        {isSelected
          ? <FolderOpen size={14} className="shrink-0 text-primary" />
          : <Folder size={14} className="shrink-0 text-muted-foreground" />}
        <span className="flex-1 truncate text-xs font-medium">{folder.name}</span>
      </button>

      {open && hasChildren && (
        <div>
          {folder.children.map((child) => (
            <FolderNode
              key={child._id} folder={child}
              depth={depth + 1} selectedId={selectedId}
              onSelect={onSelect} onContextMenu={onContextMenu}
              onMediaDrop={onMediaDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FolderTree({ selectedId, onSelect }) {
  const { data: rawFolders = [], isLoading } = useFolders();
  const qc = useQueryClient();

  const [rootOrder, setRootOrder] = useState([]);
  const [ctxMenu, setCtxMenu] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    if (rawFolders.length) setRootOrder(rawFolders.map((f) => f._id));
  }, [rawFolders]);

  const folders = rootOrder
    .map((id) => rawFolders.find((f) => f._id === id))
    .filter(Boolean);

  const closeCtx = useCallback(() => setCtxMenu(null), []);
  const invalidate = () => qc.invalidateQueries({ queryKey: FOLDERS_KEY });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIdx = rootOrder.indexOf(active.id);
    const newIdx = rootOrder.indexOf(over.id);
    const newOrder = arrayMove(rootOrder, oldIdx, newIdx);
    setRootOrder(newOrder);
    reorderMut(newOrder.map((id, position) => ({ id, position })));
  };

  const { mutate: createMut } = useMutation({
    mutationFn: ({ name, parentId }) => folderService.create({ name, parentId }),
    onSuccess: (res) => { toast.success(res.data.message); setDialog(null); invalidate(); },
    onError: (err) => toast.error(err.response?.data?.message ?? err.message),
  });
  const { mutate: renameMut } = useMutation({
    mutationFn: ({ id, name }) => folderService.rename(id, name),
    onSuccess: (res) => { toast.success(res.data.message); setDialog(null); invalidate(); },
    onError: (err) => toast.error(err.response?.data?.message ?? err.message),
  });
  const { mutate: reorderMut } = useMutation({
    mutationFn: (items) => folderService.reorder(items),
    onError: () => invalidate(),
  });
  const { mutate: deleteMut } = useMutation({
    mutationFn: (id) => folderService.delete(id),
    onSuccess: (res) => {
      toast.success(res.data.message);
      if (selectedId === confirm?.folder?._id) onSelect(null);
      setConfirm(null);
      invalidate();
    },
    onError: (err) => { toast.error(err.response?.data?.message ?? err.message); setConfirm(null); },
  });

  const handleDialogConfirm = (name) => {
    if (dialog.mode === 'rename') renameMut({ id: dialog.folder._id, name });
    else createMut({ name, parentId: dialog.mode === 'createSub' ? dialog.folder._id : null });
  };

  const handleMediaDrop = useCallback(async (mediaId, targetFolderId) => {
    try {
      await mediaService.move(mediaId, targetFolderId);
      toast.success('Đã di chuyển ảnh vào folder');
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'media' });
    } catch { toast.error('Lỗi di chuyển ảnh'); }
  }, [qc]);

  if (isLoading) return <div className="p-4 text-center text-xs text-muted-foreground">Đang tải...</div>;

  return (
    <>
      <div className="w-full flex flex-col gap-0.5 overflow-y-auto max-h-[600px]">
        <div className="flex items-center justify-between px-2.5 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>THƯ MỤC</span>
          <button
            className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
            title="Tạo thư mục gốc"
            onClick={() => setDialog({ mode: 'create', folder: null })}
          >
            <Plus size={13} />
          </button>
        </div>

        <button
          className={`flex items-center gap-2 w-full rounded-md px-2.5 py-1.5 text-sm transition-colors text-left cursor-pointer select-none ${!selectedId ? 'bg-accent font-medium text-foreground' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'}`}
          style={{ paddingLeft: 10 }}
          onClick={() => onSelect(null)}
        >
          <span className="w-3.5 inline-block" />
          <Folder size={14} className="shrink-0 text-muted-foreground" />
          <span className="flex-1 truncate text-xs font-medium">Tất cả</span>
        </button>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={rootOrder} strategy={verticalListSortingStrategy}>
            {folders.map((f) => (
              <SortableFolder key={f._id} folder={f}>
                <FolderNode
                  folder={f} selectedId={selectedId}
                  onSelect={onSelect}
                  onContextMenu={(e, folder, depth) => setCtxMenu({ x: e.clientX, y: e.clientY, folder, depth })}
                  onMediaDrop={handleMediaDrop}
                />
              </SortableFolder>
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x} y={ctxMenu.y}
          folder={ctxMenu.folder} depth={ctxMenu.depth}
          onClose={closeCtx}
          onCreateSub={(f) => setDialog({ mode: 'createSub', folder: f })}
          onRename={(f)    => setDialog({ mode: 'rename',    folder: f })}
          onDelete={(f)    => setConfirm({ folder: f })}
        />
      )}

      {dialog && (
        <FolderDialog mode={dialog.mode} folder={dialog.folder}
          onConfirm={handleDialogConfirm} onClose={() => setDialog(null)} />
      )}

      {confirm && (
        <ConfirmDialog
          open={true}
          title="Xóa thư mục"
          message={`Xóa "${confirm.folder.name}"? Hành động này không thể hoàn tác.`}
          confirmText="Xóa"
          variant="danger"
          onConfirm={() => deleteMut(confirm.folder._id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
}
