'use client';

import React from 'react';

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
        <circle cx="50" cy="50" r="45" fill="#1877F2" />
        <g style={{ transformOrigin: '32px 32px', animation: 'sparkleLKey 2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite' }}>
          <path d="M 32 24 L 34 30 L 40 32 L 34 34 L 32 40 L 30 34 L 24 32 L 30 30 Z" fill="#FFDF00" />
        </g>
        <g style={{ transformOrigin: '68px 30px', animation: 'sparkleRKey 2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite' }}>
          <path d="M 68 22 L 70 28 L 76 30 L 70 32 L 68 38 L 66 32 L 60 30 L 66 28 Z" fill="#FFEA79" />
        </g>
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
        <circle cx="50" cy="50" r="45" fill="#F02849" />
        <g style={{ transformOrigin: '32px 30px', animation: 'heartFloatL 2.2s ease-out infinite' }}>
          <path d="M 32 30 C 32 26 28 22 24 24 C 20 26 20 32 24 36 L 32 42 L 40 36 C 44 32 44 26 40 24 C 36 22 32 26 32 30 Z" fill="#FFA5B5" />
        </g>
        <g style={{ transformOrigin: '68px 28px', animation: 'heartFloatR 2.2s ease-out infinite' }}>
          <path d="M 68 28 C 68 24 64 20 60 22 C 56 24 56 30 60 34 L 68 40 L 76 34 C 80 30 80 24 76 22 C 72 20 68 24 68 28 Z" fill="#FFA5B5" />
        </g>
        <g style={{ transformOrigin: '50px 52px', animation: 'loveBeatKey 1.5s ease-in-out infinite' }}>
          <path d="M 50 40 C 50 28, 32 24, 26 34 C 18 46, 26 62, 50 78 C 74 62, 82 46, 74 34 C 68 24, 50 28, 50 40 Z" fill="#FFFFFF" />
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
              0%, 100% { transform: rotate(0deg); }
              25% { transform: rotate(-8deg); }
              75% { transform: rotate(8deg); }
            }
            @keyframes hahaTongueKey {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.15) translateY(2px); }
            }
          `}</style>
        </defs>
        <g style={{ transformOrigin: '50px 50px', animation: 'hahaRockKey 0.8s ease-in-out infinite' }}>
          <circle cx="50" cy="50" r="45" fill="#F7B125" />
          <path d="M 24 39 L 36 45 L 24 51" stroke="#333333" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M 76 39 L 64 45 L 76 51" stroke="#333333" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M 28 54 Q 50 86 72 54 Z" fill="#333333" />
          <g style={{ transformOrigin: '50px 65px', animation: 'hahaTongueKey 0.8s ease-in-out infinite' }}>
            <path d="M 37 66 Q 50 86 63 66 Q 50 72 37 66 Z" fill="#E84855" />
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
            @keyframes wowBounceKey {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-7px); }
            }
            @keyframes browLiftKey {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-5px); }
            }
            @keyframes mouthOpenKey {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.2) translateY(2px); }
            }
          `}</style>
        </defs>
        <g style={{ transformOrigin: '50px 50px', animation: 'wowBounceKey 1.2s ease-in-out infinite' }}>
          <circle cx="50" cy="50" r="45" fill="#F7B125" />
          <g style={{ transformOrigin: '50px 28px', animation: 'browLiftKey 1.2s ease-in-out infinite' }}>
            <path d="M 24 28 Q 35 20 44 26" stroke="#333333" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M 76 28 Q 65 20 56 26" stroke="#333333" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          </g>
          <circle cx="34" cy="42" r="7" fill="#333333" />
          <circle cx="66" cy="42" r="7" fill="#333333" />
          <g style={{ transformOrigin: '50px 68px', animation: 'mouthOpenKey 1.2s ease-in-out infinite' }}>
            <ellipse cx="50" cy="68" rx="11" ry="15" fill="#333333" />
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
            @keyframes tearDropKey {
              0%, 100% { opacity: 0; transform: translateY(-6px) scale(0.4); }
              30% { opacity: 1; transform: translateY(0) scale(1); }
              80% { opacity: 0.9; transform: translateY(18px) scale(1.1); }
              95% { opacity: 0; transform: translateY(24px) scale(0.6); }
            }
          `}</style>
        </defs>
        <circle cx="50" cy="50" r="45" fill="#F7B125" />
        <path d="M 24 33 Q 34 38 42 33" stroke="#333333" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <path d="M 76 33 Q 66 38 58 33" stroke="#333333" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <circle cx="34" cy="46" r="6" fill="#333333" />
        <circle cx="66" cy="46" r="6" fill="#333333" />
        <path d="M 33 72 Q 50 56 67 72" stroke="#333333" strokeWidth="5.5" strokeLinecap="round" fill="none" />
        <g style={{ transformOrigin: '68px 52px', animation: 'tearDropKey 1.8s ease-in infinite' }}>
          <path d="M 68 50 C 68 50, 64 56, 64 60 C 64 63, 66 65, 68 65 C 70 65, 72 63, 72 60 C 72 56, 68 50, 68 50 Z" fill="#3B82F6" />
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
              0%, 100% { transform: translate(0, 0); }
              20% { transform: translate(-2px, 1px); }
              40% { transform: translate(2px, -1px); }
              60% { transform: translate(-1px, -1px); }
              80% { transform: translate(1px, 1px); }
            }
          `}</style>
        </defs>
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
