'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { StaggerGrid, StaggerItem } from '@/components/common/ScrollReveal';

/**
 * 1. Custom Animated SVG: Ngọn lửa bập bùng (HOT TREND)
 */
export function CustomAnimatedFlameSvg({ className = 'w-4.5 h-4.5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} inline-block shrink-0 overflow-visible`}
      aria-hidden="true"
    >
      <style>{`
        @keyframes flameFlickerMain {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            filter: drop-shadow(0 0 5px rgba(245, 158, 11, 0.7));
          }
          25% {
            transform: scale(1.08, 0.94) rotate(-3deg);
            filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.85));
          }
          50% {
            transform: scale(0.95, 1.06) rotate(2.5deg);
            filter: drop-shadow(0 0 6px rgba(251, 146, 60, 0.75));
          }
          75% {
            transform: scale(1.05, 0.97) rotate(-1.5deg);
            filter: drop-shadow(0 0 9px rgba(220, 38, 38, 0.9));
          }
        }
        @keyframes flameCorePulse {
          0%, 100% {
            transform: scale(1) translateY(0);
            opacity: 0.95;
          }
          50% {
            transform: scale(1.2, 1.1) translateY(-1.5px);
            opacity: 1;
          }
        }
        .anim-flame-body {
          transform-origin: 12px 21px;
          animation: flameFlickerMain 1.6s ease-in-out infinite;
        }
        .anim-flame-core {
          transform-origin: 12px 18px;
          animation: flameCorePulse 1.1s ease-in-out infinite;
        }
      `}</style>
      <defs>
        <linearGradient id="flameOuterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="35%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <linearGradient id="flameCoreGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>
      </defs>

      {/* Lớp ngọn lửa ngoài */}
      <path
        d="M12 2C10.2 4.6 9.8 6.8 9.8 8.8C9.8 7.6 9.2 6.4 8.2 5.4C6 8.2 4.5 11.5 4.5 15.2C4.5 19.5 7.86 22.5 12 22.5C16.14 22.5 19.5 19.5 19.5 15.2C19.5 11 16.8 6.8 12 2Z"
        fill="url(#flameOuterGrad)"
        className="anim-flame-body"
      />
      {/* Lớp nhân lửa vàng/trắng */}
      <path
        d="M12 11C11 12.8 10.2 14.2 10.2 15.6C10.2 17.5 11.02 18.8 12 18.8C12.98 18.8 13.8 17.5 13.8 15.6C13.8 14.2 13 12.8 12 11Z"
        fill="url(#flameCoreGrad)"
        className="anim-flame-core"
      />
    </svg>
  );
}

/**
 * 2. Custom Animated SVG: Chiếc loa phóng thanh rung tỏa sóng âm (HÀNG MỚI VỀ)
 */
export function CustomAnimatedMegaphoneSvg({ className = 'w-4.5 h-4.5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} inline-block shrink-0 overflow-visible`}
      aria-hidden="true"
    >
      <style>{`
        @keyframes hornBounce {
          0%, 100% { transform: rotate(0deg) scale(1); }
          20% { transform: rotate(-8deg) scale(1.08); }
          40% { transform: rotate(5deg) scale(0.96); }
          60% { transform: rotate(-4deg) scale(1.04); }
          80% { transform: rotate(2deg) scale(0.98); }
        }
        @keyframes soundWavePulse1 {
          0% { opacity: 0; transform: scale(0.5) translateX(-2px); }
          50% { opacity: 1; transform: scale(1) translateX(0); }
          100% { opacity: 0; transform: scale(1.4) translateX(2px); }
        }
        @keyframes soundWavePulse2 {
          0%, 20% { opacity: 0; transform: scale(0.5) translateX(-3px); }
          60% { opacity: 1; transform: scale(1) translateX(0); }
          100% { opacity: 0; transform: scale(1.4) translateX(3px); }
        }
        .anim-horn-group {
          transform-origin: 5px 15px;
          animation: hornBounce 2s ease-in-out infinite;
        }
        .anim-sw-1 {
          transform-origin: 14px 12px;
          animation: soundWavePulse1 1.5s ease-out infinite;
        }
        .anim-sw-2 {
          transform-origin: 16px 12px;
          animation: soundWavePulse2 1.5s ease-out infinite;
        }
      `}</style>
      <defs>
        <linearGradient id="hornGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="60%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
      </defs>

      {/* Horn Body Group */}
      <g className="anim-horn-group">
        <path
          d="M3 10.5V13.5C3 14.33 3.67 15 4.5 15H6.5L13.5 19V5L6.5 9H4.5C3.67 9 3 9.67 3 10.5Z"
          fill="url(#hornGrad)"
          stroke="#e0f2fe"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <ellipse cx="13.5" cy="12" rx="1.6" ry="6.5" fill="#bae6fd" stroke="#0284c7" strokeWidth="1" />
        <path
          d="M6.5 15L7.5 19.5C7.7 20.3 8.4 20.8 9.2 20.8C10.1 20.8 10.8 20.1 10.8 19.2V17"
          stroke="#93c5fd"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </g>

      {/* Sóng âm 1 */}
      <path
        d="M16 8.5C17.2 9.5 18 10.7 18 12C18 13.3 17.2 14.5 16 15.5"
        stroke="#fef08a"
        strokeWidth="2.2"
        strokeLinecap="round"
        className="anim-sw-1"
      />
      {/* Sóng âm 2 */}
      <path
        d="M19 6C20.8 7.6 22 9.7 22 12C22 14.3 20.8 16.4 19 18"
        stroke="#fde047"
        strokeWidth="2.2"
        strokeLinecap="round"
        className="anim-sw-2"
      />
    </svg>
  );
}

/**
 * HomeTrendingAndNewArrivals — Chuẩn Thiết Kế CellphoneS 100%:
 * - Tab Active: Nổi bật, mở đáy (-mb-[2px]), có viền xanh #609afa nối liền container
 * - Tab Inactive: Hoàn toàn không viền (border-0), nằm phẳng tự nhiên trên dải tab
 * - Container: bg-[#f4f7fe] viền #609afa bao trọn 10 sản phẩm
 */
export default function HomeTrendingAndNewArrivals({
  trendingProducts = [],
  newArrivalProducts = [],
}) {
  const [activeMainTab, setActiveMainTab] = useState('hot_trend'); // 'hot_trend' | 'new_arrivals'
  const products = activeMainTab === 'hot_trend' ? trendingProducts : newArrivalProducts;

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 my-7" aria-label="Sản phẩm Hot Trend & Hàng Mới Về">
      
      {/* ─── 1. HEADER 2 TABS CHUẨN CELLPHONES (50% MỖI BÊN) ─── */}
      <div className="flex items-end w-full select-none">
        
        {/* TAB 1: SẢN PHẨM HOT TREND */}
        <button
          type="button"
          onClick={() => setActiveMainTab('hot_trend')}
          className={`flex-1 h-12 sm:h-13.5 flex items-center justify-center transition-all duration-150 cursor-pointer ${
            activeMainTab === 'hot_trend'
              ? 'relative z-20 bg-[#f4f7fe] border-2 border-b-0 border-[#609afa] rounded-t-[10px] -mb-[2px]'
              : 'relative z-0 bg-transparent hover:bg-slate-50/50 border-0'
          }`}
        >
          {activeMainTab === 'hot_trend' ? (
            /* ACTIVE: Huy hiệu xanh biển rực rỡ + Flame SVG */
            <div className="flex items-center gap-2 px-4 sm:px-6 py-1.5 rounded-[8px] bg-gradient-to-r from-[#0284c7] via-[#0284c7] to-[#0ea5e9] text-white shadow-xs border border-[#38bdf8]">
              <CustomAnimatedFlameSvg className="w-4.5 h-4.5" />
              <span className="font-black text-xs sm:text-sm text-white tracking-wider uppercase drop-shadow-xs">
                SẢN PHẨM HOT TREND
              </span>
            </div>
          ) : (
            /* INACTIVE: Không border, chỉ có chữ xanh nổi bật */
            <span className="font-black text-xs sm:text-sm md:text-base text-[#2563eb] tracking-tight uppercase hover:text-blue-700 transition-colors">
              SẢN PHẨM HOT TREND
            </span>
          )}
        </button>

        {/* TAB 2: HÀNG MỚI VỀ */}
        <button
          type="button"
          onClick={() => setActiveMainTab('new_arrivals')}
          className={`flex-1 h-12 sm:h-13.5 flex items-center justify-center transition-all duration-150 cursor-pointer ${
            activeMainTab === 'new_arrivals'
              ? 'relative z-20 bg-[#f4f7fe] border-2 border-b-0 border-[#609afa] rounded-t-[10px] -mb-[2px]'
              : 'relative z-0 bg-transparent hover:bg-slate-50/50 border-0'
          }`}
        >
          {activeMainTab === 'new_arrivals' ? (
            /* ACTIVE: Huy hiệu xanh Royal + Megaphone SVG */
            <div className="flex items-center gap-2 px-4 sm:px-6 py-1.5 rounded-[8px] bg-gradient-to-r from-[#1e40af] via-[#2563eb] to-[#0284c7] text-white shadow-xs border border-[#93c5fd]">
              <CustomAnimatedMegaphoneSvg className="w-4.5 h-4.5" />
              <span className="font-black text-xs sm:text-sm text-white tracking-wider uppercase drop-shadow-xs">
                HÀNG MỚI VỀ
              </span>
            </div>
          ) : (
            /* INACTIVE: Không border, chỉ có chữ xanh nổi bật */
            <span className="font-black text-xs sm:text-sm md:text-base text-[#2563eb] tracking-tight uppercase hover:text-blue-700 transition-colors">
              HÀNG MỚI VỀ
            </span>
          )}
        </button>

      </div>

      {/* ─── 2. KHUNG CHÍNH bg-[#f4f7fe] VIỀN #609afa ─── */}
      <div className={`relative z-10 bg-[#f4f7fe] border-2 border-[#609afa] rounded-b-[10px] ${
        activeMainTab === 'hot_trend' ? 'rounded-tr-[10px]' : 'rounded-tl-[10px]'
      } p-3 sm:p-4 shadow-[0_4px_20px_rgba(96,154,250,0.06)]`}>
        
        {/* ─── 3. LƯỚI SẢN PHẨM: 5 CỘT (2 HÀNG X 5 CỘT = 10 ITEMS) ─── */}
        <StaggerGrid
          key={activeMainTab}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3"
        >
          {products.slice(0, 10).map((prod) => (
            <StaggerItem key={prod._id || prod.id} className="h-full">
              <ProductCard product={prod} />
            </StaggerItem>
          ))}
        </StaggerGrid>

        {/* NÚT XEM TẤT CẢ */}
        <div className="mt-4 flex justify-center">
          <Link
            href={`/collections/${activeMainTab === 'hot_trend' ? 'hot' : 'new'}`}
            className="inline-flex items-center gap-1.5 px-6 py-2 rounded-[6px] bg-white border border-[#609afa] text-[#2563eb] text-xs sm:text-sm font-bold hover:bg-blue-50 transition-colors shadow-2xs"
          >
            <span>{activeMainTab === 'hot_trend' ? 'Xem tất cả Sản phẩm Hot Trend' : 'Xem tất cả Hàng Mới Về'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
