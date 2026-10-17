import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X, Check, Loader2 } from 'lucide-react';
import shippingService from '@/services/shipping.service';

/**
 * Loại bỏ dấu tiếng Việt để tìm kiếm từ khóa linh hoạt không phân biệt dấu
 */
export function removeVietnameseTones(str = '') {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

export default function AddressApiSelect({
  label,
  placeholder = 'Chọn địa chỉ...',
  value = '',
  onChange,
  type = 'province', // 'province' | 'district' | 'ward'
  parentId = null,
  disabled = false,
  source = 'ghtk', // Mặc định 'ghtk' (có hỗ trợ old_provinces và old_wards)
  className = '',
  autoOpen = false,
  onAutoOpenHandled,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const inputSearchRef = useRef(null);

  // Tự động mở dropdown khi có chỉ định autoOpen và danh sách đã tải xong
  useEffect(() => {
    if (autoOpen && !disabled && items.length > 0) {
      setIsOpen(true);
      onAutoOpenHandled?.();
    }
  }, [autoOpen, disabled, items.length, onAutoOpenHandled]);

  // Gọi API lấy danh sách tương ứng từ server
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      // 1. NGUỒN GHTK (Giao Hàng Tiết Kiệm API chuẩn)
      if (source === 'ghtk') {
        if (type === 'province') {
          try {
            setLoading(true);
            const res = await shippingService.getGhtkProvinces();
            if (!isMounted) return;
            const mapped = (res || []).map((p) => ({
              id: p.id,
              name: p.name,
              code: p.id,
              oldName:
                Array.isArray(p.old_provinces) && p.old_provinces.length > 0
                  ? p.old_provinces.map((op) => op.name).join(', ')
                  : '',
            }));
            setItems(mapped);
          } catch (err) {
            console.warn('[AddressApiSelect] Lỗi tải tỉnh GHTK từ API:', err);
          } finally {
            if (isMounted) setLoading(false);
          }
        } else if (type === 'ward') {
          if (!parentId) {
            setItems([]);
            return;
          }
          try {
            setLoading(true);
            const res = await shippingService.getGhtkWards(parentId);
            if (!isMounted) return;
            const mapped = (res || []).map((w) => ({
              id: w.id,
              name: w.name,
              code: w.id,
              districtName: w.district?.name || w.name,
              oldName:
                Array.isArray(w.old_wards) && w.old_wards.length > 0
                  ? w.old_wards.map((ow) => ow.name).join(', ')
                  : '',
            }));
            setItems(mapped);
          } catch (err) {
            console.warn('[AddressApiSelect] Lỗi tải phường GHTK từ API:', err);
          } finally {
            if (isMounted) setLoading(false);
          }
        }
        return;
      }

      // 2. NGUỒN GHN FALLBACK (Nếu được chỉ định)
      if (type === 'province') {
        try {
          setLoading(true);
          const res = await shippingService.getProvinces();
          if (!isMounted) return;
          const mapped = (res || []).map((p) => ({
            id: p.ProvinceID,
            name: p.ProvinceName,
            code: p.Code,
            oldName: Array.isArray(p.ExtensionName) && p.ExtensionName.length > 0 ? p.ExtensionName.join(', ') : '',
          }));
          setItems(mapped);
        } catch (err) {
          console.warn('[AddressApiSelect] Lỗi tải tỉnh thành từ API:', err);
        } finally {
          if (isMounted) setLoading(false);
        }
      } else if (type === 'district') {
        if (!parentId) {
          setItems([]);
          return;
        }
        try {
          setLoading(true);
          const res = await shippingService.getDistricts(parentId);
          if (!isMounted) return;
          const mapped = (res || []).map((d) => ({
            id: d.DistrictID,
            name: d.DistrictName,
            code: d.Code,
            oldName: Array.isArray(d.ExtensionName) && d.ExtensionName.length > 0 ? d.ExtensionName.join(', ') : '',
          }));
          setItems(mapped);
        } catch (err) {
          console.warn('[AddressApiSelect] Lỗi tải quận huyện từ API:', err);
        } finally {
          if (isMounted) setLoading(false);
        }
      } else if (type === 'ward') {
        if (!parentId) {
          setItems([]);
          return;
        }
        try {
          setLoading(true);
          const res = await shippingService.getWards(parentId);
          if (!isMounted) return;
          const mapped = (res || []).map((w) => ({
            id: w.WardCode,
            name: w.WardName,
            code: w.WardCode,
            oldName: Array.isArray(w.ExtensionName) && w.ExtensionName.length > 0 ? w.ExtensionName.join(', ') : '',
          }));
          setItems(mapped);
        } catch (err) {
          console.warn('[AddressApiSelect] Lỗi tải phường xã từ API:', err);
        } finally {
          if (isMounted) setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [type, parentId, source]);

  // Đóng khi click ra ngoài
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      setTimeout(() => {
        inputSearchRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Lọc theo từ khóa tìm kiếm (hỗ trợ cả tên mới và tên hành chính cũ / liên quan)
  const filteredItems = useMemo(() => {
    if (!keyword.trim()) return items;
    const cleanKw = removeVietnameseTones(keyword);
    return items.filter((item) => {
      const matchNew = removeVietnameseTones(item.name).includes(cleanKw);
      const matchOld = item.oldName ? removeVietnameseTones(item.oldName).includes(cleanKw) : false;
      return matchNew || matchOld;
    });
  }, [items, keyword]);

  const handleSelect = (item) => {
    onChange?.(item);
    setIsOpen(false);
    setKeyword('');
  };

  const currentItem = useMemo(() => {
    if (!value) return null;
    return items.find(
      (it) => it.name === value || removeVietnameseTones(it.name) === removeVietnameseTones(value)
    );
  }, [value, items]);

  const fullDisplayText = useMemo(() => {
    if (!value) return '';
    if (currentItem?.oldName) {
      return `${value} (${currentItem.oldName})`;
    }
    return value;
  }, [value, currentItem]);

  const [isHovered, setIsHovered] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef(null);

  const checkOverflow = () => {
    if (textRef.current) {
      setIsOverflowing(textRef.current.scrollWidth > textRef.current.clientWidth);
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-[13px] font-medium text-[#212b36] dark:text-foreground mb-1.5">{label}</label>
      )}

      {/* TRIGGER BUTTON SAPO 100% */}
      <div
        className="relative"
        onMouseEnter={() => {
          setIsHovered(true);
          checkOverflow();
        }}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          type="button"
          disabled={disabled || (type !== 'province' && !parentId)}
          onClick={() => {
            if (!disabled) {
              setIsOpen(!isOpen);
              setKeyword('');
            }
          }}
          title={fullDisplayText || placeholder}
          className={`w-full h-9 px-3 text-left rounded-[4px] border flex items-center justify-between text-[13px] transition-colors cursor-pointer ${
            disabled || (type !== 'province' && !parentId)
              ? 'bg-[#f4f6f8] dark:bg-muted/40 text-[#919eab] dark:text-muted-foreground border-[#dfe3e8] dark:border-border cursor-not-allowed'
              : isOpen
              ? 'border-[#0088ff] ring-1 ring-[#0088ff] bg-white dark:bg-card text-[#212b36] dark:text-foreground'
              : 'border-[#c4cdd5] dark:border-border bg-white dark:bg-card text-[#212b36] dark:text-foreground hover:border-[#919eab]'
          }`}
        >
          <div className="truncate flex-1 min-w-0 pr-2 text-left">
            {loading ? (
              <span className="text-[#919eab] dark:text-muted-foreground inline-flex items-center gap-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0088ff]" /> Đang tải...
              </span>
            ) : value ? (
              <span ref={textRef} className="truncate block">
                <span className="font-medium text-[#212b36] dark:text-foreground">{value}</span>
                {currentItem?.oldName && (
                  <span className="text-[12px] text-[#637381] dark:text-muted-foreground font-normal ml-1.5">
                    ({currentItem.oldName})
                  </span>
                )}
              </span>
            ) : (
              <span className="text-[#919eab] dark:text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-[#637381] dark:text-muted-foreground shrink-0 transition-transform ${
              isOpen ? 'rotate-180 text-[#0088ff]' : ''
            }`}
          />
        </button>

        {/* HOVER TOOLTIP KHI CÓ ĐỊA GIỚI CŨ HOẶC TEXT BỊ TRUNCATE */}
        {isHovered && !isOpen && fullDisplayText && (isOverflowing || currentItem?.oldName) && (
          <div className="absolute bottom-full left-0 mb-1.5 z-60 px-3 py-1.5 text-[12px] leading-snug rounded-[6px] bg-[#212b36] dark:bg-popover text-white dark:text-popover-foreground border border-slate-700 dark:border-border shadow-xl pointer-events-none max-w-sm sm:max-w-md break-words animate-in fade-in-50 zoom-in-95 duration-100">
            <div className="font-medium text-white dark:text-foreground">{value}</div>
            {currentItem?.oldName && (
              <div className="text-[11.5px] text-slate-300 dark:text-muted-foreground mt-0.5">
                ({currentItem.oldName})
              </div>
            )}
          </div>
        )}
      </div>

      {/* DROPDOWN MENU PHONG CÁCH GHTK / SAPO QUA LIVE CARRIER API */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] shadow-lg overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Ô TÌM KIẾM 'Nhập từ khóa' */}
          <div className="p-2 border-b border-[#dfe3e8] dark:border-border bg-[#fafbfb] dark:bg-muted/30 relative">
            <Search className="w-3.5 h-3.5 text-[#919eab] dark:text-muted-foreground absolute left-4.5 top-4.5 pointer-events-none" />
            <input
              ref={inputSearchRef}
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Nhập từ khóa"
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

          {/* DANH SÁCH CUỘN VỚI TÊN MỚI (ĐẬM) & TÊN CŨ (NHỎ DƯỚI) TỪ API */}
          <div className="max-h-[260px] overflow-y-auto divide-y divide-[#f4f6f8] dark:divide-border">
            {loading ? (
              <div className="py-6 text-center text-[12px] text-[#919eab] dark:text-muted-foreground flex items-center justify-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0088ff]" /> Đang tải danh sách từ API đối tác...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-6 text-center text-[12px] text-[#919eab] dark:text-muted-foreground px-3">
                {items.length === 0
                  ? `Vui lòng chọn ${type === 'ward' ? 'Quận/Huyện' : 'Tỉnh/Thành phố'} trước`
                  : 'Không tìm thấy đơn vị hành chính phù hợp'}
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected =
                  value === item.name ||
                  removeVietnameseTones(value) === removeVietnameseTones(item.name);

                return (
                  <div
                    key={item.id || item.code || item.name}
                    onClick={() => handleSelect(item)}
                    title={item.oldName ? `${item.name} (${item.oldName})` : item.name}
                    className={`px-3 py-2 cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#e8f2fe] text-[#0088ff] dark:bg-blue-950/50 dark:text-blue-400'
                        : 'hover:bg-[#f4f6f8] dark:hover:bg-accent text-[#212b36] dark:text-foreground'
                    }`}
                  >
                    <div className="min-w-0 pr-2 flex-1">
                      {/* Tên hành chính mới (Đậm) */}
                      <div
                        className={`text-[13px] leading-tight ${
                          isSelected ? 'font-bold text-[#0088ff] dark:text-blue-400' : 'font-semibold text-[#212b36] dark:text-foreground'
                        }`}
                      >
                        {item.name}
                      </div>

                      {/* Tên hành chính cũ / Extension Name nếu API trả về */}
                      {item.oldName && (
                        <div
                          title={item.oldName}
                          className="text-[11px] text-[#919eab] dark:text-muted-foreground leading-tight mt-0.5 truncate"
                        >
                          {item.oldName}
                        </div>
                      )}
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-[#0088ff] shrink-0" />}
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
