import { useState } from 'react';
import { Plus, Edit, Trash2, Search, Loader2 } from '@/components/ui/Icons';
import { useBlogTags } from '@/hooks/useBlog';
import { tagService } from '@/services/blog.service';
import { toast } from '@/providers/ToastProvider';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import DataTablePagination from '@/components/ui/DataTablePagination';

const EMPTY = { name: '', description: '', isActive: true };

export default function BlogTagPage() {
  const [query, setQuery]     = useState({ page: 1, limit: 20 });
  const [keyword, setKeyword] = useState('');
  const [modal, setModal]     = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [selected, setSelected] = useState([]);

  const { data: resTags, isLoading: loading, refetch } = useBlogTags(query);
  const data = resTags?.data || [];
  const pagination = resTags?.pagination || {};

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit   = (tag) => { setForm({ name: tag.name, description: tag.description || '', isActive: tag.isActive, _id: tag._id }); setModal('edit'); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Vui lòng nhập tên tag');
    setSaving(true);
    try {
      if (modal === 'create') {
        await tagService.create(form);
        toast.success('Đã tạo tag');
      } else {
        await tagService.update(form._id, form);
        toast.success('Đã cập nhật tag');
      }
      setModal(null);
      refetch();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi lưu tag');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await tagService.remove(id);
      toast.success('Đã xóa tag');
      setSelected(s => s.filter(x => x !== id));
      refetch();
    } catch (e) {
      toast.error('Lỗi xóa');
    }
  };

  const handleBulkDelete = async () => {
    try {
      const res = await tagService.removeBulk(selected);
      toast.success(`Đã xóa ${res.data.deleted} tag`);
      setSelected([]);
      refetch();
    } catch (e) {
      toast.error('Lỗi xóa hàng loạt');
    }
  };

  const toggleAll   = () => setSelected(s => s.length === data.length ? [] : data.map(t => t._id));
  const toggleOne   = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tags</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý nhãn bài viết</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="size-4" /> Tạo tag
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-0 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              className="w-full pl-9 pr-3 h-9 rounded-md border border-input bg-background text-sm outline-none focus:border-ring"
              placeholder="Tìm tag..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setQuery(q => ({ ...q, keyword, page: 1 }))}
            />
          </div>
          {selected.length > 0 && (
            <button onClick={() => setConfirm({ type: 'bulk' })} className="flex items-center gap-2 px-3 h-9 bg-destructive text-destructive-foreground rounded-md text-sm font-medium">
              <Trash2 className="size-4" /> Xóa {selected.length}
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={selected.length === data.length && data.length > 0} onChange={toggleAll} />
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tag</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-40">Slug</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground w-24">Bài viết</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground w-24">Trạng thái</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center"><Loader2 className="size-5 animate-spin mx-auto text-muted-foreground" /></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Chưa có tag nào</td></tr>
              ) : data.map(tag => (
                <tr key={tag._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(tag._id)} onChange={() => toggleOne(tag._id)} /></td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      #{tag.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs font-mono">{tag.slug}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{tag.postCount}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tag.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {tag.isActive ? 'Hoạt động' : 'Ẩn'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(tag)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Edit className="size-4" /></button>
                      <button onClick={() => setConfirm({ type: 'single', id: tag._id, name: tag.name })} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <DataTablePagination
          page={pagination.page || 1}
          pageSize={query.limit}
          total={pagination.total || 0}
          totalPages={pagination.totalPages || 1}
          onPageChange={p => setQuery(q => ({ ...q, page: p }))}
          onPageSizeChange={s => setQuery(q => ({ ...q, limit: s, page: 1 }))}
          className="px-4"
        />
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-xl">
            <div className="p-5 border-b border-border">
              <h2 className="font-semibold text-foreground">{modal === 'create' ? 'Tạo tag mới' : 'Chỉnh sửa tag'}</h2>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Tên tag <span className="text-destructive">*</span></label>
                <input className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nhập tên tag..." />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Mô tả</label>
                <textarea rows={2} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:border-ring resize-none" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Mô tả ngắn về tag..." />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
                <span className="text-sm">Hiển thị tag</span>
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">Hủy</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                  {saving && <Loader2 className="size-4 animate-spin" />} Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.type === 'bulk' ? `Xóa ${selected.length} tags?` : `Xóa tag "#${confirm.name}"?`}
          description="Hành động này không thể hoàn tác."
          onConfirm={() => { confirm.type === 'bulk' ? handleBulkDelete() : handleDelete(confirm.id); setConfirm(null); }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
