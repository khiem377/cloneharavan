import React from 'react';
import { ReceiptText, ExternalLink, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function SupplierDebtRowDetail({
  supplier,
  visibleCount,
  onViewDetail,
}) {
  const debts = supplier?.unpaidDebts || [];
  if (debts.length === 0) return null;

  return (
    <tr className="bg-muted/30 border-b border-border">
      <td colSpan={visibleCount} className="py-2.5 px-4 sm:px-6">
        <div className="rounded-[6px] border border-border bg-card p-3 space-y-2.5 text-xs shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground flex items-center gap-1.5 text-xs">
              <ReceiptText size={14} className="text-primary" />
              Chi tiết các đơn nhập hàng chưa thanh toán của {supplier.name} ({debts.length} đơn):
            </span>
            <button
              type="button"
              onClick={() => onViewDetail && onViewDetail(supplier)}
              className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              Mở sổ công nợ chi tiết <ArrowRight size={11} />
            </button>
          </div>

          <div className="divide-y divide-border border border-border rounded-[4px] overflow-hidden bg-background">
            {debts.map((d) => (
              <div
                key={d._id}
                className="p-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-[4px] text-[11px]">
                    {d.debtNumber}
                  </span>
                  <span className="font-semibold text-foreground">{d.name}</span>
                  {d.referenceCode && (
                    <a
                      href="/purchase-orders"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-[11px] text-primary hover:underline bg-muted/60 px-1.5 py-0.5 rounded-[3px] border border-border"
                      title="Mở đơn mua hàng gốc"
                    >
                      Mã đơn: {d.referenceCode} <ExternalLink size={10} />
                    </a>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-muted-foreground text-[10px] block">Tổng đơn</span>
                    <span className="font-mono text-muted-foreground tabular-nums">
                      {(d.totalAmount || 0).toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-muted-foreground text-[10px] block">Còn nợ</span>
                    <span className="font-mono font-bold text-destructive tabular-nums">
                      {(d.remainingAmount || 0).toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => onViewDetail && onViewDetail(supplier)}
                    className="rounded-[4px] h-6 px-2 text-[10px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                  >
                    Thanh toán
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </td>
    </tr>
  );
}
