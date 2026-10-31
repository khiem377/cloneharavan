'use client';

import React, { useState, useEffect, useMemo } from 'react';
import couponService from '@/services/coupon.service';
import useCartStore from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import CartVoucherCard from './CartVoucherCard';
import CartAppliedVouchers from './CartAppliedVouchers';

export default function CartVoucherModal({
  isOpen,
  onClose,
  appliedCode,
  appliedDiscount,
  appliedShippingCode,
  appliedShippingDiscount,
  orderSubtotal,
  onApply,
  onRemove,
}) {
  const { cart, applyCoupon, removeCoupon, isUpdating } = useCartStore();
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('order');
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const currentCouponCode = appliedCode !== undefined ? appliedCode : cart?.couponCode;
  const currentCouponDiscount = appliedDiscount !== undefined ? appliedDiscount : cart?.couponDiscount;
  const currentShippingCode = appliedShippingCode !== undefined ? appliedShippingCode : cart?.shippingCouponCode;
  const currentShippingDiscount = appliedShippingDiscount !== undefined ? appliedShippingDiscount : 0;

  const currentSubtotal =
    orderSubtotal !== undefined
      ? Number(orderSubtotal) || 0
      : Number(cart?.subtotal) || Number(cart?.subtotalOriginal) || 0;

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setInputCode('');
      loadCoupons();
    }
  }, [isOpen]);

  const loadCoupons = async () => {
    setIsLoading(true);
    try {
      const list = await couponService.getActiveCoupons(50);
      setCoupons(Array.isArray(list) ? list : []);
    } catch {
      setCoupons([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyCode = async (codeToApply, forcedCategory = null) => {
    const code = (codeToApply || inputCode).trim().toUpperCase();
    if (!code) {
      setErrorMsg('Vui lòng nhập mã giảm giá');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');

    const matched = coupons.find((c) => c.code === code);
    const category = forcedCategory || matched?.category || activeTab;

    let res;
    if (typeof onApply === 'function') {
      res = await onApply(code, category);
    } else {
      res = await applyCoupon(code, category);
    }

    if (res?.success) {
      setSuccessMsg(res.message || `Đã áp dụng thành công mã ${code}`);
      setTimeout(() => setSuccessMsg(''), 2500);
    } else {
      setErrorMsg(res?.message || 'Mã giảm giá không hợp lệ hoặc không đủ điều kiện');
    }
  };

  const handleRemove = async (category) => {
    setErrorMsg('');
    setSuccessMsg('');
    let res;
    if (typeof onRemove === 'function') {
      res = await onRemove(category);
    } else {
      res = await removeCoupon(category);
    }
    if (res?.success !== false) {
      setSuccessMsg(category === 'shipping' ? 'Đã gỡ mã vận chuyển' : 'Đã gỡ mã giảm giá đơn');
      setTimeout(() => setSuccessMsg(''), 2000);
    }
  };

  const formatPrice = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  const tabCoupons = useMemo(() => {
    return coupons.filter((c) => (c.category || 'order') === activeTab);
  }, [coupons, activeTab]);

  const eligibleCoupons = useMemo(() => {
    return tabCoupons.filter((c) => !c.minOrderValue || currentSubtotal >= c.minOrderValue);
  }, [tabCoupons, currentSubtotal]);

  const ineligibleCoupons = useMemo(() => {
    return tabCoupons.filter((c) => c.minOrderValue && currentSubtotal < c.minOrderValue);
  }, [tabCoupons, currentSubtotal]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-[6px] gap-0 flex flex-col max-h-[90vh]">
        <DialogHeader className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
          <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#284ea1]" />
            <span>Ưu đãi &amp; Voucher</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 pt-2 shrink-0 gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setActiveTab('order')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 rounded-none h-auto transition flex items-center gap-1.5 ${
              activeTab === 'order'
                ? 'border-[#284ea1] text-[#284ea1] bg-transparent'
                : 'border-transparent text-slate-500 hover:text-slate-800 bg-transparent'
            }`}
          >
            <span>Voucher giảm giá</span>
            {currentCouponCode && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => setActiveTab('shipping')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 rounded-none h-auto transition flex items-center gap-1.5 ${
              activeTab === 'shipping'
                ? 'border-sky-600 text-sky-700 bg-transparent'
                : 'border-transparent text-slate-500 hover:text-slate-800 bg-transparent'
            }`}
          >
            <span>Voucher vận chuyển (Freeship)</span>
            {currentShippingCode && <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />}
          </Button>
        </div>

        <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <Input
                placeholder={activeTab === 'shipping' ? 'Nhập mã voucher freeship...' : 'Nhập mã voucher giảm giá...'}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyCode();
                }}
                className="text-xs sm:text-sm h-10 rounded-[6px] font-mono uppercase tracking-wider border-slate-300 focus:border-[#284ea1]"
              />
              <Button
                type="button"
                onClick={() => handleApplyCode()}
                disabled={!inputCode.trim() || isUpdating}
                className="h-10 px-5 bg-[#284ea1] hover:bg-[#1e3b82] text-white font-bold text-xs rounded-[6px] shrink-0 active:scale-[0.98]"
              >
                Áp dụng
              </Button>
            </div>

            {errorMsg && <p className="text-xs text-red-600 font-medium mt-1">{errorMsg}</p>}
            {successMsg && <p className="text-xs text-emerald-600 font-semibold mt-1">✓ {successMsg}</p>}
          </div>

          <CartAppliedVouchers
            currentCouponCode={currentCouponCode}
            currentCouponDiscount={currentCouponDiscount}
            currentShippingCode={currentShippingCode}
            currentShippingDiscount={currentShippingDiscount}
            onRemove={handleRemove}
            formatPrice={formatPrice}
          />

          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>Mã khả dụng ({eligibleCoupons.length})</span>
              <span className="text-[11px] text-slate-400 font-normal">
                {activeTab === 'shipping' ? 'Chỉ áp dụng vào phí vận chuyển' : 'Áp dụng vào tổng tiền hàng'}
              </span>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-slate-200 border-t-[#284ea1] rounded-full animate-spin" />
                <span>Đang tải danh sách voucher...</span>
              </div>
            ) : eligibleCoupons.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-[6px] text-center text-xs text-slate-500 border border-slate-200">
                Không có voucher {activeTab === 'shipping' ? 'vận chuyển' : 'giảm giá'} nào phù hợp cho đơn hàng này.
              </div>
            ) : (
              <div className="space-y-2">
                {eligibleCoupons.map((coupon) => (
                  <CartVoucherCard
                    key={coupon._id}
                    coupon={coupon}
                    isApplied={
                      coupon.category === 'shipping'
                        ? currentShippingCode === coupon.code
                        : currentCouponCode === coupon.code
                    }
                    isEligible={true}
                    currentSubtotal={currentSubtotal}
                    isUpdating={isUpdating}
                    onApply={handleApplyCode}
                  />
                ))}
              </div>
            )}

            {ineligibleCoupons.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Chưa đủ điều kiện ({ineligibleCoupons.length})
                </div>
                <div className="space-y-1.5 opacity-75">
                  {ineligibleCoupons.map((coupon) => (
                    <CartVoucherCard
                      key={coupon._id}
                      coupon={coupon}
                      isApplied={false}
                      isEligible={false}
                      currentSubtotal={currentSubtotal}
                      isUpdating={isUpdating}
                      onApply={handleApplyCode}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex flex-row items-center justify-between sm:justify-between">
          <div className="text-xs text-slate-600">
            Có thể chọn đồng thời <strong>1 Voucher đơn</strong> + <strong>1 Freeship</strong>
          </div>
          <Button
            type="button"
            onClick={onClose}
            className="h-8 px-5 bg-[#284ea1] hover:bg-[#1e3b82] text-white text-xs font-bold rounded-[6px]"
          >
            Xong
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
