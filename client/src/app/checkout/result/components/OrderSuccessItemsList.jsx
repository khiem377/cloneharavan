'use client';

import React from 'react';
import { Package, Gift } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function OrderSuccessItemsList({ items = [], pricing = {} }) {
  const formatPrice = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val) || 0);
  };

  const subtotal = pricing?.subtotal || 0;
  const couponDiscount = pricing?.couponDiscount || 0;
  const shippingFee = pricing?.shippingFee || 0;
  const shippingDiscount = pricing?.shippingDiscount || 0;
  const totalAmount = pricing?.totalAmount || 0;

  return (
    <div className="bg-white border border-slate-200 rounded-[6px] p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Package size={16} className="text-slate-800" />
          <h3 className="text-sm font-bold text-slate-900">
            Chi tiết sản phẩm đã mua
          </h3>
        </div>
        <span className="text-xs font-mono tabular-nums text-slate-500 font-medium">
          ({items.length} món)
        </span>
      </div>

      {/* Danh sách items */}
      <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto pr-1">
        {items.map((item, index) => {
          const isGift = Boolean(item.isGift);
          const thumb = item.thumbnail || (typeof item.thumbnail === 'object' ? item.thumbnail?.url : '');

          return (
            <div key={item._id || index} className="py-3 flex items-start gap-3 first:pt-0 last:pb-0">
              <div className="w-14 h-14 rounded-[4px] bg-slate-50 border border-slate-200 shrink-0 overflow-hidden relative flex items-center justify-center">
                {thumb ? (
                  <img
                    src={thumb}
                    alt={item.productName || 'Sản phẩm'}
                    className="w-full h-full object-contain p-1"
                    loading="lazy"
                  />
                ) : (
                  <Package size={20} className="text-slate-400" />
                )}
                {isGift && (
                  <div className="absolute top-0 right-0 bg-[#e30019] text-white p-0.5 rounded-bl-[4px]">
                    <Gift size={10} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-semibold text-slate-900 line-clamp-2 leading-snug">
                    {item.productName}
                  </h4>
                  <span className="font-mono text-xs font-bold text-slate-900 tabular-nums shrink-0">
                    {isGift ? '0₫' : formatPrice(item.lineTotal ?? item.subtotal ?? (item.unitPrice * item.quantity))}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500">
                  {item.variantName && (
                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-[3px]">
                      {item.variantName}
                    </span>
                  )}
                  {item.sku && (
                    <span className="font-mono text-[10px] text-slate-400">
                      SKU: {item.sku}
                    </span>
                  )}
                  <span className="text-slate-600 font-semibold">
                    SL: ×{item.quantity}
                  </span>
                  {isGift && (
                    <Badge variant="outline" className="text-[9px] py-0 px-1 border-rose-300 text-rose-700 bg-rose-50 font-bold">
                      Quà tặng kèm 0₫
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bảng chi tiết chi phí */}
      <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Tạm tính tiền hàng:</span>
          <span className="font-mono text-slate-900 font-medium tabular-nums">
            {formatPrice(subtotal)}
          </span>
        </div>

        {couponDiscount > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>Giảm giá voucher:</span>
            <span className="font-mono text-emerald-700 font-semibold tabular-nums">
              -{formatPrice(couponDiscount)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-slate-600">
          <span>Phí vận chuyển (GHN):</span>
          <span className="font-mono text-slate-900 font-medium tabular-nums">
            +{formatPrice(shippingFee)}
          </span>
        </div>

        {shippingDiscount > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>Giảm giá vận chuyển:</span>
            <span className="font-mono text-sky-700 font-semibold tabular-nums">
              -{formatPrice(shippingDiscount)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-baseline pt-2.5 border-t border-slate-200">
          <span className="text-sm font-bold text-slate-900">Tổng thanh toán:</span>
          <span className="text-base sm:text-lg font-mono font-black text-[#e30019] tabular-nums">
            {formatPrice(totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
