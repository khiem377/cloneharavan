'use client';

import React, { useState, useMemo } from 'react';
import Icon from '../../../components/common/Icon';
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
          <Input
            type="text"
            placeholder="Tìm thương hiệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 pr-7 h-7 text-xs"
          />
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon name="search" size={12} />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <Icon name="close" size={10} />
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
                  ? 'h-auto py-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 border-red-600 font-bold shadow-xs'
                  : 'h-auto py-1 px-2.5 font-normal text-gray-700'
              }
            >
              <span>{b.name}</span>
              {typeof b.count === 'number' && b.count > 0 && (
                <Badge
                  variant={isSelected ? 'destructive' : 'secondary'}
                  className="px-1 py-0 text-[10px] ml-1 rounded-sm"
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
          className="h-auto p-0 text-xs text-red-600 font-medium mt-1"
        >
          {isExpanded ? 'Thu gọn' : `+ Xem thêm (${remainingCount} thương hiệu)`}
        </Button>
      )}

      {filteredBrands.length === 0 && (
        <p className="text-xs text-gray-400 italic py-1">Không tìm thấy thương hiệu phù hợp</p>
      )}
    </div>
  );
}
