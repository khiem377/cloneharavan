import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useSupplierDebtHistory } from '@/hooks/useSupplierDebts';

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

const METHOD_LABELS = {
  cash: 'Tiền mặt',
  bank_transfer: 'Chuyển khoản',
  card: 'Quẹt thẻ',
  momo: 'MoMo',
};

export default function SupplierDebtHistoryTab({ supplierId }) {
  const { data: res = {}, isLoading } = useSupplierDebtHistory(supplierId);
  const transactions = res.transactions || [];

  return (
    <div className="flex flex-col h-full space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-foreground text-sm">Lịch sử giao dịch công nợ</h3>
        <span className="text-muted-foreground text-[11px] font-mono">
          Tổng số: {res.total || 0} giao dịch
        </span>
      </div>

      <div className="flex-1 overflow-x-auto rounded-[6px] border border-border bg-card">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50 font-bold text-muted-foreground text-[11px] uppercase">
              <th className="py-2.5 px-3">Mã phiếu</th>
              <th className="py-2.5 px-3">Kho hàng</th>
              <th className="py-2.5 px-3">Loại phiếu</th>
              <th className="py-2.5 px-3">Phương thức</th>
              <th className="py-2.5 px-3 text-right">Số tiền</th>
              <th className="py-2.5 px-3 text-right">Dư nợ sau GD</th>
              <th className="py-2.5 px-3">Tạo lúc</th>
              <th className="py-2.5 px-3">Người tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-muted-foreground">
                  Đang tải lịch sử giao dịch...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-muted-foreground">
                  Chưa có giao dịch phiếu thu/chi nào phát sinh.
                </td>
              </tr>
            ) : (
              transactions.map((t) => {
                const isPayment = t.voucherType === 'payment';

                return (
                  <tr key={t._id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-primary whitespace-nowrap">
                      {t.transactionNumber}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-foreground whitespace-nowrap">
                      {t.warehouseId?.name || '-'}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <Badge
                        className={`rounded-[4px] text-[10px] font-semibold ${
                          isPayment
                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        }`}
                      >
                        {isPayment ? 'Phiếu chi' : 'Phiếu thu'}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                      {METHOD_LABELS[t.paymentMethod] || t.paymentMethod}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                      <span className={isPayment ? 'text-destructive' : 'text-emerald-600'}>
                        {isPayment ? '-' : '+'}
                        {formatVnd(t.amount)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground whitespace-nowrap">
                      {formatVnd(t.balanceAfter)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-muted-foreground whitespace-nowrap">
                      {formatDate(t.createdAt)}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                      {t.createdById?.fullName || t.createdById?.name || 'Hệ thống'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
