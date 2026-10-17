'use client';

import React from 'react';
import Link from 'next/link';
import { Ticket, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CheckoutOrderItemsList from './CheckoutOrderItemsList';
import CheckoutRecaptcha from './CheckoutRecaptcha';

export default function CheckoutOrderSummary({
  items = [],
  gifts = [],
  pricing = {},
  loadingPreview = false,
  appliedCouponCode = null,
  appliedCouponDiscount = 0,
  appliedShippingCode = null,
  appliedShippingDiscount = 0,
  onOpenVoucherModal,
  onRemoveCoupon,
  onOpenEditModal,
  submittingOrder = false,
  canCheckout = true,
  warnings = [],
  onPlaceOrder,
  formatPrice,
  selectedPaymentMethod = 'COD',
  enableReCaptcha = false,
  recaptchaVerified = false,
  onVerifyRecaptcha,
}) {
  const isOnlineMethod = Boolean(selectedPaymentMethod && selectedPaymentMethod !== 'COD');

  const getButtonText = () => {
    switch (String(selectedPaymentMethod || '').toUpperCase()) {
      case 'MOMO':
        return 'THANH TOÁN QUA VÍ MOMO (ĐANG PHÁT TRIỂN)';
      case 'VNPAY':
        return 'THANH TOÁN QUA VNPAY-QR (ĐANG PHÁT TRIỂN)';
      case 'ZALOPAY':
        return 'THANH TOÁN QUA VÍ ZALOPAY (ĐANG PHÁT TRIỂN)';
      default:
        return 'ĐẶT HÀNG NGAY (COD)';
    }
  };
  const subtotal = pricing?.subtotal || 0;
  const couponDiscount = appliedCouponDiscount || pricing?.couponDiscount || 0;
  const shippingFee = pricing?.shippingFee || 0;
  const shippingDiscount = appliedShippingDiscount || pricing?.shippingDiscount || 0;
  const finalShippingFee = pricing?.finalShippingFee !== undefined
    ? pricing.finalShippingFee
    : Math.max(0, shippingFee - shippingDiscount);
  const totalAmount = pricing?.totalAmount !== undefined
    ? pricing.totalAmount
    : Math.max(0, subtotal - couponDiscount + finalShippingFee);

  const totalDiscountCombined = couponDiscount + shippingDiscount;
  const hasAnyCoupon = Boolean(appliedCouponCode || appliedShippingCode);

  return (
    <div className="bg-white border border-slate-200 rounded-[6px] p-4 sm:p-5 sticky top-20">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Thông tin đơn hàng
          </h3>
          <span className="text-xs text-slate-500 font-medium font-mono tabular-nums">
            ({items.length + gifts.length} món)
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenEditModal}
          className="text-xs font-semibold text-[#e30019] hover:text-[#b30014] hover:underline transition flex items-center gap-1 cursor-pointer"
          title="Chỉnh sửa sản phẩm hoặc số lượng trong đơn hàng"
        >
          <span>Thay đổi</span>
        </button>
      </div>

      {/* Danh sách sản phẩm: Phân tách Combo, Sản phẩm lẻ, Quà tặng */}
      <CheckoutOrderItemsList
        items={items}
        gifts={gifts}
        loadingPreview={loadingPreview}
        formatPrice={formatPrice}
      />

      {/* Khối Voucher giảm giá */}
      <div className="pt-3 border-t border-slate-200 mb-3.5">
        <div className="bg-slate-50 border border-slate-200 rounded-[6px] p-3">
          <div className="flex items-center justify-between gap-2.5">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                <Ticket size={14} className="text-[#e30019]" />
                <span>Mã giảm giá (Voucher)</span>
                {totalDiscountCombined > 0 && (
                  <span className="text-[10px] font-mono tabular-nums bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-[4px] font-bold">
                    -{formatPrice(totalDiscountCombined)}
                  </span>
                )}
              </div>

              {hasAnyCoupon ? (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {appliedCouponCode && (
                    <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-[#284ea1] text-[11px] px-2 py-0.5 rounded-[4px] font-medium font-mono">
                      <span>Đơn: <strong>{appliedCouponCode}</strong></span>
                      {couponDiscount > 0 && <span>(-{formatPrice(couponDiscount)})</span>}
                      <button
                        type="button"
                        onClick={() => onRemoveCoupon && onRemoveCoupon('order')}
                        className="hover:text-red-600 font-bold ml-0.5 cursor-pointer"
                        title="Gỡ mã đơn hàng"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                  {appliedShippingCode && (
                    <span className="inline-flex items-center gap-1 bg-sky-50 border border-sky-200 text-sky-700 text-[11px] px-2 py-0.5 rounded-[4px] font-medium font-mono">
                      <span>Ship: <strong>{appliedShippingCode}</strong></span>
                      {shippingDiscount > 0 && <span>(-{formatPrice(shippingDiscount)})</span>}
                      <button
                        type="button"
                        onClick={() => onRemoveCoupon && onRemoveCoupon('shipping')}
                        className="hover:text-red-600 font-bold ml-0.5 cursor-pointer"
                        title="Gỡ mã vận chuyển"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  Chọn voucher đơn hàng & freeship để tối ưu chi phí
                </p>
              )}
            </div>

            <Button
              type="button"
              size="sm"
              onClick={onOpenVoucherModal}
              className={`h-7 px-2.5 text-xs font-bold rounded-[4px] shrink-0 cursor-pointer ${hasAnyCoupon
                  ? 'bg-slate-900 hover:bg-slate-800 text-white'
                  : 'bg-[#e30019] hover:bg-[#c40015] text-white'
                }`}
            >
              {hasAnyCoupon ? 'Đổi mã' : 'Chọn mã'}
            </Button>
          </div>
        </div>
      </div>

      {/* Chi tiết chi phí */}
      <div className="space-y-2 text-xs pt-3 border-t border-slate-200">
        <div className="flex justify-between text-slate-600">
          <span>Tạm tính tiền hàng:</span>
          <span className="font-mono text-slate-900 font-medium tabular-nums">{formatPrice(subtotal)}</span>
        </div>
        {couponDiscount > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>Giảm giá voucher:</span>
            <span className="font-mono text-emerald-700 font-semibold tabular-nums">-{formatPrice(couponDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between text-slate-600">
          <span>Phí vận chuyển:</span>
          <span className="font-mono text-slate-900 font-medium tabular-nums">+{formatPrice(shippingFee)}</span>
        </div>
        {shippingDiscount > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>Giảm phí vận chuyển:</span>
            <span className="font-mono text-sky-700 font-semibold tabular-nums">-{formatPrice(shippingDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between items-baseline pt-2.5 border-t border-slate-200">
          <span className="text-xs sm:text-sm font-bold text-slate-900">Tổng thanh toán:</span>
          <span className="text-base sm:text-lg font-mono font-black text-[#e30019] tabular-nums">{formatPrice(totalAmount)}</span>
        </div>
      </div>

      {warnings?.length > 0 && (
        <div className="mt-3 p-2.5 rounded-[4px] bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-1">
          {warnings.map((w, i) => (
            <p key={i} className="flex items-start gap-1.5">
              <AlertCircle size={13} className="text-amber-600 shrink-0 mt-0.5" />
              <span>{w}</span>
            </p>
          ))}
        </div>
      )}

      <div className="pt-4">
        {enableReCaptcha && (
          <CheckoutRecaptcha
            verified={recaptchaVerified}
            onVerify={onVerifyRecaptcha}
          />
        )}

        {isOnlineMethod && (
          <div className="mb-2.5 p-2 rounded-[6px] bg-amber-50 border border-amber-200 text-xs text-amber-900 text-center font-medium">
            Cổng thanh toán này đang phát triển. Quý khách vui lòng chọn COD để đặt hàng.
          </div>
        )}

        <Button
          type="button"
          onClick={onPlaceOrder}
          disabled={submittingOrder || !canCheckout}
          className={`w-full h-11 text-sm font-bold text-white rounded-[6px] shadow-xs active:scale-[0.99] transition cursor-pointer ${
            isOnlineMethod
              ? 'bg-amber-600 hover:bg-amber-700'
              : 'bg-[#e30019] hover:bg-[#c40015]'
          }`}
        >
          {submittingOrder ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Đang tạo đơn hàng...
            </span>
          ) : (
            <span>{getButtonText()}</span>
          )}
        </Button>

      </div>
    </div>
  );
}
