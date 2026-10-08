import React from 'react';
import zaloIconImg from '@/assets/zalo-icon.png';

/**
 * Official Zalo Icon from authentic brand asset with transparent background.
 * @param {Object} props
 * @param {string} [props.className='h-5 w-auto shrink-0'] - Tailwind classes
 * @param {'original' | 'white' | 'blue'} [props.color='white'] - Color mode: 'white' (for dark/blue buttons), 'original' (full color for light buttons)
 */
export default function ZaloIcon({ className = 'h-5 w-auto shrink-0', color = 'white', ...props }) {
  const imgSrc = (typeof zaloIconImg === 'object' && zaloIconImg !== null ? zaloIconImg.src : zaloIconImg) || '/zalo-icon.png';
  const colorFilterClass = color === 'white' ? 'brightness-0 invert' : '';

  return (
    <img
      src={imgSrc}
      alt="Zalo"
      className={`object-contain select-none pointer-events-none ${colorFilterClass} ${className}`.trim()}
      draggable={false}
      {...props}
    />
  );
}
