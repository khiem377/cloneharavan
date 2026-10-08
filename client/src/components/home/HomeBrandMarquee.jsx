'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import brandService from '@/services/brand.service';

/**
 * HomeBrandMarquee - Marquee 1 dòng thương hiệu chính hãng
 * Ưu tiên hiển thị dữ liệu SSR được truyền từ Server Component (initialBrands)
 * Tự động fallback sang Axios client interceptor nếu SSR không có dữ liệu
 */
export default function HomeBrandMarquee({ initialBrands = [] }) {
  const [brands, setBrands] = useState(initialBrands);
  const [loading, setLoading] = useState(initialBrands.length === 0);

  useEffect(() => {
    if (initialBrands && initialBrands.length > 0) {
      setBrands(initialBrands);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchBrandsClient = async () => {
      try {
        setLoading(true);
        const data = await brandService.getBrands({ limit: 30 });
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setBrands(data);
        }
      } catch (err) {
        console.error('Lỗi tải thương hiệu:', err?.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBrandsClient();
    return () => {
      isMounted = false;
    };
  }, [initialBrands]);

  // Lọc thương hiệu hợp lệ
  const validBrands = (brands || []).filter((b) => b && (b.name || b.slug));

  if (!loading && validBrands.length === 0) {
    return null;
  }

  // Nhân đôi danh sách để tạo hiệu ứng marquee chạy vô tận không bị ngắt quãng
  const marqueeItems = [...validBrands, ...validBrands];

  return (
    <section className="w-full py-6 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header khối */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Nhãn hiệu tin dùng
          </h2>

          <Link
            href="/brands"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors active:scale-[0.98]"
          >
            <span>Tất cả thương hiệu</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Khung Marquee 1 dòng duy nhất */}
        <div className="relative w-full overflow-hidden rounded-[6px] bg-white border border-slate-200 py-3 shadow-xs">
          {/* Lớp mờ 2 mép tạo cảm giác cuộn mượt mà */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-white to-transparent z-10" />

          {loading && validBrands.length === 0 ? (
            <div className="flex items-center gap-4 px-4 overflow-hidden">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  className="w-36 h-12 rounded-[6px] bg-slate-100 animate-pulse shrink-0"
                />
              ))}
            </div>
          ) : (
            <div className="animate-marquee flex items-center gap-4 px-2">
              {marqueeItems.map((brand, idx) => {
                const logoUrl = brand.logo?.url || (typeof brand.logo === 'string' ? brand.logo : '');
                const targetSlug = brand.slug || brand._id;

                return (
                  <Link
                    key={`${brand._id || targetSlug}-${idx}`}
                    href={`/search?brand=${encodeURIComponent(targetSlug)}`}
                    className="group shrink-0 h-12 sm:h-14 px-4 sm:px-6 rounded-[6px] border border-slate-100 hover:border-slate-300 bg-white flex items-center justify-center transition-all duration-150 active:scale-[0.98]"
                    title={brand.name}
                  >
                    {logoUrl ? (
                      <div className="relative w-24 sm:w-28 h-7 sm:h-8 flex items-center justify-center">
                        <Image
                          src={logoUrl}
                          alt={brand.name || 'Thương hiệu'}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 96px, 112px"
                          className="object-contain transition-transform duration-200 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <span className="text-xs sm:text-sm font-semibold tracking-wide text-slate-700 group-hover:text-slate-950 uppercase whitespace-nowrap">
                        {brand.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
