'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AnimatedLike,
  AnimatedLove,
  AnimatedHaha,
  AnimatedWow,
  AnimatedSad,
  AnimatedAngry,
} from './ReactionAnimatedSvgs';

export const LOTTIE_REACTIONS_MAP = {
  like:  { label: 'Thích',     color: 'text-blue-600',   Component: AnimatedLike },
  love:  { label: 'Yêu thích', color: 'text-rose-600',   Component: AnimatedLove },
  haha:  { label: 'Haha',      color: 'text-amber-500',  Component: AnimatedHaha },
  wow:   { label: 'Wow',       color: 'text-amber-500',  Component: AnimatedWow },
  sad:   { label: 'Buồn',      color: 'text-amber-500',  Component: AnimatedSad },
  angry: { label: 'Phẫn nộ',   color: 'text-orange-600', Component: AnimatedAngry },
};

export default function ReactionLottie({
  type = 'like',
  size = 28,
  className = '',
}) {
  const item = LOTTIE_REACTIONS_MAP[type] || LOTTIE_REACTIONS_MAP.like;
  const Component = item.Component;

  return (
    <div style={{ width: size, height: size }} className={`inline-flex items-center justify-center shrink-0 select-none overflow-visible ${className}`}>
      <Component size={size} />
    </div>
  );
}

export function ReactionLottieFlyoutBar({ onSelect }) {
  const [hoveredReaction, setHoveredReaction] = useState(null);

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-lg animate-in fade-in zoom-in-95 duration-150 select-none z-50">
      {Object.entries(LOTTIE_REACTIONS_MAP).map(([type, cfg]) => {
        const isHovered = hoveredReaction === type;
        const Component = cfg.Component;

        return (
          <div key={type} className="relative group/lottie flex flex-col items-center">
            {isHovered && (
              <span className="absolute -top-7 px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold tracking-tight whitespace-nowrap shadow-sm pointer-events-none animate-in fade-in slide-in-from-bottom-1 duration-100 z-50">
                {cfg.label}
              </span>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onMouseEnter={() => setHoveredReaction(type)}
              onMouseLeave={() => setHoveredReaction(null)}
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(type);
              }}
              className={`h-auto w-auto p-0.5 rounded-full hover:bg-transparent transition-all duration-200 cursor-pointer origin-bottom ${
                isHovered
                  ? 'scale-145 -translate-y-2 z-40 drop-shadow-md'
                  : 'hover:scale-110 opacity-95 hover:opacity-100'
              }`}
              aria-label={cfg.label}
            >
              <Component size={isHovered ? 36 : 28} />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
