import React, { useState } from 'react';
import {
  AlertTriangle, Package, SearchIcon as Search, ShoppingCart, RefreshCw, Edit2,
  Check, X, History, Boxes, PieChart as PieChartIcon, Clock, CalendarX,
  TrendingDown, TrendingUp, FileCheck, FileText,
} from '@/components/ui/Icons';
import { useStockAlerts } from '@/hooks/useInventory';
import { inventoryService } from '@/services/inventory.service';
import DataTablePagination from '@/components/ui/DataTablePagination';
import ProductStockHistoryModal from '@/components/inventory/ProductStockHistoryModal';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/providers/ToastProvider';

export default function StockAlertPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [threshold, setThreshold] = useState(5);
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'low_stock'
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // History Modal
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedProductForHistory, setSelectedProductForHistory] = useState(null);

  // Inline edit costPrice
  const [editingCostId, setEditingCostId] = useState(null);
  const [editingCostVal, setEditingCostVal] = useState('');

  const { data: alertsData, isLoading, refetch } = useStockAlerts({
    threshold,
    search,
    viewMode,
    page,
    limit: pageSize,
  });

  const items = alertsData?.data || alertsData?.items || [];
  const summary = alertsData?.summary || {
    totalProducts: 0,
    totalVariants: 0,
    outOfStockCount: 0,
    lowStockCount: 0,
    safeStockCount: 0,
    poStats: { totalActive: 0, draft: 0, pending: 0, partial: 0, completed: 0 },
    exStats: { totalActive: 0, pending_pick: 0, picking: 0, packed: 0, completed: 0 },
  };
  const pagination = alertsData?.pagination;

  const poStats = summary.poStats || { totalActive: 0, draft: 0, pending: 0, partial: 0, completed: 0 };
  const exStats = summary.exStats || { totalActive: 0, pending_pick: 0, picking: 0, packed: 0, completed: 0 };

  const handleStartEditCost = (item) => {
    setEditingCostId(item.id);
    setEditingCostVal(String(item.costPrice || 0));
  };

  const handleSaveCost = async (productId) => {
    try {
      await inventoryService.updateCostPrice(productId, Number(editingCostVal || 0));
      toast.success('Cập nhật giá nhập vốn thành công');
      setEditingCostId(null);
      refetch();
    } catch (err) {
      toast.error('Không thể cập nhật giá nhập vốn');
    }
  };

  const handleCreateBulkPO = () => {
    navigate('/purchase-orders/create');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Bàn Làm Việc & Bảng Tổng Quan Quản Lý Kho
            </h1>
            <p className="text-xs text-muted-foreground">
              Giám sát tồn kho thực tế, tiến trình đơn kho và cảnh báo định mức theo tiêu chuẩn MISA AMIS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
          >
            <RefreshCw className="h-4 w-4" /> Làm mới dữ liệu
          </button>
        </div>
      </div>

      {/* 2 REAL-DATA STATUS WIDGETS (Clean MISA AMIS Style) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Card 1: PO Inbound Status */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-primary" /> Trạng Thái Đơn Nhập Kho (PO)
            </h3>
            <span className="text-xs font-bold text-muted-foreground">
              Đơn chưa xong: <span className="text-primary font-mono text-sm font-extrabold">{poStats.totalActive}</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center pt-1">
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <span className="text-xs text-muted-foreground block mb-1">Bản nháp</span>
              <span className="text-lg font-bold font-mono text-foreground">{poStats.draft}</span>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <span className="text-xs text-muted-foreground block mb-1">Chờ nhận hàng</span>
              <span className="text-lg font-bold font-mono text-primary">{poStats.pending}</span>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <span className="text-xs text-muted-foreground block mb-1">Nhập 1 phần</span>
              <span className="text-lg font-bold font-mono text-amber-600">{poStats.partial}</span>
            </div>
          </div>
        </div>

        {/* Card 2: EX Outbound Status */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Lệnh Xuất Kho (EX)
            </h3>
            <span className="text-xs font-bold text-muted-foreground">
              Lệnh đang xử lý: <span className="text-primary font-mono text-sm font-extrabold">{exStats.totalActive}</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center pt-1">
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <span className="text-xs text-muted-foreground block mb-1">Chờ soạn hàng</span>
              <span className="text-lg font-bold font-mono text-amber-600">{exStats.pending_pick}</span>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <span className="text-xs text-muted-foreground block mb-1">Đang lấy hàng</span>
              <span className="text-lg font-bold font-mono text-primary">{exStats.picking}</span>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <span className="text-xs text-muted-foreground block mb-1">Đã đóng gói</span>
              <span className="text-lg font-bold font-mono text-emerald-600">{exStats.packed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 MONITORING STAT CARDS (Clean MISA AMIS Enterprise Style) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          onClick={() => setViewMode('low_stock')}
          className={`rounded-2xl border p-4 shadow-xs cursor-pointer transition-all ${
            viewMode === 'low_stock' ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border bg-card hover:bg-muted/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground">Tồn dưới mức tối thiểu</span>
              <p className="text-xl font-extrabold text-amber-600 font-mono tracking-tight mt-0.5">
                {summary.lowStockCount + summary.outOfStockCount} <span className="text-xs font-normal text-muted-foreground">mặt hàng</span>
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setViewMode('all')}
          className={`rounded-2xl border p-4 shadow-xs cursor-pointer transition-all ${
            viewMode === 'all' ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border bg-card hover:bg-muted/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground">Tồn kho an toàn</span>
              <p className="text-xl font-extrabold text-foreground font-mono tracking-tight mt-0.5">
                {summary.safeStockCount} <span className="text-xs font-normal text-muted-foreground">mặt hàng</span>
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground">Sắp hết hạn (30 ngày)</span>
              <p className="text-xl font-extrabold text-indigo-600 font-mono tracking-tight mt-0.5">0 <span className="text-xs font-normal text-muted-foreground">mặt hàng</span></p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600">
              <CalendarX className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground">Quá hạn sử dụng</span>
              <p className="text-xl font-extrabold text-rose-600 font-mono tracking-tight mt-0.5">0 <span className="text-xs font-normal text-muted-foreground">mặt hàng</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm hoặc mã SKU..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleCreateBulkPO}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
          >
            <ShoppingCart className="h-4 w-4" /> Đặt hàng bù kho (Tạo PO)
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/60 font-bold text-foreground text-[11px]">
                <th className="px-4 py-3.5 whitespace-nowrap">Sản phẩm</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Mã SKU</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Thương hiệu</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Nhà Cung Cấp</th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap">Giá bán</th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap">Giá nhập vốn</th>
                <th className="px-4 py-3.5 text-center whitespace-nowrap">Tồn kho</th>
                <th className="px-4 py-3.5 text-center whitespace-nowrap">Tồn tối thiểu</th>
                <th className="px-4 py-3.5 text-center whitespace-nowrap">Gợi ý nhập</th>
                <th className="sticky right-0 z-10 bg-muted/95 backdrop-blur-xs px-4 py-3.5 text-right whitespace-nowrap shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.08)]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
                    Đang đối soát danh sách tồn kho toàn hệ thống...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
                    Không tìm thấy sản phẩm kho phù hợp.
                  </td>
                </tr>
              ) : (
                items.map((prod) => (
                  <tr key={prod.id} className="hover:bg-muted/30 transition-colors align-middle group">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {prod.thumbnail ? (
                          <img
                            src={prod.thumbnail}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover border border-border"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground font-mono text-[10px]">
                            SP
                          </div>
                        )}
                        <span className="font-semibold text-foreground max-w-xs truncate">
                          {prod.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-muted-foreground whitespace-nowrap">
                      {prod.productCode || '---'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {prod.brandName}
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                      {prod.supplierName || '---'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold whitespace-nowrap">
                      {(prod.price || 0).toLocaleString('vi-VN')} đ
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-semibold whitespace-nowrap">
                      {editingCostId === prod.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            value={editingCostVal}
                            onChange={(e) => setEditingCostVal(e.target.value)}
                            className="w-24 rounded border border-input bg-background px-1.5 py-0.5 text-xs text-right"
                          />
                          <button
                            onClick={() => handleSaveCost(prod.id)}
                            className="text-emerald-600 hover:opacity-80 p-0.5"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingCostId(null)}
                            className="text-destructive hover:opacity-80 p-0.5"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5 group/edit cursor-pointer" onClick={() => handleStartEditCost(prod)}>
                          <span className="text-primary font-bold">
                            {(prod.costPrice || 0).toLocaleString('vi-VN')} đ
                          </span>
                          <Edit2 className="h-3 w-3 text-muted-foreground opacity-0 group-hover/edit:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center justify-center min-w-[36px] rounded-full px-2.5 py-0.5 font-bold ${
                          prod.stock === 0
                            ? 'bg-destructive/10 text-destructive'
                            : prod.stock <= threshold
                            ? 'bg-amber-500/10 text-amber-600'
                            : 'bg-emerald-500/10 text-emerald-600'
                        }`}
                      >
                        {prod.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-muted-foreground whitespace-nowrap">
                      {prod.minThreshold}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-semibold text-primary">
                        +{prod.suggestedReorderQty} cái
                      </span>
                    </td>
                    <td className="sticky right-0 z-10 bg-card group-hover:bg-muted/90 transition-colors px-4 py-3 text-right whitespace-nowrap shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.12)]">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedProductForHistory(prod);
                            setHistoryModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-xs whitespace-nowrap"
                        >
                          <History className="h-3.5 w-3.5 text-primary" /> Xem Lịch Sử
                        </button>
                        <button
                          onClick={() => navigate(`/purchase-orders/create?supplierId=${prod.supplierId}&productId=${prod.productId || prod.id}`)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs whitespace-nowrap"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" /> Tạo PO
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <DataTablePagination
            page={page}
            pageSize={pageSize}
            total={pagination.total}
            totalPages={pagination.totalPages}
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newPageSize) => {
              setPageSize(newPageSize);
              setPage(1);
            }}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        )}
      </div>

      <ProductStockHistoryModal
        isOpen={historyModalOpen}
        onClose={() => {
          setHistoryModalOpen(false);
          setSelectedProductForHistory(null);
        }}
        product={selectedProductForHistory}
      />
    </div>
  );
}
