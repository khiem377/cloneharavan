'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CartItemGiftSection({
  attachedGifts = [],
  giftNudge = null,
  onAddNudgeQty,
  localUpdating = false,
  isUpdating = false,
  itemStock,
  itemQuantity,
}) {
  const formatPrice = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  return (
    <>
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
                  <Badge className="bg-[#284ea1] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] font-mono tabular-nums">
                    Miễn phí 0₫
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
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

                  <div className="md:col-span-2 text-left md:text-center">
                    <Badge variant="outline" className="px-2 py-0.5 bg-white border border-slate-200 rounded-[4px] font-mono tabular-nums text-xs font-bold text-slate-900">
                      x{gift.quantity || gift.qty || 1}
                    </Badge>
                  </div>

                  <div className="md:col-span-2 text-left md:text-center">
                    <div className="md:hidden text-[10px] text-slate-400 font-medium">Thành tiền:</div>
                    <div className="font-mono tabular-nums font-bold text-xs sm:text-sm text-emerald-600">
                      0₫
                    </div>
                  </div>

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

      {giftNudge && (!attachedGifts || attachedGifts.length === 0) && (
        <div className="mt-3 pl-8 sm:pl-9">
          <div className="bg-blue-50/60 border border-blue-200 rounded-[6px] p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="text-xs text-slate-800 leading-relaxed min-w-0">
              <span>Mua thêm </span>
              <strong className="font-mono tabular-nums font-bold text-[#284ea1] bg-blue-100 px-1 py-0.5 rounded-[4px]">
                {giftNudge.neededQty}
              </strong>
              <span> sản phẩm để nhận ngay quà tặng: </span>
              <strong className="font-semibold text-slate-900">
                {giftNudge.giftName || 'Sản phẩm quà tặng'}
              </strong>
              <span> </span>
              <span className="font-mono tabular-nums font-bold text-emerald-600">(0₫)</span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddNudgeQty}
              disabled={localUpdating || isUpdating || (itemStock !== undefined && itemQuantity + giftNudge.neededQty > itemStock)}
              className="h-7 text-xs font-bold text-[#284ea1] border-blue-300 hover:bg-blue-50 active:scale-[0.98] shrink-0 self-end sm:self-auto"
            >
              + Mua thêm {giftNudge.neededQty}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
