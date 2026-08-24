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
import { Plus, Edit, Trash2, Loader2, X } from '@/components/ui/Icons';
import { useBlogCategories } from '@/hooks/useBlog';
import { blogCategoryService } from '@/services/blog.service';
import { toast } from '@/providers/ToastProvider';
import DataTablePagination from '@/components/ui/DataTablePagination';
import MediaPickerModal from '@/components/ui/MediaPickerModal';

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
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`hover:bg-muted/30 transition-colors select-none ${isDragging ? 'bg-muted/50 shadow-lg ring-1 ring-border rounded' : ''}`}
    >
      <td className="px-3 py-3 w-10" onPointerDown={stopProp} onClick={stopProp}>
        <input type="checkbox" checked={selected} onChange={onSelect} className="rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {cat.thumbnailUrl
            ? <img src={cat.thumbnailUrl} alt="" className="size-8 object-cover rounded border border-border" />
            : <div className="size-8 bg-muted rounded border border-dashed border-border" />
          }
          <div>
            <div className="font-medium text-foreground">{cat.name}</div>
            <div className="text-xs text-muted-foreground">{cat.slug}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-muted-foreground text-sm">{cat.order}</td>
      <td className="px-4 py-3 text-right text-muted-foreground text-sm">{cat.postCount}</td>
      <td className="px-4 py-3 text-center" onPointerDown={stopProp} onClick={stopProp}>
        <button
          onClick={() => blogCategoryService.toggleStatus(cat._id, !cat.isActive).then(() => window.location.reload())}
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
        >
          {cat.isActive ? 'Hoạt động' : 'Ẩn'}
        </button>
      </td>
      <td className="px-4 py-3" onPointerDown={stopProp} onClick={stopProp}>
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => onEdit(cat)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Edit className="size-4" /></button>
          <button onClick={() => onDelete(cat)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="size-4" /></button>
        </div>
      </td>
    </tr>
  );
}

function InUseDialog({ posts, onClose }) {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-xl">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Không thể xóa danh mục</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted text-muted-foreground"><X className="size-4" /></button>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm text-muted-foreground">Danh mục này đang được sử dụng bởi các bài viết sau:</p>
          <ul className="space-y-1.5">
            {posts.map(p => (
              <li key={p._id}>
                <button
                  onClick={() => { navigate(`/blog/posts/${p._id}/edit`); onClose(); }}
                  className="text-sm text-primary hover:underline text-left"
                >
                  {p.title}
                </button>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">Vui lòng chuyển bài viết sang danh mục khác trước khi xóa.</p>
        </div>
        <div className="p-4 border-t border-border flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">Đóng</button>
        </div>
      </div>
    </div>
  );
}

export default function BlogCategoryPage() {
  const [query]                   = useState({ page: 1, limit: 100 });
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Danh mục Blog</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý danh mục bài viết</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="size-4" /> Tạo danh mục
        </button>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-primary/5 border border-primary/20 rounded-lg">
          <span className="text-sm text-foreground font-medium">Đã chọn {selected.length}</span>
          <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive text-white rounded-md text-xs font-medium hover:bg-destructive/90 transition-colors">
            <Trash2 className="size-3.5" /> Xóa đã chọn
          </button>
          <button onClick={() => setSelected([])} className="text-xs text-muted-foreground hover:text-foreground ml-auto">Bỏ chọn</button>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">Chưa có danh mục nào</div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  <th className="px-3 py-3 w-10">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded" />
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tên</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground w-20">Thứ tự</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground w-20">Bài viết</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground w-28">Trạng thái</th>
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
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
              </tbody>
            </table>
          </DndContext>
        )}

        <DataTablePagination
          page={pagination.page || 1}
          pageSize={query.limit}
          total={pagination.total || 0}
          totalPages={pagination.totalPages || 1}
          onPageChange={p => { setLocalData(null); setQuery(q => ({ ...q, page: p })); }}
          onPageSizeChange={s => { setLocalData(null); setQuery(q => ({ ...q, limit: s, page: 1 })); }}
          className="px-4"
        />
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg shadow-xl">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-foreground">{modal === 'create' ? 'Tạo danh mục mới' : 'Chỉnh sửa danh mục'}</h2>
              <button onClick={() => setModal(null)} className="p-1 rounded hover:bg-muted text-muted-foreground"><X className="size-4" /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Tên <span className="text-destructive">*</span></label>
                <input className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Tên danh mục..." />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Mô tả</label>
                <textarea rows={2} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:border-ring resize-none" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Mô tả danh mục..." />
              </div>
              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Thứ tự</label>
                  <input type="number" className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring" value={form.order} onChange={e => set('order', Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Thumbnail</label>
                  <div className="flex items-center gap-2">
                    {form.thumbnailUrl
                      ? <img src={form.thumbnailUrl} alt="" className="size-9 object-cover rounded-lg border border-border" />
                      : <div className="size-9 bg-muted rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground text-xs">Ảnh</div>
                    }
                    <button type="button" onClick={() => setShowMedia(true)} className="px-3 h-8 rounded-md border border-border text-xs hover:bg-muted transition-colors">
                      {form.thumbnailUrl ? 'Đổi' : 'Chọn ảnh'}
                    </button>
                    {form.thumbnailUrl && <button type="button" onClick={() => { set('thumbnailMediaId', ''); set('thumbnailUrl', ''); }} className="text-xs text-destructive hover:underline">Xóa</button>}
                  </div>
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
                <span className="text-sm">Hiển thị danh mục</span>
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">Hủy</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {saving && <Loader2 className="size-4 animate-spin" />} Lưu
                </button>
              </div>
            </form>
          </div>
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
