'use client';

import React from 'react';
import { Info } from 'lucide-react';

export default function CheckoutNoticeBanner({ notice }) {
  if (!notice || typeof notice !== 'string' || !notice.trim()) {
    return null;
  }

  return (
    <div className="bg-amber-50/80 border border-amber-200 text-amber-900 rounded-[6px] p-3 sm:p-3.5 flex items-start gap-2.5 text-xs sm:text-[13px] leading-relaxed">
      <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
      <div className="flex-1 whitespace-pre-line">{notice}</div>
    </div>
  );
}
