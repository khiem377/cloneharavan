import React from 'react';
import promotionService from '@/services/promotion.service';
import PromotionsView from '@/components/promotions/PromotionsView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Chương Trình Khuyến Mãi & Trợ Giá Đặc Quyền | Điện Máy Chính Hãng',
  description: 'Tổng hợp các chương trình khuyến mãi, mua 2 tính 1, giảm giá trực tiếp theo đơn hàng điện máy gia dụng chính hãng. Khám phá ngay!',
};

export default async function PromotionsPage() {
  const promotions = await promotionService.getServerActivePromotions(50);

  return <PromotionsView initialPromotions={promotions} />;
}
