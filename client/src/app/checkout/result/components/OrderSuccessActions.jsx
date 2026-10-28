'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Printer, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrderSuccessActions({ orderCode }) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
      <Button
        asChild
        variant="outline"
        className="w-full sm:w-auto h-10 text-xs font-semibold text-slate-700 hover:bg-slate-50 border-slate-200 rounded-[6px] cursor-pointer"
      >
        <Link href="/" className="flex items-center justify-center gap-1.5">
          <ShoppingBag size={14} />
          <span>Tiếp tục mua sắm</span>
        </Link>
      </Button>

      <div className="flex items-center gap-2.5 w-full sm:w-auto">
        {/* <Button
          type="button"
          variant="outline"
          onClick={handlePrint}
          className="flex-1 sm:flex-none h-10 text-xs font-semibold text-slate-700 hover:bg-slate-50 border-slate-200 rounded-[6px] cursor-pointer"
        >
          <Printer size={14} className="mr-1.5 text-slate-500" />
          <span>In biên lai</span>
        </Button> */}

        <Button
          asChild
          className="flex-1 sm:flex-none h-10 text-xs font-bold bg-[#e30019] hover:bg-[#c40015] text-white rounded-[6px] active:scale-[0.98] transition cursor-pointer shadow-xs"
        >
          <Link href={`/tai-khoan/don-hang/${orderCode || ''}`} className="flex items-center justify-center gap-1.5">
            <span>Xem chi tiết đơn hàng</span>
            <ArrowRight size={14} />
          </Link>
        </Button>
      </div>
    </div>
  );
}
