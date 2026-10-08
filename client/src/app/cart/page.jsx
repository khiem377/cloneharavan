import React from 'react';
import CartView from '@/components/cart/CartView';

export const metadata = {
  title: 'Giỏ hàng của bạn | Haravan E-Commerce',
  description:
    'Xem chi tiết giỏ hàng, áp dụng mã giảm giá và tiến hành thanh toán đơn hàng an toàn, nhanh chóng tại Haravan.',
  openGraph: {
    title: 'Giỏ hàng của bạn | Haravan',
    description: 'Quản lý giỏ hàng và thanh toán các sản phẩm công nghệ chính hãng giá tốt.',
    type: 'website',
  },
};

export default function CartPage() {
  return <CartView />;
}
