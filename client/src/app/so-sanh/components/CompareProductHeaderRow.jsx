'use client';

import React from 'react';
import Link from 'next/link';
import { X, ShoppingBag, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function CompareProductHeaderRow({
  products = [],
  onRemoveProduct,
  onOpenAddModal,
  onAddToCart,
}) {
  const maxProducts = 4;
  const canAddMore = products.length < maxProducts;

  return (
    <TooltipProvider delayDuration={150}>
      <thead>
        <tr>
          <th className="w-48 sm:w-60 p-4 text-left font-bold text-slate-900 bg-slate-50/80 align-top border-r border-slate-200">
            <div className="space-y-1">
              <span className="text-sm font-bold text-slate-900">Sản phẩm đối chiếu</span>
              <p className="text-[11px] font-normal text-slate-500 leading-relaxed">
                Tối đa {maxProducts} sản phẩm. So sánh trực quan sự khác biệt giữa các dòng máy.
              </p>
            </div>
          </th>

          {products.map((p) => {
            const id = p._id || p.id;
            const thumb =
              (typeof p.thumbnail === 'string' ? p.thumbnail : p.thumbnail?.url) ||
              p.images?.[0]?.url ||
              '/logo-shop.jpg';

            const price = p.salePrice || p.price || 0;
            const origPrice = p.salePrice && p.price && p.price > p.salePrice ? p.price : 0;
            const hasDiscount = origPrice > price;
            const discountPct = hasDiscount ? Math.round(((origPrice - price) / origPrice) * 100) : 0;

            return (
              <th
                key={id}
                className="p-4 text-left font-normal border-r border-slate-200 align-top w-64 max-w-[280px] relative bg-white"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveProduct(id)}
                      className="absolute top-2.5 right-2.5 h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-[4px] z-10"
                      aria-label="Xóa sản phẩm"
                    >
                      <X size={15} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Xóa sản phẩm này</p>
                  </TooltipContent>
                </Tooltip>

                <div className="space-y-3">
                  <div className="w-full aspect-square bg-white rounded-[6px] border border-slate-200 p-2 flex items-center justify-center relative overflow-hidden group">
                    {hasDiscount && (
                      <Badge
                        variant="destructive"
                        className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-[4px] text-[10px] font-mono font-bold z-10 bg-red-600 text-white"
                      >
                        -{discountPct}%
                      </Badge>
                    )}
                    <img
                      src={thumb}
                      alt={p.name}
                      className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>

                  <Link
                    href={`/products/${p.slug || id}`}
                    className="font-bold text-slate-900 hover:text-red-600 line-clamp-2 leading-snug transition block text-xs sm:text-sm"
                  >
                    {p.name}
                  </Link>

                  <div className="space-y-0.5">
                    <div className="text-base font-bold text-red-600 font-mono tabular-nums">
                      {price > 0 ? `${price.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                    </div>
                    {hasDiscount && (
                      <div className="text-xs text-slate-400 line-through font-mono tabular-nums">
                        {origPrice.toLocaleString('vi-VN')}₫
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => onAddToCart(p)}
                    className="w-full h-8 text-xs font-semibold rounded-[6px] gap-1.5 bg-red-600 hover:bg-red-700 active:scale-[0.98]"
                  >
                    <ShoppingBag size={13} />
                    <span>Mua ngay</span>
                  </Button>
                </div>
              </th>
            );
          })}

          {canAddMore && (
            <th className="p-4 text-center font-normal align-middle w-56 bg-slate-50/50">
              <Button
                type="button"
                variant="outline"
                onClick={onOpenAddModal}
                className="w-full min-h-[220px] h-auto border-2 border-dashed border-slate-300 hover:border-red-500 hover:bg-red-50/20 rounded-[6px] flex flex-col items-center justify-center p-4 transition group whitespace-normal"
              >
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 group-hover:border-red-400 group-hover:text-red-600 text-slate-500 flex items-center justify-center mb-2 shadow-2xs">
                  <Plus size={18} />
                </div>
                <span className="text-xs font-bold text-slate-700 group-hover:text-red-600">
                  Thêm sản phẩm
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  ({products.length}/{maxProducts})
                </span>
              </Button>
            </th>
          )}
        </tr>
      </thead>
    </TooltipProvider>
  );
}
