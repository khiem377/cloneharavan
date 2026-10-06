'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronUp } from 'lucide-react';

function ScrollToTopWatcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Scroll to top on route change if not navigating to a specific #hash anchor
    if (typeof window !== 'undefined') {
      if (!window.location.hash) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        if (document.documentElement) document.documentElement.scrollTop = 0;
        if (document.body) document.body.scrollTop = 0;

        // Double check after layout paint / hydration
        const rAF = requestAnimationFrame(() => {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          if (document.documentElement) document.documentElement.scrollTop = 0;
          if (document.body) document.body.scrollTop = 0;
        });

        const timer = setTimeout(() => {
          if (!window.location.hash) {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          }
        }, 60);

        return () => {
          cancelAnimationFrame(rAF);
          clearTimeout(timer);
        };
      }
    }
  }, [pathname, searchParams]);

  return null;
}

export default function ScrollToTop() {
  const pathname = usePathname();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Disable browser's default scroll restoration to avoid landing mid-page
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;
        setShowButton(currentScrollY > 360);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  const isProductPage = pathname?.startsWith('/products/');

  return (
    <>
      {/* Route Change Scroll-to-Top Listener */}
      <Suspense fallback={null}>
        <ScrollToTopWatcher />
      </Suspense>

      {/* Floating Scroll-to-Top Button */}
      {showButton && (
        <button
          type="button"
          onClick={handleScrollToTop}
          title="Cuộn lên đầu trang"
          aria-label="Cuộn lên đầu trang"
          data-no-progress="true"
          className={`fixed z-40 w-9 h-9 sm:w-10 sm:h-10 rounded-[6px] bg-white border border-slate-300 text-slate-700 shadow-md flex items-center justify-center hover:bg-slate-50 hover:text-red-600 hover:border-red-500 transition-all cursor-pointer active:scale-[0.98] animate-fadeIn ${
            isProductPage
              ? 'bottom-[176px] right-4 sm:bottom-[184px] sm:right-6'
              : 'bottom-[108px] right-4 sm:bottom-[116px] sm:right-6'
          }`}
        >
          <ChevronUp className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}
    </>
  );
}
