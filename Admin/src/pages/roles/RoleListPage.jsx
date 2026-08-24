import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, Plus, Edit3, Trash2, CheckCircle2, Lock, KeyRound, 
  Search, ShieldCheck, CheckSquare, Square, Layers, RefreshCw,
  Info, AlertTriangle, Save
} from 'lucide-react';
import roleService from '../../services/role.service';
import Can from '../../components/auth/Can';

export default function RoleListPage() {
  const [roles, setRoles] = useState([]);
  const [permissionsGrouped, setPermissionsGrouped] = useState({});
  const [loading, setLoading] = useState(true);
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRoles, resPerms] = await Promise.all([
        roleService.getRoles(),
        roleService.getPermissions(),
      ]);
      const fetchedRoles = resRoles.data || [];
      setRoles(fetchedRoles);
      setPermissionsGrouped(resPerms.data?.grouped || {});

      // Mặc định chọn vai trò đầu tiên (hoặc administrator)
      if (fetchedRoles.length > 0 && !activeRoleId) {
        selectRole(fetchedRoles[0]);
      }
    } catch (e) {
      console.error('Lỗi lấy danh sách vai trò & quyền:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      alert('Vui lòng điền đầy đủ Tên và Mã vai trò!');
      return;
    }

    setSaving(true);
    try {
      if (isCreating) {
        const res = await roleService.createRole(formData);
        alert('Tạo vai trò thành công!');
        fetchData();
        if (res.data?._id) setActiveRoleId(res.data._id);
      } else {
        await roleService.updateRole(activeRoleId, formData);
        alert('Lưu thay đổi vai trò thành công!');
        fetchData();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Có lỗi xảy ra khi lưu vai trò');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role) => {
    if (role.isSystem) {
      alert('Không thể xóa vai trò mặc định của hệ thống!');
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa vai trò "${role.name}"?`)) {
      try {
        await roleService.deleteRole(role._id);
        alert('Đã xóa vai trò thành công!');
        const remaining = roles.filter((r) => r._id !== role._id);
        setRoles(remaining);
        if (remaining.length > 0) selectRole(remaining[0]);
      } catch (e) {
        alert(e.response?.data?.message || 'Có lỗi xảy ra khi xóa vai trò');
      }
    }
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
    <div className="min-h-screen bg-muted/20 p-4 md:p-6 space-y-6">
      {/* Header Bar */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <ShieldCheck className="size-7 text-primary" /> Phân Quyền & Quản Lý Vai Trò
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Giao diện Master-Detail: Tích chọn phân quyền linh hoạt theo nhóm chức năng, bảo vệ hệ thống tuyệt đối.
          </p>
        </div>

        <Can do="role.manage">
          <button
            onClick={handleStartCreate}
            className="flex items-center gap-2 px-4 h-10 bg-primary text-primary-foreground rounded-lg font-medium shadow-sm hover:bg-primary/90 transition-all text-sm shrink-0"
          >
            <Plus className="size-4" /> Tạo Vai Trò Mới
          </button>
        </Can>
      </div>

      {/* Main Split Layout (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================================= */}
        {/* CỘT TRÁI: DANH SÁCH VAI TRÒ (30% Width - 4 cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-muted/40 border-b border-border flex items-center justify-between">
            <span className="font-bold text-sm text-foreground flex items-center gap-2">
              <Layers className="size-4 text-primary" /> Danh sách Vai trò ({roles.length})
            </span>
            <button
              onClick={fetchData}
              title="Làm mới"
              className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-colors"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="divide-y divide-border max-h-[calc(100vh-220px)] overflow-y-auto">
            {roles.map((role) => {
              const isSelected = !isCreating && role._id === activeRoleId;
              const isAdministrator = role.code === 'administrator';

              return (
                <div
                  key={role._id}
                  onClick={() => selectRole(role)}
                  className={`p-4 cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-primary/10 border-l-4 border-l-primary text-foreground font-medium shadow-inner'
                      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm line-clamp-1 text-foreground">
                        {role.name}
                      </span>
                      {role.isSystem && (
                        <span className="shrink-0 bg-amber-500/10 text-amber-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-500/20 flex items-center gap-0.5">
                          <Lock className="size-2.5" /> Hệ thống
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-[11px] bg-muted px-1.5 py-0.2 rounded font-mono text-muted-foreground">
                        {role.code}
                      </code>
                      <span className="text-xs text-muted-foreground">
                        • {isAdministrator ? 'Full Quyền (*)' : `${role.permissions?.length || 0} quyền`}
                      </span>
                    </div>

                    {role.description && (
                      <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-1">
                        {role.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0 self-center">
                    {!role.isSystem && (
                      <Can do="role.manage">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(role);
                          }}
                          title="Xóa vai trò"
                          className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </Can>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CỘT PHẢI: CHI TIẾT VAI TRÒ & MA TRẬN PHÂN QUYỀN (70% Width - 8 cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 bg-card border border-border rounded-xl shadow-sm p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Header Form Chỉnh Sửa */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <KeyRound className="size-5 text-primary" />
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
                    <button
                      type="button"
                      onClick={() => handleDelete(activeRole)}
                      className="px-3 h-9 bg-destructive/10 text-destructive rounded-lg text-xs font-medium hover:bg-destructive/20 transition-colors"
                    >
                      Xóa Vai Trò
                    </button>
                  </Can>
                )}

                <Can do="role.manage">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-5 h-9 bg-primary text-primary-foreground rounded-lg text-xs font-semibold shadow hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {saving ? <RefreshCw className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                    {isCreating ? 'Tạo Vai Trò' : 'Lưu Thay Đổi'}
                  </button>
                </Can>
              </div>
            </div>

            {/* Thẻ Thông Tin Cơ Bản Của Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border border-border">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Tên Vai Trò <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Quản lý Kho & Sản phẩm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-9 px-3 bg-background border border-input rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Mã Vai Trò (Code) <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={activeRole?.isSystem}
                  placeholder="Ví dụ: inventory_manager"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })
                  }
                  className="w-full h-9 px-3 bg-background border border-input rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Mô tả phạm vi vai trò
                </label>
                <input
                  type="text"
                  placeholder="Mô tả công việc và trách nhiệm của vai trò này..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full h-9 px-3 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Thông báo nếu là Administrator */}
            {formData.code === 'administrator' ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-700 dark:text-amber-400 text-sm flex items-center gap-3">
                <Info className="size-6 shrink-0" />
                <div>
                  <div className="font-bold">Vai trò Administrator Tối Cao</div>
                  <div className="text-xs mt-0.5 opacity-90">
                    Tài khoản sở hữu vai trò này có <strong>Full Quyền Tuyệt Đối (*)</strong> trên toàn bộ các tính năng và API của hệ thống. Không cần tích chọn thủ công.
                  </div>
                </div>
              </div>
            ) : (
              /* ========================================================================= */
              /* MA TRẬN PHÂN QUYỀN CHI TIẾT (PERMISSIONS MATRIX GRID) */
              /* ========================================================================= */
              <div className="space-y-4">
                
                {/* Search & Filter Bar trong bảng Quyền */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm mã quyền hoặc tên quyền..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 bg-background border border-input rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedModule}
                      onChange={(e) => setSelectedModule(e.target.value)}
                      className="h-9 px-3 bg-background border border-input rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="all">Tất cả nhóm ({Object.keys(permissionsGrouped).length} nhóm)</option>
                      {Object.keys(permissionsGrouped).map((modKey) => (
                        <option key={modKey} value={modKey}>
                          {MODULE_NAMES[modKey] || modKey}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => toggleSelectAllPermissions(true)}
                      className="px-2.5 h-9 border border-input bg-background rounded-md text-xs font-medium hover:bg-muted transition-colors whitespace-nowrap"
                    >
                      Chọn Tất Cả
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSelectAllPermissions(false)}
                      className="px-2.5 h-9 border border-input bg-background rounded-md text-xs font-medium hover:bg-muted transition-colors whitespace-nowrap text-muted-foreground"
                    >
                      Bỏ Chọn
                    </button>
                  </div>
                </div>

                {/* Counter Bar */}
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                  <span>Tải ma trận danh mục quyền hạn:</span>
                  <span>
                    Đã cấp <strong className="text-primary font-bold text-sm">{formData.permissions.length}</strong> quyền cho vai trò này
                  </span>
                </div>

                {/* Danh sách nhóm Module & Permissions */}
                <div className="space-y-4 max-h-[calc(100vh-380px)] overflow-y-auto pr-1">
                  {Object.keys(filteredGroupedPermissions).length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl">
                      Không tìm thấy quyền nào phù hợp với từ khóa "{searchQuery}"
                    </div>
                  ) : (
                    Object.entries(filteredGroupedPermissions).map(([modKey, perms]) => {
                      const permIds = perms.map((p) => p._id);
                      const checkedCount = permIds.filter((id) => formData.permissions.includes(id)).length;
                      const allChecked = checkedCount === permIds.length && permIds.length > 0;

                      return (
                        <div
                          key={modKey}
                          className="border border-border rounded-xl overflow-hidden bg-card shadow-2xs"
                        >
                          {/* Module Header Bar */}
                          <div className="bg-muted/40 px-4 py-3 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="font-bold text-sm text-foreground">
                                {MODULE_NAMES[modKey] || modKey}
                              </span>
                              <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-medium text-muted-foreground">
                                {checkedCount} / {perms.length} đã cấp
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleModuleAll(perms)}
                              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
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
                          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {perms.map((p) => {
                              const isChecked = formData.permissions.includes(p._id);
                              return (
                                <div
                                  key={p._id}
                                  onClick={() => togglePermission(p._id)}
                                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 select-none ${
                                    isChecked
                                      ? 'bg-primary/10 border-primary/50 text-foreground shadow-2xs'
                                      : 'border-border hover:bg-muted/30 text-muted-foreground'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}}
                                    className="mt-1 rounded text-primary focus:ring-primary size-4 cursor-pointer"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-semibold text-xs text-foreground line-clamp-1">
                                        {p.name}
                                      </span>
                                      <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground shrink-0">
                                        {p.code}
                                      </code>
                                    </div>
                                    {p.description && (
                                      <p className="text-[11px] text-muted-foreground/80 mt-1 line-clamp-2">
                                        {p.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

      </div>
    </div>
  );
}
