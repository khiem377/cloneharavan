import React, { useId } from 'react';

/**
 * Step 2: AERO BOT - MENU QUẢN TRỊ SIDEBAR (47 Phân hệ)
 * - Cùng nhân vật: Robot AI trợ lý (vỏ ceramic trắng, khớp từ tính, kính visor đen bóng)
 * - Tư thế: Bay lượn nghiêng người 45° về bên trái với luồng phản lực mini
 * - Biểu cảm: Mắt cười vầng trăng khuyết (^ ^) cực kỳ thân thiện
 * - Đạo cụ: Tay phải cầm biểu tượng danh mục 3 tầng phát sáng
 * - Chỉ tay: Cánh tay trái vươn dài với ngón trỏ CHỈ DỨT KHOÁT SANG BÊN TRÁI VÀO SIDEBAR
 * - Animation: Cánh tay nảy nhịp nhàng chỉ sang trái (@keyframes botPointLeft)
 */
export default function MascotStepSidebar({ size = 110, className = '' }) {
  const uid = useId().replace(/:/g, '_');
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}>
      <svg
        viewBox="0 0 160 160"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          <radialGradient id={`glow_${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#0ea5e9" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`bodyGrad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id={`visorGrad_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="40%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <filter id={`dropGlow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <style>{`
          @keyframes botPointLeft {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(-9px); }
          }
          @keyframes botHoverTilt {
            0%, 100% { transform: translateY(0) rotate(-6deg); }
            50% { transform: translateY(-5px) rotate(-8deg); }
          }
          @keyframes jetFlame {
            0%, 100% { transform: scaleY(1); opacity: 0.85; }
            50% { transform: scaleY(1.35); opacity: 1; }
          }
          .anim-bot-point-left {
            animation: botPointLeft 1.3s ease-in-out infinite;
          }
          .anim-bot-tilt {
            transform-origin: 90px 100px;
            animation: botHoverTilt 2.2s ease-in-out infinite;
          }
          .anim-jet {
            transform-origin: 104px 132px;
            animation: jetFlame 0.4s ease-in-out infinite alternate;
          }
        `}</style>

        {/* Ambient Glow */}
        <circle cx="85" cy="80" r="56" fill={`url(#glow_${uid})`} />

        {/* Main Robot Body in 3/4 Flight Angle */}
        <g className="anim-bot-tilt">
          {/* Angled Jet Flame */}
          <g className="anim-jet">
            <path d="M96 130L105 152L112 130Z" fill="#38bdf8" filter={`url(#dropGlow_${uid})`} />
            <path d="M100 130L105 146L109 130Z" fill="#ffffff" />
          </g>

          {/* Torso Capsule (Leaning Left) */}
          <path
            d="M78 94C76 86 84 82 94 84C104 86 110 92 108 100L102 120C100 126 92 128 82 126C72 124 72 116 74 110L78 94Z"
            fill={`url(#bodyGrad_${uid})`}
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
          {/* Status Badge */}
          <circle cx="91" cy="106" r="3.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
          <circle cx="91" cy="106" r="1.8" fill="#38bdf8" filter={`url(#dropGlow_${uid})`} />

          {/* Magnetic Neck Gap */}
          <ellipse cx="94" cy="83" rx="14" ry="4" fill="#334155" transform="rotate(-6 94 83)" />

          {/* Top Antenna */}
          <rect x="91" y="21" width="3" height="12" rx="1.5" fill="#64748b" transform="rotate(-6 92 27)" />
          <circle cx="93" cy="19" r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" filter={`url(#dropGlow_${uid})`} />

          {/* Robot Head Capsule (Tilted toward Sidebar) */}
          <rect
            x="58"
            y="29"
            width="72"
            height="52"
            rx="22"
            fill={`url(#bodyGrad_${uid})`}
            stroke="#94a3b8"
            strokeWidth="1.5"
            transform="rotate(-6 94 55)"
          />

          {/* Ear Earcups */}
          <g transform="rotate(-6 94 55)">
            <rect x="52" y="41" width="7" height="26" rx="3.5" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
            <circle cx="55.5" cy="54" r="2" fill="#38bdf8" />
            <rect x="129" y="41" width="7" height="26" rx="3.5" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
            <circle cx="132.5" cy="54" r="2" fill="#38bdf8" />
          </g>

          {/* Face Visor */}
          <rect
            x="65"
            y="36"
            width="58"
            height="38"
            rx="15"
            fill={`url(#visorGrad_${uid})`}
            stroke="#1e293b"
            strokeWidth="1.5"
            transform="rotate(-6 94 55)"
          />

          {/* Friendly Smiling Eyes (^ ^) */}
          <g stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter={`url(#dropGlow_${uid})`}>
            {/* Left Eye ^ */}
            <path d="M78 55L83 50L88 55" />
            {/* Right Eye ^ */}
            <path d="M102 53L107 48L112 53" />
          </g>
          {/* Cheerful Smile */}
          <path d="M91 63C93 66 99 65 101 62" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />

          {/* Right Hand: Holding Floating 3-layer Hologram Menu Icon */}
          <g transform="translate(118, 86)">
            <circle cx="10" cy="12" r="8" fill={`url(#bodyGrad_${uid})`} stroke="#94a3b8" strokeWidth="1.5" />
            {/* Hologram Menu Bars */}
            <g filter={`url(#dropGlow_${uid})`}>
              <rect x="8" y="-2" width="16" height="3" rx="1.5" fill="#38bdf8" />
              <rect x="8" y="3" width="12" height="3" rx="1.5" fill="#38bdf8" />
              <rect x="8" y="8" width="16" height="3" rx="1.5" fill="#38bdf8" />
            </g>
          </g>
        </g>

        {/* Left Hand: EXTENDED FAR TO THE LEFT & POINTING DIRECTLY AT SIDEBAR */}
        <g className="anim-bot-point-left">
          {/* Arm Beam stretching left */}
          <path
            d="M74 94C58 92 44 88 30 84"
            stroke="#cbd5e1"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Hand Palm */}
          <circle cx="26" cy="83" r="8" fill={`url(#bodyGrad_${uid})`} stroke="#94a3b8" strokeWidth="1.5" />
          {/* Folded fingers */}
          <circle cx="27" cy="78" r="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="28" cy="88" r="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />

          {/* EXTENDED POINTING FINGER (Pointing straight left to Sidebar) */}
          <rect x="6" y="80" width="22" height="6" rx="3" fill={`url(#bodyGrad_${uid})`} stroke="#94a3b8" strokeWidth="1.5" />
          {/* Laser Glow at Fingertip */}
          <circle cx="6" cy="83" r="3.5" fill="#38bdf8" filter={`url(#dropGlow_${uid})`} />
          <circle cx="6" cy="83" r="1.5" fill="#ffffff" />

          {/* Leftward Pointing Energy Arrows */}
          <path d="M-2 80L-7 83L-2 86" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M-8 80L-13 83L-8 86" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
}
