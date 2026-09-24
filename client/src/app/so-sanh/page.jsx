import React, { Suspense } from 'react';
import CompareClientView from './components/CompareClientView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata() {
  return {
    title: 'So sánh sản phẩm — SHOP',
    description: 'Bảng đối chiếu thông số kỹ thuật, giá thành và tiện ích sản phẩm',
  };
}

export default async function ComparePage({ searchParams }) {
  const params = await searchParams;
  console.log('ComparePage params received:', params);
  const productIdsParam = params?.products || '';
  const ids = productIdsParam ? productIdsParam.split(',').filter(Boolean) : [];
  console.log('ComparePage ids:', ids);

  let initialProducts = [];
  if (ids.length > 0) {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/v1/products/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
        cache: 'no-store',
      });
      const text = await res.text();
      if (res.ok) {
        try {
          const json = JSON.parse(text);
          initialProducts = json?.data || [];
        } catch (e) {
          console.error('Failed to parse json:', e.message);
        }
      } else {
        console.error('Compare fetch failed:', res.status, text);
      }
    } catch (e) {
      console.error('Server compare fetch error:', e.message);
    }
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-[#e30019] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-gray-500 font-medium">Đang tải bảng so sánh sản phẩm...</p>
        </div>
      }
    >
      <CompareClientView initialProducts={initialProducts} productIdsParam={productIdsParam} />
    </Suspense>
  );
}
