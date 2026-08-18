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
} from 'lucide-react';
import { useFolders, FOLDERS_KEY } from '@/hooks/useFolders';
import { folderService } from '@/services/folder.service';
import { toast } from '@/providers/ToastProvider';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

// ── Context Menu ──────────────────────────────────────────────────────────────
function ContextMenu({ x, y, folder, depth, onClose, onCreateSub, onRename, onDelete }) {
  const ref = useRef(null);
  const isLeaf = depth >= 2; // Cấp 3 (depth=2) không cho tạo con

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Adjust nếu vượt màn hình
  const style = { position: 'fixed', top: Math.min(y, window.innerHeight - 140), left: Math.min(x, window.innerWidth - 200), zIndex: 1000 };

  return (
    <div ref={ref} className="ctx-menu" style={style}>
      {!isLeaf && (
        <button className="ctx-item" onClick={() => { onCreateSub(folder); onClose(); }}>
          <FolderPlus size={14} /> Tạo thư mục con
        </button>
      )}
      <button className="ctx-item" onClick={() => { onRename(folder); onClose(); }}>
        <Pencil size={14} /> Đổi tên
      </button>
      <div className="ctx-divider" />
      <button className="ctx-item danger" onClick={() => { onDelete(folder); onClose(); }}>
        <Trash2 size={14} /> Xóa thư mục
      </button>
    </div>
  );
}

// ── Folder Name Dialog ────────────────────────────────────────────────────────
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="folder-dialog" onClick={(e) => e.stopPropagation()}>
        <h4 className="dialog-title">{titles[mode]}</h4>
        <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) onConfirm(name.trim()); }}>
          <input ref={ref} value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Tên thư mục..." className="field-input" />
          <div className="dialog-actions">
            <button type="button" className="btn-ghost-sm" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn-primary-sm" disabled={!name.trim()}>
              {mode === 'rename' ? 'Lưu' : 'Tạo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Sortable Root Folder (whole block draggable) ──────────────────────────────
function SortableFolder({ folder, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: folder._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`folder-drag-wrap ${isDragging ? 'dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

// ── Folder Node ───────────────────────────────────────────────────────────────
function FolderNode({ folder, depth = 0, selectedId, onSelect, onContextMenu }) {
  const [open, setOpen] = useState(depth === 0);
  const hasChildren = folder.children?.length > 0;
  const isSelected = selectedId === folder._id;

  return (
    <div>
      <button
        className={`folder-node ${isSelected ? 'active' : ''}`}
        style={{ paddingLeft: `${10 + depth * 14}px` }}
        onClick={() => { setOpen(!open); onSelect(folder._id); }}
        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContextMenu(e, folder, depth); }}
      >
        <span className="folder-chevron">
          {hasChildren
            ? (open ? <ChevronDown size={13} /> : <ChevronRight size={13} />)
            : <span style={{ width: 13 }} />}
        </span>
        {isSelected
          ? <FolderOpen size={14} className="folder-icon" />
          : <Folder     size={14} className="folder-icon" />}
        <span className="folder-name">{folder.name}</span>
      </button>

      {open && hasChildren && (
        <div>
          {folder.children.map((child) => (
            <FolderNode
              key={child._id} folder={child}
              depth={depth + 1} selectedId={selectedId}
              onSelect={onSelect} onContextMenu={onContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main FolderTree ───────────────────────────────────────────────────────────
export default function FolderTree({ selectedId, onSelect }) {
  const { data: rawFolders = [], isLoading } = useFolders();
  const qc = useQueryClient();

  const [rootOrder, setRootOrder] = useState([]);
  const [ctxMenu, setCtxMenu] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [confirm, setConfirm] = useState(null); // { folder }

  // Sync rootOrder khi data load
  useEffect(() => {
    if (rawFolders.length) setRootOrder(rawFolders.map((f) => f._id));
  }, [rawFolders]);

  // Folders in current sorted order
  const folders = rootOrder
    .map((id) => rawFolders.find((f) => f._id === id))
    .filter(Boolean);

  const closeCtx = useCallback(() => setCtxMenu(null), []);
  const invalidate = () => qc.invalidateQueries({ queryKey: FOLDERS_KEY });

  // DnD sensors
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIdx = rootOrder.indexOf(active.id);
    const newIdx = rootOrder.indexOf(over.id);
    const newOrder = arrayMove(rootOrder, oldIdx, newIdx);
    setRootOrder(newOrder);
    // Persist to backend
    reorderMut(newOrder.map((id, position) => ({ id, position })));
  };

  // Mutations
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
    onError: () => invalidate(), // rollback on error
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

  if (isLoading) return <div className="folder-loading">Đang tải...</div>;

  return (
    <>
      <div className="folder-tree">
        <div className="folder-tree-header">
          <span>THƯ MỤC</span>
          <button className="icon-btn-sm" title="Tạo thư mục gốc"
            onClick={() => setDialog({ mode: 'create', folder: null })}>
            <Plus size={13} />
          </button>
        </div>

        {/* Tất cả */}
        <button
          className={`folder-node ${!selectedId ? 'active' : ''}`}
          style={{ paddingLeft: 10 }}
          onClick={() => onSelect(null)}
        >
          <span style={{ width: 13 }} />
          <Folder size={14} className="folder-icon" />
          <span className="folder-name">Tất cả</span>
        </button>

        {/* Root folders – sortable */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={rootOrder} strategy={verticalListSortingStrategy}>
            {folders.map((f) => (
              <SortableFolder key={f._id} folder={f}>
                <FolderNode
                  folder={f} selectedId={selectedId}
                  onSelect={onSelect} onContextMenu={(e, folder, depth) => setCtxMenu({ x: e.clientX, y: e.clientY, folder, depth })}
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
