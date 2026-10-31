import React from 'react';
import couponService from '@/services/coupon.service';
import CouponsView from '@/components/coupons/CouponsView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Mã Giảm Giá & Voucher Độc Quyền | Điện Máy Chính Hãng',
  description: 'Tổng hợp kho mã giảm giá, voucher khuyến mãi, mã miễn phí vận chuyển chính hãng. Lưu ngay để nhận ưu đãi thanh toán tốt nhất!',
};

export default async function CouponsPage() {
  const coupons = await couponService.getServerActiveCoupons(50);

  return <CouponsView initialCoupons={coupons} />;
}
