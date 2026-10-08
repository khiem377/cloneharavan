'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CartEmptyState() {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-14 text-center max-w-2xl mx-auto shadow-2xs my-6">
      {/* Icon giỏ hàng rỗng */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
        <ShoppingBag size={40} strokeWidth={1.5} />
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
        Giỏ hàng của bạn đang trống
      </h2>

      <p className="text-sm text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
        Không có sản phẩm nào trong giỏ hàng. Hãy khám phá hàng ngàn sản phẩm công nghệ chính hãng với giá ưu đãi tốt nhất ngay hôm nay!
      </p>

      {/* Nút hành động */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/">
          <Button
            size="lg"
            className="w-full sm:w-auto h-11 px-8 bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <span>MUA SẮM NGAY</span>
            <ArrowRight size={16} />
          </Button>
        </Link>
      </div>

      {/* Lợi ích nổi bật */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-10 pt-8 border-t border-slate-100 text-left">
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50">
          <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold text-slate-700">100% Chính hãng</span>
        </div>
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50">
          <Sparkles size={18} className="text-amber-500 shrink-0" />
          <span className="text-xs font-semibold text-slate-700">Ưu đãi độc quyền</span>
        </div>
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50">
          <ShoppingBag size={18} className="text-red-600 shrink-0" />
          <span className="text-xs font-semibold text-slate-700">Miễn phí đổi trả 7 ngày</span>
        </div>
      </div>
    </div>
  );
}
