import React from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Edit3,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Shield,
  KeyRound,
  Warehouse,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import Can from '@/components/auth/Can';
import StaffRoleBadge from './StaffRoleBadge';
import { RoleKeyCustomIcon } from './RoleCustomIcons';

const formatShortDate = (d) => {
  if (!d) return '—';
  try {
    const dt = new Date(d);
    return `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth() + 1).toString().padStart(2, '0')}/${dt.getFullYear()}`;
  } catch {
    return '—';
  }
};

const getRoleDisplayName = (user) => {
  if (user.roleId?.name) return user.roleId.name;
  const r = (user.role || '').toLowerCase();
  if (r === 'admin' || r === 'administrator') return 'Quản trị viên';
  if (r === 'manager') return 'Quản lý cửa hàng';
  if (r === 'inventory_manager') return 'Quản lý kho vận';
  if (r === 'staff') return 'Nhân viên bán hàng';
  if (r === 'customer_care') return 'Chăm sóc khách hàng';
  if (r === 'content_editor') return 'Biên tập viên';
  return user.role;
};

export default function StaffTableRow({
  user,
  currentAdminUser,
  isColumnVisible,
  onOpenDrawer,
  onOpenEditRole,
  onOpenResetPass,
  onToggleStatus,
}) {
  const roleName = getRoleDisplayName(user);
  const isSelf = user._id === currentAdminUser?._id;

  return (
    <TableRow className="group hover:bg-muted/30 transition-colors border-b border-border/70">
      {isColumnVisible('staff') && (
        <TableCell className="p-3">
          <div className="flex items-center gap-2.5">
            <div className="size-7.5 rounded-[6px] bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 uppercase text-xs font-mono">
              {user.fullName?.[0] || user.email?.[0] || 'S'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onOpenDrawer(user, 'preview')}
                  className="font-semibold text-xs text-foreground truncate hover:text-[#e30019] transition-colors text-left cursor-pointer"
                  title="Bấm để xem hồ sơ và ma trận quyền hạn"
                >
                  {user.fullName || 'Nhân viên chưa đặt tên'}
                </button>
                {isSelf && (
                  <Badge variant="outline" className="text-[10px] font-semibold px-1.5 py-0.2 rounded-[6px] bg-amber-50 text-amber-700 border-amber-200">
                    Bạn
                  </Badge>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground block font-mono tabular-nums">
                ID: {user._id.slice(-8)}
              </span>
            </div>
          </div>
        </TableCell>
      )}

      {isColumnVisible('contact') && (
        <TableCell className="p-3 text-muted-foreground">
          <div className="flex flex-col gap-0.5 text-xs">
            <span className="flex items-center gap-1.5 text-foreground font-medium truncate max-w-[200px]">
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

      {isColumnVisible('role') && (
        <TableCell className="p-3">
          <StaffRoleBadge user={user} roleName={roleName} onOpenDrawer={onOpenDrawer} />
        </TableCell>
      )}

      {isColumnVisible('warehouse') && (
        <TableCell className="p-3">
          {user.assignedWarehouseId?.name ? (
            <Badge variant="outline" className="text-[11px] font-semibold px-2 py-0.5 rounded-[6px] border-slate-200 bg-slate-50 text-slate-700 flex items-center gap-1 w-fit">
              <Warehouse size={11} className="shrink-0" />
              <span className="truncate max-w-[150px]">{user.assignedWarehouseId.name}</span>
            </Badge>
          ) : ['admin', 'administrator'].includes(user.role) ? (
            <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
              <Shield size={11} className="text-slate-400" />
              Toàn hệ thống
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground/60 italic">Chưa phân kho</span>
          )}
        </TableCell>
      )}

      {isColumnVisible('lastLogin') && (
        <TableCell className="p-3 text-muted-foreground">
          {user.lastLoginAt ? (
            <div className="flex flex-col gap-0.5 text-xs font-mono tabular-nums">
              <span className="text-foreground font-medium">
                {new Date(user.lastLoginAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • {formatShortDate(user.lastLoginAt)}
              </span>
              <span className="text-[11px] text-muted-foreground/80">IP: {user.lastLoginIp || '127.0.0.1'}</span>
            </div>
          ) : (
            <span className="text-muted-foreground/60 italic text-[11px]">Chưa đăng nhập</span>
          )}
        </TableCell>
      )}

      {isColumnVisible('createdAt') && (
        <TableCell className="p-3 text-muted-foreground font-mono tabular-nums text-xs whitespace-nowrap">
          {formatShortDate(user.createdAt)}
        </TableCell>
      )}

      {isColumnVisible('status') && (
        <TableCell className="p-3 text-center">
          <Badge
            variant="outline"
            className={`rounded-[6px] text-[11px] font-semibold px-2 py-0.5 ${
              user.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {user.isActive ? (
              <><CheckCircle2 size={11} className="mr-1 text-emerald-600" /> Hoạt động</>
            ) : (
              <><XCircle size={11} className="mr-1 text-rose-600" /> Đã khóa</>
            )}
          </Badge>
        </TableCell>
      )}

      {isColumnVisible('actions') && (
        <TableCell className="p-3 text-right sticky right-0 z-10 bg-card group-hover:bg-slate-50/95 dark:bg-card dark:group-hover:bg-muted/80 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.08)] border-l border-border/70">
          <div className="flex items-center justify-end gap-1">
            <Can permission="role.assign">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenEditRole(user)}
                className="size-7 rounded-[6px] text-muted-foreground hover:text-foreground cursor-pointer active:scale-[0.98]"
                title="Đổi vai trò nhân viên"
              >
                <Edit3 size={13} />
              </Button>
            </Can>

            <Can permission="role.assign">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenDrawer(user, 'custom_perms')}
                className="size-7 rounded-[6px] text-muted-foreground hover:text-foreground cursor-pointer active:scale-[0.98]"
                title="Cấp quyền riêng biệt"
              >
                <RoleKeyCustomIcon size={13} />
              </Button>
            </Can>

            <Can permission="user.edit">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenResetPass(user)}
                className="size-7 rounded-[6px] text-muted-foreground hover:text-foreground cursor-pointer active:scale-[0.98]"
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
                onClick={() => onToggleStatus(user)}
                className={`size-7 rounded-[6px] cursor-pointer active:scale-[0.98] ${
                  isSelf
                    ? 'opacity-30 cursor-not-allowed text-muted-foreground'
                    : user.isActive
                    ? 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
                    : 'text-emerald-600 hover:bg-emerald-50'
                }`}
                title={isSelf ? 'Không thể khóa tài khoản của chính mình' : user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
              >
                {user.isActive ? <Lock size={13} /> : <Unlock size={13} />}
              </Button>
            </Can>
          </div>
        </TableCell>
      )}
    </TableRow>
  );
}
