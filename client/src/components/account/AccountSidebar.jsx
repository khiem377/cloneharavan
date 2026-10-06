'use client';

import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  ShieldCheck,
  User,
  MapPin,
  KeyRound,
  LogOut,
  Camera,
  Loader2,
  Shield,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

export default function AccountSidebar({
  user,
  displayName,
  initial,
  activeTab,
  handleTabChange,
  avatarUploading,
  avatarInputRef,
  addressesCount = 0,
  handleLogout,
}) {
  const navMenuItems = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'orders', label: 'Đơn hàng của tôi', icon: ShoppingBag },
    { id: 'warranty', label: 'Bảo hành & Thiết bị', icon: ShieldCheck },
    { id: 'profile', label: 'Thông tin cá nhân', icon: User },
    { id: 'addresses', label: 'Địa chỉ nhận hàng', icon: MapPin },
    { id: 'change-password', label: 'Đổi mật khẩu', icon: KeyRound },
  ];

  return (
    <Card className="p-4 space-y-4">
      {/* User Profile Mini Block */}
      <div className="flex items-center gap-3 pb-3.5 border-b border-slate-100">
        <div className="relative shrink-0">
          {user?.avatar?.url ? (
            <img
              src={user.avatar.url}
              alt={displayName}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-xs"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-bold text-base flex items-center justify-center uppercase shadow-xs">
              {initial}
            </div>
          )}
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={avatarUploading}
            className="absolute -bottom-1 -right-1 size-5 bg-white hover:bg-slate-50 border border-slate-200 rounded-full shadow-xs flex items-center justify-center cursor-pointer transition-transform active:scale-95 text-slate-600 hover:text-[#e30019]"
            title="Đổi ảnh đại diện"
          >
            {avatarUploading ? (
              <Loader2 size={10} className="animate-spin text-[#e30019]" />
            ) : (
              <Camera size={10} />
            )}
          </button>
        </div>

        <div className="min-w-0 flex-1 space-y-0.5">
          <h3 className="font-bold text-slate-900 text-xs truncate">
            {displayName}
          </h3>
          <p className="text-[11px] text-slate-500 font-mono truncate">
            {user?.phone
              ? `${user.phone.slice(0, 3)}****${user.phone.slice(-3)}`
              : user?.email || 'Tài khoản mua hàng'}
          </p>
          <div className="pt-0.5">
            <Badge
              variant="secondary"
              className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.2 rounded-[4px] bg-slate-100 text-slate-700 border border-slate-200"
            >
              <Shield size={9} className="text-[#e30019]" />
              <span>Thành viên SHOP</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-1">
        {navMenuItems.map((item) => {
          const IconComp = item.icon;
          const isActive = activeTab === item.id;
          return (
            <Button
              key={item.id}
              type="button"
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleTabChange(item.id)}
              className={`w-full justify-between px-3 py-2.5 h-auto text-xs font-medium rounded-[6px] transition active:scale-[0.98] ${
                isActive
                  ? 'bg-slate-900 text-white font-semibold shadow-xs hover:bg-slate-800'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <IconComp
                  size={15}
                  className={isActive ? 'text-white' : 'text-slate-400'}
                />
                <span>{item.label}</span>
              </div>
              {item.id === 'addresses' && addressesCount > 0 && (
                <Badge
                  variant={isActive ? 'outline' : 'secondary'}
                  className={`text-[10px] px-1.5 py-0.2 rounded-[4px] font-mono font-bold ${
                    isActive
                      ? 'bg-slate-800 text-slate-200 border-slate-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {addressesCount}
                </Badge>
              )}
            </Button>
          );
        })}

        <Separator className="my-2" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start gap-2.5 px-3 py-2.5 h-auto text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-[6px] active:scale-[0.98]"
        >
          <LogOut size={15} className="text-rose-500" />
          <span>Đăng xuất</span>
        </Button>
      </nav>
    </Card>
  );
}
