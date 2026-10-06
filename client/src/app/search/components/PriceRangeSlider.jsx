'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';

const MAX_LIMIT = 50000000;
const STEP = 500000;

export default function PriceRangeSlider({
  minPrice = '',
  maxPrice = '',
  onApply,
}) {
  const initialMin = minPrice ? Math.min(Number(minPrice), MAX_LIMIT - STEP) : 0;
  const initialMax = maxPrice ? Math.max(Number(maxPrice), STEP) : MAX_LIMIT;

  const [minVal, setMinVal] = useState(initialMin);
  const [maxVal, setMaxVal] = useState(initialMax);

  useEffect(() => {
    setMinVal(minPrice ? Math.min(Number(minPrice), MAX_LIMIT - STEP) : 0);
  }, [minPrice]);

  useEffect(() => {
    setMaxVal(maxPrice ? Math.max(Number(maxPrice), STEP) : MAX_LIMIT);
  }, [maxPrice]);

  const minPercent = Math.min(100, Math.max(0, (minVal / MAX_LIMIT) * 100));
  const maxPercent = Math.min(100, Math.max(0, (maxVal / MAX_LIMIT) * 100));

  const handleMinChange = (e) => {
    const val = Math.min(Number(e.target.value), maxVal - STEP);
    setMinVal(val);
  };

  const handleMaxChange = (e) => {
    const val = Math.max(Number(e.target.value), minVal + STEP);
    setMaxVal(val);
  };

  const handleApply = () => {
    onApply({
      minPrice: minVal > 0 ? String(minVal) : '',
      maxPrice: maxVal < MAX_LIMIT ? String(maxVal) : '',
    });
  };

  const formatPrice = (val) => {
    if (val >= 1000000) {
      const tr = val / 1000000;
      return `${tr % 1 === 0 ? tr : tr.toFixed(1)} tr`;
    }
    return `${(val / 1000).toLocaleString('vi-VN')}k`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
        <span>Từ: <strong className="text-slate-900 font-mono tabular-nums">{formatPrice(minVal)}</strong></span>
        <span>Đến: <strong className="text-slate-900 font-mono tabular-nums">{maxVal >= MAX_LIMIT ? '50+ tr' : formatPrice(maxVal)}</strong></span>
      </div>

      <div className="relative w-full h-6 flex items-center select-none py-2">
        <div className="absolute w-full h-1.5 bg-slate-200 rounded-full" />
        <div
          className="absolute h-1.5 bg-[#e30019] rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${Math.max(0, maxPercent - minPercent)}%`,
          }}
        />

        <input
          type="range"
          min={0}
          max={MAX_LIMIT}
          step={STEP}
          value={minVal}
          onChange={handleMinChange}
          className="dual-slider absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none z-20"
        />

        <input
          type="range"
          min={0}
          max={MAX_LIMIT}
          step={STEP}
          value={maxVal}
          onChange={handleMaxChange}
          className="dual-slider absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none z-20"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="space-y-1">
          <Label className="text-[10px] text-slate-500 font-medium">
            Từ (đ)
          </Label>
          <Input
            type="number"
            min={0}
            max={MAX_LIMIT}
            step={STEP}
            value={minVal}
            onChange={(e) => setMinVal(Math.min(Number(e.target.value) || 0, maxVal - STEP))}
            className="h-7 text-xs font-mono rounded-[6px]"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-slate-500 font-medium">
            Đến (đ)
          </Label>
          <Input
            type="number"
            min={0}
            max={MAX_LIMIT}
            step={STEP}
            value={maxVal}
            onChange={(e) => setMaxVal(Math.max(Number(e.target.value) || 0, minVal + STEP))}
            className="h-7 text-xs font-mono rounded-[6px]"
          />
        </div>
      </div>

      <Button
        type="button"
        size="sm"
        onClick={handleApply}
        className="w-full text-xs font-semibold bg-[#e30019] hover:bg-[#c40015] text-white rounded-[6px] h-8 shadow-xs active:scale-[0.98]"
      >
        Áp dụng khoảng giá
      </Button>

      <style jsx>{`
        .dual-slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ffffff;
          border: 2.5px solid #e30019;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          pointer-events: auto;
          cursor: pointer;
          transition: transform 0.1s ease;
        }
        .dual-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        .dual-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ffffff;
          border: 2.5px solid #e30019;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          pointer-events: auto;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
