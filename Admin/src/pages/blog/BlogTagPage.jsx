import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Loader2, X } from '@/components/ui/Icons';
import { useBlogTags } from '@/hooks/useBlog';
import { tagService } from '@/services/blog.service';
import { toast } from '@/providers/ToastProvider';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import DataTablePagination from '@/components/ui/DataTablePagination';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table';

const EMPTY = { name: '', description: '', isActive: true };

export default function BlogTagPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [keyword, setKeyword] = useState(initialSearch);
  const [query, setQuery]     = useState({ page: 1, limit: 20, keyword: initialSearch });
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
    <div className="space-y-4 max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Tags Blog</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Quản lý nhãn bài viết</p>
        </div>
        <Button
          onClick={openCreate}
          size="sm"
          className="h-8 rounded-[6px] text-xs font-semibold active:scale-[0.98]"
        >
          <Plus className="size-3.5 mr-1" /> Tạo tag
        </Button>
      </div>

      <Card className="rounded-[6px] border border-border shadow-none overflow-hidden">
        <div className="p-3 border-b border-border flex items-center justify-between gap-3 flex-wrap bg-muted/20">
          <div className="relative flex-1 min-w-0 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              className="pl-8 h-8 rounded-[6px] text-xs"
              placeholder="Tìm tag..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setQuery(q => ({ ...q, keyword, page: 1 }))}
            />
          </div>
          {selected.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirm({ type: 'bulk' })}
              className="h-8 px-3 rounded-[6px] text-xs font-semibold"
            >
              <Trash2 className="size-3.5 mr-1" /> Xóa {selected.length} tags
            </Button>
          )}
        </div>

        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-10 px-3 py-2 text-center">
                <input
                  type="checkbox"
                  checked={selected.length === data.length && data.length > 0}
                  onChange={toggleAll}
                  className="rounded-[3px] border-border size-3.5"
                />
              </TableHead>
              <TableHead className="text-xs font-semibold py-2">Tag</TableHead>
              <TableHead className="text-xs font-semibold py-2 w-40">Slug</TableHead>
              <TableHead className="text-xs font-semibold py-2 text-right w-24">Bài viết</TableHead>
              <TableHead className="text-xs font-semibold py-2 text-center w-28">Trạng thái</TableHead>
              <TableHead className="w-20 py-2" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <Loader2 className="size-5 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-xs text-muted-foreground font-mono">
                  Chưa có tag nào
                </TableCell>
              </TableRow>
            ) : data.map(tag => (
              <TableRow key={tag._id} className="hover:bg-muted/30">
                <TableCell className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={selected.includes(tag._id)}
                    onChange={() => toggleOne(tag._id)}
                    className="rounded-[3px] border-border size-3.5"
                  />
                </TableCell>
                <TableCell className="py-2">
                  <span className="inline-flex items-center gap-1 rounded-[4px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 text-xs font-medium font-mono">
                    #{tag.name}
                  </span>
                </TableCell>
                <TableCell className="py-2 text-muted-foreground text-xs font-mono">{tag.slug}</TableCell>
                <TableCell className="py-2 text-right text-foreground font-mono text-xs tabular-nums font-semibold">{tag.postCount || 0}</TableCell>
                <TableCell className="py-2 text-center">
                  <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-semibold ${
                    tag.isActive ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-muted text-muted-foreground border border-border'
                  }`}>
                    {tag.isActive ? 'Hoạt động' : 'Ẩn'}
                  </span>
                </TableCell>
                <TableCell className="py-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(tag)}
                      className="h-7 w-7 rounded-[4px] text-muted-foreground hover:text-foreground"
                    >
                      <Edit className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setConfirm({ type: 'single', id: tag._id, name: tag.name })}
                      className="h-7 w-7 rounded-[4px] text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <DataTablePagination
          page={pagination.page || 1}
          pageSize={query.limit}
          total={pagination.total || 0}
          totalPages={pagination.totalPages || 1}
          onPageChange={p => setQuery(q => ({ ...q, page: p }))}
          onPageSizeChange={s => setQuery(q => ({ ...q, limit: s, page: 1 }))}
          className="px-4 py-2 border-t border-border"
        />
      </Card>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <Card className="rounded-[6px] border border-border w-full max-w-md shadow-lg">
            <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-semibold text-foreground">
                {modal === 'create' ? 'Tạo tag mới' : 'Chỉnh sửa tag'}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setModal(null)} className="h-7 w-7 rounded-[4px]">
                <X className="size-4" />
              </Button>
            </CardHeader>
            <form onSubmit={handleSave}>
              <CardContent className="p-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Tên tag <span className="text-destructive">*</span></label>
                  <Input
                    className="h-8 rounded-[6px] text-xs"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Nhập tên tag..."
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Mô tả</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-1.5 rounded-[6px] border border-input bg-background text-xs outline-none focus:border-ring resize-none"
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="Mô tả ngắn về tag..."
                  />
                </div>
                <label className="flex items-center gap-2 text-xs pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => set('isActive', e.target.checked)}
                    className="rounded-[3px] size-3.5"
                  />
                  <span>Hiển thị tag</span>
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

      {confirm && (
        <ConfirmDialog
          open={!!confirm}
          title={confirm.type === 'bulk' ? `Xóa ${selected.length} tags?` : `Xóa tag "#${confirm.name}"?`}
          description="Hành động này không thể hoàn tác."
          confirmLabel="Xóa tag"
          danger
          onConfirm={() => {
            if (confirm.type === 'bulk') handleBulkDelete();
            else handleDelete(confirm.id);
            setConfirm(null);
          }}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
