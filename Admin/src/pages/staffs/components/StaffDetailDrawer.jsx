import React from 'react';
import {
  ShieldCheck,
  XCircle,
  CheckCircle2,
  Lock,
  Unlock,
} from '@/components/ui/Icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * Slide-over Drawer to inspect staff details, permissions matrix and manage custom permissions
 */
export default function StaffDetailDrawer({
  drawerStaff,
  onClose,
  drawerTab,
  setDrawerTab,
  customPermIds,
  onToggleCustomPerm,
  permissionsGrouped = {},
  roles = [],
  onSaveCustomPermissions,
  onClearCustomPermissions,
  onToggleStatusClick,
  isPending,
  currentAdminUser,
}) {
  if (!drawerStaff) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-none"
      onClick={onClose}
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
            className="size-7 inline-flex items-center justify-center rounded-[6px] text-muted-foreground hover:bg-accent cursor-pointer transition-colors"
            onClick={onClose}
          >
            <XCircle size={18} />
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
                <h4 className="font-semibold text-foreground text-sm">
                  {drawerStaff.fullName || 'Nhân viên'}
                </h4>
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
                {drawerStaff.lastLoginAt
                  ? new Date(drawerStaff.lastLoginAt).toLocaleString('vi-VN')
                  : 'Chưa có dữ liệu'}
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
              <div className="p-4 rounded-[6px] border border-emerald-500/30 bg-emerald-500/5 text-xs text-emerald-700 dark:text-emerald-400 font-medium leading-relaxed flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Nhân viên này giữ vai trò Administrator tối cao (Toàn quyền tuyệt đối bypass trên tất cả quyền hệ thống).
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(permissionsGrouped).map(([mod, perms]) => {
                  const activeRole = roles.find(
                    (r) =>
                      (drawerStaff.roleId &&
                        (r._id === drawerStaff.roleId._id || r._id === drawerStaff.roleId)) ||
                      r.code === drawerStaff.role
                  );
                  const rolePerms = activeRole?.permissions || drawerStaff.roleId?.permissions || [];
                  const rolePermIds = rolePerms.map((p) =>
                    typeof p === 'object' ? p._id || p.id : p
                  );
                  const rolePermCodes = rolePerms.map((p) =>
                    typeof p === 'object' ? p.code : p
                  );
                  const customIds = (drawerStaff.customPermissions || []).map((p) =>
                    typeof p === 'object' ? p._id || p.id : p
                  );

                  const activeCount = perms.filter(
                    (p) =>
                      rolePermIds.includes(p._id) ||
                      (p.code && rolePermCodes.includes(p.code)) ||
                      customIds.includes(p._id)
                  ).length;

                  return (
                    <div key={mod} className="rounded-[6px] border border-border bg-card p-3 shadow-none">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-xs text-foreground capitalize">
                          Module: {mod}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
                          {activeCount}/{perms.length} quyền
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {perms.map((p) => {
                          const isFromRole =
                            rolePermIds.includes(p._id) || (p.code && rolePermCodes.includes(p.code));
                          const isCustom = customIds.includes(p._id);
                          const hasPerm = isFromRole || isCustom;

                          return (
                            <div
                              key={p._id}
                              className={`flex items-center justify-between gap-1.5 text-xs p-1.5 rounded-[4px] border transition-colors ${
                                hasPerm
                                  ? 'bg-muted/40 border-border text-foreground font-medium'
                                  : 'opacity-40 border-dashed border-border/40 text-muted-foreground'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <div
                                  className={`size-4 rounded-[3px] flex items-center justify-center shrink-0 ${
                                    hasPerm
                                      ? isCustom
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-emerald-600 text-white'
                                      : 'border border-border bg-muted/40'
                                  }`}
                                >
                                  {hasPerm && <CheckCircle2 size={12} className="text-white" />}
                                </div>
                                <span className="truncate" title={p.name}>
                                  {p.name}
                                </span>
                              </div>

                              {isCustom ? (
                                <span className="text-[9px] px-1 py-0.2 rounded-[3px] bg-blue-500/10 text-blue-600 shrink-0 font-semibold font-mono">
                                  Riêng
                                </span>
                              ) : isFromRole ? (
                                <span className="text-[9px] px-1 py-0.2 rounded-[3px] bg-emerald-500/10 text-emerald-600 shrink-0 font-semibold font-mono">
                                  Vai trò
                                </span>
                              ) : null}
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
            <div className="p-3 rounded-[6px] border border-blue-500/20 bg-blue-500/5 text-xs text-blue-700 dark:text-blue-400 leading-relaxed flex items-start gap-2">
              <ShieldCheck size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Cấp quyền riêng biệt (Custom Permissions):</strong> Bổ sung thêm các quyền đặc thù cho nhân viên này ngoài các quyền mặc định từ vai trò.
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(permissionsGrouped).map(([mod, perms]) => {
                const activeRole = roles.find(
                  (r) =>
                    (drawerStaff.roleId &&
                      (r._id === drawerStaff.roleId._id || r._id === drawerStaff.roleId)) ||
                    r.code === drawerStaff.role
                );
                const rolePerms = activeRole?.permissions || drawerStaff.roleId?.permissions || [];
                const rolePermIds = rolePerms.map((p) =>
                  typeof p === 'object' ? p._id || p.id : p
                );
                const rolePermCodes = rolePerms.map((p) =>
                  typeof p === 'object' ? p.code : p
                );

                return (
                  <div key={mod} className="rounded-[6px] border border-border bg-card p-3 shadow-none">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-xs text-foreground capitalize">
                        Module: {mod}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {perms.map((p) => {
                        const isInheritedFromRole =
                          rolePermIds.includes(p._id) || (p.code && rolePermCodes.includes(p.code));
                        const isChecked = customPermIds.includes(p._id);

                        if (isInheritedFromRole) {
                          return (
                            <div
                              key={p._id}
                              className="flex items-center justify-between gap-2 p-1.5 rounded-[4px] border border-emerald-500/30 bg-emerald-500/5 text-xs text-foreground cursor-not-allowed opacity-90"
                              title="Quyền này đã được cấp mặc định từ Vai trò"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <div className="size-4 rounded-[3px] bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                  <CheckCircle2 size={12} />
                                </div>
                                <span className="truncate">{p.name}</span>
                              </div>
                              <span className="text-[9px] px-1 py-0.2 rounded-[3px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shrink-0 font-semibold font-mono">
                                Từ vai trò (Đã có)
                              </span>
                            </div>
                          );
                        }

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
                              onChange={() => onToggleCustomPerm(p._id)}
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
                );
              })}
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
                onClick={onClearCustomPermissions}
                className="h-8 rounded-[6px] text-xs cursor-pointer"
              >
                Xóa tất cả quyền riêng
              </Button>
              <Button
                size="sm"
                onClick={onSaveCustomPermissions}
                disabled={isPending}
                className="h-8 rounded-[6px] text-xs font-semibold active:scale-[0.98] transition-transform cursor-pointer"
              >
                {isPending ? 'Đang lưu...' : 'Lưu Quyền Riêng'}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onToggleStatusClick(drawerStaff)}
                disabled={drawerStaff._id === currentAdminUser?._id}
                className={`h-8 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
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
                className="h-8 rounded-[6px] text-xs font-medium cursor-pointer"
                onClick={onClose}
              >
                Đóng Drawer
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
