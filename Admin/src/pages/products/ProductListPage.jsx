import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2, LayoutList, LayoutGrid, Eye, Layers, RefreshCw, CheckSquare, Globe, FileText } from '@/components/ui/Icons';
import { toast } from '@/providers/ToastProvider';
import { useProducts, useToggleProductStatus, useDeleteProduct, useDeleteBulkProducts, useBulkUpdateProductStatus } from '@/hooks/useProducts';
import { useMediaByIds } from '@/hooks/useMedia';
import { MediaThumbnailHover } from '@/components/ui/MediaFolderBadge';
import { useCategories } from '@/hooks/useCategories';
import { useBrands, useAllBrands } from '@/hooks/useBrands';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import DataTablePagination from '@/components/ui/DataTablePagination';
import Can from '@/components/auth/Can';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { productService } from '@/services/product.service';
import useColumnVisibility from '@/hooks/useColumnVisibility';
import ColumnToggleDropdown from '@/components/ui/ColumnToggleDropdown';

const STATUS_LABELS = { published: 'Công khai', draft: 'Nháp', out_of_stock: 'Hết hàng' };
const STATUS_BADGE = {
  published: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  draft: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  out_of_stock: 'bg-destructive/10 text-destructive border-destructive/20',
};

const PRODUCT_COLUMNS = [
  { id: 'product', label: 'Sản phẩm', defaultVisible: true, alwaysVisible: true },
  { id: 'sku', label: 'Mã SKU', defaultVisible: true },
  { id: 'status', label: 'Trạng thái', defaultVisible: true },
  { id: 'category', label: 'Danh mục', defaultVisible: true },
  { id: 'brand', label: 'Thương hiệu', defaultVisible: true },
  { id: 'price', label: 'Giá bán', defaultVisible: true },
  { id: 'variants', label: 'Biến thể', defaultVisible: true },
  { id: 'stock', label: 'Tồn kho', defaultVisible: true },
  { id: 'actions', label: 'Thao tác', defaultVisible: true, alwaysVisible: true },
];

const CLIENT_STORE_URL = import.meta.env.VITE_STORE_FRONTEND_URL || import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000';

function formatPrice(n) {
  if (!n) return '0đ';
  return n.toLocaleString('vi-VN') + 'đ';
}

export default function ProductListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const rowRefs = useRef({});

  const [keyword, setKeyword] = useState(searchParams.get('search') || searchParams.get('keyword') || '');
  const [filterCategory, setFilterCategory] = useState(searchParams.get('category') || '');
  const [filterBrand, setFilterBrand] = useState(searchParams.get('brand') || '');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || '');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [viewMode, setViewMode] = useState('table');
  const [selected, setSelected] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [bulkStatusConfirm, setBulkStatusConfirm] = useState(null); // 'published' | 'draft'

  const columnVisibility = useColumnVisibility('admin_products_columns', PRODUCT_COLUMNS);
  const { isColumnVisible } = columnVisibility;

  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam !== null && catParam !== filterCategory) {
      setFilterCategory(catParam);
      setPage(1);
    }
    const brandParam = searchParams.get('brand');
    if (brandParam !== null && brandParam !== filterBrand) {
      setFilterBrand(brandParam);
      setPage(1);
    }
    const statusParam = searchParams.get('status');
    if (statusParam !== null && statusParam !== filterStatus) {
      setFilterStatus(statusParam);
      setPage(1);
    }
  }, [searchParams]);

  const highlightId = searchParams.get('highlight');

  const params = { keyword, category: filterCategory, brand: filterBrand, status: filterStatus || undefined, page, limit };
  const { data, isLoading, refetch } = useProducts(params);
  const products = data?.data ?? [];
  const pagination = data?.pagination;

  useEffect(() => {
    if (!highlightId) return;
    productService.locate(highlightId, limit)
      .then((res) => { setPage(res.data?.data?.page || 1); })
      .catch(() => {});
  }, [highlightId]);
  useEffect(() => {
    if (!highlightId || !products.length) return;
    const found = products.find((p) => p._id === highlightId);
    if (!found) return;
    setSelected((prev) => prev.includes(highlightId) ? prev : [...prev, highlightId]);
    setTimeout(() => {
      const el = rowRefs.current[highlightId];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    setSearchParams((p) => { p.delete('highlight'); return p; }, { replace: true });
  }, [highlightId, products]);

  // Batch-fetch media objects de lay folder info cho thumbnail hover
  const resolveId = (v) => (v && typeof v === 'object' ? v._id : v);
  const allThumbIds = products.map((p) => resolveId(p.thumbnail?.mediaId || p.thumbnail?._id)).filter(Boolean);
  const { data: mediaMap = {} } = useMediaByIds(allThumbIds);

  const { data: categories = [] } = useCategories({ tree: 'false' });
  const { data: brands = [] } = useAllBrands();
  const toggleMut = useToggleProductStatus();
  const deleteMut = useDeleteProduct();
  const bulkDeleteMut = useDeleteBulkProducts();
  const bulkStatusMut = useBulkUpdateProductStatus();

  const handleBulkUpdateStatus = (status) => {
    bulkStatusMut.mutate({ ids: selected, status }, {
      onSuccess: (res) => {
        toast.success(res.data?.message || `Đã cập nhật ${selected.length} sản phẩm`);
        setSelected([]);
        setBulkStatusConfirm(null);
      },
      onError: (e) => toast.error(e.response?.data?.message || 'Lỗi cập nhật'),
    });
  };

  const handleViewFrontend = (slug) => {
    window.open(`${CLIENT_STORE_URL}/products/${slug}`, '_blank');
  };

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-3 text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            Làm mới
          </button>

          <Can do="product.create">
            <button
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors cursor-pointer"
              onClick={() => navigate('/products/new')}
            >
              <Plus size={16} /> Thêm sản phẩm
            </button>
          </Can>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <input
            className="h-9 w-full sm:w-64 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring placeholder:text-muted-foreground transition-colors"
            placeholder="Tìm sản phẩm, mã SKU..."
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
          />

          <SearchableSelect
            className="w-44 shrink-0"
            options={[
              { label: 'Tất cả danh mục', value: '' },
              ...(Array.isArray(categories) ? categories : []).map((c) => ({ label: c.name, value: c._id })),
            ]}
            value={filterCategory}
            onChange={(val) => { setFilterCategory(val); setPage(1); }}
            creatable={false}
            placeholder="Tất cả danh mục"
          />

          <SearchableSelect
            className="w-44 shrink-0"
            options={[
              { label: 'Tất cả thương hiệu', value: '' },
              ...(Array.isArray(brands) ? brands : []).map((b) => ({ label: b.name, value: b._id })),
            ]}
            value={filterBrand}
            onChange={(val) => { setFilterBrand(val); setPage(1); }}
            creatable={false}
            placeholder="Tất cả thương hiệu"
          />

          <SearchableSelect
            className="w-40 shrink-0"
            options={[
              { label: 'Tất cả trạng thái', value: '' },
              { label: 'Công khai', value: 'published' },
              { label: 'Nháp', value: 'draft' },
              { label: 'Hết hàng', value: 'out_of_stock' },
            ]}
            value={filterStatus}
            onChange={(val) => { setFilterStatus(val); setPage(1); }}
            creatable={false}
            placeholder="Tất cả trạng thái"
          />
        </div>

        <div className="flex items-center gap-2">
          <ColumnToggleDropdown columnVisibility={columnVisibility} />
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

      {selected.length > 0 && (
        <div className="flex items-center flex-wrap gap-2 px-3.5 py-2.5 rounded-xl border border-primary/30 bg-primary/5">
          <CheckSquare size={14} className="text-primary shrink-0" />
          <span className="text-sm font-medium text-foreground">Đã chọn <span className="text-primary font-bold">{selected.length}</span> sản phẩm</span>
          <div className="ml-auto flex items-center gap-2">
            <Can do="product.edit">
              <button
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer disabled:opacity-50"
                onClick={() => setBulkStatusConfirm('published')}
                disabled={bulkStatusMut.isPending}
              >
                <Globe size={13} /> Xuất bản
              </button>
              <button
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer disabled:opacity-50"
                onClick={() => setBulkStatusConfirm('draft')}
                disabled={bulkStatusMut.isPending}
              >
                <FileText size={13} /> Chuyển Nháp
              </button>
            </Can>
            <Can do="product.delete">
              <button
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors cursor-pointer"
                onClick={() => setBulkDeleteConfirm(true)}
              >
                <Trash2 size={13} /> Xóa
              </button>
            </Can>
            <button
              className="inline-flex h-8 items-center justify-center px-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              onClick={() => setSelected([])}
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

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
                {isColumnVisible('product') && <th className="px-3.5 py-3">Sản phẩm</th>}
                {isColumnVisible('sku') && <th className="px-3.5 py-3">SKU</th>}
                {isColumnVisible('status') && <th className="px-3.5 py-3">Trạng thái</th>}
                {isColumnVisible('category') && <th className="px-3.5 py-3">Danh mục</th>}
                {isColumnVisible('brand') && <th className="px-3.5 py-3">Thương hiệu</th>}
                {isColumnVisible('price') && <th className="px-3.5 py-3">Giá bán</th>}
                {isColumnVisible('variants') && <th className="px-3.5 py-3 text-center">Biến thể</th>}
                {isColumnVisible('stock') && <th className="px-3.5 py-3">Tồn kho</th>}
                {isColumnVisible('actions') && <th className="px-3.5 py-3">Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={columnVisibility.visibleCount + 1} className="py-12 text-center text-sm text-muted-foreground">Chưa có sản phẩm nào</td></tr>
              ) : products.map((p) => (
                <tr
                  key={p._id}
                  ref={(el) => { rowRefs.current[p._id] = el; }}
                  className={`border-b border-border/60 transition-colors hover:bg-muted/40 ${selected.includes(p._id) || p._id === highlightId ? 'bg-primary/8 ring-1 ring-inset ring-primary/30' : ''}`}
                >
                  <td className="px-3.5 py-3 align-middle"><input type="checkbox" className="size-4 rounded border-input text-primary focus:ring-ring" checked={selected.includes(p._id)} onChange={() => toggleSelect(p._id)} /></td>
                  {isColumnVisible('product') && (
                    <td className="px-3.5 py-3 align-middle">
                      <div className="flex items-center gap-2.5">
                        {(() => {
                          const mid = resolveId(p.thumbnail?.mediaId || p.thumbnail?._id);
                          return (
                            <MediaThumbnailHover media={mid ? mediaMap[mid] : null} className="size-10 shrink-0 rounded-md overflow-hidden border border-border bg-muted">
                              <img src={p.thumbnail?.url || 'https://placehold.co/40x40/1e293b/fff?text=?'} alt={p.name} className="size-full object-cover" />
                            </MediaThumbnailHover>
                          );
                        })()}
                        <span className="font-medium text-foreground text-sm line-clamp-1">{p.name}</span>
                      </div>
                    </td>
                  )}
                  {isColumnVisible('sku') && (
                    <td className="px-3.5 py-3 align-middle"><code className="inline-flex items-center rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground border border-border/50">{p.sku}</code></td>
                  )}
                  {isColumnVisible('status') && (
                    <td className="px-3.5 py-3 align-middle">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${STATUS_BADGE[p.status]}`}>
                        {STATUS_LABELS[p.status]}
                      </span>
                    </td>
                  )}
                  {isColumnVisible('category') && (
                    <td className="px-3.5 py-3 align-middle text-muted-foreground">
                      {p.category?.name || (Array.isArray(p.categories) && p.categories[0]?.name) || '—'}
                    </td>
                  )}
                  {isColumnVisible('brand') && (
                    <td className="px-3.5 py-3 align-middle text-muted-foreground">{p.brand?.name || '—'}</td>
                  )}
                  {isColumnVisible('price') && (
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
                  )}
                  {isColumnVisible('variants') && (
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
                  )}
                  {isColumnVisible('stock') && (
                    <td className="px-3.5 py-3 align-middle font-mono text-xs font-semibold">{p.stock} <span className="text-[11px] text-muted-foreground font-normal">{p.unit || 'Cái'}</span></td>
                  )}
                  {isColumnVisible('actions') && (
                    <td className="px-3.5 py-3 align-middle">
                      <div className="flex items-center gap-1">
                        <button className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" title="Xem trên Cửa hàng" onClick={() => handleViewFrontend(p.slug)}><Eye size={15} /></button>
                        <Can do="product.edit">
                          <button className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" title="Sửa" onClick={() => navigate(`/products/${p._id}/edit`)}><Pencil size={15} /></button>
                        </Can>
                        <Can do="product_variant.create">
                          <button className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-violet-500/10 hover:text-violet-500 transition-colors cursor-pointer" title="Quản lý biến thể" onClick={() => navigate(`/products/${p._id}/variants`)}><Layers size={15} /></button>
                        </Can>
                        <Can do="product.edit">
                          <button className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" title={p.isActive ? 'Ẩn' : 'Hiện'} onClick={() => handleToggle(p)}>
                            {p.isActive ? <ToggleRight size={15} className="text-emerald-600 dark:text-emerald-400" /> : <ToggleLeft size={15} />}
                          </button>
                        </Can>
                        <Can do="product.delete">
                          <button className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer" title="Xóa" onClick={() => setDeleteTarget(p)}><Trash2 size={15} /></button>
                        </Can>
                      </div>
                    </td>
                  )}
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
                <button className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" title="Xem trên Cửa hàng" onClick={() => handleViewFrontend(p.slug)}><Eye size={14} /></button>
                <Can do="product.edit">
                  <button className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" title="Sửa" onClick={() => navigate(`/products/${p._id}/edit`)}><Pencil size={14} /></button>
                </Can>
                <Can do="product_variant.create">
                  <button className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-violet-500/10 hover:text-violet-500 transition-colors cursor-pointer" title="Biến thể" onClick={() => navigate(`/products/${p._id}/variants`)}><Layers size={14} /></button>
                </Can>
                <Can do="product.edit">
                  <button className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" title={p.isActive ? 'Ẩn' : 'Hiện'} onClick={() => handleToggle(p)}>
                    {p.isActive ? <ToggleRight size={14} className="text-emerald-600 dark:text-emerald-400" /> : <ToggleLeft size={14} />}
                  </button>
                </Can>
                <Can do="product.delete">
                  <button className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer" title="Xóa" onClick={() => setDeleteTarget(p)}><Trash2 size={14} /></button>
                </Can>
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
      <ConfirmDialog
        open={!!bulkStatusConfirm}
        title={bulkStatusConfirm === 'published' ? `Xuất bản ${selected.length} sản phẩm` : `Chuyển ${selected.length} sản phẩm về Nháp`}
        description={bulkStatusConfirm === 'published'
          ? `${selected.length} sản phẩm sẽ được công khai trên cửa hàng.`
          : `${selected.length} sản phẩm sẽ bị ẩn khỏi cửa hàng.`}
        onConfirm={() => handleBulkUpdateStatus(bulkStatusConfirm)}
        onCancel={() => setBulkStatusConfirm(null)}
        loading={bulkStatusMut.isPending}
      />
    </div>
  );
}
