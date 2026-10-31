import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Plus,
  RefreshCw,
  KeyRound,
  Save,
} from '@/components/ui/Icons';
import Can from '@/components/auth/Can';
import { toast } from '@/providers/ToastProvider';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  useRoles,
  usePermissions,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from '@/hooks/useRoles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

import RoleSidebar from './components/RoleSidebar';
import RolePermissionsMatrix from './components/RolePermissionsMatrix';

export default function RoleListPage() {
  const { data: roles = [], isLoading: loading, refetch: refetchRoles } = useRoles();
  const { data: permissionsGrouped = {} } = usePermissions();
  const createMut = useCreateRole();
  const updateMut = useUpdateRole();
  const deleteMut = useDeleteRole();

  const [saving, setSaving] = useState(false);
  const [activeRoleId, setActiveRoleId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    permissions: [],
  });

  const [isCreating, setIsCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (roles.length > 0 && !activeRoleId) {
      selectRole(roles[0]);
    }
  }, [roles.length]);

  const selectRole = (role) => {
    setIsCreating(false);
    setActiveRoleId(role._id);
    setFormData({
      name: role.name,
      code: role.code,
      description: role.description || '',
      permissions: (role.permissions || []).map((p) => (typeof p === 'object' ? p._id : p)),
    });
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setActiveRoleId('new');
    setFormData({
      name: '',
      code: '',
      description: '',
      permissions: [],
    });
  };

  const activeRole = useMemo(() => {
    if (isCreating) return null;
    return roles.find((r) => r._id === activeRoleId);
  }, [roles, activeRoleId, isCreating]);

  const togglePermission = (permId) => {
    if (activeRole?.isSystem && activeRole?.code === 'administrator') return;
    setFormData((prev) => {
      const exists = prev.permissions.includes(permId);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((id) => id !== permId)
          : [...prev.permissions, permId],
      };
    });
  };

  const toggleModuleAll = (modulePerms) => {
    if (activeRole?.isSystem && activeRole?.code === 'administrator') return;
    const permIds = modulePerms.map((p) => p._id);
    const allChecked = permIds.every((id) => formData.permissions.includes(id));

    setFormData((prev) => ({
      ...prev,
      permissions: allChecked
        ? prev.permissions.filter((id) => !permIds.includes(id))
        : [...new Set([...prev.permissions, ...permIds])],
    }));
  };

  const toggleSelectAllPermissions = (select = true) => {
    if (activeRole?.isSystem && activeRole?.code === 'administrator') return;
    if (select) {
      const allIds = [];
      Object.values(permissionsGrouped).forEach((perms) => {
        perms.forEach((p) => allIds.push(p._id));
      });
      setFormData((prev) => ({ ...prev, permissions: allIds }));
    } else {
      setFormData((prev) => ({ ...prev, permissions: [] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error('Vui lòng điền đầy đủ Tên và Mã vai trò!');
      return;
    }
    setSaving(true);
    try {
      if (isCreating) {
        const res = await createMut.mutateAsync(formData);
        setIsCreating(false);
        if (res.data?._id) setActiveRoleId(res.data._id);
      } else {
        await updateMut.mutateAsync({ id: activeRoleId, data: formData });
      }
    } catch {
      // Handled by hook
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (role) => {
    if (role.isSystem) {
      toast.error('Không thể xóa vai trò mặc định của hệ thống!');
      return;
    }
    setDeleteTarget(role);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMut.mutate(deleteTarget._id, {
      onSuccess: () => {
        setDeleteTarget(null);
        if (activeRoleId === deleteTarget._id && roles.length > 1) {
          const remaining = roles.filter((r) => r._id !== deleteTarget._id);
          if (remaining.length > 0) selectRole(remaining[0]);
        }
      },
    });
  };

  return (
    <div className="min-h-full bg-background p-4 md:p-6 space-y-5 text-foreground antialiased">
      {/* Header Bar */}
      <Card className="rounded-[6px] border border-border shadow-none">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="size-6 text-primary" /> Phân Quyền & Quản Lý Vai Trò
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Giao diện Master-Detail: Tích chọn phân quyền linh hoạt theo nhóm chức năng, bảo vệ hệ thống tuyệt đối.
            </p>
          </div>

          <Can do="role.manage">
            <Button
              onClick={handleStartCreate}
              className="h-8 px-3.5 rounded-[6px] text-xs font-semibold active:scale-[0.98] transition-transform"
            >
              <Plus className="size-3.5 mr-1.5" /> Tạo Vai Trò Mới
            </Button>
          </Can>
        </CardContent>
      </Card>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* CỘT TRÁI */}
        <div className="lg:col-span-4">
          <RoleSidebar
            roles={roles}
            activeRoleId={activeRoleId}
            isCreating={isCreating}
            onSelectRole={selectRole}
            onStartCreate={handleStartCreate}
          />
        </div>

        {/* CỘT PHẢI */}
        <Card className="lg:col-span-8 rounded-[6px] border border-border shadow-none p-5 space-y-5 bg-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <KeyRound className="size-4 text-primary" />
                  {isCreating ? 'Tạo Vai Trò Mới' : `Cấu hình Phân quyền: ${formData.name || '...'}`}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isCreating
                    ? 'Nhập tên vai trò và tích chọn các quyền hạn bên dưới'
                    : 'Tích chọn hoặc bỏ chọn các quyền để cấp quyền cho vai trò này'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {!isCreating && activeRole && !activeRole.isSystem && (
                  <Can do="role.manage">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(activeRole)}
                      className="h-8 rounded-[6px] text-xs font-medium"
                    >
                      Xóa Vai Trò
                    </Button>
                  </Can>
                )}

                <Can do="role.manage">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={saving}
                    className="h-8 px-4 rounded-[6px] text-xs font-semibold active:scale-[0.98] transition-transform"
                  >
                    {saving ? <RefreshCw className="size-3.5 animate-spin mr-1.5" /> : <Save className="size-3.5 mr-1.5" />}
                    {isCreating ? 'Tạo Vai Trò' : 'Lưu Thay Đổi'}
                  </Button>
                </Can>
              </div>
            </div>

            {/* Thông tin cơ bản */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-muted/20 p-3.5 rounded-[6px] border border-border">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Tên Vai Trò <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  required
                  placeholder="Ví dụ: Quản lý Kho & Sản phẩm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-8 rounded-[6px] text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Mã Vai Trò (Code) <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  required
                  disabled={activeRole?.isSystem}
                  placeholder="Ví dụ: inventory_manager"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })
                  }
                  className="h-8 rounded-[6px] text-xs font-mono"
                />
              </div>

              <div className="md:col-span-2 flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Mô tả phạm vi vai trò
                </label>
                <Input
                  type="text"
                  placeholder="Mô tả công việc và trách nhiệm của vai trò này..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="h-8 rounded-[6px] text-xs"
                />
              </div>
            </div>

            {/* Ma trận phân quyền */}
            <RolePermissionsMatrix
              formData={formData}
              permissionsGrouped={permissionsGrouped}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedModule={selectedModule}
              setSelectedModule={setSelectedModule}
              onTogglePermission={togglePermission}
              onToggleModuleAll={toggleModuleAll}
              onToggleSelectAll={toggleSelectAllPermissions}
              isAdministrator={formData.code === 'administrator'}
            />
          </form>
        </Card>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          open={!!deleteTarget}
          title="Xác nhận xóa vai trò"
          description={`Bạn có chắc chắn muốn xóa vai trò "${deleteTarget.name}" không? Thao tác này không thể hoàn tác.`}
          confirmLabel="Xóa vai trò"
          danger
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
