'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-xs font-bold text-slate-500 mr-1 shrink-0 uppercase tracking-wide">
          Sắp xếp:
        </span>
        <Button
          type="button"
          size="sm"
          variant={currentSort === 'newest' ? 'default' : 'outline'}
          onClick={() => handleSortChange('newest')}
          className={cn(
            'h-8 px-3.5 text-xs font-semibold rounded-[6px]',
            currentSort === 'newest'
              ? 'bg-[#284ea1] text-white hover:bg-[#1e3c7e]'
              : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
          )}
        >
          Mới nhất
        </Button>
        <Button
          type="button"
          size="sm"
          variant={currentSort === 'views' ? 'default' : 'outline'}
          onClick={() => handleSortChange('views')}
          className={cn(
            'h-8 px-3.5 text-xs font-semibold rounded-[6px]',
            currentSort === 'views'
              ? 'bg-[#284ea1] text-white hover:bg-[#1e3c7e]'
              : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
          )}
        >
          Xem nhiều nhất
        </Button>
      </div>

      <div className="flex items-center gap-2.5">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-60">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm bài viết..."
            className="h-9 text-xs pr-8 rounded-[6px] border-slate-200 bg-white"
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon-xs"
            className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#284ea1]"
            aria-label="Tìm kiếm"
          >
            <Search className="size-3.5" />
          </Button>
        </form>

        {onViewModeChange && (
          <div className="flex items-center border border-slate-200 rounded-[6px] p-0.5 bg-white shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => onViewModeChange('grid')}
              className={cn(
                'rounded-[4px]',
                viewMode === 'grid'
                  ? 'bg-[#edf2fa] text-[#284ea1] hover:bg-[#edf2fa]'
                  : 'text-slate-400 hover:text-slate-700'
              )}
              aria-label="Dạng lưới"
            >
              <LayoutGrid className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => onViewModeChange('horizontal')}
              className={cn(
                'rounded-[4px]',
                viewMode === 'horizontal'
                  ? 'bg-[#edf2fa] text-[#284ea1] hover:bg-[#edf2fa]'
                  : 'text-slate-400 hover:text-slate-700'
              )}
              aria-label="Dạng danh sách"
            >
              <List className="size-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogFilterBar;
