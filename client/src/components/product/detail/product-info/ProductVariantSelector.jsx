'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { resolveDisplayColor } from '@/utils/colorResolver';

export default function ProductVariantSelector({
  attributeGroups = [],
  displayVariants = [],
  selectedAttributes = {},
  selectedVariant,
  groupName = 'Phiên bản',
  selectedVariantLabel = '',
  currentBasePrice = 0,
  checkValueStatus,
  getPriceDifferenceLabel,
  formatVariantPriceDiff,
  onSelectAttributeValue,
  onSelectVariant,
}) {
  if (attributeGroups.length > 0) {
    return (
      <div className="flex flex-col gap-3.5 pt-1">
        {attributeGroups.map((group) => {
          const isColorGroup = group.type === 'color' || group.name.toLowerCase().includes('màu');
          const selectedVal = selectedAttributes[group.name] || '';

          return (
            <div key={group.name} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <span>{group.name}:</span>
                  <span className="text-red-600 font-bold normal-case text-xs">
                    {selectedVal || 'Chưa chọn'}
                  </span>
                </label>
                <span className="text-[11px] text-slate-500 font-normal">
                  {isColorGroup ? 'Chọn màu sắc' : `Chọn ${group.name.toLowerCase()}`}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {group.values.map((item) => {
                  const isSelected = selectedVal === item.value;
                  const status = checkValueStatus(group.name, item.value);
                  const diffLabel = getPriceDifferenceLabel(group.name, item.value);
                  const isUnavailable = !status.exists;
                  const isOutOfStockItem = status.exists && !status.inStock;

                  return (
                    <Button
                      key={item.value}
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUnavailable}
                      onClick={() => onSelectAttributeValue(group.name, item.value)}
                      className={`h-9 px-3 gap-1.5 font-medium ${
                        isSelected
                          ? 'border border-red-600 ring-1 ring-red-600 bg-red-50/50 text-red-700 font-bold hover:bg-red-50/70'
                          : isUnavailable
                          ? 'border-dashed border-slate-200 bg-slate-100/70 text-slate-400 opacity-60'
                          : isOutOfStockItem
                          ? 'border-slate-200 bg-slate-50 text-slate-500 line-through hover:border-slate-300'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {isColorGroup && (
                        <span
                          className={`w-3.5 h-3.5 rounded-full border shrink-0 transition-transform ${
                            isSelected ? 'border-red-600 scale-110' : 'border-slate-300'
                          }`}
                          style={{
                            backgroundColor: resolveDisplayColor(item.colorCode, item.value),
                          }}
                        />
                      )}

                      <span>{item.value}</span>

                      {!isSelected && diffLabel && !isUnavailable && (
                        <span className="text-[11px] text-slate-500 font-normal ml-0.5 tabular-nums font-mono">
                          {diffLabel}
                        </span>
                      )}

                      {isSelected && (
                        <Check size={13} className="ml-0.5 shrink-0 text-red-600 stroke-[2.5]" />
                      )}

                      {isOutOfStockItem && !isSelected && (
                        <Badge variant="outline" className="border-0 p-0 text-[10px] text-rose-500 font-normal no-underline ml-1">
                          (Hết hàng)
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (displayVariants.length > 0) {
    return (
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            {groupName}: <span className="text-red-600 font-bold normal-case">{selectedVariantLabel}</span>
          </label>
          <span className="text-[11px] text-slate-500">Chọn phiên bản để xem giá</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {displayVariants.map((variant) => {
            const isSelected =
              (selectedVariant?._id || selectedVariant?.id) === (variant._id || variant.id);
            const label = variant.displayName || variant.title || variant.name || 'Tùy chọn';
            const varPrice = variant.salePrice > 0 ? variant.salePrice : variant.price;
            const hasColor = variant.attributes?.find((a) => a.colorCode)?.colorCode;
            const priceDiff = varPrice - currentBasePrice;
            const diffLabel = !isSelected ? formatVariantPriceDiff(priceDiff) : '';

            return (
              <Button
                key={variant._id || variant.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onSelectVariant?.(variant)}
                className={`h-9 px-3 gap-1.5 font-medium ${
                  isSelected
                    ? 'border border-red-600 ring-1 ring-red-600 bg-red-50/50 text-red-700 font-bold hover:bg-red-50/70'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                {hasColor && (
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"
                    style={{ backgroundColor: hasColor }}
                  />
                )}
                <span>{label}</span>

                {isSelected ? (
                  <>
                    <span className="text-[11px] text-red-700 font-bold ml-1 tabular-nums font-mono">
                      • {varPrice.toLocaleString('vi-VN')}₫
                    </span>
                    <Check size={13} className="ml-0.5 shrink-0 text-red-600 stroke-[2.5]" />
                  </>
                ) : (
                  diffLabel && (
                    <span className="text-[11px] text-slate-500 font-normal ml-0.5 tabular-nums font-mono">
                      {diffLabel}
                    </span>
                  )
                )}
              </Button>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
