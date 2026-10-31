import React, { useState } from 'react';
import { X, AlertCircle, XCircle } from '@/components/ui/Icons';
import { Button } from '@/components/ui/button';
import { useCancelOrder } from '@/hooks/useOrders';

export default function OrderCancelModal({
  order,
  isOpen,
  onClose,
}) {
  const [reason, setReason] = useState('');
  const cancelOrderMut = useCancelOrder();

  if (!isOpen || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    try {
      await cancelOrderMut.mutateAsync({
        id: order._id,
        reason: reason.trim(),
      });
      setReason('');
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
        className="flex w-full max-w-md flex-col overflow-hidden rounded-[6px] border border-border bg-card shadow-sm text-card-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-[6px] bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <XCircle className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Hủy đơn hàng</h3>
              <p className="text-[11px] text-muted-foreground font-mono">
                Đơn hàng: {order.orderCode}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex size-7 items-center justify-center rounded-[6px] text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98] transition-all cursor-pointer"
            onClick={onClose}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="rounded-[6px] border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 p-3 flex items-start gap-2.5 text-xs">
            <AlertCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-rose-800 dark:text-rose-300">
              <span className="font-semibold">Lưu ý kho: </span>
              Khi hủy đơn hàng, hệ thống sẽ tự động giải phóng toàn bộ số lượng giữ chỗ (allocated) của các sản phẩm trong đơn, đưa về kho bán lẻ.
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">
              Lý do hủy đơn <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ví dụ: Khách gọi yêu cầu hủy, trùng đơn, hết size..."
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
              disabled={cancelOrderMut.isPending}
              className="rounded-[6px] text-xs font-semibold cursor-pointer"
            >
              Quay lại
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={cancelOrderMut.isPending || !reason.trim()}
              className="rounded-[6px] text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
            >
              {cancelOrderMut.isPending ? 'Đang hủy...' : 'Xác nhận hủy đơn'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
