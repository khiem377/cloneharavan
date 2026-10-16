'use client';

import React, { useId } from 'react';

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * MascotBot — Studio-grade Animated 3D Mascot "Anty Shopy"
 * Đồng bộ 100% nhận diện thương hiệu, màu sắc và phong cách với bộ Mascot:
 * (MascotFlashSale, MascotCartEmpty, MascotNotFound)
 *
 * Màu sắc chuẩn:
 * - Visor OLED đen bóng sâu thẳm (#0f172a / #020617) kèm viền Cyan (#38bdf8)
 * - Mắt LED Cyber Cyan phát sáng (#38bdf8) kèm điểm phản quang trắng (#ffffff)
 * - Áo yếm đỏ thương hiệu SHOP (#e11d48 / #be123c) kèm huy hiệu ngực tia chớp
 * - Tai nghe công nghệ xanh Navy & đỏ (#2563eb, #e11d48)
 * - Găng tay đỏ (#e11d48) vẫy chào sống động
 * - Vỏ đầu mũ bảo hộ trắng ngọc trai 3D (#ffffff, #f8fafc) viền sắc nét (#cbd5e1)
 * ══════════════════════════════════════════════════════════════════════════════
 */
export default function MascotBot({
  size = 64,
  className = '',
  isHovered = false,
  isWaving = true,
  onClick,
}) {
  const rawId = useId();
  const uid = rawId ? rawId.replace(/[^a-zA-Z0-9_-]/g, '_') : 'mbot';

  const width = typeof size === 'number' ? size : size;
  const height = typeof size === 'number' ? size * 1.15 : '100%';

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-col items-center justify-center select-none group cursor-pointer ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size * 1.15}px` : '100%',
      }}
    >
      <svg
        viewBox="0 0 160 184"
        width={width}
        height={height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible transition-transform duration-300 group-hover:scale-105 drop-shadow-xs"
      >
        <defs>
          {/* Hào quang nền chống chìm trên nền trắng */}
          <radialGradient id={`aura_${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ede9fe" stopOpacity="0.35" />
            <stop offset="85%" stopColor="#f8fafc" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Vỏ ngọc trai 3D trắng tuyết cao cấp */}
          <linearGradient id={`pearl_${uid}`} x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#f8fafc" />
            <stop offset="85%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Màn hình Kính Visor OLED Sâu Thẳm */}
          <linearGradient id={`visor_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="35%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Đỏ Thương Hiệu SHOP (Brand Red Coat) */}
          <linearGradient id={`redCoat_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="50%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#9f1239" />
          </linearGradient>

          {/* Xanh Navy Công Nghệ (Brand Blue) */}
          <linearGradient id={`blueTech_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>

          {/* Mắt LED Cyber Cyan phát sáng */}
          <linearGradient id={`cyanEye_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="60%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* Hào quang Ăng-ten phát sóng */}
          <radialGradient id={`beacon_${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
          </radialGradient>

          {/* Bóng đổ co giãn dưới đất */}
          <radialGradient id={`floorShadow_${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>

          {/* Vệt phản quang gương trên kính */}
          <linearGradient id={`gloss_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Filters hiệu ứng mắt sáng */}
          <filter id={`eyeGlow_${uid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id={`dropShadow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.12" />
          </filter>

          {/* CSS Keyframe Animations */}
          <style>{`
            @keyframes botFloat_${uid} {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-7px) rotate(1.5deg); }
            }
            @keyframes botWave_${uid} {
              0%, 100% { transform: rotate(0deg); }
              20% { transform: rotate(-24deg); }
              40% { transform: rotate(14deg); }
              60% { transform: rotate(-20deg); }
              80% { transform: rotate(8deg); }
            }
            @keyframes botBlink_${uid} {
              0%, 45%, 55%, 100% { transform: scaleY(1); }
              50% { transform: scaleY(0.12); }
            }
            @keyframes botShadow_${uid} {
              0%, 100% { transform: scale(1); opacity: 0.32; }
              50% { transform: scale(0.75); opacity: 0.16; }
            }
            @keyframes beaconPulse_${uid} {
              0%, 100% { transform: scale(1); opacity: 0.95; }
              50% { transform: scale(1.3); opacity: 0.4; }
            }

            .anim-float-${uid} { animation: botFloat_${uid} 3s ease-in-out infinite; }
            .anim-wave-${uid} { transform-origin: 122px 82px; animation: botWave_${uid} 2.2s ease-in-out infinite; }
            .anim-blink-${uid} { transform-origin: 80px 60px; animation: botBlink_${uid} 4s ease-in-out infinite; }
            .anim-shadow-${uid} { transform-origin: 80px 170px; animation: botShadow_${uid} 3s ease-in-out infinite; }
            .anim-beacon-${uid} { transform-origin: 80px 14px; animation: beaconPulse_${uid} 1.8s ease-in-out infinite; }
          `}</style>
        </defs>

        {/* HÀO QUANG NỀN */}
        <ellipse cx="80" cy="88" rx="66" ry="66" fill={`url(#aura_${uid})`} />

        {/* BÓNG ĐỔ DƯỚI ĐẤT */}
        <ellipse
          cx="80"
          cy="170"
          rx="36"
          ry="7"
          fill={`url(#floorShadow_${uid})`}
          className={`anim-shadow-${uid}`}
        />

        {/* KHỐI ROBOT ANTY SHOPY BAY LƠ LỬNG */}
        <g className={`anim-float-${uid}`}>
          {/* 1. Ăng-ten phát sóng */}
          <line
            x1="80"
            y1="28"
            x2="80"
            y2="14"
            stroke="#94a3b8"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <circle
            cx="80"
            cy="14"
            r="11"
            fill={`url(#beacon_${uid})`}
            className={`anim-beacon-${uid}`}
          />
          <circle
            cx="80"
            cy="14"
            r="5.5"
            fill="#38bdf8"
            stroke="#ffffff"
            strokeWidth="1.5"
          />

          {/* 2. Tai nghe công nghệ xanh Navy + đèn đỏ thương hiệu 2 bên */}
          {/* Tai nghe bên trái */}
          <g transform="translate(28, 62) rotate(-8)">
            <rect
              x="-6"
              y="-16"
              width="12"
              height="32"
              rx="6"
              fill="#2563eb"
              stroke="#1e40af"
              strokeWidth="1.2"
            />
            <circle cx="0" cy="0" r="4.5" fill="#e11d48" />
            <circle cx="0" cy="0" r="1.8" fill="#ffffff" />
          </g>

          {/* Tai nghe bên phải */}
          <g transform="translate(132, 62) rotate(8)">
            <rect
              x="-6"
              y="-16"
              width="12"
              height="32"
              rx="6"
              fill="#2563eb"
              stroke="#1e40af"
              strokeWidth="1.2"
            />
            <circle cx="0" cy="0" r="4.5" fill="#e11d48" />
            <circle cx="0" cy="0" r="1.8" fill="#ffffff" />
          </g>

          {/* 3. Thân robot + Áo yếm đỏ thương hiệu Anty Shopy */}
          {/* Vỏ thân ngọc trai */}
          <path
            d="M 52 94 C 52 94 48 136 48 144 C 48 152 62 156 80 156 C 98 156 112 152 112 144 C 112 136 108 94 108 94 Z"
            fill={`url(#pearl_${uid})`}
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />

          {/* Áo yếm đỏ SHOP ở bụng */}
          <path
            d="M 58 98 L 102 98 L 98 138 C 98 144 90 148 80 148 C 70 148 62 144 62 138 Z"
            fill={`url(#redCoat_${uid})`}
            stroke="#9f1239"
            strokeWidth="1.2"
          />

          {/* Huy hiệu ngực trắng + Logo SHOP */}
          <circle cx="80" cy="118" r="10" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
          {/* Logo tia chớp SHOP màu đỏ */}
          <path
            d="M 81 112 L 76 119 L 80 119 L 79 125 L 85 118 L 81 118 Z"
            fill="#e11d48"
          />

          {/* Đôi chân / Động cơ phản lực xanh Navy bên dưới */}
          <ellipse cx="64" cy="153" rx="10" ry="6.5" fill="#1e40af" stroke="#1e3a8a" strokeWidth="1" />
          <ellipse cx="96" cy="153" rx="10" ry="6.5" fill="#1e40af" stroke="#1e3a8a" strokeWidth="1" />

          {/* 4. Cánh tay robot */}
          {/* Tay trái */}
          <g transform="translate(48, 100)">
            <path
              d="M 0 0 L -12 16 Q -16 22 -10 26 Q -4 30 2 22 L 8 4 Z"
              fill={`url(#pearl_${uid})`}
              stroke="#cbd5e1"
              strokeWidth="1.2"
            />
            <circle cx="-11" cy="23" r="6.5" fill="#e11d48" stroke="#9f1239" strokeWidth="0.8" />
          </g>

          {/* Tay phải vẫy chào */}
          <g className={isWaving ? `anim-wave-${uid}` : ''}>
            <path
              d="M 108 102 Q 124 94 130 78 Q 136 70 130 64 Q 122 66 118 78 Q 112 92 108 102 Z"
              fill={`url(#pearl_${uid})`}
              stroke="#cbd5e1"
              strokeWidth="1.2"
            />
            <circle cx="130" cy="70" r="7" fill="#e11d48" stroke="#9f1239" strokeWidth="0.8" />
          </g>

          {/* 5. Đầu robot tròn Chibi ngọc trai viền sắc nét */}
          <rect
            x="28"
            y="24"
            width="104"
            height="76"
            rx="36"
            fill={`url(#pearl_${uid})`}
            stroke="#cbd5e1"
            strokeWidth="2"
            filter={`url(#dropShadow_${uid})`}
          />

          {/* Màn hình Kính Visor OLED Đen Bóng Chống Chìm */}
          <rect
            x="37"
            y="34"
            width="86"
            height="56"
            rx="25"
            fill={`url(#visor_${uid})`}
            stroke="#38bdf8"
            strokeWidth="1.5"
          />

          {/* Vệt phản quang gương (Gloss Highlight) */}
          <path
            d="M 46 42 Q 80 36 114 42 Q 106 48 80 45 Q 54 48 46 42 Z"
            fill={`url(#gloss_${uid})`}
          />

          {/* Đôi Mắt Cyber Cyan Chớp Mắt & Đổi Mặt Cười Khi Hover */}
          <g className={`anim-blink-${uid}`}>
            {/* Mắt trái */}
            <ellipse
              cx="62"
              cy="62"
              rx="7.5"
              ry="10.5"
              fill={`url(#cyanEye_${uid})`}
              filter={`url(#eyeGlow_${uid})`}
              className="group-hover:hidden"
            />
            <circle cx="64.5" cy="59" r="2.5" fill="#ffffff" className="group-hover:hidden" />

            {/* Mắt phải */}
            <ellipse
              cx="98"
              cy="62"
              rx="7.5"
              ry="10.5"
              fill={`url(#cyanEye_${uid})`}
              filter={`url(#eyeGlow_${uid})`}
              className="group-hover:hidden"
            />
            <circle cx="100.5" cy="59" r="2.5" fill="#ffffff" className="group-hover:hidden" />

            {/* Mắt cười hình cung hạnh phúc khi hover */}
            <path
              d="M 54 64 Q 62 52 70 64"
              stroke="#38bdf8"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              className="hidden group-hover:block"
            />
            <path
              d="M 90 64 Q 98 52 106 64"
              stroke="#38bdf8"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              className="hidden group-hover:block"
            />
          </g>

          {/* Đôi má hồng e thẹn công nghệ siêu cute */}
          <ellipse cx="48" cy="73" rx="5.5" ry="3" fill="#fb7185" fillOpacity="0.85" />
          <ellipse cx="112" cy="73" rx="5.5" ry="3" fill="#fb7185" fillOpacity="0.85" />
        </g>
      </svg>
    </div>
  );
}
