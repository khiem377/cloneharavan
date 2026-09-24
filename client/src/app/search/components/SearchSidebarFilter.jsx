'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Icon from '@/components/common/Icon';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import PriceRangeSlider from './PriceRangeSlider';
import BrandFilterSection from './BrandFilterSection';
import DynamicAttributeFilters from './DynamicAttributeFilters';

const PRICE_PRESETS = [
  { label: 'Tất cả', minPrice: '', maxPrice: '' },
  { label: 'Từ 0đ - 2.000.000đ', minPrice: '0', maxPrice: '2000000' },
  { label: 'Từ 2.000.000đ - 5.000.000đ', minPrice: '2000000', maxPrice: '5000000' },
  { label: 'Từ 5.000.000đ - 10.000.000đ', minPrice: '5000000', maxPrice: '10000000' },
  { label: 'Từ 10.000.000đ - 20.000.000đ', minPrice: '10000000', maxPrice: '20000000' },
  { label: 'Trên 20.000.000đ', minPrice: '20000000', maxPrice: '' },
];

export default function SearchSidebarFilter({
  facets = {},
  currentFilters = {},
  onCloseMobile,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const basePath = pathname || '/search';

  const [openSections, setOpenSections] = useState({
    price: true,
    category: true,
    brand: true,
    stock: true,
  });

  const categories = facets.categories || [];
  const brands = facets.brands || [];
  const attributes = facets.attributes || [];

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

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFilters = (newParams) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    params.delete('page');
    const queryString = params.toString();
    router.push(queryString ? `${basePath}?${queryString}` : basePath);
    if (onCloseMobile) onCloseMobile();
  };

  const handleSelectAttr = (attrName, attrValue) => {
    const next = { ...selectedAttrs };
    if (!attrValue) {
      delete next[attrName];
    } else {
      next[attrName] = attrValue;
    }

    updateFilters({
      attrs: Object.keys(next).length > 0 ? JSON.stringify(next) : '',
    });
  };

  const handleReset = () => {
    const params = new URLSearchParams();
    if (currentFilters.q) {
      params.set('q', currentFilters.q);
    }
    const queryString = params.toString();
    router.push(queryString ? `${basePath}?${queryString}` : basePath);
    if (onCloseMobile) onCloseMobile();
  };

  const hasActiveFilters = Boolean(
    currentFilters.category ||
    currentFilters.brand ||
    currentFilters.minPrice ||
    currentFilters.maxPrice ||
    currentFilters.inStock ||
    Object.keys(selectedAttrs).length > 0
  );

  const isPresetActive = (preset) => {
    if (!preset.minPrice && !preset.maxPrice) {
      return !currentFilters.minPrice && !currentFilters.maxPrice;
    }
    return (
      (currentFilters.minPrice || '') === preset.minPrice &&
      (currentFilters.maxPrice || '') === preset.maxPrice
    );
  };

  return (
    <Card className="w-full shadow-xs flex flex-col max-h-[calc(100vh-140px)] overflow-hidden p-0">
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <Icon name="filter" size={16} className="text-gray-700" />
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Bộ lọc tìm kiếm
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={handleReset}
              className="h-auto p-0 text-xs font-medium text-red-600 hover:underline"
            >
              Xóa tất cả
            </Button>
          )}

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 rounded text-gray-400 hover:bg-gray-100 cursor-pointer"
            >
              <Icon name="close" size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-y-auto flex-1 divide-y divide-gray-200 scrollbar-thin pr-0.5">
        <div>
          <button
            type="button"
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 transition cursor-pointer"
          >
            <span className="text-xs font-bold text-gray-900 uppercase">Khoảng giá</span>
            <Icon
              name="chevron-down"
              size={14}
              className={`text-gray-500 transition-transform duration-200 ${
                openSections.price ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSections.price && (
            <div className="px-4 pb-4 space-y-3.5">
              <PriceRangeSlider
                minPrice={currentFilters.minPrice}
                maxPrice={currentFilters.maxPrice}
                onApply={updateFilters}
              />

              <div className="pt-2 border-t border-gray-100 space-y-1.5">
                <span className="text-[11px] font-semibold text-gray-500 block mb-1">
                  Mốc giá phổ biến
                </span>
                {PRICE_PRESETS.map((preset, idx) => {
                  const active = isPresetActive(preset);
                  return (
                    <label
                      key={idx}
                      className="flex items-center gap-2.5 py-1 px-1 rounded hover:bg-gray-50 text-xs text-gray-700 cursor-pointer select-none"
                    >
                      <Checkbox
                        checked={active}
                        onChange={() =>
                          updateFilters({
                            minPrice: active ? '' : preset.minPrice,
                            maxPrice: active ? '' : preset.maxPrice,
                          })
                        }
                      />
                      <span className={active ? 'font-bold text-red-600' : 'font-normal'}>
                        {preset.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {categories.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => toggleSection('category')}
              className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 transition cursor-pointer"
            >
              <span className="text-xs font-bold text-gray-900 uppercase">Danh mục</span>
              <Icon
                name="chevron-down"
                size={14}
                className={`text-gray-500 transition-transform duration-200 ${
                  openSections.category ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openSections.category && (
              <div className="px-4 pb-4 space-y-1.5">
                {categories.map((cat) => {
                  const isSelected =
                    currentFilters.category === cat._id ||
                    currentFilters.category === cat.slug;
                  return (
                    <label
                      key={cat._id}
                      className="flex items-center justify-between py-1 px-1 rounded hover:bg-gray-50 text-xs text-gray-700 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={isSelected}
                          onChange={() =>
                            updateFilters({
                              category: isSelected ? '' : cat.slug || cat._id,
                            })
                          }
                        />
                        <span className={isSelected ? 'font-bold text-red-600' : 'font-normal'}>
                          {cat.name}
                        </span>
                      </div>
                      {typeof cat.count === 'number' && (
                        <span className="text-[11px] text-gray-400">({cat.count})</span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <DynamicAttributeFilters
          attributes={attributes}
          selectedAttrs={selectedAttrs}
          onSelectAttr={handleSelectAttr}
        />

        {brands.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => toggleSection('brand')}
              className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 transition cursor-pointer"
            >
              <span className="text-xs font-bold text-gray-900 uppercase">Thương hiệu</span>
              <Icon
                name="chevron-down"
                size={14}
                className={`text-gray-500 transition-transform duration-200 ${
                  openSections.brand ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openSections.brand && (
              <div className="px-4 pb-4">
                <BrandFilterSection
                  brands={brands}
                  selectedBrand={currentFilters.brand}
                  onSelectBrand={(val) => updateFilters({ brand: val })}
                />
              </div>
            )}
          </div>
        )}

        <div>
          <button
            type="button"
            onClick={() => toggleSection('stock')}
            className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 transition cursor-pointer"
          >
            <span className="text-xs font-bold text-gray-900 uppercase">Tình trạng</span>
            <Icon
              name="chevron-down"
              size={14}
              className={`text-gray-500 transition-transform duration-200 ${
                openSections.stock ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSections.stock && (
            <div className="px-4 pb-4">
              <label className="flex items-center gap-2 py-1 px-1 rounded hover:bg-gray-50 text-xs text-gray-700 cursor-pointer select-none">
                <Checkbox
                  checked={
                    currentFilters.inStock === 'true' ||
                    currentFilters.inStock === true ||
                    currentFilters.inStock === '1'
                  }
                  onChange={(e) =>
                    updateFilters({ inStock: e.target.checked ? 'true' : '' })
                  }
                />
                <span>Chỉ hiện sản phẩm còn hàng</span>
              </label>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
