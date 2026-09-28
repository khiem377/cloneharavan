'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function NavigationEvents({ onNavigateComplete }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    onNavigateComplete();
  }, [pathname, searchParams, onNavigateComplete]);

  return null;
}

export default function TopProgressBar() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const trickleTimerRef = useRef(null);
  const timeoutRef = useRef(null);
  const resetTimerRef = useRef(null);

  const clearAllTimers = () => {
    if (trickleTimerRef.current) clearInterval(trickleTimerRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
  };

  const start = useCallback(() => {
    clearAllTimers();
    setIsVisible(true);
    setProgress(18);

    // Smooth trickle effect
    trickleTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        const diff = (92 - prev) * 0.15;
        const inc = Math.max(0.5, Math.min(diff, Math.random() * 8 + 1));
        return Math.min(92, prev + inc);
      });
    }, 180);

    // Fallback safety timeout (8s)
    timeoutRef.current = setTimeout(() => {
      complete();
    }, 8000);
  }, []);

  const complete = useCallback(() => {
    if (trickleTimerRef.current) clearInterval(trickleTimerRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setProgress(100);

    // Fade out after reaching 100%
    resetTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      resetTimerRef.current = setTimeout(() => {
        setProgress(0);
      }, 250);
    }, 200);
  }, []);

  // Listen to clicks on links and history changes
  useEffect(() => {
    const handleDocumentClick = (e) => {
      // Find closest anchor tag
      const anchor = e.target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Ignore external links, downloads, hash-only, mailto, tel, target="_blank", etc.
      if (
        anchor.target === '_blank' ||
        anchor.hasAttribute('download') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        href === '#' ||
        href.startsWith('#')
      ) {
        return;
      }

      // Ignore clicks with modifier keys
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        return;
      }

      // Check URL destination
      try {
        const destUrl = new URL(anchor.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // Only handle internal links
        if (destUrl.origin !== currentUrl.origin) return;

        // If target is exact same URL (pathname + search), ignore
        if (
          destUrl.pathname === currentUrl.pathname &&
          destUrl.search === currentUrl.search
        ) {
          return;
        }

        // Valid internal navigation
        start();
      } catch {
        // Ignore parse error
      }
    };

    const handlePopState = () => {
      start();
    };

    document.addEventListener('click', handleDocumentClick, { capture: true });
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
      window.removeEventListener('popstate', handlePopState);
      clearAllTimers();
    };
  }, [start]);

  return (
    <>
      <Suspense fallback={null}>
        <NavigationEvents onNavigateComplete={complete} />
      </Suspense>

      {isVisible && (
        <div
          className="fixed top-0 left-0 right-0 z-[999999] pointer-events-none h-[3px] overflow-hidden"
          style={{
            opacity: progress === 100 ? 0 : 1,
            transition: 'opacity 250ms ease-out',
          }}
          aria-hidden="true"
        >
          {/* Progress Bar with vibrant high-tech gradient */}
          <div
            className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-red-500 relative transition-all duration-200 ease-out"
            style={{
              width: `${progress}%`,
            }}
          >
            {/* Glowing leading light */}
            <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-r from-transparent via-white/40 to-white shadow-[0_0_12px_#ef4444,0_0_6px_#f59e0b]" />
          </div>
        </div>
      )}
    </>
  );
}
