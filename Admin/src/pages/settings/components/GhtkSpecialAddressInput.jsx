import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Loader2, MapPin } from 'lucide-react';
import shippingService from '@/services/shipping.service';

export default function GhtkSpecialAddressInput({
  label = 'Tòa nhà, hẻm, đường',
  placeholder = 'Chọn hoặc nhập tòa nhà, hẻm, đường...',
  value = '',
  onChange,
  province = '',
  district = '',
  ward = '',
  disabled = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Debounce gọi API GHTK getAddressLevel4
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await shippingService.getGhtkLevel4Address({
          province,
          district: district || ward,
          ward_street: ward,
          address: keyword || 'đường',
        });
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn('Lỗi tìm địa chỉ đặc biệt GHTK:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword, province, district, ward, isOpen]);

  const handleSelect = (item) => {
    onChange?.(item);
    setIsOpen(false);
    setKeyword('');
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-[13px] font-medium text-[#212b36] mb-1.5 flex items-center justify-between">
          <span>{label}</span>
          {/* <span className="text-[11px] text-[#0088ff] font-normal">GHTK Level 4 API</span> */}
        </label>
      )}

      {/* TRIGGER BUTTON (GHTK STYLE 100%) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setKeyword('');
          }
        }}
        title={value || placeholder}
        className={`w-full h-9 px-3 text-left rounded-[4px] border flex items-center justify-between text-[13px] transition-colors cursor-pointer ${disabled
            ? 'bg-[#f4f6f8] dark:bg-muted/40 text-[#919eab] dark:text-muted-foreground border-[#dfe3e8] dark:border-border cursor-not-allowed'
            : isOpen
              ? 'border-[#0088ff] ring-1 ring-[#0088ff] bg-white dark:bg-card text-[#212b36] dark:text-foreground'
              : 'border-[#c4cdd5] dark:border-border bg-white dark:bg-card text-[#212b36] dark:text-foreground hover:border-[#919eab]'
          }`}
      >
        <span className={`truncate pr-2 ${value ? 'font-medium text-[#212b36] dark:text-foreground' : 'text-[#919eab] dark:text-muted-foreground'}`}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#637381] dark:text-muted-foreground shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#0088ff]' : ''
            }`}
        />
      </button>

      {/* DROPDOWN MENU CHUẨN GHTK: 'Nhập để tìm kiếm địa chỉ đặc biệt (Tòa nhà, hẻm, đường)' */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] shadow-lg overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
          <div className="p-2 border-b border-[#dfe3e8] dark:border-border bg-[#fafbfb] dark:bg-muted/30 relative">
            <Search className="w-3.5 h-3.5 text-[#919eab] dark:text-muted-foreground absolute left-4.5 top-4.5 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Nhập để tìm kiếm địa chỉ đặc biệt (Tòa nhà, hẻm, đường)"
              className="w-full h-8 pl-8 pr-7 text-[12.5px] rounded-[4px] border border-[#c4cdd5] dark:border-border bg-white dark:bg-background focus:outline-none focus:border-[#0088ff] text-[#212b36] dark:text-foreground placeholder-[#919eab]"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword('')}
                className="absolute right-3.5 top-3.5 text-[#919eab] hover:text-[#212b36] dark:hover:text-foreground p-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="max-h-[240px] overflow-y-auto divide-y divide-[#f4f6f8] dark:divide-border">
            {loading ? (
              <div className="py-6 text-center text-[12px] text-[#919eab] dark:text-muted-foreground flex items-center justify-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0088ff]" /> Đang tra cứu địa chỉ GHTK Level 4...
              </div>
            ) : results.length === 0 ? (
              <div className="py-5 text-center text-[12px] text-[#919eab] dark:text-muted-foreground px-3 space-y-1">
                <p>Không tìm thấy gợi ý hoặc chưa cấu hình GHTK Token</p>
                {keyword && (
                  <button
                    type="button"
                    onClick={() => handleSelect(keyword)}
                    className="text-[#0088ff] hover:underline text-[12px] font-medium cursor-pointer"
                  >
                    Dùng giá trị vừa nhập: "{keyword}"
                  </button>
                )}
              </div>
            ) : (
              results.map((addr, idx) => {
                const text = typeof addr === 'string' ? addr : addr.name || addr.address;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelect(text)}
                    title={text}
                    className="px-3 py-2 cursor-pointer hover:bg-[#f4f6f8] dark:hover:bg-accent text-[13px] text-[#212b36] dark:text-foreground flex items-center gap-2 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#0088ff] shrink-0" />
                    <span className="truncate" title={text}>
                      {text}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
