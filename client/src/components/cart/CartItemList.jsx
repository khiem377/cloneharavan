'use client';

import React, { useState } from 'react';
import { ShoppingBag, Trash2 } from 'lucide-react';
import CartItemRow from './CartItemRow';
import { Button } from '@/components/ui/button';

export default function CartItemList({
  items = [],
  totalItems = 0,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  isUpdating = false,
}) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  return (
    <div className="space-y-3">
      {/* Header thanh danh sách */}
      <div className="flex items-center justify-between px-1 py-1">
        <div className="flex items-center gap-2">
          <ShoppingBag size={18} className="text-red-600" />
          <h2 className="font-bold text-sm sm:text-base text-slate-800">
            Giỏ hàng của bạn
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
            {totalItems} sản phẩm
          </span>
        </div>

        {items.length > 0 && (
          <div>
            {!showClearConfirm ? (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                disabled={isUpdating}
                className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Xóa tất cả</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-red-50 p-1.5 px-2.5 rounded-lg border border-red-200">
                <span className="text-xs font-semibold text-red-700">Xác nhận xóa?</span>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-6 px-2 text-[11px]"
                  onClick={() => {
                    onClearCart();
                    setShowClearConfirm(false);
                  }}
                >
                  Xóa
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 text-[11px]"
                  onClick={() => setShowClearConfirm(false)}
                >
                  Hủy
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Danh sách các item */}
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <CartItemRow
            key={item._id}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
            isUpdating={isUpdating}
          />
        ))}
      </div>
    </div>
  );
}
