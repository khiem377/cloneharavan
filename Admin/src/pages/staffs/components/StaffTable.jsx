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
  Eye,
} from '@/components/ui/Icons';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DataTablePagination from '@/components/ui/DataTablePagination';
import Can from '@/components/auth/Can';

const formatShortDate = (d) => {
  if (!d) return '—';
  try {
    const dt = new Date(d);
    return `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${dt.getFullYear()}`;
  } catch {
    return '—';
  }
};

/**
 * Staff Data Table with responsive columns, permissions badges & actions
 */
export default function StaffTable({
  staffs = [],
  isLoading,
  currentAdminUser,
  isColumnVisible,
  pagination,
  setPage,
  setPageSize,
  onOpenDrawer,
  onOpenEditRole,
  onOpenResetPass,
  onToggleStatus,
}) {
  return (
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
                                onClick={() => onOpenDrawer(user, 'preview')}
                                className="font-semibold text-xs text-foreground truncate hover:text-primary transition-colors text-left cursor-pointer"
                                title="Bấm để xem hồ sơ và ma trận quyền hạn"
                              >
                                {user.fullName || 'Nhân viên chưa đặt tên'}
                              </button>
                              {isSelf && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] font-semibold px-1.5 py-0.2 rounded-[6px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                                >
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
                            <span className="text-muted-foreground/60 italic text-[11px]">
                              Chưa có SĐT
                            </span>
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
                            onClick={() => onOpenDrawer(user, 'preview')}
                            className="h-6 px-2 text-[11px] font-semibold rounded-[6px] border bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20 transition-all gap-1 cursor-pointer"
                            title="Bấm để mở Drawer ma trận quyền hạn"
                          >
                            <Shield size={12} /> {roleName}
                            <Eye size={11} className="opacity-60 ml-0.5" />
                          </Button>

                          {hasCustom && (
                            <Badge
                              variant="outline"
                              onClick={() => onOpenDrawer(user, 'custom_perms')}
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
                              {new Date(user.lastLoginAt).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              • {formatShortDate(user.lastLoginAt)}
                            </span>
                            <span className="text-[11px] text-muted-foreground/80">
                              IP: {user.lastLoginIp || '127.0.0.1'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60 italic text-[11px]">
                            Chưa đăng nhập
                          </span>
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
                              onClick={() => onOpenEditRole(user)}
                              className="size-7 rounded-[6px] text-muted-foreground hover:text-foreground cursor-pointer"
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
                              className="size-7 rounded-[6px] text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Cấp quyền riêng biệt (Custom Permissions)"
                            >
                              <ShieldCheck size={13} />
                            </Button>
                          </Can>

                          <Can permission="user.edit">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onOpenResetPass(user)}
                              className="size-7 rounded-[6px] text-muted-foreground hover:text-foreground cursor-pointer"
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
                              className={`size-7 rounded-[6px] cursor-pointer ${
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
                                  ? 'Khóa tài khoản'
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
  );
}
