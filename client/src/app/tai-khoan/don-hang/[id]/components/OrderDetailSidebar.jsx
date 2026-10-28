'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, CreditCard, Truck, Phone, MessageSquare, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const PAYMENT_METHOD_NAMES = {
  COD: 'Thanh toán khi nhận hàng (COD)',
  onepay: 'Thanh toán trực tuyến OnePay',
  vnpay: 'Thanh toán qua VNPAY QR / Thẻ nội địa',
  vnpay_qr: 'VNPAY QR',
  wallet: 'Số dư ví điện tử',
};

export default function OrderDetailSidebar({ order, shipment }) {
  const addr = order?.shippingAddress || {};
  const payMethod = PAYMENT_METHOD_NAMES[order?.paymentMethod] || order?.paymentMethod || 'COD';
  const payDetails = order?.paymentDetails || {};

  return (
    <div className="space-y-4">
      {/* 1. Shipping Address Card */}
      <div className="bg-white border border-slate-200 rounded-[6px] p-4 shadow-xs">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <MapPin size={14} className="text-[#e30019]" />
          <span>Địa chỉ nhận hàng</span>
        </h3>

        <div className="space-y-1.5 text-xs text-slate-700">
          <div className="font-bold text-slate-900 text-sm">
            {addr.fullName || 'Khách hàng'}
          </div>
          <div className="font-mono text-slate-600 font-medium">
            {addr.phone || 'Chưa cung cấp'}
          </div>
          <p className="text-slate-600 leading-relaxed text-[11.5px] pt-0.5">
            {[addr.detailAddress, addr.ward, addr.district, addr.province].filter(Boolean).join(', ')}
          </p>

          {order?.note && (
            <div className="mt-2.5 p-2 rounded-[4px] bg-amber-50/80 border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
              <span className="font-semibold">Ghi chú:</span> {order.note}
            </div>
          )}
        </div>
      </div>

      {/* 2. Payment Method Card */}
      <div className="bg-white border border-slate-200 rounded-[6px] p-4 shadow-xs">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <CreditCard size={14} className="text-blue-600" />
          <span>Phương thức thanh toán</span>
        </h3>

        <div className="space-y-2 text-xs">
          <div className="font-semibold text-slate-800">
            {payMethod}
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
            <span className="text-slate-500">Trạng thái:</span>
            <Badge
              variant="outline"
              className={`text-[10.5px] px-1.5 py-0.5 rounded-[4px] font-semibold border ${
                order?.paymentStatus === 'PAID'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {order?.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
            </Badge>
          </div>

          {payDetails.transactionNo && (
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span>Mã giao dịch:</span>
              <span className="font-mono font-medium text-slate-900">
                {payDetails.transactionNo}
              </span>
            </div>
          )}

          {payDetails.bankCode && (
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span>Ngân hàng:</span>
              <span className="font-mono text-slate-900 font-medium uppercase">
                {payDetails.bankCode}
              </span>
            </div>
          )}

          {payDetails.paidAt && (
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span>Thời gian:</span>
              <span className="font-mono text-slate-700">
                {new Date(payDetails.paidAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} {new Date(payDetails.paidAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Shipping / Logistics Card */}
      {shipment && (
        <div className="bg-white border border-slate-200 rounded-[6px] p-4 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Truck size={14} className="text-purple-600" />
            <span>Thông tin giao hàng</span>
          </h3>

          <div className="space-y-1.5 text-xs text-slate-700">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Đơn vị vận chuyển:</span>
              <span className="font-bold text-slate-900">{shipment.carrierName || 'Giao hàng nhanh'}</span>
            </div>

            {shipment.trackingCode && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Mã vận đơn:</span>
                <span className="font-mono font-bold text-purple-700">{shipment.trackingCode}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Support Contact Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-[6px] p-3.5 space-y-2 text-xs">
        <div className="font-semibold text-slate-800">
          Cần hỗ trợ về đơn hàng?
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn 24/7.
        </p>

        <div className="flex gap-2 pt-1">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-[11px] font-semibold border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-[4px]"
          >
            <a href="tel:19001234">
              <Phone size={12} className="mr-1.5 text-emerald-600" />
              1900 1234
            </a>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-[11px] font-semibold border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-[4px]"
          >
            <Link href="/lien-he">
              <MessageSquare size={12} className="mr-1.5 text-blue-600" />
              Liên hệ
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
