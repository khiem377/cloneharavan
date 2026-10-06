'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import FlashSaleProductCard from '../product/FlashSaleProductCard';
import flashSaleService from '../../services/flashSale.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

  // Group items by productId
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6">
        <div className="h-80 rounded-[6px] bg-slate-100 animate-pulse flex items-center justify-center border border-slate-200">
          <span className="text-xs font-semibold text-slate-500">Đang tải sản phẩm Flash Sale...</span>
        </div>
      </div>
    );
  }

  if (!flashSale || !flashSale.items?.length) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 my-5" aria-label="Khuyến mãi Flash Sale">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-[6px] shadow-sm text-xs border border-slate-700">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container - Flat Solid Style with 1px Border */}
      <div className="rounded-[6px] bg-[#d70018] p-3.5 sm:p-5 border border-red-700">
        
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-white/20">
          
          {/* Title & Countdown */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-[4px] bg-white text-[#d70018] font-black text-xs uppercase tracking-wider">
                FLASH SALE
              </span>
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-white uppercase">
                {flashSale.name || 'Giá sốc có hạn'}
              </h2>
            </div>

            {/* Countdown Boxes */}
            <div className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-[4px] border border-white/10">
              <span className="text-[11px] text-white/80 font-medium mr-1 hidden sm:inline">Kết thúc trong:</span>
              
              {timeLeft.days > 0 && (
                <>
                  <span className="bg-white text-slate-900 font-bold font-mono text-xs px-1.5 py-0.5 rounded-[3px] tabular-nums">
                    {String(timeLeft.days).padStart(2, '0')}
                  </span>
                  <span className="text-white font-bold text-xs">:</span>
                </>
              )}

              <span className="bg-white text-slate-900 font-bold font-mono text-xs px-1.5 py-0.5 rounded-[3px] tabular-nums">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-white font-bold text-xs">:</span>

              <span className="bg-white text-slate-900 font-bold font-mono text-xs px-1.5 py-0.5 rounded-[3px] tabular-nums">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-white font-bold text-xs">:</span>

              <span className="bg-amber-300 text-slate-950 font-bold font-mono text-xs px-1.5 py-0.5 rounded-[3px] tabular-nums">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* View All Button */}
          <div className="flex items-center gap-2">
            <Link href={`/flash-sale/${flashSale.slug || flashSale._id}`}>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold gap-1 h-7.5"
              >
                <span>Xem tất cả ({flashSale.items.length})</span>
                <span aria-hidden="true">&rarr;</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Category Pills */}
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-3">
            <Button
              type="button"
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className={`text-xs font-bold shrink-0 h-7 px-3 ${
                selectedCategory === 'all'
                  ? 'bg-white text-[#d70018] hover:bg-white/95 border-transparent shadow-xs'
                  : 'bg-white/15 text-white hover:bg-white/25 border-white/20'
              }`}
            >
              Tất cả ({flashSale.items.length})
            </Button>

            {categories.map((cat) => (
              <Button
                key={cat.slug}
                type="button"
                variant={selectedCategory === cat.slug ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`text-xs font-bold shrink-0 h-7 px-3 ${
                  selectedCategory === cat.slug
                    ? 'bg-white text-[#d70018] hover:bg-white/95 border-transparent shadow-xs'
                    : 'bg-white/15 text-white hover:bg-white/25 border-white/20'
                }`}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        )}

        {/* Carousel Container */}
        <div className="relative group/slider mt-1">
          {/* Floating Left Button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleScroll('left')}
            className="hidden sm:flex absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 size-9 rounded-[6px] bg-white text-slate-800 border-slate-300 hover:bg-slate-100 z-20 shadow-xs"
            title="Trước"
          >
            <ChevronLeft size={20} />
          </Button>

          {/* Floating Right Button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleScroll('right')}
            className="hidden sm:flex absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 size-9 rounded-[6px] bg-white text-slate-800 border-slate-300 hover:bg-slate-100 z-20 shadow-xs"
            title="Sau"
          >
            <ChevronRight size={20} />
          </Button>

          {/* Product Carousel */}
          <div
            ref={sliderRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={`flex gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar py-1 -mx-1 px-1 select-none ${
              isDown ? 'cursor-grabbing' : 'cursor-grab scroll-smooth snap-x snap-mandatory'
            }`}
          >
            {groupedItems.map((item, idx) => (
              <div
                key={item._id || idx}
                className="w-[200px] sm:w-[230px] md:w-[250px] shrink-0 snap-start"
              >
                <FlashSaleProductCard
                  item={item}
                  onAddToCartMock={() => {
                    if (!isDragging) showToast('Đã thêm vào giỏ hàng');
                  }}
                  onBuyNowMock={() => {
                    if (!isDragging) showToast('Chuyển tới thanh toán');
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
