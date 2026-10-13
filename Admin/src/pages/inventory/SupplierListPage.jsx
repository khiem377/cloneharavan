import React, { useState } from 'react';
import { Building2, Plus, RefreshCw } from 'lucide-react';
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from '@/hooks/useSuppliers';
import { useSyncAllSupplierDebts } from '@/hooks/useSupplierDebts';
import { toast } from '@/providers/ToastProvider';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import useColumnVisibility from '@/hooks/useColumnVisibility';
import { Button } from '@/components/ui/button';

import SupplierStatusTabs from './components/SupplierStatusTabs';
import SupplierFilterBar from './components/SupplierFilterBar';
import SupplierTable from './components/SupplierTable';
import SupplierFormModal from './components/SupplierFormModal';
import SupplierDetailModal from './components/SupplierDetailModal';

const SUPPLIER_COLUMNS = [
  { id: 'name', label: 'Tên Nhà Cung Cấp', defaultVisible: true, alwaysVisible: true },
  { id: 'code', label: 'Mã NCC', defaultVisible: true },
  { id: 'supplierType', label: 'Loại NCC', defaultVisible: false },
  { id: 'phone', label: 'Số Điện Thoại', defaultVisible: true },
  { id: 'debt', label: 'Nợ Cần Trả Hiện Tại', defaultVisible: true },
  { id: 'totalPurchase', label: 'Tổng Mua', defaultVisible: true },
  { id: 'address', label: 'Địa Chỉ', defaultVisible: true },
  { id: 'bank', label: 'Tài Khoản Ngân Hàng', defaultVisible: false },
  { id: 'status', label: 'Trạng Thái', defaultVisible: true },
  { id: 'actions', label: 'Thao Tác', defaultVisible: true, alwaysVisible: true },
];

export default function SupplierListPage() {
  const [keyword, setKeyword] = useState('');
  const [statusTab, setStatusTab] = useState('all'); // 'all' | 'active' | 'inactive'
  const [supplierTypeFilter, setSupplierTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal create/edit state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [detailSupplier, setDetailSupplier] = useState(null);

  // Delete target state
  const [deleteTarget, setDeleteTarget] = useState(null);

  const columnVisibility = useColumnVisibility('admin_suppliers_columns_v2', SUPPLIER_COLUMNS);
  const { isColumnVisible, visibleCount } = columnVisibility;

  const { data: res = {}, isLoading, refetch } = useSuppliers({
    page,
    limit: pageSize,
    keyword,
    status: statusTab !== 'all' ? statusTab : undefined,
    supplierType: supplierTypeFilter !== 'all' ? supplierTypeFilter : undefined,
  });

  const suppliers = res.data || [];
  const pagination = res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
  const counts = res.counts || { all: 0, active: 0, inactive: 0 };
  const totalDebt = res.totalDebt || 0;

  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useDeleteSupplier();
  const syncMutation = useSyncAllSupplierDebts();

  const handleSyncDebts = async () => {
    try {
      const res = await syncMutation.mutateAsync();
      toast.success(res.data?.message || 'Đồng bộ công nợ thành công!');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi đồng bộ công nợ');
    }
  };

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setEditingSupplier(sup);
    setModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingSupplier) {
        await updateMutation.mutateAsync({ id: editingSupplier._id, data: formData });
        toast.success(`Cập nhật nhà cung cấp "${formData.name}" thành công!`);
      } else {
        await createMutation.mutateAsync(formData);
        toast.success(`Thêm mới nhà cung cấp "${formData.name}" thành công!`);
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu nhà cung cấp');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget._id);
      toast.success(`Đã xóa nhà cung cấp "${deleteTarget.name}"`);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể xóa nhà cung cấp');
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4 antialiased">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="size-5 text-primary" /> Nhà Cung Cấp
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý đối tác cung ứng, phân loại nguyên phụ liệu, địa chỉ bưu chính và tài khoản ngân hàng
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            disabled={syncMutation.isPending}
            onClick={handleSyncDebts}
            className="rounded-[6px] text-xs h-8 border-border gap-1.5 active:scale-[0.98] transition-transform font-medium"
          >
            <RefreshCw size={13} className={syncMutation.isPending ? 'animate-spin' : ''} />
            Đồng bộ từ Đơn nhập
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="rounded-[6px] text-xs h-8 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-transform font-semibold gap-1.5"
          >
            <Plus size={14} /> Thêm nhà cung cấp
          </Button>
        </div>
      </div>

      {/* Pancake-style Status Tabs */}
      <SupplierStatusTabs
        statusTab={statusTab}
        setStatusTab={setStatusTab}
        setPage={setPage}
        counts={counts}
      />

      {/* Toolbar / Filter Bar */}
      <SupplierFilterBar
        keyword={keyword}
        setKeyword={setKeyword}
        supplierTypeFilter={supplierTypeFilter}
        setSupplierTypeFilter={setSupplierTypeFilter}
        setPage={setPage}
        columnVisibility={columnVisibility}
      />

      {/* Table Data */}
      <SupplierTable
        suppliers={suppliers}
        isLoading={isLoading}
        isColumnVisible={isColumnVisible}
        visibleCount={visibleCount}
        onViewDetail={setDetailSupplier}
        onEdit={handleOpenEdit}
        onDelete={setDeleteTarget}
        totalDebt={totalDebt}
        page={page}
        pageSize={pageSize}
        pagination={pagination}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      {/* Modal Create / Edit with Dual Address and VietQR */}
      {modalOpen && (
        <SupplierFormModal
          isOpen={modalOpen}
          supplier={editingSupplier}
          onClose={() => {
            setModalOpen(false);
            setEditingSupplier(null);
          }}
          onSubmit={handleFormSubmit}
          isPending={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* Supplier Hub & Debt Master Modal (Pancake POS style) */}
      {detailSupplier && (
        <SupplierDetailModal
          supplier={detailSupplier}
          open={Boolean(detailSupplier)}
          onClose={() => {
            setDetailSupplier(null);
            refetch();
          }}
          onEditBasic={(sup) => {
            setDetailSupplier(null);
            setEditingSupplier(sup);
            setModalOpen(true);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Xác nhận xóa Nhà cung cấp"
          message={`Bạn có chắc chắn muốn xóa Nhà cung cấp "${deleteTarget?.name}"? Thao tác này không thể hoàn tác.`}
          confirmLabel="Xóa Nhà Cung Cấp"
          cancelLabel="Hủy"
          variant="destructive"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
