import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

export function formatVND(val) {
  if (!val && val !== 0) return '';
  return Number(val).toLocaleString('vi-VN');
}

export function parseVND(str) {
  return Number(String(str).replace(/\D/g, '')) || 0;
}

export function PriceInput({ value, onChange, placeholder = '0', className = '' }) {
  const [display, setDisplay] = useState(() => (value ? formatVND(value) : ''));

  useEffect(() => {
    setDisplay(value ? formatVND(value) : '');
  }, [value]);

  const handleChange = (e) => {
    const raw = parseVND(e.target.value);
    setDisplay(raw ? formatVND(raw) : '');
    onChange(raw);
  };

  return (
    <Input
      type="text"
      className={`h-8 rounded-[6px] text-xs font-mono tabular-nums ${className}`}
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
    />
  );
}
