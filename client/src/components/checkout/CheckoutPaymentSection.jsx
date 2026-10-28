'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Banknote, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import paymentService from '@/services/payment.service';

const DEFAULT_METHODS = [
  {
    id: 'COD',
    code: 'cod',
    title: 'Thanh toán khi nhận hàng (COD)',
    description: 'Thanh toán tiền mặt cho nhân viên giao hàng khi nhận được kiện hàng',
    badge: 'An tâm',
    icon: Banknote,
  },
  {
    id: 'ONEPAY',
    code: 'onepay',
    title: 'Cổng thanh toán OnePay',
    description: 'Thanh toán trực tuyến bằng thẻ ATM nội địa Napas, thẻ quốc tế Visa/Mastercard hoặc QR',
    badge: '',
    logoImg: '/images/payments/onepay.png',
  },
  {
    id: 'VNPAY',
    code: 'vnpay',
    title: 'Cổng thanh toán VNPAY',
    description: 'Thanh toán quét mã VNPAY-QR, thẻ ATM nội địa Napas hoặc thẻ quốc tế Visa/Mastercard',
    badge: '',
    logoImg: '/images/payments/vnpay.png',
  },
];

const PROVIDER_METADATA = {
  onepay: {
    id: 'ONEPAY',
    title: 'Cổng thanh toán OnePay',
    description: 'Thanh toán trực tuyến bằng thẻ ATM nội địa Napas, thẻ quốc tế Visa/Mastercard hoặc QR',
    badge: '',
    logoImg: '/images/payments/onepay.png',
  },
  vnpay: {
    id: 'VNPAY',
    title: 'Cổng thanh toán VNPAY',
    description: 'Thanh toán quét mã VNPAY-QR, thẻ ATM nội địa Napas hoặc thẻ quốc tế Visa/Mastercard',
    badge: '',
    logoImg: '/images/payments/vnpay.png',
  },
  momo: {
    id: 'MOMO',
    title: 'Ví điện tử MoMo',
    description: 'Thanh toán siêu tốc qua ứng dụng MoMo chỉ với một chạm',
    badge: 'Đang phát triển',
    logoImg: '/images/payments/momo.png',
  },
  zalopay: {
    id: 'ZALOPAY',
    title: 'Cổng thanh toán ZaloPay',
    description: 'Thanh toán nhanh chóng bằng ví ZaloPay hoặc thẻ ngân hàng',
    badge: 'Đang phát triển',
    logoImg: '/images/payments/zalopay.png',
  },
  cod: {
    id: 'COD',
    title: 'Thanh toán khi nhận hàng (COD)',
    description: 'Thanh toán tiền mặt cho nhân viên giao hàng khi nhận được kiện hàng',
    badge: 'An tâm',
    icon: Banknote,
  },
};

export default function CheckoutPaymentSection({
  selectedPaymentMethod = 'COD',
  onSelectPaymentMethod,
  orderNote = '',
  onOrderNoteChange,
  activeProviders = null,
}) {
  const [methods, setMethods] = useState(DEFAULT_METHODS);

  useEffect(() => {
    let isMounted = true;

    const setupProviders = (rawList) => {
      if (!isMounted || !Array.isArray(rawList) || rawList.length === 0) return;

      const mapped = rawList.map((p) => {
        const meta = PROVIDER_METADATA[p.code] || {};
        return {
          id: (meta.id || p.code).toUpperCase(),
          code: p.code,
          title: meta.title || p.name,
          description: meta.description || p.shortDesc,
          badge: meta.badge || '',
          logoImg: meta.logoImg,
          icon: meta.icon || CreditCard,
        };
      });

      setMethods(mapped);

      const exists = mapped.some((m) => m.id === selectedPaymentMethod);
      if (!exists && mapped[0] && onSelectPaymentMethod) {
        onSelectPaymentMethod(mapped[0].id);
      }
    };

    if (activeProviders && activeProviders.length > 0) {
      setupProviders(activeProviders);
    } else {
      paymentService
        .getActivePaymentProviders()
        .then((list) => setupProviders(list))
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [activeProviders, selectedPaymentMethod, onSelectPaymentMethod]);

  return (
    <div className="bg-white border border-slate-200 rounded-[6px] p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[6px] bg-slate-100 flex items-center justify-center text-slate-800">
            <CreditCard size={15} />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            Phương thức thanh toán
          </h2>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
          <ShieldCheck size={13} className="text-emerald-600" />
          <span>Bảo mật 100%</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {methods.map((method) => {
          const isSelected = selectedPaymentMethod === method.id;
          const Icon = method.icon;
          const isSupported = ['COD', 'ONEPAY', 'VNPAY'].includes(method.id);

          return (
            <div key={method.id} className="space-y-2">
              <label
                onClick={() => onSelectPaymentMethod(method.id)}
                className={`flex items-start sm:items-center justify-between p-3 sm:p-3.5 rounded-[6px] border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#0088ff] bg-blue-50/20 ring-1 ring-[#0088ff]'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={isSelected}
                    onChange={() => onSelectPaymentMethod(method.id)}
                    className="mt-0.5 sm:mt-0 text-[#0088ff] focus:ring-[#0088ff] accent-[#0088ff]"
                  />

                  <div className="w-10 h-8 rounded-[4px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 shrink-0 p-0.5 overflow-hidden">
                    {method.logoImg ? (
                      <img
                        src={method.logoImg}
                        alt={method.title}
                        className="max-h-full max-w-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <Icon size={16} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                      <span>{method.title}</span>
                      {method.badge && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] py-0 px-1.5 font-bold bg-amber-100 text-amber-800"
                        >
                          {method.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                      {method.description}
                    </p>
                  </div>
                </div>
              </label>

              {/* Thông báo cho các cổng chưa phát triển (MoMo, ZaloPay) */}
              {isSelected && !isSupported && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-[6px] text-xs text-amber-900 leading-relaxed flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span>
                    Tính năng đặt hàng bằng {method.title} đang phát triển. Quý khách vui lòng chọn <strong>Thanh toán khi nhận hàng (COD)</strong>, <strong>OnePay</strong> hoặc <strong>VNPAY</strong>.
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-3 border-t border-slate-100">
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Ghi chú đơn hàng cho nhân viên giao hàng
        </label>
        <Input
          value={orderNote}
          onChange={(e) => onOrderNoteChange(e.target.value)}
          placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
          className="h-9 text-xs rounded-[6px]"
        />
      </div>
    </div>
  );
}
