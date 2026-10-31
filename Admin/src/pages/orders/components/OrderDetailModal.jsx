import React from 'react';
import {
  X,
  Package,
  MapPin,
  Clock,
  Phone,
  User,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Gift,
} from '@/components/ui/Icons';
import { Button } from '@/components/ui/button';
import { toast } from '@/providers/ToastProvider';
import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG } from './OrderTable';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })} ${d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  } catch {
    return '—';
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount || 0);
};

export default function OrderDetailModal({
  order,
  onClose,
  onOpenStatusModal,
  onOpenCancelModal,
}) {
  if (!order) return null;

  const statusCfg = ORDER_STATUS_CONFIG[order.orderStatus] || {
    label: order.orderStatus,
    badgeClass: 'bg-muted text-muted-foreground',
    icon: AlertCircle,
  };

  const paymentCfg = PAYMENT_STATUS_CONFIG[order.paymentStatus] || {
    label: order.paymentStatus,
    badgeClass: 'bg-muted text-muted-foreground',
  };

  const copyOrderCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã đơn: ${code}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-3xl flex-col overflow-hidden rounded-[6px] border border-border bg-card shadow-sm text-card-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-[6px] bg-primary/10 text-primary flex items-center justify-center">
              <Package className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-foreground font-mono">
                  {order.orderCode}
                </h2>
                <button
                  type="button"
                  onClick={() => copyOrderCode(order.orderCode)}
                  className="p-1 rounded-[6px] hover:bg-muted text-muted-foreground hover:text-foreground active:scale-[0.98] transition-all cursor-pointer"
                  title="Sao chép mã đơn"
                >
                  <Copy className="size-3" />
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono">
                Đặt lúc: {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-semibold ${statusCfg.badgeClass}`}
            >
              <statusCfg.icon className="size-3.5" />
              <span>{statusCfg.label}</span>
            </span>
            <button
              type="button"
              className="inline-flex size-7 items-center justify-center rounded-[6px] text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98] transition-all cursor-pointer"
              onClick={onClose}
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-5 p-5 overflow-y-auto max-h-[75vh]">
          {/* Thông báo tình trạng tồn kho */}
          <div className="rounded-[6px] border border-border bg-secondary/30 p-3 flex items-start gap-2.5 text-xs">
            <AlertCircle className="size-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-foreground">Trạng thái xử lý & Tồn kho: </span>
              <span className="text-muted-foreground">
                {order.orderStatus === 'PENDING' &&
                  'Đơn đang ở trạng thái Chờ duyệt. Hệ thống đã GIỮ CHỖ số lượng trong kho (allocated), tồn kho vật lý (stock) chưa bị trừ.'}
                {order.orderStatus === 'CONFIRMED' &&
                  'Đơn đã được duyệt. Hàng vẫn đang được giữ chỗ tại kho, vui lòng đóng gói và bàn giao cho đơn vị vận chuyển.'}
                {order.orderStatus === 'SHIPPING' &&
                  'Hàng đã xuất kho và giao cho shipper. Hệ thống ĐÃ TRỪ TỒN KHO VẬT LÝ và giải phóng giữ chỗ.'}
                {order.orderStatus === 'DELIVERED' &&
                  'Đơn hàng giao thành công và hoàn tất đối soát tiền.'}
                {order.orderStatus === 'CANCELLED' &&
                  `Đơn hàng đã bị hủy (${order.cancelReason || 'Không có lý do'}). Hệ thống đã hoàn trả số lượng giữ chỗ lại cho kho bán lẻ.`}
                {order.orderStatus === 'RETURNED' &&
                  'Khách không nhận/hoàn hàng. Tồn kho vật lý đã được nhập lại vào kho hàng.'}
              </span>
            </div>
          </div>

          {/* Grid 2 cột: Thông tin người nhận & Thanh toán */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Người nhận */}
            <div className="rounded-[6px] border border-border bg-card p-4 flex flex-col gap-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground pb-2 border-b border-border">
                <MapPin className="size-3.5 text-primary" />
                <span>Địa chỉ nhận hàng</span>
              </div>
              <div className="flex flex-col gap-1 text-xs">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <User className="size-3.5 text-muted-foreground" />
                  <span>{order.shippingAddress?.fullName || '—'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="size-3.5" />
                  <span className="font-mono">{order.shippingAddress?.phone || '—'}</span>
                </div>
                <p className="text-muted-foreground mt-1 leading-relaxed">
                  {[
                    order.shippingAddress?.detailAddress,
                    order.shippingAddress?.ward,
                    order.shippingAddress?.district,
                    order.shippingAddress?.province,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                {order.note && (
                  <div className="mt-2 p-2 rounded-[4px] bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px]">
                    <span className="font-semibold">Ghi chú cho shipper: </span>
                    {order.note}
                  </div>
                )}
              </div>
            </div>

            {/* Thanh toán & Vận chuyển */}
            <div className="rounded-[6px] border border-border bg-card p-4 flex flex-col gap-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground pb-2 border-b border-border">
                <CreditCard className="size-3.5 text-primary" />
                <span>Phương thức & Thanh toán</span>
              </div>
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Hình thức:</span>
                  <span className="font-semibold text-foreground uppercase">
                    {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : order.paymentMethod}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Trạng thái thanh toán:</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-semibold ${paymentCfg.badgeClass}`}
                  >
                    {paymentCfg.label}
                  </span>
                </div>
                {order.pricing?.couponCode && (
                  <div className="flex items-center justify-between pt-1 border-t border-dashed border-border">
                    <span className="text-muted-foreground">Mã ưu đãi (Voucher):</span>
                    <span className="font-mono font-bold text-primary">
                      {order.pricing.couponCode}
                    </span>
                  </div>
                )}
                {order.idempotencyKey && (
                  <div className="flex items-center justify-between pt-1 border-t border-dashed border-border text-[11px]">
                    <span className="text-muted-foreground">Idempotency Key:</span>
                    <span className="font-mono text-muted-foreground truncate max-w-[200px]" title={order.idempotencyKey}>
                      {order.idempotencyKey}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Danh sách sản phẩm */}
          <div className="rounded-[6px] border border-border bg-card overflow-hidden">
            <div className="px-4 py-2.5 bg-muted/40 border-b border-border flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                Danh sách sản phẩm trong đơn ({order.items?.length || 0})
              </span>
            </div>

            <div className="divide-y divide-border">
              {order.items?.map((item, idx) => (
                <div key={item._id || idx} className="p-3.5 flex items-center gap-3">
                  <div className="size-14 rounded-[4px] border border-border overflow-hidden bg-secondary/50 shrink-0">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.productName}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center text-muted-foreground">
                        <Package className="size-5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-foreground truncate">
                        {item.productName}
                      </h4>
                      {item.isGift && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] bg-amber-500/10 text-amber-600 text-[10px] font-medium border border-amber-500/20 shrink-0">
                          <Gift className="size-2.5" />
                          Quà tặng
                        </span>
                      )}
                    </div>
                    {item.variantName && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        Phân loại: {item.variantName}
                      </p>
                    )}
                    {item.sku && (
                      <p className="text-[10px] font-mono text-muted-foreground/80">
                        SKU: {item.sku}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold font-mono text-foreground">
                      {formatCurrency(item.unitPrice)}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      x {item.quantity}
                    </div>
                    <div className="text-xs font-bold font-mono text-primary mt-1">
                      {formatCurrency(item.lineTotal || item.subtotal)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bảng tính tiền Pricing Breakdown */}
            <div className="p-4 bg-muted/20 border-t border-border flex flex-col gap-1.5 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Tạm tính tiền hàng:</span>
                <span className="font-mono text-foreground">
                  {formatCurrency(order.pricing?.subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Phí vận chuyển:</span>
                <span className="font-mono text-foreground">
                  {order.pricing?.shippingFee === 0 ? 'Miễn phí' : formatCurrency(order.pricing?.shippingFee)}
                </span>
              </div>
              {order.pricing?.couponDiscount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Giảm giá khuyến mãi:</span>
                  <span className="font-mono font-medium">
                    - {formatCurrency(order.pricing.couponDiscount)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-border text-sm font-bold">
                <span className="text-foreground">Tổng tiền thanh toán:</span>
                <span className="font-mono text-primary text-base">
                  {formatCurrency(order.pricing?.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Lịch sử trạng thái */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="rounded-[6px] border border-border bg-card p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground pb-2 border-b border-border">
                <Clock className="size-3.5 text-primary" />
                <span>Nhật ký luân chuyển trạng thái</span>
              </div>
              <div className="mt-3 flex flex-col gap-2.5">
                {order.statusHistory.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs">
                    <span className="size-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground font-mono">
                          {ORDER_STATUS_CONFIG[h.status]?.label || h.status}
                        </span>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {formatDate(h.changedAt)}
                        </span>
                      </div>
                      {h.note && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">{h.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-5 py-3.5 bg-muted/20">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-[6px] text-xs font-semibold cursor-pointer"
          >
            Đóng
          </Button>

          <div className="flex items-center gap-2">
            {(order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED') && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-[6px] text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900 cursor-pointer"
                onClick={() => {
                  onClose();
                  onOpenCancelModal(order);
                }}
              >
                Hủy đơn hàng
              </Button>
            )}

            {order.orderStatus === 'PENDING' && (
              <Button
                size="sm"
                className="rounded-[6px] text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                onClick={() => {
                  onClose();
                  onOpenStatusModal(order, 'CONFIRMED');
                }}
              >
                Xác nhận đơn hàng
              </Button>
            )}

            {order.orderStatus === 'CONFIRMED' && (
              <Button
                size="sm"
                className="rounded-[6px] text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer"
                onClick={() => {
                  onClose();
                  onOpenStatusModal(order, 'SHIPPING');
                }}
              >
                Xuất kho giao hàng
              </Button>
            )}

            {order.orderStatus === 'SHIPPING' && (
              <Button
                size="sm"
                className="rounded-[6px] text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                onClick={() => {
                  onClose();
                  onOpenStatusModal(order, 'DELIVERED');
                }}
              >
                Xác nhận đã giao hàng
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
