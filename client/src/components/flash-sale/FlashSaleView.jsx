'use client';

import React, { useState, useEffect, useMemo } from 'react';
import FlashSaleProductCard from '@/components/product/FlashSaleProductCard';
import flashSaleService from '@/services/flashSale.service';

import FlashSaleHeader from './FlashSaleHeader';
import FlashSaleToolbar from './FlashSaleToolbar';
import FlashSalePolicies from './FlashSalePolicies';
import FlashSaleBlockedState from './FlashSaleBlockedState';
import FlashSaleHeroBanner from './FlashSaleHeroBanner';
import FlashSaleSkeleton from './FlashSaleSkeleton';
import { formatDateDisplay, formatDateRange, groupItemsByProductId } from './flashSaleUtils';

export default function FlashSaleView({ initialActiveSale = null, availableSales = [] }) {
  const [activeSale, setActiveSale] = useState(initialActiveSale);
  const [salesList, setSalesList] = useState(availableSales);
  const [selectedSaleId, setSelectedSaleId] = useState(initialActiveSale?._id || '');
  const [loading, setLoading] = useState(!initialActiveSale);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('discount_desc');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [toastMessage, setToastMessage] = useState('');

  // CSR fetch if SSR had no data
  useEffect(() => {
    if (!initialActiveSale) {
      Promise.all([
        flashSaleService.getActiveFlashSale(),
        flashSaleService.getAvailableFlashSales(),
      ])
        .then(([active, list]) => {
          const validList = Array.isArray(list) ? list : [];
          setSalesList(validList);
          const currentSale = active || validList[0] || null;
          setActiveSale(currentSale);
          if (currentSale?._id) setSelectedSaleId(currentSale._id);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [initialActiveSale]);

  // Determine campaign status: 'ongoing' | 'upcoming' | 'ended' | 'none'
  const campaignStatus = useMemo(() => {
    if (!activeSale || !activeSale.startDate || !activeSale.endDate || activeSale.isActive === false) {
      return 'none';
    }
    const now = new Date();
    const start = new Date(activeSale.startDate);
    const end = new Date(activeSale.endDate);
    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'ongoing';
  }, [activeSale]);

  // Countdown timer logic
  useEffect(() => {
    if (!activeSale) return;
    const targetDate = campaignStatus === 'upcoming' ? activeSale.startDate : activeSale.endDate;
    if (!targetDate) return;

    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [activeSale, campaignStatus]);

  const categories = useMemo(() => {
    if (!activeSale?.items || campaignStatus !== 'ongoing') return [];
    const groupMap = new Map();

    const normalize = (str) => {
      if (!str) return '';
      return str
        .toLowerCase()
        .replace(/^(nhóm|cột)\s+/i, '')
        .replace(/\s*(&|,)\s*/g, ' và ')
        .trim();
    };

    activeSale.items.forEach((item) => {
      const prod = typeof item.productId === 'object' ? item.productId : null;
      if (prod?.categories && Array.isArray(prod.categories)) {
        prod.categories.forEach((cat) => {
          if (!cat?._id || !cat?.name) return;
          const normKey = normalize(cat.name);
          const slug = cat.slug || cat._id;
          if (!groupMap.has(normKey)) {
            let displayName = cat.name.replace(/^(nhóm|cột)\s+/i, '').trim();
            if (displayName === displayName.toUpperCase() && displayName.length > 4) {
              displayName = displayName.charAt(0) + displayName.slice(1).toLowerCase();
            }
            groupMap.set(normKey, {
              key: normKey,
              name: displayName,
              slugs: [slug, cat._id],
            });
          } else {
            const entry = groupMap.get(normKey);
            if (!entry.slugs.includes(slug)) entry.slugs.push(slug);
            if (!entry.slugs.includes(cat._id)) entry.slugs.push(cat._id);
          }
        });
      }
    });

    return Array.from(groupMap.values()).map((g) => ({
      slug: g.key,
      name: g.name,
      slugs: g.slugs,
    }));
  }, [activeSale?.items, campaignStatus]);

  const processedItems = useMemo(() => {
    if (!activeSale?.items || campaignStatus !== 'ongoing') return [];
    let list = [...activeSale.items];

    if (selectedCategory !== 'all') {
      const targetCat = categories.find((c) => c.slug === selectedCategory);
      const allowedSlugs = new Set(targetCat?.slugs || [selectedCategory]);

      list = list.filter((item) => {
        const prod = typeof item.productId === 'object' ? item.productId : null;
        if (!prod?.categories) return false;
        return prod.categories.some((c) => allowedSlugs.has(c.slug) || allowedSlugs.has(c._id));
      });
    }

    list.sort((a, b) => {
      const origA = a.originalPrice || a.productId?.price || 0;
      const origB = b.originalPrice || b.productId?.price || 0;
      const fpA = a.flashSalePrice || origA;
      const fpB = b.flashSalePrice || origB;
      const discA = origA > 0 ? ((origA - fpA) / origA) * 100 : 0;
      const discB = origB > 0 ? ((origB - fpB) / origB) * 100 : 0;

      if (sortBy === 'discount_desc') return discB - discA;
      if (sortBy === 'price_asc') return fpA - fpB;
      if (sortBy === 'price_desc') return fpB - fpA;
      if (sortBy === 'sold_desc') return (b.soldCount || 0) - (a.soldCount || 0);
      return 0;
    });

    return list;
  }, [activeSale?.items, selectedCategory, sortBy, campaignStatus]);

  const groupedProcessedItems = useMemo(
    () => groupItemsByProductId(processedItems),
    [processedItems]
  );

  const showToast = (text) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // 1. TRẠNG THÁI BỊ CHẶN (CHƯA MỞ / ĐÃ KẾT THÚC / KHÔNG TỒN TẠI)
  if (!loading && campaignStatus !== 'ongoing') {
    return (
      <FlashSaleBlockedState
        campaignStatus={campaignStatus}
        activeSale={activeSale}
        timeLeft={timeLeft}
        formatDateDisplay={formatDateDisplay}
      />
    );
  }

  // 2. TRẠNG THÁI ĐANG DIỄN RA (ONGOING)
  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-16">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-[6px] shadow-lg flex items-center gap-2 text-xs border border-slate-700 animate-slide-up">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <FlashSaleHeader
        activeSale={activeSale}
        timeLeft={timeLeft}
        formatDateRange={formatDateRange}
      />

      {/* Hero Banner */}
      <FlashSaleHeroBanner
        bannerUrl={activeSale?.banner?.url}
        bannerAlt={activeSale?.name || 'Flash Sale Banner'}
      />

      <div className="max-w-[1536px] 2xl:max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8 mt-5 sm:mt-6">
        <FlashSaleToolbar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          totalItemsCount={activeSale?.items?.length || 0}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {loading ? (
          <FlashSaleSkeleton count={12} />
        ) : groupedProcessedItems.length === 0 ? (
          <div className="bg-white rounded-[6px] border border-slate-200 p-12 text-center my-6 shadow-2xs">
            <p className="text-sm font-bold text-slate-800">Không có sản phẩm nào thuộc bộ lọc này</p>
            <p className="text-xs text-slate-500 mt-1">Hãy thử chọn lại danh mục hoặc quay lại sau</p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="mt-4 px-4 py-2 rounded-[6px] bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition active:scale-[0.98] cursor-pointer"
            >
              Xem tất cả sản phẩm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-2.5 sm:gap-3.5 2xl:gap-4.5 mt-5">
            {groupedProcessedItems.map((item, idx) => (
              <FlashSaleProductCard
                key={item._id || idx}
                item={item}
                onAddToCartMock={() => showToast('Đã thêm vào giỏ hàng')}
                onBuyNowMock={() => showToast('Chuyển tới thanh toán nhanh')}
              />
            ))}
          </div>
        )}

        {/* Promotion Policies Box */}
        <FlashSalePolicies />
      </div>
    </div>
  );
}
