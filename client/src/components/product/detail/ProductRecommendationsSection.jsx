'use client';

import React from 'react';
import ProductCard from '@/components/product/ProductCard';

export default function ProductRecommendationsSection({
  similarProducts = [],
  personalizedProducts = [],
  frequentlyBought = [],
}) {
  const hasPersonalized = Array.isArray(personalizedProducts) && personalizedProducts.length > 0;
  const hasSimilar = Array.isArray(similarProducts) && similarProducts.length > 0;
  const hasFrequently = Array.isArray(frequentlyBought) && frequentlyBought.length > 0;

  if (!hasPersonalized && !hasSimilar && !hasFrequently) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* KHUNG 1: GỢI Ý DÀNH RIÊNG CHO BẠN (CÁ NHÂN HÓA - THUẬT TOÁN PYTHON SVD) */}
      {hasPersonalized && (
        <div className="rounded-[6px] border border-slate-200 bg-white p-4 sm:p-6 flex flex-col gap-4">
          <div className="border-b border-slate-100 pb-2.5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-tight">
              GỢI Ý DÀNH RIÊNG CHO BẠN
            </h2>
            {/* <span className="text-[11px] text-slate-500">
              Đề xuất tự động từ hành vi quan tâm & mô hình AI SVD
            </span> */}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-1">
            {personalizedProducts.slice(0, 5).map((item) => (
              <div key={item._id || item.id} className="h-full">
                <ProductCard product={item} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KHUNG 2: SẢN PHẨM CÙNG LOẠI & PHÂN KHÚC (SIMILAR PRODUCTS) */}
      {hasSimilar && (
        <div className="rounded-[6px] border border-slate-200 bg-white p-4 sm:p-6 flex flex-col gap-4">
          <div className="border-b border-slate-100 pb-2.5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-tight">
              SẢN PHẨM CÙNG LOẠI & PHÂN KHÚC
            </h2>
            {/* <span className="text-[11px] text-slate-500">
              Các model tương đương về phân khúc giá & cấu hình
            </span> */}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-1">
            {similarProducts.slice(0, 5).map((item) => (
              <div key={item._id || item.id} className="h-full">
                <ProductCard product={item} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KHUNG 3: QUÀ TẶNG & SẢN PHẨM MUA KÈM THEO CHƯƠNG TRÌNH */}
      {hasFrequently && (
        <div className="rounded-[6px] border border-slate-200 bg-white p-4 sm:p-6 flex flex-col gap-4">
          <div className="border-b border-slate-100 pb-2.5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-tight">
              QUÀ TẶNG & SẢN PHẨM MUA KÈM THEO CHƯƠNG TRÌNH
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-1">
            {frequentlyBought.slice(0, 5).map((item) => (
              <div key={item._id || item.id} className="h-full flex flex-col">
                {item._giftBadge && (
                  <div className="mb-1.5 px-2 py-1 rounded-[4px] bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold text-center uppercase tracking-wide">
                    {item._giftBadge}
                  </div>
                )}
                <div className="flex-1">
                  <ProductCard product={item} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
