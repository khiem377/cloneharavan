'use client';

import React from 'react';
import Link from 'next/link';
import { Gift, Calendar, ArrowRight, Package, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GiftCard({ program }) {
  if (!program) return null;

  const {
    name = '',
    description = '',
    giftType = 'different_product',
    triggerQty = 1,
    giftQty = 1,
    scope = { type: 'all', productIds: [] },
    giftProducts = [],
    endDate = null,
  } = program;

  const formattedEndDate = endDate
    ? new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(endDate))
    : 'Dài hạn';

  const productList = Array.isArray(scope?.productIds) ? scope.productIds : [];

  return (
    <div className="rounded-[6px] border border-slate-200 bg-white hover:border-slate-400 transition-colors duration-150 p-4 sm:p-5 flex flex-col justify-between">
      <div>
        {/* Top Tag & Expiry */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="px-2 py-0.5 rounded-[4px] bg-red-50 text-red-600 border border-red-200 text-[11px] font-bold uppercase tracking-wider font-mono flex items-center gap-1">
            <Gift size={12} />
            <span>{giftType === 'same_product' ? 'Tặng cùng sản phẩm' : 'Tặng quà độc quyền'}</span>
          </span>

          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono tabular-nums">
            <Calendar size={12} />
            <span>Đến {formattedEndDate}</span>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5 [text-wrap:balance]">
          {name}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-2">
          {description || 'Chương trình quà tặng tri ân tự động thêm vào giỏ hàng khi đủ điều kiện số lượng.'}
        </p>

        {/* Condition Box */}
        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-[4px] mb-3 text-xs text-slate-700">
          <div className="flex items-center gap-1.5 font-medium mb-1">
            <Package size={13} className="text-slate-500" />
            <span>Điều kiện áp dụng:</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono tabular-nums">
            Đặt mua từ <strong>{triggerQty} sản phẩm</strong> áp dụng để nhận ngay <strong>{giftQty || 1} suất quà tặng 0₫</strong>.
          </p>
        </div>

        {/* Gift Products Preview */}
        {giftProducts && giftProducts.length > 0 && (
          <div className="mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 font-mono">
              Quà tặng đi kèm (Trị giá 0₫)
            </span>
            <div className="space-y-1.5">
              {giftProducts.map((gp, gIdx) => {
                const gProd = gp.productId;
                if (!gProd) return null;
                return (
                  <div
                    key={gProd._id || gIdx}
                    className="flex items-center gap-2.5 p-2 bg-red-50/50 border border-red-100 rounded-[4px]"
                  >
                    {gProd.thumbnail && (
                      <img
                        src={gProd.thumbnail}
                        alt={gProd.name}
                        className="size-8 object-contain rounded-[2px] bg-white shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {gProd.name}
                      </p>
                      <span className="text-[10px] font-bold text-red-600 font-mono tabular-nums">
                        SL: x{gp.qty || 1} — Miễn phí 100%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Scope Products */}
        {productList.length > 0 && (
          <div className="pt-2 border-t border-slate-100 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 font-mono">
              Áp dụng cho sản phẩm ({productList.length})
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {productList.slice(0, 3).map((prod) => (
                <Link
                  key={prod._id || prod.slug}
                  href={`/products/${prod.slug || prod._id}`}
                  className="flex items-center gap-1.5 p-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-[4px] shrink-0 max-w-[150px] transition-colors"
                  title={prod.name}
                >
                  {prod.thumbnail && (
                    <img
                      src={prod.thumbnail}
                      alt={prod.name}
                      className="size-6 object-contain rounded-[2px] bg-white shrink-0"
                    />
                  )}
                  <span className="text-[11px] font-medium text-slate-700 truncate">
                    {prod.name}
                  </span>
                </Link>
              ))}
              {productList.length > 3 && (
                <span className="text-[10px] text-slate-400 font-mono shrink-0 pl-1">
                  +{productList.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <span className="text-[11px] text-slate-500 font-medium">
          Tự động cộng quà tại giỏ hàng
        </span>
        <Button
          asChild
          variant="default"
          size="sm"
          className="h-8 px-3 rounded-[6px] bg-slate-900 hover:bg-red-600 text-white text-xs font-bold gap-1.5 transition active:scale-[0.98] cursor-pointer"
        >
          <Link href="/collections/all">
            <span>Săn quà ngay</span>
            <ArrowRight size={13} />
          </Link>
        </Button>
      </div>
    </div>
  );
}
