'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, ShoppingBag, Home, PhoneCall } from 'lucide-react';
import MascotFlashSale from '@/components/mascot/MascotFlashSale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  SmartphoneIcon,
  LaptopIcon,
  StoreFrontIcon,
  Support247Icon,
} from '@/components/common/Icons';

export default function FlashSaleBlockedState({
  campaignStatus,
  activeSale,
  timeLeft,
  formatDateDisplay,
}) {
  return (
    <div className="min-h-[85vh] bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-[6px] p-6 sm:p-10 text-center shadow-2xs flex flex-col items-center">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4 font-medium">
          <Link href="/" className="hover:text-slate-700 transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/flash-sale" className="hover:text-slate-700 transition-colors">
            Flash Sale
          </Link>
          {activeSale?.name && (
            <>
              <span>/</span>
              <span className="text-slate-600 font-semibold">{activeSale.name}</span>
            </>
          )}
        </div>

        {/* Animated Mascot */}
        <div className="my-1">
          <MascotFlashSale size={280} status={campaignStatus === 'upcoming' ? 'upcoming' : 'ended'} />
        </div>

        {/* Status Badge */}
        <Badge
          variant="secondary"
          className="gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2 bg-amber-50 text-amber-800 border-amber-200"
        >
          <Clock size={13} />
          {campaignStatus === 'upcoming' ? 'Chương trình sắp diễn ra' : 'Chương trình đã kết thúc'}
        </Badge>

        {/* Headline */}
        <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
          {campaignStatus === 'upcoming'
            ? `Chiến dịch "${activeSale?.name || 'Flash Sale'}" chưa chính thức mở bán`
            : activeSale?.name
            ? `Chiến dịch "${activeSale.name}" đã kết thúc`
            : 'Hiện chưa có chương trình Flash Sale đang mở'}
        </h1>

        {/* Description */}
        <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed">
          {campaignStatus === 'upcoming' ? (
            <>
              Khung giờ vàng săn sale sẽ bắt đầu từ{' '}
              <strong className="text-slate-900 font-mono tabular-nums">
                {formatDateDisplay(activeSale?.startDate)}
              </strong>
              .<br />Quý khách vui lòng quay lại đúng khung giờ để nhận ưu đãi giá sốc!
            </>
          ) : activeSale?.endDate ? (
            <>
              Khung giờ Flash Sale của chiến dịch này đã khép lại vào lúc{' '}
              <strong className="text-slate-900 font-mono tabular-nums">
                {formatDateDisplay(activeSale?.endDate)}
              </strong>
              .<br />Toàn bộ sản phẩm giá sốc đã chốt sổ. Cảm ơn quý khách đã quan tâm!
            </>
          ) : (
            'Hiện tại chưa có đợt Flash Sale nào diễn ra. Quý khách vui lòng theo dõi các đợt giảm giá tiếp theo của hệ thống.'
          )}
        </p>

        {/* Countdown timer if upcoming */}
        {campaignStatus === 'upcoming' &&
          (timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0) && (
            <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200 rounded-[6px] w-full max-w-xs">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Đếm ngược đến giờ mở bán
              </p>
              <div className="flex items-center justify-center gap-1.5 text-center">
                {timeLeft.days > 0 && (
                  <>
                    <div className="flex flex-col items-center">
                      <span className="w-9 h-9 rounded-[6px] bg-white border border-slate-200 text-slate-900 font-bold text-base flex items-center justify-center font-mono tabular-nums shadow-2xs">
                        {String(timeLeft.days).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">Ngày</span>
                    </div>
                    <span className="text-slate-400 font-bold text-sm mb-2">:</span>
                  </>
                )}
                <div className="flex flex-col items-center">
                  <span className="w-9 h-9 rounded-[6px] bg-white border border-slate-200 text-slate-900 font-bold text-base flex items-center justify-center font-mono tabular-nums shadow-2xs">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">Giờ</span>
                </div>
                <span className="text-slate-400 font-bold text-sm mb-2">:</span>
                <div className="flex flex-col items-center">
                  <span className="w-9 h-9 rounded-[6px] bg-white border border-slate-200 text-slate-900 font-bold text-base flex items-center justify-center font-mono tabular-nums shadow-2xs">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">Phút</span>
                </div>
                <span className="text-slate-400 font-bold text-sm mb-2">:</span>
                <div className="flex flex-col items-center">
                  <span className="w-9 h-9 rounded-[6px] bg-red-600 text-white font-bold text-base flex items-center justify-center font-mono tabular-nums shadow-2xs">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] text-rose-500 font-medium uppercase mt-0.5">Giây</span>
                </div>
              </div>
            </div>
          )}

        {/* CTA Buttons */}
        <div className="mt-7 flex flex-row flex-wrap items-center justify-center gap-3 w-full">
          <Button asChild variant="default" size="default" className="rounded-[6px] gap-2">
            <Link href="/">
              <ShoppingBag size={15} />
              <span>Khám phá sản phẩm</span>
            </Link>
          </Button>

          <Button asChild variant="outline" size="default" className="rounded-[6px] gap-2">
            <Link href="/">
              <Home size={15} />
              <span>Trang chủ</span>
            </Link>
          </Button>
        </div>

        {/* Category Discovery Helper */}
        <div className="mt-6 pt-5 border-t border-slate-100 w-full">
          <p className="text-xs text-slate-400 mb-2.5 font-medium">Gợi ý danh mục đang có nhiều ưu đãi hot:</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/collections/dien-thoai"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-[6px] font-medium transition-colors"
            >
              <SmartphoneIcon size={14} className="text-slate-500" />
              <span>Điện thoại</span>
            </Link>
            <Link
              href="/collections/laptop"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-[6px] font-medium transition-colors"
            >
              <LaptopIcon size={14} className="text-slate-500" />
              <span>Laptop chính hãng</span>
            </Link>
            <Link
              href="/collections/gia-dung"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-[6px] font-medium transition-colors"
            >
              <StoreFrontIcon size={14} className="text-slate-500" />
              <span>Gia dụng thông minh</span>
            </Link>
            <Link
              href="/collections/phu-kien"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-[6px] font-medium transition-colors"
            >
              <Support247Icon size={14} className="text-slate-500" />
              <span>Phụ kiện & Âm thanh</span>
            </Link>
          </div>
        </div>

        {/* Support Hotline */}
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
          <PhoneCall size={13} className="text-red-600" />
          <span>Tổng đài tư vấn miễn phí:</span>
          <a
            href="tel:099999998"
            className="font-bold text-slate-900 hover:text-red-600 transition-colors tabular-nums font-mono"
          >
            099999998
          </a>
        </div>
      </div>
    </div>
  );
}
