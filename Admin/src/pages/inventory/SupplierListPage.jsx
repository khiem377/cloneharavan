import React, { useState } from 'react';
import {
  Building2, Plus, SearchIcon as Search, Edit2, Trash2, Phone, Mail,
} from '@/components/ui/Icons';
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from '@/hooks/useSuppliers';
import DataTablePagination from '@/components/ui/DataTablePagination';
import { toast } from '@/providers/ToastProvider';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import useColumnVisibility from '@/hooks/useColumnVisibility';
import ColumnToggleDropdown from '@/components/ui/ColumnToggleDropdown';
import { useSearchParams } from 'react-router-dom';

const SUPPLIER_COLUMNS = [
  { id: 'code', label: 'Mã NCC', defaultVisible: true, alwaysVisible: true },
  { id: 'name', label: 'Tên Nhà Cung Cấp', defaultVisible: true },
  { id: 'contact', label: 'Liên Hệ', defaultVisible: true },
  { id: 'address', label: 'Địa Chỉ', defaultVisible: true },
  { id: 'taxCode', label: 'Mã Số Thuế', defaultVisible: true },
  { id: 'status', label: 'Trạng Thái', defaultVisible: true },
  { id: 'actions', label: 'Thao Tác', defaultVisible: true, alwaysVisible: true },
];

export default function SupplierListPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [keyword, setKeyword] = useState(initialSearch);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const columnVisibility = useColumnVisibility('admin_suppliers_columns', SUPPLIER_COLUMNS);
  const { isColumnVisible } = columnVisibility;

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    phone: '',
    email: '',
    address: '',
    taxCode: '',
    note: '',
    isActive: true,
  });

  const { data: res = {}, isLoading } = useSuppliers({
    page,
    limit: pageSize,
    keyword,
  });

  const suppliers = res.data || [];
  const pagination = res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useDeleteSupplier();

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      code: `SUP-${Date.now().toString().slice(-4)}`,
      phone: '',
      email: '',
      address: '',
      taxCode: '',
      note: '',
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setEditingSupplier(sup);
    setFormData({
      name: sup.name || '',
      code: sup.code || '',
      phone: sup.phone || '',
      email: sup.email || '',
      address: sup.address || '',
      taxCode: sup.taxCode || '',
      note: sup.note || '',
      isActive: sup.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await updateMutation.mutateAsync({ id: editingSupplier._id, data: formData });
        toast.success(`Cập nhật nhà cung cấp "${formData.name}" thành công!`);
      } else {
        await createMutation.mutateAsync(formData);
        toast.success(`Thêm nhà cung cấp "${formData.name}" thành công!`);
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu nhà cung cấp');
    }
  };

  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget._id);
      toast.success(`Đã xóa nhà cung cấp "${deleteTarget.name}"`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể xóa nhà cung cấp');
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="h-7 w-7 text-primary" />
            Nhà Cung Cấp
          </h1>
          <p className="text-sm text-muted-foreground">
            Quản lý danh sách các nhà cung cấp sản phẩm và đối tác cung ứng
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Thêm Nhà Cung Cấp
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã NCC hoặc số điện thoại..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <ColumnToggleDropdown columnVisibility={columnVisibility} />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                {isColumnVisible('code') && <th className="px-4 py-3">Mã NCC</th>}
                {isColumnVisible('name') && <th className="px-4 py-3">Tên Nhà Cung Cấp</th>}
                {isColumnVisible('contact') && <th className="px-4 py-3">Liên Hệ</th>}
                {isColumnVisible('address') && <th className="px-4 py-3">Địa Chỉ</th>}
                {isColumnVisible('taxCode') && <th className="px-4 py-3">Mã Số Thuế</th>}
                {isColumnVisible('status') && <th className="px-4 py-3">Trạng Thái</th>}
                {isColumnVisible('actions') && <th className="px-4 py-3 text-right">Thao Tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={columnVisibility.visibleCount} className="py-8 text-center text-sm text-muted-foreground">
                    Đang tải danh sách nhà cung cấp...
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={columnVisibility.visibleCount} className="py-8 text-center text-sm text-muted-foreground">
                    Chưa có nhà cung cấp nào
                  </td>
                </tr>
              ) : (
                suppliers.map((sup) => (
                  <tr key={sup._id} className="hover:bg-muted/30 transition-colors">
                    {isColumnVisible('code') && <td className="px-4 py-3 font-semibold text-primary">{sup.code}</td>}
                    {isColumnVisible('name') && <td className="px-4 py-3 font-medium text-foreground">{sup.name}</td>}
                    {isColumnVisible('contact') && (
                      <td className="px-4 py-3">
                        <div className="space-y-0.5 text-xs">
                          {sup.phone && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="h-3 w-3" /> {sup.phone}
                            </div>
                          )}
                          {sup.email && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="h-3 w-3" /> {sup.email}
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                    {isColumnVisible('address') && (
                      <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                        {sup.address || '-'}
                      </td>
                    )}
                    {isColumnVisible('taxCode') && <td className="px-4 py-3 font-mono text-xs">{sup.taxCode || '-'}</td>}
                    {isColumnVisible('status') && (
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            sup.isActive !== false
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {sup.isActive !== false ? 'Hoạt động' : 'Ngừng hợp tác'}
                        </span>
                      </td>
                    )}
                    {isColumnVisible('actions') && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(sup)}
                            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            title="Sửa"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(sup)}
                            className="rounded p-1.5 text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <DataTablePagination
          page={page}
          pageSize={pageSize}
          totalItems={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      {/* Modal Create / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground mb-4">
              {editingSupplier ? 'Chỉnh Sửa Nhà Cung Cấp' : 'Thêm Nhà Cung Cấp Mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Mã NCC <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Tên Nhà Cung Cấp <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Công ty TNHH Toshiba Việt Nam..."
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Số Điện Thoại</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Địa Chỉ Kho / Văn Phòng</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Mã Số Thuế</label>
                <input
                  type="text"
                  value={formData.taxCode}
                  onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-foreground cursor-pointer">
                  Đang hoạt động hợp tác
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-input px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : 'Lưu Nhà Cung Cấp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xác nhận xóa Nhà cung cấp"
        message={`Bạn có chắc chắn muốn xóa Nhà cung cấp "${deleteTarget?.name}"? Thao tác này không thể hoàn tác.`}
        confirmText="Xóa Nhà Cung Cấp"
        variant="danger"
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
