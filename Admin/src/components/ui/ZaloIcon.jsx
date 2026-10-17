import React from 'react';
import zaloIconImg from '@/assets/zalo-icon.png';


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
