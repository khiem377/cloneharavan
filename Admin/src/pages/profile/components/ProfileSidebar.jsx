import React from 'react';
import {
  User,
  KeyRound,
  ShieldCheck,
  Globe,
  LogOut,
  Camera,
  Loader2,
  Laptop,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import PasskeyIcon from '@/components/ui/PasskeyIcon';
import { cn } from '@/lib/utils';

export const PROFILE_TABS = [
  { id: 'profile', label: 'Thông tin cá nhân', icon: User },
  { id: 'password', label: 'Đổi mật khẩu', icon: KeyRound },
  { id: 'passkey', label: 'Khóa bảo mật Passkey', icon: PasskeyIcon },
  { id: 'sessions', label: 'Phiên đăng nhập & Thiết bị', icon: Laptop },
  { id: 'permissions', label: 'Quyền hạn được gán', icon: ShieldCheck },
  { id: 'social', label: 'Liên kết mạng xã hội', icon: Globe },
];

/**
 * Sidebar Navigation & Avatar card for Admin Profile
 */
export default function ProfileSidebar({
  user,
  activeTab,
  onSelectTab,
  onLogout,
  avatarLoading,
  avatarInputRef,
  onAvatarChange,
}) {
  const getAvatarLetter = (name) => {
    if (!name) return 'A';
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <Card className="rounded-[6px] border border-border bg-card p-5 shadow-xs">
      <div className="flex flex-col items-center text-center space-y-3">
        {/* Avatar with Upload button */}
        <div className="relative group">
          <div className="size-20 rounded-full border-2 border-border overflow-hidden bg-primary/10 flex items-center justify-center font-bold text-2xl text-primary select-none">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName || 'Admin'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{getAvatarLetter(user?.fullName)}</span>
            )}
          </div>

          <input
            type="file"
            ref={avatarInputRef}
            onChange={onAvatarChange}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={avatarLoading}
            className="absolute bottom-0 right-0 size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs hover:bg-primary/90 transition-transform active:scale-95 cursor-pointer"
            title="Đổi ảnh đại diện"
          >
            {avatarLoading ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <Camera size={11} />
            )}
          </button>
        </div>

        {/* User Info */}
        <div className="space-y-1 min-w-0 w-full">
          <h2 className="font-bold text-sm text-foreground truncate">
            {user?.fullName || 'Quản trị viên'}
          </h2>
          <p className="text-xs text-muted-foreground font-mono truncate">
            {user?.email || 'admin@shop.vn'}
          </p>
          <div className="pt-1 flex items-center justify-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono text-emerald-600 font-medium">
              Đang hoạt động
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="pt-4 space-y-1">
        {PROFILE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-[6px] transition-all cursor-pointer active:scale-[0.98]',
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  size={14}
                  className={isActive ? 'text-primary-foreground' : 'text-muted-foreground'}
                />
                <span>{tab.label}</span>
              </div>
            </button>
          );
        })}

        <Separator className="my-2" />

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-[6px] transition-colors cursor-pointer active:scale-[0.98]"
        >
          <LogOut size={14} className="shrink-0" />
          <span>Đăng xuất hệ thống</span>
        </button>
      </nav>
    </Card>
  );
}
