'use client';

import React from 'react';
import { ShoppingBag, Trash2 } from 'lucide-react';
import CartItemRow from './CartItemRow';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { confirm } from '@/components/ui/confirm-dialog';

export default function CartItemList({
  items = [],
  totalItems = 0,
  selectedItemIds = [],
  onToggleSelect,
  onToggleSelectAll,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  isUpdating = false,
}) {
  // Danh sách các sản phẩm còn hàng khả dụng
  const availableItems = items.filter(
    (i) => !i.isOutOfStock && (i.availableStock === undefined || i.availableStock > 0)
  );

  const isAllSelected =
    availableItems.length > 0 &&
    availableItems.every((item) => selectedItemIds.includes(item._id));

  const handleClearAll = async () => {
    const isConfirmed = await confirm({
      title: 'Xóa toàn bộ giỏ hàng?',
      description: 'Bạn có chắc chắn muốn xóa toàn bộ sản phẩm trong giỏ hàng không?',
      confirmText: 'Xác nhận xóa',
      cancelText: 'Hủy',
      variant: 'destructive',
    });
    if (isConfirmed) {
      onClearCart();
    }
  };

  return (
    <div className="space-y-3">
      {/* Header thanh danh sách chuẩn sàn TMĐT */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isAllSelected}
            onChange={(e) => onToggleSelectAll && onToggleSelectAll(e.target.checked)}
            disabled={availableItems.length === 0 || isUpdating}
            className="h-4 w-4 rounded cursor-pointer"
            id="cart-select-all-header"
          />
          <label
            htmlFor="cart-select-all-header"
            className="text-xs sm:text-sm font-bold text-slate-800 cursor-pointer select-none flex items-center gap-1.5"
          >
            <span>Sản phẩm</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
              {totalItems}
            </span>
          </label>
        </div>

        {/* Cột tiêu đề trên màn hình lớn */}
        <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-500 pr-2">
          <span className="w-24 text-center">Đơn giá</span>
          <span className="w-28 text-center">Số lượng</span>
          <span className="w-24 text-right">Số tiền</span>
          <span className="w-10 text-center">Xóa</span>
        </div>

        {items.length > 0 && (
          <div className="md:hidden">
            <button
              type="button"
              onClick={handleClearAll}
              disabled={isUpdating}
              className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Xóa tất cả</span>
            </button>
          </div>
        )}
      </div>

      {/* Danh sách các item */}
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <CartItemRow
            key={item._id}
            item={item}
            isSelected={selectedItemIds.includes(item._id)}
            onToggleSelect={onToggleSelect}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
            isUpdating={isUpdating}
          />
        ))}
      </div>
    </div>
  );
}
