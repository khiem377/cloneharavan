'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { XCircle, RotateCcw, ArrowRight, ShoppingBag, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';
import paymentService from '@/services/payment.service';

export default function OrderFailedCard({ orderCode, code, message, orderId, totalAmount }) {
  const [retrying, setRetrying] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!orderCode) return;
    navigator.clipboard?.writeText(orderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRetry = async () => {
    if (!orderId && !orderCode) {
      toast('Không tìm thấy thông tin đơn hàng', { type: 'error' });
      return;
    }
    setRetrying(true);
    try {
      const res = await paymentService.createPayment({
        orderId: orderId || orderCode,
        paymentMethod: 'ONEPAY',
      });
      if (res?.data?.paymentUrl) {
        toast('Đang chuyển hướng sang cổng thanh toán OnePay...', { type: 'success' });
        window.location.href = res.data.paymentUrl;
      } else {
        toast('Không nhận được đường dẫn thanh toán từ máy chủ', { type: 'error' });
      }
    } catch (err) {
      toast(err.response?.data?.message || err.message || 'Không thể tạo lại yêu cầu thanh toán', { type: 'error' });
    } finally {
      setRetrying(false);
    }
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val) || 0);
  };

  return (
    <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-[6px] p-6 space-y-5 text-center">
      <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
        <XCircle size={32} />
      </div>

      <div className="space-y-1.5">
        <h1 className="text-xl font-black text-slate-900">
          Thanh toán OnePay chưa hoàn tất
        </h1>
        <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
          {message || 'Giao dịch trên cổng OnePay không thành công hoặc đã bị hủy. Đơn hàng của bạn vẫn được lưu giữ và chưa bị hủy.'}
        </p>
      </div>

      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-[6px] text-xs space-y-2 text-left">
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Mã đơn hàng:</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-slate-900">#{orderCode || 'N/A'}</span>
            {orderCode && (
              <button
                type="button"
                onClick={handleCopy}
                className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                title="Sao chép"
              >
                {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              </button>
            )}
          </div>
        </div>

        {code && (
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Mã phản hồi OnePay:</span>
            <span className="font-mono text-slate-700 font-bold">{code}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-slate-500">Trạng thái:</span>
          <Badge className="bg-amber-50 text-amber-800 border-amber-300 border text-[10px] font-bold">
            CHƯA THANH TOÁN (UNPAID)
          </Badge>
        </div>

        {totalAmount > 0 && (
          <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
            <span className="text-slate-600 font-semibold">Tổng tiền cần thanh toán:</span>
            <span className="font-mono font-black text-[#e30019] text-sm tabular-nums">
              {formatPrice(totalAmount)}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2 pt-1">
        <Button
          type="button"
          onClick={handleRetry}
          disabled={retrying}
          className="w-full h-10 text-xs font-bold bg-[#0088ff] hover:bg-[#0070d2] text-white rounded-[6px] active:scale-[0.98] transition cursor-pointer"
        >
          {retrying ? (
            <span className="flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Đang chuyển hướng sang OnePay...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <RotateCcw size={14} />
              <span>Thanh toán lại qua OnePay</span>
            </span>
          )}
        </Button>

        <div className="flex gap-2">
          <Button
            asChild
            variant="outline"
            className="flex-1 h-9 text-xs font-semibold text-slate-700 hover:bg-slate-50 border-slate-200 rounded-[6px] cursor-pointer"
          >
            <Link href="/tai-khoan?tab=orders" className="flex items-center justify-center gap-1">
              <span>Đơn hàng của tôi</span>
              <ArrowRight size={13} />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="flex-1 h-9 text-xs font-semibold text-slate-700 hover:bg-slate-50 border-slate-200 rounded-[6px] cursor-pointer"
          >
            <Link href="/" className="flex items-center justify-center gap-1">
              <ShoppingBag size={13} />
              <span>Về trang chủ</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
