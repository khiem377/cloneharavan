import { useState, useMemo } from 'react';
import {
  ShieldCheck, Plus, Search, Lock, Unlock, Edit3,
  Phone, Mail, CheckCircle2, XCircle, Shield, KeyRound,
  Download, RefreshCw, Eye
} from '@/components/ui/Icons';
import {
  useUsers, useUserStats, useToggleUserStatus,
  useUpdateUserRole, useCreateStaff, useResetPassword
} from '@/hooks/useUsers';
import { useRoles, usePermissions } from '@/hooks/useRoles';
import DataTablePagination from '@/components/ui/DataTablePagination';
import ColumnToggleDropdown from '@/components/ui/ColumnToggleDropdown';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import useColumnVisibility from '@/hooks/useColumnVisibility';
import Can from '@/components/auth/Can';
import useAuthStore from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import InviteMemberModal from '@/components/common/InviteMemberModal';

const STAFF_COLUMNS = [
  { id: 'staff', label: 'Nhân Viên', defaultVisible: true, alwaysVisible: true },
  { id: 'contact', label: 'Liên Hệ', defaultVisible: true },
  { id: 'role', label: 'Vai Trò & Quyền Hạn', defaultVisible: true },
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

  // Modal tạo nhân viên mới & Mời thành viên
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

  // Drawer xem ma trận quyền & cấp quyền tùy biến
  const [drawerStaff, setDrawerStaff] = useState(null);
  const [drawerTab, setDrawerTab] = useState('preview'); // 'preview' | 'custom_perms'
  const [customPermIds, setCustomPermIds] = useState([]);

  // Modal đổi vai trò
  const [editRoleUser, setEditRoleUser] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState('');

  // Modal đặt lại mật khẩu
  const [resetPassUser, setResetPassUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // Dialog xác nhận Khóa / Mở khóa
  const [confirmTarget, setConfirmTarget] = useState(null);

  const columnVisibility = useColumnVisibility('admin_staffs_columns', STAFF_COLUMNS);
  const { isColumnVisible } = columnVisibility;

  // Lấy danh sách Roles & Permissions
  const { data: roles = [] } = useRoles();
  const { data: permissionsGrouped = {} } = usePermissions();

  // Thống kê KPI & phân bổ nhân sự theo phòng ban
  const { data: statsRes, refetch: refetchStats } = useUserStats('staff');
  const stats = statsRes?.data || { total: 0, active: 0, inactive: 0, roleDistribution: {} };
  const roleDist = stats.roleDistribution || {};

  // Gom nhóm thống kê theo phòng ban
  const departmentCounts = useMemo(() => {
    let adminCount = (roleDist['admin'] || 0) + (roleDist['administrator'] || 0);
    let inventoryCount = (roleDist['inventory_manager'] || 0) + (roleDist['warehouse_clerk'] || 0) +
      (roleDist['shipping_clerk'] || 0) + (roleDist['stock_auditor'] || 0);
    let marketingCount = (roleDist['content_editor'] || 0) + (roleDist['marketing_specialist'] || 0) + (roleDist['catalog_manager'] || 0);
    let cskhCount = (roleDist['customer_care'] || 0) + (roleDist['staff'] || 0) + (roleDist['manager'] || 0);

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

  // Mở Drawer xem quyền & khởi tạo customPermissions
  const handleOpenDrawer = (staff, defaultTab = 'preview') => {
    setDrawerStaff(staff);
    setDrawerTab(defaultTab);
    const existingCustom = (staff.customPermissions || []).map((p) =>
      typeof p === 'object' ? p._id : p
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
        role: drawerStaff.role,
        roleId: drawerStaff.roleId?._id || drawerStaff.roleId,
        customPermissions: customPermIds,
      });
      setDrawerStaff(null);
      refetch();
    } catch (_) {}
  };

  const handleOpenEditRole = (user) => {
    setEditRoleUser(user);
    setSelectedRoleId(user.roleId?._id || user.roleId || '');
  };

  const handleSaveRole = async () => {
    if (!editRoleUser) return;
    const targetRole = roles.find((r) => r._id === selectedRoleId);
    const roleCode = targetRole ? targetRole.code : editRoleUser.role;

    try {
      await updateRoleMut.mutateAsync({
        id: editRoleUser._id,
        role: roleCode,
        roleId: selectedRoleId || null,
        customPermissions: (editRoleUser.customPermissions || []).map((p) =>
          typeof p === 'object' ? p._id : p
        ),
      });
      setEditRoleUser(null);
      refetchStats();
    } catch (_) {}
  };

  const handleConfirmResetPassword = async (e) => {
    e.preventDefault();
    if (!resetPassUser || !newPassword || newPassword.length < 6) return;
    try {
      await resetPassMut.mutateAsync({
        id: resetPassUser._id,
        newPassword,
      });
      setResetPassUser(null);
      setNewPassword('');
    } catch (_) {}
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.email || !createForm.password) return;

    const targetRole = roles.find((r) => r._id === createForm.roleId);
    const roleCode = targetRole?.code || 'staff';

    try {
      await createStaffMut.mutateAsync({
        fullName: createForm.fullName,
        email: createForm.email,
        phone: createForm.phone,
        password: createForm.password,
        role: roleCode,
        roleId: createForm.roleId || null,
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

  const handleExportCSV = () => {
    if (staffs.length === 0) return;
    const headers = ['ID', 'Họ và tên', 'Email', 'Số điện thoại', 'Vai trò', 'Trạng thái', 'Đăng nhập gần nhất', 'IP đăng nhập'];
    const rows = staffs.map((s) => {
      const roleName = s.roleId?.name || (s.role === 'admin' || s.role === 'administrator' ? 'Administrator' : s.role);
      return [
        s._id,
        `"${s.fullName || ''}"`,
        `"${s.email || ''}"`,
        `"${s.phone || ''}"`,
        `"${roleName}"`,
        s.isActive ? 'Đang làm việc' : 'Đã khóa',
        s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleString('vi-VN') : 'Chưa đăng nhập',
        `"${s.lastLoginIp || '—'}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `staffs_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatShortDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-7xl mx-auto text-foreground">
      {/* 1. Header bar */}
      <Card className="rounded-[6px] border border-border shadow-none">
        <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">Quản lý Nhân viên & Quản trị</h1>
              <p className="text-xs text-muted-foreground font-mono tabular-nums">
                Tổng số {pagination.total} nhân sự • Ma trận phân quyền RBAC & Quản trị phiên thời gian thực
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetch();
                refetchStats();
              }}
              disabled={isFetching}
              className="h-9 rounded-[6px] text-xs font-medium"
              title="Làm mới dữ liệu"
            >
              <RefreshCw size={13} className={`mr-1.5 ${isFetching ? 'animate-spin' : ''}`} /> Làm mới
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="h-9 rounded-[6px] text-xs font-medium"
              title="Xuất danh bạ nhân sự ra file CSV"
            >
              <Download size={13} className="mr-1.5" /> Xuất CSV
            </Button>

            <Can permission="user.create">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInviteModalOpen(true)}
                className="h-9 rounded-[6px] text-xs font-medium"
                title="Mời thành viên tham gia workspace qua email"
              >
                <Mail size={13} className="mr-1.5" /> Mời thành viên
              </Button>
              <Button
                size="sm"
                onClick={() => setCreateModalOpen(true)}
                className="h-9 rounded-[6px] text-xs font-medium active:scale-[0.98] transition-transform"
              >
                <Plus size={14} className="mr-1.5" /> Thêm nhân viên
              </Button>
            </Can>
          </div>
        </CardContent>
      </Card>

      {/* 2. Staff Distribution Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="rounded-[6px] border border-border shadow-none">
          <CardContent className="p-3.5 flex flex-col gap-1">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Khối Quản Trị</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono tabular-nums text-foreground">{departmentCounts.adminCount}</span>
              <Badge variant="outline" className="rounded-[6px] text-xs bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 font-semibold">
                Administrator
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground mt-0.5">Toàn quyền hệ thống</span>
          </CardContent>
        </Card>

        <Card className="rounded-[6px] border border-border shadow-none">
          <CardContent className="p-3.5 flex flex-col gap-1">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Kho & Cung Ứng</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">{departmentCounts.inventoryCount}</span>
              <Badge variant="outline" className="rounded-[6px] text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-semibold">
                Kho vận
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground mt-0.5">Nhập/xuất/kiểm kê PO</span>
          </CardContent>
        </Card>

        <Card className="rounded-[6px] border border-border shadow-none">
          <CardContent className="p-3.5 flex flex-col gap-1">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Nội Dung & Marketing</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">{departmentCounts.marketingCount}</span>
              <Badge variant="outline" className="rounded-[6px] text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 font-semibold">
                Truyền thông
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground mt-0.5">Blog, Catalog, Flash Sale</span>
          </CardContent>
        </Card>

        <Card className="rounded-[6px] border border-border shadow-none">
          <CardContent className="p-3.5 flex flex-col gap-1">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Vận Hành & CSKH</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">{departmentCounts.cskhCount}</span>
              <Badge variant="outline" className="rounded-[6px] text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold">
                Vận hành
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground mt-0.5">Xử lý đơn & tư vấn</span>
          </CardContent>
        </Card>
      </div>

      {/* 3. Filter Toolbar */}
      <Card className="rounded-[6px] border border-border shadow-none">
        <CardContent className="p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {/* Search box */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, email, SĐT nhân viên..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
                className="h-9 pl-8 rounded-[6px]"
              />
            </div>

            {/* Role select */}
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-[6px] border border-input bg-background px-3 text-xs outline-none focus:border-ring cursor-pointer"
            >
              <option value="all">Tất cả vai trò</option>
              {roles.map((r) => (
                <option key={r._id} value={r.code}>
                  {r.name}
                </option>
              ))}
            </select>

            {/* Status select */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-[6px] border border-input bg-background px-3 text-xs outline-none focus:border-ring cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã bị khóa</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <ColumnToggleDropdown {...columnVisibility} />
          </div>
        </CardContent>
      </Card>

      {/* 4. Table Container */}
      <Card className="rounded-[6px] border border-border shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-b border-border">
                {isColumnVisible('staff') && <TableHead className="p-3">Nhân Viên</TableHead>}
                {isColumnVisible('contact') && <TableHead className="p-3">Liên Hệ</TableHead>}
                {isColumnVisible('role') && <TableHead className="p-3">Vai Trò & Quyền Hạn</TableHead>}
                {isColumnVisible('lastLogin') && <TableHead className="p-3">Đăng Nhập Gần Nhất</TableHead>}
                {isColumnVisible('createdAt') && <TableHead className="p-3">Ngày Tạo</TableHead>}
                {isColumnVisible('status') && <TableHead className="p-3 text-center">Trạng Thái</TableHead>}
                {isColumnVisible('actions') && <TableHead className="p-3 text-right">Thao Tác</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/60">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>Đang tải danh sách nhân viên...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : staffs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    Không tìm thấy nhân viên nào phù hợp
                  </TableCell>
                </TableRow>
              ) : (
                staffs.map((user) => {
                  const roleDoc = user.roleId;
                  const roleName =
                    roleDoc?.name ||
                    (user.role === 'admin' || user.role === 'administrator'
                      ? 'Administrator'
                      : user.role === 'staff'
                      ? 'Nhân viên vận hành'
                      : user.role);

                  const isSelf = user._id === currentAdminUser?._id;
                  const hasCustom = user.customPermissions && user.customPermissions.length > 0;

                  return (
                    <TableRow key={user._id} className="hover:bg-muted/30 transition-colors">
                      {/* Staff */}
                      {isColumnVisible('staff') && (
                        <TableCell className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-[6px] bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0 uppercase text-xs font-mono">
                              {user.fullName?.[0] || user.email?.[0] || 'S'}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleOpenDrawer(user, 'preview')}
                                  className="font-semibold text-xs text-foreground truncate hover:text-primary transition-colors text-left cursor-pointer"
                                  title="Bấm để xem hồ sơ và ma trận quyền hạn"
                                >
                                  {user.fullName || 'Nhân viên chưa đặt tên'}
                                </button>
                                {isSelf && (
                                  <Badge variant="outline" className="text-[10px] font-semibold px-1.5 py-0.2 rounded-[6px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                                    Bạn
                                  </Badge>
                                )}
                              </div>
                              <span className="text-[11px] text-muted-foreground block font-mono">
                                ID: {user._id.slice(-8)}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                      )}

                      {/* Contact */}
                      {isColumnVisible('contact') && (
                        <TableCell className="p-3 text-muted-foreground">
                          <div className="flex flex-col gap-0.5 text-xs">
                            <span className="flex items-center gap-1.5 text-foreground font-medium">
                              <Mail size={12} className="text-muted-foreground shrink-0" />
                              {user.email}
                            </span>
                            {user.phone ? (
                              <span className="flex items-center gap-1.5 font-mono tabular-nums text-[11px]">
                                <Phone size={12} className="text-muted-foreground shrink-0" />
                                {user.phone}
                              </span>
                            ) : (
                              <span className="text-muted-foreground/60 italic text-[11px]">Chưa có SĐT</span>
                            )}
                          </div>
                        </TableCell>
                      )}

                      {/* Role with Drawer trigger */}
                      {isColumnVisible('role') && (
                        <TableCell className="p-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDrawer(user, 'preview')}
                              className="h-6 px-2 text-[11px] font-semibold rounded-[6px] border bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20 transition-all gap-1"
                              title="Bấm để mở Drawer ma trận quyền hạn"
                            >
                              <Shield size={12} /> {roleName}
                              <Eye size={11} className="opacity-60 ml-0.5" />
                            </Button>

                            {hasCustom && (
                              <Badge
                                variant="outline"
                                onClick={() => handleOpenDrawer(user, 'custom_perms')}
                                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-[6px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 cursor-pointer hover:bg-blue-500/20"
                                title={`Nhân viên có ${user.customPermissions.length} quyền riêng biệt`}
                              >
                                +{user.customPermissions.length} quyền riêng
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      )}

                      {/* Last Login Info */}
                      {isColumnVisible('lastLogin') && (
                        <TableCell className="p-3 text-muted-foreground">
                          {user.lastLoginAt ? (
                            <div className="flex flex-col gap-0.5 text-xs font-mono tabular-nums">
                              <span className="text-foreground font-medium">
                                {new Date(user.lastLoginAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • {formatShortDate(user.lastLoginAt)}
                              </span>
                              <span className="text-[11px] text-muted-foreground/80">
                                IP: {user.lastLoginIp || '127.0.0.1'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground/60 italic text-[11px]">Chưa đăng nhập</span>
                          )}
                        </TableCell>
                      )}

                      {/* Created date */}
                      {isColumnVisible('createdAt') && (
                        <TableCell className="p-3 text-muted-foreground font-mono tabular-nums text-xs whitespace-nowrap">
                          {formatShortDate(user.createdAt)}
                        </TableCell>
                      )}

                      {/* Status */}
                      {isColumnVisible('status') && (
                        <TableCell className="p-3 text-center">
                          <Badge
                            variant="outline"
                            className={`rounded-[6px] text-[11px] font-semibold ${
                              user.isActive
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                            }`}
                          >
                            {user.isActive ? (
                              <>
                                <CheckCircle2 size={11} className="mr-1" /> Hoạt động
                              </>
                            ) : (
                              <>
                                <XCircle size={11} className="mr-1" /> Đã khóa
                              </>
                            )}
                          </Badge>
                        </TableCell>
                      )}

                      {/* Actions */}
                      {isColumnVisible('actions') && (
                        <TableCell className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Can permission="role.assign">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEditRole(user)}
                                className="size-7 rounded-[6px] text-muted-foreground hover:text-foreground"
                                title="Đổi vai trò nhân viên"
                              >
                                <Edit3 size={13} />
                              </Button>
                            </Can>

                            <Can permission="role.assign">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDrawer(user, 'custom_perms')}
                                className="size-7 rounded-[6px] text-muted-foreground hover:text-foreground"
                                title="Cấp quyền riêng biệt (Custom Permissions)"
                              >
                                <ShieldCheck size={13} />
                              </Button>
                            </Can>

                            <Can permission="user.edit">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setResetPassUser(user);
                                  setNewPassword('');
                                }}
                                className="size-7 rounded-[6px] text-muted-foreground hover:text-foreground"
                                title="Đặt lại mật khẩu nhân viên"
                              >
                                <KeyRound size={13} />
                              </Button>
                            </Can>

                            <Can permission="user.edit">
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={isSelf}
                                onClick={() => handleToggleClick(user)}
                                className={`size-7 rounded-[6px] ${
                                  isSelf
                                    ? 'opacity-30 cursor-not-allowed text-muted-foreground'
                                    : user.isActive
                                    ? 'text-red-600 hover:bg-red-500/10 hover:text-red-700'
                                    : 'text-emerald-600 hover:bg-emerald-500/10'
                                }`}
                                title={
                                  isSelf
                                    ? 'Không thể khóa tài khoản của chính mình'
                                    : user.isActive
                                    ? 'Khóa tài khoản (Cưỡng chế logout realtime trên mọi thiết bị)'
                                    : 'Mở khóa tài khoản'
                                }
                              >
                                {user.isActive ? <Lock size={13} /> : <Unlock size={13} />}
                              </Button>
                            </Can>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination
          page={pagination.page}
          pageSize={pagination.limit}
          totalItems={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />
      </Card>

      {/* 5. SLIDE-OVER DRAWER XEM NHANH MA TRẬN QUYỀN HẠN & CẤP QUYỀN TÙY BIẾN */}
      {drawerStaff && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/60"
          onClick={() => setDrawerStaff(null)}
        >
          <div
            className="w-full max-w-xl h-full bg-card border-l border-border p-6 shadow-2xl flex flex-col gap-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-primary" />
                <h3 className="text-base font-semibold text-foreground">Hồ Sơ & Quyền Hạn Nhân Sự</h3>
              </div>
              <button
                className="size-7 inline-flex items-center justify-center rounded-[6px] text-muted-foreground hover:bg-accent cursor-pointer"
                onClick={() => setDrawerStaff(null)}
              >
                ✕
              </button>
            </div>

            {/* Staff Summary Card */}
            <div className="p-3.5 rounded-[6px] border border-border bg-muted/20 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-[6px] bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm uppercase font-mono">
                    {drawerStaff.fullName?.[0] || drawerStaff.email?.[0] || 'S'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{drawerStaff.fullName || 'Nhân viên'}</h4>
                    <span className="text-xs text-muted-foreground font-mono">{drawerStaff.email}</span>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={`rounded-[6px] text-xs font-semibold ${
                    drawerStaff.isActive
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : 'bg-red-500/10 text-red-600 border-red-500/20'
                  }`}
                >
                  {drawerStaff.isActive ? 'Đang hoạt động' : 'Tài khoản đã khóa'}
                </Badge>
              </div>

              {/* Login metadata */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-border/60 font-mono tabular-nums">
                <div>
                  <span className="text-muted-foreground block">Đăng nhập gần nhất:</span>
                  <span className="font-medium text-foreground">
                    {drawerStaff.lastLoginAt ? new Date(drawerStaff.lastLoginAt).toLocaleString('vi-VN') : 'Chưa có dữ liệu'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">IP & Thiết bị:</span>
                  <span className="font-medium text-foreground">
                    {drawerStaff.lastLoginIp || '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Drawer Tab switcher */}
            <div className="flex items-center border-b border-border text-xs font-medium">
              <button
                onClick={() => setDrawerTab('preview')}
                className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                  drawerTab === 'preview'
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Ma Trận Quyền Hạn
              </button>
              <button
                onClick={() => setDrawerTab('custom_perms')}
                className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                  drawerTab === 'custom_perms'
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Cấp Quyền Riêng Biệt ({customPermIds.length})
              </button>
            </div>

            {/* TAB 1: PREVIEW PERMISSIONS MATRIX */}
            {drawerTab === 'preview' && (
              <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
                {drawerStaff.role === 'administrator' || drawerStaff.role === 'admin' ? (
                  <div className="p-4 rounded-[6px] border border-emerald-500/30 bg-emerald-500/5 text-xs text-emerald-700 dark:text-emerald-400 font-medium leading-relaxed">
                    ✓ Nhân viên này giữ vai trò Administrator tối cao (Toàn quyền tuyệt đối bypass trên tất cả quyền hệ thống).
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(permissionsGrouped).map(([mod, perms]) => {
                      const rolePermIds = (drawerStaff.roleId?.permissions || []).map((p) =>
                        typeof p === 'object' ? p._id : p
                      );
                      const customIds = (drawerStaff.customPermissions || []).map((p) =>
                        typeof p === 'object' ? p._id : p
                      );

                      return (
                        <div key={mod} className="rounded-[6px] border border-border bg-card p-3 shadow-none">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-xs text-foreground capitalize">
                              Module: {mod}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
                              {perms.filter((p) => rolePermIds.includes(p._id) || customIds.includes(p._id)).length}/{perms.length} quyền
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {perms.map((p) => {
                              const isFromRole = rolePermIds.includes(p._id);
                              const isCustom = customIds.includes(p._id);
                              const hasPerm = isFromRole || isCustom;

                              return (
                                <div
                                  key={p._id}
                                  className={`flex items-center justify-between gap-1.5 text-xs p-1.5 rounded-[4px] border ${
                                    hasPerm
                                      ? 'bg-muted/40 border-border text-foreground'
                                      : 'opacity-40 border-dashed border-border/40 text-muted-foreground'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    {hasPerm ? (
                                      <CheckCircle2 size={13} className={isCustom ? 'text-blue-600' : 'text-emerald-600'} />
                                    ) : (
                                      <XCircle size={13} className="text-muted-foreground" />
                                    )}
                                    <span className="truncate" title={p.name}>
                                      {p.name}
                                    </span>
                                  </div>

                                  {isCustom && (
                                    <span className="text-[9px] px-1 rounded-[3px] bg-blue-500/10 text-blue-600 shrink-0 font-semibold">
                                      Riêng
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CUSTOM OVERRIDE PERMISSIONS */}
            {drawerTab === 'custom_perms' && (
              <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
                <div className="p-3 rounded-[6px] border border-blue-500/20 bg-blue-500/5 text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                  💡 <strong>Cấp quyền riêng biệt (Custom Permissions):</strong> Bạn có thể bổ sung thêm các quyền đặc thù cho nhân viên này ngoài các quyền mặc định mà vai trò của họ đang có.
                </div>

                <div className="space-y-3">
                  {Object.entries(permissionsGrouped).map(([mod, perms]) => (
                    <div key={mod} className="rounded-[6px] border border-border bg-card p-3 shadow-none">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-xs text-foreground capitalize">
                          Module: {mod}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {perms.map((p) => {
                          const isChecked = customPermIds.includes(p._id);
                          return (
                            <label
                              key={p._id}
                              className={`flex items-center gap-2 p-1.5 rounded-[4px] border cursor-pointer transition-colors text-xs ${
                                isChecked
                                  ? 'bg-primary/5 border-primary/40 text-foreground font-medium'
                                  : 'hover:bg-muted/40 border-border text-muted-foreground'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleCustomPerm(p._id)}
                                className="size-3.5 rounded-[3px] border-border text-primary cursor-pointer"
                              />
                              <span className="truncate" title={p.description || p.name}>
                                {p.name}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Drawer Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
              {drawerTab === 'custom_perms' ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomPermIds([])}
                    className="h-8 rounded-[6px] text-xs"
                  >
                    Xóa tất cả quyền riêng
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveCustomPermissions}
                    disabled={updateRoleMut.isPending}
                    className="h-8 rounded-[6px] text-xs font-semibold active:scale-[0.98] transition-transform"
                  >
                    {updateRoleMut.isPending ? 'Đang lưu...' : 'Lưu Quyền Riêng'}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const target = drawerStaff;
                      setDrawerStaff(null);
                      handleToggleClick(target);
                    }}
                    disabled={drawerStaff._id === currentAdminUser?._id}
                    className={`h-8 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 ${
                      drawerStaff.isActive
                        ? 'border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
                        : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                    }`}
                  >
                    {drawerStaff.isActive ? <Lock size={12} /> : <Unlock size={12} />}
                    {drawerStaff.isActive ? 'Khóa & Force Logout' : 'Mở khóa tài khoản'}
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 rounded-[6px] text-xs font-medium"
                    onClick={() => setDrawerStaff(null)}
                  >
                    Đóng Drawer
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal Đổi vai trò cho nhân viên */}
      <Dialog open={!!editRoleUser} onOpenChange={(open) => { if (!open) setEditRoleUser(null); }}>
        <DialogContent className="max-w-md rounded-[6px] border border-border p-6">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Shield size={18} className="text-primary" /> Thay Đổi Vai Trò
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="text-xs">
              <p className="text-muted-foreground mb-1">
                Nhân viên: <strong className="text-foreground">{editRoleUser?.fullName || editRoleUser?.email}</strong>
              </p>
              <p className="text-muted-foreground font-mono">
                Email: <span className="text-foreground">{editRoleUser?.email}</span>
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Chọn vai trò hệ thống mới:</label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="h-9 w-full rounded-[6px] border border-input bg-background px-3 text-xs outline-none focus:border-ring transition-colors cursor-pointer"
              >
                <option value="">-- Chọn vai trò --</option>
                {roles.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name} ({r.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border flex items-center justify-end gap-2 bg-transparent">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-[6px] text-xs"
              onClick={() => setEditRoleUser(null)}
            >
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleSaveRole}
              disabled={updateRoleMut.isPending}
              className="h-8 rounded-[6px] text-xs active:scale-[0.98] transition-transform"
            >
              {updateRoleMut.isPending ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 7. Modal Đặt lại mật khẩu cho nhân viên */}
      <Dialog open={!!resetPassUser} onOpenChange={(open) => { if (!open) setResetPassUser(null); }}>
        <DialogContent className="max-w-md rounded-[6px] border border-border p-6">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <KeyRound size={18} className="text-primary" /> Đặt Lại Mật Khẩu Nhân Viên
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleConfirmResetPassword} className="space-y-4 py-2">
            <div className="p-3 rounded-[6px] border border-amber-500/20 bg-amber-500/5 text-xs text-amber-700 dark:text-amber-400">
              Lưu ý: Sau khi đổi mật khẩu, toàn bộ phiên đăng nhập hiện tại của nhân viên trên mọi thiết bị sẽ bị hủy ngay lập tức qua SSE.
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">Tài khoản:</span>
              <span className="font-semibold text-foreground font-mono">{resetPassUser?.fullName} ({resetPassUser?.email})</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Mật khẩu mới (tối thiểu 6 ký tự):</label>
              <Input
                type="password"
                required
                minLength={6}
                placeholder="Nhập mật khẩu mới..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-9 rounded-[6px] text-xs"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-border flex items-center justify-end gap-2 bg-transparent">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-[6px] text-xs"
                onClick={() => setResetPassUser(null)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={resetPassMut.isPending || newPassword.length < 6}
                className="h-8 rounded-[6px] text-xs active:scale-[0.98] transition-transform"
              >
                {resetPassMut.isPending ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 8. Modal Thêm nhân viên mới */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-lg rounded-[6px] border border-border p-6">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck size={18} className="text-primary" /> Thêm Nhân Viên / Quản Trị Mới
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Họ và tên *</label>
              <Input
                type="text"
                required
                placeholder="Nguyễn Văn A"
                value={createForm.fullName}
                onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                className="h-9 rounded-[6px] text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Email đăng nhập *</label>
                <Input
                  type="email"
                  required
                  placeholder="staff@company.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="h-9 rounded-[6px] text-xs font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Số điện thoại</label>
                <Input
                  type="tel"
                  placeholder="0912345678"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  className="h-9 rounded-[6px] text-xs font-mono tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Mật khẩu ban đầu *</label>
                <Input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Tối thiểu 6 ký tự"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="h-9 rounded-[6px] text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Vai trò phân quyền *</label>
                <select
                  value={createForm.roleId}
                  onChange={(e) => setCreateForm({ ...createForm, roleId: e.target.value })}
                  className="h-9 w-full rounded-[6px] border border-input bg-background px-3 text-xs outline-none focus:border-ring transition-colors cursor-pointer"
                >
                  <option value="">-- Mặc định: Nhân viên vận hành --</option>
                  {roles.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border flex items-center justify-end gap-2 bg-transparent">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-[6px] text-xs"
                onClick={() => setCreateModalOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createStaffMut.isPending}
                className="h-8 rounded-[6px] text-xs active:scale-[0.98] transition-transform"
              >
                {createStaffMut.isPending ? 'Đang tạo...' : 'Tạo Nhân Viên'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 9. Dialog xác nhận Khóa / Mở khóa tài khoản */}
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

      {/* 10. Modal Mời thành viên */}
      <InviteMemberModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSuccess={() => refetchStats()}
      />
    </div>
  );
}
