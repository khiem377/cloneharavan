import React, { Suspense } from 'react';
import CompareClientView from './components/CompareClientView';
import { productService } from '@/services/product.service';

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
  const productIdsParam = params?.products || '';
  const ids = productIdsParam ? productIdsParam.split(',').filter(Boolean) : [];

  let initialProducts = [];
  if (ids.length > 0) {
    try {
      initialProducts = await productService.compareProducts(ids);
    } catch (e) {
      console.error('Server compare fetch error:', e?.message);
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
