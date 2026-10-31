import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from '@/providers/ToastProvider';
import {
  useProducts,
  useToggleProductStatus,
  useDeleteProduct,
  useDeleteBulkProducts,
  useBulkUpdateProductStatus,
} from '@/hooks/useProducts';
import { productService } from '@/services/product.service';
import { useMediaByIds } from '@/hooks/useMedia';
import { useCategories } from '@/hooks/useCategories';
import { useAllBrands } from '@/hooks/useBrands';
import useColumnVisibility from '@/hooks/useColumnVisibility';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import DataTablePagination from '@/components/ui/DataTablePagination';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import ProductHeader from './components/ProductHeader';
import ProductFilterBar from './components/ProductFilterBar';
import ProductBulkActionBar from './components/ProductBulkActionBar';
import ProductTable from './components/ProductTable';
import ProductGrid from './components/ProductGrid';
import BarcodePrintModal from './components/BarcodePrintModal';
import WholesalePricingModal from './components/WholesalePricingModal';
import CompositeBomModal from './components/CompositeBomModal';

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
  const [bulkStatusConfirm, setBulkStatusConfirm] = useState(null);

  // Modals
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [barcodeProducts, setBarcodeProducts] = useState([]);
  const [wholesaleModalOpen, setWholesaleModalOpen] = useState(false);
  const [wholesaleProduct, setWholesaleProduct] = useState(null);
  const [bomModalOpen, setBomModalOpen] = useState(false);
  const [bomProduct, setBomProduct] = useState(null);

  const columnVisibility = useColumnVisibility('admin_products_columns', PRODUCT_COLUMNS);
  const { isColumnVisible, visibleCount } = columnVisibility;

  useEffect(() => {
    const cat = searchParams.get('category') || '';
    const br = searchParams.get('brand') || '';
    const st = searchParams.get('status') || '';
    if (cat !== filterCategory) setFilterCategory(cat);
    if (br !== filterBrand) setFilterBrand(br);
    if (st !== filterStatus) setFilterStatus(st);
  }, [searchParams]);

  const highlightId = searchParams.get('highlight');
  const params = { keyword, category: filterCategory, brand: filterBrand, status: filterStatus || undefined, page, limit };
  const { data, isLoading, refetch } = useProducts(params);
  const products = data?.data ?? [];
  const pagination = data?.pagination;

  useEffect(() => {
    if (!highlightId) return;
    productService.locate(highlightId, limit)
      .then((res) => setPage(res.data?.data?.page || 1))
      .catch(() => {});
  }, [highlightId, limit]);

  useEffect(() => {
    if (!highlightId || !products.length) return;
    const found = products.find((p) => p._id === highlightId);
    if (!found) return;
    setSelected((prev) => (prev.includes(highlightId) ? prev : [...prev, highlightId]));
    setTimeout(() => {
      const el = rowRefs.current[highlightId];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    setSearchParams((p) => { p.delete('highlight'); return p; }, { replace: true });
  }, [highlightId, products, setSearchParams]);

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
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleSelectAll = () => {
    if (selected.length === products.length) setSelected([]);
    else setSelected(products.map((p) => p._id));
  };

  return (
    <div className="p-3 sm:p-6 flex flex-col gap-4 sm:gap-6 w-full max-w-full overflow-x-hidden min-h-full bg-background text-foreground antialiased">
      <ProductHeader
        total={pagination?.total ?? 0}
        isLoading={isLoading}
        onRefresh={() => refetch()}
        onOpenBarcodeModal={() => { setBarcodeProducts(products); setBarcodeModalOpen(true); }}
        onNavigateNew={() => navigate('/products/new')}
      />

      <ProductFilterBar
        keyword={keyword}
        onKeywordChange={(val) => { setKeyword(val); setPage(1); }}
        filterCategory={filterCategory}
        onCategoryChange={(val) => { setFilterCategory(val); setPage(1); }}
        categories={categories}
        filterBrand={filterBrand}
        onBrandChange={(val) => { setFilterBrand(val); setPage(1); }}
        brands={brands}
        filterStatus={filterStatus}
        onStatusChange={(val) => { setFilterStatus(val); setPage(1); }}
        columnVisibility={columnVisibility}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedCount={selected.length}
        onBulkDelete={() => setBulkDeleteConfirm(true)}
      />

      <ProductBulkActionBar
        selectedCount={selected.length}
        onPublish={() => setBulkStatusConfirm('published')}
        onDraft={() => setBulkStatusConfirm('draft')}
        onDelete={() => setBulkDeleteConfirm(true)}
        onPrintBarcodes={() => {
          setBarcodeProducts(products.filter((p) => selected.includes(p._id)));
          setBarcodeModalOpen(true);
        }}
        onClearSelection={() => setSelected([])}
        isStatusPending={bulkStatusMut.isPending}
        variant="inline"
      />

      {isLoading ? (
        <Card className="rounded-[6px] border border-border p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-4 py-2 border-b border-border/40 last:border-0">
              <Skeleton className="size-4 rounded-[4px]" />
              <Skeleton className="size-9 rounded-[4px]" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-5 w-20 rounded-[6px]" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </Card>
      ) : viewMode === 'table' ? (
        <ProductTable
          products={products}
          selected={selected}
          highlightId={highlightId}
          mediaMap={mediaMap}
          isColumnVisible={isColumnVisible}
          visibleColumnCount={visibleCount}
          rowRefs={rowRefs}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onViewFrontend={(slug) => window.open(`${CLIENT_STORE_URL}/products/${slug}`, '_blank')}
          onToggleStatus={handleToggle}
          onDeleteProduct={setDeleteTarget}
          onOpenBarcodeModal={(p) => { setBarcodeProducts([p]); setBarcodeModalOpen(true); }}
          onOpenWholesaleModal={(p) => { setWholesaleProduct(p); setWholesaleModalOpen(true); }}
          onOpenBomModal={(p) => { setBomProduct(p); setBomModalOpen(true); }}
        />
      ) : (
        <ProductGrid
          products={products}
          selected={selected}
          onToggleSelect={toggleSelect}
          onViewFrontend={(slug) => window.open(`${CLIENT_STORE_URL}/products/${slug}`, '_blank')}
          onToggleStatus={handleToggle}
          onDeleteProduct={setDeleteTarget}
        />
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
        description={bulkStatusConfirm === 'published' ? `${selected.length} sản phẩm sẽ được công khai.` : `${selected.length} sản phẩm sẽ bị ẩn.`}
        onConfirm={() => handleBulkUpdateStatus(bulkStatusConfirm)}
        onCancel={() => setBulkStatusConfirm(null)}
        loading={bulkStatusMut.isPending}
      />

      {barcodeModalOpen && (
        <BarcodePrintModal
          isOpen={barcodeModalOpen}
          onClose={() => setBarcodeModalOpen(false)}
          initialProducts={barcodeProducts}
        />
      )}

      {wholesaleModalOpen && wholesaleProduct && (
        <WholesalePricingModal
          isOpen={wholesaleModalOpen}
          onClose={() => { setWholesaleModalOpen(false); setWholesaleProduct(null); }}
          product={wholesaleProduct}
          onSuccess={() => refetch()}
        />
      )}

      {bomModalOpen && bomProduct && (
        <CompositeBomModal
          isOpen={bomModalOpen}
          onClose={() => { setBomModalOpen(false); setBomProduct(null); }}
          product={bomProduct}
          onSuccess={() => refetch()}
        />
      )}

      <ProductBulkActionBar
        selectedCount={selected.length}
        onPublish={() => setBulkStatusConfirm('published')}
        onDraft={() => setBulkStatusConfirm('draft')}
        onDelete={() => setBulkDeleteConfirm(true)}
        onClearSelection={() => setSelected([])}
        isStatusPending={bulkStatusMut.isPending}
        variant="floating"
      />
    </div>
  );
}
