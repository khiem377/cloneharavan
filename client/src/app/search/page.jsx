import React from 'react';
import Link from 'next/link';
import { searchService } from '../../services/search.service';
import SearchContentView from './components/SearchContentView';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../components/ui/breadcrumb';

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const q = params?.q || '';
  return {
    title: q ? `Tìm kiếm: "${q}" — SHOP` : 'Tìm kiếm sản phẩm — SHOP',
    description: `Kết quả tìm kiếm sản phẩm điện máy cho từ khoá ${q}`,
  };
}

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const q = params?.q || '';
  const domain = params?.domain || 'products';
  const category = params?.category || '';
  const brand = params?.brand || '';
  const minPrice = params?.minPrice || '';
  const maxPrice = params?.maxPrice || '';
  const inStock = params?.inStock || '';
  const sort = params?.sort || 'relevance';
  const page = parseInt(params?.page || '1', 10) || 1;
  const attrs = params?.attrs || '';

  const currentFilters = {
    q,
    domain,
    category,
    brand,
    minPrice,
    maxPrice,
    inStock,
    sort,
    page,
    attrs,
  };

  const data = q
    ? await searchService.getServerSearchResults({
        q,
        domain,
        category,
        brand,
        minPrice,
        maxPrice,
        inStock,
        sort,
        page,
        limit: 24,
        attrs,
      })
    : null;

  const products = data?.results?.products || data?.products || [];
  const blogs = data?.results?.blogs || data?.blogs || [];
  const facets = data?.facets || {
    brands: [],
    categories: [],
    priceRange: { min: 0, max: 0 },
  };
  const total =
    typeof data?.total === 'number'
      ? data.total
      : domain === 'blogs'
      ? blogs.length
      : data?.pagination?.totalItems || products.length;

  const pagination = data?.pagination || {
    page,
    limit: 24,
    totalItems: total,
    totalPages: Math.max(1, Math.ceil(total / 24)),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Trang chủ</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {q ? `Tìm kiếm "${q}"` : 'Tìm kiếm'}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="pb-1">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          {q ? (
            <>
              Kết quả tìm kiếm cho <span className="text-red-600">&ldquo;{q}&rdquo;</span>
            </>
          ) : (
            'Tìm kiếm sản phẩm'
          )}
        </h1>
      </div>

      <SearchContentView
        query={q}
        products={products}
        blogs={blogs}
        total={total}
        facets={facets}
        pagination={pagination}
        currentFilters={currentFilters}
      />
    </div>
  );
}
