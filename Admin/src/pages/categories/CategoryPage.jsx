import { useState } from 'react';
import { Plus, Pencil, Trash2, ChevronRight, ChevronDown, ToggleLeft, ToggleRight, Loader2 } from '@/components/ui/Icons';
import { toast } from '@/providers/ToastProvider';
import {
  useCategories, useCreateCategory, useUpdateCategory,
  useToggleCategoryStatus, useDeleteCategory, useDeleteBulkCategories,
} from '@/hooks/useCategories';
import { useBrands, useAllBrands } from '@/hooks/useBrands';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import MediaPickerModal from '@/components/ui/MediaPickerModal';

const DEFAULT_FORM = {
  name: '',
  description: '',
  order: 0,
  parentId: '',
  brandId: '',
  link: '',
  imageMediaId: '',
  imageUrl: '',
  iconMediaId: '',
  iconUrl: '',
  showOnMenu: true,
  isActive: true,
  metaTitle: '',
  metaDescription: '',
};

const LEVEL_LABELS = ['Cấp 1', 'Cấp 2', 'Cấp 3'];
const CONNECTORS = ['', '└─', '└──'];

function CategoryRow({ cat, level = 0, selected, onSelect, onEdit, onDelete, onToggle }) {
  const [expanded, setExpanded] = useState(level === 0);
  const hasChildren = cat.children?.length > 0;
  const isSelected = selected.includes(cat._id);

  const levelBadges = [
    'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20',
    'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
    'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
  ];

  return (
    <>
      <tr className={`border-b border-border/60 transition-colors hover:bg-muted/40 ${isSelected ? 'bg-muted/70' : ''}`}>
        <td className="px-3.5 py-3 align-middle w-10">
          <input
            type="checkbox"
            className="size-4 rounded border-input text-primary focus:ring-ring"
            checked={isSelected}
            onChange={() => onSelect(cat._id)}
          />
        </td>
        <td className="px-3.5 py-3 align-middle">
          <div className="flex items-center gap-2 py-0.5" style={{ paddingLeft: level * 24 }}>
            {level > 0 && <span className="font-mono text-xs text-muted-foreground/70 select-none mr-1">{CONNECTORS[level]}</span>}
            {hasChildren ? (
              <button
                className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </button>
            ) : (
              <span className="w-6 shrink-0" />
            )}
            {cat.icon?.url ? (
              <img src={cat.icon.url} alt="icon" className="size-8 rounded-md object-cover border border-border bg-muted shrink-0" />
            ) : cat.image?.url ? (
              <img src={cat.image.url} alt={cat.name} className="size-8 rounded-md object-cover border border-border bg-muted shrink-0" />
            ) : (
              <div className="size-8 rounded-md border border-border bg-muted/60 shrink-0" />
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-foreground text-sm truncate">{cat.name}</span>
              {cat.brandId && <span className="text-[11px] text-muted-foreground truncate">🔗 {cat.brandId.name}</span>}
              {cat.link && !cat.brandId && <span className="text-[11px] text-muted-foreground truncate">↗ {cat.link}</span>}
            </div>
          </div>
        </td>
        <td className="px-3.5 py-3 align-middle w-20">
          <span className={levelBadges[level] || levelBadges[2]}>
            {LEVEL_LABELS[level] || `Cấp ${level + 1}`}
          </span>
        </td>
        <td className="px-3.5 py-3 align-middle">
          <code className="inline-flex items-center rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground border border-border/50">
            {cat.slug}
          </code>
        </td>
        <td className="px-3.5 py-3 align-middle">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${cat.showOnMenu ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
            {cat.showOnMenu ? 'Menu' : 'Ẩn'}
          </span>
        </td>
        <td className="px-3.5 py-3 align-middle">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${cat.isActive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
            {cat.isActive ? 'Hoạt động' : 'Ẩn'}
          </span>
        </td>
        <td className="px-3.5 py-3 align-middle text-muted-foreground font-mono text-xs">{cat.order}</td>
        <td className="px-3.5 py-3 align-middle">
          <div className="flex items-center gap-1">
            <button className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" title="Sửa" onClick={() => onEdit(cat)}>
              <Pencil size={15} />
            </button>
            <button className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" title={cat.isActive ? 'Ẩn' : 'Hiện'} onClick={() => onToggle(cat)}>
              {cat.isActive ? <ToggleRight size={15} className="text-emerald-600 dark:text-emerald-400" /> : <ToggleLeft size={15} />}
            </button>
            <button className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer" title="Xóa" onClick={() => onDelete(cat)}>
              <Trash2 size={15} />
            </button>
          </div>
        </td>
      </tr>
      {hasChildren && expanded && cat.children.map((child) => (
        <CategoryRow
          key={child._id}
          cat={child}
          level={level + 1}
          selected={selected}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggle={onToggle}
        />
      ))}
    </>
  );
}

export default function CategoryPage() {
  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [mediaPickerFor, setMediaPickerFor] = useState(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const { data: categories = [], isLoading } = useCategories({ keyword, tree: 'true' });
  const { data: flatCategories = [] } = useCategories({});
  const { data: brands = [] } = useAllBrands();

  const createMut = useCreateCategory();
  const updateMut = useUpdateCategory();
  const toggleMut = useToggleCategoryStatus();
  const deleteMut = useDeleteCategory();
  const bulkDeleteMut = useDeleteBulkCategories();

  const flatCats = Array.isArray(flatCategories) ? flatCategories : [];

  const openCreate = () => {
    setEditTarget(null);
    setForm(DEFAULT_FORM);
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditTarget(cat);
    setForm({
      name: cat.name,
      description: cat.description || '',
      order: cat.order || 0,
      parentId: cat.parentId?._id || cat.parentId || '',
      brandId: cat.brandId?._id || cat.brandId || '',
      link: cat.link || '',
      imageMediaId: cat.image?.mediaId || '',
      imageUrl: cat.image?.url || '',
      iconMediaId: cat.icon?.mediaId || '',
      iconUrl: cat.icon?.url || '',
      showOnMenu: cat.showOnMenu ?? true,
      isActive: cat.isActive,
      metaTitle: cat.metaTitle || '',
      metaDescription: cat.metaDescription || '',
    });
    setShowForm(true);
  };

  const handleToggle = (cat) => {
    toggleMut.mutate({ id: cat._id, isActive: !cat.isActive }, {
      onSuccess: () => toast.success(`${cat.isActive ? 'Ẩn' : 'Hiện'} danh mục thành công`),
      onError: (e) => toast.error(e.response?.data?.message || 'Lỗi'),
    });
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return toast.error('Vui lòng nhập tên danh mục');
    const payload = {
      name: form.name.trim(),
      description: form.description,
      order: Number(form.order),
      parentId: form.parentId || null,
      brandId: form.brandId || null,
      link: form.link,
      showOnMenu: form.showOnMenu,
      isActive: form.isActive,
      metaTitle: form.metaTitle,
      metaDescription: form.metaDescription,
      ...(form.imageMediaId && { imageMediaId: form.imageMediaId }),
      ...(form.iconMediaId && { iconMediaId: form.iconMediaId }),
    };

    const opts = {
      onSuccess: () => {
        toast.success(editTarget ? 'Cập nhật danh mục thành công' : 'Tạo danh mục thành công');
        setShowForm(false);
      },
      onError: (e) => toast.error(e.response?.data?.message || 'Lỗi'),
    };

    if (editTarget) updateMut.mutate({ id: editTarget._id, data: payload }, opts);
    else createMut.mutate(payload, opts);
  };

  const confirmDelete = () => {
    deleteMut.mutate(deleteTarget._id, {
      onSuccess: () => { toast.success('Đã xóa danh mục'); setDeleteTarget(null); },
      onError: (e) => toast.error(e.response?.data?.message || 'Lỗi'),
    });
  };

  const handleBulkDelete = () => {
    bulkDeleteMut.mutate(selected, {
      onSuccess: () => { toast.success('Đã xóa danh mục'); setSelected([]); setBulkDeleteConfirm(false); },
      onError: (e) => toast.error(e.response?.data?.message || 'Lỗi'),
    });
  };

  const toggleSelect = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleMediaPick = (media) => {
    if (mediaPickerFor === 'image') {
      setForm((f) => ({ ...f, imageMediaId: media._id, imageUrl: media.url }));
    } else if (mediaPickerFor === 'icon') {
      setForm((f) => ({ ...f, iconMediaId: media._id, iconUrl: media.url }));
    }
    setMediaPickerFor(null);
  };

  const isMutating = createMut.isPending || updateMut.isPending;

  return (
    <div className="p-6 flex flex-col gap-6 w-full max-w-7xl mx-auto min-h-full bg-background text-foreground">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Danh mục</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Quản lý danh mục sản phẩm</p>
        </div>
        <button
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors cursor-pointer"
          onClick={openCreate}
        >
          <Plus size={16} /> Tạo danh mục
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          className="h-9 w-64 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring placeholder:text-muted-foreground transition-colors"
          placeholder="Tìm danh mục..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        {selected.length > 0 && (
          <button
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 text-sm font-medium text-destructive hover:bg-destructive/20 transition-colors cursor-pointer"
            onClick={() => setBulkDeleteConfirm(true)}
          >
            <Trash2 size={14} /> Xóa {selected.length} mục
          </button>
        )}
      </div>

      <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-2xs">
        {isLoading ? (
          <div className="flex justify-center items-center py-16 text-muted-foreground gap-2">
            <Loader2 className="animate-spin" size={28} />
          </div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-3.5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap w-10"></th>
                <th className="px-3.5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Tên danh mục</th>
                <th className="px-3.5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap w-20">Cấp</th>
                <th className="px-3.5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Slug</th>
                <th className="px-3.5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Menu</th>
                <th className="px-3.5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Trạng thái</th>
                <th className="px-3.5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Thứ tự</th>
                <th className="px-3.5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-muted-foreground">Chưa có danh mục nào</td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <CategoryRow
                    key={cat._id}
                    cat={cat}
                    level={0}
                    selected={selected}
                    onSelect={toggleSelect}
                    onEdit={openEdit}
                    onDelete={setDeleteTarget}
                    onToggle={handleToggle}
                  />
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4" onClick={() => setShowForm(false)}>
          <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-background shadow-xl text-foreground" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border px-5 py-4 font-semibold text-foreground">
              <h2 className="text-base font-semibold text-foreground">{editTarget ? 'Sửa danh mục' : 'Tạo danh mục'}</h2>
              <button className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer text-lg font-bold" onClick={() => setShowForm(false)}>×</button>
            </div>
            <div className="flex flex-col gap-4 p-5 overflow-y-auto max-h-[75vh]">

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Tên danh mục <span className="text-destructive ml-0.5">*</span></label>
                <input
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Nhập tên danh mục"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Danh mục cha</label>
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors"
                  value={form.parentId}
                  onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                >
                  <option value="">-- Không có (danh mục gốc) --</option>
                  {flatCats.filter((c) => c._id !== editTarget?._id).map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground">Liên kết Brand</label>
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors"
                    value={form.brandId}
                    onChange={(e) => setForm((f) => ({ ...f, brandId: e.target.value }))}
                  >
                    <option value="">-- Không liên kết --</option>
                    {brands.map((b) => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground">Link tùy chỉnh</label>
                  <input
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors"
                    value={form.link}
                    onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                    placeholder="/tivi-tra-gop hoặc https://..."
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Mô tả</label>
                <textarea
                  className="w-full rounded-md border border-input bg-background p-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Mô tả danh mục"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground">Thứ tự</label>
                  <input
                    type="number"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors"
                    value={form.order}
                    onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground">Trạng thái</label>
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors"
                    value={form.isActive ? 'true' : 'false'}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.value === 'true' }))}
                  >
                    <option value="true">Hoạt động</option>
                    <option value="false">Ẩn</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground">Hiện trên menu</label>
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors"
                    value={form.showOnMenu ? 'true' : 'false'}
                    onChange={(e) => setForm((f) => ({ ...f, showOnMenu: e.target.value === 'true' }))}
                  >
                    <option value="true">Hiện</option>
                    <option value="false">Ẩn</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Hình ảnh danh mục</label>
                <div className="flex items-center gap-3 mt-1">
                  {form.imageUrl && (
                    <img src={form.imageUrl} alt="preview" className="size-12 rounded-md object-cover border border-border bg-muted shrink-0" />
                  )}
                  <button type="button" className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-3.5 text-sm font-medium text-foreground hover:bg-accent cursor-pointer" onClick={() => setMediaPickerFor('image')}>
                    Chọn ảnh từ thư viện
                  </button>
                  {form.imageUrl && (
                    <button type="button" className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer" onClick={() => setForm((f) => ({ ...f, imageMediaId: '', imageUrl: '' }))}>
                      Xóa ảnh
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Icon danh mục (hiện sidebar)</label>
                <div className="flex items-center gap-3 mt-1">
                  {form.iconUrl && (
                    <img src={form.iconUrl} alt="icon" className="size-12 rounded-md object-cover border border-border bg-muted shrink-0" />
                  )}
                  <button type="button" className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-3.5 text-sm font-medium text-foreground hover:bg-accent cursor-pointer" onClick={() => setMediaPickerFor('icon')}>
                    Chọn icon từ thư viện
                  </button>
                  {form.iconUrl && (
                    <button type="button" className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer" onClick={() => setForm((f) => ({ ...f, iconMediaId: '', iconUrl: '' }))}>
                      Xóa icon
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Meta Title (SEO)</label>
                <input
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors"
                  value={form.metaTitle}
                  onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))}
                  placeholder="Tiêu đề SEO"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Meta Description (SEO)</label>
                <textarea
                  className="w-full rounded-md border border-input bg-background p-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors"
                  rows={2}
                  value={form.metaDescription}
                  onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
                  placeholder="Mô tả SEO"
                />
              </div>

            </div>
            <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/40 px-5 py-3">
              <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer" onClick={() => setShowForm(false)}>Hủy</button>
              <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer" onClick={handleSubmit} disabled={isMutating}>
                {isMutating ? <Loader2 size={15} className="animate-spin" /> : (editTarget ? 'Cập nhật' : 'Tạo mới')}
              </button>
            </div>
          </div>
        </div>
      )}

      {mediaPickerFor && (
        <MediaPickerModal onSelect={handleMediaPick} onClose={() => setMediaPickerFor(null)} />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa danh mục"
        description={`Bạn có chắc muốn xóa "${deleteTarget?.name}" không? Hành động này không thể hoàn tác.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMut.isPending}
      />

      <ConfirmDialog
        open={bulkDeleteConfirm}
        title={`Xóa ${selected.length} danh mục`}
        description="Hành động này sẽ xóa tất cả danh mục đã chọn và không thể hoàn tác."
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
        loading={bulkDeleteMut.isPending}
      />
    </div>
  );
}
