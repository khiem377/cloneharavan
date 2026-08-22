import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2, LayoutList, LayoutGrid, Eye, Layers } from '@/components/ui/Icons';
import { toast } from '@/providers/ToastProvider';
import { useProducts, useToggleProductStatus, useDeleteProduct, useDeleteBulkProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useBrands, useAllBrands } from '@/hooks/useBrands';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import DataTablePagination from '@/components/ui/DataTablePagination';

const STATUS_LABELS = { published: 'Công khai', draft: 'Nháp', out_of_stock: 'Hết hàng' };
const STATUS_BADGE = {
  published: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  draft: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  out_of_stock: 'bg-destructive/10 text-destructive border-destructive/20',
};

function formatPrice(n) {
  if (!n) return '0đ';
  return n.toLocaleString('vi-VN') + 'đ';
}

export default function ProductListPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [viewMode, setViewMode] = useState('table');
  const [selected, setSelected] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const params = { keyword, category: filterCategory, brand: filterBrand, status: filterStatus || undefined, page, limit };
  const { data, isLoading } = useProducts(params);
  const products = data?.data ?? [];
  const pagination = data?.pagination;

  const { data: categories = [] } = useCategories({ tree: 'false' });
  const { data: brands = [] } = useAllBrands();
  const toggleMut = useToggleProductStatus();
  const deleteMut = useDeleteProduct();
  const bulkDeleteMut = useDeleteBulkProducts();

  const handleToggle = (p) => {
    toggleMut.mutate({ id: p._id, isActive: !p.isActive }, {
      onSuccess: () => toast.success('Cập nhật trạng thái thành công'),
      onError: (e) => toast.error(e.response?.data?.message || 'Lỗi'),
    });
  };

  const confirmDelete = () => {
    deleteMut.mutate(deleteTarget._id, {
      onSuccess: () => { toast.success('Đã xóa sản phẩm'); setDeleteTarget(null); },
      onError: (e) => toast.error(e.response?.data?.message || 'Lỗi'),
    });
  };

  const handleBulkDelete = () => {
    bulkDeleteMut.mutate(selected, {
      onSuccess: () => { toast.success('Đã xóa sản phẩm'); setSelected([]); setBulkDeleteConfirm(false); },
      onError: (e) => toast.error(e.response?.data?.message || 'Lỗi'),
    });
  };

  const toggleSelect = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const toggleSelectAll = () => {
    if (selected.length === products.length) setSelected([]);
    else setSelected(products.map((p) => p._id));
  };

  return (
    <div className="p-3 sm:p-6 flex flex-col gap-4 sm:gap-6 w-full max-w-full overflow-x-hidden min-h-full bg-background text-foreground">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sản phẩm</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{pagination?.total ?? 0} sản phẩm</p>
        </div>
        <button
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors cursor-pointer"
          onClick={() => navigate('/products/new')}
        >
          <Plus size={16} /> Thêm sản phẩm
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <input
            className="h-9 w-full sm:w-64 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring placeholder:text-muted-foreground transition-colors"
            placeholder="Tìm sản phẩm, mã SKU..."
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
          />

          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20 transition-colors cursor-pointer"
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
          >
            <option value="">Tất cả danh mục</option>
            {(Array.isArray(categories) ? categories : []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>

          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20 transition-colors cursor-pointer"
            value={filterBrand}
            onChange={(e) => { setFilterBrand(e.target.value); setPage(1); }}
          >
            <option value="">Tất cả thương hiệu</option>
            {(Array.isArray(brands) ? brands : []).map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>

          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20 transition-colors cursor-pointer"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="published">Công khai</option>
            <option value="draft">Nháp</option>
            <option value="out_of_stock">Hết hàng</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border border-border bg-muted p-0.5">
            <button
              className={`p-1.5 rounded transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-background text-foreground font-semibold shadow-2xs' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setViewMode('table')}
              title="Bảng"
            >
              <LayoutList size={16} />
            </button>
            <button
              className={`p-1.5 rounded transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-background text-foreground font-semibold shadow-2xs' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setViewMode('grid')}
              title="Lưới"
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          {selected.length > 0 && (
            <button
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 text-sm font-medium text-destructive hover:bg-destructive/20 transition-colors cursor-pointer"
              onClick={() => setBulkDeleteConfirm(true)}
            >
              <Trash2 size={14} /> Xóa {selected.length}
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-16 text-muted-foreground gap-2">
          <Loader2 className="animate-spin" size={28} />
        </div>
      ) : viewMode === 'table' ? (
        <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-2xs">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                <th className="px-3.5 py-3 w-10">
                  <input type="checkbox" className="size-4 rounded border-input text-primary focus:ring-ring" checked={selected.length === products.length && products.length > 0} onChange={toggleSelectAll} />
                </th>
                <th className="px-3.5 py-3">Sản phẩm</th>
                <th className="px-3.5 py-3">SKU</th>
                <th className="px-3.5 py-3">Trạng thái</th>
                <th className="px-3.5 py-3">Danh mục</th>
                <th className="px-3.5 py-3">Thương hiệu</th>
                <th className="px-3.5 py-3">Giá bán</th>
                <th className="px-3.5 py-3 text-center">Biến thể</th>
                <th className="px-3.5 py-3">Tồn kho</th>
                <th className="px-3.5 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={9} className="py-12 text-center text-sm text-muted-foreground">Chưa có sản phẩm nào</td></tr>
              ) : products.map((p) => (
                <tr key={p._id} className={`border-b border-border/60 transition-colors hover:bg-muted/40 ${selected.includes(p._id) ? 'bg-muted/70' : ''}`}>
                  <td className="px-3.5 py-3 align-middle"><input type="checkbox" className="size-4 rounded border-input text-primary focus:ring-ring" checked={selected.includes(p._id)} onChange={() => toggleSelect(p._id)} /></td>
                  <td className="px-3.5 py-3 align-middle">
                    <div className="flex items-center gap-2.5">
                      <img src={p.thumbnail?.url || 'https://placehold.co/40x40/1e293b/fff?text=?'} alt={p.name} className="size-10 rounded-md object-cover border border-border shrink-0 bg-muted" />
                      <span className="font-medium text-foreground text-sm line-clamp-1">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-3.5 py-3 align-middle"><code className="inline-flex items-center rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground border border-border/50">{p.sku}</code></td>
                  <td className="px-3.5 py-3 align-middle">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${STATUS_BADGE[p.status]}`}>
                      {STATUS_LABELS[p.status]}
                    </span>
                  </td>
                  <td className="px-3.5 py-3 align-middle text-muted-foreground">{p.category?.name || '—'}</td>
                  <td className="px-3.5 py-3 align-middle text-muted-foreground">{p.brand?.name || '—'}</td>
                  <td className="px-3.5 py-3 align-middle">
                    {p.salePrice > 0 && p.salePrice < p.price ? (
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-foreground text-sm">{formatPrice(p.salePrice)}</span>
                        <span className="text-xs text-muted-foreground line-through">{formatPrice(p.price)}</span>
                      </div>
                    ) : (
                      <span className="font-medium text-foreground">{formatPrice(p.price)}</span>
                    )}
                  </td>
                  <td className="px-3.5 py-3 align-middle text-center">
                    {p.variantCount > 0 ? (
                      <button
                        className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 transition-colors cursor-pointer"
                        title="Quản lý biến thể"
                        onClick={() => navigate(`/products/${p._id}/variants`)}
                      >
                        <Layers size={11} />
                        {p.variantCount}
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3.5 py-3 align-middle font-mono text-xs">{p.stock}</td>
                  <td className="px-3.5 py-3 align-middle">
                    <div className="flex items-center gap-1">
                      <button className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" title="Xem" onClick={() => window.open(`/products/${p.slug}`, '_blank')}><Eye size={15} /></button>
                      <button className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" title="Sửa" onClick={() => navigate(`/products/${p._id}/edit`)}><Pencil size={15} /></button>
                      <button className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-violet-500/10 hover:text-violet-500 transition-colors cursor-pointer" title="Quản lý biến thể" onClick={() => navigate(`/products/${p._id}/variants`)}><Layers size={15} /></button>
                      <button className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" title={p.isActive ? 'Ẩn' : 'Hiện'} onClick={() => handleToggle(p)}>
                        {p.isActive ? <ToggleRight size={15} className="text-emerald-600 dark:text-emerald-400" /> : <ToggleLeft size={15} />}
                      </button>
                      <button className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer" title="Xóa" onClick={() => setDeleteTarget(p)}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <div key={p._id} className={`rounded-xl border border-border bg-card text-card-foreground shadow-2xs overflow-hidden transition-all hover:border-primary/50 relative ${selected.includes(p._id) ? 'border-primary ring-2 ring-primary/30' : ''}`}>
              <div className="absolute top-2 left-2 z-10">
                <input type="checkbox" className="size-4 rounded border-input text-primary focus:ring-ring" checked={selected.includes(p._id)} onChange={() => toggleSelect(p._id)} />
              </div>
              <img src={p.thumbnail?.url || 'https://placehold.co/200x200/1e293b/fff?text=?'} alt={p.name} className="aspect-square w-full object-cover bg-muted" />
              <div className="p-3 flex flex-col gap-1.5">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border w-fit ${STATUS_BADGE[p.status]}`}>{STATUS_LABELS[p.status]}</span>
                <p className="font-semibold text-sm text-foreground line-clamp-1">{p.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                <p className="font-bold text-sm text-foreground">{formatPrice(p.salePrice > 0 && p.salePrice < p.price ? p.salePrice : p.price)}</p>
              </div>
              <div className="flex items-center justify-end gap-1 p-2 border-t border-border bg-muted/30">
                <button className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" title="Sửa" onClick={() => navigate(`/products/${p._id}/edit`)}><Pencil size={14} /></button>
                <button className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-violet-500/10 hover:text-violet-500 transition-colors cursor-pointer" title="Biến thể" onClick={() => navigate(`/products/${p._id}/variants`)}><Layers size={14} /></button>
                <button className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" title={p.isActive ? 'Ẩn' : 'Hiện'} onClick={() => handleToggle(p)}>
                  {p.isActive ? <ToggleRight size={14} className="text-emerald-600 dark:text-emerald-400" /> : <ToggleLeft size={14} />}
                </button>
                <button className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer" title="Xóa" onClick={() => setDeleteTarget(p)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DataTablePagination
        page={page}
        pageSize={limit}
        total={pagination?.total ?? 0}
        totalPages={pagination?.totalPages ?? 1}
        onPageChange={setPage}
        onPageSizeChange={setLimit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa sản phẩm"
        description={`Bạn có chắc muốn xóa "${deleteTarget?.name}" không?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMut.isPending}
      />
      <ConfirmDialog
        open={bulkDeleteConfirm}
        title={`Xóa ${selected.length} sản phẩm`}
        description="Hành động này không thể hoàn tác."
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
        loading={bulkDeleteMut.isPending}
      />
    </div>
  );
}
