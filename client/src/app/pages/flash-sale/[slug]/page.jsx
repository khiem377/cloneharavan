import React from 'react';
import { notFound } from 'next/navigation';
import flashSaleService from '@/services/flashSale.service';
import FlashSaleView from '../FlashSaleView';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const sale = await flashSaleService.getServerFlashSaleById(slug);
  if (!sale) {
    return {
      title: 'Flash Sale Không Tồn Tại | Điện Máy Chính Hãng',
    };
  }

  return {
    title: `${sale.name} — Flash Sale Online Giá Sốc | Điện Máy Chính Hãng`,
    description: sale.description || 'Chương trình Flash Sale online giảm giá sốc hàng ngàn sản phẩm tivi, tủ lạnh, máy giặt, máy lạnh chính hãng.',
  };
}

export default async function FlashSaleDetailPage({ params }) {
  const { slug } = await params;
  const [sale, availableSales] = await Promise.all([
    flashSaleService.getServerFlashSaleById(slug),
    flashSaleService.getServerAvailableFlashSales(),
  ]);

  if (!sale) {
    notFound();
  }

  return (
    <FlashSaleView
      initialActiveSale={sale}
      availableSales={availableSales}
    />
  );
}
