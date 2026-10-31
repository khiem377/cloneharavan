'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

export default function FlashSaleToolbar({
  categories = [],
  selectedCategory,
  onSelectCategory,
  totalItemsCount = 0,
  sortBy,
  onSortChange,
}) {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft: sLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(sLeft > 2);
    setCanScrollRight(sLeft + clientWidth < scrollWidth - 2);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categories]);

  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 4) {
      setHasMoved(true);
    }
    scrollRef.current.scrollLeft = scrollLeft - walk;
    checkScroll();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const scrollByAmount = (amount) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    setTimeout(checkScroll, 300);
  };

  return (
    <div className="bg-white rounded-[6px] p-2.5 sm:p-3 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
      {/* Category Tabs */}
      <div className="relative flex items-center flex-1 min-w-0">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByAmount(-200)}
            aria-label="Cuộn sang trái"
            className="hidden sm:flex absolute left-0 z-10 w-7 h-8 items-center justify-center bg-white/95 border border-slate-200 rounded-[6px] shadow-xs text-slate-700 hover:text-slate-900 cursor-pointer active:scale-[0.98]"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onScroll={checkScroll}
          className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-1 min-w-0 ${
            isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              if (!hasMoved) onSelectCategory('all');
            }}
            className={`text-xs h-8 px-3 rounded-[6px] font-bold shrink-0 transition active:scale-[0.98] cursor-pointer flex items-center gap-1.5 font-mono ${
              selectedCategory === 'all'
                ? 'bg-red-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>Tất cả</span>
            <span className={`text-[10px] px-1 py-0.2 rounded font-mono tabular-nums ${
              selectedCategory === 'all' ? 'bg-red-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {totalItemsCount}
            </span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => {
                  if (!hasMoved) onSelectCategory(cat.slug);
                }}
                className={`text-xs h-8 px-3 rounded-[6px] font-medium shrink-0 transition active:scale-[0.98] cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-red-600 text-white font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollByAmount(200)}
            aria-label="Cuộn sang phải"
            className="hidden sm:flex absolute right-0 z-10 w-7 h-8 items-center justify-center bg-white/95 border border-slate-200 rounded-[6px] shadow-xs text-slate-700 hover:text-slate-900 cursor-pointer active:scale-[0.98]"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Sorting Control */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium hidden sm:flex">
          <SlidersHorizontal size={13} className="text-slate-400" />
          <span>Sắp xếp:</span>
        </div>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sắp xếp sản phẩm Flash Sale"
          className="h-8 px-2.5 rounded-[6px] border border-slate-300 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 cursor-pointer"
        >
          <option value="discount_desc">% Giảm nhiều nhất</option>
          <option value="sold_desc">Bán chạy nhất</option>
          <option value="price_asc">Giá: Thấp đến cao</option>
          <option value="price_desc">Giá: Cao đến thấp</option>
        </select>
      </div>
    </div>
  );
}
