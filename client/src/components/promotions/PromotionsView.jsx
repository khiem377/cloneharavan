'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, SearchX } from 'lucide-react';
import promotionService from '@/services/promotion.service';
import PromotionsHeader from './PromotionsHeader';
import PromotionsToolbar from './PromotionsToolbar';
import PromotionCard from './PromotionCard';
import PromotionsSkeleton from './PromotionsSkeleton';

export default function PromotionsView({ initialPromotions = [] }) {
  const [promotions, setPromotions] = useState(initialPromotions);
  const [loading, setLoading] = useState(!initialPromotions || initialPromotions.length === 0);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // CSR fetch if SSR empty
  useEffect(() => {
    if (!initialPromotions || initialPromotions.length === 0) {
      promotionService
        .getActivePromotions({ limit: 50 })
        .then((data) => {
          setPromotions(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [initialPromotions]);

  const counts = useMemo(() => {
    const all = promotions.length;
    const percent = promotions.filter((p) => p.type === 'percent_discount').length;
    const buy_x = promotions.filter((p) => p.type === 'buy_x_pay_y').length;
    const fixed = promotions.filter((p) => p.type === 'fixed_discount').length;
    return { all, percent, buy_x, fixed };
  }, [promotions]);

  const filteredPromotions = useMemo(() => {
    return promotions.filter((p) => {
      // Filter by type
      if (filterType !== 'all' && p.type !== filterType) return false;

      // Filter by search term
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const nameMatch = p.name?.toLowerCase().includes(term);
        const descMatch = p.description?.toLowerCase().includes(term);
        if (!nameMatch && !descMatch) return false;
      }
      return true;
    });
  }, [promotions, filterType, searchTerm]);

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-16">
      {/* Header */}
      <PromotionsHeader totalCount={promotions.length} />

      <div className="max-w-[1536px] 2xl:max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8 mt-5 sm:mt-6">
        {/* Toolbar */}
        <PromotionsToolbar
          filterType={filterType}
          onFilterChange={setFilterType}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          counts={counts}
        />

        {/* Content States */}
        {loading ? (
          <PromotionsSkeleton count={4} />
        ) : filteredPromotions.length === 0 ? (
          <div className="bg-white rounded-[6px] border border-slate-200 p-12 text-center my-6">
            <div className="size-12 rounded-[6px] bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <SearchX size={24} />
            </div>
            <p className="text-sm font-bold text-slate-800">Không có chương trình khuyến mãi nào</p>
            <p className="text-xs text-slate-500 mt-1">
              {searchTerm ? `Không có chương trình nào khớp với "${searchTerm}"` : 'Hãy thử chọn phân loại khuyến mãi khác'}
            </p>
            <button
              onClick={() => {
                setFilterType('all');
                setSearchTerm('');
              }}
              className="mt-4 px-4 py-2 rounded-[6px] bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition active:scale-[0.98] cursor-pointer"
            >
              Xem tất cả chương trình
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mt-5">
            {filteredPromotions.map((promo) => (
              <PromotionCard key={promo._id} promotion={promo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
