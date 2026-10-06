'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Gift, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ProductPromotions({ deals, product, currentPrice = 0 }) {
  const [copiedCode, setCopiedCode] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Gom toàn bộ danh sách ưu đãi quà tặng & khuyến mãi thành danh sách phẳng
  const allGiftItems = [];

  giftPrograms.forEach((gift) => {
    if (gift.giftType === 'same_product') {
      allGiftItems.push({
        type: 'gift',
        qty: gift.giftQty || 1,
        name: product?.name || 'Sản phẩm cùng loại',
        slug: product?.slug || '',
        price: product?.price || currentPrice || 0,
        triggerQty: gift.triggerQty || 1,
        programName: gift.name,
        description: gift.description,
      });
    } else if (gift.giftProducts && gift.giftProducts.length > 0) {
      gift.giftProducts.forEach((p) => {
        const prod = p.productId;
        allGiftItems.push({
          type: 'gift',
          qty: p.qty || gift.giftQty || 1,
          name: prod?.name || 'Quà tặng kèm',
          slug: prod?.slug || '',
          price: prod?.price || 0,
          triggerQty: gift.triggerQty || 1,
          programName: gift.name,
          description: gift.description,
        });
      });
    } else {
      allGiftItems.push({
        type: 'gift',
        qty: gift.giftQty || 1,
        name: 'Quà tặng kèm đặc biệt',
        slug: '',
        price: 0,
        triggerQty: gift.triggerQty || 1,
        programName: gift.name,
        description: gift.description,
      });
    }
  });

  // Bổ sung các chương trình khuyến mãi nếu có
  promotions.forEach((promo) => {
    allGiftItems.push({
      type: 'promo',
      name: promo.name,
      description: promo.description || 'Ưu đãi áp dụng trực tiếp khi thanh toán.',
    });
  });

  const hasGifts = !isFlashSale && allGiftItems.length > 0;
  const hasCoupons = rawCoupons.length > 0;

  if (!hasGifts && !hasCoupons && !isFlashSale) {
    return null;
  }

  const visibleGiftItems = isExpanded ? allGiftItems : allGiftItems.slice(0, 2);
  const remainingCount = allGiftItems.length - 2;

  return (
    <div className="flex flex-col gap-3">
      {/* THÔNG BÁO ƯU TIÊN KHI ĐANG FLASH SALE */}
      {isFlashSale && (
        <Card className="rounded-[6px] border border-red-200 bg-red-50/40 p-3 text-xs text-red-900 leading-relaxed shadow-none">
          <strong>LƯU Ý FLASH SALE:</strong> Sản phẩm đang áp dụng mức giá sốc độc quyền. Không áp dụng đồng thời với các chương trình quà tặng kèm hoặc chiết khấu khác. Bạn vẫn có thể sử dụng thêm mã giảm giá ở giỏ hàng.
        </Card>
      )}

      {/* 1. KHỐI ƯU ĐÃI ĐI KÈM (QUÀ TẶNG & KHUYẾN MÃI THỰC TẾ) */}
      {hasGifts && (
        <div className="rounded-[6px] border border-red-200/90 bg-[#FFF5F5] p-3 sm:p-3.5 shadow-none">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-5 h-5 rounded-[4px] border border-red-500 text-red-600 flex items-center justify-center text-[11px] font-bold shrink-0">
              %
            </span>
            <h3 className="font-bold text-sm sm:text-[15px] text-slate-900 tracking-tight">
              Ưu đãi đi kèm
            </h3>
          </div>

          {/* Hộp nội dung quà tặng màu trắng */}
          <div className="bg-white rounded-[6px] p-3 border border-red-100 divide-y divide-red-100">
            {visibleGiftItems.map((item, idx) => (
              <div
                key={`gift-item-${idx}`}
                className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0"
              >
                {/* Icon hộp quà màu đỏ */}
                <Gift className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />

                <div className="text-xs sm:text-[13px] text-slate-800 leading-snug">
                  {item.type === 'gift' ? (
                    <>
                      <span>Tặng ngay {item.qty} x </span>
                      {item.slug ? (
                        <Link
                          href={`/products/${item.slug}`}
                          className="font-bold text-red-600 hover:text-red-700 hover:underline transition-colors"
                          title={`Xem chi tiết ${item.name}`}
                        >
                          {item.name}
                        </Link>
                      ) : (
                        <strong className="font-bold text-red-600">{item.name}</strong>
                      )}
                      {item.price > 0 && (
                        <span className="text-slate-800 font-normal">
                          {' '}(trị giá {item.price.toLocaleString('vi-VN')}đ)
                        </span>
                      )}
                      {item.triggerQty > 1 && (
                        <span className="text-slate-500 text-[11px] block mt-0.5">
                          Áp dụng khi mua từ {item.triggerQty} sản phẩm
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <strong className="font-bold text-red-600">{item.name}: </strong>
                      <span>{item.description}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Nút Xem thêm / Thu gọn khi có hơn 2 ưu đãi */}
          {remainingCount > 0 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-center gap-1 mt-2.5 pt-0.5 text-xs font-medium text-red-600 hover:text-red-700 transition-colors cursor-pointer active:scale-[0.98]"
            >
              <span>
                {isExpanded
                  ? 'Thu gọn ưu đãi'
                  : `Xem thêm ${remainingCount} ưu đãi`}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
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
