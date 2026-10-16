import React from 'react';
import { Box, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LocationDetailModal({
  inspectModalOpen,
  setInspectModalOpen,
  inspectElement,
}) {
  if (!inspectModalOpen || !inspectElement) return null;

  const items = inspectElement.items || [];
  const totalStock = items.reduce((acc, i) => acc + (i.stock || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-[6px] border border-border bg-card p-5 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Box className="size-4 text-primary" />
              Thông tin hàng hóa tại vị trí
            </h3>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
              <span>
                Mã: <strong className="font-mono text-foreground">{inspectElement.code || inspectElement.id}</strong>
              </span>
              <span>
                Tên: <strong className="text-foreground">{inspectElement.name}</strong>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setInspectModalOpen(false)}
            className="rounded-[4px] p-1 text-muted-foreground hover:bg-muted cursor-pointer active:scale-[0.98]"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Table hàng hóa */}
        <div className="rounded-[6px] border border-border overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/50 font-bold text-muted-foreground border-b border-border">
              <tr>
                <th className="p-2.5 w-10 text-center">#</th>
                <th className="p-2.5">Mã hàng</th>
                <th className="p-2.5">Tên hàng</th>
                <th className="p-2.5 text-center">ĐVT</th>
                <th className="p-2.5 text-right">SL Tồn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-xs text-muted-foreground">
                    Chưa có hàng hóa nào được gán vào vị trí này
                  </td>
                </tr>
              ) : (
                items.map((it, idx) => (
                  <tr key={idx} className="hover:bg-muted/30">
                    <td className="p-2.5 text-center font-mono text-muted-foreground tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="p-2.5 font-mono font-semibold text-primary">{it.sku}</td>
                    <td className="p-2.5 font-medium text-foreground">{it.name}</td>
                    <td className="p-2.5 text-center">{it.unit}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-foreground tabular-nums text-emerald-600 dark:text-emerald-400">
                      {it.stock}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {items.length > 0 && (
              <tfoot className="bg-muted/30 border-t border-border font-bold">
                <tr>
                  <td colSpan={4} className="p-2.5 text-right">
                    Tổng tồn tại vị trí:
                  </td>
                  <td className="p-2.5 text-right font-mono text-primary tabular-nums">
                    {totalStock} cái
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInspectModalOpen(false)}
            className="h-8 rounded-[6px] text-xs font-semibold active:scale-[0.98]"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
