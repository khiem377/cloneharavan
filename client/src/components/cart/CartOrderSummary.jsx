'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TicketPercent,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Truck,
  Check,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import couponService from '@/services/coupon.service';
import { toast } from '@/components/ui/toast';

export default function CartOrderSummary({
  cart = {},
  selectedItemIds = [],
  selectedCount = 0,
  selectedSubtotal = 0,
  onApplyCoupon,
  onRemoveCoupon,
  onValidateCheckout,
  isUpdating = false,
  hasStockIssue = false,
  showVoucherModal = false,
  setShowVoucherModal,
}) {
  const router = useRouter();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [applying, setApplying] = useState(false);

  // Local voucher modal fallback nếu không truyền từ ngoài
  const [localShowVoucher, setLocalShowVoucher] = useState(false);
  const isVoucherOpen = setShowVoucherModal ? showVoucherModal : localShowVoucher;
  const setVoucherOpen = setShowVoucherModal || setLocalShowVoucher;

  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const formatPrice = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  // Load danh sách coupon khi mở modal
  useEffect(() => {
    if (isVoucherOpen) {
      setLoadingCoupons(true);
      couponService
        .getActiveCoupons(20)
        .then((res) => {
          setAvailableCoupons(Array.isArray(res) ? res : []);
        })
        .catch(() => setAvailableCoupons([]))
        .finally(() => setLoadingCoupons(false));
    }
  }, [isVoucherOpen]);

  const handleApply = async (codeToApply) => {
    const code = (codeToApply || couponInput || '').trim();
    if (!code) {
      setCouponError('Vui lòng nhập mã giảm giá');
      return;
    }

    setCouponError('');
    setCouponSuccess('');
    setApplying(true);

    const res = await onApplyCoupon(code);
    setApplying(false);

    if (res?.success) {
      setCouponSuccess(res.message || `Đã áp dụng mã "${code}" thành công`);
      setCouponInput('');
      setVoucherOpen(false);
    } else {
      setCouponError(res?.message || 'Mã giảm giá không hợp lệ hoặc đã hết lượt');
    }
  };

  const handleRemove = async () => {
    setCouponError('');
    setCouponSuccess('');
    setApplying(true);
    await onRemoveCoupon();
    setApplying(false);
  };

  const handleProceedCheckout = async () => {
    if (selectedCount === 0) {
      toast('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán', { type: 'warning' });
      return;
    }

    setCheckoutError('');
    setCheckoutLoading(true);

    try {
      if (onValidateCheckout) {
        const valRes = await onValidateCheckout();
        if (valRes && valRes.success === false) {
          setCheckoutError(valRes.message || 'Một số sản phẩm không đủ điều kiện đặt hàng');
          setCheckoutLoading(false);
          return;
        }
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('checkoutItemIds', JSON.stringify(selectedItemIds));
      }
      router.push('/checkout');
    } catch (err) {
      setCheckoutError(err.message || 'Không thể tiến hành thanh toán');
      setCheckoutLoading(false);
    }
  };

  // Tính toán số tiền dựa trên các sản phẩm đã chọn (chuẩn Shopee)
  const couponDiscount = selectedCount > 0 ? cart.couponDiscount || 0 : 0;
  const totalDiscount = couponDiscount;
  const effectiveSubtotal = selectedCount > 0 ? selectedSubtotal : 0;
  const finalTotal = selectedCount > 0 ? Math.max(0, effectiveSubtotal - totalDiscount) : 0;
  const isFreeship = effectiveSubtotal >= 500000;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
      {/* 1. KHỐI MÃ GIẢM GIÁ (COUPON BOX) */}
      <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <TicketPercent size={14} className="text-red-600" />
            <span>Mã ưu đãi / Voucher</span>
          </label>
          <button
            type="button"
            onClick={() => setVoucherOpen(true)}
            className="text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
          >
            Chọn mã có sẵn &gt;
          </button>
        </div>

        {/* Trạng thái đã áp dụng mã */}
        {cart.couponCode ? (
          <div className="flex items-center justify-between p-2 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 animate-fadeIn">
            <div className="flex items-center gap-2 min-w-0">
              <Check size={14} className="text-emerald-700 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-bold truncate">
                  Mã: {cart.couponCode}
                </div>
                {couponDiscount > 0 && (
                  <div className="text-[10px] text-emerald-700">
                    Giảm: -{formatPrice(couponDiscount)}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              disabled={applying || isUpdating}
              className="text-xs font-medium text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded cursor-pointer shrink-0"
              title="Gỡ mã giảm giá"
            >
              {applying ? <Loader2 size={12} className="animate-spin" /> : 'Gỡ bỏ'}
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Nhập mã giảm giá..."
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value.toUpperCase());
                  setCouponError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApply();
                  }
                }}
                className="h-8 text-xs font-mono uppercase bg-white border-slate-300 focus:border-red-500"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => handleApply()}
                disabled={applying || isUpdating || !couponInput.trim()}
                className="h-8 px-3 text-xs bg-red-600 hover:bg-red-700 text-white shrink-0 cursor-pointer"
              >
                {applying ? <Loader2 size={12} className="animate-spin" /> : 'Áp dụng'}
              </Button>
            </div>

            {couponError && (
              <p className="text-[11px] font-medium text-red-600 animate-fadeIn">
                {couponError}
              </p>
            )}
            {couponSuccess && (
              <p className="text-[11px] font-medium text-emerald-600 animate-fadeIn">
                {couponSuccess}
              </p>
            )}
          </div>
        )}
      </div>

      <Separator />

      {/* 2. CHI TIẾT THANH TOÁN */}
      <div className="space-y-2.5 text-xs text-slate-600">
        <div className="flex justify-between items-center">
          <span>Sản phẩm đã chọn:</span>
          <span className="font-semibold text-slate-800">
            {selectedCount} sản phẩm
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span>Tạm tính:</span>
          <span className="font-semibold text-slate-900">
            {formatPrice(effectiveSubtotal)}
          </span>
        </div>

        {couponDiscount > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>Voucher giảm giá:</span>
            <span className="font-semibold">
              -{formatPrice(couponDiscount)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1">
            <span>Phí vận chuyển:</span>
            {isFreeship && (
              <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-800 py-0">
                Freeship
              </Badge>
            )}
          </span>
          <span className="font-medium text-slate-800">
            {isFreeship ? (
              <span className="text-emerald-700 font-bold">Miễn phí</span>
            ) : (
              'Tính khi thanh toán'
            )}
          </span>
        </div>

        {totalDiscount > 0 && (
          <div className="pt-1">
            <div className="p-1.5 rounded-md bg-emerald-50/70 border border-emerald-200/70 text-emerald-800 text-[11px] font-semibold flex items-center justify-between">
              <span>Tổng số tiền tiết kiệm:</span>
              <span className="font-bold">-{formatPrice(totalDiscount)}</span>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* 3. TỔNG CỘNG THANH TOÁN */}
      <div className="space-y-1">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-bold text-slate-900">Tổng cộng:</span>
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-black text-red-600 tracking-tight">
              {formatPrice(finalTotal)}
            </span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 text-right">
          (Đã bao gồm VAT nếu có)
        </p>
      </div>

      {/* Cảnh báo lỗi trước checkout nếu có */}
      {checkoutError && (
        <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5 animate-fadeIn">
          <AlertTriangle size={14} className="shrink-0" />
          <span>{checkoutError}</span>
        </div>
      )}

      {/* 4. NÚT CTA CHÍNH */}
      <div className="space-y-2 pt-1">
        <Button
          type="button"
          size="lg"
          onClick={handleProceedCheckout}
          disabled={
            checkoutLoading ||
            isUpdating ||
            hasStockIssue ||
            selectedCount === 0
          }
          className="w-full h-11 text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {checkoutLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Đang kiểm tra giỏ hàng...</span>
            </>
          ) : (
            <>
              <span>MUA HÀNG {selectedCount > 0 ? `(${selectedCount})` : ''}</span>
              <ArrowRight size={16} />
            </>
          )}
        </Button>

        {selectedCount === 0 && (
          <p className="text-[11px] text-center text-slate-400">
            * Vui lòng tích chọn sản phẩm để mua hàng
          </p>
        )}

        <Link
          href="/"
          className="w-full inline-block text-center text-xs font-semibold text-slate-600 hover:text-red-600 py-1 transition-colors"
        >
          ← Tiếp tục chọn sản phẩm khác
        </Link>
      </div>

      {/* 5. CAM KẾT AN TÂM MUA SẮM */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <div className="flex items-center gap-2 text-[11px] text-slate-600">
          <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
          <span>100% Sản phẩm chính hãng, đầy đủ bảo hành</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-600">
          <RotateCcw size={14} className="text-emerald-600 shrink-0" />
          <span>Đổi trả thuận tiện trong vòng 7 ngày</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-600">
          <Truck size={14} className="text-emerald-600 shrink-0" />
          <span>Giao hàng hỏa tốc toàn quốc, kiểm tra trước khi nhận</span>
        </div>
      </div>

      {/* MODAL CHỌN MÃ ƯU ĐÃI KHẢ DỤNG */}
      <Dialog open={isVoucherOpen} onOpenChange={setVoucherOpen}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800">
            <TicketPercent size={18} className="text-red-600" />
            <span>Danh sách Mã giảm giá & Ưu đãi</span>
          </DialogTitle>
          <DialogClose onClick={() => setVoucherOpen(false)} />
        </DialogHeader>

        <DialogContent className="max-h-[75vh] overflow-y-auto p-4 space-y-3">
          {loadingCoupons ? (
            <div className="py-8 text-center text-slate-400 flex flex-col items-center gap-2">
              <Loader2 size={24} className="animate-spin text-red-600" />
              <span className="text-xs">Đang tìm các mã ưu đãi tốt nhất...</span>
            </div>
          ) : availableCoupons.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Hiện chưa có mã giảm giá công khai nào phù hợp. Bạn có thể nhập mã riêng ở ô bên ngoài nhé!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {availableCoupons.map((c) => {
                const code = c.code || c.couponCode;
                const minOrder = c.minOrderValue || 0;
                const isApplicable = (effectiveSubtotal || 0) >= minOrder;
                const isCurrent = cart.couponCode === code;

                return (
                  <div
                    key={c._id || code}
                    className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-emerald-50 border-emerald-300'
                        : isApplicable
                        ? 'bg-white border-slate-200 hover:border-red-300 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-red-600 font-mono tracking-wide">
                          {code}
                        </span>
                        {isCurrent && (
                          <Badge className="bg-emerald-600 text-white text-[9px] py-0 px-1.5">
                            Đang áp dụng
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs font-medium text-slate-800 mt-0.5">
                        {c.description ||
                          (c.discountType === 'percentage'
                            ? `Giảm ${c.discountValue}% giá trị đơn hàng`
                            : `Giảm ${formatPrice(c.discountValue)}`)}
                      </div>
                      {minOrder > 0 && (
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Đơn tối thiểu: <strong>{formatPrice(minOrder)}</strong>
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      disabled={!isApplicable || isCurrent || applying}
                      onClick={() => handleApply(code)}
                      className={`text-xs px-3 h-7 shrink-0 ${
                        isCurrent
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      {isCurrent ? (
                        <span className="flex items-center gap-1">
                          <Check size={12} /> Đã dùng
                        </span>
                      ) : (
                        'Áp dụng'
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
