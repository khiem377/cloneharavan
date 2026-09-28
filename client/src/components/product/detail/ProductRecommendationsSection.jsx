'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import ProductCard from '@/components/product/ProductCard';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function RecommendationBlock({ title, items = [], isGift = false }) {
  const sliderRef = useRef(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkScroll, items]);

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
    const walk = (x - startX) * 1.4;
    if (Math.abs(walk) > 4) setIsDragging(true);
    sliderRef.current.scrollLeft = scrollLeftState - walk;
    checkScroll();
  };

  const handleScroll = (direction) => {
    if (!sliderRef.current) return;
    const firstCard = sliderRef.current.firstElementChild;
    const cardWidth = firstCard ? firstCard.clientWidth + 12 : 240;
    const scrollAmount = cardWidth * 2;
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScroll, 350);
  };

  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <section className="flex flex-col gap-3.5">
      {/* Header phẳng phân tách bằng Shadcn Separator */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-tight">
              {title}
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              ({items.length})
            </span>
          </div>

          {/* Nút kéo / cuộn qua lại */}
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className="size-7 rounded-[6px] border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none active:scale-[0.98] transition-all cursor-pointer"
              title="Xem sản phẩm trước"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              className="size-7 rounded-[6px] border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none active:scale-[0.98] transition-all cursor-pointer"
              title="Xem sản phẩm tiếp theo"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
        <Separator className="bg-slate-200" />
      </div>

      {/* Danh sách cuộn ngang với width và height chuẩn đều 100% */}
      <div
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onScroll={checkScroll}
        onClickCapture={(e) => {
          if (isDragging) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        className={`flex items-stretch gap-3 overflow-x-auto no-scrollbar py-1 select-none ${
          isDown ? 'cursor-grabbing' : 'cursor-grab scroll-smooth snap-x snap-mandatory'
        }`}
      >
        {items.map((item) => (
          <div
            key={item._id || item.id}
            className="w-[calc((100%-12px)/2)] sm:w-[calc((100%-24px)/3)] md:w-[calc((100%-36px)/4)] lg:w-[calc((100%-48px)/5)] shrink-0 snap-start flex flex-col self-stretch"
          >
            {isGift && item._giftBadge && (
              <div className="mb-1.5 shrink-0">
                <Badge
                  variant="destructive"
                  className="w-full justify-center rounded-[4px] py-0.5 text-[10px] font-bold uppercase tracking-wide bg-red-50 text-red-700 border-red-200"
                >
                  {item._giftBadge}
                </Badge>
              </div>
            )}
            <div className="flex-1 flex flex-col h-full">
              <ProductCard product={item} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ProductRecommendationsSection({
  similarProducts = [],
  personalizedProducts = [],
  frequentlyBought = [],
}) {
  const sections = [
    { title: 'GỢI Ý DÀNH RIÊNG CHO BẠN', items: personalizedProducts },
    { title: 'SẢN PHẨM CÙNG LOẠI', items: similarProducts },
    { title: 'SẢN PHẨM THƯỜNG ĐƯỢC MUA CÙNG', items: frequentlyBought, isGift: true },
  ].filter((s) => Array.isArray(s.items) && s.items.length > 0);

  if (sections.length === 0) return null;

  return (
    <div className="flex flex-col gap-8">
      {sections.map((section) => (
        <RecommendationBlock
          key={section.title}
          title={section.title}
          items={section.items}
          isGift={section.isGift}
        />
      ))}
    </div>
  );
}
