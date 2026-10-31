'use client';

import React from 'react';
import Link from 'next/link';
import { Clock } from 'lucide-react';

export default function FlashSaleHeader({ activeSale, timeLeft, formatDateRange }) {
  return (
    <div className="bg-white border-b border-slate-200 py-3.5 sm:py-4">
      <div className="max-w-[1536px] 2xl:max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400 mb-2.5 font-medium">
          <Link href="/" className="hover:text-slate-800 transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-slate-700 font-semibold">Flash Sale</span>
          {activeSale?.name && (
            <>
              <span>/</span>
              <span className="text-red-600 font-bold truncate max-w-[200px] sm:max-w-md">
                {activeSale.name}
              </span>
            </>
          )}
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          {/* Title & Timing Info */}
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 [text-wrap:balance]">
              {activeSale?.name || 'FLASH SALE ONLINE'}
            </h1>
            {activeSale?.startDate && activeSale?.endDate && (
              <p className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
                Thời gian áp dụng: {formatDateRange(activeSale.startDate, activeSale.endDate)}
              </p>
            )}
          </div>

          {/* Countdown Clock Box */}
          <div className="bg-slate-900 text-white rounded-[6px] px-3.5 py-2 flex items-center justify-between sm:justify-start gap-3 shrink-0 border border-slate-800">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Clock size={14} className="shrink-0" />
              <span>Kết thúc sau:</span>
            </div>

            <div className="flex items-center gap-1 text-center font-mono tabular-nums font-bold">
              {timeLeft.days > 0 && (
                <>
                  <span className="w-7 py-1 rounded-[4px] bg-slate-800 text-white text-xs sm:text-sm">
                    {String(timeLeft.days).padStart(2, '0')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-sans">d</span>
                </>
              )}
              <span className="w-7 py-1 rounded-[4px] bg-slate-800 text-white text-xs sm:text-sm">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-slate-500">:</span>
              <span className="w-7 py-1 rounded-[4px] bg-slate-800 text-white text-xs sm:text-sm">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-slate-500">:</span>
              <span className="w-7 py-1 rounded-[4px] bg-red-600 text-white text-xs sm:text-sm">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
