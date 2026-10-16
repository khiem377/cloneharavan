import React, { useState, useEffect } from 'react';
import { X, MinusCircle, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import PriceInput from '@/components/ui/PriceInput';
import { usePaySupplierDebt } from '@/hooks/useSupplierDebts';
import { useWarehouses } from '@/hooks/useInventory';
import { toast } from '@/providers/ToastProvider';

const PAYMENT_METHODS = [
  { label: 'Tiền chuyển khoản', value: 'bank_transfer' },
  { label: 'Tiền mặt', value: 'cash' },
  { label: 'Quẹt thẻ', value: 'card' },
  { label: 'MoMo', value: 'momo' },
];

export default function SupplierPaymentModal({ supplier, debt, open, onClose }) {
  const [description, setDescription] = useState('');
  const [voucherType, setVoucherType] = useState('payment'); // 'payment' | 'receipt'
  const [subTab, setSubTab] = useState('default'); // 'default' | 'ads'
  const [tag, setTag] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [occurredAt, setOccurredAt] = useState('');
  const [note, setNote] = useState('');
  const [financialAccounting, setFinancialAccounting] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [createDebt, setCreateDebt] = useState(false);
  const [clearDebt, setClearDebt] = useState(true);

  const { data: warehouses = [] } = useWarehouses();
  const payMut = usePaySupplierDebt(supplier?._id);

  useEffect(() => {
    if (open && debt) {
      setDescription(`Giao dịch công nợ #${debt.debtNumber}`);
      setVoucherType(debt.debtType === 'payable' ? 'payment' : 'receipt');
      setWarehouseId(debt.warehouseId?._id || debt.warehouseId || (warehouses[0]?._id || ''));
      setAmount(debt.remainingAmount || 0);
      setPaymentMethod('bank_transfer');
      setNote('');
      const now = new Date();
      const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setOccurredAt(localIso);
    }
  }, [open, debt, warehouses]);

  if (!open || !supplier || !debt) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payNum = Number(amount);
    if (!payNum || payNum <= 0) return toast.error('Vui lòng nhập số tiền hợp lệ');
    if (payNum > debt.remainingAmount) {
      return toast.error(`Số tiền thanh toán vượt quá số nợ (${debt.remainingAmount.toLocaleString('vi-VN')}đ)`);
    }

    try {
      await payMut.mutateAsync({
        debtId: debt._id,
        data: {
          voucherType,
          warehouseId: warehouseId || warehouses[0]?._id,
          amount: payNum,
          paymentMethod,
          description: description.trim(),
          note: note.trim(),
          accountingRecorded: financialAccounting,
          debtCleared: clearDebt,
        },
      });
      toast.success('Lập phiếu thanh toán công nợ thành công');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi thanh toán công nợ');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground border border-border rounded-[8px] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col">
        {/* Header matching Pancake Screenshot 2 */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-border">
          <h2 className="text-sm font-bold text-foreground">Tạo mới</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-[6px] hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body matching Pancake Screenshot 2 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
          {/* Row 1: Mô tả & Loại phiếu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Mô tả</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Giao dịch công nợ..."
                className="h-8.5 rounded-[6px] text-xs font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Loại phiếu:</label>
              <div className="flex items-center gap-1.5 h-8.5">
                <button
                  type="button"
                  onClick={() => setVoucherType('receipt')}
                  className={`flex-1 h-full rounded-[4px] text-xs font-semibold transition-colors ${
                    voucherType === 'receipt'
                      ? 'bg-[#1877F2] text-white shadow-2xs'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Phiếu thu
                </button>
                <button
                  type="button"
                  onClick={() => setVoucherType('payment')}
                  className={`flex-1 h-full rounded-[4px] text-xs font-semibold transition-colors ${
                    voucherType === 'payment'
                      ? 'bg-[#1877F2] text-white shadow-2xs'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Phiếu chi
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Sub-tabs Phiếu chi */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setSubTab('default')}
              className={`px-3 py-1 rounded-[4px] text-xs font-semibold border ${
                subTab === 'default'
                  ? 'border-border bg-background text-foreground shadow-2xs'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Phiếu chi mặc định
            </button>
            <button
              type="button"
              onClick={() => setSubTab('ads')}
              className={`px-3 py-1 rounded-[4px] text-xs font-semibold border ${
                subTab === 'ads'
                  ? 'border-border bg-background text-foreground shadow-2xs'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Phiếu chi quảng cáo
            </button>
          </div>

          {/* Row 3: Thẻ & Loại thu/chi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Thẻ:</label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full h-8.5 px-3 rounded-[6px] border border-border bg-background text-xs"
              >
                <option value="">Chọn thẻ</option>
                <option value="debt">Công nợ</option>
                <option value="po">Nhập hàng</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Loại thu/chi:</label>
              <div className="h-8.5 px-3 flex items-center bg-muted/30 rounded-[6px] border border-border text-foreground font-medium">
                Nhà cung cấp
              </div>
            </div>
          </div>

          {/* Row 4: Nhà cung cấp & Kho hàng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Nhà cung cấp:</label>
              <div className="h-8.5 px-3 flex items-center bg-muted/30 rounded-[6px] border border-border text-foreground font-medium truncate">
                {supplier.name}
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Kho hàng:</label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full h-8.5 px-3 rounded-[6px] border border-border bg-background text-xs font-medium"
              >
                <option value="">Chọn kho hàng</option>
                {(Array.isArray(warehouses) ? warehouses : []).map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name} {w.isDefault ? '(Kho mặc định)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 5: Số dư thay đổi & Phương thức thanh toán */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Số dư thay đổi:</label>
              <div className="relative flex items-center">
                <MinusCircle className="absolute left-2.5 size-4 text-destructive" />
                <PriceInput
                  value={amount}
                  onChange={setAmount}
                  placeholder="0"
                  className="pl-8 h-8.5 text-xs font-mono font-bold text-destructive"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Phương thức thanh toán:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full h-8.5 px-3 rounded-[6px] border border-border bg-background text-xs font-medium"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 6: Phát sinh lúc & Nguồn thu / chi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Phát sinh lúc:</label>
              <Input
                type="datetime-local"
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
                className="h-8.5 rounded-[6px] text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Nguồn thu / chi:</label>
              <select className="w-full h-8.5 px-3 rounded-[6px] border border-border bg-background text-xs text-muted-foreground">
                <option value="">Chọn nguồn</option>
              </select>
            </div>
          </div>

          {/* Row 7: Ghi chú & Hình ảnh */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Ghi chú:</label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nội dung, lý do, ghi chú..."
                rows={3}
                className="rounded-[6px] text-xs resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Hình ảnh:</label>
              <div className="border border-dashed border-border rounded-[6px] h-20 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/30 transition-colors cursor-pointer">
                <Plus size={16} />
                <span className="text-[11px] mt-1 font-medium">Tải lên</span>
              </div>
            </div>
          </div>

          {/* Bottom Controls matching Pancake Screenshot 2 */}
          <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Checkboxes matching Pancake */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-foreground">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={financialAccounting}
                  onChange={(e) => setFinancialAccounting(e.target.checked)}
                  className="size-3.5 rounded-[3px] accent-[#1877F2]"
                />
                <span>Hạch toán tài chính</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none text-muted-foreground">
                <input
                  type="checkbox"
                  checked={isLocked}
                  onChange={(e) => setIsLocked(e.target.checked)}
                  className="size-3.5 rounded-[3px] accent-[#1877F2]"
                />
                <span>Khóa</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none text-muted-foreground">
                <input
                  type="checkbox"
                  checked={createDebt}
                  onChange={(e) => setCreateDebt(e.target.checked)}
                  className="size-3.5 rounded-[3px] accent-[#1877F2]"
                />
                <span>Tạo công nợ</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none font-medium">
                <input
                  type="checkbox"
                  checked={clearDebt}
                  onChange={(e) => setClearDebt(e.target.checked)}
                  className="size-3.5 rounded-[3px] accent-[#1877F2]"
                />
                <span>Thanh toán công nợ</span>
              </label>
            </div>

            {/* Blue Button "Tạo" matching Pancake */}
            <Button
              type="submit"
              size="sm"
              disabled={payMut.isPending}
              className="rounded-[4px] h-8 px-5 text-xs font-bold bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-2xs active:scale-[0.98] transition-transform cursor-pointer"
            >
              {payMut.isPending ? <Loader2 className="size-3.5 animate-spin mr-1" /> : null}
              Tạo
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
