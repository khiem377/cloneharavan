'use client';

import React from 'react';

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * MascotNotFound — Studio-grade Animated 3D Vector Mascot Artwork for 404 Pages
 * "Anty Shopy" — Chú robot thám hiểm không gian với kính lúp quét holographic,
 * số 404 3D đỏ thương hiệu, hộp dữ liệu "?" bay bổng và cử chỉ xin lỗi siêu cute
 * ══════════════════════════════════════════════════════════════════════════════
 */
export default function MascotNotFound({ size = 440, className = '' }) {
  return (
    <div className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 540 380"
        width={size}
        height={(size * 380) / 540}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto overflow-visible drop-shadow-sm"
      >
        <defs>
          {/* ─── 1. Gradients & Lighting Shaders ─── */}
          <radialGradient id="portalCosmicAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fee2e2" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#ffe4e6" stopOpacity="0.4" />
            <stop offset="80%" stopColor="#f1f5f9" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="text404Shade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="40%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>

          <linearGradient id="text404Edge" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fecdd3" />
            <stop offset="100%" stopColor="#9f1239" />
          </linearGradient>

          <linearGradient id="robotPearlWhiteNF" x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#f8fafc" />
            <stop offset="85%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          <linearGradient id="visorGlassNF" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="70%" stopColor="#020617" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>

          <linearGradient id="scannerHoloBeam" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.05" />
          </linearGradient>

          <linearGradient id="magnifierRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          <linearGradient id="brandRedNF" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="50%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>

          <linearGradient id="glossHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* ─── 2. Filters & Drop Shadows ─── */}
          <filter id="neonCyanBeamGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="huge3DShadow404" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="12" stdDeviation="8" floodColor="#881337" floodOpacity="0.32" />
          </filter>

          {/* ─── 3. CSS 60FPS Keyframe Animations ─── */}
          <style>{`
            @keyframes bowApologetic {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(6px) rotate(2deg); }
            }
            @keyframes scanRadarSweep {
              0%, 100% { transform: rotate(-8deg); }
              50% { transform: rotate(18deg); }
            }
            @keyframes eyeSadBlink {
              0%, 42%, 58%, 100% { transform: scaleY(1); }
              50% { transform: scaleY(0.12); }
            }
            @keyframes earDroopLeft {
              0%, 100% { transform: rotate(-20deg); }
              50% { transform: rotate(-28deg); }
            }
            @keyframes earDroopRight {
              0%, 100% { transform: rotate(20deg); }
              50% { transform: rotate(28deg); }
            }
            @keyframes questionCubeFloat {
              0%, 100% { transform: translateY(0px) rotate(-6deg); }
              50% { transform: translateY(-12px) rotate(6deg); }
            }
            @keyframes tearDrip {
              0%, 100% { transform: translateY(0px) scale(1); opacity: 0.9; }
              50% { transform: translateY(5px) scale(1.15); opacity: 1; filter: drop-shadow(0 0 6px #38bdf8); }
            }
            @keyframes floorShadowBreathNF {
              0%, 100% { transform: scaleX(1); opacity: 0.35; }
              50% { transform: scaleX(1.1); opacity: 0.48; }
            }
            @keyframes sparkGlitch {
              0%, 100% { opacity: 0.4; transform: scale(0.9); }
              50% { opacity: 1; transform: scale(1.2); }
            }

            .anim-bow-nf { animation: bowApologetic 3.8s ease-in-out infinite; transform-origin: 270px 270px; }
            .anim-scanner-sweep { animation: scanRadarSweep 3.2s ease-in-out infinite alternate; transform-origin: 180px 220px; }
            .anim-eyes-nf { animation: eyeSadBlink 4.4s ease-in-out infinite; transform-origin: center; }
            .anim-ear-l-nf { animation: earDroopLeft 3s ease-in-out infinite; transform-origin: 228px 90px; }
            .anim-ear-r-nf { animation: earDroopRight 3s ease-in-out infinite; transform-origin: 312px 90px; }
            .anim-q-cube { animation: questionCubeFloat 3.6s ease-in-out infinite; }
            .anim-tear { animation: tearDrip 2.2s ease-in-out infinite; }
            .anim-floor-nf { animation: floorShadowBreathNF 3.8s ease-in-out infinite; transform-origin: 270px 345px; }
            .anim-spark-nf { animation: sparkGlitch 1.6s ease-in-out infinite; }
          `}</style>
        </defs>

        {/* ── 1. NỀN HÀO QUANG VŨ TRỤ / ĐÁM MÂY KỸ THUẬT SỐ ── */}
        <ellipse cx="270" cy="190" rx="220" ry="140" fill="url(#portalCosmicAura)" />

        {/* Floating Question Cube "?" bay bên góc phải */}
        <g className="anim-q-cube" filter="drop-shadow(0 6px 10px rgba(0,0,0,0.1))">
          <rect x="425" y="80" width="38" height="38" rx="10" fill="#ffffff" stroke="#f43f5e" strokeWidth="2" />
          <text x="444" y="106" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="22" fill="#e11d48" textAnchor="middle">
            ?
          </text>
        </g>

        {/* Floating Mini Satellite / Sparkles bên góc trái */}
        <g className="anim-spark-nf">
          <circle cx="85" cy="110" r="16" fill="#fde047" opacity="0.8" />
          <circle cx="85" cy="110" r="10" fill="#f59e0b" />
          <path d="M125 150q7 0 7-7 0 7 7 7-7 0-7 7 0-7-7-7z" fill="#38bdf8" />
          <path d="M410 230q6 0 6-6 0 6 6 6-6 0-6 6 0-6-6-6z" fill="#f43f5e" />
        </g>

        {/* ── 2. CHỮ SỐ "404" 3D KHỔNG LỒ Ở NỀN ── */}
        <g filter="url(#huge3DShadow404)">
          {/* Số 4 bên trái */}
          <text
            x="120"
            y="265"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="148"
            fill="url(#text404Shade)"
            stroke="url(#text404Edge)"
            strokeWidth="3"
            textAnchor="middle"
            letterSpacing="-4"
          >
            4
          </text>

          {/* Vòng số 0 đỏ đậm ở giữa ôm quanh robot */}
          <circle
            cx="270"
            cy="210"
            r="60"
            stroke="url(#text404Shade)"
            strokeWidth="34"
            fill="none"
          />
          {/* Vạch kẻ ánh sáng viền trong số 0 */}
          <circle
            cx="270"
            cy="210"
            r="42"
            stroke="#fecdd3"
            strokeWidth="2.5"
            fill="none"
            opacity="0.7"
          />

          {/* Số 4 bên phải */}
          <text
            x="420"
            y="265"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="148"
            fill="url(#text404Shade)"
            stroke="url(#text404Edge)"
            strokeWidth="3"
            textAnchor="middle"
            letterSpacing="-4"
          >
            4
          </text>
        </g>

        {/* ── 3. BÓNG ĐỔ DƯỚI ĐÁY ROBOT ── */}
        <ellipse cx="270" cy="345" rx="95" ry="13" fill="#94a3b8" className="anim-floor-nf" />

        {/* ── 4. CHÚ ROBOT "ANTY SHOPY" THÁM HIỂM CÚI ĐẦU XIN LỖI ── */}
        <g className="anim-bow-nf">
          
          {/* Tai nghe / ăng-ten trái (màu đỏ SHOP, khớp nối kim loại) */}
          <g className="anim-ear-l-nf">
            <circle cx="228" cy="94" r="9" fill="#64748b" stroke="#334155" strokeWidth="1.8" />
            <rect x="220" y="48" width="16" height="46" rx="8" fill="#e11d48" stroke="#9f1239" strokeWidth="1.8" />
            <circle cx="228" cy="56" r="5.5" fill="#fda4af" />
            <circle cx="228" cy="56" r="2.5" fill="#ffffff" />
          </g>

          {/* Tai nghe / ăng-ten phải (màu đỏ SHOP, khớp nối kim loại) */}
          <g className="anim-ear-r-nf">
            <circle cx="312" cy="94" r="9" fill="#64748b" stroke="#334155" strokeWidth="1.8" />
            <rect x="304" y="48" width="16" height="46" rx="8" fill="#e11d48" stroke="#9f1239" strokeWidth="1.8" />
            <circle cx="312" cy="56" r="5.5" fill="#fda4af" />
            <circle cx="312" cy="56" r="2.5" fill="#ffffff" />
          </g>

          {/* Đầu robot mũ bảo hộ ngọc trai bo tròn */}
          <rect
            x="208"
            y="78"
            width="124"
            height="102"
            rx="51"
            fill="url(#robotPearlWhiteNF)"
            stroke="#cbd5e1"
            strokeWidth="3.5"
            filter="drop-shadow(0 8px 16px rgba(15,23,42,0.08))"
          />

          {/* Kính Visor đen bóng */}
          <rect x="222" y="96" width="96" height="58" rx="29" fill="url(#visorGlassNF)" />
          <rect x="222" y="96" width="96" height="58" rx="29" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" fill="none" />

          {/* Vệt bóng kính phản chiếu */}
          <path
            d="M236 100h66c9 0 16 5 16 13v5c-20 6-50 8-86-4v-14z"
            fill="url(#glossHighlight)"
          />

          {/* Mắt LED xanh ngọc nhắm lại hối lỗi cute (2 đường cong chớp nháy) */}
          <g className="anim-eyes-nf" stroke="#38bdf8" strokeWidth="4.5" strokeLinecap="round" fill="none" filter="url(#neonCyanBeamGlow)">
            {/* Mắt trái cong */}
            <path d="M240 128c5-8 15-8 20 0" />
            {/* Mắt phải cong */}
            <path d="M280 128c5-8 15-8 20 0" />
          </g>

          {/* Má hồng bẽn lẽn */}
          <ellipse cx="233" cy="138" rx="8" ry="4" fill="#f43f5e" opacity="0.85" />
          <ellipse cx="307" cy="138" rx="8" ry="4" fill="#f43f5e" opacity="0.85" />

          {/* Miệng nhỏ bối rối */}
          <path d="M264 142c3-4 8-4 12 0" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Giọt nước mắt / mồ hôi công nghệ lấp lánh */}
          <g className="anim-tear">
            <path
              d="M320 95c0 5-4 8-8 8s-8-3-8-8c0-6 8-14 8-14s8 8 8 14z"
              fill="#38bdf8"
              filter="url(#neonCyanBeamGlow)"
            />
            <circle cx="315" cy="93" r="2" fill="#ffffff" />
          </g>

          {/* Khớp cổ gân kim loại */}
          <rect x="254" y="177" width="32" height="10" rx="4" fill="#64748b" stroke="#334155" strokeWidth="1.5" />

          {/* Thân robot bo tròn */}
          <path
            d="M232 185h76c14 0 22 10 22 22v42c0 18-16 28-34 28h-52c-18 0-34-10-34-28v-42c0-12 8-22 22-22z"
            fill="url(#robotPearlWhiteNF)"
            stroke="#cbd5e1"
            strokeWidth="3.5"
          />

          {/* Yếm đỏ SHOP */}
          <path
            d="M244 185h52l-6 40a18 18 0 0 1-20 15 18 18 0 0 1-20-15l-6-40z"
            fill="url(#brandRedNF)"
            stroke="#9f1239"
            strokeWidth="1.5"
          />
          {/* Logo SHOP chữ S trắng cách điệu */}
          <text
            x="270"
            y="218"
            fontFamily="system-ui, sans-serif"
            fontWeight="900"
            fontSize="20"
            fill="#ffffff"
            textAnchor="middle"
          >
            S
          </text>

          {/* Chân robot & Giày đỏ bo tròn */}
          <rect x="246" y="274" width="18" height="28" rx="8" fill="url(#robotPearlWhiteNF)" stroke="#cbd5e1" strokeWidth="2" />
          <rect x="276" y="274" width="18" height="28" rx="8" fill="url(#robotPearlWhiteNF)" stroke="#cbd5e1" strokeWidth="2" />
          <ellipse cx="255" cy="301" rx="12" ry="7" fill="#e11d48" />
          <ellipse cx="285" cy="301" rx="12" ry="7" fill="#e11d48" />

          {/* ── Tay phải robot chắp trước ngực ── */}
          <g fill="url(#robotPearlWhiteNF)" stroke="#cbd5e1" strokeWidth="2.5">
            <path d="M316 200c4 10-4 24-18 26l-18-4c-3-1-4-5-3-8l10-22c3-5 11-7 17-4l12 12z" />
            <circle cx="280" cy="222" r="9" fill="#e11d48" stroke="#be123c" strokeWidth="2" />
          </g>

          {/* ── Tay trái cầm Kính Lúp Quét Holographic Scanner ── */}
          <g className="anim-scanner-sweep">
            {/* Cánh tay trái đưa ra */}
            <path d="M228 198c-8 6-18 16-24 28l12 8c6-8 14-18 20-22l-8-14z" fill="url(#robotPearlWhiteNF)" stroke="#cbd5e1" strokeWidth="2" />
            <circle cx="204" cy="232" r="9" fill="#e11d48" stroke="#be123c" strokeWidth="2" />

            {/* Cán kính lúp kim loại */}
            <line x1="204" y1="232" x2="165" y2="255" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
            
            {/* Vành kính lúp phát quang xanh cyan */}
            <circle cx="150" cy="265" r="26" stroke="url(#magnifierRimGrad)" strokeWidth="4.5" fill="#e0f2fe" fillOpacity="0.4" />
            <circle cx="150" cy="265" r="20" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />

            {/* Chùm tia quét Holographic Beam xuống mặt đất */}
            <polygon points="150,265 80,350 220,350" fill="url(#scannerHoloBeam)" className="anim-energy-arc" />
            
            {/* Vệt sáng lưới laser quét trên sàn */}
            <ellipse cx="150" cy="350" rx="65" ry="12" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 4" fill="#38bdf8" fillOpacity="0.15" filter="url(#neonCyanBeamGlow)" />
            <line x1="100" y1="350" x2="200" y2="350" stroke="#38bdf8" strokeWidth="2" />
          </g>
        </g>
      </svg>
    </div>
  );
}
