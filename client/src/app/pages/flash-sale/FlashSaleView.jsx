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
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import FlashSaleProductCard from '@/components/product/FlashSaleProductCard';
import flashSaleService from '@/services/flashSale.service';

export default function FlashSaleView({ initialActiveSale = null, availableSales = [] }) {
  const [activeSale, setActiveSale] = useState(initialActiveSale);
  const [salesList, setSalesList] = useState(availableSales);
  const [selectedSaleId, setSelectedSaleId] = useState(initialActiveSale?._id || '');
  const [loading, setLoading] = useState(!initialActiveSale);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('discount_desc'); // discount_desc, price_asc, price_desc, sold_desc
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [toastMessage, setToastMessage] = useState('');

  // CSR fetch if SSR had no data
  useEffect(() => {
    if (!initialActiveSale) {
      Promise.all([
        flashSaleService.getActiveFlashSale(),
        flashSaleService.getAvailableFlashSales(),
      ]).then(([active, list]) => {
        setActiveSale(active);
        setSalesList(Array.isArray(list) ? list : []);
        if (active?._id) setSelectedSaleId(active._id);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [initialActiveSale]);

  // Handle switching campaign tab
  const handleSelectSale = async (saleId) => {
    if (saleId === selectedSaleId) return;
    setSelectedSaleId(saleId);
    setLoading(true);
    try {
      const data = await flashSaleService.getFlashSaleById(saleId);
      if (data) {
        setActiveSale(data);
        if (typeof window !== 'undefined') {
          window.history.pushState(null, '', `/flash-sale/${data.slug || data._id}`);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer logic
  useEffect(() => {
    if (!activeSale?.endDate) return;

    const calculateTime = () => {
      const difference = +new Date(activeSale.endDate) - +new Date();
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
  }, [activeSale?.endDate]);

  // Extract categories
  const categories = useMemo(() => {
    if (!activeSale?.items) return [];
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
  }, [activeSale?.items]);

  // Filter and Sort Items
  const processedItems = useMemo(() => {
    if (!activeSale?.items) return [];

    let list = [...activeSale.items];

    // Filter by Category
    if (selectedCategory !== 'all') {
      list = list.filter((item) => {
        const prod = typeof item.productId === 'object' ? item.productId : null;
        if (!prod?.categories) return false;
        return prod.categories.some((c) => (c.slug || c._id) === selectedCategory);
      });
    }

    // Sort
    list.sort((a, b) => {
      const priceA = a.flashSalePrice || 0;
      const priceB = b.flashSalePrice || 0;
      const origA = a.originalPrice || 0;
      const origB = b.originalPrice || 0;
      const discA = origA > 0 ? (origA - priceA) / origA : 0;
      const discB = origB > 0 ? (origB - priceB) / origB : 0;
      const soldA = a.soldCount || 0;
      const soldB = b.soldCount || 0;

      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'sold_desc') return soldB - soldA;
      return discB - discA; // default: discount_desc
    });

    return list;
  }, [activeSale?.items, selectedCategory, sortBy]);

  // Group items by productId so multiple variants collapse into 1 card with variant switcher
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

  const formatDateRange = (start, end) => {
    if (!start || !end) return '';
    const d1 = new Date(start);
    const d2 = new Date(end);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d1.getHours())}:${pad(d1.getMinutes())} ${pad(d1.getDate())}/${pad(d1.getMonth() + 1)} - ${pad(d2.getHours())}:${pad(d2.getMinutes())} ${pad(d2.getDate())}/${pad(d2.getMonth() + 1)}`;
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm border border-gray-700 animate-slide-up">
          <Sparkles className="size-4 text-yellow-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner Section (EGA Điện Máy & Hải Linh Style) */}
      <div className="relative bg-gradient-to-r from-[#990000] via-[#cc0000] to-[#e60000] text-white pt-6 pb-12 overflow-hidden shadow-md">
        
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 size-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 size-80 rounded-full bg-yellow-400/10 blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-white/70 mb-4 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-white font-semibold">Flash Sale</span>
            {activeSale?.name && (
              <>
                <span>/</span>
                <span className="text-yellow-300 font-bold">{activeSale.name}</span>
              </>
            )}
          </div>

          {/* Main Campaign Banner Image */}
          {activeSale?.banner?.url && (
            <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-white/20 mb-8 relative aspect-[16/9] bg-slate-900">
              <img
                src={activeSale.banner.url}
                alt={activeSale.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left Title & Promo text */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400 text-red-950 font-black text-xs uppercase tracking-wider mb-3 shadow-md animate-pulse">
                <Zap className="size-3.5 fill-red-950" />
                GIỜ VÀNG SĂN SALE
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black italic uppercase tracking-tight text-white drop-shadow-md">
                {activeSale?.name || 'FLASH SALE ONLINE GIÁ SỐC'}
              </h1>

              <p className="mt-2 text-sm sm:text-base text-white/90 line-clamp-2 font-medium">
                {activeSale?.description || 'Hàng ngàn sản phẩm điện máy, gia dụng, công nghệ giảm sốc tới 70%. Giới hạn mỗi khách hàng, chớp ngay kẻo lỡ!'}
              </p>

              {activeSale?.startDate && activeSale?.endDate && (
                <div className="mt-3 flex items-center gap-2 text-xs text-yellow-200/90 font-mono">
                  <Calendar size={14} />
                  <span>Áp dụng: {formatDateRange(activeSale.startDate, activeSale.endDate)}</span>
                </div>
              )}
            </div>

            {/* Right: Live Glowing Countdown Clock */}
            <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center shrink-0 shadow-xl">
              <div className="flex items-center gap-1.5 text-yellow-300 text-xs font-bold uppercase tracking-wider mb-2.5">
                <Clock className="size-4 animate-spin-slow" />
                <span>Thời gian còn lại</span>
              </div>

              <div className="flex items-center gap-2 text-center">
                {timeLeft.days > 0 && (
                  <>
                    <div className="flex flex-col items-center">
                      <span className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-white text-gray-900 font-black text-xl sm:text-2xl flex items-center justify-center shadow-md">
                        {String(timeLeft.days).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] text-white/80 font-semibold uppercase mt-1">Ngày</span>
                    </div>
                    <span className="text-white font-bold text-xl mb-4">:</span>
                  </>
                )}

                <div className="flex flex-col items-center">
                  <span className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-white text-gray-900 font-black text-xl sm:text-2xl flex items-center justify-center shadow-md">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-white/80 font-semibold uppercase mt-1">Giờ</span>
                </div>
                <span className="text-white font-bold text-xl mb-4">:</span>

                <div className="flex flex-col items-center">
                  <span className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-white text-gray-900 font-black text-xl sm:text-2xl flex items-center justify-center shadow-md">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-white/80 font-semibold uppercase mt-1">Phút</span>
                </div>
                <span className="text-white font-bold text-xl mb-4">:</span>

                <div className="flex flex-col items-center">
                  <span className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-yellow-400 text-red-950 font-black text-xl sm:text-2xl flex items-center justify-center shadow-md">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-yellow-300 font-semibold uppercase mt-1">Giây</span>
                </div>
              </div>
            </div>

          </div>



        </div>
      </div>

      {/* Commitments Bar (Reference: Hải Linh / EGA) */}
      <div className="bg-white border-b border-gray-200 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium text-gray-700">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-red-50 text-red-600"><ShieldCheck size={18} /></span>
            <div>
              <p className="font-bold text-gray-900">Cam kết chính hãng</p>
              <p className="text-[11px] text-gray-500">100% thương hiệu uy tín</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-orange-50 text-orange-600"><Truck size={18} /></span>
            <div>
              <p className="font-bold text-gray-900">Giao hàng hỏa tốc</p>
              <p className="text-[11px] text-gray-500">Nội thành trong 2 giờ</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600"><RotateCcw size={18} /></span>
            <div>
              <p className="font-bold text-gray-900">Đổi trả dễ dàng</p>
              <p className="text-[11px] text-gray-500">Lỗi 1 đổi 1 tận nơi</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><Headphones size={18} /></span>
            <div>
              <p className="font-bold text-gray-900">Hỗ trợ 24/7</p>
              <p className="text-[11px] text-gray-500">Hotline: 099999998</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 mt-6">
        
        {/* Filter and Sort Toolbar */}
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả ({activeSale?.items?.length || 0})
            </button>

            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat.slug
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-gray-500 font-medium hidden sm:inline flex items-center gap-1">
              <ArrowUpDown size={13} /> Sắp xếp:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 cursor-pointer"
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
            <Zap className="size-8 text-red-600 animate-bounce" />
            <p className="text-sm font-semibold text-gray-600">Đang cập nhật danh sách Flash Sale...</p>
          </div>
        ) : groupedProcessedItems.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center my-6">
            <Flame size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-base font-bold text-gray-800">Không có sản phẩm nào thuộc bộ lọc này</p>
            <p className="text-xs text-gray-500 mt-1">Hãy thử chọn lại danh mục hoặc quay lại sau</p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="mt-4 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition cursor-pointer"
            >
              Xem tất cả sản phẩm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4 mt-6">
            {groupedProcessedItems.map((item, idx) => (
              <FlashSaleProductCard
                key={item._id || idx}
                item={item}
                onAddToCartMock={() => showToast('Đã thêm vào giỏ hàng (Chế độ xem trước)')}
                onBuyNowMock={() => showToast('Chuyển tới thanh toán nhanh (Chế độ xem trước)')}
              />
            ))}
          </div>
        )}

        {/* Promotion Policies & Disclaimer Box (Reference: EGA / Hải Linh) */}
        <div className="mt-12 bg-white rounded-2xl border border-red-100 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="size-5 text-red-600 fill-red-600" />
            <h3 className="text-sm sm:text-base font-bold text-gray-900 uppercase">
              Thể lệ chương trình Flash Sale Online
            </h3>
          </div>
          <ul className="text-xs sm:text-sm text-gray-600 space-y-1.5 list-disc pl-5 leading-relaxed">
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
