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

  const availableItems = items.filter(
    (i) => !i.isOutOfStock && (i.availableStock === undefined || i.availableStock > 0)
  );

  const outOfStockItems = items.filter(
    (i) => Boolean(i.isOutOfStock) || (i.availableStock !== undefined && i.availableStock <= 0)
  );

  const isAllSelected =
    availableItems.length > 0 &&
    availableItems.every((item) => selectedItemIds.includes(item._id));

  const selectedCount = selectedItemIds.length;

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

  const finalTotal =
    selectedCount === 0
      ? 0
      : Math.max(0, selectedSubtotal - (couponDiscount || 0));

  const handleProceedCheckout = () => {
    if (selectedCount === 0) {
      toast('Vui lòng chọn ít nhất 1 sản phẩm để mua hàng', { type: 'warning' });
      return;
    }

    setCheckoutLoading(true);
    try {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('checkoutItemIds', JSON.stringify(selectedItemIds));
          sessionStorage.setItem('checkoutItemIds', JSON.stringify(selectedItemIds));
        } catch (_) {}
      }
      router.push('/checkout');
    } catch (err) {
      toast('Có lỗi xảy ra khi chuyển sang thanh toán', { type: 'error' });
      setCheckoutLoading(false);
    }
  };

  const handleSaveToWishlist = () => {
    if (selectedCount === 0) {
      toast('Vui lòng chọn sản phẩm cần lưu vào mục Đã thích', { type: 'warning' });
      return;
    }
    toast(`Đã lưu ${selectedCount} sản phẩm vào mục Đã thích!`, { type: 'success' });
  };

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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="border-b border-dashed border-slate-200 bg-white">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl h-10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <TicketPercent size={15} className="text-[#284ea1]" />
            <span className="font-bold text-slate-900">Voucher giảm giá</span>
            {appliedCouponCode && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[4px] border border-emerald-200 font-mono tabular-nums">
                Mã: {appliedCouponCode} (-{formatPrice(couponDiscount)})
              </span>
            )}
          </div>

          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={onOpenVoucherModal}
            className="h-auto p-0 text-xs font-semibold text-[#284ea1] hover:text-[#1e3b82]"
          >
            <span>{appliedCouponCode ? 'Đổi mã voucher khác' : 'Chọn hoặc nhập mã >'}</span>
          </Button>
        </div>
      </div>

      <div className="bg-white">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-4 select-none">
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
                className="cursor-pointer select-none font-semibold hover:text-slate-900 whitespace-nowrap"
              >
                Chọn Tất Cả ({items.length})
              </label>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDeleteSelected}
              disabled={selectedCount === 0 || isUpdating}
              className="h-7 px-2 text-xs text-slate-600 hover:text-red-600 font-medium whitespace-nowrap"
            >
              Xóa {selectedCount > 0 ? `(${selectedCount})` : ''}
            </Button>

            {outOfStockItems.length > 0 && onClearOutOfStock && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClearOutOfStock}
                className="h-7 px-2 text-xs hover:text-red-600 text-slate-500 hidden lg:inline-flex whitespace-nowrap"
              >
                Bỏ SP hết hàng ({outOfStockItems.length})
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSaveToWishlist}
              disabled={selectedCount === 0 || isUpdating}
              className="h-7 px-2 text-xs text-[#284ea1] hover:text-[#1e3b82] font-semibold gap-1 whitespace-nowrap"
            >
              <Heart size={13} className="shrink-0" />
              <span>
                <span className="hidden sm:inline">Lưu vào mục </span>Đã thích
              </span>
            </Button>
          </div>

          <div className="ml-auto flex items-center justify-end gap-2.5 sm:gap-4 shrink-0">
            <div className="text-right whitespace-nowrap flex flex-col items-end justify-center leading-tight">
              <span className="text-[11px] sm:text-xs text-slate-600 font-medium">
                Tổng cộng ({selectedCount} sản phẩm):
              </span>
              <span className="text-sm sm:text-base 2xl:text-lg font-mono tabular-nums font-black text-blue-700 tracking-tight mt-0.5">
                {selectedCount === 0 ? '0 đ' : formatPrice(finalTotal)}
              </span>
              {selectedCount > 0 && couponDiscount > 0 && (
                <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-600 font-mono tabular-nums">
                  (Tiết kiệm: {formatPrice(couponDiscount)})
                </span>
              )}
            </div>

            <Button
              type="button"
              onClick={handleProceedCheckout}
              disabled={selectedCount === 0 || isUpdating || checkoutLoading}
              className="h-10 sm:h-11 px-6 sm:px-8 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm rounded-[6px] shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap"
            >
              {checkoutLoading ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 size={14} className="animate-spin text-slate-950" />
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                <span>Đặt hàng ngay {selectedCount > 0 ? `(${selectedCount})` : ''}</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

