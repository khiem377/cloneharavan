import React from 'react';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default function ProductBreadcrumbs({ product, dynamicProductName = '' }) {
  if (!product) return null;

  const category = Array.isArray(product.categories) && product.categories[0];
  const brand = product.brand;
  const displayName = dynamicProductName || product.name;

  return (
    <Breadcrumb className="py-3 px-2 sm:px-0">
      <BreadcrumbList className="text-xs text-slate-500 gap-1.5 sm:gap-2">
        <BreadcrumbItem>
          <Link href="/" className="hover:text-slate-900 transition-colors font-medium">
            Trang chủ
          </Link>
        </BreadcrumbItem>

        {category && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Link
                href={`/collections/${category.slug || category._id}`}
                className="hover:text-slate-900 transition-colors max-w-[180px] truncate"
              >
                {category.name}
              </Link>
            </BreadcrumbItem>
          </>
        )}

        {brand?.name && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="text-slate-600 max-w-[140px] truncate">
                {brand.name}
              </span>
            </BreadcrumbItem>
          </>
        )}

        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage
            className="font-medium text-slate-900 max-w-[280px] sm:max-w-md truncate"
            title={displayName}
          >
            {displayName}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

