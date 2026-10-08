import { useState, useMemo } from 'react';
import {
  useUsers,
  useUserStats,
  useToggleUserStatus,
  useBulkToggleUserStatus,
} from '@/hooks/useUsers';
import DataTablePagination from '@/components/ui/DataTablePagination';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import useColumnVisibility from '@/hooks/useColumnVisibility';
import { toast } from '@/providers/ToastProvider';

import CustomerStatsGrid from './components/CustomerStatsGrid';
import CustomerToolbar from './components/CustomerToolbar';
import CustomerTable from './components/CustomerTable';
import CustomerDetailModal from './components/CustomerDetailModal';

const CUSTOMER_COLUMNS = [
  { id: 'select', label: 'Chọn', defaultVisible: true, alwaysVisible: true },
  { id: 'customer', label: 'Khách Hàng', defaultVisible: true, alwaysVisible: true },
  { id: 'contact', label: 'Liên Hệ', defaultVisible: true },
  { id: 'address', label: 'Địa Chỉ Mặc Định', defaultVisible: true },
  { id: 'createdAt', label: 'Ngày Tham Gia', defaultVisible: true },
  { id: 'status', label: 'Trạng Thái', defaultVisible: true },
  { id: 'actions', label: 'Thao Tác', defaultVisible: true, alwaysVisible: true },
];

export default function CustomerListPage() {
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [phoneFilter, setPhoneFilter] = useState('all');
  const [addressFilter, setAddressFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [viewCustomer, setViewCustomer] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkConfirm, setBulkConfirm] = useState(null);

  const columnVisibility = useColumnVisibility('admin_customers_columns', CUSTOMER_COLUMNS);
  const { isColumnVisible } = columnVisibility;

  const { data: statsRes, refetch: refetchStats } = useUserStats('customer');
  const stats = statsRes?.data || { total: 0, active: 0, inactive: 0, newThisMonth: 0 };

  const queryParams = {
    userType: 'customer',
    page,
    limit: pageSize,
    q: keyword || undefined,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
  };

  const { data: res = {}, isLoading, isFetching, refetch } = useUsers(queryParams);
  const rawCustomers = res?.data?.users || [];

  const customers = useMemo(() => {
    return rawCustomers.filter((u) => {
      if (phoneFilter === 'has_phone' && !u.phone) return false;
      if (phoneFilter === 'no_phone' && u.phone) return false;
      if (addressFilter === 'has_addr' && (!u.addresses || u.addresses.length === 0)) return false;
      if (addressFilter === 'no_addr' && u.addresses && u.addresses.length > 0) return false;
      return true;
    });
  }, [rawCustomers, phoneFilter, addressFilter]);

  const totalItems = res?.data?.total || customers.length;
  const totalPages = res?.data?.totalPages || Math.ceil(totalItems / pageSize) || 1;

  const toggleStatusMut = useToggleUserStatus();
  const bulkToggleMut = useBulkToggleUserStatus();

  const handleToggleClick = (user) => {
    setConfirmTarget({ user, nextStatus: !user.isActive });
  };

  const handleConfirmToggle = async () => {
    if (!confirmTarget) return;
    try {
      await toggleStatusMut.mutateAsync({
        id: confirmTarget.user._id,
        isActive: confirmTarget.nextStatus,
      });
      toast.success(confirmTarget.nextStatus ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản');
      setConfirmTarget(null);
      refetchStats();
      if (viewCustomer && viewCustomer._id === confirmTarget.user._id) {
        setViewCustomer((prev) => ({ ...prev, isActive: confirmTarget.nextStatus }));
      }
    } catch (_) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === customers.length) setSelectedIds([]);
    else setSelectedIds(customers.map((c) => c._id));
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirmBulk = async () => {
    if (!bulkConfirm) return;
    try {
      const isActive = bulkConfirm.action === 'unlock';
      await bulkToggleMut.mutateAsync({ userIds: selectedIds, isActive });
      toast.success(`Đã ${isActive ? 'mở khóa' : 'khóa'} ${selectedIds.length} tài khoản`);
      setSelectedIds([]);
      setBulkConfirm(null);
      refetchStats();
    } catch (_) {
      toast.error('Lỗi khi thực hiện thao tác hàng loạt');
    }
  };

  const handleExportCsv = () => {
    if (!customers.length) return toast.error('Không có dữ liệu để xuất CSV');
    const header = ['ID', 'Họ tên', 'Email', 'SĐT', 'Trạng thái', 'Ngày tạo'];
    const rows = customers.map((c) => [
      c._id,
      `"${c.fullName || ''}"`,
      c.email,
      c.phone || '',
      c.isActive ? 'Hoạt động' : 'Đã khóa',
      new Date(c.createdAt).toLocaleDateString('vi-VN'),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [header, ...rows].map((e) => e.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `customers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Đã xuất danh sách khách hàng');
  };

  return (
    <div className="space-y-4 max-w-full overflow-x-hidden pb-12 antialiased">
      {/* 1. Quick Stats Grid */}
      <CustomerStatsGrid stats={stats} />

      {/* 2. Toolbar */}
      <CustomerToolbar
        keyword={keyword}
        setKeyword={(k) => {
          setKeyword(k);
          setPage(1);
        }}
        statusFilter={statusFilter}
        setStatusFilter={(s) => {
          setStatusFilter(s);
          setPage(1);
        }}
        phoneFilter={phoneFilter}
        setPhoneFilter={(p) => {
          setPhoneFilter(p);
          setPage(1);
        }}
        addressFilter={addressFilter}
        setAddressFilter={(a) => {
          setAddressFilter(a);
          setPage(1);
        }}
        onRefresh={() => {
          refetch();
          refetchStats();
        }}
        isFetching={isFetching}
        selectedCount={selectedIds.length}
        onBulkLock={() => setBulkConfirm({ action: 'lock', count: selectedIds.length })}
        onBulkUnlock={() => setBulkConfirm({ action: 'unlock', count: selectedIds.length })}
        onExportCsv={handleExportCsv}
        columnVisibility={columnVisibility}
      />

      {/* 3. Customers Table */}
      <CustomerTable
        customers={customers}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        onView={setViewCustomer}
        onToggleStatus={handleToggleClick}
        isColumnVisible={isColumnVisible}
      />

      {/* 4. Pagination */}
      <DataTablePagination
        page={page}
        pageSize={pageSize}
        total={totalItems}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[10, 20, 50]}
      />

      {/* 5. Customer Profile Modal */}
      {viewCustomer && (
        <CustomerDetailModal
          user={viewCustomer}
          onClose={() => setViewCustomer(null)}
          onToggleStatus={(u) => handleToggleClick(u)}
        />
      )}

      {/* 6. Single Toggle Confirm Dialog */}
      {confirmTarget && (
        <ConfirmDialog
          open={!!confirmTarget}
          title={confirmTarget.nextStatus ? 'Mở khóa tài khoản' : 'Khóa tài khoản khách hàng'}
          description={`Bạn có chắc muốn ${confirmTarget.nextStatus ? 'mở khóa' : 'khóa'} tài khoản "${confirmTarget.user.fullName || confirmTarget.user.email}"?`}
          confirmLabel={confirmTarget.nextStatus ? 'Mở khóa' : 'Khóa tài khoản'}
          danger={!confirmTarget.nextStatus}
          onConfirm={handleConfirmToggle}
          onClose={() => setConfirmTarget(null)}
        />
      )}

      {/* 7. Bulk Confirm Dialog */}
      {bulkConfirm && (
        <ConfirmDialog
          open={!!bulkConfirm}
          title={`Xác nhận ${bulkConfirm.action === 'lock' ? 'khóa' : 'mở khóa'} ${bulkConfirm.count} khách hàng`}
          description={`Hành động này sẽ cập nhật trạng thái cho ${bulkConfirm.count} tài khoản đã chọn.`}
          confirmLabel={bulkConfirm.action === 'lock' ? 'Khóa tất cả' : 'Mở khóa tất cả'}
          danger={bulkConfirm.action === 'lock'}
          onConfirm={handleConfirmBulk}
          onClose={() => setBulkConfirm(null)}
        />
      )}
    </div>
  );
}
