import React, { useId } from 'react';

/**
 * Step 1: AERO BOT - TÌM KIẾM NHANH (Ctrl + K)
 * - Nhân vật: Robot AI trợ lý hiện đại (vỏ ceramic trắng, khớp từ tính, kính visor đen bóng)
 * - Tư thế: Nghiêng người ngước nhìn lên trên với đôi mắt sao lấp lánh (* *)
 * - Đạo cụ: Tay trái cầm kính lúp hologram phát quang
 * - Chỉ tay: Cánh tay phải vươn cao với ngón trỏ CHỈ THẲNG LÊN TRÊN VÀO THANH TÌM KIẾM
 * - Animation: Ngón tay nảy nhịp nhàng chỉ thẳng lên trên (@keyframes robotPointUp)
 */
export default function MascotStepSearch({ size = 110, className = '' }) {
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
          <linearGradient id={`cyanGlow_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <filter id={`dropGlow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <style>{`
          @keyframes botPointUp {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          @keyframes botHover {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes starTwinkle {
            0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.95; }
            50% { transform: scale(1.18) rotate(45deg); opacity: 1; }
          }
          .anim-bot-point-up {
            animation: botPointUp 1.3s ease-in-out infinite;
          }
          .anim-bot-hover {
            animation: botHover 2.4s ease-in-out infinite;
          }
          .anim-star-twinkle {
            transform-origin: center;
            animation: starTwinkle 2s ease-in-out infinite;
          }
        `}</style>

        {/* Ambient Glow */}
        <circle cx="80" cy="85" r="56" fill={`url(#glow_${uid})`} />

        {/* Floating Thruster Base & Energy Rings */}
        <g className="anim-bot-hover">
          <ellipse cx="80" cy="138" rx="20" ry="5" fill="#38bdf8" opacity="0.35" filter={`url(#dropGlow_${uid})`} />
          <ellipse cx="80" cy="136" rx="13" ry="3.5" fill="#0284c7" opacity="0.7" />
          <ellipse cx="80" cy="134" rx="7" ry="2" fill="#bae6fd" />
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
          {/* Torso Status LED Center Badge */}
          <rect x="74" y="98" width="12" height="12" rx="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
          <circle cx="80" cy="104" r="2.5" fill="#38bdf8" filter={`url(#dropGlow_${uid})`} />

          {/* Magnetic Neck Gap */}
          <ellipse cx="80" cy="86" rx="14" ry="4" fill="#334155" />

          {/* Top Antenna */}
          <rect x="78.5" y="24" width="3" height="12" rx="1.5" fill="#64748b" />
          <circle cx="80" cy="22" r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" filter={`url(#dropGlow_${uid})`} />

          {/* Robot Head Capsule (slightly tilted up) */}
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

          {/* Ear Earcups (Magnetic Headphone discs) */}
          <rect x="38" y="44" width="7" height="26" rx="3.5" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="41.5" cy="57" r="2" fill="#38bdf8" />
          <rect x="115" y="44" width="7" height="26" rx="3.5" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="118.5" cy="57" r="2" fill="#38bdf8" />

          {/* Face Visor (Glossy Dark Curved Glass Screen) */}
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
          {/* Glass Specular Reflection Highlight */}
          <path
            d="M56 44C62 42 74 41 84 41C94 41 100 42 104 44"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.45"
          />

          {/* Excited Starry Eyes (* *) Looking Up */}
          <g fill="#38bdf8" filter={`url(#dropGlow_${uid})`}>
            {/* Left Star Eye */}
            <g transform="translate(67, 56)" className="anim-star-twinkle">
              <path d="M0 -6L1.5 -1.5L6 0L1.5 1.5L0 6L-1.5 1.5L-6 0L-1.5 -1.5Z" />
              <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
            </g>
            {/* Right Star Eye */}
            <g transform="translate(93, 56)" className="anim-star-twinkle">
              <path d="M0 -6L1.5 -1.5L6 0L1.5 1.5L0 6L-1.5 1.5L-6 0L-1.5 -1.5Z" />
              <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
            </g>
          </g>
          {/* Cute Smile LED Arc */}
          <path d="M75 66C77 69 83 69 85 66" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />

          {/* Left Hand: Holding Floating Holographic Magnifying Glass */}
          <g transform="translate(32, 92)">
            {/* Floating robotic hand */}
            <circle cx="10" cy="14" r="8" fill={`url(#bodyGrad_${uid})`} stroke="#94a3b8" strokeWidth="1.5" />
            {/* Mini Magnifying glass prop */}
            <circle cx="2" cy="4" r="9" fill="#0284c7" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="2" filter={`url(#dropGlow_${uid})`} />
            <line x1="8" y1="10" x2="14" y2="16" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="2" cy="4" r="2.5" fill="#ffffff" />
          </g>
        </g>

        {/* Right Hand: EXTENDED HIGH UP & POINTING STRAIGHT UP (Active Keyframe Bouncing) */}
        <g className="anim-bot-point-up">
          {/* Arm Beam */}
          <path
            d="M97 94C108 86 118 72 122 55"
            stroke="#cbd5e1"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Hand Palm */}
          <circle cx="123" cy="48" r="8" fill={`url(#bodyGrad_${uid})`} stroke="#94a3b8" strokeWidth="1.5" />
          {/* Folded fingers */}
          <circle cx="127" cy="50" r="3.5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="126" cy="55" r="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
          {/* EXTENDED POINTING FINGER (Pointing straight up to Ctrl+K) */}
          <rect x="120" y="24" width="6" height="24" rx="3" fill={`url(#bodyGrad_${uid})`} stroke="#94a3b8" strokeWidth="1.5" />
          {/* Laser Glow at Fingertip */}
          <circle cx="123" cy="23" r="3.5" fill="#38bdf8" filter={`url(#dropGlow_${uid})`} />
          <circle cx="123" cy="23" r="1.5" fill="#ffffff" />
          {/* Upward Pointing Energy Arrows */}
          <path d="M120 14L123 9L126 14" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M118 7L123 1L128 7" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
}
