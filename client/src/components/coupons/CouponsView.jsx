'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Ticket, SearchX, Check } from 'lucide-react';
import couponService from '@/services/coupon.service';
import CouponsHeader from './CouponsHeader';
import CouponsToolbar from './CouponsToolbar';
import CouponCard from './CouponCard';
import CouponsSkeleton from './CouponsSkeleton';

export default function CouponsView({ initialCoupons = [] }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [loading, setLoading] = useState(!initialCoupons || initialCoupons.length === 0);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // CSR fetch if SSR empty
  useEffect(() => {
    if (!initialCoupons || initialCoupons.length === 0) {
      couponService
        .getActiveCoupons(50)
        .then((data) => {
          setCoupons(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [initialCoupons]);

  const showToast = (code) => {
    setToastMessage(`Đã lưu mã "${code}" vào bộ nhớ tạm!`);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const counts = useMemo(() => {
    const all = coupons.length;
    const fixed = coupons.filter((c) => c.discountType === 'fixed').length;
    const percent = coupons.filter((c) => c.discountType === 'percent').length;
    return { all, fixed, percent };
  }, [coupons]);

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      // Filter by type
      if (filterType === 'fixed' && c.discountType !== 'fixed') return false;
      if (filterType === 'percent' && c.discountType !== 'percent') return false;

      // Filter by search
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const codeMatch = c.code?.toLowerCase().includes(term);
        const nameMatch = c.name?.toLowerCase().includes(term);
        const descMatch = c.description?.toLowerCase().includes(term);
        if (!codeMatch && !nameMatch && !descMatch) return false;
      }
      return true;
    });
  }, [coupons, filterType, searchTerm]);

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-[6px] shadow-lg flex items-center gap-2 text-xs border border-slate-700 font-mono animate-slide-up">
          <Check size={14} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <CouponsHeader totalCoupons={coupons.length} />

      <div className="max-w-[1536px] 2xl:max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8 mt-5 sm:mt-6">
        {/* Toolbar */}
        <CouponsToolbar
          filterType={filterType}
          onFilterChange={setFilterType}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          counts={counts}
        />

        {/* Content States */}
        {loading ? (
          <CouponsSkeleton count={6} />
        ) : filteredCoupons.length === 0 ? (
          <div className="bg-white rounded-[6px] border border-slate-200 p-12 text-center my-6">
            <div className="size-12 rounded-[6px] bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <SearchX size={24} />
            </div>
            <p className="text-sm font-bold text-slate-800">Không tìm thấy mã giảm giá phù hợp</p>
            <p className="text-xs text-slate-500 mt-1">
              {searchTerm ? `Không có mã nào khớp với từ khóa "${searchTerm}"` : 'Hãy thử chọn phân loại voucher khác'}
            </p>
            <button
              onClick={() => {
                setFilterType('all');
                setSearchTerm('');
              }}
              className="mt-4 px-4 py-2 rounded-[6px] bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition active:scale-[0.98] cursor-pointer"
            >
              Xem tất cả mã
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 mt-5">
            {filteredCoupons.map((coupon) => (
              <CouponCard
                key={coupon._id || coupon.code}
                coupon={coupon}
                onCopySuccess={showToast}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
