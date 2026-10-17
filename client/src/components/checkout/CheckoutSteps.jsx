'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, MapPin, Truck, CheckCircle2 } from 'lucide-react';

export default function CheckoutSteps({
  layoutType = 'one_step',
  currentStep = 1,
  onStepClick = null,
}) {
  if (layoutType === 'three_step') {
    const threeSteps = [
      { step: 1, label: 'Thông tin nhận hàng', icon: MapPin },
      { step: 2, label: 'Vận chuyển & Thanh toán', icon: Truck },
      { step: 3, label: 'Xác nhận đơn hàng', icon: CheckCircle2 },
    ];

    return (
      <div className="w-full bg-white border border-slate-200 rounded-[6px] p-3 sm:p-4 mb-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {threeSteps.map((item, idx) => {
            const Icon = item.icon;
            const isCurrent = currentStep === item.step;
            const isDone = currentStep > item.step;
            const isClickable = isDone && typeof onStepClick === 'function';

            return (
              <React.Fragment key={item.step}>
                <div
                  onClick={() => isClickable && onStepClick(item.step)}
                  className={`flex items-center gap-2 select-none ${
                    isClickable ? 'cursor-pointer hover:opacity-80 transition' : ''
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-[6px] flex items-center justify-center text-xs font-bold transition-colors ${
                      isCurrent
                        ? 'bg-[#0088ff] text-white shadow-xs'
                        : isDone
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Icon size={14} />
                  </div>
                  <span
                    className={`text-xs sm:text-[13px] font-semibold transition-colors ${
                      isCurrent
                        ? 'text-[#0088ff]'
                        : isDone
                        ? 'text-slate-900'
                        : 'text-slate-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                {idx < threeSteps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-colors ${
                      currentStep > idx + 1 ? 'bg-slate-900' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  // Layout 1 bước: Giỏ hàng -> Thanh toán -> Hoàn tất
  const oneSteps = [
    { step: 1, label: 'Giỏ hàng', href: '/cart', icon: ShoppingBag },
    { step: 2, label: 'Thanh toán đơn hàng', href: '#', icon: MapPin },
    { step: 3, label: 'Hoàn tất', href: '#', icon: CheckCircle2 },
  ];

  return (
    <div className="w-full bg-white border border-slate-200 rounded-[6px] p-3 sm:p-4 mb-4">
      <div className="flex items-center justify-between max-w-xl mx-auto">
        {oneSteps.map((item, idx) => {
          const Icon = item.icon;
          const isCurrent = item.step === 2;
          const isDone = item.step < 2;

          const content = (
            <div className="flex items-center gap-2 select-none">
              <div
                className={`w-7 h-7 rounded-[6px] flex items-center justify-center text-xs font-bold transition-colors ${
                  isCurrent
                    ? 'bg-[#0088ff] text-white shadow-xs'
                    : isDone
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <Icon size={14} />
              </div>
              <span
                className={`text-xs sm:text-[13px] font-semibold transition-colors ${
                  isCurrent
                    ? 'text-[#0088ff]'
                    : isDone
                    ? 'text-slate-900'
                    : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </div>
          );

          return (
            <React.Fragment key={item.step}>
              {item.href !== '#' && isDone ? (
                <Link href={item.href} className="hover:opacity-80 transition cursor-pointer">
                  {content}
                </Link>
              ) : (
                <div>{content}</div>
              )}

              {idx < oneSteps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-colors ${
                    item.step < 2 ? 'bg-slate-900' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
