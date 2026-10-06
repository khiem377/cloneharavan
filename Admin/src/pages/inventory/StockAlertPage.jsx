import React, { useState } from 'react';
import {
  AlertTriangle, Package, SearchIcon as Search, ShoppingCart, RefreshCw, Edit2,
  Check, X, History, Boxes, Clock, CalendarX, TrendingDown, FileCheck, FileText,
} from '@/components/ui/Icons';
import { useStockAlerts } from '@/hooks/useInventory';
import { inventoryService } from '@/services/inventory.service';
import DataTablePagination from '@/components/ui/DataTablePagination';
import ProductStockHistoryModal from '@/components/inventory/ProductStockHistoryModal';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/providers/ToastProvider';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
    <div className="space-y-6 p-6 antialiased">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-[6px] text-xs font-semibold"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" /> Làm mới dữ liệu
          </Button>
        </div>
      </div>

      {/* 2 REAL-DATA STATUS WIDGETS */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Card 1: PO Inbound Status */}
        <Card className="rounded-[6px] border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3 px-5 pt-4">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-primary" /> Trạng Thái Đơn Nhập Kho (PO)
            </CardTitle>
            <span className="text-xs font-bold text-muted-foreground">
              Đơn chưa xong:{' '}
              <span className="text-primary font-mono text-sm font-extrabold tabular-nums">
                {poStats.totalActive}
              </span>
            </span>
          </CardHeader>

          <CardContent className="p-5 pt-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-[6px] border border-border bg-muted/30 p-3">
                <span className="text-xs text-muted-foreground block mb-1">Bản nháp</span>
                <span className="text-lg font-bold font-mono text-foreground tabular-nums">
                  {poStats.draft}
                </span>
              </div>
              <div className="rounded-[6px] border border-border bg-muted/30 p-3">
                <span className="text-xs text-muted-foreground block mb-1">Chờ nhận hàng</span>
                <span className="text-lg font-bold font-mono text-primary tabular-nums">
                  {poStats.pending}
                </span>
              </div>
              <div className="rounded-[6px] border border-border bg-muted/30 p-3">
                <span className="text-xs text-muted-foreground block mb-1">Nhập 1 phần</span>
                <span className="text-lg font-bold font-mono text-amber-600 tabular-nums">
                  {poStats.partial}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: EX Outbound Status */}
        <Card className="rounded-[6px] border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3 px-5 pt-4">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Lệnh Xuất Kho (EX)
            </CardTitle>
            <span className="text-xs font-bold text-muted-foreground">
              Lệnh đang xử lý:{' '}
              <span className="text-primary font-mono text-sm font-extrabold tabular-nums">
                {exStats.totalActive}
              </span>
            </span>
          </CardHeader>

          <CardContent className="p-5 pt-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-[6px] border border-border bg-muted/30 p-3">
                <span className="text-xs text-muted-foreground block mb-1">Chờ soạn hàng</span>
                <span className="text-lg font-bold font-mono text-amber-600 tabular-nums">
                  {exStats.pending_pick}
                </span>
              </div>
              <div className="rounded-[6px] border border-border bg-muted/30 p-3">
                <span className="text-xs text-muted-foreground block mb-1">Đang lấy hàng</span>
                <span className="text-lg font-bold font-mono text-primary tabular-nums">
                  {exStats.picking}
                </span>
              </div>
              <div className="rounded-[6px] border border-border bg-muted/30 p-3">
                <span className="text-xs text-muted-foreground block mb-1">Đã đóng gói</span>
                <span className="text-lg font-bold font-mono text-emerald-600 tabular-nums">
                  {exStats.packed}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4 MONITORING STAT CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          onClick={() => setViewMode('low_stock')}
          className={`rounded-[6px] border p-4 shadow-xs cursor-pointer transition-all active:scale-[0.98] ${
            viewMode === 'low_stock' ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border bg-card hover:bg-muted/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-amber-500/10 text-amber-600">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground">Tồn dưới mức tối thiểu</span>
              <p className="text-xl font-bold text-amber-600 font-mono tracking-tight mt-0.5 tabular-nums">
                {summary.lowStockCount + summary.outOfStockCount}{' '}
                <span className="text-xs font-normal text-muted-foreground font-sans">mặt hàng</span>
              </p>
            </div>
          </div>
        </Card>

        <Card
          onClick={() => setViewMode('all')}
          className={`rounded-[6px] border p-4 shadow-xs cursor-pointer transition-all active:scale-[0.98] ${
            viewMode === 'all' ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border bg-card hover:bg-muted/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-emerald-500/10 text-emerald-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground">Tồn kho an toàn</span>
              <p className="text-xl font-bold text-foreground font-mono tracking-tight mt-0.5 tabular-nums">
                {summary.safeStockCount}{' '}
                <span className="text-xs font-normal text-muted-foreground font-sans">mặt hàng</span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-[6px] border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-indigo-500/10 text-indigo-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground">Sắp hết hạn (30 ngày)</span>
              <p className="text-xl font-bold text-indigo-600 font-mono tracking-tight mt-0.5 tabular-nums">
                0 <span className="text-xs font-normal text-muted-foreground font-sans">mặt hàng</span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-[6px] border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-rose-500/10 text-rose-600">
              <CalendarX className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground">Quá hạn sử dụng</span>
              <p className="text-xl font-bold text-rose-600 font-mono tracking-tight mt-0.5 tabular-nums">
                0 <span className="text-xs font-normal text-muted-foreground font-sans">mặt hàng</span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="rounded-[6px] border border-border p-4 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm theo tên sản phẩm hoặc mã SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9 text-xs rounded-[6px]"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              onClick={handleCreateBulkPO}
              className="rounded-[6px] h-9 text-xs font-bold shadow-xs active:scale-[0.98]"
            >
              <ShoppingCart className="h-4 w-4 mr-1.5" /> Đặt hàng bù kho (Tạo PO)
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <Card className="rounded-[6px] border border-border shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/60 text-[11px] font-bold text-foreground">
              <TableHead className="whitespace-nowrap">Sản phẩm</TableHead>
              <TableHead className="whitespace-nowrap">Mã SKU</TableHead>
              <TableHead className="whitespace-nowrap">Thương hiệu</TableHead>
              <TableHead className="whitespace-nowrap">Nhà Cung Cấp</TableHead>
              <TableHead className="text-right whitespace-nowrap">Giá bán</TableHead>
              <TableHead className="text-right whitespace-nowrap">Giá nhập vốn</TableHead>
              <TableHead className="text-center whitespace-nowrap">Tồn kho</TableHead>
              <TableHead className="text-center whitespace-nowrap">Tồn tối thiểu</TableHead>
              <TableHead className="text-center whitespace-nowrap">Gợi ý nhập</TableHead>
              <TableHead className="text-right whitespace-nowrap">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="py-12 text-center text-muted-foreground">
                  Đang đối soát danh sách tồn kho toàn hệ thống...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="py-12 text-center text-muted-foreground">
                  Không tìm thấy sản phẩm kho phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              items.map((prod) => (
                <TableRow key={prod.id} className="hover:bg-muted/30 transition-colors align-middle group">
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {prod.thumbnail ? (
                        <img
                          src={prod.thumbnail}
                          alt=""
                          className="h-9 w-9 rounded-[4px] object-cover border border-border"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-muted text-muted-foreground font-mono text-[10px]">
                          SP
                        </div>
                      )}
                      <span className="font-semibold text-foreground max-w-xs truncate text-xs">
                        {prod.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono font-bold text-muted-foreground whitespace-nowrap text-xs">
                    {prod.productCode || '---'}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                    {prod.brandName}
                  </TableCell>
                  <TableCell className="font-semibold text-foreground whitespace-nowrap text-xs">
                    {prod.supplierName || '---'}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold whitespace-nowrap text-xs tabular-nums">
                    {(prod.price || 0).toLocaleString('vi-VN')} đ
                  </TableCell>

                  <TableCell className="text-right font-mono font-semibold whitespace-nowrap text-xs tabular-nums">
                    {editingCostId === prod.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <Input
                          type="number"
                          value={editingCostVal}
                          onChange={(e) => setEditingCostVal(e.target.value)}
                          className="w-24 h-7 text-xs text-right font-mono rounded-[4px]"
                        />
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleSaveCost(prod.id)}
                          className="text-emerald-600 hover:bg-emerald-50 h-7 w-7"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setEditingCostId(null)}
                          className="text-destructive hover:bg-destructive/10 h-7 w-7"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="flex items-center justify-end gap-1.5 group/edit cursor-pointer"
                        onClick={() => handleStartEditCost(prod)}
                      >
                        <span className="text-primary font-bold">
                          {(prod.costPrice || 0).toLocaleString('vi-VN')} đ
                        </span>
                        <Edit2 className="h-3 w-3 text-muted-foreground opacity-0 group-hover/edit:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="text-center whitespace-nowrap">
                    <Badge
                      variant={
                        prod.stock === 0
                          ? 'destructive'
                          : prod.stock <= threshold
                          ? 'outline'
                          : 'secondary'
                      }
                      className={`font-mono tabular-nums font-bold text-xs ${
                        prod.stock > 0 && prod.stock <= threshold
                          ? 'bg-amber-500/10 text-amber-600 border-amber-300'
                          : prod.stock > threshold
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
                          : ''
                      }`}
                    >
                      {prod.stock}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-semibold text-muted-foreground whitespace-nowrap font-mono tabular-nums text-xs">
                    {prod.minThreshold}
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap text-xs">
                    <span className="inline-flex items-center gap-1 font-semibold text-primary font-mono tabular-nums">
                      +{prod.suggestedReorderQty} cái
                    </span>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => {
                          setSelectedProductForHistory(prod);
                          setHistoryModalOpen(true);
                        }}
                        className="rounded-[6px] text-xs font-semibold h-7"
                      >
                        <History className="h-3.5 w-3.5 mr-1 text-primary" /> Lịch Sử
                      </Button>
                      <Button
                        size="xs"
                        onClick={() =>
                          navigate(
                            `/purchase-orders/create?supplierId=${prod.supplierId}&productId=${
                              prod.productId || prod.id
                            }`
                          )
                        }
                        className="rounded-[6px] text-xs font-semibold h-7"
                      >
                        <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Tạo PO
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

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
      </Card>

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
