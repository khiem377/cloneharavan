'use client';

import React from 'react';
import { Check, Clock, Package, Truck } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Đặt hàng', desc: 'Đã hoàn tất', icon: Check, status: 'completed' },
  { id: 2, label: 'Thanh toán OnePay', desc: 'Đã thanh toán', icon: Check, status: 'completed' },
  { id: 3, label: 'Chuẩn bị đơn hàng', desc: 'Đang xử lý tại kho', icon: Package, status: 'current' },
  { id: 4, label: 'Giao hàng', desc: 'Dự kiến 2-3 ngày', icon: Truck, status: 'upcoming' },
];

export default function OrderSuccessTimeline() {
  return (
    <div className="bg-white border border-slate-200 rounded-[6px] p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-[#0088ff]" />
          <h3 className="text-sm font-bold text-slate-900">
            Tiến trình xử lý đơn hàng
          </h3>
        </div>
        <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-[4px] font-semibold">
          Giao hàng tiêu chuẩn GHN
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
        {STEPS.map((step, idx) => {
          const isDone = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`p-3 rounded-[6px] border text-left space-y-1.5 transition ${
                isDone
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : isCurrent
                    ? 'bg-blue-50/40 border-[#0088ff] ring-1 ring-[#0088ff]/30'
                    : 'bg-slate-50/50 border-slate-200 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  0{idx + 1}
                </span>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                        ? 'bg-[#0088ff] text-white animate-pulse'
                        : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <Icon size={12} />
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {step.label}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {step.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
