'use client';

import React from 'react';
import { Check, Copy, MapPin, ShoppingBag, Ban, Truck, Loader2 } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function OrderDetailDialog({
  order,
  onClose,
  copiedCode,
  onCopyCode,
  statusMeta,
  paymentMeta,
  formatPrice,
  formatDate,
  cancellingId,
  onCancelOrder,
  onTrackShipment,
  trackingLoadingId,
}) {
  if (!order) return null;

  return (
    <Dialog open={Boolean(order)} onOpenChange={(open) => !open && onClose()}>
      <div className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Chi tiết đơn hàng #{order.orderCode}</DialogTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => onCopyCode(order.orderCode, e)}
              title="Sao chép mã đơn"
              className="h-6 w-6 text-slate-400 hover:text-slate-700"
            >
              {copiedCode === order.orderCode ? (
                <Check size={13} className="text-emerald-600" />
              ) : (
                <Copy size={13} />
              )}
            </Button>
          </div>
          <DialogClose onClick={onClose} />
        </DialogHeader>

        <DialogContent className="overflow-y-auto space-y-4 p-5 text-xs">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-[6px] flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-slate-500 block text-[11px]">Trạng thái đơn:</span>
              <Badge variant="secondary" className={`mt-1 font-semibold text-xs border ${statusMeta?.badgeClass || ''}`}>
                {statusMeta?.label || order.orderStatus}
              </Badge>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Thanh toán:</span>
              <Badge variant="outline" className={`mt-1 text-xs border ${paymentMeta?.badgeClass || ''}`}>
                {paymentMeta?.label || order.paymentStatus}
              </Badge>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Thời gian đặt:</span>
              <span className="font-medium text-slate-800 mt-1 block">
                {formatDate(order.createdAt)}
              </span>
            </div>
          </div>

          <div className="border border-slate-200 rounded-[6px] p-3.5 space-y-1.5">
            <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
              <MapPin size={13} className="text-[#e30019]" />
              <span>Địa chỉ nhận hàng</span>
            </h5>
            <div className="text-slate-800 font-medium">
              {order.shippingAddress?.fullName} -{' '}
              <span className="font-mono font-normal text-slate-600">
                {order.shippingAddress?.phone}
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {order.shippingAddress?.detailAddress}, {order.shippingAddress?.ward},{' '}
              {order.shippingAddress?.district}, {order.shippingAddress?.province}
            </p>
            {order.note && (
              <p className="text-amber-800 bg-amber-50 p-2 rounded text-[11px] mt-2 border border-amber-200">
                Ghi chú: {order.note}
              </p>
            )}
          </div>

          <div className="border border-slate-200 rounded-[6px] overflow-hidden">
            <div className="bg-slate-50 px-3.5 py-2 font-bold text-slate-900 border-b border-slate-200">
              Danh sách sản phẩm ({order.items?.length || 0})
            </div>
            <div className="divide-y divide-slate-100 p-3.5">
              {order.items?.map((item, i) => (
                <div key={i} className="py-2.5 first:pt-0 last:pb-0 flex items-center gap-3">
                  <div className="w-12 h-12 rounded border border-slate-200 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag size={18} className="text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 line-clamp-1">{item.productName}</div>
                    <div className="text-[11px] text-slate-500">
                      {item.variantName && <span>Phân loại: {item.variantName} | </span>}
                      SL: {item.quantity} x {formatPrice(item.unitPrice)}
                    </div>
                  </div>
                  <div className="text-right font-bold font-mono text-slate-900">
                    {formatPrice(item.lineTotal || item.unitPrice * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-slate-200 rounded-[6px] p-3.5 space-y-2 bg-slate-50/50">
            <div className="flex justify-between text-slate-600">
              <span>Tiền hàng (Tạm tính):</span>
              <span className="font-mono text-slate-900">{formatPrice(order.pricing?.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Phí vận chuyển:</span>
              <span className="font-mono text-slate-900">
                {order.pricing?.shippingFee === 0 ? 'Miễn phí' : formatPrice(order.pricing?.shippingFee)}
              </span>
            </div>
            {order.pricing?.couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Mã giảm giá ({order.pricing?.couponCode || 'Voucher'}):</span>
                <span className="font-mono font-medium">-{formatPrice(order.pricing?.couponDiscount)}</span>
              </div>
            )}
            <Separator className="my-1" />
            <div className="flex justify-between text-slate-900 font-bold text-sm">
              <span>Tổng thanh toán:</span>
              <span className="text-[#e30019] font-mono">{formatPrice(order.pricing?.totalAmount)}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            {order.orderStatus === 'PENDING' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={cancellingId === order._id}
                onClick={(e) => onCancelOrder(order, e)}
                className="border-rose-200 text-rose-600 hover:bg-rose-50 text-xs"
              >
                {cancellingId === order._id ? (
                  <Loader2 size={12} className="animate-spin mr-1.5" />
                ) : (
                  <Ban size={12} className="mr-1.5" />
                )}
                Hủy đơn hàng
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={() => onTrackShipment(order)}
              disabled={trackingLoadingId === order._id}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 flex items-center gap-1.5"
            >
              {trackingLoadingId === order._id ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Truck size={12} />
              )}
              <span>Theo dõi vận đơn</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="bg-slate-900 text-white hover:bg-slate-800 text-xs px-4"
            >
              Đóng
            </Button>
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
}
