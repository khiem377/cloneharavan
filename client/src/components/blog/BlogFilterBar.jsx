'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Input } from '../ui/input';
import { Search, LayoutGrid, List, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export const BlogFilterBar = ({
  total = 0,
  viewMode = 'grid',
  onViewModeChange,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get('sort') || 'newest';
  const initialKeyword = searchParams.get('keyword') || searchParams.get('q') || searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialKeyword);

  React.useEffect(() => {
    setSearchTerm(searchParams.get('keyword') || searchParams.get('q') || searchParams.get('search') || '');
  }, [searchParams]);

  const handleSortChange = (sortVal) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sortVal);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm.trim()) {
      params.set('keyword', searchTerm.trim());
      params.delete('q');
      params.delete('search');
    } else {
      params.delete('keyword');
      params.delete('q');
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 pb-4 mb-6 border-b border-slate-200">
      {/* Sort options */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-xs font-bold text-slate-500 mr-1 shrink-0 uppercase tracking-wide">
          Sắp xếp:
        </span>
        <button
          type="button"
          onClick={() => handleSortChange('newest')}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer shadow-2xs',
            currentSort === 'newest'
              ? 'bg-[#284ea1] text-white shadow-xs ring-2 ring-[#284ea1]/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          )}
        >
          Mới nhất
        </button>
        <button
          type="button"
          onClick={() => handleSortChange('views')}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer shadow-2xs',
            currentSort === 'views'
              ? 'bg-[#284ea1] text-white shadow-xs ring-2 ring-[#284ea1]/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          )}
        >
          Xem nhiều nhất
        </button>
      </div>

      {/* Right: Search box & View mode toggles */}
      <div className="flex items-center gap-2.5">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-60">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm bài viết..."
            className="h-9 text-xs pr-8 rounded-xl border-slate-200 bg-white focus-visible:border-[#284ea1] focus-visible:ring-2 focus-visible:ring-[#284ea1]/20 shadow-2xs"
          />
          <button
            type="submit"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#284ea1] transition-colors"
            aria-label="Tìm kiếm"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {onViewModeChange && (
          <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-white shrink-0 shadow-2xs">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={cn(
                'p-1.5 rounded-lg transition-colors cursor-pointer',
                viewMode === 'grid'
                  ? 'bg-[#edf2fa] text-[#284ea1]'
                  : 'text-slate-400 hover:text-slate-700'
              )}
              aria-label="Dạng lưới"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('horizontal')}
              className={cn(
                'p-1.5 rounded-lg transition-colors cursor-pointer',
                viewMode === 'horizontal'
                  ? 'bg-[#edf2fa] text-[#284ea1]'
                  : 'text-slate-400 hover:text-slate-700'
              )}
              aria-label="Dạng danh sách"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogFilterBar;
