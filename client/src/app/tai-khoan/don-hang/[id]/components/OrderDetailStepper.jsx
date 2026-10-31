'use client';

import React from 'react';
import { Check, Clock, Package, Truck, CheckCircle2, Ban } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function OrderDetailStepper({ order, shipment: propShipment }) {
  const shipment = propShipment || order?.shipment;
  const oSt = (order?.orderStatus || '').toUpperCase();
  const sSt = (shipment?.status || '').toLowerCase();
  const isCancelled = oSt === 'CANCELLED' || oSt === 'RETURNED';

  let activeStep = 1;
  if (isCancelled) {
    activeStep = -1;
  } else if (oSt === 'DELIVERED' || sSt === 'delivered') {
    activeStep = 4;
  } else if (oSt === 'SHIPPING' || sSt === 'delivering' || sSt === 'picking' || sSt === 'ready_to_pick' || shipment) {
    activeStep = 3;
  } else if (oSt === 'CONFIRMED') {
    activeStep = 2;
  }

  const steps = [
    {
      step: 1,
      title: 'Đặt hàng thành công',
      desc: order?.createdAt ? new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
      icon: Clock,
    },
    {
      step: 2,
      title: 'Kho chuẩn bị',
      desc: activeStep > 2 ? 'Đã đóng gói xong' : activeStep === 2 ? 'Đang xử lý tại kho' : 'Chờ xác nhận',
      icon: Package,
    },
    {
      step: 3,
      title:
        activeStep >= 3
          ? shipment?.statusText || (sSt === 'ready_to_pick' ? 'Chờ lấy hàng' : sSt === 'delivering' ? 'Đang giao hàng' : 'Vận chuyển')
          : 'Vận chuyển',
      desc:
        activeStep >= 3
          ? sSt === 'ready_to_pick'
            ? `Chờ ${shipment?.carrierName || 'bưu tá'} lấy hàng`
            : sSt === 'picking'
            ? 'Bưu tá đang lấy hàng'
            : sSt === 'delivering'
            ? `${shipment?.carrierName || 'ĐVVC'} đang giao`
            : activeStep === 4
            ? 'Đã giao kiện hàng'
            : shipment?.carrierName
            ? `${shipment.carrierName} tiếp nhận`
            : 'Đang vận chuyển'
          : 'Chưa giao',
      trackingCode: activeStep >= 3 ? shipment?.trackingCode : null,
      icon: Truck,
    },
    {
      step: 4,
      title: 'Giao hàng thành công',
      desc: activeStep >= 4 ? 'Hoàn tất đơn hàng' : 'Chờ hoàn tất',
      icon: CheckCircle2,
    },
  ];

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-[6px] p-4 flex items-start gap-3 shadow-2xs">
        <div className="p-2 rounded-full bg-red-100 text-red-600 shrink-0">
          <Ban size={18} />
        </div>
        <div>
          <h4 className="text-xs font-bold text-red-900 uppercase tracking-wide">
            Đơn hàng đã bị hủy
          </h4>
          <p className="text-xs text-red-700 mt-0.5 leading-relaxed">
            {order?.statusHistory?.find((h) => h.status === 'CANCELLED')?.note ||
              'Đơn hàng này đã được hủy và hoàn trả tồn kho giữ chỗ.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-[6px] p-4 sm:p-5 shadow-2xs">
      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-6">
        Tiến độ đơn hàng
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
        {/* Thanh nối các bước trên desktop */}
        <div className="hidden sm:block absolute top-4 left-[12%] right-[12%] h-0.5 bg-slate-200 -z-0">
          <div
            className="h-full bg-emerald-600 transition-all duration-500 ease-out"
            style={{
              width: activeStep === 4 ? '100%' : activeStep === 3 ? '66%' : activeStep === 2 ? '33%' : '0%',
            }}
          />
        </div>

        {steps.map((s) => {
          const isDone = activeStep > s.step;
          const isCurrent = activeStep === s.step;
          const Icon = s.icon;

          return (
            <div key={s.step} className="flex flex-col items-center text-center relative z-10">
              {/* Step Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-2xs ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-red-600 text-white ring-4 ring-red-50'
                    : 'bg-white text-slate-400 border border-slate-300'
                }`}
              >
                {isDone ? <Check size={15} /> : <Icon size={15} />}
              </div>

              {/* Step Info */}
              <p
                className={`text-xs mt-2.5 font-bold ${
                  isCurrent ? 'text-slate-900' : isDone ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {s.title}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                {s.desc}
              </p>
              {s.trackingCode && (
                <Badge variant="secondary" className="mt-1 font-mono text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0 rounded-[4px]">
                  Mã: {s.trackingCode}
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
