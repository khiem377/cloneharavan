import React, { useState, useEffect } from 'react';
import {
  Boxes,
  RefreshCw,
  SearchIcon as Search,
  ShoppingCart,
} from '@/components/ui/Icons';
import { useStockAlerts } from '@/hooks/useInventory';
import { inventoryService } from '@/services/inventory.service';
import { warehouseService } from '@/services/warehouse.service';
import ProductStockHistoryModal from '@/components/inventory/ProductStockHistoryModal';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/providers/ToastProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import StockAlertWidgets from './components/StockAlertWidgets';
import StockAlertTable from './components/StockAlertTable';

export default function StockAlertPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [threshold] = useState(5);
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'low_stock'
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('ALL');

  // History Modal
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedProductForHistory, setSelectedProductForHistory] = useState(null);

  // Inline edit costPrice
  const [editingCostId, setEditingCostId] = useState(null);
  const [editingCostVal, setEditingCostVal] = useState('');

  useEffect(() => {
    warehouseService
      .getWarehouses()
      .then((res) => {
        setWarehouses(res.data?.data?.data || []);
      })
      .catch(console.warn);
  }, []);

  const { data: alertsData, isLoading, refetch } = useStockAlerts({
    threshold,
    search,
    viewMode,
    page,
    limit: pageSize,
    warehouseId: selectedWarehouseId === 'ALL' ? '' : selectedWarehouseId,
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
    } catch (_) {
      toast.error('Không thể cập nhật giá nhập vốn');
    }
  };

  const handleCreateBulkPO = () => {
    navigate('/purchase-orders/create');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 antialiased bg-background text-foreground">
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
              Giám sát tồn kho thực tế, tiến trình đơn kho và cảnh báo định mức
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-[6px] text-xs font-semibold h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới dữ liệu
          </Button>
        </div>
      </div>

      {/* Widgets & Metric Cards */}
      <StockAlertWidgets
        poStats={poStats}
        exStats={exStats}
        summary={summary}
        viewMode={viewMode}
        onViewModeChange={(mode) => {
          setViewMode(mode);
          setPage(1);
        }}
      />

      {/* Filter Toolbar */}
      <Card className="rounded-[6px] border border-border p-3 shadow-none bg-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground z-10" />
              <Input
                type="text"
                placeholder="Tìm theo tên sản phẩm hoặc mã SKU..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-8 h-8 text-xs rounded-[6px]"
              />
            </div>

            {/* Warehouse Filter */}
            <Select
              value={selectedWarehouseId}
              onValueChange={(val) => {
                setSelectedWarehouseId(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 min-w-[220px] rounded-[6px] text-xs">
                <SelectValue placeholder="Chọn kho hàng" />
              </SelectTrigger>
              <SelectContent className="rounded-[6px]">
                <SelectItem value="ALL">🏢 Tất cả kho hàng (Toàn hệ thống)</SelectItem>
                {warehouses.map((wh) => (
                  <SelectItem key={wh._id} value={wh._id}>
                    📦 {wh.name} {wh.isDefault ? '(Mặc định)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleCreateBulkPO}
              className="rounded-[6px] h-8 text-xs font-bold active:scale-[0.98]"
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-1.5" /> Đặt hàng bù kho (Tạo PO)
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <StockAlertTable
        items={items}
        isLoading={isLoading}
        threshold={threshold}
        selectedWarehouseId={selectedWarehouseId === 'ALL' ? '' : selectedWarehouseId}
        warehouses={warehouses}
        editingCostId={editingCostId}
        editingCostVal={editingCostVal}
        setEditingCostVal={setEditingCostVal}
        onStartEditCost={handleStartEditCost}
        onSaveCost={handleSaveCost}
        onCancelEditCost={() => setEditingCostId(null)}
        onViewHistory={(prod) => {
          setSelectedProductForHistory(prod);
          setHistoryModalOpen(true);
        }}
        onCreatePO={(prod) => {
          navigate(
            `/purchase-orders/create?supplierId=${prod.supplierId}&productId=${
              prod.productId || prod.id
            }`
          );
        }}
        pagination={pagination}
        page={page}
        pageSize={pageSize}
        setPage={setPage}
        setPageSize={setPageSize}
      />

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
