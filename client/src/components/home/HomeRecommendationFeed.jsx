'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StaggerGrid, StaggerItem } from '@/components/common/ScrollReveal';
import { recommendationService } from '@/services/recommendation.service';
import { productService } from '@/services/product.service';

const TABS = [
  { id: 'personalized', label: 'Dành riêng cho bạn' },
  { id: 'trending', label: 'Xu hướng mua sắm' },
  { id: 'bestseller', label: 'Bán chạy nhất' },
  { id: 'newest', label: 'Hàng mới về' },
];

const MAX_RECOMMENDATIONS = 20;

/**
 * HomeRecommendationFeed - Khối Gợi Ý Cá Nhân Hóa Chuẩn Thuật Toán AI (Multi-layer Recommendation)
 * Tự động đồng bộ hóa tương tác Real-time từ Client Session.
 * Giới hạn hiển thị: 10 sản phẩm (2 hàng x 5 cột), tải thêm tối đa 1 lần (20 sản phẩm).
 * Tuân thủ quy tắc Evondev UI/UX: Flat, 1px border, 6px rounded, zero emoji.
 */
export default function HomeRecommendationFeed({ initialProducts = [] }) {
  const [activeTab, setActiveTab] = useState('personalized');
  const [products, setProducts] = useState(initialProducts.slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialProducts.length >= 10);

  // Tự động re-fetch danh sách gợi ý cá nhân hóa theo SessionID thật của Client khi Mount
  useEffect(() => {
    let isMounted = true;
    const fetchClientPersonalized = async () => {
      try {
        const clientRecs = await recommendationService.getPersonalized(10);
        if (isMounted && Array.isArray(clientRecs) && clientRecs.length > 0) {
          setProducts(clientRecs.slice(0, 10));
          setHasMore(clientRecs.length >= 10);
        }
      } catch (err) {
        // Fallback giữ nguyên initialProducts nếu có lỗi
      }
    };

    fetchClientPersonalized();
    return () => {
      isMounted = false;
    };
  }, []);

  // Chuyển Tab gợi ý
  const handleTabChange = async (tabId) => {
    if (tabId === activeTab) return;
    setActiveTab(tabId);
    setHasMore(true);
    setLoading(true);

    try {
      let data = [];
      if (tabId === 'personalized') {
        data = await recommendationService.getPersonalized(10);
      } else if (tabId === 'trending') {
        data = await recommendationService.getTrending(10);
      } else if (tabId === 'bestseller') {
        data = await productService.getProducts({ sort: 'bestseller', limit: 10 });
      } else if (tabId === 'newest') {
        data = await productService.getProducts({ sort: 'newest', limit: 10 });
      }

      const items = Array.isArray(data) ? data.slice(0, 10) : [];
      setProducts(items);
      setHasMore(items.length >= 10);
    } catch (err) {
      console.error('Lỗi chuyển tab gợi ý:', err?.message);
    } finally {
      setLoading(false);
    }
  };

  // Tải thêm 1 đợt sản phẩm tiếp theo (Load More gọn gàng, tối đa 20 sản phẩm)
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    try {
      let moreData = [];
      if (activeTab === 'personalized') {
        moreData = await recommendationService.getPersonalized(20);
      } else if (activeTab === 'trending') {
        moreData = await recommendationService.getTrending(20);
      } else if (activeTab === 'bestseller') {
        moreData = await productService.getProducts({ sort: 'bestseller', page: 2, limit: 10 });
      } else if (activeTab === 'newest') {
        moreData = await productService.getProducts({ sort: 'newest', page: 2, limit: 10 });
      }

      const existingIds = new Set(products.map((p) => (p._id || p.id)?.toString()));
      const rawNewItems = Array.isArray(moreData) ? moreData : [];
      const newItems = rawNewItems.filter((p) => !existingIds.has((p._id || p.id)?.toString())).slice(0, 10);

      const updated = [...products, ...newItems];
      setProducts(updated.slice(0, MAX_RECOMMENDATIONS));
      setHasMore(false); // Đã đạt mức tối đa 20 sản phẩm cho homepage
    } catch (err) {
      console.error('Lỗi tải thêm gợi ý:', err?.message);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 my-6" aria-label="Gợi ý dành riêng cho bạn">
      <div className="bg-white rounded-[6px] border border-slate-200 p-4 sm:p-5">
        {/* ─── HEADER KHỐI & 4 TABS ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight uppercase">
              Gợi ý cho bạn
            </h2>
          </div>

          {/* 4 Tabs Chuyển Đổi Dạng Text Chuẩn UX */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <Button
                  key={tab.id}
                  type="button"
                  variant={isActive ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => handleTabChange(tab.id)}
                  className={`text-xs font-semibold whitespace-nowrap h-7.5 px-3 ${
                    isActive
                      ? 'bg-slate-900 hover:bg-slate-950 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* ─── LƯỚI SẢN PHẨM (2 HÀNG X 5 CỘT TRÊN DESKTOP = 10 ITEMS) ─── */}
        <div className="mt-4">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
              {Array.from({ length: 10 }).map((_, idx) => (
                <div
                  key={`rec-skeleton-${idx}`}
                  className="rounded-[6px] border border-slate-200 bg-white p-3 space-y-3 animate-pulse"
                >
                  <div className="aspect-square w-full rounded-[4px] bg-slate-100" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-5 bg-slate-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center rounded-[6px] bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-500 font-medium">
                Chưa có dữ liệu gợi ý cho mục này.
              </p>
            </div>
          ) : (
            <StaggerGrid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
              {products.map((product) => (
                <StaggerItem key={product._id || product.id}>
                  <ProductCard product={product} />
                </StaggerItem>
              ))}
            </StaggerGrid>
          )}
        </div>

        {/* ─── NÚT XEM THÊM (LOAD MORE) HOẶC XEM TẤT CẢ ─── */}
        {!loading && products.length > 0 && (
          <div className="mt-6 pt-3 border-t border-slate-100 text-center flex items-center justify-center gap-3">
            {hasMore ? (
              <Button
                type="button"
                variant="default"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-6 h-8.5 gap-1.5"
              >
                {loadingMore ? 'Đang tải thêm...' : 'Xem thêm 10 gợi ý'}
                <span aria-hidden="true">&darr;</span>
              </Button>
            ) : (
              <Link href="/collections/all">
                <Button
                  variant="outline"
                  className="border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 px-6 h-8.5 gap-1.5"
                >
                  <span>Xem tất cả sản phẩm</span>
                  <span aria-hidden="true">&rarr;</span>
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
