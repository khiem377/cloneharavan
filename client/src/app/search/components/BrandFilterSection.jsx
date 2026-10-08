'use client';

import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';

export default function BrandFilterSection({
  brands = [],
  selectedBrand = '',
  onSelectBrand,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredBrands = useMemo(() => {
    if (!searchTerm.trim()) return brands;
    const term = searchTerm.trim().toLowerCase();
    return brands.filter((b) => (b.name || '').toLowerCase().includes(term));
  }, [brands, searchTerm]);

  const visibleBrands = useMemo(() => {
    if (isExpanded || searchTerm.trim()) return filteredBrands;
    return filteredBrands.slice(0, 8);
  }, [filteredBrands, isExpanded, searchTerm]);

  const remainingCount = Math.max(0, filteredBrands.length - 8);

  return (
    <div className="space-y-2.5">
      {brands.length > 6 && (
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Tìm thương hiệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 pr-7 h-7 text-xs rounded-[6px]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-0.5 scrollbar-thin">
        {visibleBrands.map((b) => {
          const isSelected = selectedBrand === b._id || selectedBrand === b.slug;
          return (
            <Button
              key={b._id}
              type="button"
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSelectBrand(isSelected ? '' : b.slug || b._id)}
              className={
                isSelected
                  ? 'h-7 py-1 px-2.5 bg-[#e30019] hover:bg-[#c40015] text-white font-semibold rounded-[6px] shadow-xs active:scale-[0.98]'
                  : 'h-7 py-1 px-2.5 font-normal text-slate-700 hover:bg-slate-50 rounded-[6px] border-slate-200 active:scale-[0.98]'
              }
            >
              <span>{b.name}</span>
              {typeof b.count === 'number' && b.count > 0 && (
                <Badge
                  variant={isSelected ? 'outline' : 'secondary'}
                  className={`px-1 py-0 text-[10px] ml-1 rounded-[4px] font-mono tabular-nums ${
                    isSelected ? 'bg-white/20 text-white border-transparent' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {b.count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {!searchTerm && remainingCount > 0 && (
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-auto p-0 text-xs text-[#e30019] font-medium hover:underline mt-1"
        >
          {isExpanded ? 'Thu gọn' : `+ Xem thêm (${remainingCount} thương hiệu)`}
        </Button>
      )}

      {filteredBrands.length === 0 && (
        <p className="text-xs text-slate-400 italic py-1">Không tìm thấy thương hiệu phù hợp</p>
      )}
    </div>
  );
}
