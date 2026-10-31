import React, { useId } from 'react';

/**
 * Step 5: AERO BOT - KHU VỰC LÀM VIỆC TẬP TRUNG (Workspace & Tables)
 * - Cùng nhân vật: Robot AI trợ lý (vỏ ceramic trắng, khớp từ tính, kính visor đen bóng)
 * - Tư thế: Bay lơ lửng, cúi nhìn xuống dưới với biểu cảm kỹ sư dữ liệu thông thái
 * - Biểu cảm: Mắt kính HUD phân tích (- -) tập trung xử lý bảng biểu
 * - Đạo cụ: Tay trái ôm bảng điện tử tablet hiển thị biểu đồ phân tích
 * - Chỉ tay: Tay phải cầm bút stylus laser CHỈ THẲNG XUỐNG DƯỚI VÀO BẢNG DỮ LIỆU
 * - Animation: Bút laser nảy nhịp nhàng chỉ thẳng xuống dưới (@keyframes botPointDown)
 */
export default function MascotStepWorkspace({ size = 110, className = '' }) {
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
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.15" />
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
          @keyframes botPointDown {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(8px); }
          }
          @keyframes botHoverHigh {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes laserPulse {
            0%, 100% { opacity: 0.8; filter: drop-shadow(0 0 4px #10b981); }
            50% { opacity: 1; filter: drop-shadow(0 0 8px #34d399); }
          }
          .anim-bot-point-down {
            animation: botPointDown 1.3s ease-in-out infinite;
          }
          .anim-bot-hover-high {
            animation: botHoverHigh 2.4s ease-in-out infinite;
          }
          .anim-laser {
            animation: laserPulse 1s ease-in-out infinite alternate;
          }
        `}</style>

        {/* Ambient Glow */}
        <circle cx="80" cy="80" r="56" fill={`url(#glow_${uid})`} />

        {/* Floating Thruster Base */}
        <g className="anim-bot-hover-high">
          <ellipse cx="80" cy="130" rx="18" ry="4.5" fill="#10b981" opacity="0.35" filter={`url(#dropGlow_${uid})`} />
          <ellipse cx="80" cy="128" rx="12" ry="3" fill="#059669" opacity="0.7" />
          <ellipse cx="80" cy="126" rx="6" ry="1.8" fill="#a7f3d0" />
        </g>

        {/* Main Floating Robot Body & Head */}
        <g className="anim-bot-hover-high">
          {/* Torso Capsule */}
          <path
            d="M62 90C62 82 70 78 80 78C90 78 98 82 98 90V110C98 116 90 120 80 120C70 120 62 116 62 110V90Z"
            fill={`url(#bodyGrad_${uid})`}
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
          {/* Status Badge */}
          <rect x="74" y="90" width="12" height="12" rx="3" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
          <circle cx="80" cy="96" r="2.5" fill="#10b981" filter={`url(#dropGlow_${uid})`} />

          {/* Magnetic Neck Gap */}
          <ellipse cx="80" cy="78" rx="14" ry="4" fill="#334155" />

          {/* Top Antenna */}
          <rect x="78.5" y="16" width="3" height="12" rx="1.5" fill="#64748b" />
          <circle cx="80" cy="14" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" filter={`url(#dropGlow_${uid})`} />

          {/* Robot Head Capsule */}
          <rect
            x="44"
            y="24"
            width="72"
            height="52"
            rx="22"
            fill={`url(#bodyGrad_${uid})`}
            stroke="#94a3b8"
            strokeWidth="1.5"
          />

          {/* Ear Earcups */}
          <rect x="38" y="36" width="7" height="26" rx="3.5" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="41.5" cy="49" r="2" fill="#10b981" />
          <rect x="115" y="36" width="7" height="26" rx="3.5" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="118.5" cy="49" r="2" fill="#10b981" />

          {/* Face Visor */}
          <rect
            x="51"
            y="31"
            width="58"
            height="38"
            rx="15"
            fill={`url(#visorGrad_${uid})`}
            stroke="#1e293b"
            strokeWidth="1.5"
          />
          <path
            d="M56 36C62 34 74 33 84 33C94 33 100 34 104 36"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.45"
          />

          {/* Focused Analytical Smart Eyes (Looking Downwards at Workspace) */}
          <g filter={`url(#dropGlow_${uid})`}>
            {/* Left Eye: Focused slit looking down */}
            <rect x="63" y="52" width="10" height="4" rx="2" fill="#34d399" />
            <circle cx="68" cy="54" r="1.5" fill="#ffffff" />
            {/* Right Eye: Focused slit looking down */}
            <rect x="87" y="52" width="10" height="4" rx="2" fill="#34d399" />
            <circle cx="92" cy="54" r="1.5" fill="#ffffff" />
          </g>

          {/* Confident Smile */}
          <path d="M75 62C77 64 83 64 85 62" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" />

          {/* Left Hand: Holding Futuristic Tablet with Mini Data Charts */}
          <g transform="translate(30, 80)">
            <circle cx="14" cy="18" r="8" fill={`url(#bodyGrad_${uid})`} stroke="#94a3b8" strokeWidth="1.5" />
            {/* Holographic Tablet Screen */}
            <rect x="-6" y="4" width="24" height="30" rx="3" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" filter={`url(#dropGlow_${uid})`} />
            {/* Mini Bar Chart lines */}
            <rect x="-2" y="24" width="3" height="6" fill="#34d399" />
            <rect x="3" y="18" width="3" height="12" fill="#10b981" />
            <rect x="8" y="12" width="3" height="18" fill="#38bdf8" />
          </g>
        </g>

        {/* Right Hand: HOLDING TECH STYLUS / LASER POINTER & POINTING STRAIGHT DOWN */}
        <g className="anim-bot-point-down">
          {/* Arm Beam heading downwards */}
          <path
            d="M97 90C108 96 116 108 120 120"
            stroke="#cbd5e1"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Hand Palm */}
          <circle cx="120" cy="124" r="8" fill={`url(#bodyGrad_${uid})`} stroke="#94a3b8" strokeWidth="1.5" />
          {/* Folded fingers */}
          <circle cx="115" cy="126" r="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="116" cy="120" r="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />

          {/* TECH STYLUS / LASER POINTER (Pointing Straight Down to Workspace) */}
          <rect x="123" y="116" width="5" height="28" rx="2.5" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
          <path d="M123 144L125.5 152L128 144Z" fill="#10b981" />

          {/* Laser Pointer Beam Tip & Glow */}
          <g className="anim-laser">
            <circle cx="125.5" cy="154" r="4" fill="#34d399" filter={`url(#dropGlow_${uid})`} />
            <circle cx="125.5" cy="154" r="1.5" fill="#ffffff" />
            {/* Downward Energy Arrows */}
            <path d="M122 160L125.5 165L129 160" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
      </svg>
    </div>
  );
}
