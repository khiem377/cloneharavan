'use client';

import React from 'react';
import {
  Truck,
  CheckCircle2,
  Package,
  Clock,
  Ban,
  Check,
  Copy,
  Eye,
} from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function OrderTrackingDialog({
  trackingShipment,
  onClose,
  onViewOrder,
  copiedCode,
  onCopyCode,
  formatDate,
  ORDER_STATUS_MAP,
}) {
  if (!trackingShipment) return null;

  const { order, shipment } = trackingShipment;
  const oSt = (order?.orderStatus || '').toUpperCase();
  const sSt = (shipment?.status || '').toLowerCase();
  const isCancelled = oSt === 'CANCELLED' || oSt === 'RETURNED';

  let activeStep = 1;
  if (isCancelled) activeStep = -1;
  else if (oSt === 'DELIVERED' || sSt === 'delivered') activeStep = 4;
  else if (oSt === 'SHIPPING' || sSt === 'delivering' || sSt === 'picking') activeStep = 3;
  else if (oSt === 'CONFIRMED' || sSt === 'ready_to_pick' || shipment) activeStep = 2;

  const steps = [
    { step: 1, label: 'Đặt hàng thành công', desc: formatDate(order?.createdAt) },
    {
      step: 2,
      label: 'Chuẩn bị hàng',
      desc: activeStep >= 2 ? (sSt === 'ready_to_pick' ? 'Đã đóng gói, chờ lấy' : 'Kho đang xử lý') : 'Chờ xác nhận',
    },
    {
      step: 3,
      label: 'Đang giao hàng',
      desc: activeStep >= 3 ? (shipment?.carrierName ? `${shipment.carrierName} đang giao` : 'Đang vận chuyển') : 'Chưa giao',
    },
    {
      step: 4,
      label: 'Đã nhận hàng',
      desc: activeStep >= 4 ? 'Giao thành công' : 'Chờ hoàn tất',
    },
  ];

  return (
    <Dialog open={Boolean(trackingShipment)} onOpenChange={(open) => !open && onClose()}>
      <div className="max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Truck className="text-blue-600" size={18} />
            <DialogTitle>Tiến độ đơn hàng #{order?.orderCode}</DialogTitle>
          </div>
          <DialogClose onClick={onClose} />
        </DialogHeader>

        <DialogContent className="overflow-y-auto space-y-4 p-5 text-xs">
          {isCancelled ? (
            <div className="p-3.5 rounded-[6px] border border-rose-200 bg-rose-50/70 text-rose-800 space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <Ban size={15} className="text-rose-600" />
                <span>Đơn hàng đã được hủy</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                Đơn hàng đã hủy. Số lượng tồn kho và các ưu đãi liên quan đã được hoàn trả về hệ thống.
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-[6px] border border-blue-200 bg-blue-50/60 text-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-blue-900 text-[13px]">
                  {activeStep === 4 && <CheckCircle2 size={16} className="text-emerald-600" />}
                  {activeStep === 3 && <Truck size={16} className="text-blue-600" />}
                  {activeStep === 2 && <Package size={16} className="text-amber-600" />}
                  {activeStep === 1 && <Clock size={16} className="text-slate-600" />}
                  <span>
                    {activeStep === 4 && 'Kiện hàng đã giao thành công'}
                    {activeStep === 3 && 'Đơn hàng đang trên đường giao đến bạn'}
                    {activeStep === 2 && (sSt === 'ready_to_pick' ? 'Đã đóng gói - Chờ đơn vị vận chuyển lấy hàng' : 'Cửa hàng đang chuẩn bị và đóng gói')}
                    {activeStep === 1 && 'Đã đặt hàng - Cửa hàng đang tiếp nhận'}
                  </span>
                </div>
                <Badge variant="secondary" className="bg-white border border-blue-200 text-blue-700 font-mono text-[10px]">
                  {ORDER_STATUS_MAP[order?.orderStatus]?.label || order?.orderStatus}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {activeStep === 4 && 'Cảm ơn bạn đã mua sắm tại cửa hàng. Bạn có thể kiểm tra sản phẩm và để lại đánh giá.'}
                {activeStep === 3 && `Nhân viên giao hàng của ${shipment?.carrierName || 'đối tác vận chuyển'} đang trên đường giao đến bạn. Vui lòng để ý điện thoại.`}
                {activeStep === 2 && (sSt === 'ready_to_pick' ? `Kiện hàng đã được dán nhãn vận đơn. Đang chờ nhân viên của ${shipment?.carrierName || 'đơn vị vận chuyển'} qua kho tiếp nhận.` : 'Shop đã nhận đơn và nhân viên kho đang soạn hàng, kiểm tra sản phẩm.')}
                {activeStep === 1 && 'Đơn hàng đã được ghi nhận trên hệ thống. Nhân viên cửa hàng sẽ sớm xác nhận và xử lý đơn.'}
              </p>
            </div>
          )}

          {!isCancelled && (
            <div className="bg-white border border-slate-200 rounded-[6px] p-4">
              <div className="grid grid-cols-4 relative">
                <div className="absolute top-4 left-[12%] right-[12%] h-0.5 bg-slate-200 -z-0">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{
                      width: `${Math.max(0, Math.min(100, ((activeStep - 1) / 3) * 100))}%`,
                    }}
                  />
                </div>

                {steps.map((st) => {
                  const isDone = activeStep >= st.step;
                  const isCurrent = activeStep === st.step;

                  return (
                    <div key={st.step} className="flex flex-col items-center text-center relative z-10 px-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                          isDone
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white border-2 border-slate-300 text-slate-400'
                        } ${isCurrent ? 'ring-2 ring-blue-200' : ''}`}
                      >
                        {isDone && st.step < activeStep ? (
                          <Check size={14} />
                        ) : (
                          <span>{st.step}</span>
                        )}
                      </div>
                      <span className={`mt-2 font-semibold text-[11px] leading-tight ${isCurrent ? 'text-blue-700' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                        {st.label}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        {st.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-[6px] space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Đơn vị vận chuyển:</span>
              <span className="font-semibold text-slate-800">
                {shipment?.carrierName || 'Vận chuyển tiêu chuẩn của cửa hàng'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Mã vận đơn:</span>
              {shipment?.trackingCode ? (
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-blue-600 select-all">
                    {shipment.trackingCode}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => onCopyCode(shipment.trackingCode, e)}
                    className="h-5 w-5 text-slate-400 hover:text-slate-700"
                  >
                    {copiedCode === shipment.trackingCode ? (
                      <Check size={12} className="text-emerald-600" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </Button>
                </div>
              ) : (
                <span className="text-slate-400 italic">Sẽ được cấp khi bàn giao shipper</span>
              )}
            </div>
            <Separator className="my-1.5" />
            <div className="space-y-1">
              <span className="text-slate-500 block">Địa chỉ nhận hàng:</span>
              <p className="font-semibold text-slate-800">
                {order?.shippingAddress?.fullName} - <span className="font-mono">{order?.shippingAddress?.phone}</span>
              </p>
              <p className="text-slate-600 leading-snug">
                {order?.shippingAddress?.detailAddress}, {order?.shippingAddress?.ward},{' '}
                {order?.shippingAddress?.district}, {order?.shippingAddress?.province}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="font-semibold text-slate-800 text-xs">Nhật ký tiến trình</h5>
            <div className="border border-slate-200 rounded-[6px] p-3 space-y-3 bg-white max-h-48 overflow-y-auto">
              {(shipment?.historyLogs || []).length > 0 ? (
                shipment.historyLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-[11px]">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1 shrink-0" />
                    <div className="flex-1">
                      <p className="text-slate-800 font-medium">{log.description}</p>
                      <span className="text-slate-400 text-[10px]">{formatDate(log.updatedAt)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-3">
                  {activeStep >= 2 && (
                    <div className="flex items-start gap-2.5 text-[11px]">
                      <div className="w-2 h-2 rounded-full bg-blue-600 mt-1 shrink-0" />
                      <div className="flex-1">
                        <p className="text-slate-800 font-medium">
                          {sSt === 'ready_to_pick'
                            ? `Đã đóng gói kiện hàng, chuẩn bị bàn giao cho ${shipment?.carrierName || 'đối tác vận chuyển'}`
                            : 'Shop đã xác nhận đơn hàng và đang đóng gói sản phẩm'}
                        </p>
                        <span className="text-slate-400 text-[10px]">{formatDate(order?.updatedAt || order?.createdAt)}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2.5 text-[11px]">
                    <div className="w-2 h-2 rounded-full bg-slate-400 mt-1 shrink-0" />
                    <div className="flex-1">
                      <p className="text-slate-700 font-medium">Đơn hàng được đặt thành công</p>
                      <span className="text-slate-400 text-[10px]">{formatDate(order?.createdAt)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onViewOrder(order);
              }}
              className="text-xs px-3 text-slate-700 hover:bg-slate-100 gap-1.5"
            >
              <Eye size={12} />
              <span>Xem chi tiết đơn</span>
            </Button>
            <Button
              type="button"
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
