'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle, ArrowLeft, RefreshCw, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { confirm } from '@/components/ui/confirm-dialog';
import orderService from '@/services/order.service';
import shippingService from '@/services/shipping.service';

import useAuthStore from '@/store/authStore';

import OrderDetailHeader from './components/OrderDetailHeader';
import OrderDetailStepper from './components/OrderDetailStepper';
import OrderDetailItems from './components/OrderDetailItems';
import OrderDetailSidebar from './components/OrderDetailSidebar';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const { user, accessToken } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const isAuthenticated = !!(user && accessToken);

  const [order, setOrder] = useState(null);
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Bảo mật: Nếu chưa đăng nhập, tự động chuyển hướng về trang đăng nhập
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(`/tai-khoan/don-hang/${id}`)}`);
    }
  }, [mounted, isAuthenticated, router, id]);

  const fetchOrderDetail = useCallback(async () => {
    if (!id || !isAuthenticated) return;
    try {
      setLoading(true);
      setError(null);

      const res = await orderService.getOrderById(id);
      const orderData = res?.data || res;

      if (!orderData) {
        throw new Error('Không tìm thấy thông tin đơn hàng này');
      }

      setOrder(orderData);

      // Lấy thông tin vận chuyển từ orderData (BE trả về trực tiếp) hoặc API tra cứu
      if (orderData.shipment) {
        setShipment(orderData.shipment);
      } else if (orderData.orderCode) {
        try {
          const shipRes = await shippingService.getShipmentByOrderCode(orderData.orderCode);
          if (shipRes) setShipment(shipRes?.data || shipRes);
        } catch (_) {}
      }
    } catch (err) {
      console.warn('Lỗi nạp đơn hàng:', err.message);
      setError(err.message || 'Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrderDetail();
    }
  }, [fetchOrderDetail, isAuthenticated]);

  // Hủy đơn hàng
  const handleCancelOrder = async () => {
    if (!order) return;
    const ok = await confirm({
      title: `Hủy đơn hàng #${order.orderCode}?`,
      message: 'Bạn có chắc chắn muốn hủy đơn hàng này không? Tồn kho giữ chỗ sẽ được hoàn lại ngay lập tức.',
      confirmText: 'Xác nhận hủy',
      cancelText: 'Giữ lại đơn',
      confirmVariant: 'destructive',
    });

    if (!ok) return;

    try {
      setCancelling(true);
      await orderService.cancelOrder(order._id, 'Khách hàng tự hủy trên website');
      toast.success(`Đã hủy thành công đơn hàng #${order.orderCode}`);
      fetchOrderDetail();
    } catch (err) {
      toast.error(err.message || 'Không thể hủy đơn hàng');
    } finally {
      setCancelling(false);
    }
  };

  if (mounted && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-[8px] p-6 max-w-sm w-full text-center shadow-xs space-y-3">
          <Loader2 size={28} className="animate-spin text-[#e30019] mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">Yêu cầu đăng nhập</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Để bảo mật thông tin khách hàng và hành trình đơn hàng, vui lòng đăng nhập để tiếp tục.
          </p>
          <Button
            asChild
            size="sm"
            className="w-full bg-[#e30019] hover:bg-[#c40015] text-white text-xs font-semibold rounded-[6px]"
          >
            <Link href={`/login?redirect=${encodeURIComponent(`/tai-khoan/don-hang/${id}`)}`}>
              Đăng nhập ngay
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/tai-khoan" className="hover:text-slate-900 transition-colors">
            Tài khoản
          </Link>
          <span>/</span>
          <Link href="/tai-khoan?tab=orders" className="hover:text-slate-900 transition-colors">
            Đơn hàng của tôi
          </Link>
          <span>/</span>
          <span className="font-mono font-bold text-slate-800">
            #{order?.orderCode || id}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6">
        {/* Loading State */}
        {loading && (
          <div className="bg-white border border-slate-200 rounded-[6px] p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 size={28} className="animate-spin text-[#e30019]" />
            <p className="text-xs text-slate-500 font-medium">
              Đang tải chi tiết đơn hàng...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white border border-rose-200 rounded-[6px] p-10 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-3">
              <AlertCircle size={24} />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Không thể tải đơn hàng</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
              {error}
            </p>
            <div className="flex gap-2.5 mt-5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fetchOrderDetail}
                className="h-8 text-xs font-semibold rounded-[6px] cursor-pointer"
              >
                <RefreshCw size={13} className="mr-1.5" />
                Thử lại
              </Button>
              <Button
                asChild
                size="sm"
                className="h-8 text-xs font-semibold bg-[#e30019] hover:bg-[#c40015] text-white rounded-[6px] cursor-pointer"
              >
                <Link href="/tai-khoan?tab=orders">Về danh sách đơn</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Success State */}
        {!loading && !error && order && (
          <div className="space-y-6">
            <OrderDetailHeader
              order={order}
              shipment={shipment}
              onCancel={handleCancelOrder}
              isCancelling={cancelling}
            />

            <OrderDetailStepper order={order} shipment={shipment} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 space-y-6">
                <OrderDetailItems order={order} />
              </div>

              <div className="lg:col-span-1">
                <OrderDetailSidebar order={order} shipment={shipment} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
