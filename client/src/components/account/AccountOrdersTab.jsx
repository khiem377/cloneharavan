'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  PackageSearch,
  Package,
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
import shippingService from '@/services/shipping.service';

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

  const handleTrackShipment = async (order) => {
    setTrackingLoadingId(order._id);
    try {
      const shipment = await shippingService.getShipmentByOrderCode(order.orderCode);
      // Mở modal theo dõi tiến trình đơn hàng trực tiếp trên trang cho khách
      setTrackingShipment({ order, shipment: shipment || null });
    } catch {
      // Vẫn mở modal với dữ liệu của đơn hàng để khách xem trạng thái hiện tại
      setTrackingShipment({ order, shipment: null });
    } finally {
      setTrackingLoadingId(null);
    }
  };

  const counts = React.useMemo(() => {
    const res = {
      all: allOrders.length,
      pending: 0,
      processing: 0,
      shipping: 0,
      completed: 0,
      cancelled: 0,
    };
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
            {filterTabs.map((tab) => {
              const isActive = orderFilter === tab.id;
              return (
                <Button
                  key={tab.id}
                  type="button"
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setOrderFilter?.(tab.id)}
                  className={`h-7 px-3 text-xs rounded-[6px] transition whitespace-nowrap active:scale-[0.98] cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold shadow-2xs hover:bg-slate-800'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={`inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] font-mono font-bold tabular-nums ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : 'bg-slate-200/80 text-slate-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </Button>
              );
            })}
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
                  {orderFilter !== 'all'
                    ? `Không có đơn hàng nào ở trạng thái "${filterTabs.find((t) => t.id === orderFilter)?.label || ''}"`
                    : orderSearch
                    ? 'Không tìm thấy đơn hàng phù hợp với từ khóa'
                    : 'Chưa có đơn hàng nào'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-md mx-auto">
                  {orderFilter !== 'all'
                    ? 'Đơn hàng của bạn có thể đang ở trạng thái khác (ví dụ: Chờ xác nhận hoặc Đang xử lý). Hãy bấm nút dưới đây để xem toàn bộ đơn hàng.'
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
                  className="text-xs rounded-[6px] h-8 px-4 cursor-pointer font-medium hover:bg-slate-50"
                >
                  Xem tất cả đơn hàng
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
                let statusMeta = ORDER_STATUS_MAP[order.orderStatus] || {
                  label: order.orderStatus,
                  badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
                };

                // Ưu tiên trạng thái thực tế của vận đơn nếu đơn đã tạo vận chuyển
                if (order.shipment) {
                  if (order.shipment.status === 'ready_to_pick') {
                    statusMeta = {
                      label: order.shipment.statusText || 'Chờ lấy hàng',
                      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
                    };
                  } else if (order.shipment.status === 'delivering' || order.shipment.status === 'picking') {
                    statusMeta = {
                      label: order.shipment.statusText || 'Đang giao hàng',
                      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
                    };
                  } else if (order.shipment.status === 'delivered') {
                    statusMeta = {
                      label: order.shipment.statusText || 'Đã giao hàng',
                      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    };
                  }
                }
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
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="font-semibold text-slate-900 font-mono hover:text-blue-600 hover:underline transition-colors text-left cursor-pointer"
                          title="Bấm để xem chi tiết đơn hàng"
                        >
                          #{order.orderCode}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleCopyCode(order.orderCode, e)}
                          title="Sao chép mã đơn"
                          className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition cursor-pointer"
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

                    {/* Order Items (Giới hạn tối đa 2 sản phẩm hiển thị gọn gàng) */}
                    <div className="p-4 divide-y divide-slate-100">
                      {(order.items || []).slice(0, 2).map((item, idx) => (
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

                      {/* Nút xem thêm nếu đơn hàng có nhiều hơn 2 sản phẩm */}
                      {(order.items || []).length > 2 && (
                        <div className="pt-3">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="w-full py-2 px-3 text-center text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-[6px] transition border border-dashed border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ShoppingBag size={13} className="text-slate-400" />
                            <span>Xem thêm {(order.items || []).length - 2} sản phẩm khác trong đơn</span>
                            <ArrowRight size={12} className="text-slate-400" />
                          </button>
                        </div>
                      )}
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
                          {/* Nút Xem đơn hàng / Theo dõi vận chuyển trực tiếp đến đối tác */}
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            disabled={trackingLoadingId === order._id}
                            onClick={() => handleTrackShipment(order)}
                            className="h-8 px-3 text-xs rounded-[6px] bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-2xs cursor-pointer"
                            title="Xem trạng thái hành trình từ đơn vị vận chuyển"
                          >
                            {trackingLoadingId === order._id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Truck size={13} />
                            )}
                            <span>Theo dõi đơn</span>
                          </Button>

                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs rounded-[6px] border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer shadow-2xs"
                          >
                            <Link
                              href={`/tai-khoan/don-hang/${order.orderCode || order._id}`}
                              className="inline-flex items-center gap-1.5"
                            >
                              <Eye size={13} />
                              <span>Xem chi tiết</span>
                            </Link>
                          </Button>

                          {canCancel && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isCancelling}
                              onClick={(e) => handleCancelOrder(order, e)}
                              className="h-8 px-3 text-xs rounded-[6px] border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
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
                  onClick={() => handleTrackShipment(selectedOrder)}
                  disabled={trackingLoadingId === selectedOrder._id}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Tra cứu lộ trình từ đơn vị vận chuyển"
                >
                  {trackingLoadingId === selectedOrder._id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Truck size={12} />
                  )}
                  <span>Theo dõi vận đơn</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
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

      {/* Dialog Tra cứu Tiến độ & Trạng thái Đơn hàng cho Khách hàng */}
      <Dialog
        open={Boolean(trackingShipment)}
        onOpenChange={(open) => !open && setTrackingShipment(null)}
      >
        {trackingShipment && (() => {
          const { order, shipment } = trackingShipment;
          const oSt = (order?.orderStatus || '').toUpperCase();
          const sSt = (shipment?.status || '').toLowerCase();
          const isCancelled = oSt === 'CANCELLED' || oSt === 'RETURNED';

          // 4 bước tiến trình: 1. Đặt hàng, 2. Chuẩn bị hàng, 3. Đang giao, 4. Đã nhận hàng
          let activeStep = 1;
          if (isCancelled) activeStep = -1;
          else if (oSt === 'DELIVERED' || sSt === 'delivered') activeStep = 4;
          else if (oSt === 'SHIPPING' || sSt === 'delivering' || sSt === 'picking') activeStep = 3;
          else if (oSt === 'CONFIRMED' || sSt === 'ready_to_pick' || shipment) activeStep = 2;

          const steps = [
            { step: 1, label: 'Đặt hàng thành công', desc: formatDate(order?.createdAt) },
            {
              step: 2,
              label: 'Chuẩn bị hàng',
              desc: activeStep >= 2 ? (sSt === 'ready_to_pick' ? 'Đã đóng gói, chờ lấy' : 'Kho đang xử lý') : 'Chờ xác nhận',
            },
            {
              step: 3,
              label: 'Đang giao hàng',
              desc: activeStep >= 3 ? (shipment?.carrierName ? `${shipment.carrierName} đang giao` : 'Đang vận chuyển') : 'Chưa giao',
            },
            {
              step: 4,
              label: 'Đã nhận hàng',
              desc: activeStep >= 4 ? 'Giao thành công' : 'Chờ hoàn tất',
            },
          ];

          return (
            <div className="max-h-[85vh] flex flex-col">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Truck className="text-blue-600" size={18} />
                  <DialogTitle>Tiến độ đơn hàng #{order?.orderCode}</DialogTitle>
                </div>
                <DialogClose onClick={() => setTrackingShipment(null)} />
              </DialogHeader>

              <DialogContent className="overflow-y-auto space-y-4 p-5 text-xs">
                {/* Banner trạng thái chính */}
                {isCancelled ? (
                  <div className="p-3.5 rounded-[6px] border border-rose-200 bg-rose-50/70 text-rose-800 space-y-1">
                    <div className="flex items-center gap-2 font-semibold">
                      <Ban size={15} className="text-rose-600" />
                      <span>Đơn hàng đã được hủy</span>
                    </div>
                    <p className="text-[11px] text-rose-700 leading-relaxed">
                      Đơn hàng đã hủy. Số lượng tồn kho và các ưu đãi liên quan đã được hoàn trả về hệ thống.
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-[6px] border border-blue-200 bg-blue-50/60 text-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-blue-900 text-[13px]">
                        {activeStep === 4 && <CheckCircle2 size={16} className="text-emerald-600" />}
                        {activeStep === 3 && <Truck size={16} className="text-blue-600" />}
                        {activeStep === 2 && <Package size={16} className="text-amber-600" />}
                        {activeStep === 1 && <Clock size={16} className="text-slate-600" />}
                        <span>
                          {activeStep === 4 && 'Kiện hàng đã giao thành công'}
                          {activeStep === 3 && 'Đơn hàng đang trên đường giao đến bạn'}
                          {activeStep === 2 && (sSt === 'ready_to_pick' ? 'Đã đóng gói - Chờ đơn vị vận chuyển lấy hàng' : 'Cửa hàng đang chuẩn bị và đóng gói')}
                          {activeStep === 1 && 'Đã đặt hàng - Cửa hàng đang tiếp nhận'}
                        </span>
                      </div>
                      <Badge variant="secondary" className="bg-white border border-blue-200 text-blue-700 font-mono text-[10px]">
                        {ORDER_STATUS_MAP[order?.orderStatus]?.label || order?.orderStatus}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {activeStep === 4 && 'Cảm ơn bạn đã mua sắm tại cửa hàng. Bạn có thể kiểm tra sản phẩm và để lại đánh giá.'}
                      {activeStep === 3 && `Nhân viên giao hàng của ${shipment?.carrierName || 'đối tác vận chuyển'} đang trên đường giao đến bạn. Vui lòng để ý điện thoại.`}
                      {activeStep === 2 && (sSt === 'ready_to_pick' ? `Kiện hàng đã được dán nhãn vận đơn. Đang chờ nhân viên của ${shipment?.carrierName || 'đơn vị vận chuyển'} qua kho tiếp nhận để chuyển phát.` : 'Shop đã nhận đơn và nhân viên kho đang soạn hàng, kiểm tra sản phẩm trước khi đóng gói.')}
                      {activeStep === 1 && 'Đơn hàng đã được ghi nhận trên hệ thống. Nhân viên cửa hàng sẽ sớm xác nhận và xử lý đơn.'}
                    </p>
                  </div>
                )}

                {/* Stepper trực quan 4 bước */}
                {!isCancelled && (
                  <div className="bg-white border border-slate-200 rounded-[6px] p-4">
                    <div className="grid grid-cols-4 relative">
                      {/* Đường line nối giữa các bước */}
                      <div className="absolute top-4 left-[12%] right-[12%] h-0.5 bg-slate-200 -z-0">
                        <div
                          className="h-full bg-blue-600 transition-all duration-300"
                          style={{
                            width: `${Math.max(0, Math.min(100, ((activeStep - 1) / 3) * 100))}%`,
                          }}
                        />
                      </div>

                      {steps.map((st) => {
                        const isDone = activeStep >= st.step;
                        const isCurrent = activeStep === st.step;

                        return (
                          <div key={st.step} className="flex flex-col items-center text-center relative z-10 px-1">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                                isDone
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-white border-2 border-slate-300 text-slate-400'
                              } ${isCurrent ? 'ring-2 ring-blue-200' : ''}`}
                            >
                              {isDone && st.step < activeStep ? (
                                <Check size={14} />
                              ) : (
                                <span>{st.step}</span>
                              )}
                            </div>
                            <span
                              className={`mt-2 font-semibold text-[11px] leading-tight ${
                                isCurrent ? 'text-blue-700' : isDone ? 'text-slate-800' : 'text-slate-400'
                              }`}
                            >
                              {st.label}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                              {st.desc}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Thông tin giao hàng & Vận đơn */}
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-[6px] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Đơn vị vận chuyển:</span>
                    <span className="font-semibold text-slate-800">
                      {shipment?.carrierName || 'Vận chuyển tiêu chuẩn của cửa hàng'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Mã vận đơn:</span>
                    {shipment?.trackingCode ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-blue-600 select-all">
                          {shipment.trackingCode}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyCode(shipment.trackingCode, e)}
                          title="Sao chép mã vận đơn"
                          className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                        >
                          {copiedCode === shipment.trackingCode ? (
                            <Check size={12} className="text-emerald-600" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Sẽ được cấp khi bàn giao shipper</span>
                    )}
                  </div>
                  <Separator className="my-1.5" />
                  <div className="space-y-1">
                    <span className="text-slate-500 block">Địa chỉ nhận hàng:</span>
                    <p className="font-semibold text-slate-800">
                      {order?.shippingAddress?.fullName} - <span className="font-mono">{order?.shippingAddress?.phone}</span>
                    </p>
                    <p className="text-slate-600 leading-snug">
                      {order?.shippingAddress?.detailAddress}, {order?.shippingAddress?.ward},{' '}
                      {order?.shippingAddress?.district}, {order?.shippingAddress?.province}
                    </p>
                  </div>
                </div>

                {/* Nhật ký hành trình */}
                <div className="space-y-2">
                  <h5 className="font-semibold text-slate-800 text-xs">Nhật ký tiến trình</h5>
                  <div className="border border-slate-200 rounded-[6px] p-3 space-y-3 bg-white max-h-48 overflow-y-auto">
                    {(shipment?.historyLogs || []).length > 0 ? (
                      shipment.historyLogs.map((log, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-[11px]">
                          <div className="w-2 h-2 rounded-full bg-blue-600 mt-1 shrink-0" />
                          <div className="flex-1">
                            <p className="text-slate-800 font-medium">{log.description}</p>
                            <span className="text-slate-400 text-[10px]">{formatDate(log.updatedAt)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="space-y-3">
                        {activeStep >= 2 && (
                          <div className="flex items-start gap-2.5 text-[11px]">
                            <div className="w-2 h-2 rounded-full bg-blue-600 mt-1 shrink-0" />
                            <div className="flex-1">
                              <p className="text-slate-800 font-medium">
                                {sSt === 'ready_to_pick'
                                  ? `Đã đóng gói kiện hàng, chuẩn bị bàn giao cho ${shipment?.carrierName || 'đối tác vận chuyển'}`
                                  : 'Shop đã xác nhận đơn hàng và đang đóng gói sản phẩm'}
                              </p>
                              <span className="text-slate-400 text-[10px]">{formatDate(order?.updatedAt || order?.createdAt)}</span>
                            </div>
                          </div>
                        )}
                        <div className="flex items-start gap-2.5 text-[11px]">
                          <div className="w-2 h-2 rounded-full bg-slate-400 mt-1 shrink-0" />
                          <div className="flex-1">
                            <p className="text-slate-700 font-medium">Đơn hàng được đặt thành công</p>
                            <span className="text-slate-400 text-[10px]">{formatDate(order?.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTrackingShipment(null);
                      setSelectedOrder(order);
                    }}
                    className="text-xs px-3 cursor-pointer text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
                  >
                    <Eye size={12} />
                    <span>Xem chi tiết đơn</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setTrackingShipment(null)}
                    className="bg-slate-900 text-white hover:bg-slate-800 text-xs px-4 cursor-pointer"
                  >
                    Đóng
                  </Button>
                </div>
              </DialogContent>
            </div>
          );
        })()}
      </Dialog>
    </>
  );
}
