import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Search, RotateCcw } from 'lucide-react';
import searchService from '@/services/search.service';
import ProductCard from '@/components/product/ProductCard';
import SearchSidebarFilter from '@/app/search/components/SearchSidebarFilter';
import SearchSortSelector from '@/app/search/components/SearchSortSelector';
import SearchPagination from '@/app/search/components/SearchPagination';
import CollectionSeoSection from '@/components/collection/CollectionSeoSection';
import CollectionCategoryShowcase from '@/components/collection/CollectionCategoryShowcase';
import CollectionCommitments from '@/components/collection/CollectionCommitments';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Helper to format handle to nice title
function formatHandleTitle(handle = '') {
  if (!handle) return 'Danh mục sản phẩm';
  const map = {
    tivi: 'Tivi',
    'smart-tv': 'Smart Tivi',
    'tu-lanh': 'Tủ lạnh',
    'may-giat': 'Máy giặt',
    'may-lanh': 'Máy lạnh',
    'dieu-hoa': 'Điều hòa',
    'dien-thoai': 'Điện thoại',
    laptop: 'Laptop',
    'am-thanh': 'Âm thanh & Loa',
    'gia-dung': 'Gia dụng',
    'gia-dung-sac-mau': 'Gia dụng sắc màu',
    'gia-dung-suc-khoe': 'Gia dụng sức khỏe',
    'san-pham-hot': 'Sản phẩm Hot',
    'tv-oled-qled': 'Tivi OLED / QLED',
    samsung: 'Samsung',
    sony: 'Sony',
    lg: 'LG',
    toshiba: 'Toshiba',
    aqua: 'Aqua',
    panasonic: 'Panasonic',
    tcl: 'TCL',
  };
  if (map[handle.toLowerCase()]) return map[handle.toLowerCase()];
  return handle
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }) {
  const { handle } = await params;
  const title = formatHandleTitle(handle);
  return {
    title: `${title} — SHOP`,
    description: `Khám phá bộ sưu tập ${title} chính hãng, giá tốt nhất tại SHOP.`,
  };
}

export default async function CollectionPage({ params, searchParams }) {
  const { handle } = await params;
  const query = await searchParams;

  const categoryTitle = formatHandleTitle(handle);

  const searchOptions = {
    category: handle,
    q: query.q || '',
    brand: query.brand || '',
    minPrice: query.minPrice || '',
    maxPrice: query.maxPrice || '',
    sort: query.sort || 'relevance',
    page: parseInt(query.page || '1', 10),
    limit: 20,
    inStock: query.inStock || '',
    attrs: query.attrs || '',
    domain: 'products',
  };

  const results = await searchService.getServerSearchResults(searchOptions, 20);

  const products = results?.results?.products || results?.products || [];
  const pagination = results?.pagination || {
    page: 1,
    limit: 20,
    total: products.length,
    totalPages: Math.ceil(products.length / 20) || 1,
  };
  const totalCount = results?.pagination?.totalItems || pagination.total || products.length;
  const facets = results?.facets || {};

  return (
    <div className="bg-[#f8f9fa] min-h-[90vh] py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 flex-wrap">
          <Link href="/" className="hover:text-[#e30019] transition">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-gray-400">Danh mục</span>
          <span>/</span>
          <span className="text-gray-900 font-semibold">{categoryTitle}</span>
        </div>

        {/* Category Header Banner / Title */}
        <div className="bg-white rounded-lg border border-gray-200/80 p-4 sm:p-5 mb-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-baseline gap-2.5">
              <span>{categoryTitle}</span>
              <span className="text-xs sm:text-sm font-normal text-gray-500">
                ({totalCount} sản phẩm)
              </span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Các sản phẩm {categoryTitle} chính hãng, cam kết chất lượng, bảo hành tận nhà
            </p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <span className="text-xs text-gray-500 hidden sm:inline">Sắp xếp:</span>
            <SearchSortSelector currentSort={searchOptions.sort} />
          </div>
        </div>

        {/* Main Content Layout: 3 Columns Products (Left) + 1 Column Filter Sidebar (Right) matching EGA layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
          {/* Main Product Grid (Left 3 Columns) */}
          <div className="lg:col-span-3 space-y-5">
            {products.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200/80 p-12 text-center shadow-2xs">
                <div className="w-14 h-14 rounded-full bg-red-50 text-[#e30019] flex items-center justify-center mx-auto mb-3">
                  <Search size={26} />
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-1">
                  Chưa tìm thấy sản phẩm phù hợp
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
                  Không có sản phẩm nào khớp với bộ lọc bạn đã chọn. Hãy thử xóa bớt tiêu chí lọc hoặc chọn danh mục khác.
                </p>
                <Link
                  href={`/collections/${handle}`}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#e30019] hover:bg-[#c40015] text-white text-xs font-semibold rounded-md shadow-xs transition"
                >
                  <RotateCcw size={13} />
                  <span>Xóa bộ lọc</span>
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {products.map((p) => (
                    <ProductCard key={p._id || p.id} product={p} />
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="pt-4 flex justify-center">
                    <SearchPagination
                      pagination={pagination}
                      buildUrl={({ page }) => {
                        const params = new URLSearchParams(query);
                        params.set('page', String(page));
                        return `/collections/${handle}?${params.toString()}`;
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Sidebar Filters (1 Column) */}
          <div className="lg:col-span-1 lg:order-last">
            <SearchSidebarFilter
              facets={facets}
              currentFilters={searchOptions}
            />
          </div>
        </div>

        {/* Rich SEO & Technical Description Article (Under Product List) */}
        <CollectionSeoSection title={categoryTitle} />

        {/* Circular Category Grid ("Danh mục sản phẩm" like EGA Điện Máy) */}
        <CollectionCategoryShowcase />

        {/* Customer Trust & Service Commitments Bar */}
        <CollectionCommitments />
      </div>
    </div>
  );
}
