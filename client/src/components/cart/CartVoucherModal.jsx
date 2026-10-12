'use client';

import React, { useState, useEffect } from 'react';
import couponService from '@/services/coupon.service';
import useCartStore from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CartVoucherModal({ isOpen, onClose }) {
  const { cart, applyCoupon, removeCoupon, isUpdating } = useCartStore();
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const cartSubtotal = Number(cart?.subtotal) || Number(cart?.subtotalOriginal) || 0;

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
    } catch (err) {
      console.error('Error fetching coupons:', err);
      setCoupons([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyCode = async (codeToApply) => {
    const code = (codeToApply || inputCode).trim().toUpperCase();
    if (!code) {
      setErrorMsg('Vui lòng nhập mã giảm giá');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');

    const res = await applyCoupon(code);
    if (res.success) {
      setSuccessMsg(res.message || `Đã áp dụng thành công mã ${code}`);
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setErrorMsg(res.message || 'Mã giảm giá không hợp lệ hoặc không đủ điều kiện');
    }
  };

  const handleRemove = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    const res = await removeCoupon();
    if (res.success) {
      setSuccessMsg('Đã gỡ mã giảm giá');
    }
  };

  const formatPrice = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  if (!isOpen) return null;

  // Phân loại voucher hợp lệ và chưa đủ điều kiện
  const eligibleCoupons = coupons.filter(
    (c) => !c.minOrderValue || cartSubtotal >= c.minOrderValue
  );
  const ineligibleCoupons = coupons.filter(
    (c) => c.minOrderValue && cartSubtotal < c.minOrderValue
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn select-none">
      <div
        className="bg-white border border-slate-200 rounded-[6px] w-full max-w-lg overflow-hidden shadow-xl flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#284ea1]" />
            <h3 className="text-base font-bold text-slate-900">Chọn Voucher giảm giá</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-[4px] text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer text-sm font-bold"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {/* BODY MODAL */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Ô nhập mã trực tiếp */}
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <Input
                placeholder="Nhập mã voucher giảm giá..."
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
                className="h-10 px-5 bg-[#284ea1] hover:bg-[#1e3b82] text-white font-bold text-xs rounded-[6px] shrink-0 active:scale-[0.98] transition cursor-pointer"
              >
                Áp dụng
              </Button>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                <span>{errorMsg}</span>
              </p>
            )}

            {successMsg && (
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <span>✓ {successMsg}</span>
              </p>
            )}
          </div>

          {/* VOUCHER ĐANG ĐƯỢC ÁP DỤNG NẾU CÓ */}
          {cart?.couponCode && (
            <div className="p-3 bg-red-50/70 border border-red-200 rounded-[6px] flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                  <span>Mã đang dùng: <strong>{cart.couponCode}</strong></span>
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Giảm: <strong className="text-red-600 font-mono tabular-nums">{formatPrice(cart.couponDiscount || 0)}</strong>
                </div>
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleRemove}
                disabled={isUpdating}
                className="h-7 px-3 text-xs text-slate-700 hover:text-red-600 border-slate-300 rounded-[4px] cursor-pointer"
              >
                Gỡ mã
              </Button>
            </div>
          )}

          {/* DANH SÁCH VOUCHER PHÙ HỢP */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Mã giảm giá khả dụng ({eligibleCoupons.length})
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-slate-200 border-t-[#284ea1] rounded-full animate-spin" />
                <span>Đang tải danh sách voucher phù hợp...</span>
              </div>
            ) : eligibleCoupons.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-[6px] text-center text-xs text-slate-500 border border-slate-200/80">
                Không có voucher khả dụng cho đơn hàng hiện tại.
              </div>
            ) : (
              <div className="space-y-2.5">
                {eligibleCoupons.map((coupon) => {
                  const isApplied = cart?.couponCode === coupon.code;
                  const discountDisplay =
                    coupon.type === 'percent'
                      ? `Giảm ${coupon.value}%${coupon.maxDiscount ? ` (Tối đa ${formatPrice(coupon.maxDiscount)})` : ''}`
                      : `Giảm ${formatPrice(coupon.value)}`;

                  return (
                    <div
                      key={coupon._id}
                      className={`p-3 rounded-[6px] border transition-all flex items-start justify-between gap-3 ${
                        isApplied
                          ? 'bg-blue-50/60 border-[#284ea1] ring-1 ring-[#284ea1]'
                          : 'bg-white border-slate-200 hover:border-[#284ea1]/50'
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono tabular-nums font-bold text-xs sm:text-sm text-[#284ea1] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-[4px]">
                            {coupon.code}
                          </span>
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {coupon.name}
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-slate-700">
                          {discountDisplay}
                        </div>

                        {coupon.minOrderValue > 0 && (
                          <div className="text-[11px] text-slate-500">
                            Đơn tối thiểu: <span className="font-mono tabular-nums">{formatPrice(coupon.minOrderValue)}</span>
                          </div>
                        )}

                        <div className="text-[10.5px] text-slate-400">
                          HSD: {formatDate(coupon.endDate)}
                        </div>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleApplyCode(coupon.code)}
                        disabled={isApplied || isUpdating}
                        className={`h-8 px-4 text-xs font-bold rounded-[4px] shrink-0 transition cursor-pointer ${
                          isApplied
                            ? 'bg-emerald-600 text-white cursor-default'
                            : 'bg-[#284ea1] hover:bg-[#1e3b82] text-white'
                        }`}
                      >
                        {isApplied ? 'Đang dùng' : 'Áp dụng'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* DANH SÁCH VOUCHER CHƯA ĐỦ ĐIỀU KIỆN */}
            {ineligibleCoupons.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Chưa đủ điều kiện ({ineligibleCoupons.length})
                </div>

                <div className="space-y-2 opacity-75">
                  {ineligibleCoupons.map((coupon) => {
                    const missingAmount = coupon.minOrderValue - cartSubtotal;
                    return (
                      <div
                        key={coupon._id}
                        className="p-3 rounded-[6px] bg-slate-50/70 border border-slate-200 text-slate-400 space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-[4px] bg-slate-200 text-slate-700">
                            {coupon.code}
                          </span>
                          <span className="text-[11px] text-amber-700 font-medium">
                            Mua thêm <strong className="font-mono tabular-nums">{formatPrice(missingAmount)}</strong> để áp dụng
                          </span>
                        </div>

                        <div className="text-xs font-medium text-slate-600">
                          {coupon.name} (Đơn tối thiểu {formatPrice(coupon.minOrderValue)})
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER MODAL */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-9 px-5 text-xs font-semibold rounded-[6px] border-slate-300"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
