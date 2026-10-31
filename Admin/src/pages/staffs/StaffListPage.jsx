import { useState, useMemo } from 'react';
import {
  useUsers,
  useUserStats,
  useToggleUserStatus,
  useUpdateUserRole,
  useCreateStaff,
  useResetPassword,
} from '@/hooks/useUsers';
import { useRoles, usePermissions } from '@/hooks/useRoles';
import { useWarehouses } from '@/hooks/useInventory';
import useColumnVisibility from '@/hooks/useColumnVisibility';
import useAuthStore from '@/store/authStore';

import StaffHeaderActions from './components/StaffHeaderActions';
import StaffStatsGrid from './components/StaffStatsGrid';
import StaffToolbar from './components/StaffToolbar';
import StaffTable from './components/StaffTable';
import StaffModalsContainer from './components/StaffModalsContainer';

const STAFF_COLUMNS = [
  { id: 'staff', label: 'Nhân Viên', defaultVisible: true, alwaysVisible: true },
  { id: 'contact', label: 'Liên Hệ', defaultVisible: true },
  { id: 'role', label: 'Vai Trò & Quyền Hạn', defaultVisible: true },
  { id: 'warehouse', label: 'Kho Phụ Trách', defaultVisible: true },
  { id: 'lastLogin', label: 'Đăng Nhập Gần Nhất', defaultVisible: true },
  { id: 'createdAt', label: 'Ngày Tạo', defaultVisible: true },
  { id: 'status', label: 'Trạng Thái', defaultVisible: true },
  { id: 'actions', label: 'Thao Tác', defaultVisible: true, alwaysVisible: true },
];

export default function StaffListPage() {
  const currentAdminUser = useAuthStore((s) => s.user);

  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    roleId: '',
    role: 'staff',
    warehouseId: '',
  });

  const [drawerStaff, setDrawerStaff] = useState(null);
  const [drawerTab, setDrawerTab] = useState('preview');
  const [customPermIds, setCustomPermIds] = useState([]);

  const [editRoleUser, setEditRoleUser] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState('');

  const [resetPassUser, setResetPassUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const [confirmTarget, setConfirmTarget] = useState(null);

  const columnVisibility = useColumnVisibility('admin_staffs_columns', STAFF_COLUMNS);
  const { isColumnVisible } = columnVisibility;

  const { data: roles = [] } = useRoles();
  const { data: permissionsGrouped = {} } = usePermissions();
  const { data: warehouses = [] } = useWarehouses();

  const { data: statsRes, refetch: refetchStats } = useUserStats('staff');
  const stats = statsRes?.data || { total: 0, active: 0, inactive: 0, roleDistribution: {} };
  const roleDist = stats.roleDistribution || {};

  const departmentCounts = useMemo(() => {
    const adminCount = (roleDist['admin'] || 0) + (roleDist['administrator'] || 0);
    const inventoryCount =
      (roleDist['inventory_manager'] || 0) +
      (roleDist['warehouse_clerk'] || 0) +
      (roleDist['shipping_clerk'] || 0) +
      (roleDist['stock_auditor'] || 0);
    const marketingCount =
      (roleDist['content_editor'] || 0) +
      (roleDist['marketing_specialist'] || 0) +
      (roleDist['catalog_manager'] || 0);
    const cskhCount =
      (roleDist['customer_care'] || 0) +
      (roleDist['staff'] || 0) +
      (roleDist['manager'] || 0);

    return { adminCount, inventoryCount, marketingCount, cskhCount };
  }, [roleDist]);

  const queryParams = {
    userType: 'staff',
    page,
    limit: pageSize,
    q: keyword || undefined,
    role: roleFilter === 'all' ? undefined : roleFilter,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
  };

  const { data: res = {}, isLoading, isFetching, refetch } = useUsers(queryParams);
  const staffs = res?.data?.users || [];
  const pagination = {
    page: res?.data?.page || 1,
    limit: res?.data?.limit || pageSize,
    total: res?.data?.total || 0,
    totalPages: res?.data?.totalPages || 1,
  };

  const toggleStatusMut = useToggleUserStatus();
  const updateRoleMut = useUpdateUserRole();
  const createStaffMut = useCreateStaff();
  const resetPassMut = useResetPassword();

  const handleToggleClick = (user) => {
    if (user._id === currentAdminUser?._id) return;
    const nextStatus = !user.isActive;
    setConfirmTarget({ user, nextStatus });
  };

  const handleConfirmToggle = async () => {
    if (!confirmTarget) return;
    try {
      await toggleStatusMut.mutateAsync({
        id: confirmTarget.user._id,
        isActive: confirmTarget.nextStatus,
      });
      setConfirmTarget(null);
      refetchStats();
      if (drawerStaff && drawerStaff._id === confirmTarget.user._id) {
        setDrawerStaff((prev) => ({ ...prev, isActive: confirmTarget.nextStatus }));
      }
    } catch (_) {}
  };

  const handleOpenEditRole = (user) => {
    setEditRoleUser(user);
    setSelectedRoleId(user.roleId?._id || user.roleId || '');
  };

  const handleSaveRole = async () => {
    if (!editRoleUser) return;
    try {
      await updateRoleMut.mutateAsync({
        id: editRoleUser._id,
        roleId: selectedRoleId || undefined,
      });
      setEditRoleUser(null);
      refetchStats();
    } catch (_) {}
  };

  const handleConfirmResetPassword = async (e) => {
    e.preventDefault();
    if (!resetPassUser || !newPassword) return;
    try {
      await resetPassMut.mutateAsync({
        id: resetPassUser._id,
        password: newPassword,
      });
      setResetPassUser(null);
      setNewPassword('');
    } catch (_) {}
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await createStaffMut.mutateAsync({
        ...createForm,
        phone: createForm.phone || undefined,
        roleId: createForm.roleId || undefined,
        assignedWarehouseId: createForm.warehouseId || undefined,
      });
      setCreateModalOpen(false);
      setCreateForm({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        roleId: '',
        role: 'staff',
        warehouseId: '',
      });
      refetchStats();
      refetch();
    } catch (_) {}
  };

  const handleOpenDrawer = (user, tab = 'preview') => {
    setDrawerStaff(user);
    setDrawerTab(tab);
    const existingCustom = (user.customPermissions || []).map((p) =>
      typeof p === 'object' ? p._id || p.id : p
    );
    setCustomPermIds(existingCustom);
  };

  const handleToggleCustomPerm = (permId) => {
    setCustomPermIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const handleSaveCustomPermissions = async () => {
    if (!drawerStaff) return;
    try {
      await updateRoleMut.mutateAsync({
        id: drawerStaff._id,
        customPermissions: customPermIds,
      });
      setDrawerStaff((prev) => ({ ...prev, customPermissions: customPermIds }));
    } catch (_) {}
  };

  const handleExportCSV = () => {
    if (!staffs.length) return;
    const headers = ['Họ và tên', 'Email', 'SĐT', 'Vai trò', 'Trạng thái', 'Ngày tạo'];
    const rows = staffs.map((u) => [
      `"${u.fullName || ''}"`,
      `"${u.email || ''}"`,
      `"${u.phone || ''}"`,
      `"${u.roleId?.name || u.role || ''}"`,
      `"${u.isActive ? 'Hoạt động' : 'Đã khóa'}"`,
      `"${u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : ''}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `danh_sach_nhan_su_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-10">
      <StaffHeaderActions
        onRefresh={() => {
          refetch();
          refetchStats();
        }}
        isFetching={isFetching}
        onExportCSV={handleExportCSV}
        hasStaffs={Boolean(staffs.length)}
        onOpenInvite={() => setInviteModalOpen(true)}
        onOpenCreate={() => setCreateModalOpen(true)}
      />

      <StaffStatsGrid stats={stats} departmentCounts={departmentCounts} />

      <StaffToolbar
        keyword={keyword}
        setKeyword={setKeyword}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        roles={roles}
        setPage={setPage}
        columnVisibility={columnVisibility}
      />

      <StaffTable
        staffs={staffs}
        isLoading={isLoading}
        currentAdminUser={currentAdminUser}
        isColumnVisible={isColumnVisible}
        pagination={pagination}
        setPage={setPage}
        setPageSize={setPageSize}
        onOpenDrawer={handleOpenDrawer}
        onOpenEditRole={handleOpenEditRole}
        onOpenResetPass={(user) => {
          setResetPassUser(user);
          setNewPassword('');
        }}
        onToggleStatus={handleToggleClick}
      />

      <StaffModalsContainer
        drawerStaff={drawerStaff}
        onCloseDrawer={() => setDrawerStaff(null)}
        drawerTab={drawerTab}
        setDrawerTab={setDrawerTab}
        customPermIds={customPermIds}
        onToggleCustomPerm={handleToggleCustomPerm}
        permissionsGrouped={permissionsGrouped}
        roles={roles}
        onSaveCustomPermissions={handleSaveCustomPermissions}
        onClearCustomPermissions={() => setCustomPermIds([])}
        onToggleStatusClick={(user) => {
          setDrawerStaff(null);
          handleToggleClick(user);
        }}
        isUpdatingRole={updateRoleMut.isPending}
        currentAdminUser={currentAdminUser}
        editRoleUser={editRoleUser}
        onCloseEditRole={() => setEditRoleUser(null)}
        selectedRoleId={selectedRoleId}
        setSelectedRoleId={setSelectedRoleId}
        onSaveRole={handleSaveRole}
        resetPassUser={resetPassUser}
        onCloseResetPass={() => setResetPassUser(null)}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        onSubmitResetPassword={handleConfirmResetPassword}
        isResettingPass={resetPassMut.isPending}
        createModalOpen={createModalOpen}
        setCreateModalOpen={setCreateModalOpen}
        createForm={createForm}
        setCreateForm={setCreateForm}
        onSubmitCreate={handleCreateSubmit}
        isCreatingStaff={createStaffMut.isPending}
        warehouses={warehouses}
        confirmTarget={confirmTarget}
        onConfirmToggle={handleConfirmToggle}
        onCancelConfirmToggle={() => setConfirmTarget(null)}
        inviteModalOpen={inviteModalOpen}
        setInviteModalOpen={setInviteModalOpen}
        onInviteSuccess={() => refetchStats()}
      />
    </div>
  );
}
