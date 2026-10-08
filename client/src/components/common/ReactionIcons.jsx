import React from 'react';

/**
 * ReactionIcons — Bộ Icon cảm xúc SVG vector tùy biến (Không dùng raw emoji hệ điều hành)
 * Chuẩn màu sắc và chi tiết sắc nét cho: like, love, haha, wow, sad, angry
 */

export function LikeIcon({ size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <circle cx="12" cy="12" r="11" fill="#1877F2" />
      <path
        d="M8.5 10.5V17H6.5C6.22386 17 6 16.7761 6 16.5V11C6 10.7239 6.22386 10.5 6.5 10.5H8.5ZM9.5 17H14.8872C15.5414 17 16.0963 16.5317 16.2085 15.8863L16.8172 12.3863C16.9602 11.5645 16.3275 10.8 15.4959 10.8H12.75V8.2C12.75 7.26112 11.9889 6.5 11.05 6.5C10.7029 6.5 10.4578 6.78657 10.3664 7.12155L9.5 10.3V17Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function LoveIcon({ size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <circle cx="12" cy="12" r="11" fill="#F02849" />
      <path
        d="M12 17.2L10.74 16.05C6.28 12.01 3.33 9.34 3.33 6.07C3.33 3.4 5.43 1.33 8.1 1.33C9.61 1.33 11.06 2.03 12 3.14C12.94 2.03 14.39 1.33 15.9 1.33C18.57 1.33 20.67 3.4 20.67 6.07C20.67 9.34 17.72 12.01 13.26 16.06L12 17.2Z"
        transform="translate(0, 0.5) scale(0.85) translate(2.1, 2.2)"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function HahaIcon({ size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <circle cx="12" cy="12" r="11" fill="#F7B125" />
      {/* Đôi mắt cười tít */}
      <path
        d="M6.5 9.5L8.5 8L10 9.5"
        stroke="#7A4B00"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 9.5L15.5 8L17.5 9.5"
        stroke="#7A4B00"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Miệng cười há to */}
      <path
        d="M7 12.5C7 15.5 9.24 17.5 12 17.5C14.76 17.5 17 15.5 17 12.5H7Z"
        fill="#7A4B00"
      />
      {/* Lưỡi hồng */}
      <path
        d="M9.5 16C10.2 16.7 11 17 12 17C13 17 13.8 16.7 14.5 16C14 15 13.1 14.3 12 14.3C10.9 14.3 10 15 9.5 16Z"
        fill="#F02849"
      />
    </svg>
  );
}

export function WowIcon({ size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <circle cx="12" cy="12" r="11" fill="#F7B125" />
      {/* Lông mày nhướng cao ngạc nhiên */}
      <path
        d="M6.5 6.8Q8.5 5.8 10.5 7"
        stroke="#7A4B00"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M13.5 7Q15.5 5.8 17.5 6.8"
        stroke="#7A4B00"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Đôi mắt mở to */}
      <ellipse cx="8.5" cy="9.8" rx="2" ry="3" fill="#7A4B00" />
      <ellipse cx="15.5" cy="9.8" rx="2" ry="3" fill="#7A4B00" />
      {/* Miệng tròn chữ O ngạc nhiên */}
      <ellipse cx="12" cy="15" rx="3" ry="4.2" fill="#7A4B00" />
    </svg>
  );
}

export function SadIcon({ size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <circle cx="12" cy="12" r="11" fill="#F7B125" />
      {/* Lông mày buồn cụp xuống */}
      <path
        d="M7 7.5Q8.5 8.5 10.5 7.5"
        stroke="#7A4B00"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M13.5 7.5Q15.5 8.5 17 7.5"
        stroke="#7A4B00"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Đôi mắt buồn */}
      <ellipse cx="8.5" cy="10.5" rx="1.8" ry="2.2" fill="#7A4B00" />
      <ellipse cx="15.5" cy="10.5" rx="1.8" ry="2.2" fill="#7A4B00" />
      {/* Giọt nước mắt xanh */}
      <path
        d="M17 12Q18.5 14 18.5 15.2C18.5 16.2 17.8 17 17 17C16.2 17 15.5 16.2 15.5 15.2Q15.5 14 17 12Z"
        fill="#1877F2"
      />
      {/* Miệng mếu cong xuống */}
      <path
        d="M9 16Q12 13.8 15 16"
        stroke="#7A4B00"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AngryIcon({ size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <circle cx="12" cy="12" r="11" fill="#E94F37" />
      {/* Lông mày cau lại giận dữ */}
      <path
        d="M6 7L10.5 9.5"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18 7L13.5 9.5"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Đôi mắt giận */}
      <circle cx="8.5" cy="11.5" r="1.8" fill="#FFFFFF" />
      <circle cx="15.5" cy="11.5" r="1.8" fill="#FFFFFF" />
      {/* Miệng mím giận dữ */}
      <path
        d="M8.5 17Q12 14.5 15.5 17"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const REACTION_SVG_MAP = {
  like:  { label: 'Thích',     color: 'text-blue-600',   Icon: LikeIcon },
  love:  { label: 'Yêu thích', color: 'text-rose-600',   Icon: LoveIcon },
  haha:  { label: 'Haha',      color: 'text-amber-500',  Icon: HahaIcon },
  wow:   { label: 'Wow',       color: 'text-amber-500',  Icon: WowIcon },
  sad:   { label: 'Buồn',      color: 'text-amber-500',  Icon: SadIcon },
  angry: { label: 'Phẫn nộ',   color: 'text-orange-600', Icon: AngryIcon },
};

/**
 * ReactionFlyoutBar — Thanh Popup cảm xúc Facebook gốc: gọn gàng, nhẹ, mượt mà
 */
export function ReactionFlyoutBar({ onSelect }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-full shadow-md animate-fadeIn select-none z-50">
      {Object.entries(REACTION_SVG_MAP).map(([type, cfg]) => {
        const IconComponent = cfg.Icon;
        return (
          <button
            key={type}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(type);
            }}
            className="p-1 hover:scale-130 active:scale-95 transition-transform cursor-pointer origin-bottom"
            title={cfg.label}
            aria-label={cfg.label}
          >
            <IconComponent size={22} />
          </button>
        );
      })}
    </div>
  );
}

export default function ReactionIcon({ type = 'like', size = 18, className = '' }) {
  const item = REACTION_SVG_MAP[type] || REACTION_SVG_MAP.like;
  const Component = item.Icon;
  return <Component size={size} className={className} />;
}
