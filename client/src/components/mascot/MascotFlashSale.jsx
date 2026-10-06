'use client';

import React from 'react';

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * MascotFlashSale — Studio-grade Animated 3D Vector Mascot Artwork
 * Hỗ trợ 2 trạng thái chuyên biệt:
 * 1. status="ended"    -> "Anty Shopy" tiếc nuối, tai cụp, 2 mắt ngấn lệ pha lê
 *                         chảy tự nhiên, đồng hồ cơ khí đứng kim 00:00 (ENDED).
 * 2. status="upcoming" -> "Anty Shopy" bay bổng bằng phản lực plasma,
 *                         mắt ngôi sao, đồng hồ đếm ngược, tia sét điện quang.
 * ══════════════════════════════════════════════════════════════════════════════
 */
export default function MascotFlashSale({
  size = 420,
  status = 'ended', // 'ended' | 'upcoming' | 'ongoing'
  className = '',
}) {
  const isEnded = status === 'ended';

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
          {/* ─── 1. Gradients & Lighting Shaders ─── */}
          <radialGradient id="fsAuraCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={isEnded ? '#fee2e2' : '#fef08a'} stopOpacity={isEnded ? 0.7 : 0.9} />
            <stop offset="40%" stopColor={isEnded ? '#f1f5f9' : '#fed7aa'} stopOpacity={0.4} />
            <stop offset="80%" stopColor={isEnded ? '#f8fafc' : '#fee2e2'} stopOpacity={0.2} />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="robotPearlWhite" x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#f8fafc" />
            <stop offset="85%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          <linearGradient id="visorGlassDeep" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="70%" stopColor="#020617" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>

          <linearGradient id="visorNeonGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isEnded ? '#94a3b8' : '#38bdf8'} />
            <stop offset="50%" stopColor={isEnded ? '#f43f5e' : '#f59e0b'} />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>

          <linearGradient id="goldStopwatchRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isEnded ? '#cbd5e1' : '#fef08a'} />
            <stop offset="25%" stopColor={isEnded ? '#94a3b8' : '#fbbf24'} />
            <stop offset="60%" stopColor={isEnded ? '#64748b' : '#d97706'} />
            <stop offset="100%" stopColor={isEnded ? '#475569' : '#78350f'} />
          </linearGradient>

          <linearGradient id="brandRedCoat" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="50%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>

          <linearGradient id="plasmaJetGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="40%" stopColor="#0284c7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="specularGleam" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Shader Giọt nước mắt pha lê chân thực */}
          <linearGradient id="crystalTearGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="1" />
          </linearGradient>

          {/* ─── 2. Filters & Drop Shadows ─── */}
          <filter id="neonSparkGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="tearDropGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0284c7" floodOpacity="0.4" />
          </filter>

          <filter id="goldAuraDrop" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor={isEnded ? '#64748b' : '#f59e0b'} floodOpacity={isEnded ? 0.25 : 0.4} />
          </filter>

          <filter id="badgeFloatShadow">
            <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor={isEnded ? '#475569' : '#e11d48'} floodOpacity={0.3} />
          </filter>

          {/* ─── 3. CSS 60FPS Keyframe Animations ─── */}
          <style>{`
            /* Animations for Upcoming state */
            @keyframes robotHoverFly {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-14px) rotate(1.2deg); }
            }
            @keyframes thrusterFlame {
              0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.9; }
              50% { transform: scaleY(1.35) scaleX(0.9); opacity: 1; filter: drop-shadow(0 0 10px #38bdf8); }
            }
            @keyframes stopwatchSpin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes gearSpinReverse {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(-360deg); }
            }
            @keyframes orbitRings {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes lightningStrike {
              0%, 100% { transform: scale(1); opacity: 0.85; }
              50% { transform: scale(1.25) rotate(-5deg); opacity: 1; filter: drop-shadow(0 0 8px #fbbf24); }
            }
            @keyframes starEyesBlink {
              0%, 42%, 58%, 100% { transform: scale(1); }
              50% { transform: scale(0.1, 1); }
            }
            @keyframes antennaPulseLive {
              0%, 100% { fill: #f59e0b; filter: drop-shadow(0 0 6px #fbbf24); }
              50% { fill: #ef4444; filter: drop-shadow(0 0 14px #ef4444); }
            }

            /* Animations for Ended / Sad state */
            @keyframes robotSighSad {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(5px) rotate(-1.2deg); }
            }
            @keyframes sadEyesBlink {
              0%, 40%, 60%, 100% { transform: scaleY(1); }
              50% { transform: scaleY(0.15); }
            }
            @keyframes earDroopLeftSad {
              0%, 100% { transform: rotate(-28deg); }
              50% { transform: rotate(-34deg); }
            }
            @keyframes earDroopRightSad {
              0%, 100% { transform: rotate(28deg); }
              50% { transform: rotate(34deg); }
            }

            /* Realistic Dual Tear Physics (Chảy tự nhiên 2 mắt) */
            @keyframes tearDripLeftReal {
              0% { transform: translateY(0px) scale(0.7); opacity: 0; }
              20% { transform: translateY(1px) scale(1); opacity: 0.95; }
              60% { transform: translateY(8px) scale(1.15, 1.3); opacity: 1; }
              90% { transform: translateY(16px) scale(1.2, 1.4); opacity: 0.4; }
              100% { transform: translateY(20px) scale(0.8, 1.5); opacity: 0; }
            }

            @keyframes tearDripRightReal {
              0% { transform: translateY(0px) scale(0.7); opacity: 0; }
              25% { transform: translateY(1px) scale(1); opacity: 0.95; }
              65% { transform: translateY(7px) scale(1.15, 1.3); opacity: 1; }
              92% { transform: translateY(15px) scale(1.2, 1.4); opacity: 0.4; }
              100% { transform: translateY(19px) scale(0.8, 1.5); opacity: 0; }
            }

            @keyframes floorShadowBreath {
              0%, 100% { transform: scaleX(1); opacity: 0.32; }
              50% { transform: scaleX(0.82); opacity: 0.16; }
            }
            @keyframes floatTagWobble {
              0%, 100% { transform: translateY(0px) rotate(-4deg); }
              50% { transform: translateY(-6px) rotate(2deg); }
            }

            .anim-hover-fly { animation: robotHoverFly 4s ease-in-out infinite; }
            .anim-robot-sad { animation: robotSighSad 4s ease-in-out infinite; transform-origin: 240px 280px; }
            .anim-thruster { animation: thrusterFlame 0.8s ease-in-out infinite alternate; transform-origin: top center; }
            .anim-stopwatch-hand { animation: stopwatchSpin 6s linear infinite; transform-origin: 360px 210px; }
            .anim-gear-rev { animation: gearSpinReverse 10s linear infinite; transform-origin: 360px 210px; }
            .anim-orbit-ring { animation: orbitRings 14s linear infinite; transform-origin: 240px 190px; }
            .anim-lightning { animation: lightningStrike 2s ease-in-out infinite; }
            .anim-eyes-star { animation: starEyesBlink 4s ease-in-out infinite; transform-origin: center; }
            .anim-eyes-sad { animation: sadEyesBlink 4.5s ease-in-out infinite; transform-origin: center; }
            .anim-ear-l-sad { animation: earDroopLeftSad 3.6s ease-in-out infinite; transform-origin: 186px 74px; }
            .anim-ear-r-sad { animation: earDroopRightSad 3.6s ease-in-out infinite; transform-origin: 274px 74px; }
            .anim-tear-left { animation: tearDripLeftReal 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
            .anim-tear-right { animation: tearDripRightReal 2.8s cubic-bezier(0.4, 0, 0.2, 1) 0.9s infinite; }
            .anim-antenna-glow { animation: antennaPulseLive 1.8s ease-in-out infinite; }
            .anim-floor-shadow { animation: floorShadowBreath 4s ease-in-out infinite; transform-origin: 240px 365px; }
            .anim-float-tag { animation: floatTagWobble 3.2s ease-in-out infinite; }
          `}</style>
        </defs>

        {/* ── 1. NỀN HÀO QUANG ── */}
        <circle cx="240" cy="190" r="160" fill="url(#fsAuraCore)" />

        {/* ── NẾU UPCOMING / ONGOING: Vòng quỹ đạo & Sét năng lượng ── */}
        {!isEnded && (
          <>
            <g className="anim-orbit-ring" opacity="0.65">
              <ellipse
                cx="240"
                cy="190"
                rx="180"
                ry="75"
                stroke="url(#visorNeonGlow)"
                strokeWidth="2"
                strokeDasharray="8 6"
                fill="none"
                transform="rotate(-25 240 190)"
              />
              <circle cx="75" cy="135" r="7" fill="#fbbf24" filter="url(#neonSparkGlow)" />
              <circle cx="405" cy="245" r="6" fill="#ef4444" filter="url(#neonSparkGlow)" />
            </g>

            <g className="anim-lightning">
              <path d="M90 95l20-30h-16l6-22-28 34h16l-6 18z" fill="#f59e0b" filter="url(#neonSparkGlow)" />
              <path d="M400 90l16-24h-14l5-18-22 28h14l-5 14z" fill="#ef4444" filter="url(#neonSparkGlow)" />
              <path d="M125 250q9 0 9-9 0 9 9 9-9 0-9 9 0-9-9-9z" fill="#fbbf24" />
              <path d="M430 150q8 0 8-8 0 8 8 8-8 0-8 8 0-8-8-8z" fill="#38bdf8" />
            </g>

            {/* Tag SẮP DIỄN RA (Không emoji) */}
            <g className="anim-float-tag" filter="url(#badgeFloatShadow)">
              <rect x="65" y="150" width="90" height="32" rx="6" fill="url(#brandRedCoat)" stroke="#ffe4e6" strokeWidth="1.2" />
              <text x="110" y="171" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="11" fill="#ffffff" textAnchor="middle" letterSpacing="0.5">
                SẮP DIỄN RA
              </text>
            </g>
          </>
        )}

        {/* ── NẾU ENDED: Huy hiệu ĐÃ KẾT THÚC (Không emoji) ── */}
        {isEnded && (
          <g className="anim-float-tag" filter="url(#badgeFloatShadow)">
            <rect x="65" y="150" width="92" height="32" rx="6" fill="#475569" stroke="#94a3b8" strokeWidth="1.2" />
            <text x="111" y="170" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="11" fill="#ffffff" textAnchor="middle" letterSpacing="0.5">
              ĐÃ KẾT THÚC
            </text>
          </g>
        )}

        {/* ── 2. BÓNG ĐỔ DƯỚI SÀN ── */}
        <ellipse cx="240" cy="365" rx="90" ry="12" fill="#94a3b8" className="anim-floor-shadow" />

        {/* ── 3. CHÚ ROBOT "ANTY SHOPY" ── */}
        <g className={isEnded ? 'anim-robot-sad' : 'anim-hover-fly'}>
          
          {/* Phản lực nếu đang bay / Chân tựa sàn nếu hết giờ */}
          {!isEnded && (
            <g className="anim-thruster">
              <polygon points="208,295 198,345 218,345" fill="url(#plasmaJetGrad)" />
              <circle cx="208" cy="340" r="4" fill="#38bdf8" filter="url(#neonSparkGlow)" />
              <polygon points="252,295 242,345 262,345" fill="url(#plasmaJetGrad)" />
              <circle cx="252" cy="340" r="4" fill="#38bdf8" filter="url(#neonSparkGlow)" />
            </g>
          )}

          {/* Jetpack Booster sau lưng */}
          <rect x="190" y="195" width="80" height="60" rx="14" fill="#64748b" stroke="#334155" strokeWidth="2.5" />
          <circle cx="208" cy="260" r="10" fill="#334155" />
          <circle cx="252" cy="260" r="10" fill="#334155" />

          {/* Ăng-ten trái (Cụp xuống nếu Ended / Đứng thẳng nếu Upcoming) */}
          <g className={isEnded ? 'anim-ear-l-sad' : ''}>
            <rect
              x="178"
              y="55"
              width="16"
              height="38"
              rx="8"
              fill={isEnded ? '#64748b' : '#e11d48'}
              stroke={isEnded ? '#475569' : '#9f1239'}
              strokeWidth="1.5"
              transform={isEnded ? 'rotate(-32 186 74)' : 'rotate(-24 186 74)'}
            />
            <circle
              cx={isEnded ? '160' : '168'}
              cy={isEnded ? '56' : '50'}
              r="7"
              fill={isEnded ? '#94a3b8' : '#f59e0b'}
              className={isEnded ? '' : 'anim-antenna-glow'}
            />
            <circle cx={isEnded ? '160' : '168'} cy={isEnded ? '56' : '50'} r="3" fill="#ffffff" />
          </g>

          {/* Ăng-ten phải (Cụp xuống nếu Ended / Đứng thẳng nếu Upcoming) */}
          <g className={isEnded ? 'anim-ear-r-sad' : ''}>
            <rect
              x="266"
              y="55"
              width="16"
              height="38"
              rx="8"
              fill={isEnded ? '#64748b' : '#e11d48'}
              stroke={isEnded ? '#475569' : '#9f1239'}
              strokeWidth="1.5"
              transform={isEnded ? 'rotate(32 274 74)' : 'rotate(24 274 74)'}
            />
            <circle
              cx={isEnded ? '300' : '292'}
              cy={isEnded ? '56' : '50'}
              r="7"
              fill={isEnded ? '#94a3b8' : '#f59e0b'}
              className={isEnded ? '' : 'anim-antenna-glow'}
            />
            <circle cx={isEnded ? '300' : '292'} cy={isEnded ? '56' : '50'} r="3" fill="#ffffff" />
          </g>

          {/* Đầu robot mũ bảo hộ ngọc trai */}
          <rect
            x="170"
            y="76"
            width="120"
            height="100"
            rx="50"
            fill="url(#robotPearlWhite)"
            stroke="#cbd5e1"
            strokeWidth="3.5"
            filter="drop-shadow(0 8px 16px rgba(15,23,42,0.1))"
          />

          {/* Kính Visor đen bóng */}
          <rect x="183" y="93" width="94" height="58" rx="29" fill="url(#visorGlassDeep)" />
          <rect x="183" y="93" width="94" height="58" rx="29" stroke="url(#visorNeonGlow)" strokeWidth="1.8" opacity="0.8" fill="none" />

          {/* Vệt ánh sáng gương bóng */}
          <path
            d="M198 97h64c9 0 16 5 16 13v5c-20 6-50 8-86-4v-14z"
            fill="url(#specularGleam)"
          />

          {/* ── MẮT LED BIỂU CẢM: VUI TƯƠI HOẶC BUỒN THIU ── */}
          {!isEnded ? (
            /* Mắt ngôi sao Starburst vui tươi khi Upcoming */
            <g className="anim-eyes-star" fill="#38bdf8" filter="url(#neonSparkGlow)">
              <path d="M210 122q8 0 8-8 0 8 8 8-8 0-8 8 0-8-8-8z" fill="#38bdf8" />
              <circle cx="218" cy="122" r="2.5" fill="#ffffff" />
              <path d="M250 122q8 0 8-8 0 8 8 8-8 0-8 8 0-8-8-8z" fill="#38bdf8" />
              <circle cx="258" cy="122" r="2.5" fill="#ffffff" />
            </g>
          ) : (
            /* Mắt LED hình đường cong cụp xuống ngấn lệ (Sad Eyes) khi Ended */
            <g className="anim-eyes-sad" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" fill="none" filter="url(#neonSparkGlow)">
              {/* Mắt trái cụp buồn */}
              <path d="M206 126c4-7 14-7 18 0" />
              {/* Mắt phải cụp buồn */}
              <path d="M246 126c4-7 14-7 18 0" />
            </g>
          )}

          {/* Má hồng công nghệ */}
          <ellipse cx="204" cy="133" rx="6" ry="3" fill="#f43f5e" opacity={isEnded ? 0.4 : 0.8} />
          <ellipse cx="266" cy="133" rx="6" ry="3" fill="#f43f5e" opacity={isEnded ? 0.4 : 0.8} />

          {/* Miệng: Cười tươi khi Upcoming / Mếu buồn khi Ended */}
          {!isEnded ? (
            <path d="M229 135c3 4 9 4 12 0" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none" filter="url(#neonSparkGlow)" />
          ) : (
            <path d="M231 138c3-3 8-3 11 0" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          )}

          {/* ── GIỌT NƯỚC MẮT PHA LÊ CHÂN THỰC Ở CẢ 2 MẮT (DUAL-EYE REAL TEARS) ── */}
          {isEnded && (
            <>
              {/* Giọt nước mắt Mắt Trái */}
              <g className="anim-tear-left" filter="url(#tearDropGlow)">
                {/* Khối giọt nước bầu dục uốn cong chân thực */}
                <path
                  d="M200 128 c-2 3 -4 7 -4 10 a 4 4 0 0 0 8 0 c 0 -3 -2 -7 -4 -10 z"
                  fill="url(#crystalTearGrad)"
                />
                {/* Điểm phản quang pha lê trắng */}
                <circle cx="199" cy="135" r="1.2" fill="#ffffff" />
                <circle cx="201.5" cy="137" r="0.6" fill="#ffffff" opacity="0.8" />
              </g>

              {/* Giọt nước mắt Mắt Phải */}
              <g className="anim-tear-right" filter="url(#tearDropGlow)">
                {/* Khối giọt nước bầu dục uốn cong chân thực */}
                <path
                  d="M268 128 c-2 3 -4 7 -4 10 a 4 4 0 0 0 8 0 c 0 -3 -2 -7 -4 -10 z"
                  fill="url(#crystalTearGrad)"
                />
                {/* Điểm phản quang pha lê trắng */}
                <circle cx="267" cy="135" r="1.2" fill="#ffffff" />
                <circle cx="269.5" cy="137" r="0.6" fill="#ffffff" opacity="0.8" />
              </g>
            </>
          )}

          {/* Khớp cổ kim loại */}
          <rect x="214" y="172" width="32" height="10" rx="4" fill="#64748b" stroke="#334155" strokeWidth="1.5" />

          {/* Thân robot bo tròn chắc chắn */}
          <path
            d="M188 180h84c14 0 22 10 22 22v42c0 18-16 28-34 28h-60c-18 0-34-10-34-28v-42c0-12 8-22 22-22z"
            fill="url(#robotPearlWhite)"
            stroke="#cbd5e1"
            strokeWidth="3.5"
          />

          {/* Yếm ngực thương hiệu đỏ SHOP */}
          <path
            d="M200 180h60l-7 42a20 20 0 0 1-23 16 20 20 0 0 1-23-16l-7-42z"
            fill="url(#brandRedCoat)"
            stroke="#9f1239"
            strokeWidth="1.5"
          />
          {/* Logo Tia Sét Flash Sale trắng ở ngực */}
          <path d="M233 194l-5 14h5l-2 10 9-16h-5l3-8h-5z" fill="#ffffff" />

          {/* Chân robot & Giày */}
          <rect x="199" y="270" width="18" height="28" rx="8" fill="url(#robotPearlWhite)" stroke="#cbd5e1" strokeWidth="2" />
          <rect x="243" y="270" width="18" height="28" rx="8" fill="url(#robotPearlWhite)" stroke="#cbd5e1" strokeWidth="2" />
          <ellipse cx="208" cy="296" rx="12" ry="7" fill={isEnded ? '#64748b' : '#e11d48'} />
          <ellipse cx="252" cy="296" rx="12" ry="7" fill={isEnded ? '#64748b' : '#e11d48'} />

          {/* Tay trái robot */}
          <g fill="url(#robotPearlWhite)" stroke="#cbd5e1" strokeWidth="2.5">
            <path d="M180 196c-12 6-24 18-22 34 2 10 12 16 22 10l8-8-8-36z" />
            <circle cx="172" cy="240" r="10" fill={isEnded ? '#64748b' : '#e11d48'} stroke="#be123c" strokeWidth="2" />
          </g>

          {/* Tay phải robot ôm / tựa vào chiếc đồng hồ */}
          <g fill="url(#robotPearlWhite)" stroke="#cbd5e1" strokeWidth="2.5">
            <path d="M280 196c14 6 28 20 24 38-3 12-16 18-26 12l-8-12 10-38z" />
            <circle cx="288" cy="245" r="10" fill={isEnded ? '#64748b' : '#e11d48'} stroke="#be123c" strokeWidth="2" />
          </g>
        </g>

        {/* ── 4. CHIẾC ĐỒNG HỒ CƠ KHÍ GIỜ VÀNG (3D GOLD CHRONOGRAPH) ── */}
        <g filter="url(#goldAuraDrop)">
          {/* Quai treo đỉnh đồng hồ */}
          <path d="M346 160c0-8 6-14 14-14s14 6 14 14" stroke="url(#goldStopwatchRim)" strokeWidth="6" fill="none" />
          <rect x="353" y="156" width="14" height="8" rx="2" fill={isEnded ? '#64748b' : '#d97706'} />

          {/* Thân đồng hồ */}
          <circle cx="360" cy="210" r="54" fill="url(#goldStopwatchRim)" stroke={isEnded ? '#94a3b8' : '#fef08a'} strokeWidth="3" />
          {/* Mặt số trắng */}
          <circle cx="360" cy="210" r="44" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Vạch chia giờ */}
          <circle cx="360" cy="210" r="40" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 7.47" fill="none" />

          {/* Bánh răng cơ khí */}
          <g className={!isEnded ? 'anim-gear-rev' : ''} opacity="0.15">
            <circle cx="360" cy="210" r="28" stroke="#0f172a" strokeWidth="5" strokeDasharray="6 6" fill="none" />
          </g>

          {/* Tâm trục đồng hồ */}
          <circle cx="360" cy="210" r="5" fill={isEnded ? '#64748b' : '#e11d48'} />

          {/* Kim quay (Quay nếu Upcoming / Đứng kim 00:00 nếu Ended) */}
          {!isEnded ? (
            <>
              <g className="anim-stopwatch-hand">
                <line x1="360" y1="210" x2="360" y2="178" stroke="#e11d48" strokeWidth="3.5" strokeLinecap="round" />
                <circle cx="360" cy="184" r="3" fill="#e11d48" />
              </g>
              <line x1="360" y1="210" x2="338" y2="196" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
            </>
          ) : (
            /* Hai kim đứng yên thẳng tắp hướng 12h báo hiệu 00:00 hết giờ */
            <>
              <line x1="360" y1="210" x2="360" y2="176" stroke="#e11d48" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="360" y1="210" x2="360" y2="186" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
            </>
          )}

          {/* Chữ hiển thị trên mặt đồng hồ */}
          <text
            x="360"
            y="235"
            fontFamily="system-ui, sans-serif"
            fontWeight="900"
            fontSize="9"
            fill={isEnded ? '#64748b' : '#e11d48'}
            textAnchor="middle"
            letterSpacing="1"
          >
            {isEnded ? 'ENDED' : '00:00'}
          </text>
        </g>
      </svg>
    </div>
  );
}
