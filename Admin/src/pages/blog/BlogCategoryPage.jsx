import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Edit, Trash2, Loader2, X, GripVertical } from '@/components/ui/Icons';
import { useBlogCategories } from '@/hooks/useBlog';
import { blogCategoryService } from '@/services/blog.service';
import { toast } from '@/providers/ToastProvider';
import DataTablePagination from '@/components/ui/DataTablePagination';
import MediaPickerModal from '@/components/ui/MediaPickerModal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table';

const EMPTY = {
  name: '', description: '', isActive: true,
  thumbnailMediaId: '', thumbnailUrl: '', order: 0,
};

function SortableRow({ cat, selected, onSelect, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(cat._id) });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const stopProp = (e) => e.stopPropagation();

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`hover:bg-muted/30 transition-colors select-none ${isDragging ? 'bg-muted/50 ring-1 ring-border' : ''}`}
    >
      <TableCell className="px-3 py-2 w-10 text-center" onPointerDown={stopProp} onClick={stopProp}>
        <input type="checkbox" checked={selected} onChange={onSelect} className="rounded-[3px] border-border size-3.5" />
      </TableCell>
      <TableCell className="px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
            <GripVertical className="size-4" />
          </div>
          {cat.thumbnailUrl
            ? <img src={cat.thumbnailUrl} alt="" className="size-8 object-cover rounded-[4px] border border-border shrink-0" />
            : <div className="size-8 bg-muted rounded-[4px] border border-dashed border-border shrink-0" />
          }
          <div>
            <div className="font-medium text-xs text-foreground">{cat.name}</div>
            <div className="text-[11px] text-muted-foreground font-mono">{cat.slug}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-4 py-2 text-muted-foreground text-xs font-mono tabular-nums">{cat.order}</TableCell>
      <TableCell className="px-4 py-2 text-right text-foreground text-xs font-mono tabular-nums font-semibold">{cat.postCount || 0}</TableCell>
      <TableCell className="px-4 py-2 text-center" onPointerDown={stopProp} onClick={stopProp}>
        <button
          type="button"
          onClick={() => blogCategoryService.toggleStatus(cat._id, !cat.isActive).then(() => window.location.reload())}
          className={`px-2 py-0.5 rounded-[4px] text-[10px] font-semibold transition-colors active:scale-[0.98] ${
            cat.isActive ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-muted text-muted-foreground border border-border'
          }`}
        >
          {cat.isActive ? 'Hoạt động' : 'Ẩn'}
        </button>
      </TableCell>
      <TableCell className="px-4 py-2 text-right" onPointerDown={stopProp} onClick={stopProp}>
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(cat)}
            className="h-7 w-7 rounded-[4px] text-muted-foreground hover:text-foreground"
          >
            <Edit className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(cat)}
            className="h-7 w-7 rounded-[4px] text-destructive/70 hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function InUseDialog({ posts, onClose }) {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <Card className="rounded-[6px] border border-border w-full max-w-md shadow-lg">
        <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-semibold text-foreground">Không thể xóa danh mục</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 rounded-[4px]">
            <X className="size-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <p className="text-xs text-muted-foreground">Danh mục này đang được sử dụng bởi các bài viết sau:</p>
          <ul className="space-y-1.5 max-h-48 overflow-y-auto">
            {posts.map(p => (
              <li key={p._id}>
                <button
                  type="button"
                  onClick={() => { navigate(`/blog/posts/${p._id}/edit`); onClose(); }}
                  className="text-xs text-primary hover:underline text-left line-clamp-1"
                >
                  {p.title}
                </button>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-muted-foreground italic">Vui lòng chuyển bài viết sang danh mục khác trước khi xóa.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BlogCategoryPage() {
  const [query, setQuery]         = useState({ page: 1, limit: 100 });
  const [modal, setModal]         = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [selected, setSelected]   = useState([]);
  const [showMedia, setShowMedia] = useState(false);
  const [inUsePosts, setInUsePosts] = useState(null);
  const [localData, setLocalData] = useState(null);

  const { data: resCategories, isLoading: loading, refetch } = useBlogCategories(query);
  const fetchedData = resCategories?.data || [];
  const pagination = resCategories?.pagination || {};
  const data = localData ?? fetchedData;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit   = (cat) => {
    setForm({
      name: cat.name, description: cat.description || '',
      isActive: cat.isActive, order: cat.order || 0,
      thumbnailMediaId: cat.thumbnailMediaId || '',
      thumbnailUrl: cat.thumbnailUrl || '',
      _id: cat._id,
    });
    setModal('edit');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Vui lòng nhập tên danh mục');
    setSaving(true);
    try {
      if (modal === 'create') await blogCategoryService.create(form);
      else await blogCategoryService.update(form._id, form);
      toast.success(modal === 'create' ? 'Đã tạo danh mục' : 'Đã cập nhật danh mục');
      setModal(null);
      setLocalData(null);
      refetch();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    try {
      await blogCategoryService.remove(cat._id);
      toast.success('Đã xóa danh mục');
      setLocalData(null);
      refetch();
    } catch (e) {
      const posts = e.response?.data?.inUsePosts;
      if (posts?.length) { setInUsePosts(posts); return; }
      toast.error(e.response?.data?.message || 'Xóa thất bại');
    }
  };

  const handleBulkDelete = async () => {
    if (!selected.length) return;
    try {
      await blogCategoryService.removeBulk(selected);
      toast.success(`Đã xóa ${selected.length} danh mục`);
      setSelected([]);
      setLocalData(null);
      refetch();
    } catch (e) {
      const inUseMap = e.response?.data?.inUseMap;
      if (inUseMap) {
        const allPosts = Object.values(inUseMap).flat();
        setInUsePosts(allPosts);
        return;
      }
      toast.error(e.response?.data?.message || 'Xóa thất bại');
    }
  };

  const handleDragEnd = useCallback(async ({ active, over }) => {
    if (!over || String(active.id) === String(over.id)) return;
    const oldIndex = data.findIndex(c => String(c._id) === String(active.id));
    const newIndex = data.findIndex(c => String(c._id) === String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(data, oldIndex, newIndex).map((c, i) => ({ ...c, order: i }));
    setLocalData(reordered);
    try {
      await blogCategoryService.reorder(reordered.map(c => ({ id: String(c._id), order: c.order })));
      setLocalData(null);
      refetch();
    } catch {
      toast.error('Lưu thứ tự thất bại');
      setLocalData(null);
    }
  }, [data, refetch]);

  const allSelected = data.length > 0 && selected.length === data.length;
  const toggleAll = () => setSelected(allSelected ? [] : data.map(c => c._id));
  const toggleOne = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  return (
    <div className="space-y-4 max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Danh mục Blog</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Quản lý danh mục bài viết</p>
        </div>
        <Button
          onClick={openCreate}
          size="sm"
          className="h-8 rounded-[6px] text-xs font-semibold active:scale-[0.98]"
        >
          <Plus className="size-3.5 mr-1" /> Tạo danh mục
        </Button>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-3 px-3 py-2 bg-primary/5 border border-primary/20 rounded-[6px]">
          <span className="text-xs text-foreground font-medium font-mono tabular-nums">Đã chọn {selected.length}</span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            className="h-7 px-2.5 rounded-[4px] text-xs"
          >
            <Trash2 className="size-3 mr-1" /> Xóa đã chọn
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelected([])}
            className="h-7 text-xs text-muted-foreground hover:text-foreground ml-auto"
          >
            Bỏ chọn
          </Button>
        </div>
      )}

      <Card className="rounded-[6px] border border-border shadow-none overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-xs font-mono">Chưa có danh mục nào</div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="px-3 py-2 w-10 text-center">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded-[3px] border-border size-3.5" />
                  </TableHead>
                  <TableHead className="text-xs font-semibold py-2">Tên</TableHead>
                  <TableHead className="text-xs font-semibold py-2 w-20">Thứ tự</TableHead>
                  <TableHead className="text-xs font-semibold py-2 text-right w-24">Bài viết</TableHead>
                  <TableHead className="text-xs font-semibold py-2 text-center w-28">Trạng thái</TableHead>
                  <TableHead className="w-20 py-2" />
                </TableRow>
              </TableHeader>
              <TableBody>
                <SortableContext items={data.map(c => String(c._id))} strategy={verticalListSortingStrategy}>
                  {data.map(cat => (
                    <SortableRow
                      key={cat._id}
                      cat={cat}
                      selected={selected.includes(cat._id)}
                      onSelect={() => toggleOne(cat._id)}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </SortableContext>
              </TableBody>
            </Table>
          </DndContext>
        )}

        <DataTablePagination
          page={pagination.page || 1}
          pageSize={query.limit}
          total={pagination.total || 0}
          totalPages={pagination.totalPages || 1}
          onPageChange={p => { setLocalData(null); setQuery(q => ({ ...q, page: p })); }}
          onPageSizeChange={s => { setLocalData(null); setQuery(q => ({ ...q, limit: s, page: 1 })); }}
          className="px-4 py-2 border-t border-border"
        />
      </Card>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <Card className="rounded-[6px] border border-border w-full max-w-md shadow-lg">
            <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-semibold text-foreground">
                {modal === 'create' ? 'Tạo danh mục mới' : 'Chỉnh sửa danh mục'}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setModal(null)} className="h-7 w-7 rounded-[4px]">
                <X className="size-4" />
              </Button>
            </CardHeader>
            <form onSubmit={handleSave}>
              <CardContent className="p-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Tên <span className="text-destructive">*</span></label>
                  <Input
                    className="h-8 rounded-[6px] text-xs"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Tên danh mục..."
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Mô tả</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-1.5 rounded-[6px] border border-input bg-background text-xs outline-none focus:border-ring resize-none"
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="Mô tả danh mục..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Thứ tự</label>
                    <Input
                      type="number"
                      className="h-8 rounded-[6px] text-xs font-mono tabular-nums"
                      value={form.order}
                      onChange={e => set('order', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Thumbnail</label>
                    <div className="flex items-center gap-2">
                      {form.thumbnailUrl
                        ? <img src={form.thumbnailUrl} alt="" className="size-8 object-cover rounded-[4px] border border-border shrink-0" />
                        : <div className="size-8 bg-muted rounded-[4px] border border-dashed border-border flex items-center justify-center text-muted-foreground text-[10px] shrink-0">Ảnh</div>
                      }
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMedia(true)}
                        className="h-8 px-2 text-xs rounded-[4px]"
                      >
                        {form.thumbnailUrl ? 'Đổi' : 'Chọn'}
                      </Button>
                      {form.thumbnailUrl && (
                        <button type="button" onClick={() => { set('thumbnailMediaId', ''); set('thumbnailUrl', ''); }} className="text-xs text-destructive hover:underline">
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => set('isActive', e.target.checked)}
                    className="rounded-[3px] size-3.5"
                  />
                  <span>Hiển thị danh mục</span>
                </label>
                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button type="button" variant="outline" size="sm" onClick={() => setModal(null)} className="h-8 rounded-[6px] text-xs">
                    Hủy
                  </Button>
                  <Button type="submit" disabled={saving} size="sm" className="h-8 rounded-[6px] text-xs font-semibold active:scale-[0.98]">
                    {saving && <Loader2 className="size-3 animate-spin mr-1" />} Lưu
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {showMedia && (
        <MediaPickerModal
          onSelect={m => { set('thumbnailMediaId', m._id); set('thumbnailUrl', m.url); setShowMedia(false); }}
          onClose={() => setShowMedia(false)}
        />
      )}

      {inUsePosts && <InUseDialog posts={inUsePosts} onClose={() => setInUsePosts(null)} />}
    </div>
  );
}
