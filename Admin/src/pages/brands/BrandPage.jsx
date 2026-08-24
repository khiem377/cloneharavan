import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Pencil, Trash2,
  ToggleLeft, ToggleRight,
  Loader2, Globe, RefreshCw,
} from '@/components/ui/Icons';
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
import MediaPickerModal from '@/components/ui/MediaPickerModal';
import DataTablePagination from '@/components/ui/DataTablePagination';
import { useSearchParams } from 'react-router-dom';
import Can from '@/components/auth/Can';

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
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selected, setSelected] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const rowRefs = useRef({});
  const [searchParams, setSearchParams] = useSearchParams();

  const res = useBrands({ keyword, page, limit });

  const brandData = res.data;
  const brands =
    brandData?.data ?? (Array.isArray(brandData) ? brandData : []);
  const pagination = brandData?.pagination;
  const isLoading = res.isLoading;

  const highlightId = searchParams.get('highlight');
  useEffect(() => {
    if (!highlightId || !brands.length) return;
    setSelected((prev) => prev.includes(highlightId) ? prev : [...prev, highlightId]);
    const el = rowRefs.current[highlightId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setSearchParams((p) => { p.delete('highlight'); return p; }, { replace: true });
    }
  }, [highlightId, brands]);

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
      {
        id: brand._id,
        isActive: !brand.isActive,
      },
      {
        onSuccess: () => toast.success('Cập nhật trạng thái thành công'),
        onError: (e) =>
          toast.error(e.response?.data?.message || 'Lỗi'),
      }
    );
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      return toast.error('Vui lòng nhập tên thương hiệu');
    }

    const payload = {
      name: form.name.trim(),
      description: form.description,
      website: form.website,
      order: Number(form.order),
      isActive: form.isActive,
      ...(form.logoMediaId && {
        logoMediaId: form.logoMediaId,
      }),
    };

    const opts = {
      onSuccess: () => {
        toast.success(
          editTarget
            ? 'Cập nhật thành công'
            : 'Tạo thương hiệu thành công'
        );
        setShowForm(false);
      },
      onError: (e) =>
        toast.error(e.response?.data?.message || 'Lỗi'),
    };

    if (editTarget) {
      updateMut.mutate(
        {
          id: editTarget._id,
          data: payload,
        },
        opts
      );
    } else {
      createMut.mutate(payload, opts);
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    deleteMut.mutate(deleteTarget._id, {
      onSuccess: () => {
        toast.success('Đã xóa thương hiệu');
        setDeleteTarget(null);
      },
      onError: (e) =>
        toast.error(e.response?.data?.message || 'Lỗi'),
    });
  };

  const handleBulkDelete = () => {
    bulkDeleteMut.mutate(selected, {
      onSuccess: () => {
        toast.success('Đã xóa thương hiệu');
        setSelected([]);
        setBulkDeleteConfirm(false);
      },
      onError: (e) =>
        toast.error(e.response?.data?.message || 'Lỗi'),
    });
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const handleMediaPick = (media) => {
    setForm((f) => ({
      ...f,
      logoMediaId: media._id,
      logoUrl: media.url,
    }));

    setShowMediaPicker(false);
  };

  const isMutating = createMut.isPending || updateMut.isPending;

  return (
    <div className="p-3 sm:p-6 flex flex-col gap-4 sm:gap-6 w-full max-w-full overflow-x-hidden min-h-full bg-background text-foreground">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Thương hiệu
          </h1>

          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý thương hiệu sản phẩm
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => res.refetch()}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-3 text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            Làm mới
          </button>

          <Can do="brand.manage">
            <button
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors cursor-pointer"
              onClick={openCreate}
            >
              <Plus size={16} />
              Tạo thương hiệu
            </button>
          </Can>
        </div>
      </div>

      {/* Search + Bulk actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          className="h-9 w-full sm:w-64 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring placeholder:text-muted-foreground transition-colors"
          placeholder="Tìm thương hiệu..."
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1);
          }}
        />

        {selected.length > 0 && (
          <button
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 text-sm font-medium text-destructive hover:bg-destructive/20 transition-colors cursor-pointer"
            onClick={() => setBulkDeleteConfirm(true)}
          >
            <Trash2 size={14} />
            Xóa {selected.length} mục
          </button>
        )}
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-2xs">
        {isLoading ? (
          <div className="flex justify-center items-center py-16 text-muted-foreground gap-2">
            <Loader2
              className="animate-spin"
              size={28}
            />
          </div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                <th className="px-3.5 py-3 w-10"></th>
                <th className="px-3.5 py-3">Logo</th>
                <th className="px-3.5 py-3">
                  Tên thương hiệu
                </th>
                <th className="px-3.5 py-3">Slug</th>
                <th className="px-3.5 py-3">Website</th>
                <th className="px-3.5 py-3">Trạng thái</th>
                <th className="px-3.5 py-3">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {brands.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    Chưa có thương hiệu nào
                  </td>
                </tr>
              ) : (
                brands.map((brand) => (
                  <tr
                    key={brand._id}
                    ref={(el) => { rowRefs.current[brand._id] = el; }}
                    className={`border-b border-border/60 transition-colors hover:bg-muted/40 ${
                      selected.includes(brand._id) ? 'bg-primary/8 ring-1 ring-inset ring-primary/30' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-3.5 py-3 align-middle">
                      <input
                        type="checkbox"
                        className="size-4 rounded border-input text-primary focus:ring-ring"
                        checked={selected.includes(brand._id)}
                        onChange={() =>
                          toggleSelect(brand._id)
                        }
                      />
                    </td>

                    {/* Logo */}
                    <td className="px-3.5 py-3 align-middle">
                      <div className="w-20 h-9 flex items-center justify-center rounded border border-border bg-white dark:bg-zinc-900 overflow-hidden p-1">
                        {brand.logo?.url ? (
                          <img
                            src={
                              brand.logo.url.includes('cloudinary.com')
                                ? brand.logo.url.replace('/upload/', '/upload/c_pad,w_96,h_36,b_white/')
                                : brand.logo.url
                            }
                            alt={brand.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full rounded bg-muted/60" />
                        )}
                      </div>
                    </td>

                    {/* Name */}
                    <td className="px-3.5 py-3 align-middle font-medium text-foreground">
                      {brand.name}
                    </td>

                    {/* Slug */}
                    <td className="px-3.5 py-3 align-middle">
                      <code className="inline-flex items-center rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground border border-border/50">
                        {brand.slug}
                      </code>
                    </td>

                    {/* Website */}
                    <td className="px-3.5 py-3 align-middle">
                      {brand.website ? (
                        <a
                          href={brand.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <Globe size={13} />
                          {brand.website}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-3.5 py-3 align-middle">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${brand.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-muted text-muted-foreground border-border'
                          }`}
                      >
                        {brand.isActive
                          ? 'Hoạt động'
                          : 'Ẩn'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-3.5 py-3 align-middle">
                      <div className="flex items-center gap-1">
                        <Can do="brand.manage">
                          <button
                            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                            title="Sửa"
                            onClick={() => openEdit(brand)}
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                            title={
                              brand.isActive ? 'Ẩn' : 'Hiện'
                            }
                            onClick={() =>
                              handleToggle(brand)
                            }
                          >
                            {brand.isActive ? (
                              <ToggleRight
                                size={15}
                                className="text-emerald-600 dark:text-emerald-400"
                              />
                            ) : (
                              <ToggleLeft size={15} />
                            )}
                          </button>

                          <button
                            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                            title="Xóa"
                            onClick={() =>
                              setDeleteTarget(brand)
                            }
                          >
                            <Trash2 size={15} />
                          </button>
                        </Can>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <DataTablePagination
        page={page}
        pageSize={limit}
        total={pagination?.total ?? 0}
        totalPages={pagination?.totalPages ?? 1}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setLimit(size);
          setPage(1);
        }}
      />

      {/* Create / Edit Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="flex w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-background shadow-xl text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4 font-semibold text-foreground">
              <h2 className="text-base font-semibold text-foreground">
                {editTarget
                  ? 'Sửa thương hiệu'
                  : 'Tạo thương hiệu'}
              </h2>

              <button
                className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer text-lg font-bold"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col gap-4 p-5 overflow-y-auto max-h-[75vh]">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">
                  Tên thương hiệu{' '}
                  <span className="text-destructive ml-0.5">
                    *
                  </span>
                </label>

                <input
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Samsung, Apple, LG..."
                />
              </div>

              {/* Website */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">
                  Website
                </label>

                <input
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors"
                  value={form.website}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      website: e.target.value,
                    }))
                  }
                  placeholder="https://samsung.com"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">
                  Mô tả
                </label>

                <textarea
                  className="w-full rounded-md border border-input bg-background p-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Mô tả thương hiệu..."
                />
              </div>

              {/* Order + Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Thứ tự
                  </label>

                  <input
                    type="number"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors"
                    value={form.order}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        order: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Trạng thái
                  </label>

                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors"
                    value={
                      form.isActive ? 'true' : 'false'
                    }
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        isActive:
                          e.target.value === 'true',
                      }))
                    }
                  >
                    <option value="true">
                      Hoạt động
                    </option>
                    <option value="false">
                      Ẩn
                    </option>
                  </select>
                </div>
              </div>

              {/* Logo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">
                  Logo thương hiệu
                </label>

                <div className="flex items-center gap-3 mt-1">
                  {form.logoUrl && (
                    <img
                      src={form.logoUrl}
                      alt="logo"
                      className="size-12 rounded-md object-contain border border-border bg-muted shrink-0 p-1"
                    />
                  )}

                  <button
                    type="button"
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-3.5 text-sm font-medium text-foreground hover:bg-accent cursor-pointer"
                    onClick={() =>
                      setShowMediaPicker(true)
                    }
                  >
                    Chọn logo từ thư viện
                  </button>

                  {form.logoUrl && (
                    <button
                      type="button"
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          logoMediaId: '',
                          logoUrl: '',
                        }))
                      }
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/40 px-5 py-3">
              <button
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
                onClick={() => setShowForm(false)}
              >
                Hủy
              </button>

              <button
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
                onClick={handleSubmit}
                disabled={isMutating}
              >
                {isMutating ? (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                ) : editTarget ? (
                  'Cập nhật'
                ) : (
                  'Tạo mới'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker */}
      {showMediaPicker && (
        <MediaPickerModal
          onSelect={handleMediaPick}
          onClose={() => setShowMediaPicker(false)}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa thương hiệu"
        description={`Bạn có chắc muốn xóa "${deleteTarget?.name}" không?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMut.isPending}
      />

      {/* Bulk Delete Confirm */}
      <ConfirmDialog
        open={bulkDeleteConfirm}
        title={`Xóa ${selected.length} thương hiệu`}
        description="Hành động này không thể hoàn tác."
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
        loading={bulkDeleteMut.isPending}
      />
    </div>
  );
}