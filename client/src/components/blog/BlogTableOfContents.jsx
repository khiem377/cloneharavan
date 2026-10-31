'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export const BlogTableOfContents = ({ items = [] }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!items || items.length === 0) return null;

  const scrollToHeading = (id) => {
    if (typeof document === 'undefined') return;
    const el = document.getElementById(id);
    if (el) {
      const topOffset = 90;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <Card className="my-6 border border-[#284ea1]/20 bg-[#edf2fa]/30 rounded-[6px] overflow-hidden shadow-none">
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
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="text-[#284ea1] hover:bg-white/60 rounded-[4px]"
          aria-label={isOpen ? 'Thu gọn mục lục' : 'Mở rộng mục lục'}
        >
          {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </Button>
      </CardHeader>

      {isOpen && (
        <CardContent className="p-3.5 sm:p-4 pt-2">
          <nav className="space-y-1 text-xs sm:text-sm">
            {items.map((item, idx) => {
              const isSubHeading = item.level === 3;
              return (
                <Button
                  key={item.id || idx}
                  type="button"
                  variant="ghost"
                  onClick={() => scrollToHeading(item.id)}
                  className={cn(
                    'justify-start w-full h-auto py-1 text-slate-700 hover:text-[#284ea1] hover:bg-transparent font-medium px-1',
                    isSubHeading ? 'pl-4 text-xs text-slate-500' : 'font-semibold'
                  )}
                >
                  <span className="text-[#284ea1]/60 mr-1.5">{idx + 1}.</span>
                  <span>{item.text}</span>
                </Button>
              );
            })}
          </nav>
        </CardContent>
      )}
    </Card>
  );
};

export default BlogTableOfContents;
