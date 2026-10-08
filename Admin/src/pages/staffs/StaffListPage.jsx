import { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Plus,
  Mail,
  Download,
  RefreshCw,
} from '@/components/ui/Icons';
import {
  useUsers,
  useUserStats,
  useToggleUserStatus,
  useUpdateUserRole,
  useCreateStaff,
  useResetPassword,
} from '@/hooks/useUsers';
import { useRoles, usePermissions } from '@/hooks/useRoles';
import useColumnVisibility from '@/hooks/useColumnVisibility';
import Can from '@/components/auth/Can';
import useAuthStore from '@/store/authStore';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import InviteMemberModal from '@/components/common/InviteMemberModal';

import StaffStatsGrid from './components/StaffStatsGrid';
import StaffToolbar from './components/StaffToolbar';
import StaffTable from './components/StaffTable';
import StaffCreateModal from './components/StaffCreateModal';
import StaffEditRoleModal from './components/StaffEditRoleModal';
import StaffResetPasswordModal from './components/StaffResetPasswordModal';
import StaffDetailDrawer from './components/StaffDetailDrawer';

const STAFF_COLUMNS = [
  { id: 'staff', label: 'Nhân Viên', defaultVisible: true, alwaysVisible: true },
  { id: 'contact', label: 'Liên Hệ', defaultVisible: true },
  { id: 'role', label: 'Vai Trò & Quyền Hạn', defaultVisible: true },
  { id: 'lastLogin', label: 'Đăng Nhập Gần Nhất', defaultVisible: true },
  { id: 'createdAt', label: 'Ngày Tạo', defaultVisible: true },
  { id: 'status', label: 'Trạng Thái', defaultVisible: true },
  { id: 'actions', label: 'Thao Tác', defaultVisible: true, alwaysVisible: true },
];

/**
 * Staff & Administrator Management Page
 */
export default function StaffListPage() {
  const currentAdminUser = useAuthStore((s) => s.user);

  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals & Drawers state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    roleId: '',
    role: 'staff',
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

  // Roles & Permissions Queries
  const { data: roles = [] } = useRoles();
  const { data: permissionsGrouped = {} } = usePermissions();

  // Stats Query
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
      });
      setCreateModalOpen(false);
      setCreateForm({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        roleId: '',
        role: 'staff',
      });
      refetchStats();
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
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="size-6 text-primary" />
            <span>Quản Lý Nhân Sự & Quản Trị Viên</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý tài khoản nhân viên, cấp phát vai trò RBAC và phân bổ quyền hạn chuyên sâu trên hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetch();
              refetchStats();
            }}
            disabled={isFetching}
            className="h-8 px-2.5 text-xs rounded-[6px] cursor-pointer"
            title="Tải lại danh sách"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={!staffs.length}
            className="h-8 text-xs rounded-[6px] gap-1.5 cursor-pointer"
          >
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Xuất CSV</span>
          </Button>

          <Can permission="user.create">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInviteModalOpen(true)}
              className="h-8 text-xs rounded-[6px] gap-1.5 border-primary/40 text-primary hover:bg-primary/5 cursor-pointer"
            >
              <Mail className="size-3.5" />
              <span>Mời Qua Email</span>
            </Button>
          </Can>

          <Can permission="user.create">
            <Button
              size="sm"
              onClick={() => setCreateModalOpen(true)}
              className="h-8 text-xs rounded-[6px] gap-1.5 font-semibold active:scale-[0.98] shadow-xs cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Thêm Nhân Viên</span>
            </Button>
          </Can>
        </div>
      </div>

      {/* 2. Stat Cards */}
      <StaffStatsGrid stats={stats} departmentCounts={departmentCounts} />

      {/* 3. Toolbar */}
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

      {/* 4. Table */}
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

      {/* 5. Detail Drawer */}
      <StaffDetailDrawer
        drawerStaff={drawerStaff}
        onClose={() => setDrawerStaff(null)}
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
        isPending={updateRoleMut.isPending}
        currentAdminUser={currentAdminUser}
      />

      {/* 6. Edit Role Modal */}
      <StaffEditRoleModal
        user={editRoleUser}
        onClose={() => setEditRoleUser(null)}
        roles={roles}
        selectedRoleId={selectedRoleId}
        setSelectedRoleId={setSelectedRoleId}
        onSave={handleSaveRole}
        isPending={updateRoleMut.isPending}
      />

      {/* 7. Reset Password Modal */}
      <StaffResetPasswordModal
        user={resetPassUser}
        onClose={() => setResetPassUser(null)}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        onSubmit={handleConfirmResetPassword}
        isPending={resetPassMut.isPending}
      />

      {/* 8. Create Staff Modal */}
      <StaffCreateModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        createForm={createForm}
        setCreateForm={setCreateForm}
        onSubmit={handleCreateSubmit}
        isPending={createStaffMut.isPending}
        roles={roles}
      />

      {/* 9. Confirm Toggle Status Dialog */}
      <ConfirmDialog
        open={!!confirmTarget}
        title={confirmTarget?.nextStatus ? 'Mở khóa tài khoản nhân viên' : 'Khóa tài khoản nhân viên'}
        description={
          confirmTarget?.nextStatus
            ? `Bạn có chắc muốn mở khóa cho tài khoản "${confirmTarget?.user?.email}"? Nhân viên sẽ có thể đăng nhập lại trang quản trị.`
            : `CẢNH BÁO CƯỠNG CHẾ: Bạn sắp khóa tài khoản "${confirmTarget?.user?.email}". Ngay lập tức khi xác nhận, toàn bộ phiên đăng nhập của nhân viên này trên TẤT CẢ THIẾT BỊ sẽ bị cưỡng chế văng ra ngoài qua SSE!`
        }
        confirmText={confirmTarget?.nextStatus ? 'Mở khóa' : 'Khóa & Force Logout'}
        confirmVariant={confirmTarget?.nextStatus ? 'primary' : 'destructive'}
        onConfirm={handleConfirmToggle}
        onCancel={() => setConfirmTarget(null)}
      />

      {/* 10. Invite Member Modal */}
      <InviteMemberModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSuccess={() => refetchStats()}
      />
    </div>
  );
}
