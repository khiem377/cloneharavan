import React, { useState, useEffect, useRef } from 'react';
import { triggerCinematicThemeFX } from './ThemeTransitionFX';

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ThemeToggle — Studio-Grade Cinematic Full-Screen Theme Wave Transition
 * ══════════════════════════════════════════════════════════════════════════════
 * - Triple-Layer Cinematic FX:
 *   1. Canvas Particle Spark Explosion (36 stardust particles + quantum stars)
 *   2. Dual Shockwave Rings expanding with chromatic neon corona
 *   3. View Transitions API 600ms Ultra-Smooth Expo Out Circular Sweep
 * - Auto-synchronized global color flow (.theme-transitioning)
 * - Morphing Sun / Moon with interactive haptic feedback
 * ══════════════════════════════════════════════════════════════════════════════
 */
export default function ThemeToggle({ className = '' }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark') || 
           localStorage.getItem('admin-theme') === 'dark';
  });
  
  const [isRotating, setIsRotating] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    // Đồng bộ theme ngay khi mount
    const savedTheme = localStorage.getItem('admin-theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = (e) => {
    const nextDark = !isDark;
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 550);

    // Kích hoạt class làm mượt màu toàn trang
    document.documentElement.classList.add('theme-transitioning');
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 650);

    const applyThemeChange = () => {
      if (nextDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('admin-theme', 'dark');
        setIsDark(true);
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('admin-theme', 'light');
        setIsDark(false);
      }
    };

    // Tọa độ tâm vòng tròn sóng ánh sáng từ nút bấm
    const rect = buttonRef.current?.getBoundingClientRect();
    const x = e?.clientX ?? (rect ? rect.left + rect.width / 2 : window.innerWidth / 2);
    const y = e?.clientY ?? (rect ? rect.top + rect.height / 2 : 28);

    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // Bùng nổ hiệu ứng Cinematic Canvas Particles & Shockwave Corona
    triggerCinematicThemeFX({ x, y, isNextDark: nextDark });

    // Nếu không hỗ trợ View Transitions API
    if (!document.startViewTransition) {
      applyThemeChange();
      return;
    }

    const transition = document.startViewTransition(() => {
      applyThemeChange();
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${maxRadius * 1.15}px at ${x}px ${y}px)`,
      ];

      document.documentElement.animate(
        {
          clipPath: clipPath,
        },
        {
          duration: 600,
          easing: 'cubic-bezier(0.19, 1, 0.22, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggleTheme}
      className={`relative size-8 flex items-center justify-center rounded-[6px] border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent hover:border-foreground/20 transition-all duration-200 active:scale-75 cursor-pointer overflow-hidden shadow-2xs group ${className}`}
      title={isDark ? 'Chuyển sang giao diện sáng (Light)' : 'Chuyển sang giao diện tối (Dark)'}
      aria-label="Chuyển đổi giao diện Sáng / Tối"
    >
      {/* Ambient background glow on hover */}
      <span
        className={`absolute inset-0 rounded-[6px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
          isDark ? 'bg-amber-400/15 shadow-[0_0_12px_rgba(251,191,36,0.3)]' : 'bg-sky-500/15 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
        }`}
      />

      <div
        className={`relative size-4 flex items-center justify-center transition-transform duration-500 ${
          isRotating ? 'rotate-[360deg] scale-125' : 'rotate-0 scale-100'
        }`}
      >
        {isDark ? (
          /* Sun Mode Icon with Glowing Rays */
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4 text-amber-400 animate-in fade-in zoom-in-75 duration-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
          >
            <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.25" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        ) : (
          /* Moon Mode Icon with Sparkle */
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4 text-slate-700 dark:text-slate-300 animate-in fade-in zoom-in-75 duration-300 drop-shadow-[0_0_6px_rgba(56,189,248,0.4)]"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="currentColor" fillOpacity="0.2" />
            <path
              d="M19 3v4M21 5h-4"
              strokeWidth="1.5"
              className="text-amber-400 opacity-90"
            />
          </svg>
        )}
      </div>
    </button>
  );
}
