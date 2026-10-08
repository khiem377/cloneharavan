'use client';

import React, { useState } from 'react';

const FALLBACK_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120' fill='none'%3E%3Crect width='120' height='120' rx='6' fill='%23f8fafc'/%3E%3Crect x='30' y='35' width='60' height='45' rx='4' stroke='%23cbd5e1' stroke-width='2' fill='none'/%3E%3Cpolyline points='48 80 40 90 80 90 72 80' stroke='%23cbd5e1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

/**
 * LazyImage — Component hiển thị ảnh sản phẩm với hiệu ứng Lazy Load WOW:
 * 1. Shimmer Wave Placeholder đa lớp (sóng ánh sáng lướt qua).
 * 2. Progressive Blur-Up & Scale-In khi ảnh tải xong (blur(8px) -> blur(0px), scale(0.96) -> scale(1)).
 * 3. Hỗ trợ Secondary Hover Image (lật sang góc ảnh thứ 2 mượt mà).
 * 4. Xử lý fallback tự động nếu ảnh lỗi.
 */
export default function LazyImage({
  src,
  alt = '',
  secondarySrc = '',
  className = '',
  containerClassName = '',
  aspectRatio = 'aspect-square',
  objectFit = 'object-contain',
  fallback = FALLBACK_SVG,
  priority = false,
  zoomOnHover = true,
  ...props
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [secondLoaded, setSecondLoaded] = useState(false);

  const mainSrc = error || !src ? fallback : src;

  return (
    <div
      className={`relative w-full ${aspectRatio} overflow-hidden bg-slate-50/80 select-none ${containerClassName}`}
    >
      {/* 1. SHIMMER WAVE SKELETON PLACEHOLDER */}
      {!loaded && (
        <div className="absolute inset-0 z-0 overflow-hidden bg-slate-100">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          {/* Subtle pulse logo icon placeholder in center */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        </div>
      )}

      {/* 2. PRIMARY IMAGE WITH BLUR-UP & SCALE-IN */}
      <img
        src={mainSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
        className={`absolute inset-0 w-full h-full ${objectFit} p-2 transition-all duration-500 ease-out ${
          loaded
            ? 'opacity-100 blur-0 scale-100'
            : 'opacity-0 blur-md scale-95'
        } ${
          secondarySrc
            ? 'group-hover:opacity-0'
            : zoomOnHover
            ? 'group-hover:scale-105'
            : ''
        } ${className}`}
        {...props}
      />

      {/* 3. SECONDARY HOVER IMAGE (IF PRESENT) */}
      {secondarySrc && (
        <img
          src={secondarySrc}
          alt={`${alt} - góc khác`}
          loading="lazy"
          decoding="async"
          onLoad={() => setSecondLoaded(true)}
          className={`absolute inset-0 w-full h-full ${objectFit} p-2 opacity-0 transition-all duration-500 ease-out group-hover:opacity-100 ${
            zoomOnHover ? 'group-hover:scale-105' : ''
          } ${className}`}
          {...props}
        />
      )}
    </div>
  );
}
