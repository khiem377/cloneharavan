import React from 'react';

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * DashboardMiniMascots — Studio-Grade High-Fidelity 3D Vector Mascots
 * ══════════════════════════════════════════════════════════════════════════════
 * Bộ Mascot "Anty Shopy" thiết kế chuẩn Designer cho Dashboard:
 * 1. MascotProductMini     — Quản lý Sản phẩm (Kiện hàng Hologram & Barcode Neon)
 * 2. MascotCustomerMini    — Khách hàng (Headset CSKH, Vẫy tay & Trái tim)
 * 3. MascotBlogMini        — Tin tức & Bài viết (Kính thông thái & Tablet Hologram)
 * 4. MascotMediaMini       — Tài nguyên Media (Máy ảnh Cyber Camera & Flash Studio)
 * 5. MascotCategoryMini    — Danh mục (Stack thư mục phân tầng 3D)
 * 6. MascotBrandMini       — Thương hiệu (Vương miện hoàng gia & Cờ hiệu)
 * 7. MascotCouponMini      — Khuyến mãi (Thẻ voucher giảm giá VIP %)
 * 8. MascotStockAlertMini  — Cảnh báo kho (Radar cảnh báo & Kính lúp soi tồn)
 * ══════════════════════════════════════════════════════════════════════════════
 */

// ── 1. Mascot: TỔNG SẢN PHẨM ─────────────────────────────────────────────────
export function MascotProductMini({ size = 80, className = '' }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible drop-shadow-sm transition-transform duration-300"
      >
        <defs>
          <radialGradient id="pAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="pBody" x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#f8fafc" />
            <stop offset="85%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="pVisor" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="70%" stopColor="#020617" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>
          <linearGradient id="pBox" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="pBoxLid" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="pGoldRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>

        {/* Ambient Glow */}
        <circle cx="100" cy="100" r="70" fill="url(#pAura)" />

        {/* Floor Shadow */}
        <ellipse cx="100" cy="180" rx="55" ry="9" fill="#0f172a" opacity="0.16" />

        {/* Floating Animated Character */}
        <g className="animate-mini-float">
          {/* Ears / Headphone Cushions */}
          <rect x="36" y="52" width="10" height="28" rx="5" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
          <rect x="154" y="52" width="10" height="28" rx="5" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />

          {/* Antenna */}
          <line x1="100" y1="36" x2="100" y2="18" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
          <circle cx="100" cy="14" r="8" fill="#10b981" stroke="#059669" strokeWidth="2" />
          <circle cx="97" cy="11" r="2.5" fill="#ffffff" opacity="0.9" />

          {/* Head Helmet */}
          <rect x="42" y="32" width="116" height="88" rx="38" fill="url(#pBody)" stroke="#94a3b8" strokeWidth="2.5" />

          {/* Visor Glass Screen */}
          <rect x="52" y="42" width="96" height="66" rx="28" fill="url(#pVisor)" stroke="#0f172a" strokeWidth="1.5" />

          {/* Visor Gloss Reflection */}
          <path d="M62 50 C80 44, 120 44, 138 50 C130 55, 70 55, 62 50 Z" fill="#ffffff" opacity="0.2" />

          {/* Glowing Eyes (Happy Emerald) */}
          <g className="animate-mini-blink">
            <ellipse cx="76" cy="72" rx="7" ry="9" fill="#34d399" />
            <ellipse cx="124" cy="72" rx="7" ry="9" fill="#34d399" />
            <circle cx="78" cy="69" r="3" fill="#ffffff" />
            <circle cx="126" cy="69" r="3" fill="#ffffff" />
            <circle cx="73" cy="75" r="1.5" fill="#ffffff" opacity="0.8" />
            <circle cx="121" cy="75" r="1.5" fill="#ffffff" opacity="0.8" />
          </g>

          {/* Cute Rosy Cheeks */}
          <ellipse cx="64" cy="85" rx="6" ry="4" fill="#fb7185" opacity="0.75" />
          <ellipse cx="136" cy="85" rx="6" ry="4" fill="#fb7185" opacity="0.75" />

          {/* Cute Smile */}
          <path d="M92 84 Q100 91 108 84" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Torso Body */}
          <ellipse cx="100" cy="142" rx="42" ry="32" fill="url(#pBody)" stroke="#94a3b8" strokeWidth="2.5" />

          {/* Feet */}
          <ellipse cx="78" cy="172" rx="14" ry="8" fill="url(#pBody)" stroke="#94a3b8" strokeWidth="2" />
          <ellipse cx="122" cy="172" rx="14" ry="8" fill="url(#pBody)" stroke="#94a3b8" strokeWidth="2" />

          {/* 3D Hologram Parcel Box */}
          <g transform="translate(68, 118)">
            {/* Box Body */}
            <rect x="0" y="6" width="64" height="44" rx="8" fill="url(#pBox)" stroke="#065f46" strokeWidth="2" />
            {/* Box Lid */}
            <rect x="-3" y="0" width="70" height="12" rx="4" fill="url(#pBoxLid)" stroke="#065f46" strokeWidth="1.5" />
            {/* Golden Ribbon Bands */}
            <line x1="32" y1="0" x2="32" y2="50" stroke="url(#pGoldRibbon)" strokeWidth="7" strokeLinecap="round" />
            <line x1="0" y1="26" x2="64" y2="26" stroke="url(#pGoldRibbon)" strokeWidth="7" strokeLinecap="round" />
            {/* Ribbon Bow */}
            <circle cx="32" cy="0" r="7" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
            <circle cx="32" cy="0" r="3" fill="#fef08a" />
            {/* Hologram Barcode Tag */}
            <rect x="8" y="16" width="16" height="14" rx="2" fill="#ffffff" opacity="0.9" />
            <line x1="11" y1="19" x2="11" y2="27" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="14" y1="19" x2="14" y2="27" stroke="#0f172a" strokeWidth="1" />
            <line x1="17" y1="19" x2="17" y2="27" stroke="#0f172a" strokeWidth="2" />
            <line x1="21" y1="19" x2="21" y2="27" stroke="#0f172a" strokeWidth="1" />
          </g>

          {/* Hands holding box */}
          <ellipse cx="62" cy="138" rx="9" ry="8" fill="url(#pBody)" stroke="#94a3b8" strokeWidth="2" />
          <ellipse cx="138" cy="138" rx="9" ry="8" fill="url(#pBody)" stroke="#94a3b8" strokeWidth="2" />

          {/* Sparkles */}
          <path d="M162 42 L165 48 L171 51 L165 54 L162 60 L159 54 L153 51 L159 48 Z" fill="#34d399" className="animate-mini-sparkle" />
          <path d="M34 110 L36 114 L40 116 L36 118 L34 122 L32 118 L28 116 L32 114 Z" fill="#fbbf24" className="animate-mini-sparkle" />
        </g>
      </svg>
    </div>
  );
}

// ── 2. Mascot: KHÁCH HÀNG ────────────────────────────────────────────────────
export function MascotCustomerMini({ size = 80, className = '' }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible drop-shadow-sm transition-transform duration-300"
      >
        <defs>
          <radialGradient id="cAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="cBody" x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#f8fafc" />
            <stop offset="85%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="cVisor" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="70%" stopColor="#020617" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>
          <linearGradient id="cHeadset" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>

        <circle cx="100" cy="100" r="70" fill="url(#cAura)" />
        <ellipse cx="100" cy="180" rx="55" ry="9" fill="#0f172a" opacity="0.16" />

        <g className="animate-mini-float">
          {/* Headset Arc Band */}
          <path d="M42 66 C42 22, 158 22, 158 66" stroke="url(#cHeadset)" strokeWidth="6.5" strokeLinecap="round" fill="none" />
          {/* Headset Top Cushion */}
          <path d="M76 27 C84 24, 116 24, 124 27" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.7" />

          {/* Headset Ear Cushions */}
          <rect x="32" y="52" width="14" height="32" rx="7" fill="url(#cHeadset)" stroke="#c2410c" strokeWidth="2" />
          <rect x="154" y="52" width="14" height="32" rx="7" fill="url(#cHeadset)" stroke="#c2410c" strokeWidth="2" />
          <circle cx="39" cy="68" r="4" fill="#fed7aa" />
          <circle cx="161" cy="68" r="4" fill="#fed7aa" />

          {/* Headset Mic Boom */}
          <path d="M154 74 Q138 98, 110 96" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <circle cx="106" cy="96" r="4.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.8" />

          {/* Head Helmet */}
          <rect x="42" y="32" width="116" height="88" rx="38" fill="url(#cBody)" stroke="#94a3b8" strokeWidth="2.5" />

          {/* Visor Glass Screen */}
          <rect x="52" y="42" width="96" height="66" rx="28" fill="url(#cVisor)" stroke="#0f172a" strokeWidth="1.5" />
          <path d="M62 50 C80 44, 120 44, 138 50 C130 55, 70 55, 62 50 Z" fill="#ffffff" opacity="0.2" />

          {/* Cheerful Heart / Arc Eyes */}
          <g className="animate-mini-blink">
            <path d="M68 76 C68 62, 84 62, 84 76" stroke="#38bdf8" strokeWidth="5.5" strokeLinecap="round" fill="none" />
            <path d="M116 76 C116 62, 132 62, 132 76" stroke="#38bdf8" strokeWidth="5.5" strokeLinecap="round" fill="none" />
          </g>

          {/* Rosy Cheeks */}
          <ellipse cx="64" cy="86" rx="7" ry="4.5" fill="#fb7185" opacity="0.85" />
          <ellipse cx="136" cy="86" rx="7" ry="4.5" fill="#fb7185" opacity="0.85" />

          {/* Sweet Smile */}
          <path d="M94 86 Q100 93 106 86" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Torso Body */}
          <ellipse cx="100" cy="142" rx="42" ry="32" fill="url(#cBody)" stroke="#94a3b8" strokeWidth="2.5" />

          {/* Customer Love Heart Badge */}
          <g transform="translate(100, 138) scale(1.1)">
            <path
              d="M0 -6 C-5 -12, -14 -8, -14 0 C-14 8, 0 16, 0 16 C0 16, 14 8, 14 0 C14 -8, 5 -12, 0 -6 Z"
              fill="#f43f5e"
              stroke="#e11d48"
              strokeWidth="1.5"
            />
            <circle cx="-4" cy="-3" r="2" fill="#ffffff" opacity="0.8" />
          </g>

          {/* Feet */}
          <ellipse cx="78" cy="172" rx="14" ry="8" fill="url(#cBody)" stroke="#94a3b8" strokeWidth="2" />
          <ellipse cx="122" cy="172" rx="14" ry="8" fill="url(#cBody)" stroke="#94a3b8" strokeWidth="2" />

          {/* Left Hand on Chest */}
          <ellipse cx="62" cy="144" rx="9" ry="8" fill="url(#cBody)" stroke="#94a3b8" strokeWidth="2" />

          {/* Right Waving Hand with Animation */}
          <g className="animate-mini-wave" style={{ transformOrigin: '138px 140px' }}>
            <path d="M138 140 C154 132, 168 108, 164 92" stroke="#94a3b8" strokeWidth="12" strokeLinecap="round" />
            <circle cx="164" cy="90" r="10" fill="url(#cBody)" stroke="#94a3b8" strokeWidth="2" />
          </g>

          {/* Floating Stars */}
          <path d="M28 42 L30.5 47 L36 49.5 L30.5 52 L28 57 L25.5 52 L20 49.5 L25.5 47 Z" fill="#fbbf24" className="animate-mini-sparkle" />
          <path d="M174 114 L176 118 L180 120 L176 122 L174 126 L172 122 L168 120 L172 118 Z" fill="#f43f5e" className="animate-mini-sparkle" />
        </g>
      </svg>
    </div>
  );
}

// ── 3. Mascot: BÀI VIẾT TIN TỨC ──────────────────────────────────────────────
export function MascotBlogMini({ size = 80, className = '' }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible drop-shadow-sm transition-transform duration-300"
      >
        <defs>
          <radialGradient id="bAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bBody" x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#f8fafc" />
            <stop offset="85%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="bVisor" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="70%" stopColor="#020617" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>
          <linearGradient id="bTablet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
        </defs>

        <circle cx="100" cy="100" r="70" fill="url(#bAura)" />
        <ellipse cx="100" cy="180" rx="55" ry="9" fill="#0f172a" opacity="0.16" />

        <g className="animate-mini-float">
          {/* Ears */}
          <rect x="36" y="52" width="10" height="28" rx="5" fill="#8b5cf6" stroke="#6d28d9" strokeWidth="1.5" />
          <rect x="154" y="52" width="10" height="28" rx="5" fill="#8b5cf6" stroke="#6d28d9" strokeWidth="1.5" />

          {/* Antenna */}
          <line x1="100" y1="36" x2="100" y2="18" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
          <circle cx="100" cy="14" r="8" fill="#a855f7" stroke="#7c3aed" strokeWidth="2" />
          <circle cx="97" cy="11" r="2.5" fill="#ffffff" opacity="0.9" />

          {/* Head */}
          <rect x="42" y="32" width="116" height="88" rx="38" fill="url(#bBody)" stroke="#94a3b8" strokeWidth="2.5" />

          {/* Visor Screen */}
          <rect x="52" y="42" width="96" height="66" rx="28" fill="url(#bVisor)" stroke="#0f172a" strokeWidth="1.5" />
          <path d="M62 50 C80 44, 120 44, 138 50 C130 55, 70 55, 62 50 Z" fill="#ffffff" opacity="0.2" />

          {/* Cyber Round Smart Specs */}
          <circle cx="76" cy="72" r="14" stroke="#c084fc" strokeWidth="3.5" fill="#c084fc" fillOpacity="0.1" />
          <circle cx="124" cy="72" r="14" stroke="#c084fc" strokeWidth="3.5" fill="#c084fc" fillOpacity="0.1" />
          <line x1="90" y1="72" x2="110" y2="72" stroke="#c084fc" strokeWidth="3.5" />

          {/* Eyes behind glasses */}
          <g className="animate-mini-blink">
            <ellipse cx="76" cy="72" rx="5" ry="7" fill="#38bdf8" />
            <ellipse cx="124" cy="72" rx="5" ry="7" fill="#38bdf8" />
            <circle cx="78" cy="70" r="2.5" fill="#ffffff" />
            <circle cx="126" cy="70" r="2.5" fill="#ffffff" />
          </g>

          {/* Cheeks */}
          <ellipse cx="64" cy="86" rx="6" ry="4" fill="#fb7185" opacity="0.7" />
          <ellipse cx="136" cy="86" rx="6" ry="4" fill="#fb7185" opacity="0.7" />

          {/* Torso */}
          <ellipse cx="100" cy="142" rx="42" ry="32" fill="url(#bBody)" stroke="#94a3b8" strokeWidth="2.5" />

          {/* Feet */}
          <ellipse cx="78" cy="172" rx="14" ry="8" fill="url(#bBody)" stroke="#94a3b8" strokeWidth="2" />
          <ellipse cx="122" cy="172" rx="14" ry="8" fill="url(#bBody)" stroke="#94a3b8" strokeWidth="2" />

          {/* Holographic News Tablet / Journal */}
          <g transform="translate(68, 114) rotate(-5)">
            <rect x="0" y="0" width="58" height="46" rx="6" fill="#ffffff" stroke="#c084fc" strokeWidth="2" />
            {/* Header line */}
            <rect x="6" y="8" width="24" height="6" rx="2" fill="#8b5cf6" />
            <rect x="34" y="8" width="18" height="6" rx="2" fill="#e9d5ff" />
            {/* Article content lines */}
            <line x1="6" y1="20" x2="52" y2="20" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" />
            <line x1="6" y1="27" x2="44" y2="27" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            <line x1="6" y1="34" x2="38" y2="34" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            {/* Hologram Bookmark */}
            <path d="M44 0 V14 L49 10 L54 14 V0 Z" fill="#a855f7" />
          </g>

          {/* Cyber Stylus Pen */}
          <g transform="translate(136, 108) rotate(25)">
            <rect x="0" y="0" width="6" height="30" rx="3" fill="#c084fc" stroke="#8b5cf6" strokeWidth="1" />
            <polygon points="0,30 6,30 3,36" fill="#fbbf24" />
            <circle cx="3" cy="38" r="2" fill="#fbbf24" />
          </g>

          {/* Hands */}
          <ellipse cx="62" cy="138" rx="9" ry="8" fill="url(#bBody)" stroke="#94a3b8" strokeWidth="2" />
          <ellipse cx="138" cy="134" rx="9" ry="8" fill="url(#bBody)" stroke="#94a3b8" strokeWidth="2" />

          {/* Knowledge Sparkles */}
          <path d="M164 48 L167 54 L173 57 L167 60 L164 66 L161 60 L155 57 L161 54 Z" fill="#c084fc" className="animate-mini-sparkle" />
          <path d="M30 112 L32 116 L36 118 L32 120 L30 124 L28 120 L24 118 L28 116 Z" fill="#a855f7" className="animate-mini-sparkle" />
        </g>
      </svg>
    </div>
  );
}

// ── 4. Mascot: TÀI NGUYÊN MEDIA ──────────────────────────────────────────────
export function MascotMediaMini({ size = 80, className = '' }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible drop-shadow-sm transition-transform duration-300"
      >
        <defs>
          <radialGradient id="mAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="mBody" x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#f8fafc" />
            <stop offset="85%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="mVisor" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="70%" stopColor="#020617" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>
          <linearGradient id="mCam" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>

        <circle cx="100" cy="100" r="70" fill="url(#mAura)" />
        <ellipse cx="100" cy="180" rx="55" ry="9" fill="#0f172a" opacity="0.16" />

        <g className="animate-mini-float">
          {/* Ears */}
          <rect x="36" y="52" width="10" height="28" rx="5" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
          <rect x="154" y="52" width="10" height="28" rx="5" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />

          {/* Flash Antenna with Bulb */}
          <line x1="100" y1="36" x2="100" y2="18" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
          <circle cx="100" cy="14" r="8" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
          <circle cx="97" cy="11" r="2.5" fill="#ffffff" opacity="0.9" />

          {/* Head */}
          <rect x="42" y="32" width="116" height="88" rx="38" fill="url(#mBody)" stroke="#94a3b8" strokeWidth="2.5" />

          {/* Visor Screen */}
          <rect x="52" y="42" width="96" height="66" rx="28" fill="url(#mVisor)" stroke="#0f172a" strokeWidth="1.5" />
          <path d="M62 50 C80 44, 120 44, 138 50 C130 55, 70 55, 62 50 Z" fill="#ffffff" opacity="0.2" />

          {/* Winking Photography Eyes */}
          <g className="animate-mini-blink">
            {/* Left Eye: Shiny Aperture Focus */}
            <ellipse cx="76" cy="72" rx="7" ry="9" fill="#38bdf8" />
            <circle cx="78" cy="69" r="3" fill="#ffffff" />
            <circle cx="73" cy="75" r="1.5" fill="#ffffff" opacity="0.8" />
            {/* Right Eye: Cute Wink > */}
            <path d="M114 74 L124 66 L134 74" stroke="#38bdf8" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>

          {/* Cheeks */}
          <ellipse cx="64" cy="86" rx="6" ry="4" fill="#fb7185" opacity="0.75" />
          <ellipse cx="136" cy="86" rx="6" ry="4" fill="#fb7185" opacity="0.75" />

          {/* Torso */}
          <ellipse cx="100" cy="142" rx="42" ry="32" fill="url(#mBody)" stroke="#94a3b8" strokeWidth="2.5" />

          {/* Feet */}
          <ellipse cx="78" cy="172" rx="14" ry="8" fill="url(#mBody)" stroke="#94a3b8" strokeWidth="2" />
          <ellipse cx="122" cy="172" rx="14" ry="8" fill="url(#mBody)" stroke="#94a3b8" strokeWidth="2" />

          {/* Cyber Camera Props */}
          <g transform="translate(64, 116)">
            {/* Camera Body */}
            <rect x="0" y="8" width="72" height="46" rx="10" fill="url(#mCam)" stroke="#92400e" strokeWidth="2" />
            {/* Flash unit on top */}
            <rect x="8" y="0" width="18" height="9" rx="3" fill="#ffffff" stroke="#92400e" strokeWidth="1.5" />
            <circle cx="17" cy="4.5" r="2.5" fill="#fbbf24" />
            {/* Shutter Button */}
            <rect x="50" y="2" width="12" height="6" rx="2" fill="#ef4444" stroke="#92400e" strokeWidth="1" />
            {/* Outer Lens Ring */}
            <circle cx="36" cy="31" r="17" fill="#0f172a" stroke="#ffffff" strokeWidth="2.5" />
            {/* Inner Lens Glass */}
            <circle cx="36" cy="31" r="11" fill="#38bdf8" />
            <circle cx="39" cy="28" r="3.5" fill="#ffffff" opacity="0.9" />
            {/* Grip texture */}
            <line x1="58" y1="18" x2="58" y2="44" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
            <line x1="63" y1="18" x2="63" y2="44" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Hands holding camera */}
          <ellipse cx="60" cy="140" rx="9" ry="8" fill="url(#mBody)" stroke="#94a3b8" strokeWidth="2" />
          <ellipse cx="140" cy="140" rx="9" ry="8" fill="url(#mBody)" stroke="#94a3b8" strokeWidth="2" />

          {/* Camera Flash Burst Flare */}
          <path d="M22 36 L26 44 L34 48 L26 52 L22 60 L18 52 L10 48 L18 44 Z" fill="#fbbf24" className="animate-mini-sparkle" />
          <path d="M166 42 L169 48 L175 51 L169 54 L166 60 L163 54 L157 51 L163 48 Z" fill="#f59e0b" className="animate-mini-sparkle" />
        </g>
      </svg>
    </div>
  );
}

// ── 5. Secondary Mini: DANH MỤC SẢN PHẨM ─────────────────────────────────────
export function MascotCategoryMini({ size = 40, className = '' }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
        <defs>
          <linearGradient id="scCatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
        </defs>
        <g className="animate-mini-float">
          {/* Stacked Categories 3D */}
          <rect x="18" y="62" width="64" height="14" rx="4" fill="#042f2e" opacity="0.4" />
          <rect x="14" y="48" width="72" height="15" rx="4" fill="#0d9488" stroke="#115e59" strokeWidth="1" />
          <rect x="10" y="32" width="80" height="17" rx="5" fill="url(#scCatGrad)" stroke="#0f766e" strokeWidth="1.5" />
          
          {/* Folder Tab */}
          <path d="M18 32 L26 22 L46 22 L52 32 Z" fill="#2dd4bf" />

          {/* Anty Peeking Head */}
          <rect x="36" y="8" width="28" height="22" rx="10" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" />
          <rect x="40" y="12" width="20" height="13" rx="6" fill="#0f172a" />
          <circle cx="45" cy="18" r="2.2" fill="#2dd4bf" />
          <circle cx="55" cy="18" r="2.2" fill="#2dd4bf" />

          {/* Category Bullets */}
          <circle cx="22" cy="40" r="3" fill="#fef08a" />
          <line x1="32" y1="40" x2="78" y2="40" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
        </g>
      </svg>
    </div>
  );
}

// ── 6. Secondary Mini: THƯƠNG HIỆU ──────────────────────────────────────────
export function MascotBrandMini({ size = 40, className = '' }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
        <g className="animate-mini-float">
          {/* Anty Head */}
          <rect x="22" y="34" width="56" height="44" rx="19" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
          <rect x="28" y="40" width="44" height="30" rx="13" fill="#0f172a" />
          
          {/* Radiant Cheerful Eyes */}
          <path d="M36 55 C36 47, 46 47, 46 55" stroke="#eab308" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M54 55 C54 47, 64 47, 64 55" stroke="#eab308" strokeWidth="3" strokeLinecap="round" fill="none" />
          <ellipse cx="32" cy="62" rx="3" ry="2" fill="#fb7185" />
          <ellipse cx="68" cy="62" rx="3" ry="2" fill="#fb7185" />

          {/* Royal Gold Crown */}
          <path d="M24 34 L32 14 L50 25 L68 14 L76 34 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="32" cy="14" r="3.5" fill="#f43f5e" stroke="#be123c" strokeWidth="0.8" />
          <circle cx="50" cy="25" r="3.5" fill="#38bdf8" stroke="#0284c7" strokeWidth="0.8" />
          <circle cx="68" cy="14" r="3.5" fill="#10b981" stroke="#047857" strokeWidth="0.8" />

          {/* Sparkle */}
          <path d="M80 26 L82 30 L86 32 L82 34 L80 38 L78 34 L74 32 L78 30 Z" fill="#eab308" className="animate-mini-sparkle" />
        </g>
      </svg>
    </div>
  );
}

// ── 7. Secondary Mini: MÃ GIẢM GIÁ ─────────────────────────────────────────
export function MascotCouponMini({ size = 40, className = '' }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
        <g className="animate-mini-float">
          {/* Anty Peeking Head */}
          <rect x="28" y="10" width="44" height="34" rx="15" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" />
          <rect x="33" y="15" width="34" height="22" rx="10" fill="#0f172a" />
          <circle cx="42" cy="25" r="2.8" fill="#fb7185" />
          <circle cx="58" cy="25" r="2.8" fill="#fb7185" />

          {/* Big VIP Coupon Ticket */}
          <g transform="translate(8, 38)">
            <path
              d="M0 4 C0 1.8 1.8 0 4 0 H80 C82.2 0 84 1.8 84 4 V16 C80 16 76 19.5 76 24 C76 28.5 80 32 84 32 V44 C84 46.2 82.2 48 80 48 H4 C1.8 48 0 46.2 0 44 V32 C4 32 8 28.5 8 24 C8 19.5 4 16 0 16 Z"
              fill="#f43f5e"
              stroke="#be123c"
              strokeWidth="1.5"
            />
            {/* Dashed Cut Line */}
            <line x1="60" y1="2" x2="60" y2="46" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.85" />
            {/* % Symbol */}
            <text x="28" y="33" fill="#ffffff" fontSize="24" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
              %
            </text>
            <circle cx="72" cy="24" r="5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
          </g>
        </g>
      </svg>
    </div>
  );
}

// ── 8. Secondary Mini: CẢNH BÁO TỒN KHO ──────────────────────────────────────
export function MascotStockAlertMini({ size = 40, className = '' }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
        <g className="animate-mini-float">
          {/* Anty Head */}
          <rect x="22" y="16" width="56" height="44" rx="19" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
          <rect x="28" y="22" width="44" height="30" rx="13" fill="#0f172a" />
          
          {/* Alert Looking Eyes */}
          <circle cx="40" cy="36" r="4" fill="#f59e0b" />
          <circle cx="60" cy="36" r="4" fill="#f59e0b" />
          <circle cx="41.5" cy="34.5" r="1.5" fill="#ffffff" />
          <circle cx="61.5" cy="34.5" r="1.5" fill="#ffffff" />

          {/* 3D Warning Triangle Sign */}
          <g transform="translate(20, 46)">
            <polygon points="30,4 58,46 2,46" fill="#f59e0b" stroke="#b45309" strokeWidth="1.8" strokeLinejoin="round" />
            <polygon points="30,12 51,41 9,41" fill="#fef3c7" />
            <line x1="30" y1="20" x2="30" y2="30" stroke="#b45309" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="30" cy="36" r="2.2" fill="#b45309" />
          </g>
        </g>
      </svg>
    </div>
  );
}
