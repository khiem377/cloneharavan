'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { confirm } from '@/components/ui/confirm-dialog';
import CartItemGiftSection from './CartItemGiftSection';

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
        <div className="w-5 shrink-0 flex items-center justify-center pt-2 md:pt-0">
          <Checkbox
            checked={isSelected}
            disabled={isOutOfStock || isUpdating || localUpdating}
            onChange={() => onToggleSelect && onToggleSelect(item._id)}
            aria-label={`Chọn sản phẩm ${item.name || ''}`}
            className="h-4 w-4 rounded-[4px] cursor-pointer"
          />
        </div>

        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-5 flex items-start gap-3 min-w-0 pr-2">
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

            <div className="flex-1 min-w-0">
              <Link
                href={productUrl}
                className="font-bold text-xs sm:text-sm text-slate-900 hover:text-red-600 line-clamp-2 transition-colors leading-snug"
              >
                {item.name}
              </Link>

              {validAttributes.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                  {validAttributes.map((attr, idx) => (
                    <span key={idx} className="bg-slate-100 px-1.5 py-0.5 rounded-[4px] text-slate-700 font-medium">
                      {attr.name ? `${attr.name}: ` : ''}{attr.value}
                    </span>
                  ))}
                </div>
              ) : item.displayName && !isDefaultVal(item.displayName) ? (
                <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded-[4px] text-slate-700 font-medium">
                    {item.displayName}
                  </span>
                </div>
              ) : null}

              {item.isComboItem && (
                <div className="inline-flex items-center gap-1.5 mt-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-[4px]">
                  <span>Gói combo: {item.comboName || 'Gói tiết kiệm'} (Mua trọn bộ các món đi kèm)</span>
                </div>
              )}

              {item.isFlashSale && !item.isComboItem && (
                <div className="inline-block mt-1 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold px-1.5 py-0.5 rounded-[4px]">
                  Flash Sale giảm sốc
                </div>
              )}

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

          <div className="md:col-span-2 flex items-center md:justify-center">
            <div className="inline-flex items-center border border-slate-200 rounded-[4px] bg-white overflow-hidden shadow-2xs">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleDecrease}
                disabled={item.quantity <= 1 || localUpdating || isUpdating || isOutOfStock}
                className="h-7 w-7 rounded-none hover:bg-slate-100 text-slate-700 active:scale-[0.95]"
                aria-label="Giảm số lượng"
              >
                <Minus size={12} />
              </Button>

              <span className="w-8 sm:w-9 text-center text-xs sm:text-sm font-mono tabular-nums font-bold text-slate-900 select-none">
                {localUpdating ? '...' : item.quantity}
              </span>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleIncrease}
                disabled={
                  (item.availableStock !== undefined && item.quantity >= item.availableStock) ||
                  localUpdating ||
                  isUpdating ||
                  isOutOfStock
                }
                className="h-7 w-7 rounded-none hover:bg-slate-100 text-slate-700 active:scale-[0.95]"
                aria-label="Tăng số lượng"
              >
                <Plus size={12} />
              </Button>
            </div>
          </div>

          <div className="md:col-span-2 text-left md:text-center">
            <div className="md:hidden text-[10px] text-slate-400 font-medium uppercase mb-0.5">
              Thành tiền
            </div>
            <div className="font-mono tabular-nums font-bold text-xs sm:text-sm text-red-600">
              {formatPrice(item.subtotal)}
            </div>
          </div>

          <div className="md:col-span-1 flex justify-start md:justify-center items-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={localUpdating || isUpdating}
              className="text-slate-400 hover:text-red-600 hover:bg-red-50 text-xs font-semibold h-7 px-2"
              aria-label="Xóa sản phẩm"
            >
              {localUpdating ? '...' : 'Xóa'}
            </Button>
          </div>
        </div>
      </div>

      <CartItemGiftSection
        attachedGifts={attachedGifts}
        giftNudge={giftNudge}
        onAddNudgeQty={handleAddNudgeQty}
        localUpdating={localUpdating}
        isUpdating={isUpdating}
        itemStock={item.availableStock}
        itemQuantity={item.quantity}
      />
    </div>
  );
}
