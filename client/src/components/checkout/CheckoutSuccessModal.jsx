'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Copy, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CheckoutSuccessModal({ placedOrder, formatPrice }) {
  const [copiedCode, setCopiedCode] = useState(false);

  if (!placedOrder) return null;

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-[6px] border border-slate-200 max-w-lg w-full p-5 sm:p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-[6px] bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 size={24} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Đặt hàng thành công
          </h3>
          <p className="text-xs text-slate-600">
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được ghi nhận vào hệ thống.
          </p>
        </div>

        {/* Thông tin đơn hàng tóm tắt */}
        <div className="p-3.5 rounded-[6px] bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Mã đơn hàng:</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-slate-900 font-bold">
                #{placedOrder.orderCode}
              </span>
              <button
                type="button"
                onClick={() => handleCopyCode(placedOrder.orderCode)}
                title="Sao chép mã đơn"
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition cursor-pointer"
              >
                {copiedCode ? (
                  <Check size={13} className="text-emerald-600" />
                ) : (
                  <Copy size={13} />
                )}
              </button>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Trạng thái đơn:</span>
            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 text-[10px] font-bold">
              Chờ xác nhận
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Thanh toán:</span>
            <Badge variant="outline" className="text-[10px] border-slate-200 bg-white text-slate-700">
              COD (Thanh toán khi nhận hàng)
            </Badge>
          </div>
          <div className="flex justify-between items-baseline pt-1 border-t border-slate-200">
            <span className="text-slate-500">Tổng tiền thanh toán:</span>
            <strong className="font-mono text-[#e30019] text-sm tabular-nums">
              {formatPrice(placedOrder.pricing?.totalAmount)}
            </strong>
          </div>
          <div className="border-t border-slate-200 pt-2 text-[11px] text-slate-600">
            <span className="font-semibold block text-slate-800 mb-0.5">Địa chỉ nhận hàng:</span>
            <span>
              {placedOrder.shippingAddress?.fullName} - {placedOrder.shippingAddress?.phone}
            </span>
            <p className="text-slate-500 line-clamp-2 mt-0.5">
              {placedOrder.shippingAddress?.detailAddress}, {placedOrder.shippingAddress?.ward}, {placedOrder.shippingAddress?.district}, {placedOrder.shippingAddress?.province}
            </p>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex flex-col gap-2 pt-2">
          <Button
            asChild
            className="w-full text-xs h-9 bg-[#e30019] hover:bg-[#c40015] text-white rounded-[6px] font-bold cursor-pointer"
          >
            <Link href="/tai-khoan?tab=orders" className="flex items-center justify-center gap-1.5">
              <span>Xem đơn hàng của tôi</span>
              <ArrowRight size={13} />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full text-xs h-9 text-slate-700 hover:bg-slate-50 border-slate-200 rounded-[6px] cursor-pointer"
          >
            <Link href="/">
              Tiếp tục mua sắm
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
