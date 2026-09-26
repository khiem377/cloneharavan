import React from 'react';
import flashSaleService from '@/services/flashSale.service';
import FlashSaleView from './FlashSaleView';

export const metadata = {
  title: 'Flash Sale Online — Giờ Vàng Giá Sốc | Điện Máy Chính Hãng',
  description: 'Chương trình Flash Sale online giảm giá sốc hàng ngàn sản phẩm tivi, tủ lạnh, máy giặt, máy lạnh chính hãng. Số lượng có hạn, săn ngay kẻo lỡ!',
};

export default async function FlashSalePage() {
  const [activeSale, availableSales] = await Promise.all([
    flashSaleService.getServerActiveFlashSale(),
    flashSaleService.getServerAvailableFlashSales(),
  ]);

  return (
    <FlashSaleView
      initialActiveSale={activeSale}
      availableSales={availableSales}
    />
  );
}
