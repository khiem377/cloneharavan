'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import orderService from '@/services/order.service';

import OrderSuccessConfetti from './components/OrderSuccessConfetti';
import OrderSuccessHero from './components/OrderSuccessHero';
import OrderSuccessItemsList from './components/OrderSuccessItemsList';
import OrderSuccessDetailsCard from './components/OrderSuccessDetailsCard';
import OrderSuccessActions from './components/OrderSuccessActions';
import OrderFailedCard from './components/OrderFailedCard';

function CheckoutResultContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get('orderCode') || '';
  const status = searchParams.get('status') || '';
  const transNo = searchParams.get('transNo') || '';
  const code = searchParams.get('code') || '';
  const urlMessage = searchParams.get('message') || '';
  const urlAmount = Number(searchParams.get('amount')) || 0;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const isSuccess = status === 'success';

  useEffect(() => {
    let isMounted = true;
    if (orderCode) {
      orderService
        .getOrderByCode(orderCode)
        .then((res) => {
          if (!isMounted) return;
          if (res?.data) {
            setOrder(res.data);
          }
        })
        .catch(() => {
          // Fallback thử tìm trong my-orders nếu API getById bị chặn quyền
          orderService
            .getMyOrders({ limit: 10 })
            .then((listRes) => {
              if (!isMounted) return;
              const found = listRes?.data?.orders?.find((o) => o.orderCode === orderCode);
              if (found) setOrder(found);
            })
            .catch(() => {});
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [orderCode]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 bg-slate-50 py-16">
        <Loader2 size={32} className="animate-spin text-[#0088ff]" />
        <p className="text-xs font-medium text-slate-600">
          Đang nạp chi tiết đơn hàng & xác nhận thanh toán OnePay...
        </p>
      </div>
    );
  }

  // Trường hợp giao dịch thất bại hoặc bị hủy
  if (!isSuccess) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 py-10 px-3 sm:px-6 flex items-center justify-center">
        <OrderFailedCard
          orderCode={orderCode}
          code={code}
          message={urlMessage}
          orderId={order?._id}
          totalAmount={order?.pricing?.totalAmount || urlAmount}
        />
      </div>
    );
  }

  // Trường hợp thanh toán thành công
  return (
    <div className="min-h-[100dvh] bg-slate-50 py-8 px-3 sm:px-6 lg:px-8">
      {/* Pháo hoa Confetti chào mừng */}
      <OrderSuccessConfetti />

      <div className="max-w-5xl mx-auto space-y-5">
        {/* Hero Banner đặt hàng & thanh toán thành công */}
        <OrderSuccessHero
          orderCode={orderCode}
          createdAt={order?.createdAt}
          isPaid={order?.paymentStatus === 'PAID' || isSuccess}
          paymentMethod={order?.paymentMethod || 'ONEPAY'}
        />

        {/* Bento Grid 2 cột: Danh sách sản phẩm (7) và Thông tin thanh toán / địa chỉ (5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7">
            <OrderSuccessItemsList
              items={order?.items || []}
              pricing={
                order?.pricing || {
                  totalAmount: urlAmount,
                  subtotal: urlAmount,
                }
              }
            />
          </div>

          <div className="lg:col-span-5">
            <OrderSuccessDetailsCard
              order={order}
              transNo={transNo}
            />
          </div>
        </div>

        {/* Nút hành động chân trang: In hóa đơn, Xem đơn hàng, Tiếp tục mua sắm */}
        <OrderSuccessActions orderCode={orderCode} />
      </div>
    </div>
  );
}

export default function CheckoutResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50 text-xs text-slate-500">
          <Loader2 size={24} className="animate-spin text-[#0088ff] mr-2" />
          <span>Đang nạp kết quả thanh toán OnePay...</span>
        </div>
      }
    >
      <CheckoutResultContent />
    </Suspense>
  );
}
