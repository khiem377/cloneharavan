import React from 'react';

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * MascotAdminWelcome — Studio-grade Interactive Mascot for Admin Authentication
 * "Anty Shopy" — Mascot Quản trị viên tương tác thông minh:
 * - Khi nhập mật khẩu: Che mắt ngại ngùng / Bảo mật (Cover Eyes)
 * - Khi nhập email: Nhìn xuống chăm chú (Look Down)
 * - Khi bấm đăng nhập: Vui sướng vẫy chào và nảy số (Hyped)
 * - Mặc định: Lắc lư sống động với bảng chào to rõ
 * ══════════════════════════════════════════════════════════════════════════════
 */
export default function MascotAdminWelcome({ size = 190, activeField = null, isSubmitting = false, className = '' }) {
  const isPassword = activeField === 'password';
  const isEmail = activeField === 'email';

  return (
    <div className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 420 330"
        width={size}
        height={(size * 330) / 420}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto overflow-visible transition-all duration-300"
      >
        <defs>
          {/* Gradients */}
          <radialGradient id="welcomeAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#ede9fe" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="bodyPearl" x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          <linearGradient id="visorScreen" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="80%" stopColor="#020617" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>

          <linearGradient id="boardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>

          <linearGradient id="earAccent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* Keyframe Animations */}
          <style>{`
            @keyframes mascotSwayMotion {
              0%, 100% {
                transform: rotate(-7deg) translateY(0px);
              }
              50% {
                transform: rotate(7deg) translateY(-14px);
              }
            }

            @keyframes waveHandMotion {
              0%, 100% {
                transform: rotate(0deg);
              }
              25% {
                transform: rotate(-28deg);
              }
              75% {
                transform: rotate(22deg);
              }
            }

            @keyframes eyeBlinkMotion {
              0%, 90%, 100% {
                transform: scaleY(1);
              }
              95% {
                transform: scaleY(0.1);
              }
            }

            @keyframes shadowPulse {
              0%, 100% {
                transform: scale(1);
                opacity: 0.35;
              }
              50% {
                transform: scale(0.8) translateY(2px);
                opacity: 0.15;
              }
            }

            @keyframes sparkleTwinkle {
              0%, 100% { transform: scale(0.8) rotate(0deg); opacity: 0.4; }
              50% { transform: scale(1.3) rotate(45deg); opacity: 1; }
            }

            .mascot-sway-group {
              transform-origin: 190px 250px;
              animation: mascotSwayMotion 2.4s ease-in-out infinite;
            }

            .mascot-wave-hand {
              transform-origin: 115px 170px;
              animation: waveHandMotion 1.3s ease-in-out infinite;
            }

            .mascot-eye-blink {
              transform-origin: center;
              animation: eyeBlinkMotion 3.6s infinite;
            }

            .mascot-shadow-anim {
              transform-origin: 190px 295px;
              animation: shadowPulse 2.4s ease-in-out infinite;
            }

            .sparkle-star {
              animation: sparkleTwinkle 2s ease-in-out infinite;
            }
          `}</style>
        </defs>

        {/* Ambient Glow Aura */}
        <circle cx="190" cy="155" r="145" fill="url(#welcomeAura)" />

        {/* Dynamic Floor Shadow */}
        <ellipse cx="190" cy="295" rx="80" ry="13" fill="#0f172a" className="mascot-shadow-anim" />

        {/* Main Character Body Group with Sway Animation */}
        <g className="mascot-sway-group">
          {/* Sparkles around mascot */}
          <g className="sparkle-star" style={{ transformOrigin: '70px 75px' }}>
            <path d="M70 63 L73 72 L82 75 L73 78 L70 87 L67 78 L58 75 L67 72 Z" fill="#fbbf24" />
          </g>
          <g className="sparkle-star" style={{ transformOrigin: '340px 80px', animationDelay: '1s' }}>
            <path d="M340 70 L342 77 L349 80 L342 83 L340 90 L338 83 L331 80 L338 77 Z" fill="#38bdf8" />
          </g>

          {/* Body */}
          <ellipse cx="190" cy="230" rx="52" ry="46" fill="url(#bodyPearl)" stroke="#94a3b8" strokeWidth="2.5" />
          
          {/* Belly Badge */}
          <rect x="168" y="215" width="44" height="26" rx="13" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
          <circle cx="182" cy="228" r="4.5" fill="#38bdf8" />
          <circle cx="198" cy="228" r="4.5" fill="#f43f5e" />

          {/* Feet */}
          <ellipse cx="162" cy="275" rx="19" ry="12" fill="url(#bodyPearl)" stroke="#94a3b8" strokeWidth="2" />
          <ellipse cx="218" cy="275" rx="19" ry="12" fill="url(#bodyPearl)" stroke="#94a3b8" strokeWidth="2" />

          {/* Antenna */}
          <line x1="190" y1="92" x2="190" y2="68" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
          <circle cx="190" cy="63" r="10" fill={isPassword ? '#38bdf8' : '#f43f5e'} stroke={isPassword ? '#0284c7' : '#be123c'} strokeWidth="2" className="transition-colors duration-300" />
          <circle cx="187" cy="60" r="3.5" fill="#ffffff" opacity="0.9" />

          {/* Ears / Headphone Cushions */}
          <rect x="114" y="118" width="13" height="36" rx="6.5" fill="url(#earAccent)" stroke="#0369a1" strokeWidth="1.5" />
          <rect x="253" y="118" width="13" height="36" rx="6.5" fill="url(#earAccent)" stroke="#0369a1" strokeWidth="1.5" />

          {/* Head */}
          <rect
            x="122"
            y="88"
            width="136"
            height="102"
            rx="46"
            fill="url(#bodyPearl)"
            stroke="#94a3b8"
            strokeWidth="3"
          />

          {/* Visor Glass Face */}
          <rect
            x="134"
            y="98"
            width="112"
            height="78"
            rx="34"
            fill="url(#visorScreen)"
            stroke="#0f172a"
            strokeWidth="2"
          />

          {/* Visor Specular Reflection */}
          <path
            d="M146 106 C166 100, 214 100, 234 106 C226 112, 154 112, 146 106 Z"
            fill="#ffffff"
            opacity="0.22"
          />

          {/* Cyan Glow Eyes (Dynamic based on state) */}
          {isPassword ? (
            /* Peeking / Shy Eyes when password is active */
            <g className="transition-all duration-300">
              <path d="M160 138 Q166 132 172 138" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M208 138 Q214 132 220 138" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" fill="none" />
              {/* Little padlock icon in center */}
              <rect x="186" y="128" width="8" height="7" rx="1.5" fill="#fbbf24" />
              <path d="M188 128 V125 A2 2 0 0 1 192 125 V128" stroke="#fbbf24" strokeWidth="1.5" fill="none" />
            </g>
          ) : isEmail ? (
            /* Looking down attentively */
            <g className="transition-all duration-300">
              <ellipse cx="166" cy="142" rx="4.5" ry="6.5" fill="#38bdf8" />
              <ellipse cx="214" cy="142" rx="4.5" ry="6.5" fill="#38bdf8" />
              <circle cx="165" cy="140" r="1.5" fill="#ffffff" />
              <circle cx="213" cy="140" r="1.5" fill="#ffffff" />
            </g>
          ) : (
            /* Happy Curved Eyes with Blink */
            <g className="mascot-eye-blink">
              <path
                d="M158 138 C158 125, 174 125, 174 138"
                stroke="#38bdf8"
                strokeWidth="5.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M206 138 C206 125, 222 125, 222 138"
                stroke="#38bdf8"
                strokeWidth="5.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}

          {/* Cute Rosy Cheeks */}
          <ellipse cx="152" cy="150" rx="7.5" ry="4.5" fill="#fb7185" opacity={isPassword ? 0.9 : 0.75} />
          <ellipse cx="228" cy="150" rx="7.5" ry="4.5" fill="#fb7185" opacity={isPassword ? 0.9 : 0.75} />

          {/* Cute Little Smile */}
          <path
            d={isPassword ? "M186 150 Q190 146 194 150" : "M184 150 Q190 156 196 150"}
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Left Waving Hand / Shy Hand */}
          {isPassword ? (
            <g className="transition-all duration-300">
              <path
                d="M136 190 C120 170, 134 140, 150 142"
                stroke="#94a3b8"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <circle cx="150" cy="142" r="9" fill="url(#bodyPearl)" stroke="#94a3b8" strokeWidth="2" />
            </g>
          ) : (
            <g className="mascot-wave-hand">
              <path
                d="M132 195 C114 185, 96 162, 102 145 C107 134, 120 142, 124 154 C126 162, 136 186, 138 195"
                fill="url(#bodyPearl)"
                stroke="#94a3b8"
                strokeWidth="2"
              />
              <circle cx="102" cy="144" r="10" fill="url(#bodyPearl)" stroke="#94a3b8" strokeWidth="2" />
            </g>
          )}

          {/* Right Arm Holding the Welcome Sign */}
          <path
            d="M246 195 C260 200, 276 210, 280 228"
            stroke="#94a3b8"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <circle cx="282" cy="228" r="9" fill="url(#bodyPearl)" stroke="#94a3b8" strokeWidth="2" />

          {/* Welcome Board ("Xin chào! 👋 Quản trị viên OMS") */}
          <g transform="translate(232, 154) rotate(7)">
            {/* Board Stick */}
            <line x1="50" y1="46" x2="50" y2="90" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
            
            {/* Board Background */}
            <rect
              x="0"
              y="0"
              width="155"
              height="58"
              rx="10"
              fill="url(#boardGrad)"
              stroke="#38bdf8"
              strokeWidth="2.5"
            />
            {/* Board Top Accent Bar */}
            <line x1="8" y1="5" x2="147" y2="5" stroke="#38bdf8" strokeWidth="2" opacity="0.8" />

            {/* Glowing Dot Badge */}
            <circle cx="16" cy="20" r="4.5" fill="#38bdf8" />
            <circle cx="16" cy="20" r="2" fill="#ffffff" />

            {/* Main Greeting Text */}
            <text
              x="26"
              y="25"
              fill="#ffffff"
              fontSize="14.5"
              fontWeight="800"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="0.2px"
            >
              Xin chào! 👋
            </text>

            {/* Subtitle Text */}
            <text
              x="14"
              y="45"
              fill="#38bdf8"
              fontSize="11.5"
              fontWeight="700"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="0.3px"
            >
              Quản trị viên OMS
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
