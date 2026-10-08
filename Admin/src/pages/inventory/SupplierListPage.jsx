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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

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
    <div className="space-y-6 p-6 antialiased">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Nhà Cung Cấp
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý danh sách các nhà cung cấp sản phẩm và đối tác cung ứng
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="rounded-[6px] text-xs font-semibold shadow-xs active:scale-[0.98]"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Thêm Nhà Cung Cấp
        </Button>
      </div>

      {/* Toolbar */}
      <Card className="rounded-[6px] border border-border p-4 shadow-xs">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm theo tên, mã NCC hoặc số điện thoại..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9 text-xs rounded-[6px]"
            />
          </div>
          <ColumnToggleDropdown columnVisibility={columnVisibility} />
        </div>
      </Card>

      {/* Table */}
      <Card className="rounded-[6px] border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/60 font-bold text-foreground text-[11px]">
                {isColumnVisible('code') && <th className="px-4 py-3.5 whitespace-nowrap">Mã NCC</th>}
                {isColumnVisible('name') && <th className="px-4 py-3.5 whitespace-nowrap">Tên Nhà Cung Cấp</th>}
                {isColumnVisible('contact') && <th className="px-4 py-3.5 whitespace-nowrap">Liên Hệ</th>}
                {isColumnVisible('address') && <th className="px-4 py-3.5 whitespace-nowrap">Địa Chỉ</th>}
                {isColumnVisible('taxCode') && <th className="px-4 py-3.5 whitespace-nowrap">Mã Số Thuế</th>}
                {isColumnVisible('status') && <th className="px-4 py-3.5 whitespace-nowrap">Trạng Thái</th>}
                {isColumnVisible('actions') && <th className="px-4 py-3.5 text-right whitespace-nowrap">Thao Tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={columnVisibility.visibleCount} className="py-12 text-center text-xs text-muted-foreground">
                    Đang tải danh sách nhà cung cấp...
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={columnVisibility.visibleCount} className="py-12 text-center text-xs text-muted-foreground">
                    Chưa có nhà cung cấp nào
                  </td>
                </tr>
              ) : (
                suppliers.map((sup) => (
                  <tr key={sup._id} className="hover:bg-muted/30 transition-colors align-middle">
                    {isColumnVisible('code') && <td className="px-4 py-3 font-semibold text-primary font-mono text-xs whitespace-nowrap">{sup.code}</td>}
                    {isColumnVisible('name') && <td className="px-4 py-3 font-medium text-foreground text-xs whitespace-nowrap">{sup.name}</td>}
                    {isColumnVisible('contact') && (
                      <td className="px-4 py-3">
                        <div className="space-y-0.5 text-xs">
                          {sup.phone && (
                            <div className="flex items-center gap-1 text-muted-foreground font-mono tabular-nums">
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
                      <td className="px-4 py-3 text-muted-foreground max-w-xs truncate text-xs">
                        {sup.address || '-'}
                      </td>
                    )}
                    {isColumnVisible('taxCode') && <td className="px-4 py-3 font-mono text-xs tabular-nums whitespace-nowrap">{sup.taxCode || '-'}</td>}
                    {isColumnVisible('status') && (
                      <td className="px-4 py-3 whitespace-nowrap">
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
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(sup)}
                            className="rounded-[4px] p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            title="Sửa"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(sup)}
                            className="rounded-[4px] p-1.5 text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
      </Card>

      {/* Modal Create / Edit */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[6px] border border-border bg-card p-6 shadow-xs">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              {editingSupplier ? 'Chỉnh Sửa Nhà Cung Cấp' : 'Thêm Nhà Cung Cấp Mới'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Mã NCC <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="rounded-[6px] h-9"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Tên Nhà Cung Cấp <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Công ty TNHH Toshiba Việt Nam..."
                className="rounded-[6px] h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Số Điện Thoại</label>
                <Input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="rounded-[6px] h-9"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="rounded-[6px] h-9"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Địa Chỉ Kho / Văn Phòng</label>
              <Input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="rounded-[6px] h-9"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Mã Số Thuế</label>
              <Input
                type="text"
                value={formData.taxCode}
                onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                className="rounded-[6px] h-9"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="size-4 rounded-[4px] border-input text-primary focus:ring-ring"
              />
              <label htmlFor="isActive" className="text-xs font-medium text-foreground cursor-pointer">
                Đang hoạt động hợp tác
              </label>
            </div>

            <DialogFooter className="flex items-center justify-end gap-2 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="rounded-[6px] h-8 px-3 text-xs"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="rounded-[6px] h-8 px-4 text-xs font-semibold"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : 'Lưu Nhà Cung Cấp'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
