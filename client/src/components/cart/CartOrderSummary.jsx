'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import useCartStore from '@/store/cartStore';

export default function CartOrderSummary({
  cart = {},
  itemsCount = 0,
  selectedItemIds = [],
  selectedCount = 0,
  selectedSubtotal = 0,
  onValidateCheckout,
  isUpdating = false,
  hasStockIssue = false,
}) {
  const router = useRouter();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const formatPrice = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  const effectiveItemCount = selectedCount || itemsCount || (cart.items ? cart.items.length : 0);

  const handleProceedCheckout = async () => {
    if (effectiveItemCount === 0) {
      setCheckoutError('Giỏ hàng chưa có sản phẩm nào để đặt hàng');
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
        try {
          if (selectedItemIds && selectedItemIds.length > 0) {
            localStorage.setItem('checkoutItemIds', JSON.stringify(selectedItemIds));
            sessionStorage.setItem('checkoutItemIds', JSON.stringify(selectedItemIds));
          } else {
            localStorage.removeItem('checkoutItemIds');
            sessionStorage.removeItem('checkoutItemIds');
          }
        } catch (_) {}
      }
      router.push('/checkout');
    } catch (err) {
      setCheckoutError(err.message || 'Không thể tiến hành đặt hàng');
      setCheckoutLoading(false);
    }
  };

  const { getSelectedOriginalSubtotal, getSelectedCouponDiscount } = useCartStore();

  const selectedItems = (cart.items || []).filter((item) =>
    selectedItemIds.includes(item._id)
  );

  const subtotalOriginal =
    selectedItems.length > 0
      ? (getSelectedOriginalSubtotal ? getSelectedOriginalSubtotal() : selectedSubtotal)
      : Number(cart.subtotalOriginal) || Number(cart.subtotal) || 0;

  const subtotalEffective =
    selectedSubtotal > 0
      ? selectedSubtotal
      : cart.subtotal !== undefined
        ? Number(cart.subtotal)
        : subtotalOriginal;

  const productSavings = Math.max(0, subtotalOriginal - subtotalEffective);
  const hasProductDiscount = productSavings > 0;

  const couponDiscount =
    getSelectedCouponDiscount ? getSelectedCouponDiscount() : Number(cart.couponDiscount) || 0;
  const hasCoupon = Boolean(cart.couponCode) && couponDiscount > 0;

  const finalTotal =
    selectedCount === 0
      ? 0
      : Math.max(0, subtotalEffective - couponDiscount);
  const totalSavings = productSavings + couponDiscount;

  return (
    <div className="bg-white border border-slate-200 rounded-[6px] p-4 sm:p-5 2xl:p-6 space-y-4 shadow-2xs">
      <h3 className="font-bold text-base 2xl:text-lg text-slate-900 pb-2.5 border-b border-slate-100 flex items-center justify-between">
        <span>Tổng giỏ hàng</span>
        {effectiveItemCount > 0 && (
          <span className="text-xs font-normal text-slate-500 font-mono tabular-nums">
            ({effectiveItemCount} sản phẩm)
          </span>
        )}
      </h3>

      {/* CHI TIẾT GIÁ ĐƠN HÀNG */}
      <div className="space-y-3 text-xs sm:text-sm">
        {/* 1. TẠM TÍNH */}
        <div className="flex items-start justify-between">
          <div className="pt-0.5">
            <span className="text-slate-700 font-medium">Tạm tính:</span>
            {hasProductDiscount && (
              <div className="text-[11px] text-emerald-600 font-medium">
                (Đã giảm trực tiếp từ giá gốc)
              </div>
            )}
          </div>

          <div className="text-right">
            <div className="font-mono tabular-nums font-bold text-slate-900 sm:text-base">
              {formatPrice(subtotalEffective)}
            </div>
            {hasProductDiscount && (
              <div className="text-xs text-slate-400 font-mono tabular-nums line-through">
                {formatPrice(subtotalOriginal)}
              </div>
            )}
          </div>
        </div>

        {/* TIẾT KIỆM TỪ SẢN PHẨM */}
        {hasProductDiscount && (
          <div className="flex justify-between items-center text-slate-500 text-[11px] sm:text-xs">
            <span>Tiết kiệm từ sản phẩm:</span>
            <span className="font-mono tabular-nums font-medium text-emerald-600">
              -{formatPrice(productSavings)}
            </span>
          </div>
        )}

        {/* 2. VOUCHER */}
        {hasCoupon && (
          <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-[4px] flex justify-between items-center text-emerald-800 text-xs">
            <span className="font-semibold">Voucher ({cart.couponCode}):</span>
            <span className="font-mono tabular-nums font-bold text-emerald-700 text-xs sm:text-sm">
              -{formatPrice(couponDiscount)}
            </span>
          </div>
        )}

        {/* 3. PHÍ VẬN CHUYỂN */}
        <div className="flex justify-between items-center text-slate-600">
          <span>Phí vận chuyển:</span>
          <span className="font-semibold text-emerald-600 text-xs sm:text-sm">
            Tính khi thanh toán
          </span>
        </div>
      </div>

      <Separator />

      {/* TỔNG TIỀN CẦN THANH TOÁN */}
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <span className="text-sm sm:text-base font-bold text-slate-900">
            Tổng cộng:
          </span>
          <div className="text-right">
            <span className="text-xl sm:text-2xl 2xl:text-3xl font-mono tabular-nums font-black text-red-600 tracking-tight">
              {formatPrice(finalTotal)}
            </span>
          </div>
        </div>

        {totalSavings > 0 && (
          <div className="text-right text-[11px] sm:text-xs font-semibold text-emerald-600 font-mono tabular-nums">
            (Tiết kiệm tổng cộng: {formatPrice(totalSavings)})
          </div>
        )}

        <p className="text-[11px] text-slate-400 text-right">
          (Đã bao gồm VAT nếu có)
        </p>
      </div>

      {/* THÔNG BÁO LỖI NẾU CÓ */}
      {checkoutError && (
        <div className="p-2.5 rounded-[6px] bg-red-50 border border-red-200 text-red-700 text-xs animate-fadeIn">
          {checkoutError}
        </div>
      )}

      {/* CẶP NÚT HÀNH ĐỘNG: 1 PRIMARY VÀ 1 OUTLINE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        {/* NÚT 1 (PRIMARY): ĐẶT HÀNG NGAY */}
        <Button
          type="button"
          size="default"
          onClick={handleProceedCheckout}
          disabled={
            checkoutLoading ||
            isUpdating ||
            hasStockIssue ||
            effectiveItemCount === 0
          }
          className="w-full h-10 2xl:h-11 text-xs sm:text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-[6px] gap-1.5 shadow-xs"
        >
          {checkoutLoading ? (
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Đang xử lý...</span>
            </div>
          ) : (
            <>
              <span>Đặt hàng ngay</span>
              <ArrowRight size={14} />
            </>
          )}
        </Button>

        {/* NÚT 2 (SECONDARY/OUTLINE): TIẾP TỤC MUA HÀNG */}
        <Button
          asChild
          variant="outline"
          size="default"
          className="w-full h-10 2xl:h-11 text-xs sm:text-sm font-semibold rounded-[6px] border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          <Link href="/collections/all">
            <ShoppingBag size={14} className="mr-1.5" />
            <span>Tiếp tục mua hàng</span>
          </Link>
        </Button>
      </div>

      {/* ĐIỀU KHOẢN MUA HÀNG */}
      <div className="text-[11px] text-slate-400 text-center leading-relaxed pt-2 border-t border-slate-100">
        Nhấn "Đặt hàng ngay" đồng nghĩa với việc bạn đồng ý tuân theo{' '}
        <Link href="/terms" className="text-slate-600 hover:underline">
          Điều khoản mua hàng
        </Link>
      </div>
    </div>
  );
}
