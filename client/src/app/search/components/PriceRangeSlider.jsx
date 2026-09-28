import React, { useState, useEffect } from 'react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';

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
      <div className="flex items-center justify-between text-xs text-gray-600 font-medium">
        <span>Từ: <strong className="text-gray-900">{formatPrice(minVal)}</strong></span>
        <span>Đến: <strong className="text-gray-900">{maxVal >= MAX_LIMIT ? '50+ tr' : formatPrice(maxVal)}</strong></span>
      </div>

      <div className="relative w-full h-6 flex items-center select-none py-2">
        <div className="absolute w-full h-1.5 bg-gray-200 rounded-full" />
        <div
          className="absolute h-1.5 bg-red-600 rounded-full"
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
        <div>
          <label className="text-[10px] text-gray-500 font-medium block mb-1">
            Từ (đ)
          </label>
          <Input
            type="number"
            min={0}
            max={MAX_LIMIT}
            step={STEP}
            value={minVal}
            onChange={(e) => setMinVal(Math.min(Number(e.target.value) || 0, maxVal - STEP))}
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-500 font-medium block mb-1">
            Đến (đ)
          </label>
          <Input
            type="number"
            min={0}
            max={MAX_LIMIT}
            step={STEP}
            value={maxVal}
            onChange={(e) => setMaxVal(Math.max(Number(e.target.value) || 0, minVal + STEP))}
          />
        </div>
      </div>

      <Button
        type="button"
        onClick={handleApply}
        className="w-full text-xs font-semibold"
      >
        Áp dụng khoảng giá
      </Button>


      <style jsx>{`
        .dual-slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid #dc2626;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
          pointer-events: auto;
          cursor: pointer;
          transition: transform 0.1s ease;
        }
        .dual-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        .dual-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid #dc2626;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
          pointer-events: auto;
          cursor: pointer;
        }

      `}</style>
    </div>
  );
}
