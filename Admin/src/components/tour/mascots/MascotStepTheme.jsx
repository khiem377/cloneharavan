import React, { useId } from 'react';

/**
 * Step 4: AERO BOT - GIAO DIỆN SÁNG / TỐI (Theme Toggle)
 * - Cùng nhân vật: Robot AI trợ lý (vỏ ceramic trắng, khớp từ tính, kính visor đen bóng)
 * - Tư thế: Nghiêng đầu tự tin, đeo kính râm phân cực 2 màu Ngày & Đêm
 * - Biểu cảm: Mắt nháy tinh nghịch (^ ~) cực ngầu
 * - Đạo cụ: Tay trái nâng quả cầu năng lượng âm-dương (nửa Mặt Trời vàng, nửa Mặt Trăng tím)
 * - Chỉ tay: Cánh tay phải vươn ngang CHỈ THẲNG SANG PHẢI VÀO NÚT CHUYỂN THEME
 * - Animation: Cánh tay nảy nhịp nhàng sang bên phải (@keyframes botPointRight)
 */
export default function MascotStepTheme({ size = 110, className = '' }) {
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
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.15" />
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
          @keyframes botPointRight {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(9px); }
          }
          @keyframes botHover {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes orbSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .anim-bot-point-right {
            animation: botPointRight 1.3s ease-in-out infinite;
          }
          .anim-bot-hover {
            animation: botHover 2.4s ease-in-out infinite;
          }
          .anim-orb-spin {
            transform-origin: 34px 104px;
            animation: orbSpin 4s linear infinite;
          }
        `}</style>

        {/* Ambient Glow */}
        <circle cx="80" cy="85" r="56" fill={`url(#glow_${uid})`} />

        {/* Floating Thruster Base */}
        <g className="anim-bot-hover">
          <ellipse cx="80" cy="138" rx="18" ry="4.5" fill="#818cf8" opacity="0.35" filter={`url(#dropGlow_${uid})`} />
          <ellipse cx="80" cy="136" rx="12" ry="3" fill="#6366f1" opacity="0.7" />
          <ellipse cx="80" cy="134" rx="6" ry="1.8" fill="#c7d2fe" />
        </g>

        {/* Main Floating Robot Body & Head */}
        <g className="anim-bot-hover">
          {/* Torso Capsule */}
          <path
            d="M62 98C62 90 70 86 80 86C90 86 98 90 98 98V118C98 124 90 128 80 128C70 128 62 124 62 118V98Z"
            fill={`url(#bodyGrad_${uid})`}
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
          {/* Status Badge */}
          <rect x="74" y="98" width="12" height="12" rx="3" fill="#0f172a" stroke="#818cf8" strokeWidth="1" />
          <circle cx="80" cy="104" r="2.5" fill="#818cf8" filter={`url(#dropGlow_${uid})`} />

          {/* Magnetic Neck Gap */}
          <ellipse cx="80" cy="86" rx="14" ry="4" fill="#334155" />

          {/* Top Antenna */}
          <rect x="78.5" y="24" width="3" height="12" rx="1.5" fill="#64748b" />
          <circle cx="80" cy="22" r="5" fill="#818cf8" stroke="#ffffff" strokeWidth="1.5" filter={`url(#dropGlow_${uid})`} />

          {/* Robot Head Capsule */}
          <rect
            x="44"
            y="32"
            width="72"
            height="52"
            rx="22"
            fill={`url(#bodyGrad_${uid})`}
            stroke="#94a3b8"
            strokeWidth="1.5"
          />

          {/* Ear Earcups */}
          <rect x="38" y="44" width="7" height="26" rx="3.5" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="41.5" cy="57" r="2" fill="#f59e0b" />
          <rect x="115" y="44" width="7" height="26" rx="3.5" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="118.5" cy="57" r="2" fill="#818cf8" />

          {/* Face Visor */}
          <rect
            x="51"
            y="39"
            width="58"
            height="38"
            rx="15"
            fill={`url(#visorGrad_${uid})`}
            stroke="#1e293b"
            strokeWidth="1.5"
          />

          {/* Dual-tint Cyber Glasses Frame over Visor */}
          <g filter={`url(#dropGlow_${uid})`}>
            {/* Left Lens (Warm Sun Amber) */}
            <rect x="56" y="46" width="21" height="16" rx="5" fill="#f59e0b" fillOpacity="0.4" stroke="#f59e0b" strokeWidth="1.5" />
            {/* Right Lens (Cool Moon Indigo) */}
            <rect x="83" y="46" width="21" height="16" rx="5" fill="#818cf8" fillOpacity="0.4" stroke="#818cf8" strokeWidth="1.5" />
            {/* Bridge */}
            <line x1="77" y1="52" x2="83" y2="52" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Winking Eyes Expression inside Sunglasses */}
          {/* Left Eye: Open curious curved arc */}
          <circle cx="66" cy="54" r="3.5" fill="#fbbf24" filter={`url(#dropGlow_${uid})`} />
          <circle cx="65" cy="53" r="1.2" fill="#ffffff" />
          {/* Right Eye: Playful Wink (~) */}
          <path d="M89 54C91 51 97 51 99 54" stroke="#c7d2fe" strokeWidth="2.5" strokeLinecap="round" filter={`url(#dropGlow_${uid})`} />

          {/* Cool Smirk */}
          <path d="M76 66C78 68 85 68 87 65" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />

          {/* Left Hand: Floating Dual-Energy Orb (Day & Night) */}
          <g>
            <circle cx="34" cy="104" r="8" fill={`url(#bodyGrad_${uid})`} stroke="#94a3b8" strokeWidth="1.5" />
            <g className="anim-orb-spin">
              {/* Half Sun (Gold) */}
              <path d="M34 94A10 10 0 0 1 34 114Z" fill="#f59e0b" filter={`url(#dropGlow_${uid})`} />
              {/* Half Moon (Indigo) */}
              <path d="M34 114A10 10 0 0 1 34 94Z" fill="#6366f1" filter={`url(#dropGlow_${uid})`} />
              <circle cx="34" cy="104" r="2.5" fill="#ffffff" />
            </g>
          </g>
        </g>

        {/* Right Hand: EXTENDED STRAIGHT TO THE RIGHT & POINTING DIRECTLY AT THEME TOGGLE */}
        <g className="anim-bot-point-right">
          {/* Arm Beam stretching right */}
          <path
            d="M96 98C110 96 122 92 134 86"
            stroke="#cbd5e1"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Hand Palm */}
          <circle cx="138" cy="85" r="8" fill={`url(#bodyGrad_${uid})`} stroke="#94a3b8" strokeWidth="1.5" />
          {/* Folded fingers */}
          <circle cx="137" cy="80" r="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="136" cy="90" r="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />

          {/* EXTENDED POINTING FINGER (Pointing straight right to Theme Toggle) */}
          <rect x="136" y="82" width="22" height="6" rx="3" fill={`url(#bodyGrad_${uid})`} stroke="#94a3b8" strokeWidth="1.5" />
          {/* Laser Glow at Fingertip */}
          <circle cx="158" cy="85" r="3.5" fill="#818cf8" filter={`url(#dropGlow_${uid})`} />
          <circle cx="158" cy="85" r="1.5" fill="#ffffff" />

          {/* Rightward Pointing Energy Arrows */}
          <path d="M164 82L169 85L164 88" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}
