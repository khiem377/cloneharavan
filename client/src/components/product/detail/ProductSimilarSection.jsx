'use client';

import React from 'react';
import ProductCard from '@/components/product/ProductCard';
import { Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function ProductSimilarSection({ products = [] }) {
  if (!Array.isArray(products) || products.length === 0) return null;

  return (
    <Card className="rounded-[6px] border-slate-200 bg-white p-4 sm:p-6 flex flex-col gap-4 shadow-none">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-red-600" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-tight">
            Sản phẩm tương tự & Cùng phân khúc
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {products.map((item) => (
          <div key={item._id || item.id} className="h-full">
            <ProductCard product={item} />
          </div>
        ))}
      </div>
    </Card>
  );
}
