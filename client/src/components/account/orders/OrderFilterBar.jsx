'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function OrderFilterBar({
  orderSearch = '',
  onSearchChange,
  orderFilter = 'all',
  onFilterChange,
  filterTabs = [],
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            value={orderSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo mã đơn hoặc sản phẩm..."
            className="h-8 pl-8 text-xs rounded-[6px]"
          />
          {orderSearch && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onSearchChange('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 hover:text-slate-600"
            >
              <X size={13} />
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-slate-100">
        {filterTabs.map((tab) => {
          const isActive = orderFilter === tab.id;
          return (
            <Button
              key={tab.id}
              type="button"
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onFilterChange(tab.id)}
              className={`h-7 px-3 text-xs rounded-[6px] transition whitespace-nowrap active:scale-[0.98] gap-1.5 ${
                isActive
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs hover:bg-slate-800'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <Badge
                  variant="outline"
                  className={`min-w-4 h-4 px-1 rounded-full text-[10px] font-mono font-bold tabular-nums border-0 ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {tab.count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
