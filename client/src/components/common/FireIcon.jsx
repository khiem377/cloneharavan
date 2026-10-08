/**
 * FireIcon — CSS animated flame
 * Không dùng emoji, không dùng GIF, thuần CSS keyframe
 * 3 lớp flame chuyển động lệch phase nhau tạo hiệu ứng bùng cháy
 */
export default function FireIcon({ size = 16, className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{ display: 'inline-flex', alignItems: 'flex-end', width: size, height: size * 1.3 }}
    >
      <style>{`
        @keyframes fireBase {
          0%, 100% { transform: scaleY(1) scaleX(1) translateY(0); }
          25%       { transform: scaleY(1.06) scaleX(0.97) translateY(-1px); }
          50%       { transform: scaleY(0.96) scaleX(1.03) translateY(0px); }
          75%       { transform: scaleY(1.04) scaleX(0.98) translateY(-0.5px); }
        }
        @keyframes fireMid {
          0%, 100% { transform: scaleY(1) skewX(0deg); opacity: 0.92; }
          33%       { transform: scaleY(1.1) skewX(-3deg); opacity: 1; }
          66%       { transform: scaleY(0.93) skewX(2deg); opacity: 0.88; }
        }
        @keyframes fireTip {
          0%, 100% { transform: scaleY(1) skewX(0deg) translateX(0); opacity: 0.85; }
          40%       { transform: scaleY(1.15) skewX(-4deg) translateX(-0.5px); opacity: 1; }
          70%       { transform: scaleY(0.9) skewX(3deg) translateX(0.5px); opacity: 0.8; }
        }
      `}</style>
      <svg
        viewBox="0 0 20 28"
        width={size}
        height={size * 1.3}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transformOrigin: 'bottom center', animation: 'fireBase 0.7s ease-in-out infinite' }}
      >
        {/* Lớp ngoài — vàng sáng */}
        <path
          d="M10 1C10 1 17 9 17 16C17 21.5 14 24.5 10 25.5C6 24.5 3 21.5 3 16C3 9 10 1 10 1Z"
          fill="#FBBF24"
          style={{ animation: 'fireMid 0.55s ease-in-out infinite', transformOrigin: '10px 25px' }}
        />
        {/* Lớp giữa — cam đậm */}
        <path
          d="M10 8C10 8 15 14 15 19C15 22.5 12.8 24.5 10 25C7.2 24.5 5 22.5 5 19C5 14 10 8 10 8Z"
          fill="#F97316"
          style={{ animation: 'fireMid 0.65s ease-in-out infinite reverse', transformOrigin: '10px 25px' }}
        />
        {/* Lớp trong — đỏ */}
        <path
          d="M10 14C10 14 13 18 13 21.5C13 23.5 11.7 25 10 25.3C8.3 25 7 23.5 7 21.5C7 18 10 14 10 14Z"
          fill="#DC2626"
          style={{ animation: 'fireTip 0.45s ease-in-out infinite', transformOrigin: '10px 25px' }}
        />
        {/* Hot core — trắng vàng */}
        <ellipse
          cx="10" cy="23.5" rx="2.2" ry="1.4"
          fill="#FEF9C3"
          opacity="0.7"
        />
      </svg>
    </span>
  );
}
