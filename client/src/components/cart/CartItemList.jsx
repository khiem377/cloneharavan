'use client';

import React, { useState } from 'react';
import CartItemRow from './CartItemRow';
import { Button } from '@/components/ui/button';

export default function CartItemList({
  items = [],
  giftItems = [],
  giftNudges = [],
  totalItems = 0,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  isUpdating = false,
}) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectAll, setSelectAll] = useState(true);

  // Số lượng loại sản phẩm khác nhau
  const productCount = items.length;

  return (
    <div className="bg-white border border-slate-200 rounded-[6px] overflow-hidden shadow-2xs">
      {/* 1. HEADER ROW (TABLE HEADER ALIGNED CHUẨN XÁC VỚI TỪNG CỘT) */}
      <div className="p-3.5 sm:p-4 bg-slate-50/80 border-b border-slate-200 text-xs sm:text-sm font-bold text-slate-800">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* CHECKBOX CHỌN TẤT CẢ */}
          <div className="w-5 shrink-0 flex items-center justify-center">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={() => setSelectAll(!selectAll)}
              className="w-4 h-4 rounded-[4px] border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer accent-red-600"
            />
          </div>

          <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* TIÊU ĐỀ SẢN PHẨM (MD: 5 CỘT) */}
            <div className="md:col-span-5 flex items-center gap-1.5">
              <span>Tất cả sản phẩm</span>
              <span className="font-mono tabular-nums text-slate-500">
                ({productCount})
              </span>
            </div>

            {/* ĐƠN GIÁ (MD: 2 CỘT) */}
            <div className="hidden md:block md:col-span-2 text-center text-slate-600">
              Đơn giá
            </div>

            {/* SỐ LƯỢNG (MD: 2 CỘT) */}
            <div className="hidden md:block md:col-span-2 text-center text-slate-600">
              Số lượng
            </div>

            {/* THÀNH TIỀN (MD: 2 CỘT) */}
            <div className="hidden md:block md:col-span-2 text-center text-slate-600">
              Thành tiền
            </div>

            {/* NÚT XÓA TẤT CẢ (MD: 1 CỘT) */}
            <div className="hidden md:flex md:col-span-1 justify-center items-center">
              {items.length > 0 && (
                <div>
                  {!showClearConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(true)}
                      disabled={isUpdating}
                      className="text-slate-400 hover:text-red-600 p-1 text-xs font-semibold rounded-[4px] hover:bg-red-50 transition cursor-pointer"
                      title="Xóa tất cả giỏ hàng"
                      aria-label="Xóa tất cả"
                    >
                      Xóa
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-red-50 p-1 rounded-[4px] border border-red-200 animate-fadeIn">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-6 px-1.5 text-[10px] rounded-[3px]"
                        onClick={() => {
                          onClearCart();
                          setShowClearConfirm(false);
                        }}
                      >
                        Xóa hết
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-1.5 text-[10px] rounded-[3px]"
                        onClick={() => setShowClearConfirm(false)}
                      >
                        Hủy
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. DANH SÁCH CÁC DÒNG SẢN PHẨM */}
      <div className="divide-y divide-slate-100 bg-white">
        {items.map((item) => {
          const itemIdStr = item.productId?._id
            ? item.productId._id.toString()
            : item.productId?.toString();

          const attachedGifts = Array.isArray(giftItems)
            ? giftItems.filter((g) => {
                if (g.triggerProductId && g.triggerProductId.toString() === itemIdStr) return true;
                if (Array.isArray(g.triggerProductIds) && g.triggerProductIds.some((id) => id.toString() === itemIdStr)) return true;
                return false;
              })
            : [];

          const giftNudge = Array.isArray(giftNudges)
            ? giftNudges.find((n) => n.triggerProductId && n.triggerProductId.toString() === itemIdStr)
            : null;

          return (
            <CartItemRow
              key={item._id}
              item={item}
              attachedGifts={attachedGifts}
              giftNudge={giftNudge}
              onUpdateQuantity={onUpdateQuantity}
              onRemoveItem={onRemoveItem}
              isUpdating={isUpdating}
              isSelected={selectAll}
            />
          );
        })}
      </div>
    </div>
  );
}
