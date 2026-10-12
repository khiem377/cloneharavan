import { useState, useEffect } from 'react';
import {
  ArrowRightLeft,
  Plus,
  Search,
  CheckCircle2,
  Truck,
  Clock,
  XCircle,
  Loader2,
  Trash2,
  X,
} from 'lucide-react';
import { warehouseService } from '@/services/warehouse.service';
import { toast } from '@/providers/ToastProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function StockTransferListPage() {
  const [transfers, setTransfers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal tạo phiếu chuyển
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [sourceWarehouseStock, setSourceWarehouseStock] = useState([]);
  const [loadingSourceStock, setLoadingSourceStock] = useState(false);

  const [form, setForm] = useState({
    fromWarehouseId: '',
    toWarehouseId: '',
    note: '',
    items: [],
  });

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const res = await warehouseService.getStockTransfers({
        keyword,
        status: statusFilter,
      });
      setTransfers(res.data?.data?.data || []);
    } catch (err) {
      toast.error('Lỗi tải danh sách chuyển kho');
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehousesList = async () => {
    try {
      const res = await warehouseService.getWarehouses();
      const list = res.data?.data?.data || [];
      setWarehouses(list);
    } catch (err) {
      console.warn('Lỗi tải kho:', err);
    }
  };

  useEffect(() => {
    fetchTransfers();
    fetchWarehousesList();
  }, [statusFilter]);

  // Khi chọn kho xuất trong modal, tải danh sách sản phẩm tồn của kho đó
  const handleSourceWarehouseChange = async (fromId) => {
    setForm((p) => ({ ...p, fromWarehouseId: fromId, items: [] }));
    if (!fromId) {
      setSourceWarehouseStock([]);
      return;
    }

    setLoadingSourceStock(true);
    try {
      const res = await warehouseService.getWarehouseInventory(fromId, { limit: 100 });
      setSourceWarehouseStock(res.data?.data?.data || []);
    } catch (err) {
      console.warn('Lỗi tải hàng tồn kho nguồn:', err);
    } finally {
      setLoadingSourceStock(false);
    }
  };

  // Thêm sản phẩm vào danh sách chuyển
  const handleAddItem = (stockItem) => {
    const existing = form.items.find((i) => i.variantId === stockItem.variantId?._id);
    if (existing) return toast.info('Sản phẩm này đã có trong danh sách');

    const available = Math.max(0, (stockItem.stock || 0) - (stockItem.allocated || 0));
    if (available <= 0) return toast.error('Sản phẩm đã hết hàng khả dụng tại kho này');

    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: stockItem.productId?._id,
          variantId: stockItem.variantId?._id,
          sku: stockItem.variantId?.sku || '',
          productName: stockItem.productId?.name || 'Sản phẩm',
          availableQty: available,
          quantity: 1,
          unit: 'Cái',
        },
      ],
    }));
  };

  const handleUpdateItemQty = (variantId, qty) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.variantId === variantId ? { ...i, quantity: Math.min(i.availableQty, Math.max(1, Number(qty))) } : i
      ),
    }));
  };

  const handleRemoveItem = (variantId) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.variantId !== variantId),
    }));
  };

  // Submit tạo phiếu chuyển kho
  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    if (!form.fromWarehouseId) return toast.error('Vui lòng chọn kho xuất chuyển');
    if (!form.toWarehouseId) return toast.error('Vui lòng chọn kho nhận chuyển');
    if (form.fromWarehouseId === form.toWarehouseId) {
      return toast.error('Kho xuất và kho nhận không thể giống nhau');
    }
    if (form.items.length === 0) return toast.error('Vui lòng chọn ít nhất 1 sản phẩm để chuyển');

    setModalLoading(true);
    try {
      await warehouseService.createStockTransfer(form);
      toast.success('Tạo phiếu chuyển kho thành công');
      setIsModalOpen(false);
      setForm({ fromWarehouseId: '', toWarehouseId: '', note: '', items: [] });
      fetchTransfers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Tạo phiếu chuyển kho thất bại');
    } finally {
      setModalLoading(false);
    }
  };

  // Chuyển trạng thái
  const handleUpdateStatus = async (id, status, label) => {
    if (!window.confirm(`Xác nhận ${label}?`)) return;
    try {
      await warehouseService.updateTransferStatus(id, status);
      toast.success(`Đã cập nhật trạng thái: ${label}`);
      fetchTransfers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending_ship':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-semibold">
            <Clock size={12} /> Chờ xuất chuyển
          </span>
        );
      case 'in_transit':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-semibold">
            <Truck size={12} /> Đang vận chuyển
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
            <CheckCircle2 size={12} /> Đã nhập kho đích
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-muted text-muted-foreground text-[11px] font-semibold">
            <XCircle size={12} /> Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 p-4 md:p-6 bg-background min-h-[calc(100vh-56px)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ArrowRightLeft className="size-5 text-primary" />
            Chuyển kho nội bộ
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý quy trình luân chuyển hàng hóa giữa các chi nhánh kho
          </p>
        </div>

        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={() => {
            setIsModalOpen(true);
            if (warehouses.length >= 2) {
              handleSourceWarehouseChange(warehouses[0]._id);
              setForm((p) => ({ ...p, toWarehouseId: warehouses[1]._id }));
            }
          }}
        >
          <Plus size={14} />
          <span>Tạo phiếu chuyển kho</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo mã phiếu chuyển TRF-..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchTransfers()}
            className="w-full h-8 pl-8 pr-3 text-xs bg-background rounded-[6px] border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8 px-2.5 text-xs bg-background rounded-[6px] border border-border focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer w-full sm:w-auto"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending_ship">Chờ xuất chuyển</option>
          <option value="in_transit">Đang vận chuyển</option>
          <option value="completed">Đã nhập kho đích</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-[6px] border border-border bg-card overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted/30 border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="py-2.5 px-3 text-left">Mã phiếu</th>
              <th className="py-2.5 px-3 text-left">Kho xuất hàng</th>
              <th className="py-2.5 px-3 text-left">Kho nhận hàng</th>
              <th className="py-2.5 px-3 text-center">Tổng SL</th>
              <th className="py-2.5 px-3 text-left">Trạng thái</th>
              <th className="py-2.5 px-3 text-left">Ngày tạo</th>
              <th className="py-2.5 px-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin text-primary" />
                    <span>Đang tải danh sách...</span>
                  </div>
                </td>
              </tr>
            ) : transfers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  Không có phiếu chuyển kho nào
                </td>
              </tr>
            ) : (
              transfers.map((trf) => (
                <tr key={trf._id} className="hover:bg-muted/20">
                  <td className="py-2.5 px-3 font-mono font-semibold text-foreground">
                    {trf.transferNumber}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-foreground">
                    {trf.fromWarehouseId?.name || 'N/A'}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-foreground">
                    {trf.toWarehouseId?.name || 'N/A'}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold tabular-nums text-foreground">
                    {Number(trf.totalQuantity || 0).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3">{getStatusBadge(trf.status)}</td>
                  <td className="py-2.5 px-3 text-muted-foreground font-mono tabular-nums">
                    {new Date(trf.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-2.5 px-3 text-right space-x-1.5">
                    {trf.status === 'pending_ship' && (
                      <Button
                        type="button"
                        variant="default"
                        size="xs"
                        onClick={() =>
                          handleUpdateStatus(trf._id, 'in_transit', 'Xác nhận xuất kho & gửi hàng')
                        }
                      >
                        Xuất hàng
                      </Button>
                    )}

                    {trf.status === 'in_transit' && (
                      <Button
                        type="button"
                        variant="default"
                        size="xs"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() =>
                          handleUpdateStatus(trf._id, 'completed', 'Xác nhận đã nhận đủ hàng vào kho đích')
                        }
                      >
                        Nhận hàng
                      </Button>
                    )}

                    {(trf.status === 'pending_ship' || trf.status === 'in_transit') && (
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => handleUpdateStatus(trf._id, 'cancelled', 'Hủy phiếu chuyển kho')}
                      >
                        Hủy
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tạo Phiếu Chuyển Kho */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl bg-card border border-border rounded-[6px] shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <ArrowRightLeft className="size-4 text-primary" />
                Lập phiếu chuyển kho nội bộ
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="size-7 rounded-[4px] hover:bg-muted flex items-center justify-center text-muted-foreground cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="p-4 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Kho xuất chuyển <span className="text-destructive">*</span>
                  </Label>
                  <select
                    required
                    value={form.fromWarehouseId}
                    onChange={(e) => handleSourceWarehouseChange(e.target.value)}
                    className="w-full h-8 px-2 text-xs bg-background rounded-[6px] border border-border"
                  >
                    <option value="">Chọn kho xuất</option>
                    {warehouses.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.name} {w.isDefault ? '(Mặc định)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Kho nhận chuyển <span className="text-destructive">*</span>
                  </Label>
                  <select
                    required
                    value={form.toWarehouseId}
                    onChange={(e) => setForm({ ...form, toWarehouseId: e.target.value })}
                    className="w-full h-8 px-2 text-xs bg-background rounded-[6px] border border-border"
                  >
                    <option value="">Chọn kho nhận</option>
                    {warehouses
                      .filter((w) => w._id !== form.fromWarehouseId)
                      .map((w) => (
                        <option key={w._id} value={w._id}>
                          {w.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Chọn sản phẩm từ kho nguồn */}
              {form.fromWarehouseId && (
                <div className="pt-2 border-t border-border">
                  <span className="block text-xs font-semibold text-foreground mb-2">
                    Chọn sản phẩm cần chuyển từ kho nguồn:
                  </span>

                  {loadingSourceStock ? (
                    <div className="p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                      <Loader2 size={13} className="animate-spin text-primary" />
                      <span>Đang kiểm tra tồn kho nguồn...</span>
                    </div>
                  ) : sourceWarehouseStock.length === 0 ? (
                    <div className="p-3 text-center text-xs text-muted-foreground border border-dashed border-border rounded-[6px]">
                      Kho nguồn hiện không còn mặt hàng nào có tồn khả dụng
                    </div>
                  ) : (
                    <div className="max-h-40 overflow-y-auto border border-border rounded-[6px] divide-y divide-border">
                      {sourceWarehouseStock.map((s) => {
                        const avail = Math.max(0, (s.stock || 0) - (s.allocated || 0));
                        if (avail <= 0) return null;
                        const isAdded = form.items.some((i) => i.variantId === s.variantId?._id);
                        return (
                          <div
                            key={s._id}
                            className="p-2 flex items-center justify-between text-xs hover:bg-muted/30"
                          >
                            <div>
                              <div className="font-semibold text-foreground">
                                {s.productId?.name}
                              </div>
                              <div className="text-[11px] text-muted-foreground font-mono">
                                SKU: {s.variantId?.sku} • Khả dụng: {avail}
                              </div>
                            </div>
                            <Button
                              type="button"
                              size="xs"
                              variant={isAdded ? 'secondary' : 'default'}
                              disabled={isAdded}
                              onClick={() => handleAddItem(s)}
                            >
                              {isAdded ? 'Đã thêm' : '+ Chọn'}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Danh sách đã chọn */}
              {form.items.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <span className="text-xs font-semibold text-foreground">
                    Danh sách sản phẩm xuất chuyển ({form.items.length}):
                  </span>
                  <div className="border border-border rounded-[6px] divide-y divide-border">
                    {form.items.map((item) => (
                      <div
                        key={item.variantId}
                        className="p-2.5 flex items-center justify-between text-xs"
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="font-semibold text-foreground truncate">
                            {item.productName}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            SKU: {item.sku}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-muted-foreground">SL:</span>
                            <input
                              type="number"
                              min={1}
                              max={item.availableQty}
                              value={item.quantity}
                              onChange={(e) => handleUpdateItemQty(item.variantId, e.target.value)}
                              className="w-16 h-7 px-2 text-center rounded-[4px] border border-border bg-background font-mono font-semibold"
                            />
                            <span className="text-[11px] text-muted-foreground">
                              / {item.availableQty}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.variantId)}
                            className="size-7 rounded-[4px] text-destructive hover:bg-destructive/10 flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Ghi chú điều chuyển
                </Label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú lý do chuyển kho..."
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="w-full p-2 text-xs bg-background rounded-[6px] border border-border"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={modalLoading}
                >
                  {modalLoading && <Loader2 size={13} className="animate-spin" />}
                  <span>Tạo lệnh chuyển kho</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
