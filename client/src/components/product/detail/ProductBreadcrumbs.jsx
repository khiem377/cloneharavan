import React from 'react';
import Link from 'next/link';

export default function ProductBreadcrumbs({ product }) {
  if (!product) return null;

  const category = Array.isArray(product.categories) && product.categories[0];
  const brand = product.brand;

  return (
    <nav aria-label="Breadcrumb" className="py-3 px-2 sm:px-0">
      <ol className="flex items-center flex-wrap gap-2 text-xs text-slate-500">
        <li className="flex items-center">
          <Link
            href="/"
            className="hover:text-slate-900 transition-colors font-medium"
          >
            Trang chủ
          </Link>
        </li>

        {category && (
          <>
            <li className="text-slate-300">/</li>
            <li className="flex items-center">
              <Link
                href={`/collections/${category.slug || category._id}`}
                className="hover:text-slate-900 transition-colors max-w-[180px] truncate"
              >
                {category.name}
              </Link>
            </li>
          </>
        )}

        {brand?.name && (
          <>
            <li className="text-slate-300">/</li>
            <li className="flex items-center">
              <span className="text-slate-600 max-w-[140px] truncate">
                {brand.name}
              </span>
            </li>
          </>
        )}

        <li className="text-slate-300">/</li>
        <li className="flex items-center">
          <span
            className="font-medium text-slate-900 max-w-[280px] sm:max-w-md truncate"
            title={product.name}
          >
            {product.name}
          </span>
        </li>
      </ol>
    </nav>
  );
}
