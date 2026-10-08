'use client';

import React from 'react';
import SearchProductCard from './SearchProductCard';
import trackingService from '@/services/tracking.service';

export default function SearchProductGrid({ products = [], query = '' }) {
  if (!products || products.length === 0) {
    return null;
  }

  const handleProductClick = (prod) => {
    if (query && prod) {
      trackingService.recordSearchClick(query, prod._id || prod.id);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-2.5 lg:gap-3">
      {products.map((prod) => (
        <SearchProductCard
          key={prod._id || prod.id || prod.slug}
          product={prod}
          onProductClick={handleProductClick}
        />
      ))}
    </div>
  );
}
