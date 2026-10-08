'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Search, X, Check, Loader2 } from 'lucide-react';

/**
 * Bảng viết tắt / alias phổ biến
 */
const COMMON_ALIASES = {
  hcm: 'ho chi minh',
  tphcm: 'tp ho chi minh',
  sg: 'sai gon',
  hn: 'ha noi',
  tphn: 'tp ha noi',
  dn: 'da nang',
  tpdn: 'tp da nang',
  hp: 'hai phong',
  ct: 'can tho',
  vt: 'vung tau',
  bd: 'binh duong',
  dnai: 'dong nai',
  q1: 'quan 1',
  q2: 'quan 2',
  q3: 'quan 3',
  q4: 'quan 4',
  q5: 'quan 5',
  q6: 'quan 6',
  q7: 'quan 7',
  q8: 'quan 8',
  q9: 'quan 9',
  q10: 'quan 10',
  q11: 'quan 11',
  q12: 'quan 12',
  bt: 'binh tan',
  btth: 'binh thanh',
  gv: 'go vap',
  pn: 'phu nhuan',
  tb: 'tan binh',
  tp: 'tan phu',
  td: 'thu duc',
};

/**
 * Hàm bỏ dấu tiếng Việt để tìm kiếm không dấu / có dấu linh hoạt
 */
const removeVietnameseTones = (str) => {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
};

export const SearchableSelect = ({
  options = [],
  value = null,
  onChange,
  placeholder = '-- Chọn một mục --',
  searchPlaceholder = 'Tìm kiếm...',
  disabled = false,
  loading = false,
  clearable = true,
  emptyText = 'Không tìm thấy kết quả phù hợp',
  className = '',
  buttonClassName = '',
  required = false,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  // Chuẩn hóa options dạng { value, label, raw }
  const normalizedOptions = useMemo(() => {
    if (!Array.isArray(options)) return [];
    return options.map((opt) => {
      if (typeof opt === 'object' && opt !== null) {
        return {
          value: opt.value !== undefined ? opt.value : opt.id || opt.ProvinceID || opt.DistrictID || opt.WardCode,
          label: opt.label !== undefined ? opt.label : opt.name || opt.ProvinceName || opt.DistrictName || opt.WardName || String(opt.value),
          raw: opt,
        };
      }
      return { value: opt, label: String(opt), raw: opt };
    });
  }, [options]);

  // Tìm option đang được chọn
  const selectedOption = useMemo(() => {
    if (value === null || value === undefined || value === '') return null;
    return normalizedOptions.find((opt) => String(opt.value) === String(value)) || null;
  }, [normalizedOptions, value]);

  // Lọc options theo từ khóa tìm kiếm (hỗ trợ có dấu, không dấu, viết tắt alias)
  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return normalizedOptions;

    const cleanQuery = removeVietnameseTones(q);
    const aliasExpansion = COMMON_ALIASES[cleanQuery] || '';

    return normalizedOptions.filter((opt) => {
      const label = String(opt.label || '');
      const cleanLabel = removeVietnameseTones(label);

      return (
        cleanLabel.includes(cleanQuery) ||
        label.toLowerCase().includes(q) ||
        (aliasExpansion && cleanLabel.includes(aliasExpansion))
      );
    });
  }, [normalizedOptions, searchQuery]);

  // Click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset search và auto focus khi mở dropdown
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setHighlightedIndex(-1);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Xử lý chọn option
  const handleSelect = (opt) => {
    if (disabled) return;
    if (onChange) {
      onChange(opt ? opt.value : null, opt ? opt.raw : null);
    }
    setIsOpen(false);
  };

  // Xử lý xóa lựa chọn
  const handleClear = (e) => {
    e.stopPropagation();
    if (disabled) return;
    if (onChange) {
      onChange(null, null);
    }
  };

  // Điều khiển bằng bàn phím
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full text-left select-none ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden input để hỗ trợ form validation */}
      <input
        type="hidden"
        id={id}
        name={id}
        value={selectedOption ? selectedOption.value : ''}
        required={required}
      />

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => !disabled && !loading && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs rounded-[6px] border transition cursor-pointer text-left ${
          disabled
            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            : isOpen
            ? 'bg-white text-slate-900 border-[#e30019] ring-1 ring-[#e30019]/20 shadow-2xs'
            : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
        } ${buttonClassName}`}
      >
        <span
          title={selectedOption ? selectedOption.label : ''}
          className={`truncate flex-1 min-w-0 ${
            selectedOption ? 'font-medium text-slate-900' : 'text-slate-400'
          }`}
        >
          {loading
            ? 'Đang tải dữ liệu...'
            : selectedOption
            ? selectedOption.label
            : placeholder}
        </span>

        <div className="flex items-center gap-1 shrink-0 text-slate-400 ml-1">
          {loading ? (
            <Loader2 size={13} className="animate-spin text-[#e30019]" />
          ) : (
            <>
              {clearable && selectedOption && !disabled && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleClear}
                  className="p-0.5 rounded-full hover:bg-slate-100 hover:text-slate-600 transition"
                  title="Xóa lựa chọn"
                >
                  <X size={12} />
                </span>
              )}
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-slate-700' : ''
                }`}
              />
            </>
          )}
        </div>
      </button>

      {/* Popover Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute left-0 w-full min-w-full sm:min-w-[260px] top-full mt-1 z-[60] bg-white rounded-[6px] border border-slate-200 shadow-lg overflow-hidden animate-fadeIn text-xs">
          {/* Search Box with Autofill Prevention */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-lpignore="true"
                data-form-type="other"
                name={`filter_${Math.random().toString(36).substring(7)}`}
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-[4px] border border-slate-200 bg-white focus:outline-none focus:border-[#e30019] transition placeholder:text-slate-400 text-slate-800"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div
            ref={listRef}
            className="max-h-60 overflow-y-auto p-1 space-y-0.5 overscroll-contain"
          >
            {filteredOptions.length === 0 ? (
              <div className="py-6 px-3 text-center text-slate-400 text-xs">
                {emptyText}
              </div>
            ) : (
              filteredOptions.map((opt, index) => {
                const isSelected =
                  selectedOption && String(selectedOption.value) === String(opt.value);
                const isHighlighted = highlightedIndex === index;

                return (
                  <div
                    key={`${opt.value}-${index}`}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-[4px] cursor-pointer transition text-xs ${
                      isSelected
                        ? 'bg-red-50 text-[#e30019] font-bold'
                        : isHighlighted
                        ? 'bg-slate-100 text-slate-900 font-medium'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="leading-snug break-words">{opt.label}</span>
                    {isSelected && (
                      <Check size={13} className="shrink-0 text-[#e30019]" strokeWidth={2.5} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
