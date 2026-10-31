import React, { useState, useRef } from 'react';
import { resolveDisplayColor } from '@/utils/colorResolver';

export default function TagInput({ values = [], onChange, placeholder = 'Nhập giá trị, Enter để thêm...', isColor = false }) {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  const addTag = (raw) => {
    const val = raw.trim();
    if (!val) return;
    if (values.find((v) => v.value.toLowerCase() === val.toLowerCase())) return;
    const colorCode = isColor ? resolveDisplayColor('', val) : '';
    onChange([...values, { value: val, colorCode }]);
    setInput('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === 'Backspace' && !input && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  const removeTag = (idx) => onChange(values.filter((_, i) => i !== idx));

  return (
    <div
      className="flex flex-wrap gap-1.5 min-h-[36px] rounded-[6px] border border-input bg-background px-2 py-1.5 cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {values.map((v, i) => (
        <span key={i} className="inline-flex items-center gap-1.5 rounded-[6px] bg-primary/10 border border-primary/20 text-primary text-xs px-2 py-0.5 font-medium">
          {isColor && (
            <span
              className="w-3 h-3 rounded-full border border-black/15 shrink-0 shadow-xs"
              style={{ backgroundColor: resolveDisplayColor(v.colorCode, v.value) }}
            />
          )}
          {v.value}
          <button type="button" className="hover:text-destructive cursor-pointer leading-none ml-0.5" onClick={(e) => { e.stopPropagation(); removeTag(i); }}>×</button>
        </span>
      ))}
      <input
        ref={inputRef}
        className="flex-1 min-w-[120px] text-sm outline-none bg-transparent text-foreground placeholder:text-muted-foreground"
        placeholder={values.length === 0 ? placeholder : ''}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => { if (input.trim()) addTag(input); }}
      />
    </div>
  );
}
