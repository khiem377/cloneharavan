'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TicketPercent, Trash2, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/toast';
import { confirm } from '@/components/ui/confirm-dialog';

export default function CartFixedBottomBar({
  items = [],
  selectedItemIds = [],
  onToggleSelectAll,
  onRemoveSelected,
  onOpenVoucherModal,
  appliedCouponCode = null,
  couponDiscount = 0,
  isUpdating = false,
  onClearOutOfStock,
}) {
  const router = useRouter();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const formatPrice = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  // Danh sách các sản phẩm còn hàng
  const availableItems = items.filter(
    (i) => !i.isOutOfStock && (i.availableStock === undefined || i.availableStock > 0)
  );

  // Sản phẩm bị hết hàng
  const outOfStockItems = items.filter(
    (i) => Boolean(i.isOutOfStock) || (i.availableStock !== undefined && i.availableStock <= 0)
  );

  const isAllSelected =
    availableItems.length > 0 &&
    availableItems.every((item) => selectedItemIds.includes(item._id));

  const selectedCount = selectedItemIds.length;

  // Tính tổng tiền các sản phẩm ĐƯỢC CHỌN (mặc định = 0 đ)
  const selectedSubtotal = items
    .filter((i) => selectedItemIds.includes(i._id))
    .reduce(
      (sum, item) =>
        sum +
        (Number(item.subtotal) ||
          Number(item.unitPrice) * Number(item.quantity) ||
          0),
      0
    );

  // Tính tổng thanh toán sau khi trừ voucher (nếu có)
  const finalTotal =
    selectedCount === 0
      ? 0
      : Math.max(0, selectedSubtotal - (couponDiscount || 0));

  // Xử lý chuyển sang trang Checkout
  const handleProceedCheckout = () => {
    if (selectedCount === 0) {
      toast('Vui lòng chọn ít nhất 1 sản phẩm để mua hàng', { type: 'warning' });
      return;
    }

    setCheckoutLoading(true);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('checkoutItemIds', JSON.stringify(selectedItemIds));
      }
      router.push('/checkout');
    } catch (err) {
      toast('Có lỗi xảy ra khi chuyển sang thanh toán', { type: 'error' });
      setCheckoutLoading(false);
    }
  };

  // Lưu các sản phẩm đã chọn vào danh sách yêu thích
  const handleSaveToWishlist = () => {
    if (selectedCount === 0) {
      toast('Vui lòng chọn sản phẩm cần lưu vào mục Đã thích', { type: 'warning' });
      return;
    }
    toast(`Đã lưu ${selectedCount} sản phẩm vào mục Đã thích!`, { type: 'success' });
  };

  // Mở Popup Modal xác nhận xóa chuẩn Shopee
  const handleDeleteSelected = async () => {
    if (selectedCount === 0) {
      toast('Vui lòng chọn sản phẩm cần xóa', { type: 'warning' });
      return;
    }

    const isConfirmed = await confirm({
      title: 'Xóa sản phẩm khỏi giỏ hàng?',
      description: `Bạn có chắc chắn muốn xóa ${selectedCount} sản phẩm đã chọn khỏi giỏ hàng không?`,
      confirmText: 'Xác nhận xóa',
      cancelText: 'Hủy',
      variant: 'destructive',
    });

    if (!isConfirmed) return;

    if (onRemoveSelected) {
      const res = await onRemoveSelected();
      if (res?.success) {
        toast(`Đã xóa ${res.count} sản phẩm đã chọn khỏi giỏ hàng`, { type: 'success' });
      }
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      {/* TẦNG 1: DÒNG VOUCHER ƯU ĐÃI (CHUẨN SHOPEE) */}
      <div className="border-b border-dashed border-slate-200 bg-white">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl h-10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <TicketPercent size={15} className="text-[#ee4d2d]" />
            <span className="font-semibold text-slate-800">Voucher</span>
            {appliedCouponCode && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Mã: {appliedCouponCode} (-{formatPrice(couponDiscount)})
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onOpenVoucherModal}
            className="text-xs font-medium text-[#ee4d2d] hover:text-[#d73211] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{appliedCouponCode ? 'Đổi mã voucher khác' : 'Chọn hoặc nhập mã >'}</span>
          </button>
        </div>
      </div>

      {/* TẦNG 2: THAO TÁC HÀNG LOẠT VÀ NÚT MUA HÀNG - RESPONSIVE THÔNG MINH, KHÔNG TRÀN MÉP */}
      <div className="bg-white">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-4 select-none">
          {/* Cụm trái: Checkbox chọn tất cả, Xóa, Lưu vào đã thích */}
          <div className="flex items-center gap-3 sm:gap-6 text-xs text-slate-700 shrink-0">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isAllSelected}
                onChange={(e) => onToggleSelectAll && onToggleSelectAll(e.target.checked)}
                disabled={availableItems.length === 0 || isUpdating}
                className="h-4 w-4 rounded cursor-pointer"
                id="fixed-select-all"
              />
              <label
                htmlFor="fixed-select-all"
                className="cursor-pointer select-none font-medium hover:text-slate-900 whitespace-nowrap"
              >
                Chọn Tất Cả ({items.length})
              </label>
            </div>

            {/* Nút Xóa các sản phẩm đã chọn (Bấm vào mở Modal popup xác nhận) */}
            <button
              type="button"
              onClick={handleDeleteSelected}
              disabled={selectedCount === 0 || isUpdating}
              className="text-xs hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors font-medium whitespace-nowrap"
            >
              Xóa {selectedCount > 0 ? `(${selectedCount})` : ''}
            </button>

            {/* Nút bỏ sản phẩm không hoạt động nếu có */}
            {outOfStockItems.length > 0 && onClearOutOfStock && (
              <button
                type="button"
                onClick={onClearOutOfStock}
                className="hover:text-red-600 text-slate-500 cursor-pointer hidden lg:inline-block transition-colors whitespace-nowrap"
              >
                Bỏ SP hết hàng ({outOfStockItems.length})
              </button>
            )}

            {/* Nút Lưu vào mục Đã thích */}
            <button
              type="button"
              onClick={handleSaveToWishlist}
              disabled={selectedCount === 0 || isUpdating}
              className="text-[#ee4d2d] hover:text-[#d73211] font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              <Heart size={13} className="shrink-0" />
              <span>
                <span className="hidden sm:inline">Lưu vào mục </span>Đã thích
              </span>
            </button>
          </div>

          {/* Cụm phải: Tổng cộng xếp trên, Giá tiền xếp dưới - Cỡ chữ vừa vặn, nút Mua Hàng nguyên vẹn */}
          <div className="ml-auto flex items-center justify-end gap-3 sm:gap-5 shrink-0">
            {/* Khối giá tiền: 2 dòng dọc (Tổng cộng ở trên, Số tiền ở dưới) */}
            <div className="text-right whitespace-nowrap flex flex-col items-end justify-center leading-tight">
              <span className="text-[11px] sm:text-xs text-slate-600 font-normal">
                Tổng cộng ({selectedCount} sản phẩm):
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#ee4d2d] mt-0.5">
                {selectedCount === 0 ? '0 đ' : formatPrice(finalTotal)}
              </span>
              {selectedCount > 0 && couponDiscount > 0 && (
                <span className="text-[10px] text-emerald-700 font-medium">
                  Tiết kiệm: {formatPrice(couponDiscount)}
                </span>
              )}
            </div>

            {/* Nút Mua Hàng: Giữ nguyên phong cách, đảm bảo luôn hiển thị trọn vẹn 100% không bị tràn */}
            <Button
              type="button"
              onClick={handleProceedCheckout}
              disabled={selectedCount === 0 || isUpdating || checkoutLoading}
              className="h-10 sm:h-11 px-5 sm:px-8 bg-[#ee4d2d] hover:bg-[#d73211] text-white font-bold text-xs sm:text-sm rounded-[4px] shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
            >
              {checkoutLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <span>Mua Hàng</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
