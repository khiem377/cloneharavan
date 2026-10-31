import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, PlusCircle, Check } from 'lucide-react';

export default function PartnerSelectDropdown({
  selectedCode,
  onSelect,
  partners = [],
  onAddNew,
  placeholder = 'Chọn đối tác',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  const selectedPartner = partners.find((p) => p.code === selectedCode);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const filteredPartners = partners.filter((p) =>
    (p.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-8 px-2.5 rounded-[6px] border border-[#dfe3e8] dark:border-border bg-white dark:bg-card text-left text-[12.5px] text-[#212b36] dark:text-foreground flex items-center justify-between cursor-pointer focus:outline-none focus:border-[#0088ff]"
      >
        <span className={selectedPartner ? 'font-medium' : 'text-[#919eab]'}>
          {selectedPartner ? selectedPartner.name : placeholder}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-[#637381]" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-full bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] shadow-sm py-1 text-[12.5px]">
          {/* Search box */}
          <div className="px-2 py-1.5 border-b border-[#dfe3e8] dark:border-border">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-[#919eab]" />
              <input
                type="text"
                autoFocus
                placeholder="Tìm kiếm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-7 pl-7 pr-2 text-[12px] rounded-[4px] border border-[#dfe3e8] dark:border-border focus:outline-none focus:border-[#0088ff]"
              />
            </div>
          </div>

          {/* "+ Thêm mới" action row */}
          {onAddNew && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onAddNew();
              }}
              className="w-full px-3 py-2 text-left text-[#0088ff] hover:bg-[#f4f6f8] dark:hover:bg-muted flex items-center gap-2 cursor-pointer font-medium border-b border-[#dfe3e8] dark:border-border"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#0088ff]" />
              <span>Thêm mới</span>
            </button>
          )}

          {/* Partners list */}
          <div className="max-h-48 overflow-y-auto">
            {filteredPartners.length === 0 ? (
              <div className="px-3 py-2 text-center text-[#919eab] text-[12px]">Không tìm thấy đối tác</div>
            ) : (
              filteredPartners.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    onSelect(item.code);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left flex items-center justify-between cursor-pointer hover:bg-[#f4f6f8] dark:hover:bg-muted ${
                    selectedCode === item.code ? 'text-[#0088ff] font-medium bg-[#f0f7ff] dark:bg-sky-950/30' : 'text-[#212b36] dark:text-foreground'
                  }`}
                >
                  <span>{item.name} {item.isDefault ? '(Mặc định)' : ''}</span>
                  {selectedCode === item.code && <Check className="w-3.5 h-3.5 text-[#0088ff]" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
