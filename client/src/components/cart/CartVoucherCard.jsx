'use client';

import React, { useState } from 'react';
import useCartStore from '@/store/cartStore';
import CartVoucherModal from './CartVoucherModal';
import { Button } from '@/components/ui/button';

export default function CartVoucherCard() {
  const { cart, removeCoupon, isUpdating, getSelectedCouponDiscount, getSelectedSubtotal } = useCartStore();
  const [modalOpen, setModalOpen] = useState(false);

  const formatPrice = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  const effectiveCouponDiscount = getSelectedCouponDiscount
    ? getSelectedCouponDiscount()
    : Number(cart?.couponDiscount) || 0;
  const hasAppliedCoupon = Boolean(cart?.couponCode) && effectiveCouponDiscount > 0;

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-[6px] p-3.5 sm:p-4 2xl:p-5 shadow-2xs">
        <div className="flex items-center justify-between gap-3">
          {/* NỘI DUNG VOUCHER */}
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>Voucher giảm giá</span>
              {hasAppliedCoupon && (
                <span className="text-[10px] font-mono tabular-nums bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-[4px] font-bold">
                  -{formatPrice(effectiveCouponDiscount)}
                </span>
              )}
            </div>
            <p className="text-[11px] 2xl:text-xs text-slate-500 truncate mt-0.5">
              {hasAppliedCoupon
                ? `Đang áp dụng mã ${cart.couponCode}`
                : 'Áp dụng mã giảm giá để tiết kiệm thêm'}
            </p>
          </div>

          {/* NÚT HÀNH ĐỘNG (CHỌN MÃ / ĐỔI MÃ) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {hasAppliedCoupon ? (
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => removeCoupon()}
                  disabled={isUpdating}
                  className="h-8 px-2.5 text-xs text-slate-600 hover:text-red-600 border-slate-200 rounded-[6px] cursor-pointer"
                  title="Gỡ mã giảm giá"
                >
                  Gỡ
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setModalOpen(true)}
                  className="h-8 px-3 text-xs font-bold bg-[#284ea1] hover:bg-[#1e3b82] text-white rounded-[6px] active:scale-[0.98] transition cursor-pointer"
                >
                  Đổi mã
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={() => setModalOpen(true)}
                className="h-8 2xl:h-9 px-4 text-xs 2xl:text-sm font-bold bg-[#284ea1] hover:bg-[#1e3b82] text-white rounded-[6px] active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
              >
                Chọn mã
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* MODAL TRA CỨU & ÁP DỤNG VOUCHER */}
      <CartVoucherModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        appliedCode={cart?.couponCode}
        appliedDiscount={effectiveCouponDiscount}
        orderSubtotal={getSelectedSubtotal ? getSelectedSubtotal() : undefined}
      />
    </>
  );
}
