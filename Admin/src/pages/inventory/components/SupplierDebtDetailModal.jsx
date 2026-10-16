import React, { useState, useEffect } from 'react';
import { X, RotateCcw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

function formatVnd(val) {
  return Number(val || 0).toLocaleString('vi-VN') + ' đ';
}

function formatDateInput(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

export default function SupplierDebtDetailModal({
  supplier,
  debt,
  open,
  onClose,
  onOpenPayment,
}) {
  const [name, setName] = useState('');
  const [debtType, setDebtType] = useState('payable');
  const [currency, setCurrency] = useState('VND');
  const [createdAtStr, setCreatedAtStr] = useState('');
  const [dueDateStr, setDueDateStr] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open && debt) {
      setName(debt.name || '');
      setDebtType(debt.debtType || 'payable');
      setCreatedAtStr(formatDateInput(debt.createdAt));
      setDueDateStr(formatDateInput(debt.dueDate));
      setNote(debt.note || '');
    }
  }, [open, debt]);

  if (!open || !debt) return null;

  const isPayable = debtType === 'payable';
  const remaining = debt.remainingAmount || 0;
  const canPay = remaining > 0 && debt.status !== 'cancelled';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground border border-border rounded-[8px] shadow-xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-foreground">
              Chi tiết công nợ #{debt.debtNumber}
            </h2>
            <RotateCcw size={13} className="text-muted-foreground/70" />
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[6px] hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Form matching Pancake POS */}
        <div className="p-5 space-y-3.5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Tên công nợ */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Tên công nợ</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-8.5 rounded-[6px] text-xs font-medium"
            />
          </div>

          {/* Đơn vị tiền tệ */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Đơn vị tiền tệ</label>
            <div className="w-28">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-8 px-2.5 rounded-[6px] border border-border bg-background text-xs font-semibold"
              >
                <option value="VND">VND</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          {/* Loại công nợ (2 nút toggle) */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Loại công nợ</label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDebtType('payable')}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold transition-colors ${
                  isPayable
                    ? 'bg-[#1877F2] text-white shadow-2xs'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                Công nợ phải trả
              </button>
              <button
                type="button"
                onClick={() => setDebtType('receivable')}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold transition-colors ${
                  !isPayable
                    ? 'bg-[#1877F2] text-white shadow-2xs'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                Công nợ phải thu
              </button>
            </div>
          </div>

          {/* Nhà cung cấp */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Nhà cung cấp</label>
            <div className="h-8 px-3 flex items-center bg-muted/30 rounded-[6px] border border-border text-foreground font-medium">
              {supplier?.name || '-'}
            </div>
          </div>

          {/* Chứng từ gốc / Đơn mua hàng (nếu có) */}
          {debt.referenceCode && (
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Chứng từ gốc (Đơn mua hàng)</label>
              <div className="h-8 px-3 flex items-center justify-between bg-primary/5 rounded-[6px] border border-primary/20">
                <span className="font-mono font-bold text-primary">{debt.referenceCode}</span>
                <a
                  href="/purchase-orders"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold"
                >
                  Mở đơn PO <ExternalLink size={11} />
                </a>
              </div>
            </div>
          )}

          {/* Tạo lúc */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Tạo lúc</label>
            <Input
              type="date"
              value={createdAtStr}
              onChange={(e) => setCreatedAtStr(e.target.value)}
              className="h-8 rounded-[6px] text-xs font-mono"
            />
          </div>

          {/* Ngày đáo hạn */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Ngày đáo hạn</label>
            <Input
              type="date"
              value={dueDateStr}
              onChange={(e) => setDueDateStr(e.target.value)}
              className="h-8 rounded-[6px] text-xs font-mono"
            />
          </div>

          {/* Ghi chú */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Ghi chú</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Mô tả về công nợ"
              rows={2}
              className="rounded-[6px] text-xs resize-none"
            />
          </div>

          {/* Financial Summary Box matching Pancake */}
          <div className="pt-2 border-t border-border space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Số tiền {isPayable ? 'phải trả' : 'phải thu'}:
              </span>
              <span className="font-mono tabular-nums font-bold text-foreground">
                {formatVnd(debt.totalAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Số tiền đã trả:</span>
              <span className="font-mono tabular-nums text-foreground">
                {formatVnd(debt.paidAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-muted-foreground">Còn lại:</span>
              <span className="font-mono tabular-nums font-bold text-foreground">
                {formatVnd(remaining)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions matching Pancake */}
        <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center justify-end gap-2">
          {canPay && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPayment(debt);
              }}
              className="h-8 px-4 rounded-[4px] text-xs font-bold bg-[#22c55e] hover:bg-[#16a34a] text-white shadow-2xs active:scale-[0.98] transition-transform cursor-pointer"
            >
              Thanh toán
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="h-8 px-4 rounded-[4px] text-xs font-bold bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-2xs active:scale-[0.98] transition-transform cursor-pointer"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
