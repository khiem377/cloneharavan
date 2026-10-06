import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Copy, ToggleLeft, ToggleRight, Loader2, Menu as MenuIcon } from '@/components/ui/Icons';
import { useMenus, useDeleteMenu, useDuplicateMenu, useCreateMenu } from '@/hooks/useMenus';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { toast } from '@/providers/ToastProvider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

function HandleBadge({ handle }) {
  return (
    <code className="inline-flex items-center rounded-[4px] bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground border border-border/50">
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
    <div className="p-3 sm:p-6 flex flex-col gap-4 sm:gap-6 w-full max-w-6xl mx-auto min-h-full bg-background text-foreground">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Điều hướng Menu</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Quản lý menu điều hướng đa cấp cho cửa hàng</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          size="sm"
          className="h-8 rounded-[6px] text-xs font-semibold active:scale-[0.98]"
        >
          <Plus size={15} className="mr-1" /> Tạo menu
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20 text-muted-foreground gap-2">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      ) : menus.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <MenuIcon size={36} strokeWidth={1.5} />
          <p className="text-xs font-mono">Chưa có menu nào. Hãy tạo menu đầu tiên!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {menus.map((menu) => (
            <Card
              key={menu._id}
              className="flex flex-col rounded-[6px] border border-border shadow-none"
            >
              <CardHeader className="p-4 pb-3 border-b border-border flex flex-row items-start justify-between space-y-0">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-semibold text-foreground text-sm truncate">{menu.name}</span>
                  <HandleBadge handle={menu.handle} />
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] rounded-[4px] shrink-0 font-medium ${
                    menu.isActive
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {menu.isActive ? 'Hoạt động' : 'Ẩn'}
                </Badge>
              </CardHeader>

              <CardContent className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div className="text-xs text-muted-foreground">
                  <span className="font-mono font-semibold text-foreground tabular-nums">
                    {(menu.items || []).length}
                  </span>{' '}
                  mục cấp 1
                </div>

                <div className="flex items-center justify-end gap-1 pt-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicate(menu._id)}
                    className="h-7 px-2 rounded-[4px] text-xs text-muted-foreground hover:text-foreground"
                    title="Nhân bản"
                  >
                    <Copy size={13} className="mr-1" /> Nhân bản
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/menus/${menu._id}/edit`)}
                    className="h-7 px-2 rounded-[4px] text-xs font-medium text-foreground hover:bg-muted"
                  >
                    <Pencil size={13} className="mr-1" /> Chỉnh sửa
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(menu)}
                    className="h-7 w-7 rounded-[4px] text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                    title="Xóa"
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal tạo nhanh menu */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <Card className="rounded-[6px] border border-border w-full max-w-md shadow-lg">
            <CardHeader className="p-4 border-b border-border">
              <CardTitle className="text-sm font-semibold text-foreground">Tạo menu mới</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Tên menu <span className="text-destructive">*</span></label>
                <Input
                  className="h-8 rounded-[6px] text-xs"
                  placeholder="Ví dụ: Menu chính, Footer cột 1..."
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Handle (Mã định danh duy nhất)</label>
                <Input
                  className="h-8 rounded-[6px] text-xs font-mono"
                  placeholder="Để trống sẽ tự sinh (VD: main-menu)"
                  value={newForm.handle}
                  onChange={(e) => setNewForm({ ...newForm, handle: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                  className="h-8 rounded-[6px] text-xs"
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreate}
                  disabled={createMut.isPending}
                  className="h-8 rounded-[6px] text-xs font-semibold active:scale-[0.98]"
                >
                  {createMut.isPending ? <Loader2 size={13} className="animate-spin mr-1" /> : null}
                  Tạo và chỉnh sửa
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dialog xác nhận xóa */}
      {deleteTarget && (
        <ConfirmDialog
          open={!!deleteTarget}
          title="Xác nhận xóa menu"
          description={`Bạn có chắc chắn muốn xóa menu "${deleteTarget.name}"? Hành động này không thể hoàn tác.`}
          confirmLabel="Xóa menu"
          danger
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
