import { useState, useEffect, useRef } from 'react';
import { toast } from '@/providers/ToastProvider';
import {
  useBrands,
  useCreateBrand,
  useUpdateBrand,
  useToggleBrandStatus,
  useDeleteBrand,
  useDeleteBulkBrands,
} from '@/hooks/useBrands';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import DataTablePagination from '@/components/ui/DataTablePagination';
import { useSearchParams } from 'react-router-dom';
import { brandService } from '@/services/brand.service';

import BrandToolbar from './components/BrandToolbar';
import BrandTable from './components/BrandTable';
import BrandFormModal from './components/BrandFormModal';

const DEFAULT_FORM = {
  name: '',
  description: '',
  website: '',
  order: 0,
  logoMediaId: '',
  logoUrl: '',
  isActive: true,
};

export default function BrandPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [keyword, setKeyword] = useState(initialSearch);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selected, setSelected] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const rowRefs = useRef({});

  const res = useBrands({ keyword, page, limit });
  const brandData = res.data;
  const brands = brandData?.data ?? (Array.isArray(brandData) ? brandData : []);
  const pagination = brandData?.pagination;
  const isLoading = res.isLoading;

  const highlightId = searchParams.get('highlight');

  useEffect(() => {
    if (!highlightId) return;
    brandService
      .locate(highlightId, limit)
      .then((r) => {
        setPage(r.data?.data?.page || 1);
      })
      .catch(() => {});
  }, [highlightId, limit]);

  useEffect(() => {
    if (!highlightId || !brands.length) return;
    const found = brands.find((b) => b._id === highlightId);
    if (!found) return;
    setSelected((prev) => (prev.includes(highlightId) ? prev : [...prev, highlightId]));
    setTimeout(() => {
      const el = rowRefs.current[highlightId];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    setSearchParams(
      (p) => {
        p.delete('highlight');
        return p;
      },
      { replace: true }
    );
  }, [highlightId, brands, setSearchParams]);

  const createMut = useCreateBrand();
  const updateMut = useUpdateBrand();
  const toggleMut = useToggleBrandStatus();
  const deleteMut = useDeleteBrand();
  const bulkDeleteMut = useDeleteBulkBrands();

  const openCreate = () => {
    setEditTarget(null);
    setForm({ ...DEFAULT_FORM });
    setShowForm(true);
  };

  const openEdit = (brand) => {
    setEditTarget(brand);
    setForm({
      name: brand.name,
      description: brand.description || '',
      website: brand.website || '',
      order: brand.order || 0,
      logoMediaId: brand.logo?.mediaId || '',
      logoUrl: brand.logo?.url || '',
      isActive: brand.isActive,
    });
    setShowForm(true);
  };

  const handleToggle = (brand) => {
    toggleMut.mutate(
      { id: brand._id, isActive: !brand.isActive },
      {
        onSuccess: () =>
          toast.success(brand.isActive ? 'Đã ẩn thương hiệu' : 'Đã kích hoạt thương hiệu'),
        onError: (e) => toast.error(e.response?.data?.message || 'Lỗi'),
      }
    );
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return toast.error('Vui lòng nhập tên thương hiệu');
    const payload = {
      name: form.name.trim(),
      description: form.description,
      website: form.website,
      order: Number(form.order),
      isActive: form.isActive,
      ...(form.logoMediaId && { logoMediaId: form.logoMediaId }),
    };

    const opts = {
      onSuccess: () => {
        toast.success(editTarget ? 'Cập nhật thương hiệu thành công' : 'Tạo thương hiệu thành công');
        setShowForm(false);
      },
      onError: (e) => toast.error(e.response?.data?.message || 'Lỗi thao tác'),
    };

    if (editTarget) updateMut.mutate({ id: editTarget._id, data: payload }, opts);
    else createMut.mutate(payload, opts);
  };

  const toggleSelect = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleSelectAll = () =>
    setSelected((prev) => (prev.length === brands.length ? [] : brands.map((b) => b._id)));

  return (
    <div className="space-y-4 max-w-full overflow-x-hidden pb-12 antialiased">
      {/* 1. Header Toolbar */}
      <BrandToolbar
        keyword={keyword}
        setKeyword={(kw) => {
          setKeyword(kw);
          setPage(1);
        }}
        selectedCount={selected.length}
        onRefresh={() => res.refetch()}
        isLoading={isLoading}
        onCreate={openCreate}
        onBulkDelete={() => setBulkDeleteConfirm(true)}
      />

      {/* 2. Brands Table */}
      <BrandTable
        brands={brands}
        selected={selected}
        onSelect={toggleSelect}
        onSelectAll={toggleSelectAll}
        onEdit={openEdit}
        onDelete={(b) => setDeleteTarget(b)}
        onToggle={handleToggle}
        highlightId={highlightId}
        rowRefs={rowRefs}
      />

      {/* 3. Pagination */}
      {pagination && (
        <DataTablePagination
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
        />
      )}

      {/* 4. Form Modal */}
      {showForm && (
        <BrandFormModal
          form={form}
          setForm={setForm}
          editTarget={editTarget}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          isMutating={createMut.isPending || updateMut.isPending}
        />
      )}

      {/* 5. Delete Confirms */}
      {deleteTarget && (
        <ConfirmDialog
          open={!!deleteTarget}
          title="Xác nhận xóa thương hiệu"
          description={`Bạn có chắc chắn muốn xóa thương hiệu "${deleteTarget.name}"? Thao tác này không thể hoàn tác.`}
          confirmLabel="Xóa thương hiệu"
          danger
          onConfirm={() => {
            deleteMut.mutate(deleteTarget._id, {
              onSuccess: () => {
                toast.success('Đã xóa thương hiệu');
                setDeleteTarget(null);
              },
              onError: (e) => toast.error(e.response?.data?.message || 'Lỗi'),
            });
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {bulkDeleteConfirm && (
        <ConfirmDialog
          open={bulkDeleteConfirm}
          title={`Xác nhận xóa ${selected.length} thương hiệu`}
          description="Hành động này sẽ xóa vĩnh viễn tất cả các thương hiệu đã chọn."
          confirmLabel={`Xóa ${selected.length} thương hiệu`}
          danger
          onConfirm={() => {
            bulkDeleteMut.mutate(selected, {
              onSuccess: () => {
                toast.success('Đã xóa thương hiệu');
                setSelected([]);
                setBulkDeleteConfirm(false);
              },
              onError: (e) => toast.error(e.response?.data?.message || 'Lỗi'),
            });
          }}
          onClose={() => setBulkDeleteConfirm(false)}
        />
      )}
    </div>
  );
}