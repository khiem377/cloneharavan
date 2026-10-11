'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import CartRewardBar from './CartRewardBar';
import CartItemList from './CartItemList';
import CartGiftItems from './CartGiftItems';
import CartAddons from './CartAddons';
import CartOrderSummary from './CartOrderSummary';
import CartFixedBottomBar from './CartFixedBottomBar';
import CartEmptyState from './CartEmptyState';

export default function CartView() {
  const {
    cart,
    items,
    totalItems,
    selectedItemIds,
    warnings,
    hasStockIssue,
    hasPriceChange,
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
    applyCoupon,
    removeCoupon,
    validateCheckout,
  } = useCartStore();

  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // Tải giỏ hàng lần đầu khi mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Dọn dẹp các sản phẩm hết hàng trong giỏ
  const handleClearOutOfStock = async () => {
    const outOfStockItems = items.filter(
      (i) => Boolean(i.isOutOfStock) || (i.availableStock !== undefined && i.availableStock <= 0)
    );
    for (const item of outOfStockItems) {
      await removeItem(item._id);
    }
  };

  const selectedCount = selectedItemIds ? selectedItemIds.length : 0;
  const selectedSubtotal = getSelectedSubtotal ? getSelectedSubtotal() : 0;

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
    <div className="bg-slate-50/50 min-h-[calc(100vh-200px)] pb-36 sm:pb-44">
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
            <CartRewardBar subtotal={selectedSubtotal || cart.subtotal || 0} />

            {/* 2. Danh sách sản phẩm trong giỏ (Kèm checkbox chọn từng món chuẩn Shopee) */}
            <CartItemList
              items={items}
              totalItems={totalItems}
              selectedItemIds={selectedItemIds}
              onToggleSelect={toggleSelectItem}
              onToggleSelectAll={toggleSelectAll}
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
              selectedItemIds={selectedItemIds}
              selectedCount={selectedCount}
              selectedSubtotal={selectedSubtotal}
              onApplyCoupon={applyCoupon}
              onRemoveCoupon={removeCoupon}
              onValidateCheckout={validateCheckout}
              isUpdating={isUpdating}
              hasStockIssue={hasStockIssue}
              showVoucherModal={showVoucherModal}
              setShowVoucherModal={setShowVoucherModal}
            />
          </div>
        </div>
      </div>

      {/* THANH GHIM ĐÁY TOÀN TRANG (FIXED BOTTOM BAR CHUẨN SHOPEE) */}
      <CartFixedBottomBar
        items={items}
        selectedItemIds={selectedItemIds}
        onToggleSelectAll={toggleSelectAll}
        onRemoveSelected={removeSelectedItems}
        onOpenVoucherModal={() => setShowVoucherModal(true)}
        appliedCouponCode={cart.couponCode}
        couponDiscount={cart.couponDiscount}
        isUpdating={isUpdating}
        onClearOutOfStock={handleClearOutOfStock}
      />
    </div>
  );
}
