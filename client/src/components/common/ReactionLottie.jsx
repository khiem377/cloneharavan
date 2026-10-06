'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Import trực tiếp các file JSON Lottie Animation thực tế từ thư mục public/lottie/reactions/
import likeJson from '../../../public/lottie/reactions/like.json';
import loveJson from '../../../public/lottie/reactions/love.json';
import hahaJson from '../../../public/lottie/reactions/haha.json';
import wowJson from '../../../public/lottie/reactions/wow.json';
import sadJson from '../../../public/lottie/reactions/sad.json';
import angryJson from '../../../public/lottie/reactions/angry.json';

// Import named export Lottie từ thư viện lottie-react
const Lottie = dynamic(() => import('lottie-react').then((mod) => mod.Lottie), {
  ssr: false,
  loading: () => <div className="w-full h-full rounded-full bg-slate-100 animate-pulse" />,
});

export const LOTTIE_REACTIONS_MAP = {
  like:  { label: 'Thích',     color: 'text-blue-600',   data: likeJson,  file: '/lottie/reactions/like.json' },
  love:  { label: 'Yêu thích', color: 'text-rose-600',   data: loveJson,  file: '/lottie/reactions/love.json' },
  haha:  { label: 'Haha',      color: 'text-amber-500',  data: hahaJson,  file: '/lottie/reactions/haha.json' },
  wow:   { label: 'Wow',       color: 'text-amber-500',  data: wowJson,   file: '/lottie/reactions/wow.json' },
  sad:   { label: 'Buồn',      color: 'text-amber-500',  data: sadJson,   file: '/lottie/reactions/sad.json' },
  angry: { label: 'Phẫn nộ',   color: 'text-orange-600', data: angryJson, file: '/lottie/reactions/angry.json' },
};

/**
 * ReactionLottie — Component render 1 file JSON Lottie
 */
export default function ReactionLottie({
  type = 'like',
  size = 28,
  loop = true,
  autoPlay = true,
  className = '',
}) {
  const item = LOTTIE_REACTIONS_MAP[type] || LOTTIE_REACTIONS_MAP.like;

  return (
    <div style={{ width: size, height: size }} className={`inline-flex items-center justify-center shrink-0 select-none ${className}`}>
      <Lottie
        animationData={item.data}
        loop={loop}
        autoPlay={autoPlay}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

/**
 * ReactionLottieFlyoutBar — Popup thanh cảm xúc chuẩn Facebook dùng các file Lottie JSON
 */
export function ReactionLottieFlyoutBar({ onSelect }) {
  const [hoveredReaction, setHoveredReaction] = useState(null);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-md animate-in fade-in zoom-in-95 duration-150 select-none z-50">
      {Object.entries(LOTTIE_REACTIONS_MAP).map(([type, cfg]) => {
        const isHovered = hoveredReaction === type;

        return (
          <div key={type} className="relative group/lottie flex flex-col items-center">
            {/* Tooltip Label khi hover */}
            {isHovered && (
              <span className="absolute -top-7 px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold tracking-tight whitespace-nowrap shadow-sm pointer-events-none animate-in fade-in slide-in-from-bottom-1 duration-100 z-50">
                {cfg.label}
              </span>
            )}

            <button
              type="button"
              onMouseEnter={() => setHoveredReaction(type)}
              onMouseLeave={() => setHoveredReaction(null)}
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(type);
              }}
              className={`p-0.5 rounded-full transition-all duration-200 cursor-pointer origin-bottom ${
                isHovered
                  ? 'scale-145 -translate-y-2 z-40 drop-shadow-md'
                  : 'hover:scale-110 opacity-90 hover:opacity-100'
              }`}
              title={cfg.label}
              aria-label={cfg.label}
            >
              <ReactionLottie
                type={type}
                size={isHovered ? 36 : 28}
                loop={true}
                autoPlay={true}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}
