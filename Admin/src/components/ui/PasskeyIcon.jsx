import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Upgraded, Pixel-Perfect Passkey (FIDO2 / WebAuthn) Icon Component
 * Based on the modern Passkey standard with refined geometry, smooth curves,
 * and support for mono, duotone, and brand-gradient styles.
 *
 * @param {Object} props
 * @param {number|string} [props.size=20] - Size in pixels (width and height)
 * @param {'mono'|'duotone'|'gradient'|'outline'} [props.variant='mono'] - Visual style variant
 * @param {string} [props.className] - Additional Tailwind classes
 * @param {string} [props.userColor] - Custom color for user silhouette (duotone mode)
 * @param {string} [props.keyColor] - Custom color for passkey key (duotone mode)
 */
export default function PasskeyIcon({
  size = 20,
  variant = 'mono',
  className = '',
  userColor,
  keyColor,
  ...props
}) {
  const numSize = typeof size === 'number' ? size : parseInt(size, 10) || 20;

  // Gradient Variant
  if (variant === 'gradient') {
    const gradId = `passkey-grad-${Math.random().toString(36).substr(2, 9)}`;
    return (
      <svg
        width={numSize}
        height={numSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('shrink-0 transition-transform', className)}
        aria-hidden="true"
        {...props}
      >
        <defs>
          <linearGradient id={gradId} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>

        {/* User Head */}
        <circle cx="9.5" cy="6.5" r="4" fill={`url(#${gradId})`} />

        {/* User Body with smooth shoulder contour */}
        <path
          d="M2.5 21C2.5 16.8 5.8 13.5 10 13.5C11.5 13.5 12.8 13.9 14 14.7C13.2 15.8 12.7 17.1 12.7 18.5C12.7 19.4 12.9 20.2 13.3 21H2.5Z"
          fill={`url(#${gradId})`}
          opacity="0.85"
        />

        {/* Passkey Key */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M18.5 7.5C16.57 7.5 15 9.07 15 11C15 11.96 15.39 12.83 16.02 13.46L16 13.5V18.2C16 18.4 16.08 18.58 16.22 18.72L17.2 19.7C17.38 19.88 17.63 20 17.9 20C18.17 20 18.42 19.88 18.6 19.7L19.4 18.9C19.58 18.72 19.68 18.47 19.68 18.2C19.68 17.93 19.58 17.68 19.4 17.5L18.7 16.8L19.4 16.1C19.58 15.92 19.68 15.67 19.68 15.4C19.68 15.13 19.58 14.88 19.4 14.7L18.7 14V13.8C19.98 13.42 21 12.33 21 11C21 9.07 19.43 7.5 17.5 7.5H18.5ZM18.5 12.5C17.67 12.5 17 11.83 17 11C17 10.17 17.67 9.5 18.5 9.5C19.33 9.5 20 10.17 20 11C20 11.83 19.33 12.5 18.5 12.5Z"
          fill={`url(#${gradId})`}
        />
      </svg>
    );
  }

  // Duotone Variant
  if (variant === 'duotone') {
    return (
      <svg
        width={numSize}
        height={numSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('shrink-0 transition-transform', className)}
        aria-hidden="true"
        {...props}
      >
        {/* User Head */}
        <circle
          cx="9.5"
          cy="6.5"
          r="4"
          fill={userColor || 'currentColor'}
          className={cn(!userColor && 'text-muted-foreground/60')}
        />

        {/* User Torso */}
        <path
          d="M2.5 21C2.5 16.8 5.8 13.5 10 13.5C11.5 13.5 12.8 13.9 14 14.7C13.2 15.8 12.7 17.1 12.7 18.5C12.7 19.4 12.9 20.2 13.3 21H2.5Z"
          fill={userColor || 'currentColor'}
          className={cn(!userColor && 'text-muted-foreground/60')}
        />

        {/* Passkey Key (Sharp primary accent) */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M18.5 7.5C16.57 7.5 15 9.07 15 11C15 11.96 15.39 12.83 16.02 13.46L16 13.5V18.2C16 18.4 16.08 18.58 16.22 18.72L17.2 19.7C17.38 19.88 17.63 20 17.9 20C18.17 20 18.42 19.88 18.6 19.7L19.4 18.9C19.58 18.72 19.68 18.47 19.68 18.2C19.68 17.93 19.58 17.68 19.4 17.5L18.7 16.8L19.4 16.1C19.58 15.92 19.68 15.67 19.68 15.4C19.68 15.13 19.58 14.88 19.4 14.7L18.7 14V13.8C19.98 13.42 21 12.33 21 11C21 9.07 19.43 7.5 17.5 7.5H18.5ZM18.5 12.5C17.67 12.5 17 11.83 17 11C17 10.17 17.67 9.5 18.5 9.5C19.33 9.5 20 10.17 20 11C20 11.83 19.33 12.5 18.5 12.5Z"
          fill={keyColor || 'currentColor'}
          className={cn(!keyColor && 'text-primary')}
        />
      </svg>
    );
  }

  // Mono / Solid Variant (Default - Clean standard matching Haravan with high precision)
  return (
    <svg
      width={numSize}
      height={numSize}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0 transition-transform', className)}
      aria-hidden="true"
      {...props}
    >
      {/* User Head */}
      <circle cx="9.5" cy="6.5" r="4" />

      {/* User Torso */}
      <path d="M2.5 21C2.5 16.8 5.8 13.5 10 13.5C11.5 13.5 12.8 13.9 14 14.7C13.2 15.8 12.7 17.1 12.7 18.5C12.7 19.4 12.9 20.2 13.3 21H2.5Z" />

      {/* Passkey Key with precise bitting teeth & rounded notch cuts */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.5 7.5C16.57 7.5 15 9.07 15 11C15 11.96 15.39 12.83 16.02 13.46L16 13.5V18.2C16 18.4 16.08 18.58 16.22 18.72L17.2 19.7C17.38 19.88 17.63 20 17.9 20C18.17 20 18.42 19.88 18.6 19.7L19.4 18.9C19.58 18.72 19.68 18.47 19.68 18.2C19.68 17.93 19.58 17.68 19.4 17.5L18.7 16.8L19.4 16.1C19.58 15.92 19.68 15.67 19.68 15.4C19.68 15.13 19.58 14.88 19.4 14.7L18.7 14V13.8C19.98 13.42 21 12.33 21 11C21 9.07 19.43 7.5 17.5 7.5H18.5ZM18.5 12.5C17.67 12.5 17 11.83 17 11C17 10.17 17.67 9.5 18.5 9.5C19.33 9.5 20 10.17 20 11C20 11.83 19.33 12.5 18.5 12.5Z"
      />
    </svg>
  );
}
