'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import bannerService from '../../services/banner.service';

export default function HeroBannerSliderClient({ slides = [] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    const totalSlides = slides.length;

    const nextSlide = useCallback(() => {
        if (totalSlides <= 1) return;

        setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, [totalSlides]);

    const prevSlide = useCallback(() => {
        if (totalSlides <= 1) return;

        setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    }, [totalSlides]);

    const goToSlide = (idx) => {
        setCurrentIndex(idx);
    };

    // Track view
    useEffect(() => {
        const slideId = slides[currentIndex]?._id;

        if (!slideId) return;

        bannerService.trackView(slideId);
    }, [currentIndex, slides]);

    // Auto slide
    useEffect(() => {
        if (isPaused || totalSlides <= 1) return;

        const timer = setInterval(() => {
            nextSlide();
        }, 4000);

        return () => clearInterval(timer);
    }, [isPaused, nextSlide, totalSlides]);

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

    const handleBannerClick = (slideId) => {
        if (slideId) {
            bannerService.trackClick(slideId);
        }
    };

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
                <div
                    className="flex h-full w-full transition-transform duration-700 ease-out"
                    style={{
                        transform: `translateX(-${currentIndex * 100}%)`,
                    }}
                >
                    {slides.map((slide, index) => {
                        const isCurrent = index === currentIndex;

                        const content = (
                            <div className="relative w-full h-full shrink-0 flex-none overflow-hidden select-none">
                                <img
                                    src={slide.imageUrl}
                                    alt={
                                        slide.title ||
                                        slide.altText ||
                                        `Banner ${index + 1}`
                                    }
                                    className={`w-full h-full object-cover object-center transition-transform duration-1000 ease-out ${isCurrent ? 'scale-100' : 'scale-105'
                                        }`}
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                            </div>
                        );

                        if (slide.link) {
                            return (
                                <Link
                                    key={slide._id || index}
                                    href={slide.link}
                                    onClick={() => handleBannerClick(slide._id)}
                                    className="block w-full h-full shrink-0 flex-none cursor-pointer"
                                >
                                    {content}
                                </Link>
                            );
                        }

                        return (
                            <div
                                key={slide._id || index}
                                className="w-full h-full shrink-0 flex-none"
                            >
                                {content}
                            </div>
                        );
                    })}
                </div>

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
                                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${active
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