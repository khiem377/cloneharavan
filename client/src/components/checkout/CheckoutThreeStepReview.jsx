'use client';

import React from 'react';
import { MapPin, Truck, CreditCard, Building2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CheckoutThreeStepReview({
  currentAddress = {},
  selectedPaymentMethod = 'COD',
  effectiveShippingFee = 0,
  invoiceData = {},
  onBackToStep,
  formatPrice,
}) {
  const getPaymentName = (method) => {
    switch (method) {
      case 'VNPAY':
        return 'Thanh toán trực tuyến VNPAY-QR';
      case 'MOMO':
        return 'Thanh toán Ví MoMo';
      case 'ZALOPAY':
        return 'Thanh toán Ví / Cổng ZaloPay';
      case 'COD':
      default:
        return 'Thanh toán khi nhận hàng (COD)';
    }
  };

  const addressLine = [
    currentAddress.detailAddress,
    currentAddress.ward,
    currentAddress.district,
    currentAddress.province,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="bg-white border border-slate-200 rounded-[6px] p-4 sm:p-5 space-y-4">
      <div className="pb-3 border-b border-slate-200">
        <h2 className="text-sm sm:text-base font-bold text-slate-900">
          Xem lại thông tin đơn hàng
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Vui lòng kiểm tra lại địa chỉ và phương thức đã chọn trước khi xác nhận đặt hàng
        </p>
      </div>

      {/* 1. Người nhận & Địa chỉ */}
      <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-[6px] flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <MapPin size={16} className="text-[#0088ff] shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <span>{currentAddress.fullName || 'Chưa có họ tên'}</span>
              <span className="font-mono text-slate-600 font-normal">
                {currentAddress.phone}
              </span>
            </div>
            {currentAddress.email && (
              <div className="text-slate-500 text-[11px]">{currentAddress.email}</div>
            )}
            <div className="text-slate-700 leading-relaxed">{addressLine || 'Chưa chọn địa chỉ'}</div>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onBackToStep(1)}
          className="h-7 px-2 text-xs text-[#0088ff] hover:text-blue-700 shrink-0"
        >
          <Edit2 size={12} className="mr-1" />
          <span>Sửa</span>
        </Button>
      </div>

      {/* 2. Vận chuyển & Thanh toán */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-[6px] flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <Truck size={16} className="text-[#0088ff] shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <div className="font-semibold text-slate-900">Giao hàng tiêu chuẩn</div>
              <div className="text-slate-500 text-[11px]">
                Cước vận chuyển: <span className="font-mono font-semibold text-slate-800">{formatPrice ? formatPrice(effectiveShippingFee) : `${effectiveShippingFee}đ`}</span>
              </div>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onBackToStep(2)}
            className="h-7 px-2 text-xs text-[#0088ff] hover:text-blue-700 shrink-0"
          >
            <Edit2 size={12} className="mr-1" />
            <span>Sửa</span>
          </Button>
        </div>

        <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-[6px] flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <CreditCard size={16} className="text-[#0088ff] shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <div className="font-semibold text-slate-900">
                {getPaymentName(selectedPaymentMethod)}
              </div>
              <div className="text-slate-500 text-[11px]">Miễn phí giao dịch</div>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onBackToStep(2)}
            className="h-7 px-2 text-xs text-[#0088ff] hover:text-blue-700 shrink-0"
          >
            <Edit2 size={12} className="mr-1" />
            <span>Sửa</span>
          </Button>
        </div>
      </div>

      {/* 3. Xuất hóa đơn công ty nếu có */}
      {invoiceData?.requireInvoice && (
        <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-[6px] flex items-start gap-2.5 text-xs">
          <Building2 size={16} className="text-slate-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold text-slate-900">
              Xuất hóa đơn VAT: {invoiceData.companyName}
            </div>
            <div className="text-slate-600 text-[11px]">
              MST: <span className="font-mono">{invoiceData.taxCode}</span> — Email: {invoiceData.invoiceEmail}
            </div>
            <div className="text-slate-500 text-[11px]">{invoiceData.companyAddress}</div>
          </div>
        </div>
      )}
    </div>
  );
}
