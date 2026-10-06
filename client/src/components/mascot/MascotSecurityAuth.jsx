'use client';

import React from 'react';

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * MascotSecurityAuth — Studio-grade Animated 3D Vector Mascot Artwork
 * "Anty Shopy" — Hiệp sĩ Thiên Thần Bảo Mật với vòng hào quang vàng, đôi cánh
 * cyber phát sáng, chiếc chìa khóa pha lê vàng xoay lấp lánh và khiên an ninh số
 * ══════════════════════════════════════════════════════════════════════════════
 */
export default function MascotSecurityAuth({ size = 420, className = '' }) {
  return (
    <div className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 520 400"
        width={size}
        height={(size * 400) / 520}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto overflow-visible drop-shadow-sm"
      >
        <defs>
          {/* ─── 1. Gradients & Shaders ─── */}
          <radialGradient id="guardianAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#e0e7ff" stopOpacity="0.5" />
            <stop offset="80%" stopColor="#ede9fe" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="haloGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#fbbf24" />
            <stop offset="80%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          <linearGradient id="wingCyberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#e0f2fe" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="crystalKeyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="30%" stopColor="#fbbf24" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          <linearGradient id="cyberShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          <linearGradient id="robotPearlWhiteAuth" x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#f8fafc" />
            <stop offset="85%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          <linearGradient id="visorGlassAuth" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="70%" stopColor="#020617" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>

          <linearGradient id="brandRedAuth" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="50%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>

          <linearGradient id="specularGleamAuth" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* ─── 2. Filters & Glows ─── */}
          <filter id="keyGlowSuper" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="shield3DShadow">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#2563eb" floodOpacity="0.35" />
          </filter>

          {/* ─── 3. CSS 60FPS Keyframe Animations ─── */}
          <style>{`
            @keyframes guardianFloat {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-12px); }
            }
            @keyframes haloRotate3D {
              0%, 100% { transform: translateY(0px) scale(1); filter: drop-shadow(0 0 6px #fbbf24); }
              50% { transform: translateY(-3px) scale(1.04); filter: drop-shadow(0 0 14px #f59e0b); }
            }
            @keyframes wingFlapL {
              0%, 100% { transform: rotate(0deg) scaleX(1); }
              50% { transform: rotate(-16deg) scaleX(1.08); }
            }
            @keyframes wingFlapR {
              0%, 100% { transform: rotate(0deg) scaleX(1); }
              50% { transform: rotate(16deg) scaleX(1.08); }
            }
            @keyframes keySparkleOrbit {
              0%, 100% { transform: rotate(0deg) scale(1); filter: drop-shadow(0 0 6px #fbbf24); }
              50% { transform: rotate(8deg) scale(1.08); filter: drop-shadow(0 0 16px #f59e0b); }
            }
            @keyframes eyeFriendlyBlink {
              0%, 45%, 55%, 100% { transform: scaleY(1); }
              50% { transform: scaleY(0.1); }
            }
            @keyframes authShadowBreath {
              0%, 100% { transform: scaleX(1); opacity: 0.32; }
              50% { transform: scaleX(0.85); opacity: 0.18; }
            }
            @keyframes hexMatrixPulse {
              0%, 100% { opacity: 0.5; transform: scale(1); }
              50% { opacity: 0.85; transform: scale(1.05); }
            }

            .anim-guardian-float { animation: guardianFloat 3.8s ease-in-out infinite; }
            .anim-halo { animation: haloRotate3D 2.5s ease-in-out infinite; transform-origin: 240px 60px; }
            .anim-wing-left { animation: wingFlapL 2.4s ease-in-out infinite; transform-origin: 175px 190px; }
            .anim-wing-right { animation: wingFlapR 2.4s ease-in-out infinite; transform-origin: 305px 190px; }
            .anim-crystal-key { animation: keySparkleOrbit 3s ease-in-out infinite; transform-origin: 370px 210px; }
            .anim-eyes-auth { animation: eyeFriendlyBlink 4.2s ease-in-out infinite; transform-origin: center; }
            .anim-auth-shadow { animation: authShadowBreath 3.8s ease-in-out infinite; transform-origin: 240px 365px; }
            .anim-hex-matrix { animation: hexMatrixPulse 3s ease-in-out infinite; transform-origin: 100px 220px; }
          `}</style>
        </defs>

        {/* ── 1. HÀO QUANG AN TOÀN BẢO MẬT & MẠNG LƯỚI KHÓA ── */}
        <circle cx="240" cy="190" r="160" fill="url(#guardianAura)" />

        {/* Hạt photon an ninh phát sáng */}
        <g opacity="0.85">
          <circle cx="110" cy="130" r="5" fill="#60a5fa" filter="url(#keyGlowSuper)" />
          <circle cx="390" cy="120" r="6" fill="#f59e0b" filter="url(#keyGlowSuper)" />
          <circle cx="120" cy="270" r="4" fill="#a855f7" />
          <circle cx="380" cy="260" r="4.5" fill="#38bdf8" />
          {/* Biểu tượng ổ khóa số mờ ở nền */}
          <path
            d="M240 50l50 20v35c0 30-22 50-50 60-28-10-50-30-50-60V70l50-20z"
            fill="#dbeafe"
            opacity="0.35"
          />
        </g>

        {/* ── 2. BÓNG ĐỔ DƯỚI ĐÁY ── */}
        <ellipse cx="240" cy="365" rx="85" ry="11" fill="#94a3b8" className="anim-auth-shadow" />

        {/* ── 3. CHÚ ROBOT "ANTY SHOPY" THIÊN THẦN BẢO MẬT ── */}
        <g className="anim-guardian-float">
          
          {/* Vòng Hào Quang Vàng (Golden Angel Halo) lơ lửng trên đầu */}
          <g className="anim-halo">
            <ellipse
              cx="240"
              cy="58"
              rx="46"
              ry="14"
              stroke="url(#haloGoldGrad)"
              strokeWidth="6"
              fill="none"
              filter="url(#keyGlowSuper)"
            />
            {/* Điểm sáng lấp lánh trên vành hào quang */}
            <circle cx="210" cy="54" r="3.5" fill="#ffffff" />
            <circle cx="265" cy="62" r="3" fill="#ffffff" />
          </g>

          {/* Cánh Thiên Thần Cyber Trái */}
          <g className="anim-wing-left">
            <path
              d="M175 190c-36-24-70-10-80 20-8 24 14 42 45 34 18-5 30-24 35-54z"
              fill="url(#wingCyberGrad)"
              stroke="#7dd3fc"
              strokeWidth="2.8"
              filter="drop-shadow(0 6px 12px rgba(56,189,248,0.3))"
            />
            {/* Lớp lông vũ thứ 2 */}
            <path d="M162 202c-20-12-40-5-45 12-4 12 8 22 24 18 10-3 17-12 21-30z" fill="#ffffff" opacity="0.85" />
            {/* Đường gân năng lượng */}
            <path d="M170 195c-25-10-48-2-58 14" stroke="#38bdf8" strokeWidth="1.5" fill="none" opacity="0.7" />
          </g>

          {/* Cánh Thiên Thần Cyber Phải */}
          <g className="anim-wing-right">
            <path
              d="M305 190c36-24 70-10 80 20 8 24-14 42-45 34-18-5-30-24-35-54z"
              fill="url(#wingCyberGrad)"
              stroke="#7dd3fc"
              strokeWidth="2.8"
              filter="drop-shadow(0 6px 12px rgba(56,189,248,0.3))"
            />
            {/* Lớp lông vũ thứ 2 */}
            <path d="M318 202c20-12 40-5 45 12 4 12-8 22-24 18-10-3-17-12-21-30z" fill="#ffffff" opacity="0.85" />
            {/* Đường gân năng lượng */}
            <path d="M310 195c25-10 48-2 58 14" stroke="#38bdf8" strokeWidth="1.5" fill="none" opacity="0.7" />
          </g>

          {/* Tai nghe / ăng-ten trái (chóp xanh cyber an toàn) */}
          <g>
            <rect x="180" y="58" width="16" height="38" rx="8" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" transform="rotate(-24 188 77)" />
            <circle cx="170" cy="54" r="7" fill="#38bdf8" filter="url(#keyGlowSuper)" />
            <circle cx="170" cy="54" r="3" fill="#ffffff" />
          </g>

          {/* Tai nghe / ăng-ten phải (chóp xanh cyber an toàn) */}
          <g>
            <rect x="264" y="58" width="16" height="38" rx="8" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" transform="rotate(24 272 77)" />
            <circle cx="290" cy="54" r="7" fill="#38bdf8" filter="url(#keyGlowSuper)" />
            <circle cx="290" cy="54" r="3" fill="#ffffff" />
          </g>

          {/* Đầu robot mũ bảo hộ trắng ngọc trai bo tròn */}
          <rect
            x="174"
            y="80"
            width="122"
            height="100"
            rx="50"
            fill="url(#robotPearlWhiteAuth)"
            stroke="#cbd5e1"
            strokeWidth="3.5"
            filter="drop-shadow(0 8px 16px rgba(15,23,42,0.1))"
          />

          {/* Kính Visor đen bóng */}
          <rect x="188" y="97" width="94" height="58" rx="29" fill="url(#visorGlassAuth)" />
          <rect x="188" y="97" width="94" height="58" rx="29" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" fill="none" />

          {/* Vệt sáng bóng kính */}
          <path
            d="M202 101h64c9 0 16 5 16 13v5c-20 6-50 8-86-4v-14z"
            fill="url(#specularGleamAuth)"
          />

          {/* Mắt LED xanh ngọc thân thiện, kiên định */}
          <g className="anim-eyes-auth" fill="#38bdf8" filter="url(#keyGlowSuper)">
            {/* Mắt trái */}
            <circle cx="216" cy="126" r="9" />
            <circle cx="218" cy="124" r="3.5" fill="#ffffff" />
            {/* Mắt phải */}
            <circle cx="254" cy="126" r="9" />
            <circle cx="256" cy="124" r="3.5" fill="#ffffff" />
          </g>

          {/* Má hồng công nghệ */}
          <ellipse cx="204" cy="136" rx="6" ry="3" fill="#38bdf8" opacity="0.6" />
          <ellipse cx="266" cy="136" rx="6" ry="3" fill="#38bdf8" opacity="0.6" />

          {/* Miệng cười tự tin, trấn an */}
          <path d="M230 138c3 4 8 4 11 0" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Khớp cổ kim loại */}
          <rect x="218" y="176" width="32" height="10" rx="4" fill="#64748b" stroke="#334155" strokeWidth="1.5" />

          {/* Thân robot bo tròn */}
          <path
            d="M192 184h84c14 0 22 10 22 22v42c0 18-16 28-34 28h-60c-18 0-34-10-34-28v-42c0-12 8-22 22-22z"
            fill="url(#robotPearlWhiteAuth)"
            stroke="#cbd5e1"
            strokeWidth="3.5"
          />

          {/* Áo yếm đỏ thương hiệu SHOP có khiên bảo mật */}
          <path
            d="M204 184h60l-7 42a20 20 0 0 1-23 16 20 20 0 0 1-23-16l-7-42z"
            fill="url(#brandRedAuth)"
            stroke="#9f1239"
            strokeWidth="1.5"
          />
          {/* Biểu tượng Ổ Khóa An Ninh trắng ở ngực */}
          <rect x="227" y="202" width="14" height="10" rx="2" fill="#ffffff" />
          <path d="M230 202v-4a4 4 0 0 1 8 0v4" stroke="#ffffff" strokeWidth="2" fill="none" />

          {/* Chân robot & Giày xanh hiệp sĩ */}
          <rect x="203" y="274" width="18" height="28" rx="8" fill="url(#robotPearlWhiteAuth)" stroke="#cbd5e1" strokeWidth="2" />
          <rect x="247" y="274" width="18" height="28" rx="8" fill="url(#robotPearlWhiteAuth)" stroke="#cbd5e1" strokeWidth="2" />
          <ellipse cx="212" cy="300" rx="12" ry="7" fill="#2563eb" />
          <ellipse cx="256" cy="300" rx="12" ry="7" fill="#2563eb" />

          {/* ── Cánh tay trái cầm Khiên Bảo Mật ── */}
          <g fill="url(#robotPearlWhiteAuth)" stroke="#cbd5e1" strokeWidth="2.5">
            <path d="M184 200c-12 8-24 22-20 38 2 8 10 12 18 8l8-10-6-36z" />
            <circle cx="174" cy="242" r="9" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2" />
          </g>

          {/* ── Cánh tay phải nâng Chìa Khóa Vàng ── */}
          <g fill="url(#robotPearlWhiteAuth)" stroke="#cbd5e1" strokeWidth="2.5">
            <path d="M284 200c12 8 26 22 22 38-2 8-10 12-18 8l-8-10 4-36z" />
            <circle cx="294" cy="242" r="9" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2" />
          </g>
        </g>

        {/* ── 4. KHIÊN AN NINH SỐ CYBER SHIELD (BÊN TRÁI) ── */}
        <g className="anim-hex-matrix" filter="url(#shield3DShadow)">
          {/* Khối khiên chính mạ xanh ngọc */}
          <path
            d="M100 185l40 16v32c0 26-18 42-40 50-22-8-40-24-40-50v-32l40-16z"
            fill="url(#cyberShieldGrad)"
            stroke="#93c5fd"
            strokeWidth="3"
          />
          {/* Vạch kẻ ánh sáng viền trong */}
          <path
            d="M100 196l28 11v22c0 18-12 30-28 36-16-6-28-18-28-36v-22l28-11z"
            stroke="#bfdbfe"
            strokeWidth="1.5"
            fill="none"
            opacity="0.8"
          />
          {/* Dấu Checkmark xác thực trên khiên */}
          <polyline
            points="88 230 96 238 112 220"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>

        {/* ── 5. CHIẾC CHÌA KHÓA PHA LÊ VÀNG 3D (BÊN PHẢI) ── */}
        <g className="anim-crystal-key" filter="url(#keyGlowSuper)">
          {/* Đầu chìa khóa hình vòng cung hoa văn */}
          <circle cx="370" cy="180" r="24" fill="url(#crystalKeyGrad)" stroke="#fef08a" strokeWidth="3" />
          <circle cx="370" cy="180" r="11" fill="#ffffff" />
          
          {/* Thân chìa khóa mạ vàng */}
          <rect x="364" y="200" width="12" height="60" rx="4" fill="url(#crystalKeyGrad)" stroke="#fef08a" strokeWidth="2" />

          {/* Răng chìa khóa công nghệ (2 ngạnh sắc sảo) */}
          <rect x="374" y="234" width="16" height="8" rx="2" fill="url(#crystalKeyGrad)" stroke="#fef08a" strokeWidth="1.5" />
          <rect x="374" y="248" width="12" height="8" rx="2" fill="url(#crystalKeyGrad)" stroke="#fef08a" strokeWidth="1.5" />

          {/* Ngôi sao lấp lánh phản chiếu trên đầu chìa khóa */}
          <path d="M370 162q7 0 7-7 0 7 7 7-7 0-7 7 0-7-7-7z" fill="#ffffff" />
          <path d="M394 200q5 0 5-5 0 5 5 5-5 0-5 5 0-5-5-5z" fill="#fef08a" />
        </g>
      </svg>
    </div>
  );
}
