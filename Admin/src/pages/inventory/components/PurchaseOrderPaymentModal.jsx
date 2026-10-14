import React, { useState, useEffect } from 'react';
import { X, CreditCard, Banknote, Building2, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PriceInput from '@/components/ui/PriceInput';
import { useWarehouses } from '@/hooks/useInventory';
import { useRecordPOPayment } from '@/hooks/useInventory';
import { toast } from '@/providers/ToastProvider';

const PAYMENT_METHODS = [
  { label: 'Chuyển khoản (VietQR)', value: 'bank_transfer', icon: Building2 },
  { label: 'Tiền mặt', value: 'cash', icon: Banknote },
  { label: 'Quẹt thẻ POS', value: 'card', icon: CreditCard },
];

export default function PurchaseOrderPaymentModal({ po, open, onClose, onSuccess }) {
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [warehouseId, setWarehouseId] = useState('');
  const [note, setNote] = useState('');
  const [accountingRecorded, setAccountingRecorded] = useState(true);

  const { data: warehouses = [] } = useWarehouses();
  const recordPaymentMutation = useRecordPOPayment();

  const totalAmount = Number(po?.totalAmount || 0);
  const currentPaid = Number(po?.paidAmount || 0);
  const remainingAmount = Math.max(0, totalAmount - currentPaid);

  useEffect(() => {
    if (open && po) {
      setAmount(remainingAmount);
      setPaymentMethod('bank_transfer');
      const targetWh = po.warehouseId?._id || po.warehouseId || (warehouses[0]?._id || '');
      setWarehouseId(targetWh);
      setNote(`Thanh toán đơn nhập hàng ${po.poNumber}`);
      setAccountingRecorded(true);
    }
  }, [open, po, remainingAmount, warehouses]);

  if (!open || !po) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payNum = Number(amount);
    if (!payNum || payNum <= 0) {
      return toast.error('Vui lòng nhập số tiền thanh toán hợp lệ lớn hơn 0');
    }
    if (payNum > remainingAmount) {
      return toast.error(
        `Số tiền thanh toán (${payNum.toLocaleString('vi-VN')} đ) vượt quá số nợ còn lại (${remainingAmount.toLocaleString('vi-VN')} đ)`
      );
    }

    try {
      await recordPaymentMutation.mutateAsync({
        id: po._id,
        data: {
          amount: payNum,
          warehouseId: warehouseId || warehouses[0]?._id,
          paymentMethod,
          description: `Thanh toán cho đơn nhập hàng ${po.poNumber}`,
          note: note.trim(),
          accountingRecorded,
        },
      });

      toast.success(`Đã xác nhận thanh toán ${payNum.toLocaleString('vi-VN')} đ cho đơn ${po.poNumber}`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi xác nhận thanh toán');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground border border-border rounded-[6px] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/40">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <CreditCard className="size-4 text-primary" />
              Xác Nhận Thanh Toán Đơn Nhập Hàng
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Đơn hàng: <span className="font-mono font-bold text-primary">{po.poNumber}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[4px] hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Summary Box */}
          <div className="rounded-[6px] border border-border bg-muted/30 p-3.5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Nhà cung cấp:</span>
              <span className="font-bold text-foreground truncate max-w-[240px]">
                {po.supplierId?.name || 'Nhà cung cấp'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Tổng giá trị đơn:</span>
              <span className="font-mono font-semibold tabular-nums text-foreground">
                {totalAmount.toLocaleString('vi-VN')} đ
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Đã thanh toán trước:</span>
              <span className="font-mono font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {currentPaid.toLocaleString('vi-VN')} đ
              </span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-border pt-2">
              <span className="font-bold text-foreground">Số tiền còn cần trả:</span>
              <span className="font-mono font-bold tabular-nums text-base text-primary">
                {remainingAmount.toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>

          {/* Số tiền thanh toán */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-foreground">
                Số tiền thanh toán đợt này <span className="text-destructive">*</span>
              </label>
              <button
                type="button"
                onClick={() => setAmount(remainingAmount)}
                className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
              >
                Trả hết ({remainingAmount.toLocaleString('vi-VN')} đ)
              </button>
            </div>
            <PriceInput
              value={amount}
              onChange={(val) => setAmount(val)}
              className="h-9 rounded-[6px] text-sm font-bold font-mono text-primary"
              placeholder="0"
            />
          </div>

          {/* Phương thức thanh toán */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Phương thức thanh toán</label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setPaymentMethod(m.value)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-[6px] border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-2xs'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted/60'
                    }`}
                  >
                    <Icon className="size-4 mb-1" />
                    <span className="text-[11px]">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kho chi trả */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Kho hàng phát sinh chi tiền</label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="w-full h-8.5 px-3 rounded-[6px] border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {warehouses.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name} {w.isDefault ? '(Kho chính)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Ghi chú */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Ghi chú phiếu chi</label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nội dung thanh toán..."
              className="h-8.5 rounded-[6px] text-xs"
            />
          </div>

          {/* Hạch toán tài chính */}
          <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              checked={accountingRecorded}
              onChange={(e) => setAccountingRecorded(e.target.checked)}
              className="rounded-[4px] border-input text-primary focus:ring-primary size-4"
            />
            <span>Tự động hạch toán vào sổ quỹ tiền mặt / ngân hàng</span>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-[6px] text-xs h-8.5"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={recordPaymentMutation.isPending || amount <= 0}
              className="rounded-[6px] bg-primary text-primary-foreground font-bold text-xs h-8.5 shadow-xs active:scale-[0.98]"
            >
              {recordPaymentMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  Đang ghi nhận...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5 mr-1.5" />
                  Xác Nhận Thanh Toán
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
