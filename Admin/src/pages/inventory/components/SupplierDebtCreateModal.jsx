import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import PriceInput from '@/components/ui/PriceInput';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { useCreateSupplierDebt } from '@/hooks/useSupplierDebts';
import { useWarehouses } from '@/hooks/useInventory';
import { toast } from '@/providers/ToastProvider';

export default function SupplierDebtCreateModal({ supplier, open, onClose }) {
  const [name, setName] = useState('');
  const [debtType, setDebtType] = useState('payable'); // 'payable' | 'receivable'
  const [warehouseId, setWarehouseId] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');

  const { data: warehouses = [] } = useWarehouses();
  const createMut = useCreateSupplierDebt(supplier?._id);

  if (!open || !supplier) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Vui lòng nhập tên công nợ');
    if (!amount || Number(amount) <= 0) return toast.error('Vui lòng nhập số tiền hợp lệ');

    try {
      await createMut.mutateAsync({
        name: name.trim(),
        debtType,
        warehouseId: warehouseId || undefined,
        totalAmount: Number(amount),
        dueDate: dueDate || undefined,
        note: note.trim(),
      });
      toast.success('Tạo công nợ thành công');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi tạo công nợ');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground border border-border rounded-[6px] shadow-lg max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-bold text-foreground">Tạo công nợ</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-[6px] hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Tên công nợ */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground flex items-center gap-1">
              <span>Tên công nợ</span>
              <span className="text-destructive">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên công nợ..."
              className="h-8.5 rounded-[6px] text-xs"
              autoFocus
            />
          </div>

          {/* Loại công nợ */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Loại công nợ</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDebtType('payable')}
                className={`py-2 px-3 text-xs font-semibold rounded-[6px] border transition-colors ${
                  debtType === 'payable'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background hover:bg-muted text-foreground border-border'
                }`}
              >
                Công nợ phải trả
              </button>
              <button
                type="button"
                onClick={() => setDebtType('receivable')}
                className={`py-2 px-3 text-xs font-semibold rounded-[6px] border transition-colors ${
                  debtType === 'receivable'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background hover:bg-muted text-foreground border-border'
                }`}
              >
                Công nợ phải thu
              </button>
            </div>
          </div>

          {/* Nhà cung cấp & Kho hàng */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground">Tên nhà cung cấp</label>
              <div className="h-8.5 px-3 flex items-center bg-muted/50 rounded-[6px] border border-border text-foreground font-medium truncate">
                {supplier.name}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Kho hàng</label>
              <SearchableSelect
                options={[
                  { label: '-- Mặc định --', value: '' },
                  ...(Array.isArray(warehouses) ? warehouses : []).map((w) => ({
                    label: w.name,
                    value: w._id,
                  })),
                ]}
                value={warehouseId}
                onChange={setWarehouseId}
                placeholder="Chọn kho hàng..."
              />
            </div>
          </div>

          {/* Số tiền & Hạn đáo hạn */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground flex items-center gap-1">
                <span>Số tiền</span>
                <span className="text-destructive">*</span>
              </label>
              <PriceInput
                value={amount}
                onChange={setAmount}
                placeholder="0"
                className="h-8.5 text-xs font-mono font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Ngày đáo hạn</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-8.5 rounded-[6px] text-xs font-mono"
              />
            </div>
          </div>

          {/* Mô tả */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Mô tả / Ghi chú</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Mô tả về công nợ..."
              rows={3}
              className="rounded-[6px] text-xs resize-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={createMut.isPending}
              className="rounded-[6px] h-8 text-xs"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createMut.isPending}
              className="rounded-[6px] h-8 text-xs font-semibold"
            >
              {createMut.isPending ? <Loader2 className="size-3.5 animate-spin mr-1" /> : null}
              Tạo
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
