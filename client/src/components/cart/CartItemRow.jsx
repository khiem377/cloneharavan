'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, AlertCircle, Loader2, Zap, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { confirm } from '@/components/ui/confirm-dialog';

export default function CartItemRow({
  item,
  onUpdateQuantity,
  onRemoveItem,
  isUpdating = false,
  isSelected = true,
  onToggleSelect,
  attachedGifts = [],
  giftNudge = null,
}) {
  const [localUpdating, setLocalUpdating] = useState(false);

  const formatPrice = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  const handleDecrease = async () => {
    if (item.quantity <= 1 || localUpdating || isUpdating) return;
    setLocalUpdating(true);
    await onUpdateQuantity(item._id, item.quantity - 1);
    setLocalUpdating(false);
  };

  const handleIncrease = async () => {
    const available = item.availableStock || 999;
    if (item.quantity >= available || localUpdating || isUpdating) return;
    setLocalUpdating(true);
    await onUpdateQuantity(item._id, item.quantity + 1);
    setLocalUpdating(false);
  };

  const handleRemove = async () => {
    if (localUpdating || isUpdating) return;
    const isCombo = Boolean(item.isComboItem && item.comboId);
    const isConfirmed = await confirm({
      title: isCombo ? 'Xóa trọn bộ gói combo?' : 'Xóa sản phẩm khỏi giỏ hàng?',
      description: isCombo
        ? `Sản phẩm "${item.name}" nằm trong gói "${item.comboName || 'Combo'}". Việc xóa sản phẩm này sẽ xóa toàn bộ các sản phẩm thành phần trong gói combo để đảm bảo giá trị đơn hàng. Bạn có chắc chắn muốn xóa?`
        : `Bạn có chắc chắn muốn xóa "${item.name || 'sản phẩm này'}" khỏi giỏ hàng?`,
      confirmText: isCombo ? 'Xóa toàn bộ combo' : 'Xóa sản phẩm',
      cancelText: 'Hủy',
      variant: 'destructive',
    });
    if (!isConfirmed) return;

    setLocalUpdating(true);
    await onRemoveItem(item._id);
    setLocalUpdating(false);
  };

  const handleAddNudgeQty = async () => {
    if (!giftNudge || !giftNudge.neededQty || localUpdating || isUpdating) return;
    const targetQty = item.quantity + giftNudge.neededQty;
    const available = item.availableStock || 999;
    if (targetQty > available) return;
    setLocalUpdating(true);
    await onUpdateQuantity(item._id, targetQty);
    setLocalUpdating(false);
  };

  const thumbnail =
    item.thumbnail ||
    (typeof item.image === 'string' ? item.image : item.image?.url) ||
    '/logo-shop.jpg';

  const productUrl = item.slug
    ? `/products/${item.slug}`
    : item.productId?.slug
    ? `/products/${item.productId.slug}`
    : `/products/${item.productId?._id || item.productId || ''}`;
  const isOutOfStock = Boolean(item.isOutOfStock) || (item.availableStock !== undefined && item.availableStock <= 0);
  const isLowStock = !isOutOfStock && item.availableStock !== undefined && item.availableStock <= 5;

  return (
    <div
      className={`p-3.5 sm:p-4 transition-colors ${
        isOutOfStock
          ? 'bg-red-50/40'
          : isSelected
          ? 'bg-white hover:bg-slate-50/50'
          : 'bg-slate-50/30 hover:bg-slate-50/50'
      }`}
    >
      <div className="flex items-start md:items-center gap-3 sm:gap-4">
        {/* CHECKBOX CHỌN SẢN PHẨM */}
        <div className="w-5 shrink-0 flex items-center justify-center pt-2 md:pt-0">
          <Checkbox
            checked={isSelected}
            disabled={isOutOfStock || isUpdating || localUpdating}
            onChange={() => onToggleSelect && onToggleSelect(item._id)}
            aria-label={`Chọn sản phẩm ${item.name || ''}`}
            className="h-4 w-4 rounded-[4px] cursor-pointer"
          />
        </div>

        {/* 12-COLUMN GRID CHUẨN XÁC THEO TABLE HEADER */}
        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* CỘT 1: SẢN PHẨM (ẢNH + TÊN + THUỘC TÍNH) (MD: 5 CỘT) */}
          <div className="md:col-span-5 flex items-start gap-3 min-w-0 pr-2">
            {/* ẢNH ĐẠI DIỆN SẢN PHẨM */}
            <Link
              href={productUrl}
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-[6px] overflow-hidden border border-slate-200 shrink-0 bg-slate-50 block group"
            >
              <img
                src={thumbnail}
                alt={item.name || 'Sản phẩm'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  e.currentTarget.src = '/logo-shop.jpg';
                }}
              />
            </Link>

            {/* TÊN & THUỘC TÍNH */}
            <div className="flex-1 min-w-0">
              <Link
                href={productUrl}
                className="font-bold text-xs sm:text-sm text-slate-900 hover:text-red-600 line-clamp-2 transition-colors leading-snug"
              >
                {item.name}
              </Link>

              {/* Thuộc tính biến thể */}
              {(() => {
                const isDefaultVal = (text) => {
                  if (!text) return true;
                  const t = String(text).trim().toLowerCase();
                  return ['mặc định', 'mac dinh', 'default', 'default title', 'tiêu chuẩn', 'tieu chuan'].includes(t);
                };

                const validAttributes = Array.isArray(item.attributes) && item.attributes.length > 0
                  ? item.attributes.filter((attr) => !isDefaultVal(attr.value) && !isDefaultVal(attr.name))
                  : Array.isArray(item.selectedAttributes)
                  ? item.selectedAttributes.filter((attr) => !isDefaultVal(attr.value) && !isDefaultVal(attr.name))
                  : [];

                if (validAttributes.length > 0) {
                  return (
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                      {validAttributes.map((attr, idx) => (
                        <span key={idx} className="bg-slate-100 px-1.5 py-0.5 rounded-[4px] text-slate-700 font-medium">
                          {attr.name ? `${attr.name}: ` : ''}{attr.value}
                        </span>
                      ))}
                    </div>
                  );
                }

                if (item.displayName && !isDefaultVal(item.displayName)) {
                  return (
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded-[4px] text-slate-700 font-medium">
                        {item.displayName}
                      </span>
                    </div>
                  );
                }

                return null;
              })()}

              {/* Tag Mua theo Combo */}
              {item.isComboItem && (
                <div className="inline-flex items-center gap-1.5 mt-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-[4px]">
                  <span>Gói combo: {item.comboName || 'Gói tiết kiệm'} (Mua trọn bộ các món đi kèm)</span>
                </div>
              )}

              {/* Tag khuyến mãi kèm theo nếu có */}
              {item.isFlashSale && !item.isComboItem && (
                <div className="inline-block mt-1 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold px-1.5 py-0.5 rounded-[4px]">
                  Flash Sale giảm sốc
                </div>
              )}

              {/* CẢNH BÁO TỒN KHO */}
              {isOutOfStock ? (
                <div className="text-[11px] font-semibold text-red-600 mt-1">
                  Hết hàng trong kho
                </div>
              ) : isLowStock ? (
                <div className="text-[11px] font-medium text-amber-700 mt-0.5">
                  Kho chỉ còn <strong>{item.availableStock}</strong> sản phẩm
                </div>
              ) : null}
            </div>
          </div>

          {/* CỘT 2: ĐƠN GIÁ (MD: 2 CỘT) */}
          <div className="md:col-span-2 text-left md:text-center">
            <div className="md:hidden text-[10px] text-slate-400 font-medium uppercase mb-0.5">
              Đơn giá
            </div>
            <div className="font-mono tabular-nums font-bold text-xs sm:text-sm text-slate-800">
              {formatPrice(item.unitPrice)}
            </div>
            {item.originalPrice > item.unitPrice && (
              <div className="font-mono tabular-nums text-[11px] text-slate-400 line-through">
                {formatPrice(item.originalPrice)}
              </div>
            )}
          </div>

          {/* CỘT 3: BỘ ĐIỀU KHIỂN SỐ LƯỢNG (MD: 2 CỘT) */}
          <div className="md:col-span-2 flex items-center md:justify-center">
            <div className="inline-flex items-center border border-slate-200 rounded-[4px] bg-slate-50 p-0.5 h-7 sm:h-8">
              <button
                type="button"
                onClick={handleDecrease}
                disabled={item.quantity <= 1 || localUpdating || isUpdating || isOutOfStock}
                className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-[3px] bg-white text-slate-700 hover:bg-slate-100 active:scale-[0.95] disabled:opacity-40 transition cursor-pointer text-xs font-bold shadow-2xs"
                aria-label="Giảm"
              >
                -
              </button>

              <span className="w-8 sm:w-9 text-center text-xs sm:text-sm font-mono tabular-nums font-bold text-slate-900 select-none">
                {localUpdating ? '...' : item.quantity}
              </span>

              <button
                type="button"
                onClick={handleIncrease}
                disabled={
                  (item.availableStock !== undefined && item.quantity >= item.availableStock) ||
                  localUpdating ||
                  isUpdating ||
                  isOutOfStock
                }
                className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-[3px] bg-white text-slate-700 hover:bg-slate-100 active:scale-[0.95] disabled:opacity-40 transition cursor-pointer text-xs font-bold shadow-2xs"
                aria-label="Tăng"
              >
                +
              </button>
            </div>
          </div>

          {/* CỘT 4: THÀNH TIỀN (MD: 2 CỘT) */}
          <div className="md:col-span-2 text-left md:text-center">
            <div className="md:hidden text-[10px] text-slate-400 font-medium uppercase mb-0.5">
              Thành tiền
            </div>
            <div className="font-mono tabular-nums font-bold text-xs sm:text-sm text-red-600">
              {formatPrice(item.subtotal)}
            </div>
          </div>

          {/* CỘT 5: NÚT XÓA (MD: 1 CỘT) */}
          <div className="md:col-span-1 flex justify-start md:justify-center items-center">
            <button
              type="button"
              onClick={handleRemove}
              disabled={localUpdating || isUpdating}
              className="text-slate-400 hover:text-red-600 p-1.5 rounded-[4px] hover:bg-red-50 transition cursor-pointer text-xs font-semibold"
              title="Xóa sản phẩm"
              aria-label="Xóa sản phẩm"
            >
              {localUpdating ? '...' : 'Xóa'}
            </button>
          </div>
        </div>
      </div>

      {/* SẢN PHẨM QUÀ TẶNG ĐÍNH KÈM (KHI ĐÃ ĐỦ ĐIỀU KIỆN KÍCH HOẠT QUÀ TẶNG 0đ) */}
      {attachedGifts && attachedGifts.length > 0 && (
        <div className="mt-3 pl-8 sm:pl-9 space-y-2">
          {attachedGifts.map((gift, gIdx) => {
            const giftThumb = gift.thumbnail || '/logo-shop.jpg';
            const giftUrl = gift.slug
              ? `/products/${gift.slug}`
              : gift.productId?.slug
              ? `/products/${gift.productId.slug}`
              : gift.productId?._id
              ? `/products/${gift.productId._id}`
              : gift.productId
              ? `/products/${gift.productId}`
              : '#';
            return (
              <div
                key={gift._id || gIdx}
                className="bg-slate-50/80 border border-slate-200 rounded-[6px] p-2.5 sm:p-3 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-900 uppercase tracking-tight">
                      Quà tặng kèm theo sản phẩm:
                    </span>
                    {gift.giftProgramName && (
                      <span className="hidden sm:inline text-[10px] text-slate-500 font-medium truncate max-w-[220px]">
                        ({gift.giftProgramName})
                      </span>
                    )}
                  </div>
                  <span className="bg-[#284ea1] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] font-mono tabular-nums">
                    Miễn phí 0₫
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
                  {/* THÔNG TIN QUÀ TẶNG (MD: 5 CỘT) */}
                  <div className="md:col-span-5 flex items-center gap-2.5 min-w-0">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[4px] overflow-hidden border border-slate-200 bg-white shrink-0">
                      <img
                        src={giftThumb}
                        alt={gift.name || 'Quà tặng'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/logo-shop.jpg';
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={giftUrl}
                        className="font-medium text-xs text-slate-900 hover:text-[#284ea1] line-clamp-1 transition-colors"
                      >
                        {gift.name || 'Sản phẩm quà tặng'}
                      </Link>
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                        Quà tặng đính kèm (Không bán lẻ)
                      </div>
                    </div>
                  </div>

                  {/* GIÁ GỐC NIÊM YẾT (MD: 2 CỘT) */}
                  <div className="md:col-span-2 text-left md:text-center">
                    <div className="md:hidden text-[10px] text-slate-400 font-medium">Giá gốc:</div>
                    {gift.originalPrice > 0 ? (
                      <div className="font-mono tabular-nums text-xs text-slate-400 line-through">
                        {formatPrice(gift.originalPrice)}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 font-mono">-</div>
                    )}
                  </div>

                  {/* SỐ LƯỢNG QUÀ TẶNG (MD: 2 CỘT) */}
                  <div className="md:col-span-2 text-left md:text-center">
                    <span className="inline-block px-2 py-0.5 bg-white border border-slate-200 rounded-[4px] font-mono tabular-nums text-xs font-bold text-slate-900">
                      x{gift.quantity || gift.qty || 1}
                    </span>
                  </div>

                  {/* THÀNH TIỀN QUÀ TẶNG 0đ (MD: 2 CỘT) */}
                  <div className="md:col-span-2 text-left md:text-center">
                    <div className="md:hidden text-[10px] text-slate-400 font-medium">Thành tiền:</div>
                    <div className="font-mono tabular-nums font-bold text-xs sm:text-sm text-emerald-600">
                      0₫
                    </div>
                  </div>

                  {/* KHÔNG CÓ NÚT XÓA CHO QUÀ TẶNG ĐÍNH KÈM (MD: 1 CỘT) */}
                  <div className="hidden md:block md:col-span-1 text-center">
                    <span className="text-[10px] text-[#284ea1] font-bold" title="Tặng kèm tự động theo sản phẩm">
                      Tự động
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* THÔNG BÁO TIẾN TRÌNH / GỢI Ý NHẬN QUÀ TẶNG (NUDGE BANNER KHI CHƯA ĐỦ SỐ LƯỢNG) */}
      {giftNudge && (!attachedGifts || attachedGifts.length === 0) && (
        <div className="mt-3 pl-8 sm:pl-9">
          <div className="bg-blue-50/60 border border-blue-200 rounded-[6px] p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="text-xs text-slate-800 leading-relaxed min-w-0">
              <span>Mua thêm </span>
              <strong className="font-mono tabular-nums font-bold text-[#284ea1] bg-blue-100 px-1 py-0.2 rounded-[3px]">
                {giftNudge.neededQty}
              </strong>
              <span> sản phẩm để nhận ngay quà tặng: </span>
              <strong className="font-semibold text-slate-900">
                {giftNudge.giftName || 'Sản phẩm quà tặng'}
              </strong>
              <span> </span>
              <span className="font-mono tabular-nums font-bold text-emerald-600">(0₫)</span>
            </div>

            <button
              type="button"
              onClick={handleAddNudgeQty}
              disabled={localUpdating || isUpdating || (item.availableStock !== undefined && item.quantity + giftNudge.neededQty > item.availableStock)}
              className="inline-flex items-center justify-center gap-1 px-3 py-1 text-xs font-bold text-[#284ea1] bg-white hover:bg-blue-50 border border-blue-300 rounded-[4px] active:scale-[0.98] transition cursor-pointer shrink-0 shadow-2xs self-end sm:self-auto"
            >
              <span>+ Mua thêm {giftNudge.neededQty}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
