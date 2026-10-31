'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { resolveDisplayColor } from '@/utils/colorResolver';

export default function QuickViewVariantOptions({
  attributeGroups = [],
  displayVariants = [],
  selectedAttributes = {},
  selectedVariant,
  checkValueStatus,
  handleSelectAttributeValue,
  handleSelectVariant,
  getVariantLabel,
  groupTitle,
  variantError,
}) {
  if (attributeGroups.length > 0) {
    return (
      <div className={`space-y-3 pt-1 p-2 rounded-[6px] transition-all ${variantError ? 'bg-red-50/40 border border-red-200 ring-1 ring-red-200' : ''}`}>
        {attributeGroups.map((group) => {
          const isColorGroup = group.type === 'color' || group.name.toLowerCase().includes('màu');
          const selectedVal = selectedAttributes[group.name] || '';

          return (
            <div key={group.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span>{group.name}:</span>
                {selectedVal ? (
                  <span className="text-slate-500 font-normal">
                    Đã chọn: <strong className="text-red-600">{selectedVal}</strong>
                  </span>
                ) : (
                  <span className="text-slate-400 font-normal text-[11px]">Chưa chọn</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {group.values.map((item) => {
                  const isSelected = selectedVal === item.value;
                  const status = checkValueStatus(group.name, item.value);
                  const isUnavailable = !status.exists;
                  const isOutOfStockItem = status.exists && !status.inStock;

                  return (
                    <Button
                      key={item.value}
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUnavailable}
                      onClick={() => handleSelectAttributeValue(group.name, item.value)}
                      className={`h-8 px-2.5 text-xs font-medium gap-1.5 ${
                        isSelected
                          ? 'border border-red-600 ring-1 ring-red-600 text-red-600 bg-red-50/30 font-bold shadow-2xs hover:bg-red-50/50'
                          : isUnavailable
                          ? 'border-dashed border-slate-200 bg-slate-100 text-slate-400 opacity-60'
                          : isOutOfStockItem
                          ? 'border-slate-200 bg-slate-50 text-slate-400 line-through'
                          : 'border-slate-200 text-slate-700 bg-white hover:border-slate-300'
                      }`}
                    >
                      {isColorGroup && (
                        <span
                          className={`w-3.5 h-3.5 rounded-full border shrink-0 ${
                            isSelected ? 'border-red-600 scale-110' : 'border-slate-300'
                          }`}
                          style={{
                            backgroundColor: resolveDisplayColor(item.colorCode, item.value),
                          }}
                        />
                      )}
                      <span>{item.value}</span>
                      {isOutOfStockItem && !isSelected && (
                        <span className="text-[9px] text-red-500 font-normal no-underline ml-0.5">
                          (Hết)
                        </span>
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

  if (displayVariants.length > 1) {
    return (
      <div className={`space-y-1.5 pt-1 p-2 rounded-[6px] transition-all ${variantError ? 'bg-red-50/40 border border-red-200 ring-1 ring-red-200' : ''}`}>
        <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
          <span>{groupTitle}:</span>
          {selectedVariant && (
            <span className="text-slate-500 font-normal">
              Đã chọn: <strong className="text-slate-900">{getVariantLabel(selectedVariant)}</strong>
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {displayVariants.map((v, i) => {
            const isSelected =
              Boolean(selectedVariant) &&
              ((selectedVariant?._id && selectedVariant._id === v._id) ||
                (selectedVariant?.sku && selectedVariant.sku === v.sku));
            return (
              <Button
                key={v._id || v.sku || i}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSelectVariant(v)}
                className={`h-8 px-2.5 text-xs font-medium ${
                  isSelected
                    ? 'border border-red-600 ring-1 ring-red-600 text-red-600 bg-red-50/20 font-bold shadow-2xs hover:bg-red-50/40'
                    : 'border-slate-200 text-slate-700 bg-white hover:border-slate-300'
                }`}
              >
                {getVariantLabel(v)}
              </Button>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
