'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import useCartStore from '@/store/cartStore';
import CartCheckoutSteps from './CartCheckoutSteps';
import CartRewardBar from './CartRewardBar';
import CartItemList from './CartItemList';
import CartGiftItems from './CartGiftItems';
import CartVoucherCard from './CartVoucherCard';
import CartOrderSummary from './CartOrderSummary';
import CartEmptyState from './CartEmptyState';
import { Button } from '@/components/ui/button';

export default function CartView() {
  const {
    cart,
    items,
    totalItems,
    selectedItemIds,
    warnings,
    hasStockIssue,
    isLoading,
    isUpdating,
    initialized,
    fetchCart,
    toggleSelectItem,
    toggleSelectAll,
    removeSelectedItems,
    getSelectedSubtotal,
    updateQuantity,
    removeItem,
    clearCart,
    validateCheckout,
  } = useCartStore();

  // Tải giỏ hàng lần đầu khi mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const selectedCount = selectedItemIds ? selectedItemIds.length : 0;
  const selectedSubtotal = getSelectedSubtotal ? getSelectedSubtotal() : 0;

  const formatPrice = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  // SKELETON LOADING KHI ĐANG TẢI DỮ LIỆU
  if (isLoading && !initialized) {
    return (
      <div className="container mx-auto px-3 sm:px-4 2xl:px-8 py-6 2xl:py-10 max-w-7xl 2xl:max-w-[1536px] animate-pulse">
        <div className="h-4 w-48 bg-slate-200 rounded-[6px] mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 2xl:gap-8">
          <div className="lg:col-span-8 space-y-4">
            <div className="h-32 bg-slate-200 rounded-[6px]" />
            <div className="h-32 bg-slate-200 rounded-[6px]" />
          </div>
          <div className="lg:col-span-4 space-y-4">
            <div className="h-20 bg-slate-200 rounded-[6px]" />
            <div className="h-80 bg-slate-200 rounded-[6px]" />
          </div>
        </div>
      </div>
    );
  }

  // TRƯỜNG HỢP GIỎ HÀNG TRỐNG
  if (initialized && items.length === 0) {
    return (
      <div className="container mx-auto px-3 sm:px-4 2xl:px-8 py-6 2xl:py-10 max-w-7xl 2xl:max-w-[1536px]">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs 2xl:text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Trang chủ
          </Link>
          <span className="text-slate-400">/</span>
          <span className="font-semibold text-slate-900">Giỏ hàng của bạn</span>
        </nav>

        <CartEmptyState />
      </div>
    );
  }

  return (
    <div className="bg-slate-50/60 min-h-[100dvh] pb-10 sm:pb-12">
      <div className="container mx-auto px-3 sm:px-4 2xl:px-8 py-3 sm:py-5 2xl:py-8 max-w-7xl 2xl:max-w-[1536px]">
        {/* BREADCRUMB */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs 2xl:text-sm text-slate-500 mb-3 sm:mb-4">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Trang chủ
          </Link>
          <span className="text-slate-400">/</span>
          <span className="font-semibold text-slate-900">
            Giỏ hàng của bạn
          </span>
        </nav>

        {/* 3-STEP CHECKOUT STEPPER */}
        <CartCheckoutSteps currentStep={1} />

        {/* BANNER CẢNH BÁO TỒN KHO NẾU CÓ */}
        {warnings && warnings.length > 0 && (
          <div className="mb-4 p-3 sm:p-4 rounded-[6px] bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm space-y-1 animate-fadeIn">
            <div className="font-bold text-amber-950">
              Thông báo giỏ hàng:
            </div>
            <ul className="list-disc pl-5 space-y-0.5 text-slate-700 text-xs">
              {warnings.map((w, idx) => (
                <li key={idx}>{w.message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* LAYOUT CHÍNH: 8 CỘT TRÁI (DANH SÁCH SẢN PHẨM) / 4 CỘT PHẢI (VOUCHER + TÓM TẮT ĐƠN HÀNG) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 2xl:gap-8 items-start">
          {/* CỘT TRÁI (8 CỘT) */}
          <div className="lg:col-span-8 space-y-4 2xl:space-y-6">
            {/* 1. Thanh tiến trình nhận quà / freeship */}
            <CartRewardBar subtotal={selectedSubtotal > 0 ? selectedSubtotal : (cart.subtotal || 0)} />

            {/* 2. Bảng danh sách sản phẩm & quà tặng đính kèm */}
            <CartItemList
              items={items}
              giftItems={cart.giftItems || cart.giftPrograms || []}
              giftNudges={cart.giftNudges || []}
              totalItems={totalItems || items.length}
              selectedItemIds={selectedItemIds}
              onToggleSelect={toggleSelectItem}
              onToggleSelectAll={toggleSelectAll}
              onRemoveSelected={removeSelectedItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
              onClearCart={clearCart}
              isUpdating={isUpdating}
            />

            {/* 3. Quà tặng kèm theo toàn đơn hàng nếu có quà độc lập */}
            <CartGiftItems giftPrograms={cart.giftItems || cart.giftPrograms || []} />
          </div>

          {/* CỘT PHẢI (4 CỘT - STICKY) */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-20 2xl:top-24">
            {/* 1. Khối chọn Voucher giảm giá */}
            <CartVoucherCard />

            {/* 2. Khối thông tin đơn hàng & nút Đặt hàng */}
            <CartOrderSummary
              cart={cart}
              itemsCount={items.length}
              selectedItemIds={selectedItemIds}
              selectedCount={selectedCount}
              selectedSubtotal={selectedSubtotal}
              onValidateCheckout={validateCheckout}
              isUpdating={isUpdating}
              hasStockIssue={hasStockIssue}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

