'use client';

import React from 'react';

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * MascotBot — Studio-grade Animated 3D Mascot "Anty Shopy"
 * Đồng bộ 100% phong cách thiết kế và bảng màu thương hiệu với bộ Mascot:
 * (MascotFlashSale, MascotCartEmpty, MascotNotFound)
 * 
 * Đặc điểm:
 * - Vỏ ngọc trai 3D trắng tuyết viền sắc nét (Robot Pearl White & Slate Outline)
 * - Áo yếm & găng tay đỏ thương hiệu SHOP (Brand Red Coat & Gloves)
 * - Tai nghe & chân đế xanh Navy công nghệ (Brand Blue Headphones & Thrusters)
 * - Màn hình Visor OLED sâu thẳm với mắt Cyber Cyan chớp nháy & cười khi hover
 * - Hào quang nhẹ + bóng đổ co giãn mượt mà theo nhịp bay lơ lửng 60FPS
 * ══════════════════════════════════════════════════════════════════════════════
 */
export default function MascotBot({
  size = 64,
  className = '',
  isHovered = false,
  isWaving = true,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-col items-center justify-center select-none group cursor-pointer ${className}`}
      style={{ width: size, height: size * 1.15 }}
    >
      <svg
        viewBox="0 0 160 184"
        width={size}
        height={size * 1.15}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible transition-transform duration-300 group-hover:scale-105"
      >
        <defs>
          {/* ── 1. Bảng Gradients thương hiệu chuẩn Anty Shopy ── */}
          {/* Hào quang nền chống chìm trên nền trắng */}
          <radialGradient id="botAuraGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#ede9fe" stopOpacity="0.4" />
            <stop offset="80%" stopColor="#f8fafc" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Vỏ ngọc trai 3D trắng tuyết cao cấp */}
          <linearGradient id="robotPearlWhite" x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#f8fafc" />
            <stop offset="85%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Màn hình Kính Visor OLED Sâu Thẳm */}
          <linearGradient id="visorGlassDeep" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="70%" stopColor="#020617" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>

          {/* Đỏ Thương Hiệu SHOP (Brand Red Coat) */}
          <linearGradient id="brandRedCoat" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="50%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#9f1239" />
          </linearGradient>

          {/* Xanh Navy Công Nghệ (Brand Blue) */}
          <linearGradient id="brandBlueTech" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>

          {/* Mắt LED Cyber Cyan phát sáng */}
          <linearGradient id="botCyanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          {/* Hào quang Ăng-ten phát sóng */}
          <radialGradient id="antennaBeaconGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="1" />
            <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
          </radialGradient>

          {/* Bóng đổ co giãn dưới đất */}
          <radialGradient id="floorShadowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>

          {/* Vệt phản quang gương trên kính */}
          <linearGradient id="glossGlassHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* ── 2. Filters hiệu ứng ── */}
          <filter id="softEyeGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="botBodyDropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.16" />
          </filter>

          {/* ── 3. CSS Keyframe Animations ── */}
          <style>{`
            @keyframes botFloatSmooth {
              0%, 100% {
                transform: translateY(0px) rotate(0deg);
              }
              50% {
                transform: translateY(-8px) rotate(1.8deg);
              }
            }

            @keyframes botHandWaveReal {
              0%, 100% {
                transform: rotate(0deg);
              }
              20% {
                transform: rotate(-26deg);
              }
              40% {
                transform: rotate(16deg);
              }
              60% {
                transform: rotate(-22deg);
              }
              80% {
                transform: rotate(10deg);
              }
            }

            @keyframes botBlinkEyes {
              0%, 45%, 55%, 100% {
                transform: scaleY(1);
              }
              50% {
                transform: scaleY(0.12);
              }
            }

            @keyframes botShadowBreath {
              0%, 100% {
                transform: scale(1);
                opacity: 0.32;
              }
              50% {
                transform: scale(0.72);
                opacity: 0.16;
              }
            }

            @keyframes beaconPulseAnim {
              0%, 100% {
                transform: scale(1);
                opacity: 0.95;
              }
              50% {
                transform: scale(1.35);
                opacity: 0.4;
              }
            }

            .anim-bot-float {
              animation: botFloatSmooth 2.8s ease-in-out infinite;
            }

            .anim-bot-wave {
              transform-origin: 122px 82px;
              animation: botHandWaveReal 2.2s ease-in-out infinite;
            }

            .anim-bot-blink {
              transform-origin: 80px 60px;
              animation: botBlinkEyes 3.6s ease-in-out infinite;
            }

            .anim-bot-shadow {
              transform-origin: 80px 170px;
              animation: botShadowBreath 2.8s ease-in-out infinite;
            }

            .anim-bot-beacon {
              transform-origin: 80px 14px;
              animation: beaconPulseAnim 1.6s ease-in-out infinite;
            }
          `}</style>
        </defs>

        {/* ── HÀO QUANG NỀN NHẸ TỰ NHIÊN (TĂNG TƯƠNG PHẢN TUYỆT ĐỐI TRÊN NỀN TRẮNG) ── */}
        <ellipse cx="80" cy="88" rx="66" ry="66" fill="url(#botAuraGlow)" />

        {/* ── BÓNG ĐỔ DƯỚI ĐẤT CO GIÃN THEO NHỊP BAY ── */}
        <ellipse
          cx="80"
          cy="170"
          rx="36"
          ry="7"
          fill="url(#floorShadowGrad)"
          className="anim-bot-shadow"
        />

        {/* ── KHỐI ROBOT LƠ LỬNG BỒNG BỀNH ── */}
        <g className="anim-bot-float">
          {/* 1. Ăng-ten phát tín hiệu trên đỉnh đầu */}
          <line
            x1="80"
            y1="28"
            x2="80"
            y2="14"
            stroke="#94a3b8"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Quầng sáng phát tín hiệu */}
          <circle
            cx="80"
            cy="14"
            r="11"
            fill="url(#antennaBeaconGlow)"
            className="anim-bot-beacon"
          />
          {/* Quả cầu đỉnh ăng-ten */}
          <circle
            cx="80"
            cy="14"
            r="5.5"
            fill="#38bdf8"
            stroke="#ffffff"
            strokeWidth="1.4"
          />

          {/* 2. Đôi tai nghe công nghệ xanh Navy + đèn đỏ thương hiệu 2 bên */}
          {/* Tai nghe bên trái */}
          <g transform="translate(28, 62) rotate(-8)">
            <rect
              x="-6"
              y="-16"
              width="12"
              height="32"
              rx="6"
              fill="url(#brandBlueTech)"
              stroke="#1e40af"
              strokeWidth="1.2"
            />
            <circle cx="0" cy="0" r="4.5" fill="url(#brandRedCoat)" />
            <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
          </g>

          {/* Tai nghe bên phải */}
          <g transform="translate(132, 62) rotate(8)">
            <rect
              x="-6"
              y="-16"
              width="12"
              height="32"
              rx="6"
              fill="url(#brandBlueTech)"
              stroke="#1e40af"
              strokeWidth="1.2"
            />
            <circle cx="0" cy="0" r="4.5" fill="url(#brandRedCoat)" />
            <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
          </g>

          {/* 3. Thân robot (Body) + Áo yếm đỏ thương hiệu Anty Shopy */}
          {/* Vỏ thân ngọc trai */}
          <path
            d="M 52 94 C 52 94 48 136 48 144 C 48 152 62 156 80 156 C 98 156 112 152 112 144 C 112 136 108 94 108 94 Z"
            fill="url(#robotPearlWhite)"
            stroke="#94a3b8"
            strokeWidth="1.5"
          />

          {/* Áo yếm đỏ thương hiệu SHOP ở bụng */}
          <rect
            x="60"
            y="98"
            width="40"
            height="44"
            rx="10"
            fill="url(#brandRedCoat)"
            stroke="#9f1239"
            strokeWidth="1.2"
          />

          {/* Huy hiệu ngực trắng + Logo tia chớp SHOP sắc nét */}
          <circle cx="80" cy="120" r="11" fill="#ffffff" />
          <path
            d="M 81 113 L 76 120 L 80 120 L 79 127 L 85 119 L 81 119 Z"
            fill="url(#brandRedCoat)"
          />

          {/* Đôi chân / Động cơ phản lực xanh Navy bên dưới */}
          <ellipse cx="64" cy="153" rx="10" ry="6.5" fill="url(#brandBlueTech)" />
          <ellipse cx="96" cy="153" rx="10" ry="6.5" fill="url(#brandBlueTech)" />

          {/* 4. Cánh tay robot */}
          {/* Tay trái (thả tự nhiên kèm găng tay đỏ) */}
          <g transform="translate(48, 100)">
            <path
              d="M 0 0 L -12 16 Q -16 22 -10 26 Q -4 30 2 22 L 8 4 Z"
              fill="url(#robotPearlWhite)"
              stroke="#94a3b8"
              strokeWidth="1.2"
            />
            <circle cx="-11" cy="23" r="6.5" fill="url(#brandRedCoat)" />
          </g>

          {/* Tay phải (vẫy chào thân thiện kèm găng tay đỏ) */}
          <g className={isWaving ? 'anim-bot-wave' : ''}>
            <path
              d="M 108 102 Q 124 94 130 78 Q 136 70 130 64 Q 122 66 118 78 Q 112 92 108 102 Z"
              fill="url(#robotPearlWhite)"
              stroke="#94a3b8"
              strokeWidth="1.2"
            />
            {/* Bàn tay găng đỏ vẫy chào */}
            <circle cx="130" cy="70" r="7" fill="url(#brandRedCoat)" />
          </g>

          {/* 5. Đầu robot tròn Chibi ngọc trai viền sắc nét */}
          <rect
            x="28"
            y="24"
            width="104"
            height="76"
            rx="36"
            fill="url(#robotPearlWhite)"
            stroke="#94a3b8"
            strokeWidth="1.6"
            filter="url(#botBodyDropShadow)"
          />

          {/* Màn hình Kính Visor OLED Đen Bóng */}
          <rect
            x="38"
            y="35"
            width="84"
            height="54"
            rx="24"
            fill="url(#visorGlassDeep)"
            stroke="#334155"
            strokeWidth="1.4"
          />

          {/* Vệt phản quang gương (Gloss Highlight) */}
          <path
            d="M 46 43 Q 80 37 114 43 Q 106 50 80 46 Q 54 50 46 43 Z"
            fill="url(#glossGlassHighlight)"
          />

          {/* Đôi Mắt Cyber Cyan Chớp Mắt & Đổi Mặt Cười Khi Hover */}
          <g className="anim-bot-blink">
            {/* Mắt trái */}
            <ellipse
              cx="62"
              cy="62"
              rx="7.5"
              ry="10.5"
              fill="url(#botCyanGlow)"
              filter="url(#softEyeGlow)"
              className="group-hover:hidden"
            />
            <circle cx="64.5" cy="59" r="2.5" fill="#ffffff" className="group-hover:hidden" />

            {/* Mắt phải */}
            <ellipse
              cx="98"
              cy="62"
              rx="7.5"
              ry="10.5"
              fill="url(#botCyanGlow)"
              filter="url(#softEyeGlow)"
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
          <ellipse cx="48" cy="72" rx="5" ry="3" fill="#fb7185" fillOpacity="0.75" />
          <ellipse cx="112" cy="72" rx="5" ry="3" fill="#fb7185" fillOpacity="0.75" />
        </g>
      </svg>
    </div>
  );
}
