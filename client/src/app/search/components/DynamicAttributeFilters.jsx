'use client';

import React, { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { Checkbox } from '../../../components/ui/checkbox';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';

export default function DynamicAttributeFilters({
  attributes = [],
  selectedAttrs = {},
  onSelectAttr,
}) {
  const [openGroups, setOpenGroups] = useState(() => {
    const initial = {};
    attributes.forEach((attr) => {
      initial[attr.name] = true;
    });
    return initial;
  });

  if (!attributes || attributes.length === 0) return null;

  const toggleGroup = (name) => {
    setOpenGroups((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isCompactValues = (values = []) => {
    return values.length > 0 && values.every((v) => String(v.value).length <= 6);
  };

  return (
    <>
      {attributes.map((group) => {
        const isOpen = openGroups[group.name] !== false;
        const currentSelectedVal = selectedAttrs[group.name] || '';
        const compact = isCompactValues(group.values);

        return (
          <div key={group.name} className="border-t border-gray-200">
            <button
              type="button"
              onClick={() => toggleGroup(group.name)}
              className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 transition cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-gray-900 uppercase">
                  {group.name}
                </span>
                {currentSelectedVal && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                )}
              </div>
              <Icon
                name="chevron-down"
                size={14}
                className={`text-gray-500 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isOpen && (
              <div className="px-4 pb-4">
                {compact ? (
                  <div className="flex flex-wrap gap-1.5">
                    {group.values.map((v) => {
                      const isSelected = currentSelectedVal === v.value;
                      return (
                        <Button
                          key={v.value}
                          type="button"
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          onClick={() =>
                            onSelectAttr(group.name, isSelected ? '' : v.value)
                          }
                          className={
                            isSelected
                              ? 'h-auto py-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 border-red-600 font-bold shadow-xs'
                              : 'h-auto py-1 px-2.5 font-normal text-gray-700'
                          }
                        >
                          <span>{v.value}</span>
                          <Badge
                            variant={isSelected ? 'destructive' : 'secondary'}
                            className="px-1 py-0 text-[10px] ml-1 rounded-sm"
                          >
                            {v.count}
                          </Badge>
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                    {group.values.map((v) => {
                      const isSelected = currentSelectedVal === v.value;
                      return (
                        <label
                          key={v.value}
                          className="flex items-center justify-between py-1 px-1 rounded hover:bg-gray-50 text-xs text-gray-700 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={isSelected}
                              onChange={() =>
                                onSelectAttr(group.name, isSelected ? '' : v.value)
                              }
                            />
                            <span
                              className={
                                isSelected ? 'font-bold text-red-600' : 'font-normal'
                              }
                            >
                              {v.value}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-400">
                            ({v.count})
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
