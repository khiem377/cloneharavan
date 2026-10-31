'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Gift, SearchX } from 'lucide-react';
import giftProgramService from '@/services/giftProgram.service';
import GiftHeader from './GiftHeader';
import GiftToolbar from './GiftToolbar';
import GiftCard from './GiftCard';
import GiftSkeleton from './GiftSkeleton';

export default function GiftView({ initialPrograms = [] }) {
  const [programs, setPrograms] = useState(initialPrograms);
  const [loading, setLoading] = useState(!initialPrograms || initialPrograms.length === 0);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // CSR fetch if SSR empty
  useEffect(() => {
    if (!initialPrograms || initialPrograms.length === 0) {
      giftProgramService
        .getActiveGiftPrograms({ limit: 50 })
        .then((data) => {
          setPrograms(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [initialPrograms]);

  const counts = useMemo(() => {
    const all = programs.length;
    const different = programs.filter((p) => p.giftType === 'different_product').length;
    const same = programs.filter((p) => p.giftType === 'same_product').length;
    return { all, different, same };
  }, [programs]);

  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => {
      // Filter by giftType
      if (filterType !== 'all' && p.giftType !== filterType) return false;

      // Filter by search term
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const nameMatch = p.name?.toLowerCase().includes(term);
        const descMatch = p.description?.toLowerCase().includes(term);
        if (!nameMatch && !descMatch) return false;
      }
      return true;
    });
  }, [programs, filterType, searchTerm]);

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-16">
      {/* Header */}
      <GiftHeader totalCount={programs.length} />

      <div className="max-w-[1536px] 2xl:max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8 mt-5 sm:mt-6">
        {/* Toolbar */}
        <GiftToolbar
          filterType={filterType}
          onFilterChange={setFilterType}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          counts={counts}
        />

        {/* Content States */}
        {loading ? (
          <GiftSkeleton count={4} />
        ) : filteredPrograms.length === 0 ? (
          <div className="bg-white rounded-[6px] border border-slate-200 p-12 text-center my-6">
            <div className="size-12 rounded-[6px] bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <SearchX size={24} />
            </div>
            <p className="text-sm font-bold text-slate-800">Không có chương trình quà tặng nào</p>
            <p className="text-xs text-slate-500 mt-1">
              {searchTerm ? `Không có chương trình nào khớp với "${searchTerm}"` : 'Hãy thử chọn phân loại quà tặng khác'}
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
            {filteredPrograms.map((prog) => (
              <GiftCard key={prog._id} program={prog} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
