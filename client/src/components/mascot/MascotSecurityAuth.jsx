'use client';

import React from 'react';

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * MascotSecurityAuth — Ultra-Premium Interactive Studio-Grade Mascot Artwork
 * "Anty Detective & Key Guardian" — Thám tử An ninh & Thần Hộ Vệ Mật Khẩu
 * 
 * Tính năng & Nghệ thuật Đỉnh Cao:
 * - Nhân vật 3D Vector Chibi phong cách Pixar/Cyberpunk cao cấp
 * - Chìa Khóa Vàng Pha Lê Hoàng Gia 3D (Golden Master Key) với hào quang lấp lánh & ngọc Ruby
 * - Kính Lúp Laser Quét Mật Khẩu (Cyber Magnifier HUD) chiếu lưới ma trận hạt photon
 * - Kính Visor Hologram phủ bóng gương 3D, Mắt OLED xanh ngọc tự động chớp mắt 60FPS
 * - Ăng-ten Radar phát sóng an ninh bảo mật nhiều tầng
 * - Tương tác Real-time: Hỗ trợ các trạng thái isTyping, isLoading, isSuccess
 * ══════════════════════════════════════════════════════════════════════════════
 */
export default function MascotSecurityAuth({
  size = 230,
  isTyping = false,
  isLoading = false,
  isSuccess = false,
  className = '',
}) {
  return (
    <div className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 420 310"
        width={size}
        height={(size * 310) / 420}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto overflow-visible transition-transform duration-300"
      >
        <defs>
          {/* ─── 1. SHADERS & GRADIENTS CAO CẤP ─── */}
          {/* Hào quang nền bảo mật đa tầng */}
          <radialGradient id="guardianAuraMega" cx="50%" cy="46%" r="54%">
            <stop offset="0%" stopColor={isSuccess ? '#dcfce7' : isTyping ? '#e0f2fe' : '#fef3c7'} stopOpacity="0.85" />
            <stop offset="45%" stopColor={isSuccess ? '#f0fdf4' : '#f1f5f9'} stopOpacity="0.45" />
            <stop offset="80%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Vỏ robot ngọc trai 3D trắng tuyết */}
          <linearGradient id="pearlWhiteArmor" x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#f8fafc" />
            <stop offset="70%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>

          {/* Vỏ mũ thám tử công nghệ xanh Navy */}
          <linearGradient id="detectiveNavyArmor" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="40%" stopColor="#1d4ed8" />
            <stop offset="85%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Màn hình Visor OLED đen sâu */}
          <linearGradient id="oledVisorDeep" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="50%" stopColor="#020617" />
            <stop offset="100%" stopColor="#050811" />
          </linearGradient>

          {/* Vàng hoàng kim 24K đa tầng cho Chìa Khóa */}
          <linearGradient id="gold24kMaster" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="20%" stopColor="#fef08a" />
            <stop offset="45%" stopColor="#facc15" />
            <stop offset="75%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          {/* Viền sáng mạ vàng phản quang */}
          <linearGradient id="goldSheenRim" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#b45309" stopOpacity="0.9" />
          </linearGradient>

          {/* Áo yếm bảo an đỏ thương hiệu */}
          <linearGradient id="securityRedCoat" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="40%" stopColor="#e11d48" />
            <stop offset="80%" stopColor="#be123c" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>

          {/* Thấu kính thủy tinh pha lê của Kính Lúp */}
          <radialGradient id="crystalLensGlass" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ecfeff" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#67e8f9" stopOpacity="0.5" />
            <stop offset="80%" stopColor="#0284c7" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.85" />
          </radialGradient>

          {/* Tia laser quét mật khẩu HUD */}
          <linearGradient id="scannerLaserBeam" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </linearGradient>

          {/* Vệt bóng gương cong kính Visor */}
          <linearGradient id="visorGlossCurved" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* ─── 2. GLOW & FILTER HIỆU ỨNG ÁNH SÁNG ─── */}
          <filter id="neonLaserGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="keySuperGleam" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="drop3DCharShadow">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0f172a" floodOpacity="0.18" />
          </filter>

          {/* ─── 3. CSS 60FPS KEYFRAME ANIMATIONS MƯỢT MÀ ─── */}
          <style>{`
            @keyframes bobbingFloatMotion {
              0%, 100% {
                transform: translateY(0px) rotate(0deg);
              }
              50% {
                transform: translateY(-14px) rotate(1.4deg);
              }
            }

            @keyframes keySparkleLevitate {
              0%, 100% {
                transform: translateY(0px) rotate(-3deg) scale(1);
                filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.7));
              }
              50% {
                transform: translateY(-18px) rotate(5deg) scale(1.06);
                filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.95));
              }
            }

            @keyframes lensHUDScan {
              0%, 100% {
                transform: rotate(0deg) scale(1);
              }
              30% {
                transform: rotate(-10deg) translateY(-3px) scale(1.04);
              }
              70% {
                transform: rotate(7deg) translateY(3px) scale(0.97);
              }
            }

            @keyframes oledEyeBlinkNatural {
              0%, 90%, 100% { transform: scaleY(1); }
              94% { transform: scaleY(0.1); }
            }

            @keyframes groundShadowBreath {
              0%, 100% {
                transform: scale(1);
                opacity: 0.35;
              }
              50% {
                transform: scale(0.8) translateY(2px);
                opacity: 0.16;
              }
            }

            @keyframes sparkleDiamondSpin {
              0%, 100% { transform: scale(0.7) rotate(0deg); opacity: 0.4; }
              50% { transform: scale(1.3) rotate(90deg); opacity: 1; }
            }

            @keyframes radarRingPulse {
              0% { r: 10px; opacity: 0.9; stroke-width: 2.5; }
              100% { r: 28px; opacity: 0; stroke-width: 0.8; }
            }

            @keyframes laserMatrixCone {
              0%, 100% { opacity: 0.35; transform: scale(0.95); }
              50% { opacity: 0.8; transform: scale(1.05); }
            }

            .anim-char-float {
              animation: bobbingFloatMotion 3.2s ease-in-out infinite;
              transform-origin: 210px 220px;
            }

            .anim-key-levitate {
              animation: keySparkleLevitate 2.8s ease-in-out infinite;
              transform-origin: 335px 150px;
            }

            .anim-lens-scan {
              animation: lensHUDScan 3.4s ease-in-out infinite;
              transform-origin: 85px 160px;
            }

            .anim-oled-eyes {
              animation: oledEyeBlinkNatural 3.6s ease-in-out infinite;
              transform-origin: center;
            }

            .anim-ground-shadow {
              animation: groundShadowBreath 3.2s ease-in-out infinite;
              transform-origin: 210px 282px;
            }

            .anim-sparkle-1 {
              animation: sparkleDiamondSpin 2s ease-in-out infinite;
              transform-origin: 360px 65px;
            }

            .anim-sparkle-2 {
              animation: sparkleDiamondSpin 2.5s ease-in-out infinite 0.7s;
              transform-origin: 65px 75px;
            }

            .anim-radar-wave-1 {
              animation: radarRingPulse 2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
              transform-origin: 210px 42px;
            }

            .anim-radar-wave-2 {
              animation: radarRingPulse 2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite 1s;
              transform-origin: 210px 42px;
            }

            .anim-laser-cone {
              animation: laserMatrixCone 2.2s ease-in-out infinite;
              transform-origin: 100px 145px;
            }
          `}</style>
        </defs>

        {/* ── 1. AMBIENT GLOW & SECURITY BACKDROP ── */}
        <circle cx="210" cy="145" r="140" fill="url(#guardianAuraMega)" />

        {/* ── 2. PARTICLES & FLOATING STARS ── */}
        <g className="anim-sparkle-1">
          <path d="M360 52 L364 62 L374 65 L364 68 L360 78 L356 68 L346 65 L356 62 Z" fill="#fbbf24" filter="url(#keySuperGleam)" />
        </g>
        <g className="anim-sparkle-2">
          <path d="M65 65 L68 72 L75 75 L68 78 L65 85 L62 78 L55 75 L62 72 Z" fill="#38bdf8" filter="url(#neonLaserGlow)" />
        </g>

        {/* Small floating sparkles */}
        <circle cx="85" cy="50" r="3" fill="#60a5fa" opacity="0.7" />
        <circle cx="340" cy="45" r="3.5" fill="#f59e0b" opacity="0.8" />
        <circle cx="50" cy="195" r="2.5" fill="#38bdf8" opacity="0.6" />
        <circle cx="370" cy="220" r="3" fill="#a855f7" opacity="0.7" />

        {/* ── 3. GROUND SHADOW (Synchronized with Bobbing) ── */}
        <ellipse cx="210" cy="282" rx="78" ry="12" fill="#0f172a" className="anim-ground-shadow" />

        {/* ── 4. FLOATING ROBOT CHARACTER MAIN GROUP ── */}
        <g className="anim-char-float" filter="url(#drop3DCharShadow)">

          {/* ── Body Chassis (Hình cầu Ngọc trai Bo tròn) ── */}
          <ellipse
            cx="210"
            cy="212"
            rx="56"
            ry="48"
            fill="url(#pearlWhiteArmor)"
            stroke="#94a3b8"
            strokeWidth="3"
          />

          {/* Áo Yếm Bảo An Đỏ Thương Hiệu (Security Vest) */}
          <path
            d="M182 186 H238 L232 232 A22 22 0 0 1 210 246 A22 22 0 0 1 188 232 Z"
            fill="url(#securityRedCoat)"
            stroke="#9f1239"
            strokeWidth="2"
          />

          {/* Khiên Vàng Nhỏ Đính Ngực với Lỗ Khóa Hoàng Gia */}
          <path
            d="M210 198 L219 202 V212 C219 218 215 224 210 226 C205 224 201 218 201 212 V202 Z"
            fill="url(#gold24kMaster)"
            stroke="#fffbeb"
            strokeWidth="1.2"
          />
          <circle cx="210" cy="208" r="2" fill="#78350f" />
          <path d="M209 208 L208 214 H212 L211 208 Z" fill="#78350f" />

          {/* Chân Robot & Giày Hiệp Sĩ Xanh Cyber */}
          <ellipse cx="180" cy="258" rx="17" ry="11" fill="url(#pearlWhiteArmor)" stroke="#94a3b8" strokeWidth="2" />
          <ellipse cx="240" cy="258" rx="17" ry="11" fill="url(#pearlWhiteArmor)" stroke="#94a3b8" strokeWidth="2" />
          <ellipse cx="180" cy="260" rx="11" ry="6" fill="#2563eb" />
          <ellipse cx="240" cy="260" rx="11" ry="6" fill="#2563eb" />

          {/* ── Ăng-ten Radar Bảo Mật Đỉnh Đầu ── */}
          <line x1="210" y1="74" x2="210" y2="44" stroke="#475569" strokeWidth="4.5" strokeLinecap="round" />
          
          {/* Vòng sóng Radar tỏa ra */}
          <circle cx="210" cy="42" r="10" stroke="#38bdf8" fill="none" className="anim-radar-wave-1" />
          <circle cx="210" cy="42" r="10" stroke="#f59e0b" fill="none" className="anim-radar-wave-2" />

          {/* Đèn LED radar chóp */}
          <circle cx="210" cy="42" r="10" fill={isSuccess ? '#22c55e' : '#38bdf8'} stroke={isSuccess ? '#15803d' : '#0284c7'} strokeWidth="2.5" filter="url(#neonLaserGlow)" />
          <circle cx="210" cy="42" r="4.5" fill="#ffffff" />

          {/* Tai nghe Chống Nhiễu 2 Bên (Cyber Ear Cushions) */}
          <rect x="132" y="98" width="14" height="38" rx="7" fill="url(#detectiveNavyArmor)" stroke="#0f172a" strokeWidth="1.5" />
          <circle cx="139" cy="117" r="4.5" fill="#38bdf8" filter="url(#neonLaserGlow)" />
          <rect x="274" y="98" width="14" height="38" rx="7" fill="url(#detectiveNavyArmor)" stroke="#0f172a" strokeWidth="1.5" />
          <circle cx="281" cy="117" r="4.5" fill="#38bdf8" filter="url(#neonLaserGlow)" />

          {/* ── Khối Đầu Mũ Thám Tử Bo Tròn (Head Dome) ── */}
          <rect
            x="140"
            y="66"
            width="140"
            height="106"
            rx="50"
            fill="url(#pearlWhiteArmor)"
            stroke="#94a3b8"
            strokeWidth="3"
          />

          {/* Mũ Thám Tử Xanh Navy Đội Đầu với Vành Uốn */}
          <path
            d="M136 78 C168 56 252 56 284 78 C260 64 160 64 136 78 Z"
            fill="url(#detectiveNavyArmor)"
            stroke="#1d4ed8"
            strokeWidth="2"
          />
          {/* Huy hiệu Ngôi Sao Vàng Thám Tử trên mũ */}
          <circle cx="210" cy="62" r="8" fill="url(#gold24kMaster)" stroke="#fffbeb" strokeWidth="1" />
          <polygon points="210,57 212,61 216,61 213,63 214,67 210,64 206,67 207,63 204,61 208,61" fill="#78350f" />

          {/* ── Màn Hình Kính Visor OLED Đen Sâu ── */}
          <rect
            x="154"
            y="78"
            width="112"
            height="80"
            rx="36"
            fill="url(#oledVisorDeep)"
            stroke="#020617"
            strokeWidth="2.5"
          />

          {/* Vệt Bóng Kính Phản Quang Uốn Lượn 3D */}
          <path
            d="M166 86 C186 80, 234 80, 254 86 C246 93, 174 93, 166 86 Z"
            fill="url(#visorGlossCurved)"
          />

          {/* ── Đôi Mắt OLED Xanh Ngọc Phát Sáng & Tương Tác ── */}
          <g className="anim-oled-eyes" fill="#38bdf8" filter="url(#neonLaserGlow)">
            {isSuccess ? (
              /* Mắt Vui Mừng Thành Công (Happy Arcs) */
              <g stroke="#22c55e" strokeWidth="4.5" strokeLinecap="round" fill="none">
                <path d="M174 118 Q184 108 194 118" />
                <path d="M226 118 Q236 108 246 118" />
              </g>
            ) : isTyping ? (
              /* Mắt Nhìn Xuống Tập Trung Khi User Đang Gõ Email */
              <g>
                <ellipse cx="184" cy="122" rx="7.5" ry="9.5" />
                <circle cx="184" cy="120" r="3" fill="#ffffff" />
                <ellipse cx="236" cy="122" rx="7.5" ry="9.5" />
                <circle cx="236" cy="120" r="3" fill="#ffffff" />
              </g>
            ) : (
              /* Mắt Tròn To Đáng Yêu Chớp Mắt Tự Nhiên */
              <g>
                {/* Mắt Trái */}
                <circle cx="184" cy="116" r="10" />
                <circle cx="186" cy="113" r="3.5" fill="#ffffff" />
                <circle cx="181" cy="119" r="1.5" fill="#ffffff" />

                {/* Mắt Phải */}
                <circle cx="236" cy="116" r="10" />
                <circle cx="238" cy="113" r="3.5" fill="#ffffff" />
                <circle cx="231" cy="119" r="1.5" fill="#ffffff" />
              </g>
            )}
          </g>

          {/* Má Hồng Công Nghệ Đáng Yêu */}
          <ellipse cx="170" cy="130" rx="8" ry="4.5" fill="#fb7185" opacity="0.85" />
          <ellipse cx="250" cy="130" rx="8" ry="4.5" fill="#fb7185" opacity="0.85" />

          {/* Nụ Cười Thân Thiện Tự Tin */}
          <path
            d="M202 129 C207 136, 213 136, 218 129"
            stroke="#38bdf8"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />

          {/* ── Cánh Tay Trái (Cầm Kính Lúp Cyber) ── */}
          <path
            d="M156 182 C134 175, 108 165, 96 150"
            stroke="#94a3b8"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <circle cx="96" cy="150" r="10" fill="url(#pearlWhiteArmor)" stroke="#94a3b8" strokeWidth="2.5" />

          {/* ── Cánh Tay Phải (Nâng Chìa Khóa Vàng) ── */}
          <path
            d="M264 182 C286 175, 312 165, 324 150"
            stroke="#94a3b8"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <circle cx="324" cy="150" r="10" fill="url(#pearlWhiteArmor)" stroke="#94a3b8" strokeWidth="2.5" />
        </g>

        {/* ── 5. HOLOGRAPHIC SCANNER & LASER BEAM (BÊN TRÁI) ── */}
        <g className="anim-lens-scan">
          {/* Cán Kính Lúp Chắc Chắn */}
          <line x1="96" y1="150" x2="62" y2="195" stroke="#1e293b" strokeWidth="9" strokeLinecap="round" />
          <line x1="96" y1="150" x2="62" y2="195" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
          {/* Rãnh Cầm Grip Xanh Cyber */}
          <line x1="72" y1="178" x2="78" y2="182" stroke="#38bdf8" strokeWidth="2.5" />
          <line x1="66" y1="186" x2="72" y2="190" stroke="#38bdf8" strokeWidth="2.5" />

          {/* Vành Khung Kính Lúp Kim Loại 3D */}
          <circle cx="102" cy="126" r="30" fill="none" stroke="url(#detectiveNavyArmor)" strokeWidth="7" filter="url(#drop3DCharShadow)" />
          <circle cx="102" cy="126" r="30" fill="none" stroke="#60a5fa" strokeWidth="1.8" />

          {/* Mặt Thấu Kính Thủy Tinh Pha Lê */}
          <circle cx="102" cy="126" r="26.5" fill="url(#crystalLensGlass)" />

          {/* HUD Lưới Tọa Độ Radar Trong Thấu Kính */}
          <circle cx="102" cy="126" r="15" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 3" fill="none" opacity="0.85" />
          <circle cx="102" cy="126" r="4.5" fill="#ffffff" filter="url(#neonLaserGlow)" />
          {/* Tia Chữ Thập Ngắm */}
          <line x1="84" y1="126" x2="94" y2="126" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="110" y1="126" x2="120" y2="126" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="102" y1="108" x2="102" y2="118" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="102" y1="134" x2="102" y2="144" stroke="#ffffff" strokeWidth="1.5" />

          {/* Tia Nón Laser Quét Ma Trận Tìm Mật Khẩu */}
          <path
            d="M102 126 L30 175 L50 215 Z"
            fill="url(#scannerLaserBeam)"
            className="anim-laser-cone"
          />

          {/* Hạt Byte Dữ Liệu Số "01" Bay Trong Vùng Quét */}
          <text x="52" y="180" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold" opacity="0.8">01</text>
          <text x="68" y="196" fill="#67e8f9" fontSize="7" fontFamily="monospace" fontWeight="bold" opacity="0.65">OK</text>

          {/* Vệt Sáng Phản Chiếu Thấu Kính */}
          <ellipse cx="94" cy="115" rx="9" ry="4.5" fill="#ffffff" opacity="0.8" transform="rotate(-35 94 115)" />
        </g>

        {/* ── 6. CHÌA KHÓA VÀNG HOÀNG GIA 3D (BÊN PHẢI) ── */}
        <g className="anim-key-levitate" filter="url(#keySuperGleam)">
          {/* Đầu Chìa Khóa Vương Miện / Hình Khiên Cắt Vát Đính Đá */}
          <circle cx="335" cy="108" r="28" fill="url(#gold24kMaster)" stroke="url(#goldSheenRim)" strokeWidth="4" />
          {/* Lỗ Khoét Trong Suốt Của Đầu Chìa */}
          <circle cx="335" cy="108" r="14" fill="#ffffff" stroke="#92400e" strokeWidth="1.8" />
          
          {/* Viên Hồng Ngọc Ruby Đỏ Rực ở Tâm Đầu Chìa */}
          <polygon points="335,100 342,108 335,116 328,108" fill="#f43f5e" stroke="#ffe4e6" strokeWidth="1.2" />

          {/* Thân Chìa Khóa Mạ Vàng Dày Dặn */}
          <rect
            x="328"
            y="132"
            width="14"
            height="66"
            rx="5"
            fill="url(#gold24kMaster)"
            stroke="url(#goldSheenRim)"
            strokeWidth="2.5"
          />

          {/* Răng Chìa Khóa Công Nghệ (3 Nấc Bảo Mật Sắc Sảo) */}
          <rect x="342" y="168" width="18" height="9" rx="2.5" fill="url(#gold24kMaster)" stroke="#fef08a" strokeWidth="1.5" />
          <rect x="342" y="182" width="14" height="8" rx="2" fill="url(#gold24kMaster)" stroke="#fef08a" strokeWidth="1.5" />
          <rect x="342" y="154" width="9" height="7" rx="1.5" fill="url(#gold24kMaster)" stroke="#fef08a" strokeWidth="1" />

          {/* Điểm Phản Chiếu Kim Cương 4 Cánh Lấp Lánh */}
          <path d="M335 82 Q339 90 348 90 Q339 90 335 98 Q331 90 322 90 Q331 90 335 82 Z" fill="#ffffff" />
          <path d="M362 126 Q365 132 371 132 Q365 132 362 138 Q359 132 353 132 Q359 132 362 126 Z" fill="#fef08a" />
        </g>
      </svg>
    </div>
  );
}
