'use client';

import React from 'react';

/**
 * MascotBot — Mascot trợ lý AI thông minh "Shopy Bot"
 * Thiết kế phong cách 3D Cyber / Cute Robot với các chuyển động sống động:
 * - Lơ lửng bồng bềnh (Floating & Breathing)
 * - Mắt led chớp tự nhiên & đổi biểu cảm cười khi hover (Blinking & Happy Visor)
 * - Tay vẫy chào thân thiện (Waving Hand)
 * - Đèn ăng-ten phát sóng nhấp nháy (Pulsing Antenna)
 * - Bóng đổ co giãn theo nhịp bay (Dynamic Shadow)
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
          {/* Gradients */}
          <linearGradient id="botPearl" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          <linearGradient id="botBlueBrand" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          <linearGradient id="botVisor" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="60%" stopColor="#020617" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="botCyanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          <radialGradient id="antennaGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="1" />
            <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>

          {/* Keyframe animations */}
          <style>{`
            @keyframes botFloat {
              0%, 100% {
                transform: translateY(0px) rotate(0deg);
              }
              50% {
                transform: translateY(-9px) rotate(2.5deg);
              }
            }

            @keyframes botWave {
              0%, 100% {
                transform: rotate(0deg);
              }
              15% {
                transform: rotate(-26deg);
              }
              30% {
                transform: rotate(16deg);
              }
              45% {
                transform: rotate(-22deg);
              }
              60% {
                transform: rotate(12deg);
              }
              75% {
                transform: rotate(0deg);
              }
            }

            @keyframes botBlink {
              0%, 90%, 100% {
                transform: scaleY(1);
              }
              95% {
                transform: scaleY(0.12);
              }
            }

            @keyframes botShadow {
              0%, 100% {
                transform: scale(1);
                opacity: 0.35;
              }
              50% {
                transform: scale(0.72);
                opacity: 0.16;
              }
            }

            @keyframes antennaBeacon {
              0%, 100% {
                transform: scale(1);
                opacity: 0.95;
              }
              50% {
                transform: scale(1.4);
                opacity: 0.35;
              }
            }

            .anim-float {
              animation: botFloat 2.3s ease-in-out infinite;
            }

            .anim-wave {
              transform-origin: 125px 95px;
              animation: botWave 2.0s ease-in-out infinite;
            }

            .anim-blink {
              transform-origin: 80px 72px;
              animation: botBlink 2.6s ease-in-out infinite;
            }

            .anim-shadow {
              transform-origin: 80px 172px;
              animation: botShadow 2.3s ease-in-out infinite;
            }

            .anim-beacon {
              transform-origin: 80px 16px;
              animation: antennaBeacon 1.3s ease-in-out infinite;
            }
          `}</style>
        </defs>

        {/* BÓNG ĐỔ DƯỚI ĐẤT CO GIÃN THEO NHỊP BAY */}
        <ellipse
          cx="80"
          cy="172"
          rx="38"
          ry="7"
          fill="url(#shadowGrad)"
          className="anim-shadow"
        />

        {/* KHỐI THÂN VÀ ĐẦU MASCOT BAY LƠ LỬNG */}
        <g className="anim-float">
          {/* Ăng-ten phát tín hiệu trên đầu */}
          <line
            x1="80"
            y1="34"
            x2="80"
            y2="18"
            stroke="#94a3b8"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Vòng hào quang phát sáng ăng-ten */}
          <circle
            cx="80"
            cy="16"
            r="12"
            fill="url(#antennaGlow)"
            className="anim-beacon"
          />
          {/* Quả cầu đỉnh ăng-ten */}
          <circle
            cx="80"
            cy="16"
            r="6.5"
            fill="#38bdf8"
            stroke="#ffffff"
            strokeWidth="1.5"
          />

          {/* TAI NGHE / LOA 2 BÊN (HEADPHONES) */}
          {/* Tai trái */}
          <rect
            x="20"
            y="54"
            width="12"
            height="34"
            rx="6"
            fill="#1e293b"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />
          <circle cx="26" cy="71" r="3.5" fill="#38bdf8" />

          {/* Tai phải */}
          <rect
            x="128"
            y="54"
            width="12"
            height="34"
            rx="6"
            fill="#1e293b"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />
          <circle cx="134" cy="71" r="3.5" fill="#38bdf8" />

          {/* KHUNG ĐẦU MASCOT (BO TRÒN CUTE NGỌC TRAI) */}
          <rect
            x="28"
            y="32"
            width="104"
            height="80"
            rx="36"
            fill="url(#botPearl)"
            stroke="#cbd5e1"
            strokeWidth="2"
            className="filter drop-shadow-sm"
          />

          {/* MÀN HÌNH KÍNH VISOR MẶT ROBOT */}
          <rect
            x="38"
            y="44"
            width="84"
            height="56"
            rx="24"
            fill="url(#botVisor)"
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* ĐÈN PHẢN CHIẾU ÁNH SÁNG KÍNH */}
          <path
            d="M 48 50 Q 80 47 112 50"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.35"
          />

          {/* ĐÔI MẮT LED CYAN NỔI BẬT (CHỚP MẮT & BIỂU CẢM) */}
          <g className="anim-blink">
            {/* Mắt trái */}
            <ellipse
              cx="63"
              cy="70"
              rx="7.5"
              ry="10.5"
              fill="url(#botCyanGlow)"
              className="group-hover:hidden"
            />
            <circle cx="65.5" cy="67" r="2.5" fill="#ffffff" className="group-hover:hidden" />

            {/* Mắt phải */}
            <ellipse
              cx="97"
              cy="70"
              rx="7.5"
              ry="10.5"
              fill="url(#botCyanGlow)"
              className="group-hover:hidden"
            />
            <circle cx="99.5" cy="67" r="2.5" fill="#ffffff" className="group-hover:hidden" />

            {/* Mắt cười hình cung khi hover (Happy smile eye) */}
            <path
              d="M 55 72 Q 63 60 71 72"
              stroke="#38bdf8"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              className="hidden group-hover:block"
            />
            <path
              d="M 89 72 Q 97 60 105 72"
              stroke="#38bdf8"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              className="hidden group-hover:block"
            />
          </g>

          {/* Má hồng công nghệ hai bên */}
          <ellipse cx="49" cy="80" rx="4.5" ry="2.5" fill="#f43f5e" opacity="0.35" />
          <ellipse cx="111" cy="80" rx="4.5" ry="2.5" fill="#f43f5e" opacity="0.35" />

          {/* THÂN ROBOT NHỎ XINH BÊN DƯỚI */}
          <path
            d="M 52 110 L 46 142 Q 80 156 114 142 L 108 110 Z"
            fill="url(#botPearl)"
            stroke="#cbd5e1"
            strokeWidth="2"
          />

          {/* TRÁI TIM / HUY HIỆU SHOP TRÊN NGỰC */}
          <rect
            x="68"
            y="120"
            width="24"
            height="18"
            rx="6"
            fill="url(#botBlueBrand)"
            stroke="#ffffff"
            strokeWidth="1.2"
          />
          {/* Logo SHOP tia chớp nhỏ */}
          <path
            d="M 81 123 L 77 129 L 80 129 L 79 135 L 84 128 L 81 128 Z"
            fill="#ffffff"
          />

          {/* TAY TRÁI (THẢ TỰ NHIÊN) */}
          <path
            d="M 44 116 Q 30 128 35 140 Q 40 144 46 136 Q 48 126 48 116 Z"
            fill="url(#botPearl)"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />

          {/* TAY PHẢI VẪY CHÀO THÂN THIỆN (WAVING HAND) */}
          <g className={isWaving ? 'anim-wave' : ''}>
            <path
              d="M 112 116 Q 132 108 136 94 Q 142 88 138 82 Q 130 84 126 94 Q 118 106 112 116 Z"
              fill="url(#botPearl)"
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />
            {/* Lòng bàn tay vẫy chào */}
            <circle cx="137" cy="88" r="6" fill="#38bdf8" opacity="0.85" />
          </g>
        </g>
      </svg>
    </div>
  );
}
