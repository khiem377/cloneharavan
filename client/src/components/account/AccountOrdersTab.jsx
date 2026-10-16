'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  PackageSearch,
  ArrowRight,
  Loader2,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  Ban,
  Eye,
  Copy,
  Check,
  RotateCcw,
  ShoppingBag,
  ExternalLink,
  MapPin,
  Calendar,
  CreditCard,
  X,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogClose } from '../ui/dialog';
import { toast } from '../ui/toast';
import { confirm } from '../ui/confirm-dialog';
import orderService from '@/services/order.service';

const ORDER_STATUS_MAP = {
  PENDING: {
    label: 'Chờ xác nhận',
    color: 'amber',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  CONFIRMED: {
    label: 'Đang xử lý',
    color: 'blue',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: CheckCircle2,
  },
  SHIPPING: {
    label: 'Đang giao hàng',
    color: 'purple',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Truck,
  },
  DELIVERED: {
    label: 'Đã hoàn tất',
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'rose',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: Ban,
  },
  RETURNED: {
    label: 'Đã hoàn hàng',
    color: 'orange',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: RotateCcw,
  },
};

const PAYMENT_STATUS_MAP = {
  UNPAID: {
    label: 'Chưa thanh toán (COD)',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  PAID: {
    label: 'Đã thanh toán',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  REFUNDED: {
    label: 'Đã hoàn tiền',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
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
}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const searchDebounceTimer = useRef(null);

  const filterTabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Chờ xác nhận' },
    { id: 'processing', label: 'Đang xử lý' },
    { id: 'shipping', label: 'Đang giao hàng' },
    { id: 'completed', label: 'Đã hoàn tất' },
    { id: 'cancelled', label: 'Đã hủy' },
  ];

  const formatPrice = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const fetchOrders = useCallback(async (filterKey = orderFilter, searchQuery = orderSearch) => {
    setLoading(true);
    try {
      const mappedStatus = FILTER_TO_STATUS[filterKey];
      const params = { limit: 30 };
      if (mappedStatus) {
        params.status = mappedStatus;
      }
      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await orderService.getMyOrders(params);
      const list = Array.isArray(res?.data) ? res.data : [];
      setOrders(list);
    } catch (err) {
      console.error('Lỗi tải danh sách đơn hàng:', err);
      toast.error('Không thể tải danh sách đơn hàng. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  }, [orderFilter, orderSearch]);

  // Initial & Filter change fetch
  useEffect(() => {
    fetchOrders(orderFilter, orderSearch);
  }, [orderFilter]);

  // Debounced Search fetch
  const handleSearchChange = (val) => {
    if (setOrderSearch) setOrderSearch(val);
    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
    }
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
        setSelectedOrder((prev) => prev ? { ...prev, orderStatus: 'CANCELLED' } : null);
      }
      fetchOrders();
      if (typeof onOrdersUpdated === 'function') {
        onOrdersUpdated();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể hủy đơn hàng');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <>
      <Card className="animate-fadeIn">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          <div>
            <CardTitle>Đơn hàng của tôi</CardTitle>
            <CardDescription className="mt-0.5">
              Theo dõi tiến độ giao hàng và lịch sử đơn hàng đã đặt
            </CardDescription>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              type="text"
              value={orderSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Tìm theo mã đơn hoặc sản phẩm..."
              className="h-8 pl-8 text-xs rounded-[6px]"
            />
            {orderSearch && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </CardHeader>
        <Separator className="mb-4" />

        <CardContent className="space-y-4">
          {/* Filter Status Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-slate-100">
            {filterTabs.map((tab) => (
              <Button
                key={tab.id}
                type="button"
                variant={orderFilter === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setOrderFilter?.(tab.id)}
                className={`h-7 px-3 text-xs rounded-[6px] transition whitespace-nowrap active:scale-[0.98] ${
                  orderFilter === tab.id
                    ? 'bg-slate-900 text-white font-semibold shadow-2xs hover:bg-slate-800'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-16 text-center space-y-3">
              <Loader2 size={24} className="animate-spin text-[#e30019] mx-auto" />
              <p className="text-xs text-slate-500">Đang tải danh sách đơn hàng...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && orders.length === 0 && (
            <div className="py-14 text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-[6px] bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-300">
                <PackageSearch size={22} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  {orderSearch || orderFilter !== 'all'
                    ? 'Không tìm thấy đơn hàng phù hợp'
                    : 'Chưa tìm thấy đơn hàng nào'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {orderSearch || orderFilter !== 'all'
                    ? 'Thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc trạng thái khác.'
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
                  className="text-xs rounded-[6px] h-8 px-3"
                >
                  Xóa bộ lọc
                </Button>
              ) : (
                <Button
                  asChild
                  size="sm"
                  className="bg-[#e30019] hover:bg-[#c40015] text-white text-xs font-semibold rounded-[6px] h-9 px-4 shadow-xs active:scale-[0.98]"
                >
                  <Link href="/" className="inline-flex items-center gap-1.5">
                    <span>Khám phá sản phẩm ngay</span>
                    <ArrowRight size={13} />
                  </Link>
                </Button>
              )}
            </div>
          )}

          {/* Orders List */}
          {!loading && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusMeta = ORDER_STATUS_MAP[order.orderStatus] || {
                  label: order.orderStatus,
                  badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
                };
                const paymentMeta = PAYMENT_STATUS_MAP[order.paymentStatus] || {
                  label: order.paymentStatus,
                  badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
                };
                const canCancel = order.orderStatus === 'PENDING';
                const isCancelling = cancellingId === order._id;

                return (
                  <div
                    key={order._id}
                    className="border border-slate-200 rounded-[8px] bg-white overflow-hidden shadow-2xs hover:shadow-xs transition"
                  >
                    {/* Header */}
                    <div className="bg-slate-50/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 font-mono">
                          #{order.orderCode}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyCode(order.orderCode, e)}
                          title="Sao chép mã đơn"
                          className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition"
                        >
                          {copiedCode === order.orderCode ? (
                            <Check size={12} className="text-emerald-600" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-500 flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(order.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={`text-[11px] font-medium border px-2 py-0.5 rounded-[4px] ${statusMeta.badgeClass}`}
                        >
                          {statusMeta.label}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-normal border px-1.5 py-0.5 rounded-[4px] ${paymentMeta.badgeClass}`}
                        >
                          {paymentMeta.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-4 divide-y divide-slate-100">
                      {order.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="py-3 first:pt-0 last:pb-0 flex items-start gap-3.5"
                        >
                          <div className="w-14 h-14 rounded-[6px] border border-slate-200 overflow-hidden shrink-0 bg-slate-50 flex items-center justify-center">
                            {item.thumbnail ? (
                              <img
                                src={item.thumbnail}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ShoppingBag size={20} className="text-slate-300" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <h4 className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug">
                              {item.productName}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                              {item.variantName && (
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded-[3px] text-slate-600">
                                  {item.variantName}
                                </span>
                              )}
                              {item.sku && (
                                <span className="text-slate-400 font-mono">
                                  SKU: {item.sku}
                                </span>
                              )}
                              {item.isGift && (
                                <span className="bg-red-50 text-[#e30019] border border-red-200 px-1.5 py-0.5 rounded-[3px] font-medium text-[10px]">
                                  Quà tặng: {item.giftProgramName || 'Miễn phí'}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Số lượng: <span className="font-semibold text-slate-700">{item.quantity}</span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-xs font-bold text-slate-900 font-mono">
                              {formatPrice(item.lineTotal || item.unitPrice * item.quantity)}
                            </div>
                            {item.quantity > 1 && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                {formatPrice(item.unitPrice)} / cái
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer / Summary */}
                    <div className="bg-slate-50/60 p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      {/* Shipping Info Preview */}
                      <div className="text-[11px] text-slate-500 max-w-sm">
                        <div className="flex items-center gap-1 font-medium text-slate-700">
                          <MapPin size={12} className="text-slate-400" />
                          <span>Giao đến: {order.shippingAddress?.fullName}</span>
                          <span className="text-slate-300">|</span>
                          <span className="font-mono">{order.shippingAddress?.phone}</span>
                        </div>
                        <p className="line-clamp-1 mt-0.5 text-slate-500 pl-4">
                          {order.shippingAddress?.detailAddress}, {order.shippingAddress?.ward},{' '}
                          {order.shippingAddress?.district}, {order.shippingAddress?.province}
                        </p>
                      </div>

                      {/* Right Totals & Action Buttons */}
                      <div className="flex flex-col sm:items-end gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-600">Tổng thanh toán:</span>
                          <span className="text-sm font-bold text-[#e30019] font-mono">
                            {formatPrice(order.pricing?.totalAmount)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            className="h-8 px-3 text-xs rounded-[6px] text-slate-700 hover:bg-slate-100"
                          >
                            <Eye size={12} className="mr-1.5" />
                            Xem chi tiết
                          </Button>

                          {canCancel && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isCancelling}
                              onClick={(e) => handleCancelOrder(order, e)}
                              className="h-8 px-3 text-xs rounded-[6px] border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            >
                              {isCancelling ? (
                                <Loader2 size={12} className="animate-spin mr-1.5" />
                              ) : (
                                <Ban size={12} className="mr-1.5" />
                              )}
                              Hủy đơn
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        {selectedOrder && (
          <div className="max-h-[90vh] flex flex-col">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <DialogTitle>Chi tiết đơn hàng #{selectedOrder.orderCode}</DialogTitle>
                <button
                  type="button"
                  onClick={(e) => handleCopyCode(selectedOrder.orderCode, e)}
                  title="Sao chép mã đơn"
                  className="text-slate-400 hover:text-slate-700 p-1 rounded transition"
                >
                  {copiedCode === selectedOrder.orderCode ? (
                    <Check size={13} className="text-emerald-600" />
                  ) : (
                    <Copy size={13} />
                  )}
                </button>
              </div>
              <DialogClose onClick={() => setSelectedOrder(null)} />
            </DialogHeader>

            <DialogContent className="overflow-y-auto space-y-4 p-5 text-xs">
              {/* Order Status Ribbon */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-[6px] flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-slate-500 block text-[11px]">Trạng thái đơn:</span>
                  <Badge
                    variant="secondary"
                    className={`mt-1 font-semibold text-xs border ${
                      ORDER_STATUS_MAP[selectedOrder.orderStatus]?.badgeClass || ''
                    }`}
                  >
                    {ORDER_STATUS_MAP[selectedOrder.orderStatus]?.label || selectedOrder.orderStatus}
                  </Badge>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Thanh toán:</span>
                  <Badge
                    variant="outline"
                    className={`mt-1 text-xs border ${
                      PAYMENT_STATUS_MAP[selectedOrder.paymentStatus]?.badgeClass || ''
                    }`}
                  >
                    {PAYMENT_STATUS_MAP[selectedOrder.paymentStatus]?.label || selectedOrder.paymentStatus}
                  </Badge>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Thời gian đặt:</span>
                  <span className="font-medium text-slate-800 mt-1 block">
                    {formatDate(selectedOrder.createdAt)}
                  </span>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border border-slate-200 rounded-[6px] p-3.5 space-y-1.5">
                <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#e30019]" />
                  <span>Địa chỉ nhận hàng</span>
                </h5>
                <div className="text-slate-800 font-medium">
                  {selectedOrder.shippingAddress?.fullName} -{' '}
                  <span className="font-mono font-normal text-slate-600">
                    {selectedOrder.shippingAddress?.phone}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {selectedOrder.shippingAddress?.detailAddress}, {selectedOrder.shippingAddress?.ward},{' '}
                  {selectedOrder.shippingAddress?.district}, {selectedOrder.shippingAddress?.province}
                </p>
                {selectedOrder.note && (
                  <p className="text-amber-800 bg-amber-50 p-2 rounded text-[11px] mt-2 border border-amber-200">
                    Ghi chú khách hàng: {selectedOrder.note}
                  </p>
                )}
              </div>

              {/* Items List */}
              <div className="border border-slate-200 rounded-[6px] overflow-hidden">
                <div className="bg-slate-50 px-3.5 py-2 font-bold text-slate-900 border-b border-slate-200">
                  Danh sách sản phẩm ({selectedOrder.items?.length || 0})
                </div>
                <div className="divide-y divide-slate-100 p-3.5">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="py-2.5 first:pt-0 last:pb-0 flex items-center gap-3">
                      <div className="w-12 h-12 rounded border border-slate-200 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingBag size={18} className="text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 line-clamp-1">
                          {item.productName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {item.variantName && <span>Phân loại: {item.variantName} | </span>}
                          SL: {item.quantity} x {formatPrice(item.unitPrice)}
                        </div>
                      </div>
                      <div className="text-right font-bold font-mono text-slate-900">
                        {formatPrice(item.lineTotal || item.unitPrice * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border border-slate-200 rounded-[6px] p-3.5 space-y-2 bg-slate-50/50">
                <div className="flex justify-between text-slate-600">
                  <span>Tiền hàng (Tạm tính):</span>
                  <span className="font-mono text-slate-900">
                    {formatPrice(selectedOrder.pricing?.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Phí vận chuyển:</span>
                  <span className="font-mono text-slate-900">
                    {selectedOrder.pricing?.shippingFee === 0
                      ? 'Miễn phí'
                      : formatPrice(selectedOrder.pricing?.shippingFee)}
                  </span>
                </div>
                {selectedOrder.pricing?.couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>
                      Mã giảm giá ({selectedOrder.pricing?.couponCode || 'Voucher'}):
                    </span>
                    <span className="font-mono font-medium">
                      -{formatPrice(selectedOrder.pricing?.couponDiscount)}
                    </span>
                  </div>
                )}
                <Separator className="my-1" />
                <div className="flex justify-between text-slate-900 font-bold text-sm">
                  <span>Tổng thanh toán:</span>
                  <span className="text-[#e30019] font-mono">
                    {formatPrice(selectedOrder.pricing?.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Action buttons in Modal */}
              <div className="flex items-center justify-end gap-2 pt-2">
                {selectedOrder.orderStatus === 'PENDING' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={cancellingId === selectedOrder._id}
                    onClick={(e) => handleCancelOrder(selectedOrder, e)}
                    className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-xs"
                  >
                    {cancellingId === selectedOrder._id ? (
                      <Loader2 size={12} className="animate-spin mr-1.5" />
                    ) : (
                      <Ban size={12} className="mr-1.5" />
                    )}
                    Hủy đơn hàng
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                  className="bg-slate-900 text-white hover:bg-slate-800 text-xs px-4"
                >
                  Đóng
                </Button>
              </div>
            </DialogContent>
          </div>
        )}
      </Dialog>
    </>
  );
}
