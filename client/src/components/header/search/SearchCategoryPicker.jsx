'use client';

import React from 'react';
import Icon from '../../common/Icon';

export const SearchCategoryPicker = ({
  categories,
  selectedCategory,
  onSelectCategory,
  isOpen,
  onToggle,
  containerRef,
}) => {
  const currentCategoryLabel =
    categories.find((c) => c.value === selectedCategory)?.label || 'Sản phẩm';

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle();
        }}
        className="flex items-center gap-1.5 pl-3.5 pr-2.5 sm:pl-4 sm:pr-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 cursor-pointer whitespace-nowrap rounded-l-full select-none"
      >
        <span>{currentCategoryLabel}</span>
        <Icon name="chevron-down" size={12} color="#64748b" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-40 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 text-xs animate-fadeIn">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectCategory(cat.value);
              }}
              className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 cursor-pointer transition ${
                selectedCategory === cat.value
                  ? 'font-bold text-[#284ea1] bg-blue-50'
                  : 'text-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchCategoryPicker;
