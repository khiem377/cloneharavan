'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MascotBot from './MascotBot';

function CustomWavingHandSvg({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} inline-block shrink-0`}
      aria-hidden="true"
    >
      <style>
        {`
          @keyframes customHandWave {
            0%, 100% { transform: rotate(0deg); }
            20% { transform: rotate(14deg); }
            40% { transform: rotate(-8deg); }
            60% { transform: rotate(14deg); }
            80% { transform: rotate(-4deg); }
          }
          .animate-svg-hand-wave {
            transform-origin: 75% 85%;
            animation: customHandWave 1.4s ease-in-out infinite;
          }
        `}
      </style>
      <g className="animate-svg-hand-wave">
        <path
          d="M8 10.5V5.5C8 4.67 8.67 4 9.5 4C10.33 4 11 4.67 11 5.5V10M11 8.5V3.5C11 2.67 11.67 2 12.5 2C13.33 2 14 2.67 14 3.5V10M14 8.5V5C14 4.17 14.67 3.5 15.5 3.5C16.33 3.5 17 4.17 17 5V10.5M17 9.5C17 8.67 17.67 8 18.5 8C19.33 8 20 8.67 20 9.5V13.5C20 17.09 17.09 20 13.5 20C9.91 20 7 17.09 7 13.5V9.5C7 8.67 7.67 8 8.5 8C9.33 8 10 8.67 10 9.5"
          fill="#FBBF24"
          stroke="#D97706"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 14.5C11 15.8 12.5 16.5 14.5 16.5"
          stroke="#B45309"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export default function ChatTriggerButton({
  isOpen,
  onOpen,
  showPill,
  onClosePill,
  isProductPage,
  isCartPage,
}) {
  if (isOpen) return null;

  return (
    <div
      className={`fixed z-50 flex items-end gap-2.5 select-none transition-all duration-200 ${
        isCartPage
          ? 'bottom-[175px] right-4 sm:bottom-[185px] sm:right-6'
          : isProductPage
          ? 'bottom-20 right-3 sm:bottom-22 sm:right-6'
          : 'bottom-4 right-3 sm:bottom-6 sm:right-6'
      }`}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      {showPill && (
        <div className="relative mb-2 sm:mb-3 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-[calc(100vw-90px)] sm:max-w-none">
          <div
            onClick={onOpen}
            className="relative bg-white text-slate-800 text-[11px] sm:text-xs font-semibold py-1.5 px-3 sm:py-2 sm:px-3.5 rounded-[6px] shadow-xs border border-slate-200 flex items-center gap-1.5 sm:gap-2 cursor-pointer active:scale-[0.98] transition-all hover:shadow-sm hover:border-slate-300 group"
          >
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>

            <span className="text-slate-800 group-hover:text-blue-600 transition-colors truncate">
              Anh/chị cần hỗ trợ gì ạ?
            </span>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onClosePill();
              }}
              className="h-5 w-5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-0 shrink-0"
              aria-label="Đóng thông báo"
            >
              <X className="size-3 sm:size-3.5" />
            </Button>

            <div className="absolute right-[-5px] bottom-2.5 sm:bottom-3 w-2.5 h-2.5 bg-white border-r border-b border-slate-200 rotate-[-45deg]" />
          </div>
        </div>
      )}

      <div className="relative group shrink-0">
        <Button
          type="button"
          variant="ghost"
          onClick={onOpen}
          className="relative h-auto p-0 flex items-center justify-center transition-transform active:scale-95 rounded-full hover:bg-transparent"
          aria-label="Mở trợ lý tư vấn SHOP"
        >
          <div className="w-[54px] h-[62px] sm:w-[68px] sm:h-[78px] flex items-center justify-center">
            <MascotBot size="100%" isWaving={true} />
          </div>

          <span
            className="absolute bottom-1.5 right-1 sm:bottom-2 sm:right-1.5 flex h-3 w-3 sm:h-3.5 sm:w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white shadow-xs"
            title="Đang trực tuyến"
          >
            <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-white animate-pulse" />
          </span>

          <span className="hidden sm:flex absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-medium px-2.5 py-1 rounded-[6px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none shadow-sm border border-slate-700/80 items-center gap-1.5 z-10">
            <span>Tư vấn ngay</span>
            <CustomWavingHandSvg className="w-3.5 h-3.5" />
          </span>
        </Button>
      </div>
    </div>
  );
}

