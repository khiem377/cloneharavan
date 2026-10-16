'use client';

import React from 'react';
import Link from 'next/link';

/**
 * CartCheckoutSteps — Professional Minimalist Checkout Stepper (GearVN / HACOM Style)
 * Thiết kế chuẩn mực E-Commerce chuyên nghiệp:
 * - Tab phẳng, phân cấp thị giác sắc nét với viền 1px
 * - Icon target/radio ⊙ biểu thị bước hiện tại, ◯ cho bước sau
 * - Không lạm dụng icon hoạt hình rườm rà, tập trung vào trải nghiệm mua sắm mượt mà
 */
export default function CartCheckoutSteps({ currentStep = 1 }) {
  const steps = [
    { id: 1, title: 'Giỏ hàng', href: '/cart' },
    { id: 2, title: 'Thông tin giao hàng', href: '/checkout' },
    { id: 3, title: 'Hoàn tất đơn hàng', href: '#' },
  ];

  return (
    <div className="w-full bg-white border border-slate-200 rounded-[6px] p-2.5 sm:p-3 2xl:p-3.5 mb-4 sm:mb-6 shadow-2xs">
      <nav aria-label="Tiến trình đặt hàng">
        <ol className="grid grid-cols-3 gap-2 sm:gap-4 max-w-3xl 2xl:max-w-4xl mx-auto">
          {steps.map((step) => {
            const isActive = step.id === currentStep;
            const isDone = step.id < currentStep;
            const isClickable = isDone && step.href !== '#';

            const StepCard = (
              <div
                className={`flex items-center justify-center gap-2 sm:gap-2.5 py-2 sm:py-2.5 px-2 sm:px-4 rounded-[6px] transition-all select-none ${
                  isActive
                    ? 'bg-blue-50/80 border border-[#284ea1] text-[#284ea1] font-bold shadow-2xs'
                    : isDone
                    ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium border border-slate-200 cursor-pointer'
                    : 'bg-transparent text-slate-400 font-normal border border-transparent'
                }`}
              >
                {/* Icon radio indicator */}
                {isActive ? (
                  <span className="w-4 h-4 rounded-full border-2 border-[#284ea1] flex items-center justify-center shrink-0">
                    <span className="w-2 h-2 rounded-full bg-[#284ea1]" />
                  </span>
                ) : isDone ? (
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    ✓
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                )}

                {/* Tiêu đề bước */}
                <span className="text-xs sm:text-sm 2xl:text-base whitespace-nowrap truncate">
                  {step.title}
                </span>
              </div>
            );

            return (
              <li key={step.id}>
                {isClickable ? (
                  <Link href={step.href} className="block group">
                    {StepCard}
                  </Link>
                ) : (
                  StepCard
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
