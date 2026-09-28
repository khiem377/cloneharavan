'use client';

import React from 'react';
import Link from 'next/link';
import { X, ArrowLeftRight, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
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
        <button
          type="button"
          onClick={toggleOpen}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xl font-bold text-xs transition cursor-pointer active:scale-95 group"
        >
          <ArrowLeftRight size={15} className="text-[#e30019] group-hover:rotate-180 transition-transform" />
          <span>So sánh ({comparedProducts.length})</span>
          <ChevronUp size={14} className="text-slate-400" />
        </button>
      </div>
    );
  }

  // Expanded Compare Bar at bottom
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl py-3 px-4 sm:px-8 animate-in slide-in-from-bottom duration-200">
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
                className="relative flex items-center gap-2.5 p-2 rounded-lg border border-gray-200 bg-white shadow-2xs shrink-0 max-w-[200px] sm:max-w-[220px]"
              >
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeProduct(id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-600 hover:bg-red-600 text-white flex items-center justify-center text-[10px] shadow-xs transition cursor-pointer"
                  title="Xóa khỏi so sánh"
                >
                  <X size={11} />
                </button>

                <div className="w-12 h-12 bg-white rounded-md shrink-0 flex items-center justify-center p-1 border border-gray-100">
                  <img src={thumb} alt="" className="w-full h-full object-contain" />
                </div>

                <div className="min-w-0 pr-1">
                  <h4 className="text-xs font-semibold text-gray-800 truncate leading-snug">
                    {p.name}
                  </h4>
                  <div className="text-xs font-bold text-[#e30019] mt-0.5">
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
            <div className="hidden sm:flex items-center justify-center w-36 h-[66px] rounded-lg border border-dashed border-gray-300 text-gray-400 text-xs text-center px-2">
              <span>+ Thêm sản phẩm ({comparedProducts.length}/4)</span>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-2 md:pt-0 border-gray-100">
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 font-medium transition cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Xóa tất cả</span>
          </button>

          <Link
            href={compareUrl}
            className="px-5 py-2 rounded-md border border-blue-600 bg-white hover:bg-blue-50 text-blue-600 font-bold text-xs transition shadow-2xs cursor-pointer active:scale-95"
          >
            So sánh ngay
          </Link>

          <button
            type="button"
            onClick={toggleOpen}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-medium transition cursor-pointer"
          >
            <span>Thu gọn</span>
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompareBar;
