'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';

export const BlogTableOfContents = ({ items = [] }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!items || items.length === 0) return null;

  const scrollToHeading = (id) => {
    if (typeof document === 'undefined') return;
    const el = document.getElementById(id);
    if (el) {
      const topOffset = 90; // offset for sticky headers
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <Card className="my-6 border border-[#284ea1]/20 bg-[#edf2fa]/30 rounded-2xl overflow-hidden shadow-2xs">
      <CardHeader
        onClick={() => setIsOpen(!isOpen)}
        className="p-3.5 sm:p-4 flex flex-row items-center justify-between cursor-pointer select-none bg-[#edf2fa]/70 hover:bg-[#edf2fa] transition-colors"
      >
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wide">
            Mục lục bài viết
          </CardTitle>
          <span className="text-xs text-[#284ea1] font-semibold">({items.length} mục)</span>
        </div>
        <button
          type="button"
          className="text-[#284ea1] p-1 hover:bg-white/60 rounded-md transition-colors"
          aria-label={isOpen ? 'Thu gọn mục lục' : 'Mở rộng mục lục'}
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </CardHeader>

      {isOpen && (
        <CardContent className="p-3.5 sm:p-4 pt-2">
          <nav className="space-y-1.5 text-xs sm:text-sm">
            {items.map((item, idx) => {
              const isSubHeading = item.level === 3;
              return (
                <button
                  key={item.id || idx}
                  type="button"
                  onClick={() => scrollToHeading(item.id)}
                  className={cn(
                    'block text-left w-full py-1 text-slate-700 hover:text-[#284ea1] transition-colors font-medium',
                    isSubHeading ? 'pl-4 text-xs text-slate-500' : 'font-semibold'
                  )}
                >
                  <span className="text-[#284ea1]/60 mr-1.5">{idx + 1}.</span>
                  {item.text}
                </button>
              );
            })}
          </nav>
        </CardContent>
      )}
    </Card>
  );
};

export default BlogTableOfContents;
