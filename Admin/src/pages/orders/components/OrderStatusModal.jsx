import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2, Truck, Check, RotateCcw } from '@/components/ui/Icons';
import { Button } from '@/components/ui/button';
import { useUpdateOrderStatus, useCancelOrder } from '@/hooks/useOrders';

const STATUS_DETAILS = {
  CONFIRMED: {
    title: 'Xác nhận đơn hàng',
    description: 'Chuyển đơn sang trạng thái Đã xác nhận để chuẩn bị đóng gói.',
    inventoryNotice: 'Kho CHƯA TRỪ tồn kho vật lý (stock), tiếp tục giữ chỗ (allocated) cho khách.',
    icon: CheckCircle2,
    btnClass: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    btnText: 'Xác nhận duyệt đơn',
  },
  SHIPPING: {
    title: 'Xuất kho giao hàng',
    description: 'Bàn giao kiện hàng cho đơn vị vận chuyển / shipper.',
    inventoryNotice: 'Hệ thống sẽ CHÍNH THỨC TRỪ TỒN KHO VẬT LÝ và giải phóng số lượng giữ chỗ.',
    icon: Truck,
    btnClass: 'bg-cyan-600 hover:bg-cyan-700 text-white',
    btnText: 'Xuất kho giao đi',
  },
  DELIVERED: {
    title: 'Xác nhận đã giao hàng',
    description: 'Khách hàng đã nhận hàng và thu tiền COD thành công.',
    inventoryNotice: 'Trạng thái thanh toán sẽ tự động chuyển sang Đã thanh toán (PAID) và ghi nhận doanh số.',
    icon: Check,
    btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    btnText: 'Hoàn tất đơn hàng',
  },
  RETURNED: {
    title: 'Ghi nhận hoàn hàng (Bom hàng)',
    description: 'Kiện hàng được giao trả về lại kho bán lẻ.',
    inventoryNotice: 'Tồn kho vật lý sẽ được CỘNG LẠI (stock += số lượng hoàn) vào kho.',
    icon: RotateCcw,
    btnClass: 'bg-orange-600 hover:bg-orange-700 text-white',
    btnText: 'Nhập lại kho hàng',
  },
};

export default function OrderStatusModal({
  order,
  nextStatus,
  isOpen,
  onClose,
}) {
  const [note, setNote] = useState('');
  const updateStatusMut = useUpdateOrderStatus();

  if (!isOpen || !order || !nextStatus) return null;

  const cfg = STATUS_DETAILS[nextStatus] || {
    title: `Chuyển trạng thái sang ${nextStatus}`,
    description: 'Cập nhật tiến trình đơn hàng',
    inventoryNotice: '',
    icon: AlertCircle,
    btnClass: 'bg-primary text-primary-foreground',
    btnText: 'Xác nhận',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateStatusMut.mutateAsync({
        id: order._id,
        status: nextStatus,
        note: note.trim() || undefined,
      });
      setNote('');
      onClose();
    } catch (_) {
      // toast is already handled in mutation
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-md flex-col overflow-hidden rounded-[8px] border border-border bg-card shadow-xl text-card-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-[6px] bg-primary/10 text-primary flex items-center justify-center">
              <cfg.icon className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">{cfg.title}</h3>
              <p className="text-[11px] text-muted-foreground font-mono">
                Đơn hàng: {order.orderCode}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex size-7 items-center justify-center rounded-[4px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            onClick={onClose}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {cfg.description}
          </p>

          {/* Inventory info alert */}
          {cfg.inventoryNotice && (
            <div className="rounded-[6px] border border-border bg-secondary/40 p-3 flex items-start gap-2.5 text-xs">
              <AlertCircle className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">Tác động kho: </span>
                <span className="text-muted-foreground">{cfg.inventoryNotice}</span>
              </div>
            </div>
          )}

          {/* Note input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">
              Ghi chú nội bộ (không bắt buộc)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú điều phối, mã bưu kiện hoặc lý do cập nhật..."
              className="w-full p-2.5 rounded-[6px] border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={updateStatusMut.isPending}
              className="rounded-[6px] text-xs font-semibold cursor-pointer"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={updateStatusMut.isPending}
              className={`rounded-[6px] text-xs font-semibold cursor-pointer ${cfg.btnClass}`}
            >
              {updateStatusMut.isPending ? 'Đang xử lý...' : cfg.btnText}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
