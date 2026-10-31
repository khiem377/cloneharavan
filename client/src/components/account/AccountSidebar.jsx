'use client';

import React from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getDisplayAccountIdentifier } from '@/utils/userUtils';
import {
  NavOverviewIcon,
  NavOrdersIcon,
  NavAddressIcon,
  NavWarrantyIcon,
  NavProfileIcon,
  NavSecurityIcon,
  NavLogoutIcon,
  ShopMemberInsignia,
} from './AccountIcons';

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
  const accountNav = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: NavProfileIcon },
    { id: 'security', label: 'Mật khẩu và bảo mật', icon: NavSecurityIcon, alias: ['change-password'] },
  ];

  const shoppingNav = [
    { id: 'overview', label: 'Tổng quan', icon: NavOverviewIcon },
    { id: 'orders', label: 'Đơn hàng của tôi', icon: NavOrdersIcon },
    { id: 'addresses', label: 'Địa chỉ nhận hàng', icon: NavAddressIcon },
    { id: 'warranty', label: 'Bảo hành & Thiết bị', icon: NavWarrantyIcon },
  ];

  const renderNavGroup = (items, title) => (
    <div className="space-y-1">
      {title && (
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 font-mono">
          {title}
        </p>
      )}
      {items.map((item) => {
        const IconComp = item.icon;
        const isActive =
          activeTab === item.id || (item.alias && item.alias.includes(activeTab));
        return (
          <Button
            key={item.id}
            type="button"
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleTabChange(item.id)}
            className={`w-full justify-between px-3 py-2 h-auto text-xs font-medium rounded-[6px] transition active:scale-[0.98] ${
              isActive
                ? 'bg-slate-900 text-white font-semibold hover:bg-slate-800'
                : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <IconComp
                size={15}
                active={isActive}
                className={isActive ? 'text-white' : 'text-slate-500'}
              />
              <span>{item.label}</span>
            </div>
            {item.id === 'addresses' && addressesCount > 0 && (
              <Badge
                variant={isActive ? 'outline' : 'secondary'}
                className={`text-[10px] px-1.5 py-0 rounded-[4px] font-mono font-bold ${
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
    </div>
  );

  return (
    <Card className="p-4 space-y-4 rounded-[6px] border border-slate-200 bg-white shadow-none">
      <div className="flex items-center gap-3 pb-3.5 border-b border-slate-100">
        <div className="relative shrink-0">
          <Avatar className="size-11 border border-slate-200">
            <AvatarImage src={user?.avatar?.url} alt={displayName} referrerPolicy="no-referrer" />
            <AvatarFallback className="bg-slate-900 text-white font-bold text-sm uppercase">
              {initial}
            </AvatarFallback>
          </Avatar>
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            onClick={() => avatarInputRef.current?.click()}
            disabled={avatarUploading}
            className="absolute -bottom-1 -right-1 size-5 bg-white hover:bg-slate-50 border border-slate-200 rounded-full p-0 flex items-center justify-center text-slate-600 hover:text-slate-900"
            title="Đổi ảnh đại diện"
          >
            {avatarUploading ? (
              <Loader2 size={10} className="animate-spin text-slate-900" />
            ) : (
              <Camera size={10} />
            )}
          </Button>
        </div>

        <div className="min-w-0 flex-1 space-y-0.5">
          <h3 className="font-bold text-slate-900 text-xs truncate">
            {displayName}
          </h3>
          <p className="text-[11px] text-slate-500 font-mono truncate">
            {getDisplayAccountIdentifier(user)}
          </p>
          <div className="pt-0.5">
            <Badge
              variant="secondary"
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-[4px] bg-amber-50 text-amber-800 border border-amber-200/90 shadow-2xs"
            >
              <ShopMemberInsignia size={12} className="text-amber-600" />
              <span>Thành viên SHOP</span>
            </Badge>
          </div>
        </div>
      </div>

      <nav className="space-y-4">
        {renderNavGroup(accountNav, 'Tài khoản')}
        <Separator className="bg-slate-100" />
        {renderNavGroup(shoppingNav, 'Mua hàng')}
        <Separator className="bg-slate-100" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start gap-2.5 px-3 py-2 h-auto text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-[6px] active:scale-[0.98]"
        >
          <NavLogoutIcon size={15} className="text-rose-500" />
          <span>Đăng xuất</span>
        </Button>
      </nav>
    </Card>
  );
}
