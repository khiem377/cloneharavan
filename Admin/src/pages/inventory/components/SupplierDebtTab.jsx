import React, { useState } from 'react';
import { Plus, ChevronDown, CheckCircle2, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupplierDebts, useOffsetSupplierDebts } from '@/hooks/useSupplierDebts';
import { toast } from '@/providers/ToastProvider';

function formatVnd(val) {
  return Number(val || 0).toLocaleString('vi-VN') + ' đ';
}

function formatDate(date) {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SupplierDebtTab({
  supplierId,
  onOpenCreateDebt,
  onSelectDebt,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: res = {}, isLoading, refetch } = useSupplierDebts(supplierId);
  const offsetMut = useOffsetSupplierDebts(supplierId);

  const debts = res.debts || [];
  const summary = res.summary || { totalPayable: 0, totalReceivable: 0, netDebt: 0 };

  const handleOffset = async () => {
    try {
      const result = await offsetMut.mutateAsync();
      toast.success(result.message || 'Bù trừ công nợ thành công');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể bù trừ công nợ');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3 text-xs">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-foreground text-sm">Danh sách</h3>

        <div className="relative">
          <Button
            size="sm"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="rounded-[6px] h-8 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus size={14} /> Thêm <ChevronDown size={13} />
          </Button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-card border border-border rounded-[6px] shadow-md py-1 z-30 animate-in fade-in zoom-in-95">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenCreateDebt();
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-foreground hover:bg-muted transition-colors font-medium"
              >
                Tạo mới
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleOffset();
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-foreground hover:bg-muted transition-colors font-medium border-t border-border"
              >
                Bù trừ tự động
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table of Debts */}
      <div className="flex-1 overflow-x-auto rounded-[6px] border border-border bg-card">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50 font-bold text-muted-foreground text-[11px] uppercase">
              <th className="py-2.5 px-3 whitespace-nowrap">ID</th>
              <th className="py-2.5 px-3">Tên công nợ</th>
              <th className="py-2.5 px-3">Ghi chú / Chứng từ</th>
              <th className="py-2.5 px-3 text-right">Còn lại</th>
              <th className="py-2.5 px-3">Người tạo</th>
              <th className="py-2.5 px-3">Tạo lúc</th>
              <th className="py-2.5 px-3 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground">
                  Đang tải danh sách công nợ...
                </td>
              </tr>
            ) : debts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground">
                  Không có khoản công nợ nào. Nhấn "+ Thêm" để tạo mới.
                </td>
              </tr>
            ) : (
              debts.map((d) => {
                const isPaid = d.remainingAmount <= 0 || d.status === 'paid';
                const isPayable = d.debtType === 'payable';

                return (
                  <tr
                    key={d._id}
                    onClick={() => onSelectDebt(d)}
                    className="hover:bg-muted/40 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-primary whitespace-nowrap">
                      {d.debtNumber}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-foreground max-w-[180px] truncate">
                      {d.name}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground max-w-[150px] truncate">
                      {d.referenceCode ? (
                        <span className="font-mono text-primary font-medium">{d.referenceCode}</span>
                      ) : (
                        d.note || '-'
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                      <span className={isPayable ? 'text-destructive' : 'text-emerald-600'}>
                        {formatVnd(d.remainingAmount)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                      {d.createdById?.fullName || d.createdById?.name || 'Hệ thống'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-muted-foreground whitespace-nowrap">
                      {formatDate(d.createdAt)}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <Badge
                        className={`rounded-[4px] text-[10px] uppercase font-semibold ${
                          isPaid
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}
                      >
                        {isPaid ? 'Đã giao dịch' : 'Chưa giao dịch'}
                      </Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Summary Bar (Pancake Style) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border bg-muted/20 px-3 py-2.5 rounded-[6px]">
        <div className="flex items-center gap-4 text-xs">
          <span>
            Phải thu:{' '}
            <strong className="font-mono font-bold text-emerald-600">
              {formatVnd(summary.totalReceivable)}
            </strong>
          </span>
          <span className="text-border">|</span>
          <span>
            Phải trả:{' '}
            <strong className="font-mono font-bold text-destructive">
              {formatVnd(summary.totalPayable)}
            </strong>
          </span>
          <span className="text-border">|</span>
          <span>
            Tổng công nợ:{' '}
            <strong className="font-mono font-bold text-foreground">
              {formatVnd(summary.netDebt)}
            </strong>
          </span>
        </div>

        <Button
          size="sm"
          variant="outline"
          disabled={offsetMut.isPending || debts.length === 0}
          onClick={handleOffset}
          className="rounded-[6px] h-7 text-xs font-semibold px-3"
        >
          {offsetMut.isPending ? <RefreshCw className="size-3 animate-spin mr-1" /> : null}
          Bù trừ
        </Button>
      </div>
    </div>
  );
}
