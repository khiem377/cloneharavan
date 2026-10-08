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
  X,
  Check,
  Loader2,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogClose,
} from '@/components/ui/dialog';
import couponService from '@/services/coupon.service';

export default function CartOrderSummary({
  cart = {},
  onApplyCoupon,
  onRemoveCoupon,
  onValidateCheckout,
  isUpdating = false,
  hasStockIssue = false,
}) {
  const router = useRouter();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [applying, setApplying] = useState(false);

  // Dialog chọn voucher
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const formatPrice = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  // Load danh sách coupon khi mở modal
  useEffect(() => {
    if (showVoucherModal) {
      setLoadingCoupons(true);
      couponService
        .getActiveCoupons(20)
        .then((res) => {
          setAvailableCoupons(Array.isArray(res) ? res : []);
        })
        .catch(() => setAvailableCoupons([]))
        .finally(() => setLoadingCoupons(false));
    }
  }, [showVoucherModal]);

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
      setShowVoucherModal(false);
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
      router.push('/checkout');
    } catch (err) {
      setCheckoutError(err.message || 'Không thể tiến hành thanh toán');
      setCheckoutLoading(false);
    }
  };

  const subtotalOriginal = cart.subtotalOriginal || cart.subtotal || 0;
  const totalFlashSaleDiscount = cart.totalFlashSaleDiscount || 0;
  const totalPromotionDiscount = cart.totalPromotionDiscount || 0;
  const couponDiscount = cart.couponDiscount || 0;
  const totalDiscount = cart.totalDiscount || totalFlashSaleDiscount + totalPromotionDiscount + couponDiscount;
  const finalTotal = cart.finalTotal !== undefined ? cart.finalTotal : cart.subtotal || 0;
  const isFreeship = (cart.subtotal || 0) >= 500000;

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4 lg:sticky lg:top-24">
      <h3 className="font-bold text-sm sm:text-base text-slate-800 flex items-center justify-between">
        <span>Tóm tắt đơn hàng</span>
        <span className="text-xs font-semibold text-slate-500">
          ({cart.totalItems || 0} sản phẩm)
        </span>
      </h3>

      {/* 1. KHỐI MÃ GIẢM GIÁ (COUPON BOX) */}
      <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <TicketPercent size={14} className="text-red-600" />
            <span>Mã ưu đãi / Voucher</span>
          </label>
          <button
            type="button"
            onClick={() => setShowVoucherModal(true)}
            className="text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
          >
            Chọn mã có sẵn
          </button>
        </div>

        {/* Trạng thái đã áp dụng mã */}
        {cart.couponCode ? (
          <div className="flex items-center justify-between p-2 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 animate-fadeIn">
            <div className="flex items-center gap-2 min-w-0">
              <Tag size={14} className="text-emerald-700 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-bold truncate">
                  MÃ: {cart.couponCode}
                </div>
                <div className="text-[10px] text-emerald-700">
                  Giảm: -{formatPrice(couponDiscount)}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              disabled={applying || isUpdating}
              className="text-xs font-medium text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded cursor-pointer shrink-0"
              title="Gỡ mã giảm giá"
            >
              {applying ? <Loader2 size={13} className="animate-spin" /> : 'Gỡ'}
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex gap-1.5">
              <Input
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
                className="text-xs h-8 uppercase font-semibold"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => handleApply()}
                disabled={applying || isUpdating || !couponInput.trim()}
                className="h-8 px-3 text-xs bg-red-600 hover:bg-red-700 text-white shrink-0"
              >
                {applying ? <Loader2 size={13} className="animate-spin" /> : 'Áp dụng'}
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

      {/* 2. CHI TIẾT TÍNH TIỀN HÀNG */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Tiền hàng tạm tính:</span>
          <span className="font-semibold text-slate-800">
            {formatPrice(subtotalOriginal)}
          </span>
        </div>

        {totalFlashSaleDiscount > 0 && (
          <div className="flex justify-between text-red-600">
            <span>Giảm giá Flash Sale:</span>
            <span className="font-semibold">
              -{formatPrice(totalFlashSaleDiscount)}
            </span>
          </div>
        )}

        {totalPromotionDiscount > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>Khuyến mãi giảm trực tiếp:</span>
            <span className="font-semibold">
              -{formatPrice(totalPromotionDiscount)}
            </span>
          </div>
        )}

        {couponDiscount > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>Voucher giảm giá:</span>
            <span className="font-semibold">
              -{formatPrice(couponDiscount)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-slate-600">
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
            !cart.items ||
            cart.items.length === 0
          }
          className="w-full h-11 text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {checkoutLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Đang kiểm tra giỏ hàng...</span>
            </>
          ) : (
            <>
              <span>TIẾN HÀNH THANH TOÁN</span>
              <ArrowRight size={16} />
            </>
          )}
        </Button>

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
      <Dialog open={showVoucherModal} onOpenChange={setShowVoucherModal}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800">
            <TicketPercent size={18} className="text-red-600" />
            <span>Danh sách Mã giảm giá & Ưu đãi</span>
          </DialogTitle>
          <DialogClose onClick={() => setShowVoucherModal(false)} />
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
                const isApplicable = (cart.subtotal || 0) >= minOrder;
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
