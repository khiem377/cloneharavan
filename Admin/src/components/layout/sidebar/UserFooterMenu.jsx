import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronsUpDownIcon,
  UserIcon,
  KeyIcon,
  LogOutIcon,
} from '@/components/ui/Icons';
import useAuthStore from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { toast } from '@/providers/ToastProvider';
import { SidebarMenuButton } from '@/components/ui/sidebar';

export default function UserFooterMenu({ onProfile, onChangePass }) {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const initials = (user?.fullName?.[0] || user?.email?.[0] || 'A').toUpperCase();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {}
    clearAuth();
    navigate('/login');
    toast.info('Đã đăng xuất');
  };

  return (
    <div className="relative w-full">
      <SidebarMenuButton
        onClick={() => setOpen((o) => !o)}
        className="w-full justify-between rounded-[6px] border border-border/60 bg-surface/50 hover:bg-accent/60 p-2 h-auto active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          {user?.avatar?.url ? (
            <img
              src={user.avatar.url}
              alt={user.fullName || 'Avatar'}
              referrerPolicy="no-referrer"
              className="size-8 shrink-0 rounded-[6px] object-cover border border-border"
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-primary text-primary-foreground text-xs font-bold font-mono">
              {initials}
            </div>
          )}
          <div className="flex flex-col text-left overflow-hidden min-w-0">
            <span className="truncate text-xs font-semibold text-foreground">{user?.fullName || 'Quản trị viên'}</span>
            <span className="truncate text-[10px] text-muted-foreground font-mono">{user?.email || 'admin@haravan.vn'}</span>
          </div>
        </div>
        <ChevronsUpDownIcon size={14} className="shrink-0 text-muted-foreground ml-1" />
      </SidebarMenuButton>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 z-50 mb-2 w-60 rounded-[6px] border border-border bg-card text-card-foreground shadow-sm py-1 divide-y divide-border">
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              {user?.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  alt={user.fullName || 'Avatar'}
                  referrerPolicy="no-referrer"
                  className="size-8 shrink-0 rounded-[6px] object-cover border border-border"
                />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-primary text-primary-foreground text-xs font-bold font-mono">
                  {initials}
                </div>
              )}
              <div className="flex-1 overflow-hidden min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">{user?.fullName || 'Quản trị viên'}</p>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 font-medium">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Đang hoạt động
                </span>
              </div>
            </div>

            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate('/profile?tab=profile');
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                <UserIcon size={14} className="text-muted-foreground shrink-0" />
                Hồ sơ & Tài khoản
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate('/profile?tab=password');
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                <KeyIcon size={14} className="text-muted-foreground shrink-0" />
                Đổi mật khẩu & Bảo mật
              </button>
            </div>

            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <LogOutIcon size={14} className="shrink-0" />
                Đăng xuất hệ thống
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
