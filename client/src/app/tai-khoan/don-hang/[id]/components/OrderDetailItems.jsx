'use client';

import React from 'react';
import { ShoppingBag, Tag, Truck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const formatPrice = (val) => {
  return Number(val || 0).toLocaleString('vi-VN') + '₫';
};

export default function OrderDetailItems({ order }) {
  const items = order?.items || [];
  const pricing = order?.pricing || {};

  return (
    <div className="bg-white border border-slate-200 rounded-[6px] overflow-hidden shadow-xs">
      {/* Card Header */}
      <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Sản phẩm đã đặt ({items.length})
        </h3>
        <span className="text-xs text-slate-500 font-mono">
          {items.reduce((acc, it) => acc + (it.quantity || 1), 0)} món
        </span>
      </div>

      {/* Items List */}
      <div className="divide-y divide-slate-100 p-4">
        {items.map((item, idx) => {
          const unitPrice = item.unitPrice || item.price || 0;
          const qty = item.quantity || 1;
          const lineTotal = item.lineTotal || unitPrice * qty;

          return (
            <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3.5">
              {/* Product Thumbnail */}
              <div className="w-14 h-14 rounded-[4px] border border-slate-200 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <ShoppingBag size={20} className="text-slate-300" />
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-slate-900 line-clamp-2 leading-relaxed">
                  {item.productName}
                </h4>

                <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                  {item.variantName && (
                    <span className="px-1.5 py-0.5 rounded-[4px] bg-slate-100 text-slate-700 font-medium">
                      Phân loại: {item.variantName}
                    </span>
                  )}
                  {item.sku && (
                    <span className="font-mono text-slate-400">
                      SKU: {item.sku}
                    </span>
                  )}
                  <span>
                    SL: <strong className="font-mono text-slate-700">{qty}</strong> × {formatPrice(unitPrice)}
                  </span>
                </div>
              </div>

              {/* Line Total */}
              <div className="text-right shrink-0">
                <span className="text-xs font-bold font-mono text-slate-900 tabular-nums">
                  {formatPrice(lineTotal)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <Separator />

      {/* Price Summary Breakdown */}
      <div className="p-4 bg-slate-50/50 space-y-2.5 text-xs">
        <div className="flex justify-between items-center text-slate-600">
          <span>Tiền hàng (Tạm tính):</span>
          <span className="font-mono text-slate-900 font-semibold tabular-nums">
            {formatPrice(pricing.subtotal)}
          </span>
        </div>

        <div className="flex justify-between items-center text-slate-600">
          <span className="flex items-center gap-1.5">
            <Truck size={13} className="text-slate-400" />
            <span>Phí vận chuyển:</span>
          </span>
          <span className="font-mono text-slate-900 tabular-nums">
            {pricing.shippingFee === 0 ? (
              <span className="text-emerald-600 font-medium">Miễn phí</span>
            ) : (
              formatPrice(pricing.shippingFee)
            )}
          </span>
        </div>

        {pricing.couponDiscount > 0 && (
          <div className="flex justify-between items-center text-emerald-600">
            <span className="flex items-center gap-1.5">
              <Tag size={13} />
              <span>Mã giảm giá ({pricing.couponCode || 'Khuyến mãi'}):</span>
            </span>
            <span className="font-mono font-bold tabular-nums">
              -{formatPrice(pricing.couponDiscount)}
            </span>
          </div>
        )}

        {pricing.shippingDiscount > 0 && (
          <div className="flex justify-between items-center text-emerald-600">
            <span className="flex items-center gap-1.5">
              <Tag size={13} />
              <span>Giảm phí vận chuyển:</span>
            </span>
            <span className="font-mono font-bold tabular-nums">
              -{formatPrice(pricing.shippingDiscount)}
            </span>
          </div>
        )}

        <Separator className="my-1.5" />

        <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-0.5">
          <span>Tổng thanh toán:</span>
          <span className="text-base font-mono text-[#e30019] tabular-nums">
            {formatPrice(pricing.totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
