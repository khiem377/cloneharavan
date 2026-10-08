'use client';

import React from 'react';
import Link from 'next/link';
import { Search, PackageSearch, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

export default function AccountOrdersTab({
  orderSearch,
  setOrderSearch,
  orderFilter,
  setOrderFilter,
}) {
  const filterTabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Chờ xác nhận' },
    { id: 'processing', label: 'Đang xử lý' },
    { id: 'shipping', label: 'Đang giao hàng' },
    { id: 'completed', label: 'Đã hoàn tất' },
    { id: 'cancelled', label: 'Đã hủy' },
  ];

  return (
    <Card className="animate-fadeIn">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        <div>
          <CardTitle>Đơn hàng của tôi</CardTitle>
          <CardDescription className="mt-0.5">
            Theo dõi tiến độ giao hàng và lịch sử đơn hàng đã đặt
          </CardDescription>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            type="text"
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            placeholder="Tìm mã đơn hoặc sản phẩm..."
            className="h-8 pl-8 text-xs rounded-[6px]"
          />
        </div>
      </CardHeader>
      <Separator className="mb-4" />

      <CardContent className="space-y-4">
        {/* Filter Status Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-slate-100">
          {filterTabs.map((tab) => (
            <Button
              key={tab.id}
              type="button"
              variant={orderFilter === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setOrderFilter(tab.id)}
              className={`h-7 px-3 text-xs rounded-[6px] transition whitespace-nowrap active:scale-[0.98] ${
                orderFilter === tab.id
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs hover:bg-slate-800'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Orders Empty State */}
        <div className="py-14 text-center text-slate-400 space-y-3">
          <div className="w-12 h-12 rounded-[6px] bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-300">
            <PackageSearch size={22} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">
              Chưa tìm thấy đơn hàng nào
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Đơn hàng của bạn sẽ hiển thị tại đây sau khi bạn đặt mua sản phẩm.
            </p>
          </div>
          <Button
            asChild
            size="sm"
            className="bg-[#e30019] hover:bg-[#c40015] text-white text-xs font-semibold rounded-[6px] h-9 px-4 shadow-xs active:scale-[0.98]"
          >
            <Link href="/" className="inline-flex items-center gap-1.5">
              <span>Khám phá sản phẩm ngay</span>
              <ArrowRight size={13} />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
