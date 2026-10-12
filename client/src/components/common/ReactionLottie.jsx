'use client';

import React, { useState } from 'react';

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ReactionLottie — Hệ thống hoạt ảnh Reaction động 60fps chuẩn Facebook
 * Hoạt họa sống động từng chi tiết:
 * 1. Thích (Like)     : Ngón cái búng nảy đàn hồi (elastic spring) + 2 chùm sao vàng lấp lánh nổ xoay
 * 2. Yêu thích (Love) : Trái tim đập nhịp kép rộn ràng (double heartbeat) + 2 tim mini bay bổng
 * 3. Haha (Haha)      : Mặt vàng lắc lư qua lại, mắt cười tít (> <), lưỡi rung và 2 giọt lệ cười bắn tung
 * 4. Wow (Wow)        : Đầu nhướng cao kinh ngạc, lông mày nhấc bổng, mắt to tròn và miệng chữ O mở rộng
 * 5. Buồn (Sad)       : Mặt buồn rũ rượi, lông mày cụp âu sầu, giọt lệ xanh lăn dài từ khoé mắt
 * 6. Phẫn nộ (Angry)  : Mặt đỏ rực rung giật tức giận (rage jitter), lông mày trắng cau có và 2 luồng khói bốc lên
 * ══════════════════════════════════════════════════════════════════════════════
 */

export function AnimatedLike({ size = 28 }) {
  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center shrink-0 select-none">
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <defs>
          <style>{`
            @keyframes likeBounceKey {
              0%, 100% { transform: scale(1) rotate(0deg); }
              15% { transform: scale(0.85) rotate(-18deg); }
              35% { transform: scale(1.22) rotate(14deg) translateY(-4px); }
              55% { transform: scale(0.96) rotate(-6deg); }
              75% { transform: scale(1.05) rotate(3deg); }
            }
            @keyframes sparkleLKey {
              0%, 100% { opacity: 0; transform: scale(0) translate(0, 0); }
              20% { opacity: 0; transform: scale(0) translate(0, 0); }
              40% { opacity: 1; transform: scale(1.2) translate(-14px, -14px) rotate(45deg); }
              70% { opacity: 0; transform: scale(0.3) translate(-22px, -22px) rotate(90deg); }
            }
            @keyframes sparkleRKey {
              0%, 100% { opacity: 0; transform: scale(0) translate(0, 0); }
              25% { opacity: 0; transform: scale(0) translate(0, 0); }
              45% { opacity: 1; transform: scale(1.3) translate(14px, -14px) rotate(-45deg); }
              75% { opacity: 0; transform: scale(0.3) translate(22px, -22px) rotate(-90deg); }
            }
          `}</style>
        </defs>

        {/* Nền tròn xanh dương */}
        <circle cx="50" cy="50" r="45" fill="#1877F2" />

        {/* Tia sáng trái */}
        <g style={{ transformOrigin: '32px 32px', animation: 'sparkleLKey 2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite' }}>
          <path d="M 32 24 L 34 30 L 40 32 L 34 34 L 32 40 L 30 34 L 24 32 L 30 30 Z" fill="#FFDF00" />
        </g>

        {/* Tia sáng phải */}
        <g style={{ transformOrigin: '68px 30px', animation: 'sparkleRKey 2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite' }}>
          <path d="M 68 22 L 70 28 L 76 30 L 70 32 L 68 38 L 66 32 L 60 30 L 66 28 Z" fill="#FFEA79" />
        </g>

        {/* Bàn tay Thumbs Up nảy sống động */}
        <g style={{ transformOrigin: '50px 58px', animation: 'likeBounceKey 2s cubic-bezier(0.34, 1.56, 0.64, 1) infinite' }}>
          <rect x="26" y="44" width="10" height="28" rx="3" fill="#FFFFFF" />
          <rect x="39" y="44" width="34" height="28" rx="6" fill="#FFFFFF" />
          <path d="M 39 52 C 39 40, 43 28, 49 26 C 54 24, 57 28, 55 35 L 53 44 Z" fill="#FFFFFF" />
          <line x1="49" y1="51" x2="71" y2="51" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="49" y1="58" x2="71" y2="58" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="49" y1="65" x2="71" y2="65" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

export function AnimatedLove({ size = 28 }) {
  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center shrink-0 select-none">
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <defs>
          <style>{`
            @keyframes loveBeatKey {
              0%, 100% { transform: scale(1); }
              12% { transform: scale(1.32); }
              24% { transform: scale(1.12); }
              38% { transform: scale(1.42); }
              60% { transform: scale(1); }
            }
            @keyframes heartFloatL {
              0%, 100% { opacity: 0; transform: translate(0, 0) scale(0); }
              15% { opacity: 0; transform: translate(0, 0) scale(0); }
              35% { opacity: 1; transform: translate(-14px, -14px) scale(0.9) rotate(-18deg); }
              65% { opacity: 0; transform: translate(-22px, -30px) scale(0.4) rotate(-35deg); }
            }
            @keyframes heartFloatR {
              0%, 100% { opacity: 0; transform: translate(0, 0) scale(0); }
              25% { opacity: 0; transform: translate(0, 0) scale(0); }
              45% { opacity: 1; transform: translate(14px, -12px) scale(0.85) rotate(18deg); }
              75% { opacity: 0; transform: translate(22px, -28px) scale(0.4) rotate(35deg); }
            }
          `}</style>
        </defs>

        {/* Nền tròn đỏ */}
        <circle cx="50" cy="50" r="45" fill="#F02849" />

        {/* Trái tim mini trái */}
        <g style={{ transformOrigin: '35px 45px', animation: 'heartFloatL 2s ease-out infinite' }}>
          <path d="M 35 48 C 30 40, 20 44, 25 52 L 35 60 L 45 52 C 50 44, 40 40, 35 48 Z" fill="#FFA5B5" />
        </g>

        {/* Trái tim mini phải */}
        <g style={{ transformOrigin: '65px 45px', animation: 'heartFloatR 2s ease-out infinite' }}>
          <path d="M 65 48 C 60 40, 50 44, 55 52 L 65 60 L 75 52 C 80 44, 70 40, 65 48 Z" fill="#FFA5B5" />
        </g>

        {/* Trái tim trắng đập nhịp kép */}
        <g style={{ transformOrigin: '50px 53px', animation: 'loveBeatKey 2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite' }}>
          <path
            d="M 50 72 L 44.5 67 C 25 49, 12 37.5, 12 23 C 12 11.2, 21.2 2, 33 2 C 39.6 2, 46 5.1, 50 10 C 54 5.1, 60.4 2, 67 2 C 78.8 2, 88 11.2, 88 23 C 88 37.5, 75 49, 55.5 67 Z"
            transform="translate(17, 21) scale(0.66)"
            fill="#FFFFFF"
          />
        </g>
      </svg>
    </div>
  );
}

export function AnimatedHaha({ size = 28 }) {
  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center shrink-0 select-none">
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <defs>
          <style>{`
            @keyframes hahaRockKey {
              0%, 100% { transform: rotate(0deg) translateY(0); }
              20% { transform: rotate(-10deg) translateY(-2px); }
              40% { transform: rotate(10deg) translateY(2px); }
              60% { transform: rotate(-8deg) translateY(-1px); }
              80% { transform: rotate(6deg) translateY(1px); }
            }
            @keyframes tearBurstL {
              0%, 100% { opacity: 0; transform: translate(0, 0) scale(0); }
              15% { opacity: 0; transform: translate(0, 0) scale(0); }
              35% { opacity: 1; transform: translate(-15px, 6px) scale(1.1) rotate(-35deg); }
              70% { opacity: 0; transform: translate(-25px, 16px) scale(0.3) rotate(-60deg); }
            }
            @keyframes tearBurstR {
              0%, 100% { opacity: 0; transform: translate(0, 0) scale(0); }
              15% { opacity: 0; transform: translate(0, 0) scale(0); }
              35% { opacity: 1; transform: translate(15px, 6px) scale(1.1) rotate(35deg); }
              70% { opacity: 0; transform: translate(25px, 16px) scale(0.3) rotate(60deg); }
            }
            @keyframes tongueWiggleKey {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.2) translateY(-1px); }
            }
          `}</style>
        </defs>

        {/* Nước mắt cười bắn 2 bên */}
        <g style={{ transformOrigin: '24px 50px', animation: 'tearBurstL 1.8s ease-out infinite' }}>
          <ellipse cx="20" cy="52" rx="4" ry="7" fill="#1877F2" />
        </g>
        <g style={{ transformOrigin: '76px 50px', animation: 'tearBurstR 1.8s ease-out infinite' }}>
          <ellipse cx="80" cy="52" rx="4" ry="7" fill="#1877F2" />
        </g>

        {/* Mặt vàng lắc lư cười sảng khoái */}
        <g style={{ transformOrigin: '50px 50px', animation: 'hahaRockKey 1.8s ease-in-out infinite' }}>
          <circle cx="50" cy="50" r="45" fill="#F7B125" />
          <path d="M 24 38 L 35 34 L 43 38" stroke="#7A4B00" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M 57 38 L 65 34 L 76 38" stroke="#7A4B00" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M 26 50 C 26 68, 36 78, 50 78 C 64 78, 74 68, 74 50 Z" fill="#7A4B00" />
          <g style={{ transformOrigin: '50px 68px', animation: 'tongueWiggleKey 0.9s ease-in-out infinite' }}>
            <path d="M 38 68 C 42 62, 58 62, 62 68 C 60 76, 40 76, 38 68 Z" fill="#F02849" />
          </g>
        </g>
      </svg>
    </div>
  );
}

export function AnimatedWow({ size = 28 }) {
  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center shrink-0 select-none">
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <defs>
          <style>{`
            @keyframes wowHeadKey {
              0%, 100% { transform: scale(1) translateY(0); }
              30% { transform: scale(0.92, 1.12) translateY(-4px); }
              60% { transform: scale(1.06, 0.94) translateY(2px); }
            }
            @keyframes wowEyebrowsKey {
              0%, 100% { transform: translateY(0); }
              30% { transform: translateY(-7px); }
              60% { transform: translateY(1px); }
            }
            @keyframes wowMouthKey {
              0%, 100% { transform: scale(1); }
              30% { transform: scale(1.22, 1.35); }
              60% { transform: scale(0.95, 0.9); }
            }
          `}</style>
        </defs>

        {/* Khuôn mặt vàng nhướng lên kinh ngạc */}
        <g style={{ transformOrigin: '50px 50px', animation: 'wowHeadKey 2s cubic-bezier(0.34, 1.56, 0.64, 1) infinite' }}>
          <circle cx="50" cy="50" r="45" fill="#F7B125" />

          {/* Lông mày nhướng cao */}
          <g style={{ transformOrigin: '50px 24px', animation: 'wowEyebrowsKey 2s ease-in-out infinite' }}>
            <path d="M 23 26 Q 32 18 43 24" stroke="#7A4B00" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M 57 24 Q 68 18 77 26" stroke="#7A4B00" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          </g>

          {/* Đôi mắt mở to tròn */}
          <ellipse cx="34" cy="40" rx="7" ry="11" fill="#7A4B00" />
          <ellipse cx="66" cy="40" rx="7" ry="11" fill="#7A4B00" />

          {/* Miệng tròn chữ O thảng thốt */}
          <g style={{ transformOrigin: '50px 65px', animation: 'wowMouthKey 2s ease-in-out infinite' }}>
            <ellipse cx="50" cy="65" rx="11" ry="15" fill="#7A4B00" />
          </g>
        </g>
      </svg>
    </div>
  );
}

export function AnimatedSad({ size = 28 }) {
  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center shrink-0 select-none">
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <defs>
          <style>{`
            @keyframes sadHeadKey {
              0%, 100% { transform: rotate(0deg) translateY(0); }
              25% { transform: rotate(-4deg) translateY(2px); }
              75% { transform: rotate(4deg) translateY(1px); }
            }
            @keyframes tearDropKey {
              0% { opacity: 0; transform: translateY(0) scale(0.4); }
              15% { opacity: 1; transform: translateY(3px) scale(1); }
              70% { opacity: 1; transform: translateY(22px) scale(1.1); }
              90% { opacity: 0; transform: translateY(28px) scale(1.4, 0.4); }
              100% { opacity: 0; transform: translateY(0) scale(0.4); }
            }
          `}</style>
        </defs>

        {/* Khuôn mặt buồn rũ rượi */}
        <g style={{ transformOrigin: '50px 50px', animation: 'sadHeadKey 2.5s ease-in-out infinite' }}>
          <circle cx="50" cy="50" r="45" fill="#F7B125" />
          <path d="M 23 30 Q 32 36 43 28" stroke="#7A4B00" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M 57 28 Q 68 36 77 30" stroke="#7A4B00" strokeWidth="4" strokeLinecap="round" fill="none" />
          <ellipse cx="34" cy="42" rx="6" ry="8" fill="#7A4B00" />
          <ellipse cx="66" cy="42" rx="6" ry="8" fill="#7A4B00" />

          {/* Giọt nước mắt rơi */}
          <g style={{ transformOrigin: '72px 46px', animation: 'tearDropKey 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
            <path d="M 72 44 Q 78 52 78 57 C 78 61 75 64 72 64 C 69 64 66 61 66 57 Q 66 52 72 44 Z" fill="#1877F2" />
          </g>

          <path d="M 33 67 Q 50 56 67 67" stroke="#7A4B00" strokeWidth="5" strokeLinecap="round" fill="none" />
        </g>
      </svg>
    </div>
  );
}

export function AnimatedAngry({ size = 28 }) {
  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center shrink-0 select-none">
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <defs>
          <style>{`
            @keyframes angryJitterKey {
              0%, 100% { transform: translate(0, 0) rotate(0deg); }
              10% { transform: translate(-2px, 1px) rotate(-3deg); }
              20% { transform: translate(2px, -1px) rotate(3deg); }
              30% { transform: translate(-2px, -1px) rotate(-2deg); }
              40% { transform: translate(2px, 1px) rotate(2deg); }
              50% { transform: translate(-1px, 2px) rotate(-3deg); }
              60% { transform: translate(1px, -2px) rotate(3deg); }
              70% { transform: translate(-2px, 1px) rotate(-2deg); }
              80% { transform: translate(2px, -1px) rotate(2deg); }
              90% { transform: translate(-1px, 1px) rotate(-1deg); }
            }
            @keyframes steamPuffL {
              0%, 100% { opacity: 0; transform: translate(0, 0) scale(0.3); }
              15% { opacity: 0.85; transform: translate(-6px, -8px) scale(0.9) rotate(-15deg); }
              60% { opacity: 0; transform: translate(-14px, -20px) scale(1.5) rotate(-35deg); }
            }
            @keyframes steamPuffR {
              0%, 100% { opacity: 0; transform: translate(0, 0) scale(0.3); }
              25% { opacity: 0.85; transform: translate(6px, -8px) scale(0.9) rotate(15deg); }
              70% { opacity: 0; transform: translate(14px, -20px) scale(1.5) rotate(35deg); }
            }
          `}</style>
        </defs>

        {/* Khói bốc lên trái */}
        <g style={{ transformOrigin: '28px 24px', animation: 'steamPuffL 1.5s ease-out infinite' }}>
          <circle cx="24" cy="18" r="6" fill="rgba(255,255,255,0.75)" />
          <circle cx="28" cy="14" r="8" fill="rgba(255,255,255,0.6)" />
        </g>

        {/* Khói bốc lên phải */}
        <g style={{ transformOrigin: '72px 24px', animation: 'steamPuffR 1.5s ease-out infinite' }}>
          <circle cx="76" cy="18" r="6" fill="rgba(255,255,255,0.75)" />
          <circle cx="72" cy="14" r="8" fill="rgba(255,255,255,0.6)" />
        </g>

        {/* Mặt đỏ rực rung giật */}
        <g style={{ transformOrigin: '50px 50px', animation: 'angryJitterKey 0.6s linear infinite' }}>
          <circle cx="50" cy="50" r="45" fill="#E94F37" />
          <path d="M 22 26 L 44 37" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M 78 26 L 56 37" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="34" cy="44" r="6" fill="#FFFFFF" />
          <circle cx="66" cy="44" r="6" fill="#FFFFFF" />
          <path d="M 33 69 Q 50 58 67 69" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" fill="none" />
        </g>
      </svg>
    </div>
  );
}

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

/**
 * ReactionLottieFlyoutBar — Popup thanh cảm xúc chuẩn Facebook với hiệu ứng hoạt hình siêu mượt
 */
export function ReactionLottieFlyoutBar({ onSelect }) {
  const [hoveredReaction, setHoveredReaction] = useState(null);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-lg animate-in fade-in zoom-in-95 duration-150 select-none z-50">
      {Object.entries(LOTTIE_REACTIONS_MAP).map(([type, cfg]) => {
        const isHovered = hoveredReaction === type;
        const Component = cfg.Component;

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
                  : 'hover:scale-110 opacity-95 hover:opacity-100'
              }`}
              title={cfg.label}
              aria-label={cfg.label}
            >
              <Component size={isHovered ? 36 : 28} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
