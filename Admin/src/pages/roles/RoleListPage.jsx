import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Trash2, Lock, KeyRound,
  SearchIcon as Search, ShieldCheck, CheckSquare, Square, Layers, RefreshCw,
  Info, Save
} from '@/components/ui/Icons';
import Can from '../../components/auth/Can';
import SearchableSelect from '@/components/ui/SearchableSelect';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function RoleListPage() {
  const { data: roles = [], isLoading: loading, refetch: refetchRoles } = useRoles();
  const { data: permissionsGrouped = {} } = usePermissions();
  const createMut = useCreateRole();
  const updateMut = useUpdateRole();
  const deleteMut = useDeleteRole();

  const [saving, setSaving] = useState(false);

  // Role đang được chọn để xem/chỉnh sửa ở cột bên phải
  const [activeRoleId, setActiveRoleId] = useState(null);

  // State tìm kiếm quyền
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');

  // State Form chỉnh sửa Role đang chọn
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    permissions: [],
  });

  // Mode tạo mới hay chỉnh sửa
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Tự động chọn role đầu tiên khi data load xong lần đầu
  useEffect(() => {
    if (roles.length > 0 && !activeRoleId) {
      selectRole(roles[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Toggle 1 permission
  const togglePermission = (permId) => {
    if (activeRole?.isSystem && activeRole?.code === 'administrator') return;
    setFormData((prev) => {
      const exists = prev.permissions.includes(permId);
      if (exists) {
        return { ...prev, permissions: prev.permissions.filter((id) => id !== permId) };
      } else {
        return { ...prev, permissions: [...prev.permissions, permId] };
      }
    });
  };

  // Toggle tất cả permission của 1 module
  const toggleModuleAll = (modulePerms) => {
    if (activeRole?.isSystem && activeRole?.code === 'administrator') return;
    const permIds = modulePerms.map((p) => p._id);
    const allChecked = permIds.every((id) => formData.permissions.includes(id));

    setFormData((prev) => {
      if (allChecked) {
        return { ...prev, permissions: prev.permissions.filter((id) => !permIds.includes(id)) };
      } else {
        return { ...prev, permissions: [...new Set([...prev.permissions, ...permIds])] };
      }
    });
  };

  // Chọn hoặc bỏ chọn TẤT CẢ các quyền
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
      // errors handled by hook
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

  const MODULE_NAMES = {
    products: 'Sản phẩm & Biến thể',
    product_variants: 'Thuộc tính Biến thể',
    categories: 'Danh mục Sản phẩm',
    brands: 'Thương hiệu',
    coupons: 'Mã giảm giá (Coupons)',
    promotions: 'Chương trình Khuyến mãi',
    gift_programs: 'Quà tặng kèm',
    flash_sales: 'Flash Sale sốc',
    blogs: 'Bài viết & Blog',
    blog_categories: 'Danh mục Blog',
    tags: 'Nhãn thẻ Tags',
    media: 'Thư viện Media & Thư mục',
    banners: 'Banner Quảng cáo',
    menus: 'Điều hướng Menu Header/Footer',
    users: 'Tài khoản & Nhân viên',
    roles: 'Vai trò & Phân quyền',
    dashboard: 'Thống kê Dashboard',
    settings: 'Cài đặt Hệ thống',
  };

  // Filter permissions theo search query & selected module
  const filteredGroupedPermissions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result = {};

    Object.entries(permissionsGrouped).forEach(([modKey, perms]) => {
      if (selectedModule !== 'all' && selectedModule !== modKey) return;

      const matchedPerms = perms.filter((p) => {
        if (!query) return true;
        return (
          p.name.toLowerCase().includes(query) ||
          p.code.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
        );
      });

      if (matchedPerms.length > 0) {
        result[modKey] = matchedPerms;
      }
    });

    return result;
  }, [permissionsGrouped, searchQuery, selectedModule]);

  return (
    <div className="min-h-full bg-background p-4 md:p-6 space-y-5 text-foreground">
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
              className="h-9 px-4 rounded-[6px] text-xs font-medium active:scale-[0.98] transition-transform"
            >
              <Plus className="size-4 mr-1.5" /> Tạo Vai Trò Mới
            </Button>
          </Can>
        </CardContent>
      </Card>

      {/* Main Split Layout (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* CỘT TRÁI: DANH SÁCH VAI TRÒ (4 cols) */}
        <Card className="lg:col-span-4 rounded-[6px] border border-border shadow-none overflow-hidden flex flex-col">
          <div className="p-3 bg-muted/40 border-b border-border flex items-center justify-between">
            <span className="font-semibold text-xs text-foreground flex items-center gap-2">
              <Layers className="size-4 text-primary" /> Danh sách Vai trò ({roles.length})
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={refetchRoles}
              title="Làm mới"
              className="size-7 rounded-[4px] text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <div className="divide-y divide-border max-h-[calc(100vh-240px)] overflow-y-auto">
            {roles.map((role) => {
              const isSelected = !isCreating && role._id === activeRoleId;
              const isAdministrator = role.code === 'administrator';

              return (
                <div
                  key={role._id}
                  onClick={() => selectRole(role)}
                  className={`p-3.5 cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-primary/10 border-l-4 border-l-primary text-foreground font-medium'
                      : 'hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs line-clamp-1 text-foreground">
                        {role.name}
                      </span>
                      {role.isSystem && (
                        <Badge variant="outline" className="rounded-[4px] text-[10px] font-bold px-1.5 py-0 bg-amber-500/10 text-amber-600 border-amber-500/20">
                          <Lock className="size-2.5 mr-0.5" /> Hệ thống
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 font-mono text-[11px] tabular-nums">
                      <code className="bg-muted px-1.5 py-0.2 rounded-[3px] text-muted-foreground">
                        {role.code}
                      </code>
                      <span className="text-muted-foreground">
                        • {isAdministrator ? 'Full Quyền (*)' : `${role.permissions?.length || 0} quyền`}
                      </span>
                    </div>

                    {role.description && (
                      <p className="text-[11px] text-muted-foreground/80 mt-1 line-clamp-1">
                        {role.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0 self-center">
                    {!role.isSystem && (
                      <Can do="role.manage">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(role);
                          }}
                          title="Xóa vai trò"
                          className="size-7 rounded-[4px] text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </Can>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* CỘT PHẢI: CHI TIẾT VAI TRÒ & MA TRẬN PHÂN QUYỀN (8 cols) */}
        <Card className="lg:col-span-8 rounded-[6px] border border-border shadow-none p-5 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Header Form Chỉnh Sửa */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <KeyRound className="size-4 text-primary" />
                  {isCreating
                    ? 'Tạo Vai Trò Mới'
                    : `Cấu hình Phân quyền: ${formData.name || '...'}`}
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

            {/* Thẻ Thông Tin Cơ Bản Của Role */}
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

            {/* Thông báo nếu là Administrator */}
            {formData.code === 'administrator' ? (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-[6px] text-amber-700 dark:text-amber-400 text-xs flex items-center gap-3">
                <Info className="size-5 shrink-0" />
                <div>
                  <div className="font-bold">Vai trò Administrator Tối Cao</div>
                  <div className="text-xs mt-0.5 opacity-90">
                    Tài khoản sở hữu vai trò này có <strong>Full Quyền Tuyệt Đối (*)</strong> trên toàn bộ các tính năng và API của hệ thống. Không cần tích chọn thủ công.
                  </div>
                </div>
              </div>
            ) : (
              /* MA TRẬN PHÂN QUYỀN CHI TIẾT */
              <div className="space-y-3">
                
                {/* Search & Filter Bar trong bảng Quyền */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-[6px] border border-border">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Tìm kiếm mã quyền hoặc tên quyền..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 pl-8 rounded-[6px] text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <SearchableSelect
                      className="w-52"
                      options={[
                        { label: `Tất cả nhóm (${Object.keys(permissionsGrouped).length} nhóm)`, value: 'all' },
                        ...Object.keys(permissionsGrouped).map((modKey) => ({
                          label: MODULE_NAMES[modKey] || modKey,
                          value: modKey,
                        })),
                      ]}
                      value={selectedModule}
                      onChange={(val) => setSelectedModule(val)}
                      creatable={false}
                      placeholder="Tất cả nhóm"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSelectAllPermissions(true)}
                      className="h-8 px-2.5 rounded-[6px] text-xs font-medium whitespace-nowrap"
                    >
                      Chọn Tất Cả
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSelectAllPermissions(false)}
                      className="h-8 px-2.5 rounded-[6px] text-xs font-medium whitespace-nowrap text-muted-foreground"
                    >
                      Bỏ Chọn
                    </Button>
                  </div>
                </div>

                {/* Counter Bar */}
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1 font-mono tabular-nums">
                  <span>Danh mục ma trận quyền hạn:</span>
                  <span>
                    Đã cấp <strong className="text-primary font-bold">{formData.permissions.length}</strong> quyền cho vai trò này
                  </span>
                </div>

                {/* Danh sách nhóm Module & Permissions */}
                <div className="space-y-3 max-h-[calc(100vh-420px)] overflow-y-auto pr-1">
                  {Object.keys(filteredGroupedPermissions).length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-[6px] text-xs">
                      Không tìm thấy quyền nào phù hợp với từ khóa "{searchQuery}"
                    </div>
                  ) : (
                    Object.entries(filteredGroupedPermissions).map(([modKey, perms]) => {
                      const permIds = perms.map((p) => p._id);
                      const checkedCount = permIds.filter((id) => formData.permissions.includes(id)).length;
                      const allChecked = checkedCount === permIds.length && permIds.length > 0;

                      return (
                        <Card
                          key={modKey}
                          className="border border-border rounded-[6px] overflow-hidden shadow-none"
                        >
                          {/* Module Header Bar */}
                          <div className="bg-muted/40 px-3.5 py-2.5 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-foreground">
                                {MODULE_NAMES[modKey] || modKey}
                              </span>
                              <Badge variant="secondary" className="rounded-[4px] px-1.5 py-0 text-[10px] font-mono tabular-nums">
                                {checkedCount} / {perms.length}
                              </Badge>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleModuleAll(perms)}
                              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              {allChecked ? (
                                <>
                                  <Square className="size-3.5" /> Bỏ chọn nhóm
                                </>
                              ) : (
                                <>
                                  <CheckSquare className="size-3.5" /> Chọn tất cả nhóm
                                </>
                              )}
                            </button>
                          </div>

                          {/* Permissions Checkbox Grid */}
                          <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                            {perms.map((p) => {
                              const isChecked = formData.permissions.includes(p._id);
                              return (
                                <div
                                  key={p._id}
                                  onClick={() => togglePermission(p._id)}
                                  className={`p-2.5 rounded-[4px] border cursor-pointer transition-all flex items-start gap-2.5 select-none ${
                                    isChecked
                                      ? 'bg-primary/10 border-primary/40 text-foreground'
                                      : 'border-border hover:bg-muted/30 text-muted-foreground'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}}
                                    className="mt-0.5 rounded-[3px] text-primary focus:ring-primary size-3.5 cursor-pointer"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1.5">
                                      <span className="font-medium text-xs text-foreground line-clamp-1">
                                        {p.name}
                                      </span>
                                      <code className="text-[10px] bg-muted px-1 py-0.2 rounded-[2px] font-mono text-muted-foreground shrink-0">
                                        {p.code}
                                      </code>
                                    </div>
                                    {p.description && (
                                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                                        {p.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </form>
        </Card>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa Vai Trò Phân Quyền"
        description={`Bạn có chắc chắn muốn xóa vai trò "${deleteTarget?.name}"? Các nhân viên đang thuộc vai trò này sẽ cần được gán lại vai trò mới.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
