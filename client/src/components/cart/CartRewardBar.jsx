'use client';

import React from 'react';
import { Truck, TicketPercent, Gift, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const MILESTONES = [
  {
    target: 500000,
    title: 'Freeship',
    description: 'Miễn phí vận chuyển',
    icon: Truck,
  },
  {
    target: 2000000,
    title: 'Voucher 100k',
    description: 'Tặng voucher 100.000₫',
    icon: TicketPercent,
  },
  {
    target: 5000000,
    title: 'Quà 0đ',
    description: 'Bộ quà công nghệ 0₫',
    icon: Gift,
  },
];

const MAX_TARGET = 5000000;

export default function CartRewardBar({ subtotal = 0 }) {
  const currentSubtotal = Math.max(0, Number(subtotal) || 0);

  // Tính phần trăm tiến trình
  const progressPercent = Math.min(100, Math.round((currentSubtotal / MAX_TARGET) * 100));

  // Tìm mốc tiếp theo chưa đạt được
  const nextMilestone = MILESTONES.find((m) => currentSubtotal < m.target);
  const remaining = nextMilestone ? nextMilestone.target - currentSubtotal : 0;

  const formatPrice = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs">
      {/* Tiêu đề & Thông điệp mốc thưởng */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-red-600 block mb-0.5">
            Ưu đãi đơn hàng
          </span>
          <p className="text-sm font-medium text-slate-800">
            {nextMilestone ? (
              <>
                Mua thêm{' '}
                <span className="font-bold text-red-600">{formatPrice(remaining)}</span> để nhận{' '}
                <span className="font-bold text-slate-900">{nextMilestone.description}</span>!
              </>
            ) : (
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                Tuyệt vời! Bạn đã mở khóa toàn bộ đặc quyền ưu đãi của đơn hàng 🎉
              </span>
            )}
          </p>
        </div>

        <div className="text-xs font-medium text-slate-500 shrink-0">
          Tạm tính: <strong className="text-slate-900">{formatPrice(currentSubtotal)}</strong>
        </div>
      </div>

      {/* Thanh tiến trình */}
      <div className="relative pt-1 pb-3">
        <Progress
          value={progressPercent}
          className="h-2.5 bg-slate-100 rounded-full"
        />

        {/* Các mốc đánh dấu */}
        <div className="grid grid-cols-3 gap-2 mt-3.5">
          {MILESTONES.map((m) => {
            const isReached = currentSubtotal >= m.target;
            const IconComponent = m.icon;

            return (
              <div
                key={m.target}
                className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                  isReached
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                    : 'bg-slate-50/60 border-slate-200/70 text-slate-600'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    isReached
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <IconComponent size={14} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold leading-tight truncate">
                    {m.title}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight truncate">
                    Đơn từ {m.target >= 1000000 ? `${m.target / 1000000}tr` : `${m.target / 1000}k`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
