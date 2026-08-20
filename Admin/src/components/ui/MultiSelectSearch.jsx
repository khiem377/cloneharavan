import { useState, useRef, useEffect } from 'react';
import { X, Search, ChevronDown } from '@/components/ui/Icons';

export default function MultiSelectSearch({
  options = [],
  selected = [],
  onChange,
  placeholder = 'Tìm kiếm và chọn...',
  chipColor = 'primary',
}) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState('');
  const ref                 = useRef(null);
  const inputRef            = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const filtered      = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );
  const selectedItems = options.filter(o => selected.includes(o.value));

  const toggle = (value) => {
    onChange(selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value]
    );
  };

  const chipClass = chipColor === 'primary'
    ? 'bg-primary/10 text-primary'
    : 'bg-muted text-foreground';

  return (
    <div ref={ref} className="relative">
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedItems.map(item => (
            <span key={item.value} className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${chipClass}`}>
              {item.prefix}{item.label}
              <button
                type="button"
                onClick={() => toggle(item.value)}
                className="hover:text-destructive transition-colors"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between h-9 px-3 rounded-md border border-input bg-background text-sm text-muted-foreground hover:border-ring transition-colors"
      >
        <span>{placeholder}</span>
        <ChevronDown className={`size-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <input
                ref={inputRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full h-8 pl-8 pr-3 rounded-md border border-input bg-background text-xs outline-none focus:border-ring"
              />
            </div>
          </div>

          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-2.5 text-xs text-muted-foreground text-center">Không tìm thấy kết quả</div>
            ) : (
              filtered.map(option => {
                const isSelected = selected.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggle(option.value)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${isSelected ? 'bg-primary/5 text-primary' : 'text-foreground'}`}
                  >
                    <span>{option.prefix}{option.label}</span>
                    {isSelected && (
                      <div className="size-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <svg className="size-2.5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
