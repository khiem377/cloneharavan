'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, AlertCircle, Loader2, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { confirm } from '@/components/ui/confirm-dialog';

export default function CartItemRow({
  item,
  onUpdateQuantity,
  onRemoveItem,
  isUpdating = false,
  isSelected = false,
  onToggleSelect,
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
    const isConfirmed = await confirm({
      title: 'Xóa sản phẩm khỏi giỏ hàng?',
      description: `Bạn có chắc chắn muốn xóa "${item.name || 'sản phẩm này'}" khỏi giỏ hàng?`,
      confirmText: 'Xóa sản phẩm',
      cancelText: 'Hủy',
      variant: 'destructive',
    });
    if (!isConfirmed) return;

    setLocalUpdating(true);
    await onRemoveItem(item._id);
    setLocalUpdating(false);
  };

  const thumbnail =
    item.thumbnail ||
    (typeof item.image === 'string' ? item.image : item.image?.url) ||
    '/logo-shop.jpg';

  const productUrl = item.slug ? `/products/${item.slug}` : `/products/${item.productId}`;
  const isOutOfStock =
    Boolean(item.isOutOfStock) || (item.availableStock !== undefined && item.availableStock <= 0);
  const isLowStock = !isOutOfStock && item.availableStock !== undefined && item.availableStock <= 5;

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
        isOutOfStock
          ? 'bg-red-50/40 border-red-200'
          : isSelected
          ? 'bg-white border-red-300 shadow-2xs ring-1 ring-red-200/60'
          : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
      }`}
    >
      <div className="flex gap-2.5 sm:gap-4 items-start">
        {/* Checkbox chọn sản phẩm mua hàng chuẩn Shopee */}
        <div className="pt-2 sm:pt-4 shrink-0 flex items-center justify-center">
          <Checkbox
            checked={isSelected}
            disabled={isOutOfStock || isUpdating || localUpdating}
            onChange={() => onToggleSelect && onToggleSelect(item._id)}
            aria-label={`Chọn sản phẩm ${item.name || ''}`}
            className="h-4 w-4 rounded cursor-pointer"
          />
        </div>

        {/* Ảnh đại diện sản phẩm */}
        <Link
          href={productUrl}
          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-50 group block"
        >
          <img
            src={thumbnail}
            alt={item.name || 'Sản phẩm'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = '/logo-shop.jpg';
            }}
          />
          {item.isFlashSale && (
            <div className="absolute top-1 left-1 bg-red-600 text-white rounded px-1 py-0.5 text-[9px] font-bold flex items-center gap-0.5 shadow-xs">
              <Zap size={9} fill="white" />
              <span>FLASH SALE</span>
            </div>
          )}
        </Link>

        {/* Thông tin sản phẩm */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link
                href={productUrl}
                className="font-semibold text-xs sm:text-sm text-slate-800 hover:text-red-600 line-clamp-2 transition-colors leading-snug"
              >
                {item.name}
              </Link>

              {/* Thuộc tính biến thể (Màu, dung lượng, v.v.) */}
              {Array.isArray(item.attributes) && item.attributes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {item.attributes.map((attr, idx) => (
                    <Badge
                      key={attr._id || idx}
                      variant="secondary"
                      className="text-[11px] font-normal bg-slate-100 text-slate-600 px-2 py-0 border-slate-200"
                    >
                      {attr.colorCode && (
                        <span
                          className="w-2 h-2 rounded-full inline-block mr-1 border border-black/10 shrink-0"
                          style={{ backgroundColor: attr.colorCode }}
                        />
                      )}
                      <span>
                        {attr.name ? `${attr.name}: ` : ''}
                        <strong>{attr.value}</strong>
                      </span>
                    </Badge>
                  ))}
                  {item.sku && (
                    <span className="text-[10px] text-slate-400 font-mono self-center">
                      SKU: {item.sku}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Nút xóa sản phẩm */}
            <button
              type="button"
              onClick={handleRemove}
              disabled={localUpdating || isUpdating}
              className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer shrink-0"
              title="Xóa khỏi giỏ hàng"
              aria-label="Xóa sản phẩm"
            >
              {localUpdating ? (
                <Loader2 size={16} className="animate-spin text-red-600" />
              ) : (
                <Trash2 size={16} />
              )}
            </button>
          </div>

          {/* Cảnh báo kho hàng */}
          {isOutOfStock ? (
            <div className="flex items-center gap-1 text-[11px] font-semibold text-red-600 mt-1.5">
              <AlertCircle size={13} className="shrink-0" />
              <span>Sản phẩm này hiện đã hết hàng trong kho</span>
            </div>
          ) : isLowStock ? (
            <div className="text-[11px] font-medium text-amber-600 mt-1">
              Kho chỉ còn <strong>{item.availableStock}</strong> sản phẩm
            </div>
          ) : null}

          {/* Hàng giá tiền & Bộ điều khiển số lượng */}
          <div className="flex flex-wrap items-end justify-between gap-3 mt-3 pt-2.5 border-t border-slate-100">
            {/* Đơn giá */}
            <div className="flex items-baseline gap-2">
              <span className="text-sm sm:text-base font-bold text-red-600">
                {formatPrice(item.unitPrice)}
              </span>
              {item.originalPrice > item.unitPrice && (
                <span className="text-xs text-slate-400 line-through">
                  {formatPrice(item.originalPrice)}
                </span>
              )}
            </div>

            {/* Bộ điều khiển số lượng & Thành tiền */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={item.quantity <= 1 || localUpdating || isUpdating || isOutOfStock}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  aria-label="Giảm số lượng"
                >
                  <Minus size={13} />
                </button>

                <span className="w-8 sm:w-9 text-center text-xs sm:text-sm font-bold text-slate-800 select-none">
                  {localUpdating ? (
                    <Loader2 size={12} className="animate-spin mx-auto text-slate-500" />
                  ) : (
                    item.quantity
                  )}
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
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  aria-label="Tăng số lượng"
                >
                  <Plus size={13} />
                </button>
              </div>

              {/* Thành tiền của dòng */}
              <div className="text-right min-w-[90px] hidden xs:block">
                <div className="text-[10px] text-slate-400 font-medium">Thành tiền</div>
                <div className="text-sm sm:text-base font-bold text-slate-900">
                  {formatPrice(item.subtotal)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
