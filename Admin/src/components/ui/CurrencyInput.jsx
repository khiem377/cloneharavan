import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * Input nhập số tiền VNĐ — tự động format dấu phẩy khi nhập.
 * Nhận `value` (number | string | '') và gọi `onChange(number | null)`.
 */
export default function CurrencyInput({
  value,
  onChange,
  placeholder = '0',
  className = '',
  min = 0,
  disabled = false,
  id,
}) {
  const formatDisplay = (raw) => {
    if (raw === '' || raw === null || raw === undefined) return '';
    const num = Number(String(raw).replace(/,/g, ''));
    if (isNaN(num)) return '';
    return num.toLocaleString('vi-VN');
  };

  const [display, setDisplay] = useState(() => formatDisplay(value));

  // Sync display khi value thay đổi từ bên ngoài (ví dụ khi reset form)
  useEffect(() => {
    setDisplay(formatDisplay(value));
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\./g, '').replace(/,/g, '');
    if (raw === '') {
      setDisplay('');
      onChange(null);
      return;
    }
    const num = parseInt(raw, 10);
    if (isNaN(num)) return;
    if (min !== undefined && num < min) return;
    setDisplay(num.toLocaleString('vi-VN'));
    onChange(num);
  };

  const handleKeyDown = (e) => {
    // Cho phép: số, backspace, delete, tab, arrow, home/end
    const allowed = [
      'Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight',
      'ArrowUp', 'ArrowDown', 'Home', 'End',
    ];
    if (allowed.includes(e.key)) return;
    if (/^\d$/.test(e.key)) return;
    e.preventDefault();
  };

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      disabled={disabled}
      value={display}
      placeholder={placeholder}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      className={cn(
        'h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none',
        'focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors',
        'disabled:opacity-60',
        className
      )}
    />
  );
}
