'use client';

import React from 'react';
import Link from 'next/link';
import { Ticket, ShieldCheck } from 'lucide-react';

export default function CouponsHeader({ totalCoupons = 0 }) {
  return (
    <div className="bg-white border-b border-slate-200 py-3.5 sm:py-4">
      <div className="max-w-[1536px] 2xl:max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400 mb-2.5 font-medium">
          <Link href="/" className="hover:text-slate-800 transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-slate-700 font-semibold">Mã giảm giá</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 [text-wrap:balance]">
              KHO MÃ GIẢM GIÁ & VOUCHER
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Thu thập mã ưu đãi độc quyền để tiết kiệm tối đa khi thanh toán đơn hàng.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-[6px] px-3 py-1.5 self-start sm:self-auto shrink-0">
            <Ticket size={15} className="text-red-600" />
            <span className="text-xs font-semibold text-slate-700 font-mono tabular-nums">
              Đang có {totalCoupons} mã khả dụng
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
