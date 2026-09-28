'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Mặc định' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
];

export default function SearchSortSelector({ currentSort = 'relevance' }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (e) => {
    const nextSort = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (!nextSort || nextSort === 'relevance') {
      params.delete('sort');
    } else {
      params.set('sort', nextSort);
    }
    params.delete('page');
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  return (
    <div className="relative inline-flex items-center">
      <select
        value={currentSort || 'relevance'}
        onChange={handleSortChange}
        className="appearance-none bg-white border border-gray-200 text-gray-800 text-xs font-medium rounded-md py-1.5 pl-3 pr-8 focus:outline-hidden focus:border-[#e30019] focus:ring-1 focus:ring-[#e30019] transition cursor-pointer shadow-2xs"
        aria-label="Sắp xếp sản phẩm"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
        <ArrowUpDown size={13} />
      </div>
    </div>
  );
}
