'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import CartRewardBar from './CartRewardBar';
import CartItemList from './CartItemList';
import CartGiftItems from './CartGiftItems';
import CartAddons from './CartAddons';
import CartOrderSummary from './CartOrderSummary';
import CartEmptyState from './CartEmptyState';
import { Button } from '@/components/ui/button';

export default function CartView() {
  const {
    cart,
    items,
    totalItems,
    warnings,
    hasStockIssue,
    hasPriceChange,
    isLoading,
    isUpdating,
    initialized,
    fetchCart,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    validateCheckout,
  } = useCartStore();

  // Tải giỏ hàng lần đầu khi mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const formatPrice = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  // SKELETON LOADING KHI ĐANG TẢI DỮ LIỆU
  if (isLoading && !initialized) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 w-48 bg-slate-200 rounded mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="h-28 bg-slate-200 rounded-xl" />
            <div className="h-32 bg-slate-200 rounded-xl" />
            <div className="h-32 bg-slate-200 rounded-xl" />
          </div>
          <div className="lg:col-span-4">
            <div className="h-96 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // TRƯỜNG HỢP GIỎ HÀNG TRỐNG
  if (initialized && items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Trang chủ
          </Link>
          <ChevronRight size={13} className="text-slate-400" />
          <span className="font-semibold text-slate-800">Giỏ hàng</span>
        </nav>

        <CartEmptyState />
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 min-h-[calc(100vh-200px)] pb-24 lg:pb-12">
      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-7xl">
        {/* BREADCRUMB */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 sm:mb-6">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Trang chủ
          </Link>
          <ChevronRight size={13} className="text-slate-400" />
          <span className="font-semibold text-slate-800">
            Giỏ hàng ({totalItems} sản phẩm)
          </span>
        </nav>

        {/* BANNER CẢNH BÁO TỒN KHO / BIẾN ĐỘNG GIÁ (NẾU CÓ TỪ BACKEND) */}
        {warnings && warnings.length > 0 && (
          <div className="mb-5 p-3.5 sm:p-4 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs sm:text-sm space-y-1.5 shadow-2xs animate-fadeIn">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <AlertTriangle size={16} className="text-amber-600 shrink-0" />
              <span>Thông báo điều chỉnh giỏ hàng từ hệ thống:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-700">
              {warnings.map((w, idx) => (
                <li key={idx}>
                  {w.message || 'Một số sản phẩm trong giỏ đã có sự thay đổi về tồn kho hoặc giá.'}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* LAYOUT CHÍNH: 8 CỘT TRÁI / 4 CỘT PHẢI */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* CỘT TRÁI (8 CỘT TRÊN DESKTOP) */}
          <div className="lg:col-span-8 space-y-5">
            {/* 1. Thanh tiến trình nhận quà */}
            <CartRewardBar subtotal={cart.subtotal || 0} />

            {/* 2. Danh sách sản phẩm trong giỏ */}
            <CartItemList
              items={items}
              totalItems={totalItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
              onClearCart={clearCart}
              isUpdating={isUpdating}
            />

            {/* 3. Khối quà tặng 0đ (nếu có chương trình khuyến mãi) */}
            <CartGiftItems giftPrograms={cart.giftPrograms || []} />

            {/* 4. Khối tiện ích Haravan (ghi chú, hẹn giờ, VAT) */}
            <CartAddons />
          </div>

          {/* CỘT PHẢI (4 CỘT TRÊN DESKTOP - STICKY) */}
          <div className="lg:col-span-4">
            <CartOrderSummary
              cart={cart}
              onApplyCoupon={applyCoupon}
              onRemoveCoupon={removeCoupon}
              onValidateCheckout={validateCheckout}
              isUpdating={isUpdating}
              hasStockIssue={hasStockIssue}
            />
          </div>
        </div>
      </div>

      {/* THANH GHIM ĐÁY TRÊN ĐIỆN THOẠI (MOBILE STICKY BOTTOM BAR) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 p-3 px-4 shadow-lg flex items-center justify-between gap-3 animate-fadeIn">
        <div>
          <div className="text-[10px] text-slate-500 font-medium">Tổng thanh toán:</div>
          <div className="text-base font-black text-red-600">
            {formatPrice(cart.finalTotal || cart.subtotal || 0)}
          </div>
        </div>

        <Link href="/checkout" className="shrink-0">
          <Button
            size="default"
            disabled={isUpdating || hasStockIssue || items.length === 0}
            className="h-10 px-5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
          >
            <span>Thanh toán</span>
            <ArrowRight size={14} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
