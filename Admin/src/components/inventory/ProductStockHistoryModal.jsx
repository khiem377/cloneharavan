import React from 'react';
import {
  X, History, ArrowDownLeft, ArrowUpRight, RotateCcw, Scale,
  Calendar, UsersIcon as User, FileText, RefreshCw, Package,
} from '@/components/ui/Icons';
import { useStockMovements } from '@/hooks/useInventory';

export default function ProductStockHistoryModal({ isOpen, onClose, product }) {
  if (!isOpen || !product) return null;

  const productId = product.productId || product.id || product._id;

  const { data: movementsData, isLoading, refetch } = useStockMovements({
    productId,
    limit: 100,
  });

  const rawMovements = movementsData?.data || movementsData?.items || [];

  // Calculate totals and net stock change
  let totalImport = 0;
  let totalExport = 0;
  let totalReturn = 0;
  let netChange = 0;

  rawMovements.forEach((m) => {
    const qty = m.changeQty || 0;
    netChange += qty;
    if (m.type === 'IMPORT') totalImport += Math.abs(qty);
    if (m.type === 'EXPORT') totalExport += Math.abs(qty);
    if (m.type === 'RETURN') totalReturn += Math.abs(qty);
  });

  // Calculate initial stock before any logged movements
  const currentStock = product.stock || 0;
  const initialStock = Math.max(0, currentStock - netChange);

  // Sort chronological (oldest first) so STT 1 is the first transaction and STT 5 ends at current stock
  const chronologicalMovements = [...rawMovements].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  let runningStock = initialStock;
  const movements = chronologicalMovements.map((m) => {
    const before = runningStock;
    const after = Math.max(0, runningStock + (m.changeQty || 0));
    runningStock = after;

    return {
      ...m,
      calcBeforeStock: before,
      calcAfterStock: after,
    };
  });

  const getTypeBadge = (type) => {
    switch (type) {
      case 'IMPORT':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ArrowDownLeft className="h-3 w-3" /> Nhập Kho (PO)
          </span>
        );
      case 'EXPORT':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <ArrowUpRight className="h-3 w-3" /> Xuất Bán (EX)
          </span>
        );
      case 'RETURN':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-bold text-destructive border border-destructive/20">
            <RotateCcw className="h-3 w-3" /> Trả NCC (PR)
          </span>
        );
      case 'ADJUSTMENT':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-bold text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Scale className="h-3 w-3" /> Kiểm Kê (AUD)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Lịch Sử Nhập / Xuất / Trả: {product.name}
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                SKU: {product.productCode || product.sku || '---'} | Nhà cung cấp: {product.supplierName || 'Mặc định'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 4 Metrics Summary */}
        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 bg-muted/20 border-b border-border text-xs">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
            <span className="text-muted-foreground font-semibold">Tổng Nhập PO</span>
            <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
              +{totalImport} <span className="text-xs font-normal text-muted-foreground">cái</span>
            </div>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
            <span className="text-muted-foreground font-semibold">Tổng Xuất Bán</span>
            <div className="text-base font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
              -{totalExport} <span className="text-xs font-normal text-muted-foreground">cái</span>
            </div>
          </div>
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3">
            <span className="text-muted-foreground font-semibold">Tổng Trả NCC</span>
            <div className="text-base font-extrabold text-destructive mt-0.5">
              -{totalReturn} <span className="text-xs font-normal text-muted-foreground">cái</span>
            </div>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
            <span className="text-muted-foreground font-semibold">Tồn Thực Tế</span>
            <div className="text-base font-extrabold text-primary mt-0.5">
              {product.stock || 0} <span className="text-xs font-normal text-muted-foreground">cái</span>
            </div>
          </div>
        </div>

        {/* Log Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Nhật Ký Biến Động Kho Chi Tiết ({movements.length} giao dịch)
            </h3>
            <button
              onClick={() => refetch()}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" /> Làm mới
            </button>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/50 font-semibold text-muted-foreground border-b border-border">
                <tr>
                  <th className="p-3 text-center w-10">STT</th>
                  <th className="p-3 whitespace-nowrap">Thời Gian</th>
                  <th className="p-3 whitespace-nowrap">Loại Biến Động</th>
                  <th className="p-3 whitespace-nowrap font-mono">Mã Chứng Từ</th>
                  <th className="p-3 whitespace-nowrap">Biến Thể / Mặt Hàng</th>
                  <th className="p-3 text-center whitespace-nowrap">Thay Đổi (SL)</th>
                  <th className="p-3 text-center whitespace-nowrap">Tồn Kho (Trước ➔ Sau)</th>
                  <th className="p-3 min-w-[180px]">Lý Do / Ghi Chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                        <span>Đang tải nhật ký lịch sử...</span>
                      </div>
                    </td>
                  </tr>
                ) : movements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      Chưa có nhật ký biến động kho cho sản phẩm này.
                    </td>
                  </tr>
                ) : (
                  movements.map((m, idx) => (
                    <tr key={m._id} className="hover:bg-muted/30 transition-colors align-middle">
                      <td className="p-3 text-center font-mono font-semibold text-muted-foreground">
                        {idx + 1}
                      </td>
                      <td className="p-3 whitespace-nowrap text-muted-foreground">
                        {new Date(m.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="p-3 whitespace-nowrap">{getTypeBadge(m.type)}</td>
                      <td className="p-3 font-mono font-bold text-primary whitespace-nowrap">
                        {m.referenceNumber || '---'}
                      </td>
                      <td className="p-3 font-semibold text-foreground whitespace-nowrap max-w-[200px] truncate" title={m.productName}>
                        {m.variantId?.displayName ? `${m.productName} (${m.variantId.displayName})` : m.productName}
                      </td>
                      <td className="p-3 text-center font-mono font-extrabold whitespace-nowrap">
                        <span
                          className={
                            m.changeQty > 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-destructive'
                          }
                        >
                          {m.changeQty > 0 ? `+${m.changeQty}` : m.changeQty} cái
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono whitespace-nowrap text-muted-foreground">
                        {m.calcBeforeStock} ➔ <span className="font-bold text-foreground">{m.calcAfterStock}</span>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {m.reason || 'Không có ghi chú'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end border-t border-border bg-muted/30 p-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-input bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
