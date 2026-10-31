import React, { useState } from 'react';
import { toast } from '@/providers/ToastProvider';
import {
  useCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useToggleCouponStatus,
  useDeleteCoupon,
  useDeleteBulkCoupons,
} from '@/hooks/useCoupons';
import { useCustomerGroupOptions } from '@/hooks/useCustomerGroups';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import CouponHeader from './components/CouponHeader';
import CouponFilterBar from './components/CouponFilterBar';
import CouponTable from './components/CouponTable';
import CouponFormModal from './components/CouponFormModal';
import CouponUsageHistoryModal from './components/CouponUsageHistoryModal';

export default function CouponPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [historyTarget, setHistoryTarget] = useState(null);

  const { data: customerGroupsRes } = useCustomerGroupOptions();
  const customerGroups = Array.isArray(customerGroupsRes?.data)
    ? customerGroupsRes.data
    : Array.isArray(customerGroupsRes)
    ? customerGroupsRes
    : [];

  const { data: couponData, isLoading } = useCoupons({
    page,
    limit,
    search: keyword || undefined,
    isActive: filterStatus !== '' ? filterStatus : undefined,
    category: filterCategory || undefined,
  });

  const coupons = Array.isArray(couponData?.data)
    ? couponData.data
    : Array.isArray(couponData?.coupons)
    ? couponData.coupons
    : [];
  const pagination = couponData?.pagination || {};

  const createMut = useCreateCoupon();
  const updateMut = useUpdateCoupon();
  const toggleMut = useToggleCouponStatus();
  const deleteMut = useDeleteCoupon();
  const bulkDeleteMut = useDeleteBulkCoupons();

  const handleCreateOrUpdate = (payload) => {
    if (editTarget) {
      updateMut.mutate(
        { id: editTarget._id, data: payload },
        {
          onSuccess: () => {
            toast.success('Cập nhật mã giảm giá thành công');
            setShowForm(false);
            setEditTarget(null);
          },
          onError: (err) => toast.error(err.response?.data?.message || 'Có lỗi xảy ra'),
        }
      );
    } else {
      createMut.mutate(payload, {
        onSuccess: () => {
          toast.success('Tạo mã giảm giá thành công');
          setShowForm(false);
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Có lỗi xảy ra'),
      });
    }
  };

  const handleToggleStatus = (item) => {
    toggleMut.mutate(item._id, {
      onSuccess: () => toast.success(`Đã ${item.isActive ? 'tắt' : 'bật'} mã "${item.code}"`),
      onError: (e) => toast.error(e.response?.data?.message || 'Không thể cập nhật'),
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMut.mutate(deleteTarget._id, {
      onSuccess: () => {
        toast.success('Đã xóa mã giảm giá');
        setDeleteTarget(null);
      },
      onError: (e) => toast.error(e.response?.data?.message || 'Không thể xóa'),
    });
  };

  const confirmBulkDelete = () => {
    bulkDeleteMut.mutate(selectedIds, {
      onSuccess: () => {
        toast.success(`Đã xóa ${selectedIds.length} mã giảm giá`);
        setSelectedIds([]);
        setBulkDeleteConfirm(false);
      },
      onError: (e) => toast.error(e.response?.data?.message || 'Không thể xóa'),
    });
  };

  const toggleSelect = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleSelectAll = () =>
    setSelectedIds(selectedIds.length === coupons.length ? [] : coupons.map((c) => c._id));

  return (
    <div className="p-3 sm:p-6 flex flex-col gap-4 sm:gap-6 w-full max-w-full overflow-x-hidden min-h-full bg-background text-foreground">
      <CouponHeader
        onOpenCreate={() => {
          setEditTarget(null);
          setShowForm(true);
        }}
      />

      <CouponFilterBar
        keyword={keyword}
        onKeywordChange={(val) => {
          setKeyword(val);
          setPage(1);
        }}
        filterStatus={filterStatus}
        onStatusChange={(val) => {
          setFilterStatus(val);
          setPage(1);
        }}
        filterCategory={filterCategory}
        onCategoryChange={(val) => {
          setFilterCategory(val);
          setPage(1);
        }}
        selectedCount={selectedIds.length}
        onBulkDeleteClick={() => setBulkDeleteConfirm(true)}
      />

      <CouponTable
        coupons={coupons}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onOpenEdit={(item) => {
          setEditTarget(item);
          setShowForm(true);
        }}
        onToggleStatus={handleToggleStatus}
        onDeleteClick={(item) => setDeleteTarget(item)}
        onViewHistory={(item) => setHistoryTarget(item)}
        page={page}
        limit={limit}
        pagination={pagination}
        onPageChange={setPage}
        onPageSizeChange={setLimit}
      />

      <CouponFormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditTarget(null);
        }}
        editTarget={editTarget}
        customerGroups={customerGroups}
        onSubmit={handleCreateOrUpdate}
        isPending={createMut.isPending || updateMut.isPending}
      />

      <CouponUsageHistoryModal
        isOpen={!!historyTarget}
        onClose={() => setHistoryTarget(null)}
        coupon={historyTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa mã giảm giá"
        description={`Bạn có chắc muốn xóa mã "${deleteTarget?.code}" không? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa mã"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMut.isPending}
      />

      <ConfirmDialog
        open={bulkDeleteConfirm}
        title={`Xóa ${selectedIds.length} mã giảm giá`}
        description={`Bạn có chắc muốn xóa ${selectedIds.length} mã giảm giá đã chọn không? Hành động này không thể hoàn tác.`}
        confirmLabel={`Xóa ${selectedIds.length} mã`}
        danger
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
        loading={bulkDeleteMut.isPending}
      />
    </div>
  );
}
