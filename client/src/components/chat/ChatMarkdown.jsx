'use client';

import React from 'react';
import Link from 'next/link';

// Hàm loại bỏ triệt để mọi emoji
export const stripEmojis = (str = '') => {
  if (!str) return '';
  return str.replace(
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}]/gu,
    ''
  );
};

export default function ChatMarkdown({ text = '' }) {
  if (!text) return null;

  const cleanText = stripEmojis(text);
  const rawLines = cleanText.split('\n');

  // Lọc bỏ đường kẻ phân cách bảng markdown kiểu |---|---|
  const lines = rawLines.filter((l) => !/^\|?\s*:?-+:?\s*(\|?\s*:?-+:?\s*)*\|?$/.test(l.trim()));

  const parseInline = (content) => {
    const tokenRegex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
    const parts = content.split(tokenRegex);

    return parts.map((part, pIdx) => {
      if (!part) return null;
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={pIdx} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        const [, linkText, linkUrl] = linkMatch;
        return (
          <Link
            key={pIdx}
            href={linkUrl}
            className="text-[#284ea1] font-semibold underline underline-offset-2 hover:text-[#1e3b82] transition-colors"
          >
            {linkText}
          </Link>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed text-slate-800">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Nếu là hàng bảng markdown (| a | b |), biến đổi thành dòng bullet dễ nhìn
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
          const cells = trimmed
            .slice(1, -1)
            .split('|')
            .map((c) => c.trim())
            .filter(Boolean);
          return (
            <p key={idx} className="text-slate-800 flex items-start gap-1.5">
              <span className="text-[#284ea1] font-bold shrink-0">•</span>
              <span>{parseInline(cells.join(' - '))}</span>
            </p>
          );
        }

        return (
          <p key={idx} className="text-slate-800">
            {parseInline(line)}
          </p>
        );
      })}
    </div>
  );
}
