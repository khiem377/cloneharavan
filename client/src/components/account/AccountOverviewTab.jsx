'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import OverviewDefaultAddressCard from './overview/OverviewDefaultAddressCard';
import OverviewRecentOrdersCard from './overview/OverviewRecentOrdersCard';
import {
  StatOrdersIcon,
  StatShippingIcon,
  StatAddressIcon,
  StatWarrantyIcon,
  ShopMemberInsignia,
} from './AccountIcons';

export default function AccountOverviewTab({
  user,
  displayName,
  initial,
  handleTabChange,
  addresses = [],
  defaultAddress,
  handleOpenAddAddress,
  orders = [],
}) {
  const formatPrice = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const totalOrdersCount = orders.length;
  const shippingOrdersCount = orders.filter((o) => o.orderStatus === 'SHIPPING').length;
  const recentOrders = orders.slice(0, 3);

  return (
    <div className="space-y-5 animate-fadeIn">
      <Card className="p-5 shadow-none border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Avatar className="size-13 border border-slate-200">
              <AvatarImage src={user?.avatar?.url} alt={displayName} referrerPolicy="no-referrer" />
              <AvatarFallback className="bg-slate-900 text-white font-bold text-lg uppercase">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-slate-900">
                  Xin chào, {displayName}!
                </h2>
                <Badge
                  variant="secondary"
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-[4px] bg-amber-50 text-amber-800 border border-amber-200/90 shadow-2xs"
                >
                  <ShopMemberInsignia size={12} className="text-amber-600" />
                  <span>Khách hàng thành viên</span>
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                Chúc bạn một ngày mua sắm tuyệt vời tại hệ thống của chúng tôi!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTabChange('profile')}
              className="text-xs rounded-[6px] h-8 border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Hồ sơ
            </Button>
            <Button
              size="sm"
              onClick={() => handleTabChange('orders')}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs rounded-[6px] h-8 gap-1"
            >
              <span>Đơn hàng</span>
              <ArrowRight size={12} />
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card
          onClick={() => handleTabChange('orders')}
          className="p-4 cursor-pointer hover:border-slate-300 transition-colors shadow-none border-slate-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[6px] bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <StatOrdersIcon size={19} className="text-slate-700" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">
                Tổng đơn mua
              </span>
              <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
                {totalOrdersCount}
              </span>
            </div>
          </div>
        </Card>

        <Card
          onClick={() => handleTabChange('orders')}
          className="p-4 cursor-pointer hover:border-slate-300 transition-colors shadow-none border-slate-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[6px] bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <StatShippingIcon size={19} className="text-slate-700" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">
                Đang giao hàng
              </span>
              <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
                {shippingOrdersCount}
              </span>
            </div>
          </div>
        </Card>

        <Card
          onClick={() => handleTabChange('addresses')}
          className="p-4 cursor-pointer hover:border-slate-300 transition-colors shadow-none border-slate-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[6px] bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <StatAddressIcon size={19} className="text-slate-700" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">
                Sổ địa chỉ
              </span>
              <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
                {addresses.length}
              </span>
            </div>
          </div>
        </Card>

        <Card
          onClick={() => handleTabChange('warranty')}
          className="p-4 cursor-pointer hover:border-slate-300 transition-colors shadow-none border-slate-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[6px] bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <StatWarrantyIcon size={19} className="text-slate-700" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">
                Bảo hành
              </span>
              <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
                0
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <OverviewDefaultAddressCard
          defaultAddress={defaultAddress}
          handleTabChange={handleTabChange}
          handleOpenAddAddress={handleOpenAddAddress}
        />

        <OverviewRecentOrdersCard
          recentOrders={recentOrders}
          handleTabChange={handleTabChange}
          formatPrice={formatPrice}
          formatDate={formatDate}
        />
      </div>
    </div>
  );
}
