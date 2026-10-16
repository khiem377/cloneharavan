'use client';

import React from 'react';
import HomeComboCard from './HomeComboCard';
import { StaggerGrid, StaggerItem } from '@/components/common/ScrollReveal';

/**
 * HomeComboSection — Khung Combo Siêu Tiết Kiệm chuẩn Flat Design & Lazy Load:
 * - Đồng bộ bề ngang 1536px / 1600px như toàn bộ Homepage
 * - Nền trắng phẳng, viền 1px slate-200 thanh lịch, không viền đỏ, không icon rườm rà
 * - Hỗ trợ StaggerGrid & StaggerItem lazy reveal khi cuộn tới khung nhìn
 */
export default function HomeComboSection({ combos = [] }) {
  if (!Array.isArray(combos) || combos.length === 0) {
    return null;
  }

  return (
    <section
      className="max-w-[1536px] 2xl:max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8 my-6"
      aria-label="Combo Siêu Tiết Kiệm"
    >
      <div className="bg-white rounded-[6px] border border-slate-200 p-4 sm:p-5 2xl:p-6">
        {/* Header section phẳng, sạch sẽ, không icon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-tight">
                Combo Siêu Tiết Kiệm
              </h2>
              <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-[4px] uppercase">
                Tiết kiệm tối đa
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Mua trọn bộ thiết bị đồng bộ, giá ưu đãi hơn so với mua lẻ từng sản phẩm
            </p>
          </div>

          <div className="text-xs text-slate-500 font-medium self-start sm:self-auto">
            Hiện có <strong className="font-mono text-slate-900">{combos.length}</strong> gói ưu đãi
          </div>
        </div>

        {/* Danh sách 4 thẻ combo (Tích hợp StaggerGrid lazy viewport) */}
        <StaggerGrid className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {combos.map((combo) => (
            <StaggerItem key={combo._id}>
              <HomeComboCard combo={combo} />
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
