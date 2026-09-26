import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search, Plus } from './Icons';

export default function SearchableSelect({
  options = [],
  value = '',
  onChange,
  placeholder = 'Chọn hoặc tìm kiếm...',
  creatable = true,
  disabled = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Chuẩn hóa danh sách options thành mảng dạng { label, value }
  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'object' && opt !== null) {
        return { label: opt.label ?? opt.name ?? opt.value, value: opt.value ?? opt.id ?? opt._id };
      }
      return { label: String(opt), value: String(opt) };
    });
  }, [options]);

  // Option hiện tại được chọn
  const selectedOption = useMemo(() => {
    return normalizedOptions.find((opt) => String(opt.value) === String(value)) || (value ? { label: String(value), value: String(value) } : null);
  }, [normalizedOptions, value]);

  // Lọc options theo từ khóa tìm kiếm
  const filteredOptions = useMemo(() => {
    if (!search.trim()) return normalizedOptions;
    const query = search.toLowerCase().trim();
    return normalizedOptions.filter(
      (opt) => opt.label.toLowerCase().includes(query) || String(opt.value).toLowerCase().includes(query)
    );
  }, [normalizedOptions, search]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tự động focus ô tìm kiếm khi mở dropdown
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (val) => {
    onChange && onChange(val);
    setIsOpen(false);
    setSearch('');
  };

  const handleCreateCustom = () => {
    if (!search.trim()) return;
    handleSelect(search.trim());
  };

  const isExactMatch = normalizedOptions.some(
    (opt) => opt.label.toLowerCase().trim() === search.toLowerCase().trim()
  );

  return (
    <div ref={containerRef} className={`relative ${className || 'w-full'}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all flex items-center justify-between gap-2 shadow-2xs ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-muted-foreground/40'
        } ${isOpen ? 'border-ring ring-2 ring-ring/20' : ''}`}
      >
        <span className={`truncate font-medium ${selectedOption ? 'text-foreground' : 'text-muted-foreground'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`size-4 text-muted-foreground transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 min-w-[180px] rounded-lg border border-border bg-popover text-popover-foreground shadow-lg overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Search Box Header */}
          <div className="p-2 border-b border-border bg-muted/30 flex items-center gap-2">
            <Search className="size-3.5 text-muted-foreground shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (filteredOptions.length > 0) {
                    handleSelect(filteredOptions[0].value);
                  } else if (creatable && search.trim()) {
                    handleCreateCustom();
                  }
                }
              }}
            />
          </div>

          {/* Options List */}
          <div className="max-h-52 overflow-y-auto p-1 space-y-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="size-3.5 text-primary shrink-0 ml-2" />}
                  </button>
                );
              })
            ) : (
              <div className="py-2 px-3 text-center text-xs text-muted-foreground">
                Không tìm thấy kết quả
              </div>
            )}

            {/* Custom Option Creation */}
            {creatable && search.trim() && !isExactMatch && (
              <button
                type="button"
                onClick={handleCreateCustom}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs font-medium text-primary hover:bg-primary/10 transition-colors border-t border-border mt-1 cursor-pointer"
              >
                <Plus className="size-3.5 shrink-0" />
                <span className="truncate">Sử dụng giá trị: "<strong className="underline">{search.trim()}</strong>"</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
