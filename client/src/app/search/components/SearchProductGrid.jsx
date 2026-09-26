import React from 'react';
import SearchProductCard from './SearchProductCard';

export default function SearchProductGrid({ products = [] }) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-2.5 lg:gap-3">
      {products.map((prod) => (
        <SearchProductCard key={prod._id || prod.id || prod.slug} product={prod} />
      ))}
    </div>
  );
}
