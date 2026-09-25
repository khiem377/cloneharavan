'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Zap, ChevronLeft, ChevronRight, Sparkles, Clock, Flame, ArrowRight } from 'lucide-react';
import FlashSaleProductCard from '../product/FlashSaleProductCard';
import flashSaleService from '../../services/flashSale.service';

export default function HomeFlashSaleSection({ initialData = null }) {
  const [flashSale, setFlashSale] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [toastMessage, setToastMessage] = useState('');
  const sliderRef = useRef(null);

  // Fetch flash sale if not provided
  useEffect(() => {
    if (!initialData) {
      flashSaleService.getActiveFlashSale().then((data) => {
        setFlashSale(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [initialData]);

  // Countdown timer logic
  useEffect(() => {
    if (!flashSale?.endDate) return;

    const calculateTime = () => {
      const difference = +new Date(flashSale.endDate) - +new Date();
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
  }, [flashSale?.endDate]);

  // Filter categories from flashSale.items
  const categories = useMemo(() => {
    if (!flashSale?.items) return [];
    const map = new Map();
    flashSale.items.forEach((item) => {
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
  }, [flashSale?.items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    if (!flashSale?.items) return [];
    if (selectedCategory === 'all') return flashSale.items;

    return flashSale.items.filter((item) => {
      const prod = typeof item.productId === 'object' ? item.productId : null;
      if (!prod?.categories) return false;
      return prod.categories.some((c) => (c.slug || c._id) === selectedCategory);
    });
  }, [flashSale?.items, selectedCategory]);

  // Group items by productId so multiple variants of the same product collapse into 1 card with interactive switcher
  const groupedItems = useMemo(() => {
    if (!filteredItems) return [];
    const map = new Map();
    filteredItems.forEach((it) => {
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
  }, [filteredItems]);

  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e) => {
    if (!sliderRef.current) return;
    setIsDown(true);
    setIsDragging(false);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeftState(sliderRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
    setTimeout(() => setIsDragging(false), 50);
  };

  const handleMouseMove = (e) => {
    if (!isDown || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) setIsDragging(true);
    sliderRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleScroll = (direction) => {
    if (!sliderRef.current) return;
    const cardWidth = 270;
    const scrollAmount = cardWidth * 2;
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const showToast = (text) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(''), 3000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-96 rounded-2xl bg-gradient-to-r from-red-600/10 via-amber-500/10 to-red-600/10 animate-pulse flex items-center justify-center">
          <div className="flex items-center gap-2 text-red-600 font-bold">
            <Zap className="size-5 animate-bounce" /> Đang tải Flash Sale...
          </div>
        </div>
      </div>
    );
  }

  // If no active flash sale
  if (!flashSale || !flashSale.items?.length) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-2 sm:px-4 py-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm border border-gray-700 animate-slide-up">
          <Sparkles className="size-4 text-yellow-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container - Phong Vũ Style Red/Amber Theme */}
      <div className="rounded-2xl bg-gradient-to-br from-[#d70018] via-[#e61e2b] to-[#b30012] p-3 sm:p-5 shadow-xl relative overflow-hidden border border-red-500/30">
        
        {/* Ambient Decorative Glows */}
        <div className="absolute -top-24 -left-24 size-64 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 size-64 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/15">
          
          {/* Title & Countdown */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-yellow-400 text-red-700 shadow-md animate-pulse">
                <Zap className="size-6 fill-red-700" />
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-black italic tracking-wide text-white uppercase flex items-center gap-1.5 drop-shadow-md">
                  FLASH SALE ONLINE
                </h2>
                <p className="text-[11px] sm:text-xs font-medium text-yellow-200/90 hidden sm:block">
                  {flashSale.name || 'Giá sốc có hạn — Số lượng có hạn'}
                </p>
              </div>
            </div>

            {/* Countdown Boxes */}
            <div className="flex items-center gap-1.5 bg-black/35 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
              <Clock className="size-4 text-yellow-300 mr-1 shrink-0 animate-spin-slow" />
              <span className="text-[11px] text-white/80 font-medium hidden md:inline">Kết thúc trong:</span>
              
              {timeLeft.days > 0 && (
                <>
                  <span className="bg-white text-gray-900 font-black text-xs sm:text-sm px-1.5 py-0.5 rounded shadow-sm">
                    {String(timeLeft.days).padStart(2, '0')}
                  </span>
                  <span className="text-white font-bold text-xs">:</span>
                </>
              )}

              <span className="bg-white text-gray-900 font-black text-xs sm:text-sm px-1.5 py-0.5 rounded shadow-sm">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-white font-bold text-xs">:</span>

              <span className="bg-white text-gray-900 font-black text-xs sm:text-sm px-1.5 py-0.5 rounded shadow-sm">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-white font-bold text-xs">:</span>

              <span className="bg-yellow-400 text-red-900 font-black text-xs sm:text-sm px-1.5 py-0.5 rounded shadow-sm">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* View All */}
          <div className="flex items-center gap-2">
            <Link
              href={`/flash-sale/${flashSale.slug || flashSale._id}`}
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-yellow-300 hover:text-white transition-colors group cursor-pointer bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/20"
            >
              <span>Xem tất cả ({flashSale.items.length})</span>
              <ChevronRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Category Pills (Phong Vũ / Hải Linh style tabs) */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-3 scroll-smooth">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-yellow-400 text-red-950 shadow-md shadow-yellow-500/30'
                  : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
              }`}
            >
              Tất cả ({flashSale.items.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat.slug
                    ? 'bg-yellow-400 text-red-950 shadow-md shadow-yellow-500/30'
                    : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Carousel Container with Floating Side Arrows */}
        <div className="relative group/slider mt-1">
          {/* Floating Left Button */}
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white text-gray-900 shadow-2xl border border-gray-200 hover:bg-yellow-400 hover:text-red-950 transition-all flex items-center justify-center z-20 cursor-pointer active:scale-95"
            title="Trước"
          >
            <ChevronLeft size={22} className="stroke-[2.5]" />
          </button>

          {/* Floating Right Button */}
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white text-gray-900 shadow-2xl border border-gray-200 hover:bg-yellow-400 hover:text-red-950 transition-all flex items-center justify-center z-20 cursor-pointer active:scale-95"
            title="Sau"
          >
            <ChevronRight size={22} className="stroke-[2.5]" />
          </button>

          {/* Product Carousel / Horizontal List with Drag & Swipe */}
          <div
            ref={sliderRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={`flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-2 -mx-1 px-1 select-none ${
              isDown ? 'cursor-grabbing' : 'cursor-grab scroll-smooth snap-x snap-mandatory'
            }`}
          >
            {groupedItems.map((item, idx) => (
              <div
                key={item._id || idx}
                className="w-[210px] sm:w-[240px] md:w-[260px] shrink-0 snap-start"
              >
                <FlashSaleProductCard
                  item={item}
                  onAddToCartMock={() => {
                    if (!isDragging) showToast('Đã thêm vào giỏ hàng (Chế độ xem trước)');
                  }}
                  onBuyNowMock={() => {
                    if (!isDragging) showToast('Chuyển tới thanh toán nhanh (Chế độ xem trước)');
                  }}
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
