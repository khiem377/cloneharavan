'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function ProductPromotions({ deals, currentPrice = 0 }) {
  const [copiedCode, setCopiedCode] = useState(null);

  const rawCoupons = deals?.coupons || [];
  const giftPrograms = deals?.giftPrograms || [];
  const promotions = deals?.promotions || [];
  const isFlashSale = Boolean(deals?.isFlashSale);

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const hasGifts = !isFlashSale && (giftPrograms.length > 0 || promotions.length > 0);
  const hasCoupons = rawCoupons.length > 0;

  if (!hasGifts && !hasCoupons && !isFlashSale) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* THÔNG BÁO ƯU TIÊN KHI ĐANG FLASH SALE */}
      {isFlashSale && (
        <Card className="rounded-[6px] border border-red-200 bg-red-50/40 p-3 text-xs text-red-900 leading-relaxed shadow-none">
          <strong>LƯU Ý FLASH SALE:</strong> Sản phẩm đang áp dụng mức giá sốc độc quyền. Không áp dụng đồng thời với các chương trình quà tặng kèm hoặc chiết khấu khác. Bạn vẫn có thể sử dụng thêm mã giảm giá ở giỏ hàng.
        </Card>
      )}

      {/* 1. KHỐI QUÀ TẶNG & CHƯƠNG TRÌNH KHUYẾN MÃI THỰC TẾ TỪ BACKEND (SHADCN CARD) */}
      {hasGifts && (
        <Card className="rounded-[6px] border border-red-200 bg-red-50/30 shadow-none overflow-hidden">
          <CardHeader className="p-3 sm:p-4 pb-2 border-b border-red-200">
            <CardTitle className="font-bold text-xs uppercase tracking-wide text-red-700 flex items-center justify-between">
              <span>CHƯƠNG TRÌNH TẶNG KÈM & KHUYẾN MÃI</span>
              <Badge className="bg-red-600 hover:bg-red-600 text-[10px] h-4 rounded-[3px]">
                ƯU ĐÃI THẬT
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-3 sm:p-4 pt-3">
            <ul className="flex flex-col gap-2 text-xs sm:text-sm text-slate-800">
              {/* Gift Programs: Mua X Tặng Y */}
              {giftPrograms.map((gift, idx) => {
                const giftNames =
                  gift.giftType === 'same_product'
                    ? 'Sản phẩm cùng loại'
                    : gift.giftProducts?.map((p) => p.productId?.name || 'Quà tặng kèm').join(', ') || 'Quà tặng kèm';

                return (
                  <li key={`gift-${idx}`} className="flex items-start gap-2">
                    <Badge variant="outline" className="border-red-300 text-red-700 text-[10px] font-bold h-4 px-1 shrink-0 rounded-[2px]">
                      {idx + 1}
                    </Badge>
                    <span>
                      <strong className="font-semibold text-red-700">{gift.name}: </strong>
                      Mua {gift.triggerQty} tặng {gift.giftQty || 1} ({giftNames}).
                      {gift.description && (
                        <span className="text-slate-600 block text-xs mt-0.5">
                          {gift.description}
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}

              {/* Promotions */}
              {promotions.map((promo, idx) => (
                <li key={`promo-${idx}`} className="flex items-start gap-2">
                  <Badge variant="outline" className="border-slate-300 text-slate-700 text-[10px] font-bold h-4 px-1 shrink-0 rounded-[2px]">
                    +
                  </Badge>
                  <span>
                    <strong className="font-semibold text-slate-900">{promo.name}: </strong>
                    {promo.description || 'Ưu đãi áp dụng trực tiếp khi thanh toán.'}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 2. KHỐI COUPONS / MÃ GIẢM GIÁ (SHADCN CARD) */}
      {hasCoupons && (
        <Card className="rounded-[6px] border border-slate-200 bg-white shadow-none overflow-hidden">
          <CardHeader className="p-3 pb-2 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                MÃ GIẢM GIÁ ÁP DỤNG CHO SẢN PHẨM NÀY
              </CardTitle>
              <span className="text-[11px] text-slate-500">
                Bấm để sao chép mã
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-3 pt-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {rawCoupons.slice(0, 4).map((coupon) => {
                const code = coupon.code;
                const isCopied = copiedCode === code;
                const minVal = coupon.minOrderValue || 0;

                return (
                  <div
                    key={coupon._id || code}
                    className="flex items-center justify-between p-2 rounded-[6px] border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-red-600 tracking-wider">
                          {code}
                        </span>
                        {minVal > 0 && (
                          <Badge variant="outline" className="text-[9px] h-3.5 px-1 py-0 border-slate-300 font-normal text-slate-500">
                            &gt;{Math.round(minVal / 1000000)}Tr
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-600 truncate mt-0.5">
                        {coupon.description || `Giảm ${coupon.value ? coupon.value.toLocaleString('vi-VN') : ''}đ`}
                      </span>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant={isCopied ? 'default' : 'outline'}
                      onClick={() => handleCopyCode(code)}
                      className={`h-7 px-3 text-[11px] font-bold rounded-[4px] shrink-0 active:scale-[0.98] ${
                        isCopied
                          ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
                          : 'border-slate-300 hover:border-red-600 hover:text-red-600'
                      }`}
                    >
                      {isCopied ? 'ĐÃ LƯU' : 'SAO CHÉP'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
