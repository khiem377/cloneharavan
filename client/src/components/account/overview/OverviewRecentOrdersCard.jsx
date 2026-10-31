'use client';

import React from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OverviewReceiptIcon, StatOrdersIcon } from '../AccountIcons';

const ORDER_STATUS_MAP = {
  PENDING: { label: 'Chờ xác nhận', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  CONFIRMED: { label: 'Đang xử lý', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  SHIPPING: { label: 'Đang giao hàng', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' },
  DELIVERED: { label: 'Đã hoàn tất', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CANCELLED: { label: 'Đã hủy', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
  RETURNED: { label: 'Đã hoàn hàng', badgeClass: 'bg-orange-50 text-orange-700 border-orange-200' },
};

export default function OverviewRecentOrdersCard({
  recentOrders = [],
  handleTabChange,
  formatPrice,
  formatDate,
}) {
  return (
    <Card className="md:col-span-2 p-4 flex flex-col justify-between shadow-none border-slate-200">
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <CardTitle className="text-xs flex items-center gap-1.5 font-bold text-slate-800">
            <OverviewReceiptIcon size={14} className="text-[#e30019]" />
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

        {recentOrders.length > 0 ? (
          <div className="mt-2 divide-y divide-slate-100">
            {recentOrders.map((order) => {
              const statusMeta = ORDER_STATUS_MAP[order.orderStatus] || {
                label: order.orderStatus,
                badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
              };
              const firstItem = order.items?.[0];
              const extraCount = (order.items?.length || 1) - 1;

              return (
                <div
                  key={order._id}
                  onClick={() => handleTabChange('orders')}
                  className="py-3 first:pt-2 last:pb-0 flex items-center justify-between gap-3 cursor-pointer group hover:bg-slate-50/50 -mx-2 px-2 rounded-[6px] transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-[6px] border border-slate-200 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
                      {firstItem?.thumbnail ? (
                        <img
                          src={firstItem.thumbnail}
                          alt={firstItem.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <StatOrdersIcon size={16} className="text-slate-300" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs font-mono text-slate-900 group-hover:text-[#e30019] transition">
                          #{order.orderCode}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-medium border px-1.5 py-0 rounded-[3px] ${statusMeta.badgeClass}`}
                        >
                          {statusMeta.label}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {firstItem?.productName || 'Sản phẩm'}
                        {extraCount > 0 && ` và ${extraCount} sản phẩm khác`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold font-mono text-slate-900">
                      {formatPrice(order.pricing?.totalAmount)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs space-y-2">
            <div className="w-10 h-10 rounded-[6px] bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-300">
              <StatOrdersIcon size={18} />
            </div>
            <p className="text-slate-500">Bạn chưa có đơn hàng nào trong 30 ngày qua.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
