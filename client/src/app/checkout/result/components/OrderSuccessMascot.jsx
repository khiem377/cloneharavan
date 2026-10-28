'use client';

import React, { useId } from 'react';

/**
 * OrderSuccessMascot — Studio-grade Animated 3D Vector Mascot Artwork
 * "Anty Shopy — Đặt hàng thành công!"
 * Đồng bộ 100% nhận diện thương hiệu MascotBot & MascotCartEmpty
 */
export default function OrderSuccessMascot({ className = 'w-36 h-36 sm:w-40 sm:h-40' }) {
  const rawId = useId();
  const uid = rawId ? rawId.replace(/[^a-zA-Z0-9_-]/g, '_') : 'osm';

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible drop-shadow-sm">
        <defs>
          <radialGradient id={`aura_${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#dbeafe" stopOpacity="0.4" />
            <stop offset="75%" stopColor="#f0fdf4" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`pearl_${uid}`} x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" /><stop offset="45%" stopColor="#f8fafc" />
            <stop offset="85%" stopColor="#e2e8f0" /><stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id={`visor_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" /><stop offset="40%" stopColor="#0f172a" /><stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id={`redCoat_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" /><stop offset="50%" stopColor="#e11d48" /><stop offset="100%" stopColor="#9f1239" />
          </linearGradient>
          <linearGradient id={`blueTech_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" /><stop offset="50%" stopColor="#2563eb" /><stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          <linearGradient id={`partyHat_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb7185" /><stop offset="40%" stopColor="#e11d48" /><stop offset="100%" stopColor="#9f1239" />
          </linearGradient>
          <linearGradient id={`parcelGold_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" /><stop offset="35%" stopColor="#facc15" />
            <stop offset="70%" stopColor="#eab308" /><stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
          <linearGradient id={`starGold_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" /><stop offset="60%" stopColor="#facc15" /><stop offset="100%" stopColor="#eab308" />
          </linearGradient>
          <linearGradient id={`gloss_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" /><stop offset="45%" stopColor="#ffffff" stopOpacity="0.12" /><stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`beacon_${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.95" /><stop offset="60%" stopColor="#06b6d4" stopOpacity="0.5" /><stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`shadow_${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.25" /><stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>
          <filter id={`eyeGlow_${uid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id={`drop3D_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.12" />
          </filter>
          <style>{`
            @keyframes botFloatSuccess_${uid} { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-8px) rotate(1.2deg); } }
            @keyframes armCelebrate_${uid} { 0%, 100% { transform: rotate(0deg); } 30% { transform: rotate(-8deg); } 70% { transform: rotate(6deg); } }
            @keyframes parcelBob_${uid} { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-4px) rotate(-1.5deg); } }
            @keyframes shadowPulse_${uid} { 0%, 100% { transform: scale(1); opacity: 0.28; } 50% { transform: scale(0.82); opacity: 0.14; } }
            @keyframes starTwinkle_${uid} { 0%, 100% { transform: scale(0.8) rotate(0deg); opacity: 0.4; } 50% { transform: scale(1.25) rotate(45deg); opacity: 1; } }
            @keyframes beaconPulse_${uid} { 0%, 100% { transform: scale(1); opacity: 0.95; } 50% { transform: scale(1.4); opacity: 0.45; } }
            .anim-float-${uid} { animation: botFloatSuccess_${uid} 3.2s ease-in-out infinite; }
            .anim-arm-${uid} { transform-origin: 154px 115px; animation: armCelebrate_${uid} 2.4s ease-in-out infinite; }
            .anim-parcel-${uid} { transform-origin: 52px 145px; animation: parcelBob_${uid} 3.2s ease-in-out infinite; }
            .anim-shadow-${uid} { transform-origin: 110px 200px; animation: shadowPulse_${uid} 3.2s ease-in-out infinite; }
            .anim-star-1-${uid} { transform-origin: 32px 42px; animation: starTwinkle_${uid} 2.6s ease-in-out infinite; }
            .anim-star-2-${uid} { transform-origin: 190px 48px; animation: starTwinkle_${uid} 3.1s ease-in-out infinite 0.7s; }
            .anim-star-3-${uid} { transform-origin: 196px 142px; animation: starTwinkle_${uid} 2.8s ease-in-out infinite 1.2s; }
            .anim-beacon-${uid} { transform-origin: 110px 24px; animation: beaconPulse_${uid} 1.8s ease-in-out infinite; }
          `}</style>
        </defs>

        {/* Hào quang nền lễ hội */}
        <ellipse cx="110" cy="115" rx="88" ry="88" fill={`url(#aura_${uid})`} />
        <circle cx="110" cy="115" r="84" stroke="#93c5fd" strokeWidth="1.2" strokeDasharray="4 6" strokeOpacity="0.4" />

        {/* Các ngôi sao vàng lấp lánh */}
        <g className={`anim-star-1-${uid}`}><path d="M 32 34 L 34.5 40 L 41 42 L 34.5 44 L 32 50 L 29.5 44 L 23 42 L 29.5 40 Z" fill={`url(#starGold_${uid})`} /></g>
        <g className={`anim-star-2-${uid}`}><path d="M 190 40 L 192.5 46 L 199 48 L 192.5 50 L 190 56 L 187.5 50 L 181 48 L 187.5 46 Z" fill={`url(#starGold_${uid})`} /></g>
        <g className={`anim-star-3-${uid}`}><path d="M 196 135 L 198 140 L 204 142 L 198 144 L 196 149 L 194 144 L 188 142 L 194 140 Z" fill="#38bdf8" /></g>

        {/* Hạt photon màu sắc */}
        <circle cx="28" cy="100" r="3.2" fill="#f43f5e" opacity="0.8" />
        <circle cx="44" cy="170" r="2.8" fill="#10b981" opacity="0.8" />
        <circle cx="178" cy="95" r="3.2" fill="#fbbf24" opacity="0.85" />

        {/* Bóng đổ mặt sàn */}
        <ellipse cx="110" cy="200" rx="48" ry="9" fill={`url(#shadow_${uid})`} className={`anim-shadow-${uid}`} />

        {/* Robot Anty Shopy ăn mừng */}
        <g className={`anim-float-${uid}`}>
          {/* Ăng-ten phát sóng cyan */}
          <line x1="110" y1="40" x2="110" y2="24" stroke="#94a3b8" strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="110" cy="24" r="11" fill={`url(#beacon_${uid})`} className={`anim-beacon-${uid}`} />
          <circle cx="110" cy="24" r="5.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />

          {/* Mũ tiệc sinh nhật ăn mừng đỏ sọc vàng */}
          <g transform="translate(118, 38) rotate(14)">
            <path d="M -15 0 L 0 -34 L 15 0 Z" fill={`url(#partyHat_${uid})`} />
            <path d="M -10 -11 L 10 -11" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M -6 -22 L 6 -22" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
            <circle cx="0" cy="-35" r="4.5" fill="#facc15" stroke="#fef08a" strokeWidth="1" />
          </g>

          {/* Tai nghe công nghệ 2 bên */}
          <g transform="translate(56, 75) rotate(-6)">
            <rect x="-6" y="-16" width="12" height="32" rx="6" fill={`url(#blueTech_${uid})`} stroke="#1e40af" strokeWidth="1.2" />
            <circle cx="0" cy="0" r="4.5" fill="#e11d48" /><circle cx="0" cy="0" r="1.8" fill="#ffffff" />
          </g>
          <g transform="translate(164, 75) rotate(6)">
            <rect x="-6" y="-16" width="12" height="32" rx="6" fill={`url(#blueTech_${uid})`} stroke="#1e40af" strokeWidth="1.2" />
            <circle cx="0" cy="0" r="4.5" fill="#e11d48" /><circle cx="0" cy="0" r="1.8" fill="#ffffff" />
          </g>

          {/* Thân Robot + Áo yếm đỏ SHOP */}
          <path d="M 80 108 C 80 108 76 156 76 166 C 76 174 90 178 110 178 C 130 178 144 174 144 166 C 144 156 140 108 140 108 Z" fill={`url(#pearl_${uid})`} stroke="#cbd5e1" strokeWidth="1.8" />
          <path d="M 86 114 L 134 114 L 130 160 C 130 166 122 170 110 170 C 98 170 90 166 90 160 Z" fill={`url(#redCoat_${uid})`} stroke="#9f1239" strokeWidth="1.2" />
          <circle cx="110" cy="138" r="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
          <path d="M 111 131 L 105 139 L 110 139 L 109 146 L 116 138 L 111 138 Z" fill="#e11d48" />

          {/* Động cơ / Chân robot */}
          <ellipse cx="94" cy="176" rx="10" ry="6" fill="#1e40af" stroke="#1e3a8a" strokeWidth="1" />
          <ellipse cx="126" cy="176" rx="10" ry="6" fill="#1e40af" stroke="#1e3a8a" strokeWidth="1" />

          {/* Cánh tay trái ôm bưu kiện vàng hoàng kim */}
          <g className={`anim-parcel-${uid}`}>
            <path d="M 80 116 Q 62 125 54 138" stroke="#cbd5e1" strokeWidth="9" strokeLinecap="round" />
            <circle cx="50" cy="144" r="7.5" fill="#e11d48" stroke="#9f1239" strokeWidth="0.8" />
            <g transform="translate(18, 126)">
              <rect x="0" y="0" width="42" height="34" rx="5" fill={`url(#parcelGold_${uid})`} stroke="#b45309" strokeWidth="1.6" />
              <line x1="0" y1="9" x2="42" y2="9" stroke="#92400e" strokeWidth="1.4" />
              <rect x="18" y="0" width="7" height="34" fill="#e11d48" />
              <circle cx="21.5" cy="0" r="3.5" fill="#e11d48" />
              <path d="M 18 -1 Q 12 -7 21.5 -2 Q 31 -7 25 -1 Z" fill="#f43f5e" />
              <circle cx="34" cy="24" r="8.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.4" />
              <path d="M 31 24 L 33 26.5 L 37 21.5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>

          {/* Cánh tay phải vươn lên giơ ngón cái Like / Victory */}
          <g className={`anim-arm-${uid}`}>
            <path d="M 140 118 Q 158 112 166 96" stroke="#cbd5e1" strokeWidth="9" strokeLinecap="round" />
            <g transform="translate(168, 92)">
              <circle cx="0" cy="0" r="8" fill="#e11d48" stroke="#9f1239" strokeWidth="1" />
              <rect x="-3" y="-10" width="6" height="9" rx="3" fill="#f43f5e" stroke="#9f1239" strokeWidth="0.8" />
            </g>
            <path d="M 174 80 L 176 83 L 179 84 L 176 85 L 174 88 L 172 85 L 169 84 L 172 83 Z" fill="#fbbf24" />
          </g>

          {/* Đầu Robot ngọc trai 3D tròn trịa */}
          <rect x="54" y="36" width="112" height="80" rx="38" fill={`url(#pearl_${uid})`} stroke="#cbd5e1" strokeWidth="2.2" filter={`url(#drop3D_${uid})`} />

          {/* Màn hình Visor OLED sâu thẳm */}
          <rect x="64" y="47" width="92" height="58" rx="26" fill={`url(#visor_${uid})`} stroke="#38bdf8" strokeWidth="1.6" />
          <path d="M 73 55 Q 110 49 147 55 Q 138 62 110 59 Q 82 62 73 55 Z" fill={`url(#gloss_${uid})`} />

          {/* Đôi mắt cười tít Cyber Cyan hạnh phúc (^_^) */}
          <g filter={`url(#eyeGlow_${uid})`}>
            <path d="M 76 77 Q 86 65 96 77" stroke="#38bdf8" strokeWidth="4.2" strokeLinecap="round" fill="none" />
            <path d="M 124 77 Q 134 65 144 77" stroke="#38bdf8" strokeWidth="4.2" strokeLinecap="round" fill="none" />
          </g>
          <circle cx="86" cy="69" r="1.5" fill="#ffffff" /><circle cx="134" cy="69" r="1.5" fill="#ffffff" />

          {/* Đôi má hồng & miệng cười đáng yêu */}
          <ellipse cx="75" cy="87" rx="6.5" ry="3.8" fill="#fb7185" fillOpacity="0.9" />
          <ellipse cx="145" cy="87" rx="6.5" ry="3.8" fill="#fb7185" fillOpacity="0.9" />
          <path d="M 106 85 Q 110 89 114 85" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </g>
      </svg>
    </div>
  );
}
