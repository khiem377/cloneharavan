'use client';

import React from 'react';
import Link from 'next/link';
import { Loader2, AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw, Award, PhoneCall, Gift, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

function TrustStrip() {
  const items = [
    { icon: Award, label: '100% Chính hãng' },
    { icon: ShieldCheck, label: 'Bảo hành 12 tháng' },
    { icon: RefreshCw, label: 'Đổi trả 30 ngày' },
  ];

  return (
    <div className="flex items-center divide-x divide-slate-200 rounded-[6px] border border-slate-200 bg-slate-50/80 overflow-hidden">
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <div key={i} className="flex items-center gap-1.5 px-3 py-2 flex-1 justify-center">
            <Icon size={14} className="text-emerald-600 shrink-0" />
            <span className="text-[11px] font-medium text-slate-700 leading-tight whitespace-nowrap">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ProductQuantityAndBuy({
  quantity,
  onQtyChange,
  currentStock,
  isOutOfStock,
  isLowStock,
  primaryGift,
  isGiftUnlocked,
  triggerQty,
  giftProductNames,
  isAddingToCart,
  onAddToCart,
  finalTotalPrice,
  actionNotice,
}) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Số lượng:</span>
          <div className="inline-flex items-center rounded-[6px] border border-slate-300 bg-white overflow-hidden shadow-2xs">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onQtyChange('dec')}
              disabled={quantity <= 1 || isOutOfStock}
              className="h-8 w-8 rounded-none hover:bg-slate-100 text-slate-700"
              aria-label="Giảm số lượng"
            >
              <Minus size={13} />
            </Button>
            <span className="w-10 text-center text-xs font-bold text-slate-900 select-none tabular-nums font-mono">
              {quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onQtyChange('inc')}
              disabled={quantity >= (currentStock || 99) || isOutOfStock}
              className="h-8 w-8 rounded-none hover:bg-slate-100 text-slate-700"
              aria-label="Tăng số lượng"
            >
              <Plus size={13} />
            </Button>
          </div>

          {isLowStock && (
            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 text-xs font-semibold animate-pulse tabular-nums font-mono">
              Chỉ còn {currentStock} sản phẩm
            </Badge>
          )}
          {!isLowStock && !isOutOfStock && (
            <span className="text-xs text-slate-500 tabular-nums font-mono">
              Có sẵn {currentStock} sản phẩm
            </span>
          )}
        </div>

        {primaryGift && (
          <Alert variant={isGiftUnlocked ? 'success' : 'default'} className="p-3">
            <Gift size={16} className={isGiftUnlocked ? 'text-emerald-600' : 'text-blue-600'} />
            <AlertDescription className="text-xs">
              {isGiftUnlocked ? (
                <span>
                  <strong>ĐÃ ĐỦ ĐIỀU KIỆN NHẬN QUÀ:</strong> Tặng thêm {primaryGift.giftQty || 1} suất quà ({giftProductNames})!
                </span>
              ) : (
                <span>
                  <strong>ƯU ĐÃI TẶNG KÈM ({primaryGift.name}):</strong> Mua {triggerQty} tặng {primaryGift.giftQty || 1} ({giftProductNames}). Mua thêm <strong>{triggerQty - quantity}</strong> sản phẩm để nhận quà!
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <TrustStrip />

      <div id="product-action-buttons" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => onAddToCart(false)}
          disabled={isOutOfStock || isAddingToCart}
          className="h-12 font-bold text-xs sm:text-sm tracking-wide gap-2 border-slate-300 hover:border-slate-400"
        >
          {isAddingToCart ? (
            <>
              <Loader2 size={16} className="animate-spin text-slate-700" />
              <span>ĐANG THÊM...</span>
            </>
          ) : (
            <span>THÊM VÀO GIỎ HÀNG</span>
          )}
        </Button>

        <Button
          type="button"
          variant="default"
          size="lg"
          onClick={() => onAddToCart(true)}
          disabled={isOutOfStock || isAddingToCart}
          className="h-12 flex flex-col items-center justify-center bg-accent hover:bg-accent-hover py-1 text-white shadow-xs leading-tight cursor-pointer"
        >
          <span>MUA NGAY VỚI GIÁ NÀY</span>
          <span className="text-[11px] font-normal opacity-95 font-mono tabular-nums">
            {finalTotalPrice > 0 ? `Tổng: ${finalTotalPrice.toLocaleString('vi-VN')}₫` : ''}
          </span>
        </Button>
      </div>

      {actionNotice && (
        <Alert variant={actionNotice.type === 'error' ? 'destructive' : 'success'} className="p-3">
          {actionNotice.type === 'error' ? (
            <AlertTriangle size={15} />
          ) : (
            <CheckCircle2 size={15} />
          )}
          <AlertDescription className="flex items-center justify-between gap-2 text-xs font-semibold w-full">
            <span>{actionNotice.message}</span>
            {actionNotice.type === 'success' && (
              <Button asChild variant="link" size="sm" className="h-auto p-0 text-brand hover:text-brand-hover font-bold gap-1">
                <Link href="/cart">
                  <span>Xem giỏ hàng</span>
                  <ArrowRight size={13} />
                </Link>
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Card className="flex items-center justify-between p-2.5 rounded-[6px] border-slate-200 bg-slate-50/70 text-xs text-slate-600 shadow-none">
        <div className="flex items-center gap-1.5">
          <PhoneCall size={14} className="text-slate-500" />
          <span>Hỗ trợ tư vấn đặt hàng:</span>
        </div>
        <Button asChild variant="link" size="sm" className="h-auto p-0 font-bold text-brand hover:text-brand-hover">
          <a href="tel:19001000">Hotline: 1900 1000 (Miễn phí)</a>
        </Button>
      </Card>
    </div>
  );
}
