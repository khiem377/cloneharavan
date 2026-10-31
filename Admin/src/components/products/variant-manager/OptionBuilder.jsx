import React from 'react';
import { Plus, Trash2, RefreshCw, Loader2 } from '@/components/ui/Icons';
import TagInput from './TagInput';

export default function OptionBuilder({ options, onChange, parentSku, onGenerate, hasVariants, isGenerating }) {
  const addOption = () => onChange([...options, { name: '', type: 'text', values: [] }]);
  const removeOption = (i) => onChange(options.filter((_, idx) => idx !== i));
  const updateName = (i, name) => {
    const isColor = name.toLowerCase().includes('màu') || name.toLowerCase().includes('color');
    onChange(options.map((o, idx) => idx === i ? { ...o, name, type: isColor ? 'color' : 'text' } : o));
  };
  const updateValues = (i, values) => onChange(options.map((o, idx) => idx === i ? { ...o, values } : o));

  const validOptions = options.filter((o) => o.name.trim() && o.values.some((v) => v.value.trim()));
  const validValueArrays = validOptions.map((o) => o.values.filter((v) => v.value.trim()));
  const comboCount = validValueArrays.length > 0 ? validValueArrays.reduce((a, b) => a * b.length, 1) : 0;

  return (
    <div className="flex flex-col gap-3">
      {options.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-1">
          Chưa có thuộc tính nào. Thêm thuộc tính để tạo biến thể (VD: Màu sắc, RAM, Dung lượng, Size, Chất liệu...)
        </p>
      ) : (
        options.map((opt, i) => {
          const isColor = opt.name.toLowerCase().includes('màu') || opt.name.toLowerCase().includes('color') || opt.type === 'color';
          return (
            <div key={i} className="rounded-[6px] border border-border bg-muted/20 p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  className="h-8 flex-1 rounded-[6px] border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                  placeholder="Tên thuộc tính (VD: Màu sắc / RAM / Size / Dung lượng / Chất liệu...)"
                  value={opt.name}
                  onChange={(e) => updateName(i, e.target.value)}
                />
                <button
                  type="button"
                  className="size-8 flex items-center justify-center rounded-[6px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-[0.98] transition-all cursor-pointer shrink-0"
                  onClick={() => removeOption(i)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <TagInput
                values={opt.values}
                isColor={isColor}
                onChange={(vals) => updateValues(i, vals)}
                placeholder={isColor ? 'Nhập tên màu (VD: Titan Sa Mạc, Xanh Rêu, Đen...) Enter để thêm' : 'Nhập giá trị rồi Enter để thêm (VD: 8GB RAM, Size M, 256GB SSD...)'}
              />
              {opt.values.length > 0 && (
                <p className="text-[10px] text-muted-foreground tabular-nums font-mono">{opt.values.length} giá trị · Nhấn Enter để thêm, Backspace để xóa cuối</p>
              )}
            </div>
          );
        })
      )}

      <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer"
          onClick={addOption}
        >
          <Plus size={14} /> Thêm thuộc tính
        </button>

        {comboCount > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              → Sẽ tạo <strong className="text-foreground tabular-nums font-mono">{comboCount}</strong> biến thể
              {hasVariants && <span className="text-amber-500 ml-1">(đã có biến thể cũ)</span>}
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-2 h-8 px-4 rounded-[6px] bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50"
              onClick={() => onGenerate(validOptions, comboCount)}
              disabled={isGenerating}
            >
              {isGenerating ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              {hasVariants ? 'Tạo lại biến thể' : 'Tạo biến thể'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
