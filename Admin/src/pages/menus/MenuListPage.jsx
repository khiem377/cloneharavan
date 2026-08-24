import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Copy, ToggleLeft, ToggleRight, Loader2, Menu as MenuIcon } from '@/components/ui/Icons';
import { useMenus, useDeleteMenu, useDuplicateMenu, useCreateMenu } from '@/hooks/useMenus';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { toast } from '@/providers/ToastProvider';

function HandleBadge({ handle }) {
  return (
    <code className="inline-flex items-center rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground border border-border/50">
      {handle}
    </code>
  );
}

export default function MenuListPage() {
  const navigate = useNavigate();
  const { data: menus = [], isLoading } = useMenus();
  const deleteMut = useDeleteMenu();
  const duplicateMut = useDuplicateMenu();
  const createMut = useCreateMenu();

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', handle: '' });

  const handleCreate = () => {
    if (!newForm.name.trim()) return toast.error('Vui lòng nhập tên menu');
    createMut.mutate(
      { name: newForm.name.trim(), handle: newForm.handle.trim() || undefined, items: [] },
      {
        onSuccess: (menu) => {
          setShowCreateForm(false);
          setNewForm({ name: '', handle: '' });
          navigate(`/menus/${menu._id}/edit`);
        },
      }
    );
  };

  const handleDuplicate = (id) => {
    duplicateMut.mutate(id);
  };

  const confirmDelete = () => {
    deleteMut.mutate(deleteTarget._id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  return (
    <div className="p-3 sm:p-6 flex flex-col gap-4 sm:gap-6 w-full max-w-full min-h-full bg-background text-foreground">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Điều hướng</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Quản lý menu điều hướng cho cửa hàng</p>
        </div>
        <button
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors cursor-pointer"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus size={16} /> Tạo menu
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20 text-muted-foreground gap-2">
          <Loader2 className="animate-spin" size={28} />
        </div>
      ) : menus.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <MenuIcon size={40} strokeWidth={1.2} />
          <p className="text-sm">Chưa có menu nào. Hãy tạo menu đầu tiên!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {menus.map((menu) => (
            <div
              key={menu._id}
              className="flex flex-col rounded-xl border border-border bg-card shadow-2xs hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 p-4 pb-3">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-semibold text-foreground text-sm truncate">{menu.name}</span>
                  <HandleBadge handle={menu.handle} />
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border shrink-0 ${
                    menu.isActive
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-muted text-muted-foreground border-border'
                  }`}
                >
                  {menu.isActive ? 'Hoạt động' : 'Ẩn'}
                </span>
              </div>

              <div className="px-4 pb-3">
                <p className="text-xs text-muted-foreground">
                  {menu.items?.length ?? 0} mục điều hướng
                </p>
              </div>

              <div className="flex items-center gap-1 border-t border-border px-3 py-2.5 bg-muted/30 rounded-b-xl">
                <button
                  className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md bg-primary text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                  onClick={() => navigate(`/menus/${menu._id}/edit`)}
                >
                  <Pencil size={13} /> Chỉnh sửa
                </button>
                <button
                  className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                  title="Nhân bản"
                  onClick={() => handleDuplicate(menu._id)}
                >
                  {duplicateMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
                </button>
                <button
                  className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                  title="Xóa"
                  onClick={() => setDeleteTarget(menu)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => setShowCreateForm(false)}
        >
          <div
            className="flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-border bg-background shadow-xl text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold">Tạo menu mới</h2>
              <button
                className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer text-lg font-bold"
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
            </div>
            <div className="flex flex-col gap-4 p-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">
                  Tên menu <span className="text-destructive ml-0.5">*</span>
                </label>
                <input
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors"
                  value={newForm.name}
                  onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ví dụ: Main Menu, Footer..."
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Handle (slug)</label>
                <input
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors font-mono"
                  value={newForm.handle}
                  onChange={(e) => setNewForm((f) => ({ ...f, handle: e.target.value }))}
                  placeholder="main-menu (tự tạo nếu để trống)"
                />
                <p className="text-[11px] text-muted-foreground">Client dùng handle để gọi API lấy menu</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/40 px-5 py-3">
              <button
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
                onClick={() => setShowCreateForm(false)}
              >
                Hủy
              </button>
              <button
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
                onClick={handleCreate}
                disabled={createMut.isPending}
              >
                {createMut.isPending ? <Loader2 size={15} className="animate-spin" /> : 'Tạo & Chỉnh sửa'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa menu"
        description={`Bạn có chắc muốn xóa menu "${deleteTarget?.name}" không? Hành động này không thể hoàn tác.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMut.isPending}
      />
    </div>
  );
}
