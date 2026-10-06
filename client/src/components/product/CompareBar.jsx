'use client';

import React from 'react';
import Link from 'next/link';
import { X, ArrowLeftRight, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useCompareStore from '@/store/compareStore';

export const CompareBar = () => {
  const { comparedProducts, isOpen, removeProduct, clearAll, toggleOpen } =
    useCompareStore();

  if (!comparedProducts || comparedProducts.length === 0) return null;

  const productIds = comparedProducts
    .map((p) => p._id || p.id)
    .filter(Boolean)
    .join(',');

  const compareUrl = `/so-sanh?products=${productIds}`;

  // If collapsed: show floating trigger button on bottom left
  if (!isOpen) {
    return (
      <div className="fixed bottom-4 left-4 z-50 animate-fadeIn">
        <Button
          type="button"
          variant="outline"
          onClick={toggleOpen}
          className="rounded-[6px] bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-sm font-bold text-xs gap-2 px-3.5 h-9 group active:scale-[0.98]"
        >
          <ArrowLeftRight size={14} className="text-[#e30019] group-hover:rotate-180 transition-transform" />
          <span>So sánh ({comparedProducts.length})</span>
          <ChevronUp size={13} className="text-slate-400" />
        </Button>
      </div>
    );
  }

  // Expanded Compare Bar at bottom
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg py-3 px-4 sm:px-8 animate-in slide-in-from-bottom duration-200">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Product Slots */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar w-full md:w-auto py-1">
          {comparedProducts.map((p) => {
            const id = p._id || p.id;
            const thumb =
              (typeof p.thumbnail === 'string' ? p.thumbnail : p.thumbnail?.url) ||
              p.images?.[0]?.url ||
              '/logo-shop.jpg';

            return (
              <div
                key={id}
                className="relative flex items-center gap-2.5 p-2 rounded-[6px] border border-slate-200 bg-white shadow-2xs shrink-0 max-w-[200px] sm:max-w-[220px]"
              >
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeProduct(id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-700 hover:bg-[#e30019] text-white flex items-center justify-center text-[10px] shadow-2xs transition cursor-pointer"
                  title="Xóa khỏi so sánh"
                >
                  <X size={11} />
                </button>

                <div className="w-12 h-12 bg-white rounded-[4px] shrink-0 flex items-center justify-center p-1 border border-slate-100">
                  <img src={thumb} alt="" className="w-full h-full object-contain" />
                </div>

                <div className="min-w-0 pr-1">
                  <h4 className="text-xs font-semibold text-slate-800 truncate leading-snug">
                    {p.name}
                  </h4>
                  <div className="text-xs font-bold text-[#e30019] mt-0.5 font-mono tabular-nums">
                    {p.salePrice || p.price
                      ? `${(p.salePrice || p.price).toLocaleString('vi-VN')}₫`
                      : 'Liên hệ'}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty slot placeholder if < 4 */}
          {comparedProducts.length < 4 && (
            <div className="hidden sm:flex items-center justify-center w-36 h-[66px] rounded-[6px] border border-dashed border-slate-300 text-slate-400 text-xs text-center px-2">
              <span>+ Thêm SP ({comparedProducts.length}/4)</span>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 font-medium h-8 rounded-[6px] active:scale-[0.98]"
          >
            <Trash2 size={13} />
            <span>Xóa tất cả</span>
          </Button>

          <Button
            asChild
            size="sm"
            className="bg-[#e30019] hover:bg-[#c40015] text-white font-bold text-xs h-8 px-4 rounded-[6px] active:scale-[0.98]"
          >
            <Link href={compareUrl}>
              So sánh ngay
            </Link>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleOpen}
            className="flex items-center gap-1 border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium h-8 px-2.5 rounded-[6px] active:scale-[0.98]"
          >
            <span>Thu gọn</span>
            <ChevronDown size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompareBar;
