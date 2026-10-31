'use client';

import React, { useState, useEffect } from 'react';
import { Zap, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

function CountdownDigitBlock({ value, isRed = false, label = '' }) {
  const display = String(Math.max(0, value)).padStart(2, '0');

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative overflow-hidden flex items-center justify-center min-w-[26px] sm:min-w-[28px] h-6 sm:h-7 px-1 rounded-[4px] font-mono font-bold text-xs sm:text-[13px] tabular-nums tracking-wider ${
          isRed
            ? 'bg-red-600 text-white border border-red-700'
            : 'bg-slate-900 text-white border border-slate-800'
        }`}
      >
        <span key={display}>{display}</span>
      </div>
      {label && (
        <span className="text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase tracking-tight mt-0.5">
          {label}
        </span>
      )}
    </div>
  );
}

function FlashSaleCountdown({ endDate }) {
  const calculate = () => {
    if (!endDate) return null;
    const target = new Date(endDate).getTime();
    if (isNaN(target)) return null;
    const diff = target - Date.now();
    if (diff <= 0) return null;

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  const [time, setTime] = useState(null);

  useEffect(() => {
    setTime(calculate());
    const interval = setInterval(() => {
      setTime(calculate());
    }, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  if (!time) {
    return <span className="text-xs text-slate-500 font-medium">Đang diễn ra</span>;
  }

  const d = time.days ?? 0;
  const h = time.hours ?? 0;
  const m = time.minutes ?? 0;
  const s = time.seconds ?? 0;

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline">Kết thúc trong:</span>
      <div className="flex items-start gap-1">
        {d > 0 && (
          <>
            <CountdownDigitBlock value={d} label="Ngày" />
            <span className="text-slate-400 font-bold text-xs mt-1 animate-pulse">:</span>
          </>
        )}
        <CountdownDigitBlock value={h} label="Giờ" />
        <span className="text-slate-400 font-bold text-xs mt-1 animate-pulse">:</span>
        <CountdownDigitBlock value={m} label="Phút" />
        <span className="text-slate-400 font-bold text-xs mt-1 animate-pulse">:</span>
        <CountdownDigitBlock value={s} isRed label="Giây" />
      </div>
    </div>
  );
}

export default function ProductPriceBox({
  isFlashSale = false,
  flashSaleDeal = null,
  matchedFsItem = null,
  deals = null,
  currentBasePrice = 0,
  hasDiscount = false,
  originalPrice = 0,
  discountPercent = 0,
  savingsAmount = 0,
}) {
  const soldPercent =
    matchedFsItem?.stockLimit > 0
      ? Math.min(100, Math.round(((matchedFsItem.soldCount || 0) / matchedFsItem.stockLimit) * 100))
      : 0;

  return (
    <Card className="rounded-[6px] border-slate-200 bg-slate-50/70 shadow-none overflow-hidden">
      <CardContent className="p-3.5 sm:p-4 flex flex-col gap-2.5">
        {isFlashSale && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
              <div className="flex items-center gap-2 min-w-0">
                <Badge variant="default" className="bg-red-600 hover:bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 tracking-wider gap-1 shrink-0">
                  <Zap size={11} className="fill-white" />
                  <span>FLASH SALE</span>
                </Badge>
                <span className="font-bold text-xs sm:text-sm text-slate-800 tracking-tight truncate max-w-[180px] sm:max-w-[260px] uppercase">
                  {flashSaleDeal?.name || 'SỰ KIỆN GIẢM SỐC'}
                </span>
              </div>
              {deals?.flashSale?.endDate && (
                <FlashSaleCountdown endDate={deals.flashSale.endDate} />
              )}
            </div>
            <Separator className="bg-slate-200" />
          </>
        )}

        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-red-600 tracking-tight font-mono tabular-nums">
            {currentBasePrice > 0 ? `${currentBasePrice.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
          </span>

          {hasDiscount && (
            <>
              <span className="text-sm sm:text-base text-slate-400 line-through font-mono tabular-nums">
                {originalPrice.toLocaleString('vi-VN')}₫
              </span>
              <Badge variant="destructive" className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 font-mono tabular-nums">
                -{discountPercent}%
              </Badge>
            </>
          )}
        </div>

        {hasDiscount && savingsAmount > 0 && (
          <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
            <TrendingDown size={14} className="text-emerald-600" />
            <span>Tiết kiệm: <strong className="font-mono tabular-nums">{savingsAmount.toLocaleString('vi-VN')}₫</strong> so với giá niêm yết</span>
          </div>
        )}

        {isFlashSale && matchedFsItem?.stockLimit > 0 && (
          <div className="pt-2 flex flex-col gap-1.5">
            <Separator className="bg-slate-200/80 mb-1" />
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">
                Đã bán: <strong className="font-mono tabular-nums text-slate-900">{matchedFsItem.soldCount || 0} / {matchedFsItem.stockLimit}</strong> suất
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                {matchedFsItem.remaining > 0 ? (
                  <>Còn <strong className="font-mono tabular-nums text-red-600">{matchedFsItem.remaining}</strong> suất ưu đãi</>
                ) : (
                  <strong className="text-red-600">Đã bán hết suất</strong>
                )}
              </span>
            </div>
            <Progress value={soldPercent} className="h-1.5 bg-slate-200 [&>div]:bg-red-600" />
          </div>
        )}

        {isFlashSale && flashSaleDeal?.description && (
          <>
            <Separator className="bg-slate-200/80" />
            <p className="text-xs text-slate-600 leading-relaxed">
              {flashSaleDeal.description}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
