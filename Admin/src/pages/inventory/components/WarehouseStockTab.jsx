import { Package, Search, X, RefreshCw, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DataTablePagination from '@/components/ui/DataTablePagination';
import { cn } from '@/lib/utils';

export default function WarehouseStockTab({
  stockTotal,
  stockSummary,
  selectedWarehouseId,
  warehouses,
  stockKeyword,
  setStockKeyword,
  setStockPage,
  fetchWarehouseStock,
  loadingStock,
  warehouseStock,
  form,
  stockPage,
  stockPageSize,
  setStockPageSize,
}) {
  const currentWh = warehouses.find((w) => w._id === selectedWarehouseId);
  const totalStockNum = stockSummary?.totalStock ?? currentWh?.totalStock ?? 0;
  const totalAllocatedNum = stockSummary?.totalAllocated ?? currentWh?.totalAllocated ?? 0;
  const totalSKUsNum = stockTotal || currentWh?.totalSKUs || 0;

  return (
    <div className="p-5 space-y-4">
      {/* Summary 3 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-[6px] border border-border bg-background shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground">Tổng mặt hàng trong kho</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono tabular-nums text-foreground">
              {totalSKUsNum}
            </span>
            <span className="text-xs text-muted-foreground">mặt hàng (SKU)</span>
          </div>
        </div>

        <div className="p-3.5 rounded-[6px] border border-border bg-background shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground">Tổng tồn kho thực tế</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {Number(totalStockNum).toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">cái / sản phẩm</span>
          </div>
        </div>

        <div className="p-3.5 rounded-[6px] border border-border bg-background shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground">Tồn khả dụng xuất bán</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono tabular-nums text-primary">
              {Number(Math.max(0, totalStockNum - totalAllocatedNum)).toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">cái (đã trừ giữ chỗ)</span>
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
          <Input
            type="text"
            placeholder="Tìm theo tên sản phẩm, mã SKU hoặc vị trí trong kho này..."
            value={stockKeyword}
            onChange={(e) => {
              setStockKeyword(e.target.value);
              setStockPage(1);
            }}
            className="h-8 pl-8 text-xs rounded-[6px]"
          />
          {stockKeyword && (
            <button
              type="button"
              onClick={() => {
                setStockKeyword('');
                setStockPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fetchWarehouseStock(selectedWarehouseId, stockPage, stockPageSize, stockKeyword)}
          disabled={loadingStock}
          className="h-8 text-xs rounded-[6px] shrink-0"
        >
          <RefreshCw size={13} className={cn('mr-1.5', loadingStock && 'animate-spin')} />
          Làm mới tồn kho
        </Button>
      </div>

      {/* Table */}
      {loadingStock ? (
        <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
          <Loader2 className="size-5 animate-spin text-primary" />
          <span>Đang tải danh sách tồn kho {form.name}...</span>
        </div>
      ) : warehouseStock.length === 0 ? (
        <div className="p-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-[6px] bg-muted/10">
          {stockKeyword
            ? `Không tìm thấy mặt hàng nào khớp với từ khoá "${stockKeyword}" trong kho này.`
            : 'Kho này hiện chưa có mặt hàng nào có dữ liệu tồn kho.'}
        </div>
      ) : (
        <div className="rounded-[6px] border border-border overflow-hidden bg-background">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-b border-border text-foreground font-bold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 text-left">Sản phẩm & Biến thể</th>
                  <th className="py-2.5 px-3 text-left">Mã SKU</th>
                  <th className="py-2.5 px-3 text-left">Vị trí ô/kệ</th>
                  <th className="py-2.5 px-3 text-right">Tồn thực tế</th>
                  <th className="py-2.5 px-3 text-right">Đang giữ chỗ</th>
                  <th className="py-2.5 px-3 text-right">Khả dụng</th>
                  <th className="py-2.5 px-3 text-right">Giá bán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {warehouseStock.map((item) => {
                  const available = Math.max(0, (item.stock || 0) - (item.allocated || 0));
                  const thumb = item.productId?.thumbnail?.url || item.productId?.thumbnail;
                  return (
                    <tr key={item._id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt=""
                              className="size-8 rounded-[4px] object-cover border border-border shrink-0"
                            />
                          ) : (
                            <div className="size-8 rounded-[4px] bg-muted border border-border flex items-center justify-center shrink-0">
                              <Package size={14} className="text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-foreground line-clamp-1">
                              {item.productId?.name || 'Sản phẩm'}
                            </div>
                            <div className="text-[11px] text-muted-foreground truncate">
                              {item.productId?.brand?.name && `${item.productId.brand.name} • `}
                              {item.variantId?.displayName || 'Mặc định'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-primary whitespace-nowrap">
                        {item.variantId?.sku || '---'}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded-[4px] bg-muted text-muted-foreground border border-border">
                          {item.binLocation || 'A-01-01'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-foreground whitespace-nowrap">
                        {Number(item.stock || 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-muted-foreground whitespace-nowrap">
                        {Number(item.allocated || 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {available.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-foreground whitespace-nowrap">
                        {item.variantId?.price
                          ? `${Number(item.variantId.price).toLocaleString('vi-VN')} đ`
                          : '---'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-3 border-t border-border bg-muted/20">
            <DataTablePagination
              page={stockPage}
              pageSize={stockPageSize}
              total={stockTotal}
              totalPages={Math.ceil((stockTotal || 1) / stockPageSize)}
              onPageChange={(newPage) => setStockPage(newPage)}
              onPageSizeChange={(newSize) => {
                setStockPageSize(newSize);
                setStockPage(1);
              }}
              pageSizeOptions={[20, 50, 100, 350]}
            />
          </div>
        </div>
      )}
    </div>
  );
}
