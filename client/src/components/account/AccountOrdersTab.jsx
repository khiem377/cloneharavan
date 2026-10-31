'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { PackageSearch, ArrowRight, Loader2, Clock, CheckCircle2, Truck, Ban, RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { toast } from '../ui/toast';
import { confirm } from '../ui/confirm-dialog';
import orderService from '@/services/order.service';
import shippingService from '@/services/shipping.service';
import OrderFilterBar from './orders/OrderFilterBar';
import OrderCardItem from './orders/OrderCardItem';
import OrderDetailDialog from './orders/OrderDetailDialog';
import OrderTrackingDialog from './orders/OrderTrackingDialog';

const ORDER_STATUS_MAP = {
  PENDING: { label: 'Chờ xác nhận', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  CONFIRMED: { label: 'Đang xử lý', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle2 },
  SHIPPING: { label: 'Đang giao hàng', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200', icon: Truck },
  DELIVERED: { label: 'Đã hoàn tất', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  CANCELLED: { label: 'Đã hủy', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200', icon: Ban },
  RETURNED: { label: 'Đã hoàn hàng', badgeClass: 'bg-orange-50 text-orange-700 border-orange-200', icon: RotateCcw },
};

const PAYMENT_STATUS_MAP = {
  UNPAID: { label: 'Chưa thanh toán (COD)', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  PAID: { label: 'Đã thanh toán', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REFUNDED: { label: 'Đã hoàn tiền', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const FILTER_TO_STATUS = {
  all: undefined,
  pending: 'PENDING',
  processing: 'CONFIRMED',
  shipping: 'SHIPPING',
  completed: 'DELIVERED',
  cancelled: 'CANCELLED',
};

export default function AccountOrdersTab({
  orderSearch = '',
  setOrderSearch,
  orderFilter = 'all',
  setOrderFilter,
  onOrdersUpdated,
  allOrders = [],
}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [trackingLoadingId, setTrackingLoadingId] = useState(null);
  const [trackingShipment, setTrackingShipment] = useState(null);
  const searchDebounceTimer = useRef(null);

  const formatPrice = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const counts = useMemo(() => {
    const res = { all: allOrders.length, pending: 0, processing: 0, shipping: 0, completed: 0, cancelled: 0 };
    allOrders.forEach((o) => {
      const st = (o.orderStatus || '').toUpperCase();
      if (st === 'PENDING') res.pending++;
      else if (st === 'CONFIRMED') res.processing++;
      else if (st === 'SHIPPING') res.shipping++;
      else if (st === 'DELIVERED') res.completed++;
      else if (st === 'CANCELLED' || st === 'RETURNED') res.cancelled++;
    });
    return res;
  }, [allOrders]);

  const filterTabs = [
    { id: 'all', label: 'Tất cả', count: counts.all },
    { id: 'pending', label: 'Chờ xác nhận', count: counts.pending },
    { id: 'processing', label: 'Đang xử lý', count: counts.processing },
    { id: 'shipping', label: 'Đang giao hàng', count: counts.shipping },
    { id: 'completed', label: 'Đã hoàn tất', count: counts.completed },
    { id: 'cancelled', label: 'Đã hủy', count: counts.cancelled },
  ];

  const fetchOrders = useCallback(async (filterKey = orderFilter, searchQuery = orderSearch) => {
    setLoading(true);
    try {
      const mappedStatus = FILTER_TO_STATUS[filterKey];
      const params = { limit: 30 };
      if (mappedStatus) params.status = mappedStatus;
      if (searchQuery && searchQuery.trim()) params.search = searchQuery.trim();
      const res = await orderService.getMyOrders(params);
      setOrders(Array.isArray(res?.data) ? res.data : []);
    } catch {
      toast.error('Không thể tải danh sách đơn hàng. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  }, [orderFilter, orderSearch]);

  useEffect(() => {
    fetchOrders(orderFilter, orderSearch);
  }, [orderFilter]);

  const handleSearchChange = (val) => {
    if (setOrderSearch) setOrderSearch(val);
    if (searchDebounceTimer.current) clearTimeout(searchDebounceTimer.current);
    searchDebounceTimer.current = setTimeout(() => {
      fetchOrders(orderFilter, val);
    }, 350);
  };

  const handleCopyCode = (code, e) => {
    e?.stopPropagation();
    if (!code) return;
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    toast.success(`Đã sao chép mã đơn hàng: ${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleTrackShipment = async (order) => {
    setTrackingLoadingId(order._id);
    try {
      const shipment = await shippingService.getShipmentByOrderCode(order.orderCode);
      setTrackingShipment({ order, shipment: shipment || null });
    } catch {
      setTrackingShipment({ order, shipment: null });
    } finally {
      setTrackingLoadingId(null);
    }
  };

  const handleCancelOrder = async (order, e) => {
    e?.stopPropagation();
    const isConfirmed = await confirm({
      title: 'Hủy đơn hàng?',
      description: `Bạn có chắc chắn muốn hủy đơn hàng #${order.orderCode}? Tồn kho và mã giảm giá đã áp dụng sẽ được hoàn trả lập tức.`,
      confirmText: 'Xác nhận hủy',
      cancelText: 'Giữ lại đơn',
      variant: 'destructive',
    });
    if (!isConfirmed) return;

    setCancellingId(order._id);
    try {
      await orderService.cancelOrder(order._id, 'Khách hàng yêu cầu hủy đơn');
      toast.success(`Đã hủy thành công đơn hàng #${order.orderCode}`);
      if (selectedOrder && selectedOrder._id === order._id) {
        setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: 'CANCELLED' } : null));
      }
      fetchOrders();
      if (typeof onOrdersUpdated === 'function') onOrdersUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể hủy đơn hàng');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <>
      <Card className="animate-fadeIn">
        <CardHeader className="pb-3">
          <CardTitle>Đơn hàng của tôi</CardTitle>
          <CardDescription className="mt-0.5">
            Theo dõi tiến độ giao hàng và lịch sử đơn hàng đã đặt
          </CardDescription>
        </CardHeader>
        <Separator className="mb-4" />

        <CardContent className="space-y-4">
          <OrderFilterBar
            orderSearch={orderSearch}
            onSearchChange={handleSearchChange}
            orderFilter={orderFilter}
            onFilterChange={(f) => setOrderFilter?.(f)}
            filterTabs={filterTabs}
          />

          {loading && (
            <div className="py-16 text-center space-y-3">
              <Loader2 size={24} className="animate-spin text-[#e30019] mx-auto" />
              <p className="text-xs text-slate-500">Đang tải danh sách đơn hàng...</p>
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div className="py-14 text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-[6px] bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-300">
                <PackageSearch size={22} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  {orderFilter !== 'all'
                    ? `Không có đơn hàng nào ở trạng thái "${filterTabs.find((t) => t.id === orderFilter)?.label || ''}"`
                    : orderSearch
                    ? 'Không tìm thấy đơn hàng phù hợp với từ khóa'
                    : 'Chưa có đơn hàng nào'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-md mx-auto">
                  {orderFilter !== 'all'
                    ? 'Đơn hàng của bạn có thể đang ở trạng thái khác. Hãy bấm nút dưới đây để xem toàn bộ đơn hàng.'
                    : orderSearch
                    ? 'Thử thay đổi từ khóa tìm kiếm (mã đơn hoặc tên sản phẩm).'
                    : 'Đơn hàng của bạn sẽ hiển thị tại đây sau khi bạn đặt mua sản phẩm.'}
                </p>
              </div>
              {orderSearch || orderFilter !== 'all' ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleSearchChange('');
                    setOrderFilter?.('all');
                  }}
                  className="text-xs rounded-[6px] h-8 px-4 font-medium"
                >
                  Xem tất cả đơn hàng
                </Button>
              ) : (
                <Button asChild size="sm" className="bg-[#e30019] hover:bg-[#c40015] text-white text-xs font-semibold rounded-[6px] h-9 px-4 shadow-xs">
                  <Link href="/" className="inline-flex items-center gap-1.5">
                    <span>Khám phá sản phẩm ngay</span>
                    <ArrowRight size={13} />
                  </Link>
                </Button>
              )}
            </div>
          )}

          {!loading && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => {
                let statusMeta = ORDER_STATUS_MAP[order.orderStatus] || {
                  label: order.orderStatus,
                  badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
                };
                if (order.shipment) {
                  if (order.shipment.status === 'ready_to_pick') {
                    statusMeta = { label: order.shipment.statusText || 'Chờ lấy hàng', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' };
                  } else if (order.shipment.status === 'delivering' || order.shipment.status === 'picking') {
                    statusMeta = { label: order.shipment.statusText || 'Đang giao hàng', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' };
                  } else if (order.shipment.status === 'delivered') {
                    statusMeta = { label: order.shipment.statusText || 'Đã giao hàng', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
                  }
                }
                const paymentMeta = PAYMENT_STATUS_MAP[order.paymentStatus] || {
                  label: order.paymentStatus,
                  badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
                };
                return (
                  <OrderCardItem
                    key={order._id}
                    order={order}
                    statusMeta={statusMeta}
                    paymentMeta={paymentMeta}
                    canCancel={order.orderStatus === 'PENDING'}
                    isCancelling={cancellingId === order._id}
                    trackingLoadingId={trackingLoadingId}
                    copiedCode={copiedCode}
                    onCopyCode={handleCopyCode}
                    onSelectOrder={setSelectedOrder}
                    onTrackShipment={handleTrackShipment}
                    onCancelOrder={handleCancelOrder}
                    formatPrice={formatPrice}
                    formatDate={formatDate}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <OrderDetailDialog
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        copiedCode={copiedCode}
        onCopyCode={handleCopyCode}
        statusMeta={selectedOrder ? ORDER_STATUS_MAP[selectedOrder.orderStatus] : null}
        paymentMeta={selectedOrder ? PAYMENT_STATUS_MAP[selectedOrder.paymentStatus] : null}
        formatPrice={formatPrice}
        formatDate={formatDate}
        cancellingId={cancellingId}
        onCancelOrder={handleCancelOrder}
        onTrackShipment={handleTrackShipment}
        trackingLoadingId={trackingLoadingId}
      />

      <OrderTrackingDialog
        trackingShipment={trackingShipment}
        onClose={() => setTrackingShipment(null)}
        onViewOrder={setSelectedOrder}
        copiedCode={copiedCode}
        onCopyCode={handleCopyCode}
        formatDate={formatDate}
        ORDER_STATUS_MAP={ORDER_STATUS_MAP}
      />
    </>
  );
}
