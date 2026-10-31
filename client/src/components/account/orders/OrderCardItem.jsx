'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Copy,
  Check,
  ShoppingBag,
  ArrowRight,
  MapPin,
  Truck,
  Eye,
  Ban,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function OrderCardItem({
  order,
  statusMeta,
  paymentMeta,
  canCancel,
  isCancelling,
  trackingLoadingId,
  copiedCode,
  onCopyCode,
  onSelectOrder,
  onTrackShipment,
  onCancelOrder,
  formatPrice,
  formatDate,
}) {
  return (
    <Card className="rounded-[6px] border-slate-200 bg-white overflow-hidden shadow-2xs hover:shadow-xs transition">
      <div className="bg-slate-50/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={() => onSelectOrder(order)}
            className="h-auto p-0 font-semibold text-slate-900 font-mono hover:text-blue-600 hover:underline"
            title="Bấm để xem chi tiết đơn hàng"
          >
            #{order.orderCode}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => onCopyCode(order.orderCode, e)}
            title="Sao chép mã đơn"
            className="h-5 w-5 p-0 text-slate-400 hover:text-slate-700"
          >
            {copiedCode === order.orderCode ? (
              <Check size={12} className="text-emerald-600" />
            ) : (
              <Copy size={12} />
            )}
          </Button>

          <Separator orientation="vertical" className="h-3 bg-slate-300" />

          <span className="text-slate-500 flex items-center gap-1">
            <Calendar size={12} />
            {formatDate(order.createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={`text-[11px] font-medium border px-2 py-0.5 rounded-[4px] ${statusMeta.badgeClass}`}>
            {statusMeta.label}
          </Badge>
          <Badge variant="outline" className={`text-[10px] font-normal border px-1.5 py-0.5 rounded-[4px] ${paymentMeta.badgeClass}`}>
            {paymentMeta.label}
          </Badge>
        </div>
      </div>

      <div className="p-4 divide-y divide-slate-100">
        {(order.items || []).slice(0, 2).map((item, idx) => (
          <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3.5">
            <div className="w-14 h-14 rounded-[6px] border border-slate-200 overflow-hidden shrink-0 bg-slate-50 flex items-center justify-center">
              {item.thumbnail ? (
                <img src={item.thumbnail} alt={item.productName} className="w-full h-full object-cover" />
              ) : (
                <ShoppingBag size={20} className="text-slate-300" />
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <h4 className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug">
                {item.productName}
              </h4>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                {item.variantName && (
                  <Badge variant="outline" className="px-1.5 py-0.5 rounded-[3px] text-slate-600 border-slate-200 font-normal">
                    {item.variantName}
                  </Badge>
                )}
                {item.sku && (
                  <span className="text-slate-400 font-mono">
                    SKU: {item.sku}
                  </span>
                )}
                {item.isGift && (
                  <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200 px-1.5 py-0.5 rounded-[3px] font-medium text-[10px]">
                    Quà tặng: {item.giftProgramName || 'Miễn phí'}
                  </Badge>
                )}
              </div>
              <div className="text-[11px] text-slate-500">
                Số lượng: <span className="font-semibold text-slate-700 font-mono tabular-nums">{item.quantity}</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs font-bold text-slate-900 font-mono tabular-nums">
                {formatPrice(item.lineTotal || item.unitPrice * item.quantity)}
              </div>
              {item.quantity > 1 && (
                <div className="text-[10px] text-slate-400 font-mono tabular-nums">
                  {formatPrice(item.unitPrice)} / cái
                </div>
              )}
            </div>
          </div>
        ))}

        {(order.items || []).length > 2 && (
          <div className="pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSelectOrder(order)}
              className="w-full text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-[6px] border-dashed border-slate-200 flex items-center justify-center gap-1.5"
            >
              <ShoppingBag size={13} className="text-slate-400" />
              <span>Xem thêm {(order.items || []).length - 2} sản phẩm khác trong đơn</span>
              <ArrowRight size={12} className="text-slate-400" />
            </Button>
          </div>
        )}
      </div>

      <div className="bg-slate-50/60 p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="text-[11px] text-slate-500 max-w-sm">
          <div className="flex items-center gap-1 font-medium text-slate-700">
            <MapPin size={12} className="text-slate-400" />
            <span>Giao đến: {order.shippingAddress?.fullName}</span>
            <Separator orientation="vertical" className="h-3 bg-slate-300" />
            <span className="font-mono">{order.shippingAddress?.phone}</span>
          </div>
          <p className="line-clamp-1 mt-0.5 text-slate-500 pl-4">
            {order.shippingAddress?.detailAddress}, {order.shippingAddress?.ward},{' '}
            {order.shippingAddress?.district}, {order.shippingAddress?.province}
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">Tổng thanh toán:</span>
            <span className="text-sm font-bold text-red-600 font-mono tabular-nums">
              {formatPrice(order.pricing?.totalAmount)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={trackingLoadingId === order._id}
              onClick={() => onTrackShipment(order)}
              className="h-8 px-3 text-xs rounded-[6px] bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-2xs"
            >
              {trackingLoadingId === order._id ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Truck size={13} />
              )}
              <span>Theo dõi đơn</span>
            </Button>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs rounded-[6px] border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs"
            >
              <Link href={`/tai-khoan/don-hang/${order.orderCode || order._id}`} className="inline-flex items-center gap-1.5">
                <Eye size={13} />
                <span>Xem chi tiết</span>
              </Link>
            </Button>

            {canCancel && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isCancelling}
                onClick={(e) => onCancelOrder(order, e)}
                className="h-8 px-3 text-xs rounded-[6px] border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                {isCancelling ? (
                  <Loader2 size={12} className="animate-spin mr-1.5" />
                ) : (
                  <Ban size={12} className="mr-1.5" />
                )}
                Hủy đơn
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
