'use client';

import React from 'react';
import Link from 'next/link';
import { MascotCartEmpty } from '@/components/mascot';
import { Button } from '@/components/ui/button';

export default function CartEmptyState() {
  return (
    <div className="bg-white border border-slate-200 rounded-[6px] p-6 sm:p-10 2xl:p-14 text-center max-w-2xl 2xl:max-w-3xl mx-auto my-6 2xl:my-10 shadow-2xs">
      {/* 1. STUDIO-GRADE MASCOT ANTY SHOPY EMPTY CART */}
      <div className="flex justify-center mb-3 sm:mb-4">
        <MascotCartEmpty size={280} className="sm:scale-105 2xl:scale-115 transition-transform" />
      </div>

      <h2 className="text-lg sm:text-xl 2xl:text-2xl font-bold text-slate-900 mb-2">
        Giỏ hàng của bạn đang trống!
      </h2>

      <p className="text-xs sm:text-sm 2xl:text-base text-slate-500 max-w-md 2xl:max-w-lg mx-auto mb-6 sm:mb-8 leading-relaxed">
        Có vẻ như bạn chưa chọn món đồ ưng ý nào. Hãy khám phá hàng ngàn sản phẩm công nghệ chính hãng với vô vàn ưu đãi hấp dẫn ngay hôm nay!
      </p>

      {/* 2. CTA BUTTON */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/collections/all">
          <Button
            size="lg"
            className="w-full sm:w-auto h-11 px-8 2xl:h-12 2xl:px-10 bg-red-600 hover:bg-red-700 text-white font-bold text-xs 2xl:text-sm flex items-center justify-center rounded-[6px] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
          >
            KHÁM PHÁ SẢN PHẨM NGAY
          </Button>
        </Link>
      </div>
    </div>
  );
}
