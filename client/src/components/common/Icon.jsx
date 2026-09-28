import React from 'react';

export const Icon = ({
  name,
  size = 20,
  color = 'currentColor',
  className = '',
  strokeWidth = 2,
  ...props
}) => {
  const iconProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: `inline-block shrink-0 ${className}`,
    ...props,
  };

  switch (name) {
    case 'bolt':
    case 'zap':
    case 'flash':
      return (
        <svg
          {...iconProps}
          fill={color !== 'currentColor' ? color : '#facc15'}
          stroke="none"
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      );

    case 'search':
      return (
        <svg {...iconProps}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      );

    case 'camera':
      return (
        <svg {...iconProps}>
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      );

    case 'cloud-upload':
      return (
        <svg {...iconProps}>
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
          <path d="M12 12v9" />
          <path d="m8 16 4-4 4 4" />
        </svg>
      );

    case 'file-plus':
      return (
        <svg {...iconProps}>
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="M9 15h6" />
          <path d="M12 12v6" />
        </svg>
      );

    case 'cart':
      return (
        <svg {...iconProps}>
          <circle cx="8" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
      );

    case 'user':
      return (
        <svg {...iconProps}>
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );

    case 'menu':
      return (
        <svg {...iconProps}>
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      );

    case 'close':
    case 'x':
      return (
        <svg {...iconProps}>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      );

    case 'chevron-down':
      return (
        <svg {...iconProps}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );

    case 'chevron-right':
      return (
        <svg {...iconProps}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );

    case 'chevron-left':
      return (
        <svg {...iconProps}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      );

    case 'eye':
      return (
        <svg {...iconProps}>
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );

    case 'eye-off':
      return (
        <svg {...iconProps}>
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
          <line x1="2" x2="22" y1="2" y2="22" />
        </svg>
      );

    case 'tv':
      return (
        <svg {...iconProps}>
          <rect width="20" height="15" x="2" y="7" rx="2" ry="2" />
          <polyline points="17 2 12 7 7 2" />
        </svg>
      );

    case 'refrigerator':
      return (
        <svg {...iconProps}>
          <rect width="14" height="20" x="5" y="2" rx="2" />
          <path d="M5 10h14" />
          <path d="M15 6v2" />
          <path d="M15 14v4" />
        </svg>
      );

    case 'washing-machine':
      return (
        <svg {...iconProps}>
          <rect width="16" height="20" x="4" y="2" rx="2" />
          <circle cx="12" cy="13" r="5" />
          <path d="M12 15a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
          <path d="M8 5h.01" />
          <path d="M12 5h.01" />
        </svg>
      );

    case 'speaker':
      return (
        <svg {...iconProps}>
          <rect width="16" height="20" x="4" y="2" rx="2" />
          <circle cx="12" cy="14" r="4" />
          <line x1="12" x2="12.01" y1="6" y2="6" />
        </svg>
      );

    case 'bed':
      return (
        <svg {...iconProps}>
          <path d="M2 4v16" />
          <path d="M2 8h18a2 2 0 0 1 2 2v10" />
          <path d="M2 17h20" />
          <path d="M6 8v9" />
        </svg>
      );

    case 'blender':
      return (
        <svg {...iconProps}>
          <path d="M9 13h6" />
          <path d="M10 9h4" />
          <path d="M12 2v2" />
          <path d="M6 4h12l-2 14H8L6 4Z" />
          <path d="M7 22h10" />
        </svg>
      );

    case 'utensils':
      return (
        <svg {...iconProps}>
          <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" />
          <path d="M15 11v11" />
          <path d="M5 2v8l3 3v9" />
          <path d="M8 2v6" />
        </svg>
      );

    case 'chair':
      return (
        <svg {...iconProps}>
          <path d="M6 19v3" />
          <path d="M18 19v3" />
          <path d="M18 11V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v6" />
          <path d="M4 11h16a1 1 0 0 1 1 1v2a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-2a1 1 0 0 1 1-1Z" />
        </svg>
      );

    case 'phone':
      return (
        <svg {...iconProps}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );

    case 'mail':
      return (
        <svg {...iconProps}>
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      );

    case 'lock':
      return (
        <svg {...iconProps}>
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );

    case 'spinner':
    case 'loader':
      return (
        <svg {...iconProps} className={`animate-spin ${className}`}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      );

    case 'fire':
      return (
        <svg {...iconProps}>
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      );

    case 'check':
      return (
        <svg {...iconProps}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );

    case 'filter':
      return (
        <svg {...iconProps}>
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
      );

    case 'sliders':
      return (
        <svg {...iconProps}>
          <line x1="4" x2="4" y1="21" y2="14" />
          <line x1="4" x2="4" y1="10" y2="3" />
          <line x1="12" x2="12" y1="21" y2="12" />
          <line x1="12" x2="12" y1="8" y2="3" />
          <line x1="20" x2="20" y1="21" y2="16" />
          <line x1="20" x2="20" y1="12" y2="3" />
          <line x1="1" x2="7" y1="14" y2="14" />
          <line x1="9" x2="15" y1="8" y2="8" />
          <line x1="17" x2="23" y1="16" y2="16" />
        </svg>
      );

    case 'arrow-up-down':
      return (
        <svg {...iconProps}>
          <path d="m21 16-4 4-4-4" />
          <path d="M17 20V4" />
          <path d="m3 8 4-4 4 4" />
          <path d="M7 4v16" />
        </svg>
      );

    case 'tag':
      return (
        <svg {...iconProps}>
          <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
          <path d="M7 7h.01" />
        </svg>
      );

    case 'layers':
      return (
        <svg {...iconProps}>
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );

    case 'rotate-ccw':
      return (
        <svg {...iconProps}>
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      );

    case 'express-delivery':
    case 'service-express':
      return (
        <svg {...iconProps} viewBox="0 0 36 36">
          <path d="M1.5 11H7M1 18H5M1.5 25H7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path
            d="M8 8.5C8 7.12 9.12 6 10.5 6H21C22.1 6 23.1 6.5 23.8 7.4L30 14.5C30.6 15.2 31 16.1 31 17V24.5C31 25.88 29.88 27 28.5 27H26"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M8 12.5V27H10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M20 8.5H22.5L27.5 14.5H20V8.5Z" fill="currentColor" />
          <path d="M23 9.5L26.5 13.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="14" cy="26.5" r="4" fill="currentColor" />
          <circle cx="14" cy="26.5" r="2" fill="white" />
          <circle cx="14" cy="26.5" r="0.8" fill="currentColor" />
          <circle cx="23.5" cy="26.5" r="4" fill="currentColor" />
          <circle cx="23.5" cy="26.5" r="2" fill="white" />
          <circle cx="23.5" cy="26.5" r="0.8" fill="currentColor" />
          <path
            d="M16 10.5L13 15.5H18L15 21"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'free-return':
    case 'service-return':
      return (
        <svg {...iconProps} viewBox="0 0 36 36">
          <path d="M29 13.5C28 7.5 23 3 17 3C10.2 3 4.5 8.2 4 15" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M24 14H29.5V8.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 22.5C8 28.5 13 33 19 33C25.8 33 31.5 27.8 32 21" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M12 22H6.5V27.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18 9L24.5 12V18C24.5 22.5 18 25.5 18 25.5C18 25.5 11.5 22.5 11.5 18V12L18 9Z" fill="currentColor" />
          <path d="M15 17.5L17 19.5L21.5 14.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M31 5V9M29 7H33" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    case 'support-247':
    case 'service-support':
      return (
        <svg {...iconProps} viewBox="0 0 36 36">
          <path d="M5.5 17C5.5 9.8 11.1 4 18 4C24.9 4 30.5 9.8 30.5 17" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M11 6C13.1 5 15.5 4.5 18 4.5C20.5 4.5 22.9 5 25 6" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
          <rect x="3" y="15" width="6" height="11" rx="3" fill="currentColor" />
          <rect x="27" y="15" width="6" height="11" rx="3" fill="currentColor" />
          <circle cx="6" cy="20.5" r="1.2" fill="white" />
          <circle cx="30" cy="20.5" r="1.2" fill="white" />
          <path d="M29 23V26.5C29 28.5 27.5 30 25.5 30H20" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="17.5" cy="30" r="2" fill="currentColor" />
          <circle cx="17.5" cy="30" r="0.8" fill="white" />
          <path d="M12.5 17V22M15.2 14V25M18 11V28M20.8 14V25M23.5 17V22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'hot-deals':
    case 'service-deals':
      return (
        <svg {...iconProps} viewBox="0 0 36 36">
          <path
            d="M18 2C18 2 22 7 20.5 12C24 9.5 27.5 12 27.5 17.5C27.5 24.5 22 29.5 15.5 29.5C9 29.5 5 24.5 5 18C5 12.5 9 7.5 9 7.5C9 7.5 12 10.5 13.5 10.5C15.8 10.5 18 2 18 2Z"
            fill="currentColor"
          />
          <path
            d="M17.5 10.5L13 17.5H19L15 25"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M30 2V9M26.5 5.5H33.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M27.5 3L32.5 8M32.5 3L27.5 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="32" cy="14" r="1.5" fill="currentColor" />
        </svg>
      );

    default:
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
};

export default Icon;
