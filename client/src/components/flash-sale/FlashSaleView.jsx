'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Zap,
  Flame,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Sparkles,
  Calendar,
  ArrowUpDown,
  ShoppingBag,
  Home,
  PhoneCall,
  ArrowLeft
} from 'lucide-react';
import FlashSaleProductCard from '@/components/product/FlashSaleProductCard';
import flashSaleService from '@/services/flashSale.service';
import MascotFlashSale from '@/components/mascot/MascotFlashSale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheckIcon,
  SpeedDeliveryIcon,
  EasyReturnIcon,
  Support247Icon,
  SmartphoneIcon,
  LaptopIcon,
  StoreFrontIcon
} from '@/components/common/Icons';

export default function FlashSaleView({ initialActiveSale = null, availableSales = [] }) {
  const [activeSale, setActiveSale] = useState(initialActiveSale);
  const [salesList, setSalesList] = useState(availableSales);
  const [selectedSaleId, setSelectedSaleId] = useState(initialActiveSale?._id || '');
  const [loading, setLoading] = useState(!initialActiveSale);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('discount_desc');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [toastMessage, setToastMessage] = useState('');

  // CSR fetch if SSR had no data
  useEffect(() => {
    if (!initialActiveSale) {
      Promise.all([
        flashSaleService.getActiveFlashSale(),
        flashSaleService.getAvailableFlashSales(),
      ])
        .then(([active, list]) => {
          const validList = Array.isArray(list) ? list : [];
          setSalesList(validList);
          const currentSale = active || validList[0] || null;
          setActiveSale(currentSale);
          if (currentSale?._id) setSelectedSaleId(currentSale._id);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [initialActiveSale]);

  // Determine campaign status: 'ongoing' | 'upcoming' | 'ended' | 'none'
  const campaignStatus = useMemo(() => {
    if (!activeSale || !activeSale.startDate || !activeSale.endDate || activeSale.isActive === false) {
      return 'none';
    }
    const now = new Date();
    const start = new Date(activeSale.startDate);
    const end = new Date(activeSale.endDate);
    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'ongoing';
  }, [activeSale]);

  // Countdown timer logic
  useEffect(() => {
    if (!activeSale) return;
    const targetDate = campaignStatus === 'upcoming' ? activeSale.startDate : activeSale.endDate;
    if (!targetDate) return;

    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [activeSale, campaignStatus]);

  // Extract categories for active campaign
  const categories = useMemo(() => {
    if (!activeSale?.items || campaignStatus !== 'ongoing') return [];
    const map = new Map();
    activeSale.items.forEach((item) => {
      const prod = typeof item.productId === 'object' ? item.productId : null;
      if (prod?.categories && Array.isArray(prod.categories)) {
        prod.categories.forEach((cat) => {
          if (cat?._id && cat?.name) {
            map.set(cat.slug || cat._id, cat.name);
          }
        });
      }
    });
    return Array.from(map.entries()).map(([slug, name]) => ({ slug, name }));
  }, [activeSale?.items, campaignStatus]);

  // Filter and Sort Items (Only for ongoing sales)
  const processedItems = useMemo(() => {
    if (!activeSale?.items || campaignStatus !== 'ongoing') return [];

    let list = [...activeSale.items];

    // Filter by Category
    if (selectedCategory !== 'all') {
      list = list.filter((item) => {
        const prod = typeof item.productId === 'object' ? item.productId : null;
        if (!prod?.categories) return false;
        return prod.categories.some((c) => (c.slug || c._id) === selectedCategory);
      });
    }

    // Sort Items
    list.sort((a, b) => {
      const prodA = typeof a.productId === 'object' ? a.productId : {};
      const prodB = typeof b.productId === 'object' ? b.productId : {};

      const origPriceA = a.originalPrice || prodA.price || 0;
      const origPriceB = b.originalPrice || prodB.price || 0;
      const flashPriceA = a.flashSalePrice || origPriceA;
      const flashPriceB = b.flashSalePrice || origPriceB;

      const discountPercentA = origPriceA > 0 ? ((origPriceA - flashPriceA) / origPriceA) * 100 : 0;
      const discountPercentB = origPriceB > 0 ? ((origPriceB - flashPriceB) / origPriceB) * 100 : 0;

      switch (sortBy) {
        case 'discount_desc':
          return discountPercentB - discountPercentA;
        case 'price_asc':
          return flashPriceA - flashPriceB;
        case 'price_desc':
          return flashPriceB - flashPriceA;
        case 'sold_desc':
          return (b.soldCount || 0) - (a.soldCount || 0);
        default:
          return 0;
      }
    });

    return list;
  }, [activeSale?.items, selectedCategory, sortBy, campaignStatus]);

  // Group items by productId
  const groupedProcessedItems = useMemo(() => {
    if (!processedItems) return [];
    const map = new Map();
    processedItems.forEach((it) => {
      const pId = (typeof it.productId === 'object' ? it.productId._id : it.productId) || it._id;
      if (!map.has(pId)) {
        map.set(pId, {
          ...it,
          variantsList: [it],
        });
      } else {
        map.get(pId).variantsList.push(it);
      }
    });
    return Array.from(map.values());
  }, [processedItems]);

  const showToast = (text) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const formatDateDisplay = (d) => {
    if (!d) return '';
    const date = new Date(d);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())} ngày ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  };

  const formatDateRange = (start, end) => {
    if (!start || !end) return '';
    const d1 = new Date(start);
    const d2 = new Date(end);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d1.getHours())}:${pad(d1.getMinutes())} ${pad(d1.getDate())}/${pad(d1.getMonth() + 1)} — ${pad(d2.getHours())}:${pad(d2.getMinutes())} ${pad(d2.getDate())}/${pad(d2.getMonth() + 1)}/${d2.getFullYear()}`;
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // 1. TRẠNG THÁI BỊ CHẶN (CHƯA MỞ / ĐÃ KẾT THÚC / KHÔNG TỒN TẠI)
  // Hiển thị trực tiếp màn hình Mascot Shopy trung tâm, KHÔNG render hero hay banner thừa!
  // ══════════════════════════════════════════════════════════════════════════════
  if (!loading && campaignStatus !== 'ongoing') {
    return (
      <div className="min-h-[85vh] bg-slate-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl bg-white border border-slate-200 rounded-[6px] p-6 sm:p-10 text-center shadow-2xs flex flex-col items-center">
          
          {/* Breadcrumb nhỏ gọn phía trên */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4 font-medium">
            <Link href="/" className="hover:text-slate-700 transition-colors">Trang chủ</Link>
            <span>/</span>
            <Link href="/flash-sale" className="hover:text-slate-700 transition-colors">Flash Sale</Link>
            {activeSale?.name && (
              <>
                <span>/</span>
                <span className="text-slate-600 font-semibold">{activeSale.name}</span>
              </>
            )}
          </div>

          {/* Animated Mascot Flash Sale (Sad if ended, Hyped if upcoming) */}
          <div className="my-1">
            <MascotFlashSale size={280} status={campaignStatus === 'upcoming' ? 'upcoming' : 'ended'} />
          </div>

          {/* Status Badge */}
          <Badge variant="destructive" className="gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2 bg-amber-50 text-amber-800 border-amber-200">
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
                <strong className="text-slate-900 font-mono tabular-nums">{formatDateDisplay(activeSale?.startDate)}</strong>.
                <br />Quý khách vui lòng quay lại đúng khung giờ để nhận ưu đãi giá sốc!
              </>
            ) : activeSale?.endDate ? (
              <>
                Khung giờ Flash Sale của chiến dịch này đã khép lại vào lúc{' '}
                <strong className="text-slate-900 font-mono tabular-nums">{formatDateDisplay(activeSale?.endDate)}</strong>.
                <br />Toàn bộ sản phẩm giá sốc đã chốt sổ. Cảm ơn quý khách đã quan tâm!
              </>
            ) : (
              'Hiện tại chưa có đợt Flash Sale nào diễn ra. Quý khách vui lòng theo dõi các đợt giảm giá tiếp theo của hệ thống.'
            )}
          </p>

          {/* Countdown timer if upcoming */}
          {campaignStatus === 'upcoming' && (timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0) && (
            <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200 rounded-[6px] w-full max-w-xs">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Đếm ngược đến giờ mở bán</p>
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
                  <span className="w-9 h-9 rounded-[6px] bg-[#e11d48] text-white font-bold text-base flex items-center justify-center font-mono tabular-nums shadow-2xs">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] text-rose-500 font-medium uppercase mt-0.5">Giây</span>
                </div>
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="mt-7 flex flex-row flex-wrap items-center justify-center gap-3 w-full">
            <Link href="/">
              <Button
                variant="default"
                className="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-6 h-10 gap-2"
              >
                <ShoppingBag size={15} />
                <span>Khám phá sản phẩm</span>
              </Button>
            </Link>

            <Link href="/">
              <Button
                variant="outline"
                className="bg-white text-slate-700 hover:bg-slate-50 border-slate-200 font-semibold text-sm px-5 h-10 gap-2"
              >
                <Home size={15} />
                <span>Trang chủ</span>
              </Button>
            </Link>
          </div>

          {/* Dribbble-style Category Discovery Helper (No emojis - Clean SVG Icons) */}
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
            <PhoneCall size={13} className="text-[#e11d48]" />
            <span>Tổng đài tư vấn miễn phí:</span>
            <a
              href="tel:099999998"
              className="font-bold text-slate-900 hover:text-[#e11d48] transition-colors tabular-nums font-mono"
            >
              099999998
            </a>
          </div>

        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // 2. TRẠNG THÁI ĐANG DIỄN RA (ONGOING)
  // Giao diện phẳng, tinh tế, hiện đại chuẩn phong cách EGA / CellphoneS
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-[6px] shadow-lg flex items-center gap-2 text-xs border border-slate-700 animate-slide-up">
          <Sparkles className="size-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── TOP HEADER SECTION (Clean, Solid, Refined) ── */}
      <div className="bg-white border-b border-slate-200 py-4 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-3 font-medium">
            <Link href="/" className="hover:text-slate-700 transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-slate-700 font-semibold">Flash Sale</span>
            {activeSale?.name && (
              <>
                <span>/</span>
                <span className="text-[#e11d48] font-bold">{activeSale.name}</span>
              </>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Title & Badge */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-rose-50 text-rose-600 border border-rose-200 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                <Flame size={13} className="fill-rose-600" />
                <span>GIỜ VÀNG GIÁ SỐC</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
                {activeSale?.name || 'FLASH SALE ONLINE'}
              </h1>
              {activeSale?.startDate && activeSale?.endDate && (
                <p className="text-xs text-slate-500 mt-1 font-mono tabular-nums flex items-center gap-1.5">
                  <Calendar size={13} />
                  <span>Thời gian: {formatDateRange(activeSale.startDate, activeSale.endDate)}</span>
                </p>
              )}
            </div>

            {/* Countdown Box */}
            <div className="bg-slate-900 text-white rounded-[6px] px-4 py-2.5 flex items-center gap-3 shrink-0 shadow-xs">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase">
                <Clock size={14} className="animate-spin-slow" />
                <span>Kết thúc sau:</span>
              </div>

              <div className="flex items-center gap-1 text-center font-mono tabular-nums font-bold">
                {timeLeft.days > 0 && (
                  <>
                    <span className="px-2 py-1 rounded-[4px] bg-slate-800 text-white text-sm">
                      {String(timeLeft.days).padStart(2, '0')}
                    </span>
                    <span className="text-xs text-slate-400 font-sans">ngày</span>
                  </>
                )}
                <span className="px-2 py-1 rounded-[4px] bg-slate-800 text-white text-sm">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-slate-500">:</span>
                <span className="px-2 py-1 rounded-[4px] bg-slate-800 text-white text-sm">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-slate-500">:</span>
                <span className="px-2 py-1 rounded-[4px] bg-[#e11d48] text-white text-sm">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Commitments Bar (Custom Handcrafted Dual-Tone SVG Icons) */}
      <div className="bg-white border-b border-slate-200 py-3">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-medium text-slate-700">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-[6px] bg-rose-50 text-rose-600"><ShieldCheckIcon size={18} /></span>
            <div>
              <p className="font-bold text-slate-900">Cam kết chính hãng</p>
              <p className="text-[11px] text-slate-500">100% thương hiệu uy tín</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-[6px] bg-amber-50 text-amber-600"><SpeedDeliveryIcon size={18} /></span>
            <div>
              <p className="font-bold text-slate-900">Giao hàng hỏa tốc</p>
              <p className="text-[11px] text-slate-500">Nội thành trong 2 giờ</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-[6px] bg-blue-50 text-blue-600"><EasyReturnIcon size={18} /></span>
            <div>
              <p className="font-bold text-slate-900">Đổi trả dễ dàng</p>
              <p className="text-[11px] text-slate-500">Lỗi 1 đổi 1 tận nơi</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-[6px] bg-emerald-50 text-emerald-600"><Support247Icon size={18} /></span>
            <div>
              <p className="font-bold text-slate-900">Hỗ trợ 24/7</p>
              <p className="text-[11px] text-slate-500">Hotline: 099999998</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 mt-6">
        
        {/* Filter and Sort Toolbar */}
        <div className="bg-white rounded-[6px] p-3 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-[0.98] ${
                selectedCategory === 'all'
                  ? 'bg-[#e11d48] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tất cả ({activeSale?.items?.length || 0})
            </button>

            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3 py-1.5 rounded-[6px] text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-[0.98] ${
                  selectedCategory === cat.slug
                    ? 'bg-[#e11d48] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline flex items-center gap-1">
              <ArrowUpDown size={13} /> Sắp xếp:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-8 px-2.5 rounded-[6px] border border-slate-300 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 cursor-pointer"
            >
              <option value="discount_desc">% Giảm nhiều nhất</option>
              <option value="sold_desc">Bán chạy nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
            </select>
          </div>

        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Zap className="size-7 text-[#e11d48] animate-bounce" />
            <p className="text-xs font-semibold text-slate-600">Đang cập nhật danh sách Flash Sale...</p>
          </div>
        ) : groupedProcessedItems.length === 0 ? (
          <div className="bg-white rounded-[6px] border border-slate-200 p-12 text-center my-6 shadow-2xs">
            <Flame size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800">Không có sản phẩm nào thuộc bộ lọc này</p>
            <p className="text-xs text-slate-500 mt-1">Hãy thử chọn lại danh mục hoặc quay lại sau</p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="mt-4 px-4 py-2 rounded-[6px] bg-[#e11d48] text-white text-xs font-bold hover:bg-[#be123c] transition active:scale-[0.98] cursor-pointer"
            >
              Xem tất cả sản phẩm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5 mt-5">
            {groupedProcessedItems.map((item, idx) => (
              <FlashSaleProductCard
                key={item._id || idx}
                item={item}
                onAddToCartMock={() => showToast('Đã thêm vào giỏ hàng')}
                onBuyNowMock={() => showToast('Chuyển tới thanh toán nhanh')}
              />
            ))}
          </div>
        )}

        {/* Promotion Policies Box */}
        <div className="mt-10 bg-white rounded-[6px] border border-slate-200 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="size-4 text-[#e11d48] fill-[#e11d48]" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
              Thể lệ chương trình Flash Sale Online
            </h3>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5 leading-relaxed">
            <li>Mỗi số điện thoại / tài khoản khách hàng được mua tối đa <strong>02 sản phẩm Flash Sale</strong> cùng loại trong suốt thời gian diễn ra.</li>
            <li>Số lượng suất ưu đãi có hạn theo từng khung giờ và có thể kết thúc sớm hơn dự kiến khi hết số lượng phân bổ.</li>
            <li>Giá Flash Sale không áp dụng đồng thời cùng các mã giảm giá thanh toán khác trừ khi có quy định riêng.</li>
            <li>Đơn hàng Flash Sale cần được hoàn tất đặt mua trong thời gian diễn ra để đảm bảo quyền lợi giá ưu đãi.</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
