'use client';

import React from 'react';

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * MascotCartEmpty — Studio-grade Animated 3D Vector Mascot Artwork for Empty Cart
 * "Anty Shopy & Empty Cyber Cart" — Chú robot Anty Shopy tò mò ngó vào giỏ hàng
 * công nghệ phát sáng hologram, hiệu ứng hạt photon bay bổng & biểu cảm siêu cute
 * ══════════════════════════════════════════════════════════════════════════════
 */
export default function MascotCartEmpty({ size = 320, className = '' }) {
  return (
    <div className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 460 340"
        width={size}
        height={(size * 340) / 460}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto overflow-visible drop-shadow-xs"
      >
        <defs>
          {/* ─── 1. Gradients & Lighting Shaders ─── */}
          <radialGradient id="cartPortalAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e0e7ff" stopOpacity="0.8" />
            <stop offset="45%" stopColor="#ede9fe" stopOpacity="0.4" />
            <stop offset="80%" stopColor="#f8fafc" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Vỏ robot ngọc trai 3D trắng tuyết */}
          <linearGradient id="robotPearlWhiteCE" x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#f8fafc" />
            <stop offset="85%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Màn hình Visor OLED sâu thẳm */}
          <linearGradient id="visorGlassCE" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="70%" stopColor="#020617" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>

          {/* Đỏ thương hiệu Haravan/Shop */}
          <linearGradient id="brandRedCE" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="50%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#9f1239" />
          </linearGradient>

          {/* Xanh Navy chủ đạo */}
          <linearGradient id="brandBlueCE" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>

          {/* Giỏ hàng kim loại Chrome cao cấp */}
          <linearGradient id="cartChromeMesh" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="30%" stopColor="#cbd5e1" />
            <stop offset="70%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>

          {/* Viền Neon Hologram xanh Cyan phát sáng trong giỏ */}
          <linearGradient id="holoGlowCyan" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
          </linearGradient>

          {/* Phủ bóng gương trắng */}
          <linearGradient id="glossGlassHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Vàng ánh kim ngôi sao */}
          <linearGradient id="starGoldSparkle" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>

          {/* ─── 2. Filters & Drop Shadows ─── */}
          <filter id="softCyanGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="shadowUnderCart" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>

          {/* ─── 3. CSS Keyframe Animations ─── */}
          <style>{`
            @keyframes robotFloatSlow {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-7px) rotate(-1.5deg); }
            }
            @keyframes blinkEyeLookAround {
              0%, 45%, 55%, 100% { transform: scaleY(1); }
              50% { transform: scaleY(0.1); }
            }
            @keyframes cartPulseRing {
              0%, 100% { opacity: 0.4; transform: scale(0.98); }
              50% { opacity: 0.85; transform: scale(1.02); }
            }
            @keyframes starTwinkle {
              0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
              50% { opacity: 1; transform: scale(1.2) rotate(45deg); }
            }
            @keyframes scanLineHolo {
              0% { transform: translateY(-10px); opacity: 0; }
              50% { opacity: 0.7; }
              100% { transform: translateY(35px); opacity: 0; }
            }
            .anim-robot-float { animation: robotFloatSlow 4s ease-in-out infinite; transform-origin: 190px 180px; }
            .anim-eye-blink { animation: blinkEyeLookAround 4.5s ease-in-out infinite; transform-origin: center; }
            .anim-cart-pulse { animation: cartPulseRing 3s ease-in-out infinite; transform-origin: 300px 220px; }
            .anim-star-1 { animation: starTwinkle 2.5s ease-in-out infinite; transform-origin: 310px 130px; }
            .anim-star-2 { animation: starTwinkle 3.2s ease-in-out infinite 0.8s; transform-origin: 380px 180px; }
            .anim-star-3 { animation: starTwinkle 2.8s ease-in-out infinite 1.4s; transform-origin: 110px 130px; }
            .anim-scan-beam { animation: scanLineHolo 2.4s ease-in-out infinite; }
          `}</style>
        </defs>

        {/* ─── HÀO QUANG & BÓNG ĐỔ DƯỚI NỀN ─── */}
        <ellipse cx="230" cy="275" rx="190" ry="42" fill="url(#cartPortalAura)" />
        <ellipse cx="185" cy="285" rx="65" ry="12" fill="#0f172a" fillOpacity="0.12" filter="url(#shadowUnderCart)" />
        <ellipse cx="320" cy="285" rx="75" ry="14" fill="#0f172a" fillOpacity="0.14" filter="url(#shadowUnderCart)" />

        {/* ─── CÁC HẠT PHÁT SÁNG & NGÔI SAO TRÔI BỒNG BỀNH ─── */}
        <g className="anim-star-1">
          <path d="M310 120 L313 128 L321 130 L313 132 L310 140 L307 132 L299 130 L307 128 Z" fill="url(#starGoldSparkle)" />
        </g>
        <g className="anim-star-2">
          <path d="M380 172 L382 178 L388 180 L382 182 L380 188 L378 182 L372 180 L378 178 Z" fill="url(#starGoldSparkle)" />
        </g>
        <g className="anim-star-3">
          <path d="M110 122 L112 128 L118 130 L112 132 L110 138 L108 132 L102 130 L108 128 Z" fill="#38bdf8" />
        </g>

        {/* ─── GIỎ HÀNG CÔNG NGHỆ 3D (CYBER SHOPPING CART) ─── */}
        <g className="anim-cart-pulse">
          {/* Vùng tia sáng hologram rỗng bên trong giỏ */}
          <path
            d="M265 195 L375 195 L355 245 L280 245 Z"
            fill="url(#holoGlowCyan)"
            filter="url(#softCyanGlow)"
          />

          {/* Tia quét Hologram Scanline */}
          <line
            x1="270"
            y1="205"
            x2="370"
            y2="205"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeDasharray="4 2"
            className="anim-scan-beam"
          />

          {/* Dấu chấm hỏi '?' Hologram 3D phát sáng trong giỏ */}
          <g transform="translate(315, 205)">
            <circle cx="5" cy="5" r="18" fill="#e0f2fe" fillOpacity="0.4" filter="url(#softCyanGlow)" />
            <text
              x="5"
              y="12"
              textAnchor="middle"
              fill="#0284c7"
              fontSize="20"
              fontWeight="900"
              fontFamily="sans-serif"
              opacity="0.85"
            >
              ?
            </text>
          </g>

          {/* Khung chính Giỏ Hàng Kim Loại (3D Wireframe Basket) */}
          {/* Tay cầm giỏ hàng */}
          <path
            d="M235 155 L255 168 L265 195"
            stroke="url(#cartChromeMesh)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M233 154 L248 163"
            stroke="url(#brandRedCE)"
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Vành trên giỏ hàng */}
          <rect
            x="260"
            y="190"
            width="122"
            height="8"
            rx="4"
            fill="url(#cartChromeMesh)"
            stroke="#64748b"
            strokeWidth="0.8"
          />

          {/* Khung thân giỏ */}
          <path
            d="M265 198 L280 250 Q282 254 286 254 L350 254 Q354 254 356 250 L376 198"
            fill="none"
            stroke="url(#cartChromeMesh)"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />

          {/* Lưới thép đan ngang / dọc của giỏ hàng */}
          <path d="M269 212 L372 212" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M274 226 L365 226" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M278 240 L358 240" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" />

          <path d="M292 198 L296 250" stroke="#94a3b8" strokeWidth="2" />
          <path d="M312 198 L314 250" stroke="#94a3b8" strokeWidth="2" />
          <path d="M332 198 L332 250" stroke="#94a3b8" strokeWidth="2" />
          <path d="M352 198 L348 250" stroke="#94a3b8" strokeWidth="2" />

          {/* Khung gầm & Bánh xe giỏ hàng */}
          <path
            d="M280 254 L276 270 L356 270 L352 254"
            stroke="url(#cartChromeMesh)"
            strokeWidth="4"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Bánh xe trái */}
          <g transform="translate(276, 274)">
            <circle cx="0" cy="0" r="8" fill="#1e293b" />
            <circle cx="0" cy="0" r="5" fill="url(#cartChromeMesh)" />
            <circle cx="0" cy="0" r="2" fill="#ffffff" />
          </g>

          {/* Bánh xe phải */}
          <g transform="translate(356, 274)">
            <circle cx="0" cy="0" r="8" fill="#1e293b" />
            <circle cx="0" cy="0" r="5" fill="url(#cartChromeMesh)" />
            <circle cx="0" cy="0" r="2" fill="#ffffff" />
          </g>
        </g>

        {/* ─── ROBOT "ANTY SHOPY" ĐANG NGÓ VÀO GIỎ HÀNG ─── */}
        <g className="anim-robot-float">
          {/* 1. Đôi tai / Ăng-ten cảm biến phát sóng */}
          {/* Tai trái */}
          <g transform="translate(112, 136) rotate(-22)">
            <rect x="-6" y="-18" width="12" height="22" rx="6" fill="url(#brandBlueCE)" />
            <circle cx="0" cy="-18" r="5" fill="url(#brandRedCE)" />
            <circle cx="0" cy="-18" r="2" fill="#ffffff" />
          </g>

          {/* Tai phải */}
          <g transform="translate(210, 130) rotate(18)">
            <rect x="-6" y="-18" width="12" height="22" rx="6" fill="url(#brandBlueCE)" />
            <circle cx="0" cy="-18" r="5" fill="url(#brandRedCE)" />
            <circle cx="0" cy="-18" r="2" fill="#ffffff" />
          </g>

          {/* 2. Thân robot (Body) */}
          <path
            d="M135 195 C135 185 145 178 160 178 L168 178 C183 178 193 185 193 195 L196 238 C196 250 185 258 164 258 C143 258 132 250 132 238 Z"
            fill="url(#robotPearlWhiteCE)"
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />

          {/* Áo yếm / Huy hiệu công nghệ ở bụng */}
          <rect x="146" y="194" width="36" height="42" rx="8" fill="url(#brandBlueCE)" />
          <circle cx="164" cy="215" r="10" fill="#ffffff" />
          {/* Icon túi đồ nhỏ trên ngực robot */}
          <path
            d="M160 212 L159 220 C159 221 160 222 161 222 L167 222 C168 222 169 221 169 220 L168 212 Z"
            fill="url(#brandRedCE)"
          />
          <path d="M161 212 C161 210 162 208 164 208 C166 208 167 210 167 212" stroke="url(#brandRedCE)" strokeWidth="1.2" fill="none" />

          {/* Chân robot */}
          <ellipse cx="147" cy="260" rx="11" ry="8" fill="url(#brandBlueCE)" />
          <ellipse cx="181" cy="260" rx="11" ry="8" fill="url(#brandBlueCE)" />

          {/* 3. Đầu Robot Tròn Chibi (Head) */}
          <g transform="translate(160, 140)">
            <ellipse cx="0" cy="0" rx="48" ry="42" fill="url(#robotPearlWhiteCE)" stroke="#cbd5e1" strokeWidth="1.2" />

            {/* Màn hình Kính Visor OLED Đen Bóng */}
            <ellipse cx="4" cy="2" rx="38" ry="28" fill="url(#visorGlassCE)" />

            {/* Vệt phản quang gương (Gloss Highlight) */}
            <path
              d="M-28 -14 Q4 -24 34 -10 Q28 -20 -8 -22 Q-22 -22 -28 -14 Z"
              fill="url(#glossGlassHighlight)"
            />

            {/* Đôi Mắt OLED Cyber Xanh Ngọc Chớp Nháy Biểu Cảm */}
            <g className="anim-eye-blink">
              {/* Mắt trái */}
              <ellipse cx="-10" cy="3" rx="7.5" ry="9.5" fill="#38bdf8" filter="url(#softCyanGlow)" />
              <circle cx="-12" cy="0" r="3" fill="#ffffff" />

              {/* Mắt phải (Ngắm nghiêng tò mò sang giỏ hàng) */}
              <ellipse cx="18" cy="3" rx="8" ry="10" fill="#38bdf8" filter="url(#softCyanGlow)" />
              <circle cx="16" cy="0" r="3" fill="#ffffff" />

              {/* Má hồng e thẹn cute */}
              <ellipse cx="-22" cy="14" rx="5" ry="3" fill="#fb7185" fillOpacity="0.7" />
              <ellipse cx="28" cy="14" rx="5" ry="3" fill="#fb7185" fillOpacity="0.7" />
            </g>
          </g>

          {/* 4. Cánh tay robot */}
          {/* Tay trái đang vẫy nhẹ */}
          <g transform="translate(132, 192) rotate(25)">
            <path d="M0 0 L-14 16 Q-18 22 -12 26 Q-6 30 0 22 L10 6 Z" fill="url(#robotPearlWhiteCE)" stroke="#cbd5e1" strokeWidth="1" />
            <circle cx="-13" cy="23" r="6" fill="url(#brandRedCE)" />
          </g>

          {/* Tay phải đang chỉ vào giỏ hàng trống */}
          <g transform="translate(192, 196) rotate(-35)">
            <path d="M0 0 L22 12 Q28 15 26 22 Q24 28 16 26 L2 10 Z" fill="url(#robotPearlWhiteCE)" stroke="#cbd5e1" strokeWidth="1" />
            <circle cx="23" cy="20" r="6" fill="url(#brandRedCE)" />
          </g>
        </g>
      </svg>
    </div>
  );
}
