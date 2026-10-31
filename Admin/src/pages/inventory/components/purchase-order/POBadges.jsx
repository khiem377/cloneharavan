import React from 'react';
import {
  CheckCircle2, Clock, Send, XCircle, Truck, PackageCheck,
  ClipboardCheck,
} from '@/components/ui/Icons';

export function POStatusBadge({ status }) {
  switch (status) {
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
          <CheckCircle2 className="h-3.5 w-3.5" /> 6. Đã Nhập Kho (Hoàn Tất)
        </span>
      );
    case 'inspecting':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400 whitespace-nowrap">
          <ClipboardCheck className="h-3.5 w-3.5" /> 5. Đang Kiểm Hàng
        </span>
      );
    case 'arrived':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
          <PackageCheck className="h-3.5 w-3.5" /> 4. Đã Đến Kho
        </span>
      );
    case 'in_transit':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
          <Truck className="h-3.5 w-3.5" /> 3. Đang Vận Chuyển
        </span>
      );
    case 'sent':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
          <Send className="h-3.5 w-3.5" /> 2. Đã Gửi NCC
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-600 dark:text-red-400 whitespace-nowrap">
          <XCircle className="h-3.5 w-3.5" /> Đã Hủy
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap">
          <Clock className="h-3.5 w-3.5" /> 1. Bản Nháp (Đã Tạo)
        </span>
      );
  }
}

export function POPaymentBadge({ po }) {
  const total = Number(po?.totalAmount || 0);
  const paid = Number(po?.paidAmount || 0);
  const rem = Math.max(0, total - paid);
  const st = po?.paymentStatus || (rem === 0 && total > 0 ? 'paid' : (paid > 0 ? 'partially_paid' : 'unpaid'));

  switch (st) {
    case 'paid':
      return (
        <span className="inline-flex items-center gap-1 rounded-[6px] border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
          <CheckCircle2 className="size-3" /> Đã thanh toán
        </span>
      );
    case 'partially_paid':
      return (
        <div className="inline-flex flex-col items-center">
          <span className="inline-flex items-center gap-1 rounded-[6px] border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
            Trả 1 phần
          </span>
          <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
            Còn {rem.toLocaleString('vi-VN')} đ
          </span>
        </div>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-[6px] border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap">
          <Clock className="size-3" /> Chưa thanh toán
        </span>
      );
  }
}
