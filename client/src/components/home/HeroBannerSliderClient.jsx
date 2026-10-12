'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import bannerService from '../../services/banner.service';

export default function HeroBannerSliderClient({ slides = [] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const trackedSlides = useRef(new Set());

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

    // Track view (chỉ track 1 lần mỗi slide trong 1 page session để tránh spam khi slider lặp lại)
    useEffect(() => {
        const slideId = slides[currentIndex]?._id;

        if (!slideId || trackedSlides.current.has(slideId)) return;

        trackedSlides.current.add(slideId);
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
        touchEndX.current = 0;
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
            className="w-full relative overflow-hidden select-none bg-slate-950 mb-4 sm:mb-6"
            aria-label="Khuyến mãi nổi bật"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div
                className="relative w-full overflow-hidden bg-slate-900 select-none group aspect-[16/7] sm:aspect-[21/8] md:aspect-[24/8] lg:aspect-[28/8] 2xl:aspect-[32/9] max-h-[460px] 2xl:max-h-[520px]"
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
                                <Image
                                    src={slide.imageUrl}
                                    alt={
                                        slide.title ||
                                        slide.altText ||
                                        `Banner ${index + 1}`
                                    }
                                    fill
                                    priority={index === 0}
                                    sizes="100vw"
                                    className={`w-full h-full object-cover object-center transition-transform duration-700 ease-out ${
                                        isCurrent ? 'scale-100' : 'scale-105'
                                    }`}
                                />
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
                        className="absolute left-3 sm:left-6 lg:left-8 top-1/2 -translate-y-1/2 size-9 sm:size-11 rounded-[6px] bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10 border border-white/20 active:scale-95"
                    >
                        <ChevronLeft className="size-5 sm:size-6" />
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
                        className="absolute right-3 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2 size-9 sm:size-11 rounded-[6px] bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10 border border-white/20 active:scale-95"
                    >
                        <ChevronRight className="size-5 sm:size-6" />
                    </button>
                )}

                {totalSlides > 1 && (
                    <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-black/75 border border-white/20">
                        {slides.map((_, idx) => {
                            const active = idx === currentIndex;

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => goToSlide(idx)}
                                    aria-label={`Đi tới banner ${idx + 1}`}
                                    className={`h-1.5 rounded-[2px] transition-all duration-300 cursor-pointer ${
                                        active
                                            ? 'w-6 bg-yellow-400'
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