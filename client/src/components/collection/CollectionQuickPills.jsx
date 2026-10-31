'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

const PRICE_PRESETS = [
  { label: 'Tất cả mức giá', min: '', max: '' },
  { label: 'Dưới 5 triệu', min: '', max: '5000000' },
  { label: 'Từ 5 - 15 triệu', min: '5000000', max: '15000000' },
  { label: 'Từ 15 - 30 triệu', min: '15000000', max: '30000000' },
  { label: 'Trên 30 triệu', min: '30000000', max: '' },
];

export default function CollectionQuickPills({ handle }) {
  const searchParams = useSearchParams();
  const currentMin = searchParams.get('minPrice') || '';
  const currentMax = searchParams.get('maxPrice') || '';

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
      <span className="text-xs text-slate-400 font-medium shrink-0 mr-1 hidden sm:inline">
        Lọc nhanh:
      </span>
      {PRICE_PRESETS.map((p, idx) => {
        const isActive = currentMin === p.min && currentMax === p.max;
        const params = new URLSearchParams(searchParams.toString());
        if (p.min) params.set('minPrice', p.min);
        else params.delete('minPrice');
        if (p.max) params.set('maxPrice', p.max);
        else params.delete('maxPrice');
        params.delete('page');

        return (
          <Link key={idx} href={`/collections/${handle}?${params.toString()}`} scroll={false}>
            <Badge
              variant={isActive ? 'default' : 'outline'}
              className={`rounded-[6px] px-3 py-1 text-xs font-semibold cursor-pointer shrink-0 transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {p.label}
            </Badge>
          </Link>
        );
      })}
    </div>
  );
}
