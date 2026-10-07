'use client';

import React, { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, RotateCcw } from 'lucide-react';
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

  const handleResetAll = () => {
    const params = new URLSearchParams();
    if (currentFilters.q) {
      params.set('q', currentFilters.q);
    }
    router.push(`/search?${params.toString()}`);
  };

  const activeCategory = facets.categories?.find(
    (c) => c._id === currentFilters.category || c.slug === currentFilters.category
  );

  const activeBrand = facets.brands?.find(
    (b) =>
      b._id === currentFilters.brand ||
      b.slug?.toLowerCase() === currentFilters.brand?.toLowerCase() ||
      b.name?.toLowerCase() === currentFilters.brand?.toLowerCase()
  );

  let priceLabel = '';
  if (currentFilters.minPrice && currentFilters.maxPrice) {
    priceLabel = `${(Number(currentFilters.minPrice) / 1000000).toFixed(0)}tr - ${(Number(currentFilters.maxPrice) / 1000000).toFixed(0)}tr`;
  } else if (currentFilters.minPrice) {
    priceLabel = `Trên ${(Number(currentFilters.minPrice) / 1000000).toFixed(0)}tr`;
  } else if (currentFilters.maxPrice) {
    priceLabel = `Dưới ${(Number(currentFilters.maxPrice) / 1000000).toFixed(0)}tr`;
  }

  const activeFilterCount =
    [
      currentFilters.category,
      currentFilters.brand,
      currentFilters.minPrice || currentFilters.maxPrice,
      currentFilters.inStock,
      currentFilters.onSale,
      currentFilters.flashSale,
      currentFilters.rating,
    ].filter(Boolean).length + Object.keys(selectedAttrs).length;

  return (
    <Card className="p-3.5 space-y-3 shadow-xs border-slate-200 animate-fadeIn">
      {/* Top Toolbar Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Filter Toggle & Total Count */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenMobileFilter}
            className="lg:hidden flex items-center gap-1.5 h-8 text-xs rounded-[6px]"
          >
            <SlidersHorizontal size={13} className="text-[#e30019]" />
            <span>Bộ lọc</span>
            {activeFilterCount > 0 && (
              <Badge
                variant="default"
                className="w-4 h-4 p-0 text-[10px] flex items-center justify-center font-bold rounded-full bg-[#e30019] text-white"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
            <span>Tìm thấy</span>
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-900 border border-slate-200 font-bold font-mono tabular-nums px-2 py-0.5 rounded-[4px]"
            >
              {total}
            </Badge>
            <span>kết quả</span>
          </div>
        </div>

        {/* Right: Sort Options as Shadcn Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap hidden md:inline mr-1">
            Ưu tiên xem:
          </span>

          <div className="flex items-center gap-1 bg-slate-100/70 p-0.5 rounded-[6px] border border-slate-200/80">
            {SORT_OPTIONS.map((opt) => {
              const isActive = (currentSort || 'relevance') === opt.value;
              return (
                <Button
                  key={opt.value}
                  type="button"
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleSortChange(opt.value)}
                  className={`h-7 px-3 text-xs rounded-[4px] transition whitespace-nowrap active:scale-[0.98] ${
                    isActive
                      ? 'bg-white text-slate-900 font-bold shadow-2xs hover:bg-white hover:text-slate-900 border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span>{opt.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-slate-400 text-[11px] font-medium mr-1">
            Đang lọc theo:
          </span>

          {activeCategory && (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-[4px] bg-slate-50 border-slate-200 text-slate-800 font-medium hover:border-slate-300"
            >
              <span>Danh mục: <strong>{activeCategory.name}</strong></span>
              <button
                type="button"
                onClick={() => removeFilter('category')}
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-200 transition cursor-pointer"
              >
                <X size={11} />
              </button>
            </Badge>
          )}

          {activeBrand && (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-[4px] bg-slate-50 border-slate-200 text-slate-800 font-medium hover:border-slate-300"
            >
              <span>Hãng: <strong>{activeBrand.name}</strong></span>
              <button
                type="button"
                onClick={() => removeFilter('brand')}
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-200 transition cursor-pointer"
              >
                <X size={11} />
              </button>
            </Badge>
          )}

          {priceLabel && (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-[4px] bg-slate-50 border-slate-200 text-slate-800 font-medium hover:border-slate-300 font-mono"
            >
              <span>Giá: <strong>{priceLabel}</strong></span>
              <button
                type="button"
                onClick={() => removeFilter('price')}
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-200 transition cursor-pointer"
              >
                <X size={11} />
              </button>
            </Badge>
          )}

          {currentFilters.inStock === 'true' && (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-[4px] bg-emerald-50 border-emerald-200 text-emerald-800 font-medium"
            >
              <span>Còn hàng</span>
              <button
                type="button"
                onClick={() => removeFilter('inStock')}
                className="text-emerald-500 hover:text-emerald-800 p-0.5 rounded-full hover:bg-emerald-100 transition cursor-pointer"
              >
                <X size={11} />
              </button>
            </Badge>
          )}

          {currentFilters.onSale === 'true' && (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-[4px] bg-red-50 border-red-200 text-[#e30019] font-medium"
            >
              <span>Đang giảm giá</span>
              <button
                type="button"
                onClick={() => removeFilter('onSale')}
                className="text-red-400 hover:text-[#e30019] p-0.5 rounded-full hover:bg-red-100 transition cursor-pointer"
              >
                <X size={11} />
              </button>
            </Badge>
          )}

          {currentFilters.flashSale === 'true' && (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-[4px] bg-amber-50 border-amber-200 text-amber-800 font-medium"
            >
              <span>Flash Sale</span>
              <button
                type="button"
                onClick={() => removeFilter('flashSale')}
                className="text-amber-500 hover:text-amber-800 p-0.5 rounded-full hover:bg-amber-100 transition cursor-pointer"
              >
                <X size={11} />
              </button>
            </Badge>
          )}

          {currentFilters.rating && (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-[4px] bg-amber-50 border-amber-200 text-amber-800 font-medium"
            >
              <span>Từ {currentFilters.rating} sao</span>
              <button
                type="button"
                onClick={() => removeFilter('rating')}
                className="text-amber-500 hover:text-amber-800 p-0.5 rounded-full hover:bg-amber-100 transition cursor-pointer"
              >
                <X size={11} />
              </button>
            </Badge>
          )}

          {Object.entries(selectedAttrs).map(([attrKey, attrVal]) => (
            <Badge
              key={attrKey}
              variant="outline"
              className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-[4px] bg-slate-50 border-slate-200 text-slate-800 font-medium"
            >
              <span>{attrKey}: <strong>{attrVal}</strong></span>
              <button
                type="button"
                onClick={() => removeAttr(attrKey)}
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-200 transition cursor-pointer"
              >
                <X size={11} />
              </button>
            </Badge>
          ))}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetAll}
            className="h-6 px-2 text-[11px] text-[#e30019] hover:bg-red-50 hover:text-[#c40015] font-semibold ml-auto"
          >
            <RotateCcw size={10} className="mr-1" />
            <span>Xóa tất cả lọc</span>
          </Button>
        </div>
      )}
    </Card>
  );
}
