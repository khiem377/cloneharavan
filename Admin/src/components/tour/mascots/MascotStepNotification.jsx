import React, { useId } from 'react';

/**
 * Step 3: AERO BOT - TRUNG TÂM THÔNG BÁO REALTIME (Notifications)
 * - Cùng nhân vật: Robot AI trợ lý (vỏ ceramic trắng, khớp từ tính, kính visor đen bóng)
 * - Tư thế: Trôi nổi cảnh giác, ăng-ten trên đầu nhấp nháy đèn còi vàng/đỏ
 * - Biểu cảm: Mắt tròn xoe (O O) mở to chú ý khi có tin báo mới
 * - Đạo cụ: Tay trái cầm chuông vàng rung rinh phát sóng âm
 * - Chỉ tay: Cánh tay phải vươn cao CHỈ XÉO LÊN GÓC TRÊN BÊN PHẢI VÀO CHUÔNG THÔNG BÁO
 * - Animation: Tay nảy nhịp nhàng chỉ góc 45° lên trên bên phải (@keyframes botPointUpRight)
 */
export default function MascotStepNotification({ size = 110, className = '' }) {
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
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.15" />
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
          @keyframes botPointUpRight {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(5px, -7px); }
          }
          @keyframes botFloatAlert {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes beaconFlash {
            0%, 100% { fill: #ef4444; filter: drop-shadow(0 0 5px #ef4444); }
            50% { fill: #f59e0b; filter: drop-shadow(0 0 8px #f59e0b); }
          }
          @keyframes bellShake {
            0%, 100% { transform: rotate(-12deg); }
            50% { transform: rotate(12deg); }
          }
          .anim-bot-point-upright {
            animation: botPointUpRight 1.3s ease-in-out infinite;
          }
          .anim-bot-alert {
            animation: botFloatAlert 2.2s ease-in-out infinite;
          }
          .anim-beacon {
            animation: beaconFlash 0.7s ease-in-out infinite alternate;
          }
          .anim-bell {
            transform-origin: 34px 100px;
            animation: bellShake 0.6s ease-in-out infinite;
          }
        `}</style>

        {/* Ambient Glow */}
        <circle cx="80" cy="85" r="56" fill={`url(#glow_${uid})`} />

        {/* Floating Thruster Base */}
        <g className="anim-bot-alert">
          <ellipse cx="80" cy="138" rx="18" ry="4.5" fill="#f59e0b" opacity="0.3" filter={`url(#dropGlow_${uid})`} />
          <ellipse cx="80" cy="136" rx="12" ry="3" fill="#38bdf8" opacity="0.7" />
          <ellipse cx="80" cy="134" rx="6" ry="1.8" fill="#bae6fd" />
        </g>

        {/* Main Floating Robot Body & Head */}
        <g className="anim-bot-alert">
          {/* Torso Capsule */}
          <path
            d="M62 98C62 90 70 86 80 86C90 86 98 90 98 98V118C98 124 90 128 80 128C70 128 62 124 62 118V98Z"
            fill={`url(#bodyGrad_${uid})`}
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
          {/* Status Badge */}
          <rect x="74" y="98" width="12" height="12" rx="3" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
          <circle cx="80" cy="104" r="2.5" fill="#f59e0b" filter={`url(#dropGlow_${uid})`} />

          {/* Magnetic Neck Gap */}
          <ellipse cx="80" cy="86" rx="14" ry="4" fill="#334155" />

          {/* Top Antenna with Alert Flashing Siren Beacon */}
          <rect x="78.5" y="24" width="3" height="12" rx="1.5" fill="#64748b" />
          <circle cx="80" cy="21" r="5.5" className="anim-beacon" stroke="#ffffff" strokeWidth="1.5" />

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
          <circle cx="118.5" cy="57" r="2" fill="#f59e0b" />

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
          <path
            d="M56 44C62 42 74 41 84 41C94 41 100 42 104 44"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.45"
          />

          {/* Alert Wide Round Eyes (O O) */}
          <g fill="#38bdf8" filter={`url(#dropGlow_${uid})`}>
            {/* Left Round Eye */}
            <circle cx="68" cy="56" r="7" stroke="#38bdf8" strokeWidth="2" fill="#0f172a" />
            <circle cx="68" cy="56" r="3.5" fill="#38bdf8" />
            <circle cx="66.5" cy="54.5" r="1.2" fill="#ffffff" />

            {/* Right Round Eye */}
            <circle cx="92" cy="56" r="7" stroke="#38bdf8" strokeWidth="2" fill="#0f172a" />
            <circle cx="92" cy="56" r="3.5" fill="#38bdf8" />
            <circle cx="90.5" cy="54.5" r="1.2" fill="#ffffff" />
          </g>

          {/* Curious Small 'o' Mouth */}
          <circle cx="80" cy="67" r="2.2" stroke="#38bdf8" strokeWidth="1.5" fill="none" />

          {/* Left Hand: Holding Ringing Golden Bell with Sound Waves */}
          <g className="anim-bell">
            <circle cx="34" cy="100" r="8" fill={`url(#bodyGrad_${uid})`} stroke="#94a3b8" strokeWidth="1.5" />
            {/* Golden Bell */}
            <path
              d="M34 94C31 94 28 97 28 102H40C40 97 37 94 34 94Z"
              fill="#f59e0b"
              stroke="#b45309"
              strokeWidth="1"
            />
            <circle cx="34" cy="104" r="1.5" fill="#b45309" />
            {/* Sound Wave Arcs */}
            <path d="M25 96C23 99 23 103 25 106" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M21 93C18 98 18 107 21 110" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          </g>
        </g>

        {/* Right Hand: EXTENDED DIAGONALLY UP-RIGHT & POINTING DIRECTLY AT NOTIFICATIONS BELL */}
        <g className="anim-bot-point-upright">
          {/* Arm Beam */}
          <path
            d="M96 98C108 92 120 78 126 62"
            stroke="#cbd5e1"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Hand Palm */}
          <circle cx="127" cy="58" r="8" fill={`url(#bodyGrad_${uid})`} stroke="#94a3b8" strokeWidth="1.5" />
          {/* Folded fingers */}
          <circle cx="124" cy="65" r="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="129" cy="67" r="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />

          {/* EXTENDED POINTING FINGER (Pointing diagonally Up-Right 45° to notification bell) */}
          <g transform="translate(127, 58) rotate(35)">
            <rect x="-3" y="-24" width="6" height="24" rx="3" fill={`url(#bodyGrad_${uid})`} stroke="#94a3b8" strokeWidth="1.5" />
            {/* Laser Glow at Fingertip */}
            <circle cx="0" cy="-24" r="3.5" fill="#f59e0b" filter={`url(#dropGlow_${uid})`} />
            <circle cx="0" cy="-24" r="1.5" fill="#ffffff" />
            {/* Pointing Arrows */}
            <path d="M-3 -33L0 -38L3 -33" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
      </svg>
    </div>
  );
}
