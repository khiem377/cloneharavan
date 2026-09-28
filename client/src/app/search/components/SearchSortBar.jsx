'use client';

import React, { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Icon from '../../../components/common/Icon';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Liên quan nhất' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
];

export default function SearchSortBar({
  total = 0,
  currentSort = 'relevance',
  currentFilters = {},
  facets = {},
  onOpenMobileFilter,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedAttrs = useMemo(() => {
    if (!currentFilters.attrs) return {};
    try {
      return typeof currentFilters.attrs === 'string'
        ? JSON.parse(currentFilters.attrs)
        : currentFilters.attrs;
    } catch {
      return {};
    }
  }, [currentFilters.attrs]);

  const handleSortChange = (newSort) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort === 'relevance') {
      params.delete('sort');
    } else {
      params.set('sort', newSort);
    }
    params.delete('page');
    router.push(`/search?${params.toString()}`);
  };

  const removeFilter = (key) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    if (key === 'price') {
      params.delete('minPrice');
      params.delete('maxPrice');
    }
    params.delete('page');
    router.push(`/search?${params.toString()}`);
  };

  const removeAttr = (attrKey) => {
    const next = { ...selectedAttrs };
    delete next[attrKey];
    const params = new URLSearchParams(searchParams.toString());
    if (Object.keys(next).length > 0) {
      params.set('attrs', JSON.stringify(next));
    } else {
      params.delete('attrs');
    }
    params.delete('page');
    router.push(`/search?${params.toString()}`);
  };

  const activeCategory = facets.categories?.find(
    (c) => c._id === currentFilters.category || c.slug === currentFilters.category
  );

  const activeBrand = facets.brands?.find(
    (b) => b._id === currentFilters.brand || b.slug === currentFilters.brand
  );

  let priceLabel = '';
  if (currentFilters.minPrice && currentFilters.maxPrice) {
    priceLabel = `${(Number(currentFilters.minPrice) / 1000000).toFixed(0)}tr - ${(Number(currentFilters.maxPrice) / 1000000).toFixed(0)}tr`;
  } else if (currentFilters.minPrice) {
    priceLabel = `> ${(Number(currentFilters.minPrice) / 1000000).toFixed(0)}tr`;
  } else if (currentFilters.maxPrice) {
    priceLabel = `< ${(Number(currentFilters.maxPrice) / 1000000).toFixed(0)}tr`;
  }

  const activeFilterCount =
    [
      currentFilters.category,
      currentFilters.brand,
      currentFilters.minPrice || currentFilters.maxPrice,
      currentFilters.inStock,
    ].filter(Boolean).length + Object.keys(selectedAttrs).length;

  return (
    <Card className="p-3.5 space-y-2.5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenMobileFilter}
            className="lg:hidden flex items-center gap-1.5"
          >
            <Icon name="filter" size={13} />
            <span>Lọc</span>
            {activeFilterCount > 0 && (
              <Badge variant="default" className="w-4 h-4 p-0 text-[10px] flex items-center justify-center font-bold rounded-full">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          <p className="text-xs sm:text-sm text-gray-600">
            Tìm thấy <strong className="font-bold text-gray-900">{total}</strong> kết quả
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <span className="text-xs text-gray-400 font-medium whitespace-nowrap hidden sm:inline">
            Ưu tiên xem:
          </span>

          <nav aria-label="Sắp xếp sản phẩm" className="flex items-center gap-2 text-xs sm:text-sm">
            {SORT_OPTIONS.map((opt, idx) => {
              const isActive = (currentSort || 'relevance') === opt.value;
              return (
                <React.Fragment key={opt.value}>
                  {idx > 0 && <span className="text-gray-300 select-none">•</span>}
                  <button
                    type="button"
                    onClick={() => handleSortChange(opt.value)}
                    className={`whitespace-nowrap transition-colors py-0.5 cursor-pointer ${
                      isActive
                        ? 'font-bold text-red-600'
                        : 'font-normal text-gray-600 hover:text-red-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                </React.Fragment>
              );
            })}
          </nav>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <div className="pt-2 border-t border-gray-100 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-medium text-gray-400">Đang lọc:</span>

          {currentFilters.category && (
            <Badge variant="secondary" className="gap-1 font-normal text-xs py-0.5 px-2">
              <span>{activeCategory?.name || currentFilters.category}</span>
              <button
                onClick={() => removeFilter('category')}
                className="text-gray-400 hover:text-gray-700 ml-0.5 cursor-pointer"
                aria-label="Xóa lọc danh mục"
              >
                <Icon name="close" size={11} />
              </button>
            </Badge>
          )}

          {currentFilters.brand && (
            <Badge variant="secondary" className="gap-1 font-normal text-xs py-0.5 px-2">
              <span>{activeBrand?.name || currentFilters.brand}</span>
              <button
                onClick={() => removeFilter('brand')}
                className="text-gray-400 hover:text-gray-700 ml-0.5 cursor-pointer"
                aria-label="Xóa lọc thương hiệu"
              >
                <Icon name="close" size={11} />
              </button>
            </Badge>
          )}

          {priceLabel && (
            <Badge variant="secondary" className="gap-1 font-normal text-xs py-0.5 px-2">
              <span>{priceLabel}</span>
              <button
                onClick={() => removeFilter('price')}
                className="text-gray-400 hover:text-gray-700 ml-0.5 cursor-pointer"
                aria-label="Xóa lọc giá"
              >
                <Icon name="close" size={11} />
              </button>
            </Badge>
          )}

          {currentFilters.inStock && (
            <Badge variant="secondary" className="gap-1 font-normal text-xs py-0.5 px-2">
              <span>Còn hàng</span>
              <button
                onClick={() => removeFilter('inStock')}
                className="text-gray-400 hover:text-gray-700 ml-0.5 cursor-pointer"
                aria-label="Xóa lọc còn hàng"
              >
                <Icon name="close" size={11} />
              </button>
            </Badge>
          )}

          {Object.entries(selectedAttrs).map(([attrName, attrVal]) => (
            <Badge
              key={attrName}
              variant="destructive"
              className="gap-1 font-normal text-xs py-0.5 px-2 bg-red-50 text-red-700 border border-red-100"
            >
              <span>{attrName}: <strong className="font-semibold">{attrVal}</strong></span>
              <button
                onClick={() => removeAttr(attrName)}
                className="text-red-400 hover:text-red-700 ml-0.5 cursor-pointer"
                aria-label={`Xóa lọc ${attrName}`}
              >
                <Icon name="close" size={11} />
              </button>
            </Badge>
          ))}

          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams();
              if (currentFilters.q) params.set('q', currentFilters.q);
              if (currentFilters.sort) params.set('sort', currentFilters.sort);
              router.push(`/search?${params.toString()}`);
            }}
            className="h-auto p-0 text-xs text-red-600 hover:underline font-medium ml-1"
          >
            Xóa tất cả
          </Button>
        </div>
      )}
    </Card>
  );
}
