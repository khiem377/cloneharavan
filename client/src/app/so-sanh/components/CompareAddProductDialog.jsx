'use client';

import React from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function CompareAddProductDialog({
  isOpen,
  onOpenChange,
  searchQuery,
  onSearchChange,
  searching,
  searchResults = [],
  products = [],
  onSelectProduct,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0">
        <DialogHeader className="p-4 border-b border-slate-200">
          <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Plus size={16} className="text-red-600" />
            <span>Thêm sản phẩm vào bảng so sánh</span>
          </DialogTitle>
        </DialogHeader>
        <div className="p-4 space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Nhập tên sản phẩm, mã SKU để tìm kiếm..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-[6px] border border-slate-200 focus:outline-hidden focus:border-red-600"
              autoFocus
            />
          </div>

          {searching && (
            <div className="py-6 text-center text-xs text-slate-500">
              Đang tìm kiếm sản phẩm...
            </div>
          )}

          {!searching && searchResults.length > 0 && (
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {searchResults.map((item) => {
                const itemId = item._id || item.id;
                const isAlreadyAdded = products.some((p) => (p._id || p.id) === itemId);
                const thumb =
                  (typeof item.thumbnail === 'string' ? item.thumbnail : item.thumbnail?.url) ||
                  item.images?.[0]?.url ||
                  '/logo-shop.jpg';
                const price = item.salePrice || item.price || 0;

                return (
                  <div
                    key={itemId}
                    className="p-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-[4px] transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={thumb}
                        alt={item.name}
                        className="w-10 h-10 object-contain rounded-[4px] border border-slate-200 shrink-0 bg-white"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] font-mono text-red-600 font-bold tabular-nums">
                          {price > 0 ? `${price.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={isAlreadyAdded ? 'secondary' : 'default'}
                      disabled={isAlreadyAdded}
                      onClick={() => onSelectProduct(item)}
                      className="text-xs h-7 shrink-0 rounded-[6px]"
                    >
                      {isAlreadyAdded ? 'Đã thêm' : 'Chọn so sánh'}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {!searching && searchQuery.trim() && searchResults.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-500">
              Không tìm thấy sản phẩm phù hợp
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
