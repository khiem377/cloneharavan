'use client';

import React from 'react';
import { Search } from 'lucide-react';

export default function CouponsToolbar({
  filterType,
  onFilterChange,
  searchTerm,
  onSearchChange,
  counts = {},
}) {
  const TABS = [
    { id: 'all', label: 'Tất cả', count: counts.all || 0 },
    { id: 'fixed', label: 'Giảm trực tiếp', count: counts.fixed || 0 },
    { id: 'percent', label: 'Giảm theo %', count: counts.percent || 0 },
  ];

  return (
    <div className="bg-white rounded-[6px] p-2.5 sm:p-3 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const isSelected = filterType === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onFilterChange(tab.id)}
              className={`text-xs h-8 px-3 rounded-[6px] font-medium shrink-0 transition active:scale-[0.98] cursor-pointer flex items-center gap-1.5 font-mono ${
                isSelected
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1 py-0.2 rounded font-mono tabular-nums ${
                  isSelected ? 'bg-red-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-64 shrink-0">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Nhập mã voucher..."
          className="w-full h-8 pl-8 pr-3 rounded-[6px] border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 font-mono"
        />
      </div>
    </div>
  );
}
