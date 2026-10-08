'use client';

import React from 'react';
import {
  ShoppingBag,
  Truck,
  MapPin,
  ShieldCheck,
  PackageSearch,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

export default function AccountOverviewTab({
  user,
  displayName,
  initial,
  handleTabChange,
  addresses = [],
  defaultAddress,
  handleOpenAddAddress,
}) {
  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Welcome Card */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {user?.avatar?.url ? (
              <img
                src={user.avatar.url}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="w-13 h-13 rounded-full object-cover border border-slate-200 shadow-xs"
              />
            ) : (
              <div className="w-13 h-13 rounded-full bg-slate-900 text-white font-bold text-lg flex items-center justify-center uppercase shadow-xs">
                {initial}
              </div>
            )}
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-slate-900">
                  Xin chào, {displayName}!
                </h2>
                <Badge
                  variant="secondary"
                  className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-[4px]"
                >
                  Tài khoản hoạt động
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                Quản lý đơn hàng, theo dõi bảo hành và địa chỉ giao nhận tiện lợi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleTabChange('profile')}
              className="text-xs rounded-[6px] h-9 px-3.5 active:scale-[0.98]"
            >
              Hồ sơ cá nhân
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => handleTabChange('orders')}
              className="bg-[#e30019] hover:bg-[#c40015] text-white text-xs rounded-[6px] h-9 px-4 shadow-xs active:scale-[0.98]"
            >
              Đơn hàng
            </Button>
          </div>
        </div>
      </Card>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <Card
          onClick={() => handleTabChange('orders')}
          className="p-4 hover:border-slate-300 transition cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-[6px] bg-red-50 text-[#e30019] border border-red-100">
              <ShoppingBag size={18} />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">
                Đơn hàng
              </span>
              <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                0 đơn
              </span>
            </div>
          </div>
        </Card>

        <Card
          onClick={() => handleTabChange('orders')}
          className="p-4 hover:border-slate-300 transition cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-[6px] bg-blue-50 text-blue-600 border border-blue-100">
              <Truck size={18} />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">
                Đang giao
              </span>
              <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                0 đơn
              </span>
            </div>
          </div>
        </Card>

        <Card
          onClick={() => handleTabChange('addresses')}
          className="p-4 hover:border-slate-300 transition cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-[6px] bg-emerald-50 text-emerald-600 border border-emerald-100">
              <MapPin size={18} />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">
                Địa chỉ nhận hàng
              </span>
              <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                {addresses.length} địa chỉ
              </span>
            </div>
          </div>
        </Card>

        <Card
          onClick={() => handleTabChange('warranty')}
          className="p-4 hover:border-slate-300 transition cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-[6px] bg-amber-50 text-amber-600 border border-amber-100">
              <ShieldCheck size={18} />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">
                Bảo hành
              </span>
              <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                0 thiết bị
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Default Address & Recent Orders Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Default Address Preview */}
        <Card className="md:col-span-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <MapPin size={13} className="text-[#e30019]" />
                <span>Địa chỉ mặc định</span>
              </CardTitle>
              <Button
                variant="link"
                size="sm"
                onClick={() => handleTabChange('addresses')}
                className="text-[11px] text-[#e30019] h-auto p-0 hover:underline"
              >
                Thay đổi
              </Button>
            </div>

            {defaultAddress ? (
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <span>{defaultAddress.fullName}</span>
                  <span className="text-slate-300 font-normal">|</span>
                  <span className="font-mono text-slate-600 font-normal">
                    {defaultAddress.phone}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {defaultAddress.detailAddress}, {defaultAddress.ward},{' '}
                  {defaultAddress.district}, {defaultAddress.province}
                </p>
              </div>
            ) : (
              <div className="mt-4 text-center py-4 text-slate-400 text-xs">
                <p>Chưa có địa chỉ mặc định.</p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleOpenAddAddress}
                  className="mt-1 text-[#e30019] text-xs h-auto p-0 hover:underline"
                >
                  + Thêm địa chỉ mới
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Orders Overview */}
        <Card className="md:col-span-2 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <ShoppingBag size={13} className="text-[#e30019]" />
                <span>Đơn hàng gần đây</span>
              </CardTitle>
              <Button
                variant="link"
                size="sm"
                onClick={() => handleTabChange('orders')}
                className="text-[11px] text-[#e30019] h-auto p-0 hover:underline"
              >
                Xem tất cả
              </Button>
            </div>

            <div className="py-8 text-center text-slate-400 text-xs space-y-2">
              <div className="w-10 h-10 rounded-[6px] bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-300">
                <PackageSearch size={18} />
              </div>
              <p className="text-slate-500">Bạn chưa có đơn hàng nào trong 30 ngày qua.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
