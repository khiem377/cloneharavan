import React from 'react';
import flashSaleService from '@/services/flashSale.service';
import FlashSaleView from '@/components/flash-sale/FlashSaleView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const sale = await flashSaleService.getServerFlashSaleById(slug);
  if (!sale) {
    return {
      title: 'Flash Sale Online Giá Sốc | Điện Máy Chính Hãng',
      description: 'Chương trình Flash Sale online giảm giá sốc hàng ngàn sản phẩm chính hãng.',
    };
  }

  return {
    title: `${sale.name} — Flash Sale Online Giá Sốc | Điện Máy Chính Hãng`,
    description: sale.description || 'Chương trình Flash Sale online giảm giá sốc hàng ngàn sản phẩm tivi, tủ lạnh, máy giặt, máy lạnh chính hãng.',
  };
}

export default async function FlashSaleDetailPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const [sale, availableSales] = await Promise.all([
    flashSaleService.getServerFlashSaleById(slug),
    flashSaleService.getServerAvailableFlashSales(),
  ]);

  // Fallback to active sale or first available if slug wasn't directly matched
  const currentSale = sale || (availableSales && availableSales.length > 0 ? availableSales[0] : null);

  return (
    <FlashSaleView
      initialActiveSale={currentSale}
      availableSales={availableSales}
    />
  );
}
