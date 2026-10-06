'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  SlidersHorizontal,
  RotateCcw,
  X,
  Star,
  CheckCircle2,
  Sparkles,
  Zap,
  Percent,
  Check,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Checkbox } from '../../../components/ui/checkbox';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../../../components/ui/accordion';
import PriceRangeSlider from './PriceRangeSlider';
import BrandFilterSection from './BrandFilterSection';
import DynamicAttributeFilters from './DynamicAttributeFilters';

const PRICE_PRESETS = [
  { label: 'Tất cả mức giá', minPrice: '', maxPrice: '' },
  { label: 'Dưới 2 triệu', minPrice: '0', maxPrice: '2000000' },
  { label: 'Từ 2 - 5 triệu', minPrice: '2000000', maxPrice: '5000000' },
  { label: 'Từ 5 - 10 triệu', minPrice: '5000000', maxPrice: '10000000' },
  { label: 'Từ 10 - 20 triệu', minPrice: '10000000', maxPrice: '20000000' },
  { label: 'Trên 20 triệu', minPrice: '20000000', maxPrice: '' },
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
    promotion: true,
    rating: false,
    attributes: true,
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

  const activeFiltersCount =
    [
      currentFilters.category,
      currentFilters.brand,
      currentFilters.minPrice || currentFilters.maxPrice,
      currentFilters.inStock,
      currentFilters.onSale,
      currentFilters.rating,
    ].filter(Boolean).length + Object.keys(selectedAttrs).length;

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
    <Card className="w-full shadow-xs flex flex-col max-h-[calc(100vh-140px)] overflow-hidden p-0 border-slate-200">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-[#e30019]" />
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Bộ lọc tìm kiếm
          </h2>
          {activeFiltersCount > 0 && (
            <Badge
              variant="default"
              className="bg-[#e30019] text-white text-[10px] font-bold px-1.5 py-0 rounded-full h-4 min-w-[16px] flex items-center justify-center"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-7 px-2 text-xs font-medium text-[#e30019] hover:bg-red-50 hover:text-[#c40015] rounded-[4px] active:scale-[0.98]"
            >
              <RotateCcw size={11} className="mr-1" />
              <span>Xóa tất cả</span>
            </Button>
          )}

          {onCloseMobile && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onCloseMobile}
              className="lg:hidden h-7 w-7 text-slate-400 hover:bg-slate-100 rounded-[4px]"
            >
              <X size={15} />
            </Button>
          )}
        </div>
      </div>

      {/* Accordion Filter Sections */}
      <div className="overflow-y-auto flex-1 scrollbar-thin divide-y divide-slate-100">
        <Accordion>
          {/* SECTION 1: KHOẢNG GIÁ */}
          <AccordionItem value="price">
            <AccordionTrigger
              isOpen={openSections.price}
              onToggle={() => toggleSection('price')}
            >
              <span>Khoảng giá</span>
            </AccordionTrigger>

            <AccordionContent isOpen={openSections.price}>
              <div className="space-y-3 pt-1">
                <PriceRangeSlider
                  minPrice={currentFilters.minPrice}
                  maxPrice={currentFilters.maxPrice}
                  onApply={updateFilters}
                />

                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Mức giá phổ biến:
                  </span>
                  {PRICE_PRESETS.map((preset, idx) => {
                    const active = isPresetActive(preset);
                    return (
                      <label
                        key={idx}
                        className={`flex items-center gap-2.5 py-1 px-1.5 rounded-[4px] text-xs transition cursor-pointer select-none ${
                          active
                            ? 'bg-red-50/70 text-[#e30019] font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
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
                        <span className="flex-1">{preset.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* SECTION 2: DANH MỤC */}
          {categories.length > 0 && (
            <AccordionItem value="category">
              <AccordionTrigger
                isOpen={openSections.category}
                onToggle={() => toggleSection('category')}
              >
                <span>Danh mục sản phẩm</span>
              </AccordionTrigger>

              <AccordionContent isOpen={openSections.category}>
                <div className="space-y-1 pt-1 max-h-52 overflow-y-auto pr-0.5 scrollbar-thin">
                  {categories.map((cat) => {
                    const isSelected =
                      currentFilters.category === cat._id ||
                      currentFilters.category === cat.slug;
                    return (
                      <label
                        key={cat._id}
                        className={`flex items-center justify-between py-1 px-1.5 rounded-[4px] text-xs transition cursor-pointer select-none ${
                          isSelected
                            ? 'bg-red-50/70 text-[#e30019] font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Checkbox
                            checked={isSelected}
                            onChange={() =>
                              updateFilters({
                                category: isSelected ? '' : cat.slug || cat._id,
                              })
                            }
                          />
                          <span className="truncate">{cat.name}</span>
                        </div>
                        {typeof cat.count === 'number' && (
                          <span className="text-[11px] text-slate-400 font-mono tabular-nums shrink-0 ml-1">
                            ({cat.count})
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* SECTION 3: THƯƠNG HIỆU */}
          {brands.length > 0 && (
            <AccordionItem value="brand">
              <AccordionTrigger
                isOpen={openSections.brand}
                onToggle={() => toggleSection('brand')}
              >
                <span>Thương hiệu</span>
              </AccordionTrigger>

              <AccordionContent isOpen={openSections.brand}>
                <div className="pt-1">
                  <BrandFilterSection
                    brands={brands}
                    selectedBrand={currentFilters.brand}
                    onSelectBrand={(brandSlug) =>
                      updateFilters({ brand: brandSlug })
                    }
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          )}



          {/* SECTION 6: THUỘC TÍNH ĐỘNG */}
          {attributes.length > 0 && (
            <AccordionItem value="attributes">
              <AccordionTrigger
                isOpen={openSections.attributes}
                onToggle={() => toggleSection('attributes')}
              >
                <span>Thông số & Tính năng</span>
              </AccordionTrigger>

              <AccordionContent isOpen={openSections.attributes}>
                <div className="pt-1">
                  <DynamicAttributeFilters
                    attributes={attributes}
                    selectedAttrs={selectedAttrs}
                    onSelectAttr={handleSelectAttr}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </Card>
  );
}
