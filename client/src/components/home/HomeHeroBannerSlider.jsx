'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HOME_SLIDES = [
  {
    _id: 'banner-luxury-blue',
    title: 'Sang Trọng & Đẳng Cấp — Điện Máy Chính Hãng',
    imageUrl: '/uploads/banner_luxury_dien_may_v2.jpg',
    link: '/collections',
  },
  {
    _id: 'banner-smart-home-emerald',
    title: 'Gia Dụng Thông Minh — Nâng Tầm Không Gian Sống',
    imageUrl: '/uploads/banner_smart_home_living_v2.jpg',
    link: '/collections',
  },
  {
    _id: 'banner-back-to-school-tech',
    title: 'Mùa Tựu Trường — Săn Sale Công Nghệ',
    imageUrl: '/uploads/banner_back_to_school_tech_v2.jpg',
    link: '/flash-sale/mung-nam-hoc-moi',
  },
];

export default function HomeHeroBannerSlider() {
  const slides = HOME_SLIDES;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (idx) => {
    setCurrentIndex(idx);
  };

  // Auto transition every 4 seconds (within the 3-5s requirement)
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide, totalSlides]);

  // Touch swipe support
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (!slides || slides.length === 0) return null;

  return (
    <section
      className="w-full overflow-hidden bg-slate-900 select-none relative mb-6 shadow-md"
      aria-label="Khuyến mãi nổi bật"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="relative w-full overflow-hidden group aspect-[16/7] sm:aspect-[19/7] md:aspect-[21/8] lg:aspect-[24/8] max-h-[480px]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slides Track */}
        <div
          className="flex h-full w-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, index) => {
            const isCurrent = index === currentIndex;
            const content = (
              <div className="relative w-full h-full shrink-0 flex-none overflow-hidden select-none">
                <img
                  src={slide.imageUrl}
                  alt={slide.title || `Banner ${index + 1}`}
                  className={`w-full h-full object-cover object-center transition-transform duration-1000 ease-out ${
                    isCurrent ? 'scale-100' : 'scale-105'
                  }`}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
                {/* Subtle bottom edge gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
              </div>
            );

            if (slide.link) {
              return (
                <Link
                  key={slide._id || index}
                  href={slide.link}
                  className="block w-full h-full shrink-0 flex-none cursor-pointer"
                >
                  {content}
                </Link>
              );
            }

            return (
              <div key={slide._id || index} className="w-full h-full shrink-0 flex-none">
                {content}
              </div>
            );
          })}
        </div>

        {/* Left Arrow */}
        {totalSlides > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              prevSlide();
            }}
            aria-label="Slide trước"
            className="absolute left-3 sm:left-6 md:left-10 top-1/2 -translate-y-1/2 size-10 sm:size-12 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer z-10 border border-white/20 shadow-xl"
          >
            <ChevronLeft className="size-6 sm:size-7" />
          </button>
        )}

        {/* Right Arrow */}
        {totalSlides > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              nextSlide();
            }}
            aria-label="Slide tiếp theo"
            className="absolute right-3 sm:right-6 md:right-10 top-1/2 -translate-y-1/2 size-10 sm:size-12 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer z-10 border border-white/20 shadow-xl"
          >
            <ChevronRight className="size-6 sm:size-7" />
          </button>
        )}

        {/* Bottom Pagination Dots with animated progress pill */}
        {totalSlides > 1 && (
          <div className="absolute bottom-2.5 sm:bottom-3.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15">
            {slides.map((_, idx) => {
              const active = idx === currentIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  aria-label={`Đi tới banner ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    active
                      ? 'w-7 sm:w-8 bg-yellow-400 shadow-sm'
                      : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
