'use client';

import React from 'react';
import { CreditCard, MapPin, ShieldCheck, PhoneCall, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function OrderSuccessDetailsCard({ order, transNo }) {
  const shippingAddress = order?.shippingAddress || {};
  const paymentDetails = order?.paymentDetails || {};
  const methodUpper = String(order?.paymentMethod || '').toUpperCase();
  const isOnePay = methodUpper === 'ONEPAY';
  const isVnpay = methodUpper === 'VNPAY';
  const logoImg = isVnpay ? '/images/payments/vnpay.png' : '/images/payments/onepay.png';
  const methodName = isVnpay ? 'Cổng thanh toán VNPAY' : isOnePay ? 'Cổng thanh toán OnePay' : (order?.paymentMethod || 'Thanh toán trực tuyến');
  const methodDesc = isVnpay ? 'Quét mã VNPAY-QR / Thẻ ATM nội địa / Thẻ quốc tế' : 'Thẻ ATM Napas / Thẻ Quốc tế Visa & Mastercard';

  const fullAddress = [
    shippingAddress.detailAddress,
    shippingAddress.ward,
    shippingAddress.district,
    shippingAddress.province,
  ]
    .filter(Boolean)
    .join(', ');

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(dateStr));
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Thẻ thanh toán */}
      <div className="bg-white border border-slate-200 rounded-[6px] p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-[#0088ff]" />
            <h3 className="text-sm font-bold text-slate-900">
              Phương thức thanh toán
            </h3>
          </div>
          <Badge className="bg-emerald-50 text-emerald-800 border-emerald-300 border text-[10px] font-bold">
            ĐÃ THANH TOÁN (PAID)
          </Badge>
        </div>

        <div className="flex items-center gap-3 p-2.5 rounded-[4px] bg-slate-50 border border-slate-100">
          <div className="w-10 h-7 bg-white rounded border border-slate-200 flex items-center justify-center p-0.5 overflow-hidden shrink-0">
            <img
              src={logoImg}
              alt={methodName}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="text-xs">
            <div className="font-bold text-slate-900">
              {methodName}
            </div>
            <div className="text-[11px] text-slate-500">
              {methodDesc}
            </div>
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          {(transNo || paymentDetails.transactionNo) && (
            <div className="flex justify-between items-center text-slate-600">
              <span>Mã giao dịch {isVnpay ? 'VNPAY' : 'OnePay'}:</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {transNo || paymentDetails.transactionNo}
              </span>
            </div>
          )}
          {paymentDetails.bankCode && (
            <div className="flex justify-between items-center text-slate-600">
              <span>Ngân hàng phát hành:</span>
              <span className="font-mono font-bold text-slate-800 uppercase">
                {paymentDetails.bankCode}
              </span>
            </div>
          )}
          {paymentDetails.cardType && (
            <div className="flex justify-between items-center text-slate-600">
              <span>Loại thẻ:</span>
              <span className="font-semibold text-slate-800 uppercase">
                {paymentDetails.cardType}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center text-slate-600">
            <span>Thời gian thanh toán:</span>
            <span className="font-mono text-slate-700">
              {formatDateTime(paymentDetails.paidAt || order?.updatedAt || order?.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Thẻ địa chỉ nhận hàng */}
      <div className="bg-white border border-slate-200 rounded-[6px] p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <MapPin size={16} className="text-rose-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Địa chỉ nhận hàng
          </h3>
        </div>

        <div className="space-y-1 text-xs text-slate-700">
          <div className="font-bold text-slate-900 flex items-center gap-2">
            <span>{shippingAddress.fullName || 'Khách hàng'}</span>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-slate-700 font-semibold">
              {shippingAddress.phone || 'N/A'}
            </span>
          </div>

          <p className="text-slate-600 leading-relaxed text-[11px] pt-0.5">
            {fullAddress || 'Địa chỉ giao hàng đã được lưu trên hệ thống.'}
          </p>

          {order?.note && (
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-start gap-1.5 text-[11px] text-slate-600">
              <FileText size={12} className="text-slate-400 mt-0.5 shrink-0" />
              <span>Ghi chú: {order.note}</span>
            </div>
          )}
        </div>
      </div>

      {/* Thẻ cam kết & hotline */}
      <div className="bg-white border border-slate-200 rounded-[6px] p-3.5 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs">
          <ShieldCheck size={15} />
          <span>Bảo hành chính hãng 100% & Đổi trả trong 7 ngày</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-[11px]">
          <PhoneCall size={13} className="text-slate-400" />
          <span>Cần hỗ trợ về đơn hàng? Hotline 24/7: <strong>1900 1234</strong></span>
        </div>
      </div>
    </div>
  );
}
