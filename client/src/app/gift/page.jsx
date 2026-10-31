import React from 'react';
import giftProgramService from '@/services/giftProgram.service';
import GiftView from '@/components/gift/GiftView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Chương Trình Quà Tặng Tri Ân & Quà Kèm 0Đ | Điện Máy Chính Hãng',
  description: 'Tổng hợp danh sách các chương trình quà tặng tri ân, tặng kèm sản phẩm 0₫ độc quyền khi đặt mua thiết bị điện máy gia dụng chính hãng.',
};

export default async function GiftPage() {
  const programs = await giftProgramService.getServerActiveGiftPrograms(50);

  return <GiftView initialPrograms={programs} />;
}
