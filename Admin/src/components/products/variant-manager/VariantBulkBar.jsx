import React, { useState } from 'react';
import { parsePrice } from './variantManagerUtils';

export default function VariantBulkBar({ onSetAll }) {
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState('');

  const applyPrice = () => {
    const v = parsePrice(price);
    if (v !== null) {
      onSetAll('price', v);
      setPrice('');
    }
  };

  const applySale = () => {
    const v = parsePrice(salePrice);
    if (v !== null) {
      onSetAll('salePrice', v);
      setSalePrice('');
    }
  };

  const applyStock = () => {
    if (stock !== '') {
      onSetAll('stock', Number(stock));
      setStock('');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-muted/20 border-b border-border">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide shrink-0">Áp dụng cho tất cả:</span>
      <div className="flex items-center gap-1">
        <input
          className="h-6 w-28 rounded-[6px] border border-input bg-background px-2 text-xs outline-none focus:border-ring text-foreground placeholder:text-muted-foreground tabular-nums font-mono"
          placeholder="Giá niêm yết"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
        />
        <button
          type="button"
          className="h-6 px-2 rounded-[6px] bg-muted border border-border text-xs hover:bg-accent cursor-pointer transition-colors font-medium active:scale-[0.98]"
          onClick={applyPrice}
        >
          Áp dụng
        </button>
      </div>
      <div className="flex items-center gap-1">
        <input
          className="h-6 w-28 rounded-[6px] border border-input bg-background px-2 text-xs outline-none focus:border-ring text-foreground placeholder:text-muted-foreground tabular-nums font-mono"
          placeholder="Giá khuyến mãi"
          value={salePrice}
          onChange={(e) => setSalePrice(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applySale()}
        />
        <button
          type="button"
          className="h-6 px-2 rounded-[6px] bg-muted border border-border text-xs hover:bg-accent cursor-pointer transition-colors font-medium active:scale-[0.98]"
          onClick={applySale}
        >
          Áp dụng
        </button>
      </div>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min="0"
          className="h-6 w-20 rounded-[6px] border border-input bg-background px-2 text-xs outline-none focus:border-ring text-foreground placeholder:text-muted-foreground tabular-nums font-mono"
          placeholder="Tồn kho"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyStock()}
        />
        <button
          type="button"
          className="h-6 px-2 rounded-[6px] bg-muted border border-border text-xs hover:bg-accent cursor-pointer transition-colors font-medium active:scale-[0.98]"
          onClick={applyStock}
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
}
