'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchSidebarFilter from './SearchSidebarFilter';
import SearchSortBar from './SearchSortBar';
import SearchProductGrid from './SearchProductGrid';
import SearchPagination from './SearchPagination';
import SearchEmptyState from './SearchEmptyState';
import VisualSearchBanner from './VisualSearchBanner';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import Icon from '../../../components/common/Icon';

export default function SearchContentView({
  query = '',
  products = [],
  blogs = [],
  total = 0,
  facets = {},
  pagination = {},
  currentFilters = {},
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [visualInfo, setVisualInfo] = useState(null);

  const isBlogSearch = currentFilters.domain === 'blogs';

  useEffect(() => {
    if (typeof window !== 'undefined' && searchParams.get('visual') === '1') {
      try {
        const stored = sessionStorage.getItem('visual_search_data');
        if (stored) {
          setVisualInfo(JSON.parse(stored));
        }
      } catch {
      }
    } else {
      setVisualInfo(null);
    }
  }, [searchParams]);

  const hasActiveFilters = Boolean(
    currentFilters.category ||
    currentFilters.brand ||
    currentFilters.minPrice ||
    currentFilters.maxPrice ||
    currentFilters.inStock ||
    currentFilters.attrs
  );

  const handleResetFilters = () => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    router.push(`/search?${params.toString()}`);
  };

  const handleClearVisualSearch = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('visual_search_data');
    }
    setVisualInfo(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('visual');
    router.push(`/search?${params.toString()}`);
  };

  const buildPaginationUrl = ({ page }) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    return `/search?${params.toString()}`;
  };

  if (isBlogSearch) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">
            Tìm thấy <span className="font-bold text-red-600">{blogs.length}</span> bài viết
          </p>
        </div>

        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blogs.map((b) => (
              <Card key={b._id || b.slug} className="p-4 hover:shadow-md hover:border-gray-300 transition flex flex-col justify-between">
                <div>
                  {b.thumbnailUrl && (
                    <div className="w-full aspect-video rounded-md overflow-hidden bg-slate-100 mb-3">
                      <img
                        src={b.thumbnailUrl}
                        alt={b.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-[10px] font-medium">Bài viết</Badge>
                    {b.minRead && (
                      <span className="text-[11px] text-gray-400">{b.minRead} phút đọc</span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 line-clamp-2 hover:text-blue-600 transition">
                    {b.title}
                  </h3>
                  {b.excerpt && (
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1.5 leading-relaxed">
                      {b.excerpt}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center bg-white space-y-2">
            <Icon name="search" size={32} className="mx-auto text-gray-300" />
            <p className="text-sm font-semibold text-gray-700">
              Không tìm thấy bài viết nào cho từ khóa &ldquo;{query}&rdquo;
            </p>
            <p className="text-xs text-gray-400">
              Vui lòng thử tìm kiếm bằng từ khóa khác hoặc chuyển sang danh mục Sản phẩm.
            </p>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start">
      <div className="hidden lg:block w-72 xl:w-76 shrink-0 sticky top-[125px]">
        <SearchSidebarFilter
          facets={facets}
          currentFilters={currentFilters}
        />
      </div>

      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs h-full bg-white shadow-xl p-3.5 overflow-y-auto z-10 flex flex-col">
            <SearchSidebarFilter
              facets={facets}
              currentFilters={currentFilters}
              onCloseMobile={() => setMobileFilterOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex-1 w-full min-w-0 space-y-3.5">
        {visualInfo && (
          <VisualSearchBanner
            visualInfo={visualInfo}
            onClear={handleClearVisualSearch}
          />
        )}

        <SearchSortBar
          total={total}
          currentSort={currentFilters.sort || 'relevance'}
          currentFilters={currentFilters}
          facets={facets}
          onOpenMobileFilter={() => setMobileFilterOpen(true)}
        />

        {products.length > 0 ? (
          <>
            <SearchProductGrid products={products} />
            <SearchPagination
              pagination={pagination}
              buildUrl={buildPaginationUrl}
            />
          </>
        ) : (
          <SearchEmptyState
            query={query}
            hasFilters={hasActiveFilters}
            onResetFilters={handleResetFilters}
          />
        )}
      </div>
    </div>
  );
}
