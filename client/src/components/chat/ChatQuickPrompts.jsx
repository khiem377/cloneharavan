'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

export const QUICK_PROMPTS = [
  'Tư vấn Tivi 4K giá dưới 15 triệu',
  'Máy giặt Inverter tiết kiệm điện',
  'Tủ lạnh 2 cánh bảo quản tươi ngon',
  'Mã giảm giá hôm nay',
  'Chính sách bảo hành',
];

export default function ChatQuickPrompts({ onSelectPrompt, loading }) {
  return (
    <div className="bg-slate-50 border-t border-slate-200 px-3 py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
      {QUICK_PROMPTS.map((prompt, idx) => (
        <Button
          key={idx}
          type="button"
          variant="outline"
          onClick={() => onSelectPrompt(prompt)}
          disabled={loading}
          className="text-[11px] py-1 px-3 h-auto rounded-full border-slate-300 bg-white hover:border-[#284ea1] hover:text-[#284ea1] text-slate-700 whitespace-nowrap transition-all shrink-0 cursor-pointer active:scale-95 shadow-2xs"
        >
          {prompt}
        </Button>
      ))}
    </div>
  );
}
