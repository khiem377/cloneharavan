import { useState, useEffect } from 'react';

// ─── helpers ──────────────────────────────────────────────────────────────────
export function formatVND(val) {
  if (!val && val !== 0) return '';
  const n = Number(val);
  if (isNaN(n) || n === 0) return '';
  return n.toLocaleString('vi-VN');
}

export function parseVND(str) {
  if (!str) return null;
  const n = Number(String(str).replace(/\D/g, ''));
  return isNaN(n) || n === 0 ? null : n;
}

/**
 * PriceInput — input tiền VNĐ có format dấu phẩy.
 * Props:
 *   value      — number | null
 *   onChange   — (number | null) => void
 *   placeholder — string (default '0')
 *   className   — extra classes cho <input>
 *   suffix      — suffix icon/text (default '₫')
 *   showSuffix  — boolean (default true)
 */
export default function PriceInput({
  value,
  onChange,
  placeholder = '0',
  className = '',
  suffix = '₫',
  showSuffix = true,
}) {
  const [display, setDisplay] = useState(() => (value ? formatVND(value) : ''));

  useEffect(() => {
    setDisplay(value ? formatVND(value) : '');
  }, [value]);

  const handleChange = (e) => {
    const raw = parseVND(e.target.value);
    setDisplay(raw ? formatVND(raw) : '');
    onChange(raw);
  };

  if (!showSuffix) {
    return (
      <input
        type="text"
        className={`h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors ${className}`}
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div className="relative">
      <input
        type="text"
        className={`h-9 w-full rounded-md border border-input bg-background pl-3 pr-8 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors ${className}`}
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none select-none">
        {suffix}
      </span>
    </div>
  );
}
