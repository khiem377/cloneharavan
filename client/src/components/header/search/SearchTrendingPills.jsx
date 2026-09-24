'use client';

import React from 'react';

export const SearchTrendingPills = ({ trendingKeywords = [], onKeywordClick }) => {
  const displayTrending = (trendingKeywords || [])
    .filter((item) => {
      const rawKw = typeof item === 'string' ? item : item.keyword || item.text || '';
      return rawKw && rawKw.trim().length >= 3;
    })
    .slice(0, 5);

  if (displayTrending.length === 0) return null;

  return (
    <div className="p-4 space-y-3">
      <h4 className="text-xs font-bold text-slate-800 tracking-tight">
        Tra cứu hàng đầu
      </h4>
      <div className="flex flex-wrap gap-2">
        {displayTrending.map((item, idx) => {
          const rawKw = typeof item === 'string' ? item : item.keyword || item.text || '';
          const displayLabel = rawKw
            .split(' ')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onKeywordClick(rawKw)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50/50 text-blue-800 text-xs font-medium hover:bg-blue-100 hover:border-blue-400 transition cursor-pointer"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <path d="m3 16 7-7 4 4 7-7" />
                <path d="M14 6h7v7" />
              </svg>
              <span>{displayLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SearchTrendingPills;
