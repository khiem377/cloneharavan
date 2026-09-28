import React, { useState } from 'react';
import {
  History, SearchIcon as Search, ArrowUpRight, ArrowDownRight, RefreshCw,
  Package, Calendar, UsersIcon as User,
} from '@/components/ui/Icons';
import { useStockMovements } from '@/hooks/useInventory';
import DataTablePagination from '@/components/ui/DataTablePagination';
import SearchableSelect from '@/components/ui/SearchableSelect';

export default function StockMovementListPage() {
  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const { data: res = {}, isLoading } = useStockMovements({
    page,
    limit: pageSize,
    keyword,
    type,
  });

  const movements = res.data || [];
  const pagination = res.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 };

  const renderTypeBadge = (t) => {
    switch (t) {
      case 'IMPORT':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-3.5 w-3.5" /> Nhập Kho (IMPORT)
          </span>
        );
      case 'EXPORT':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <ArrowDownRight className="h-3.5 w-3.5" /> Xuất Kho (EXPORT)
          </span>
        );
      case 'ADJUSTMENT':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <RefreshCw className="h-3.5 w-3.5" /> Cân Bằng (ADJUSTMENT)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
            {t}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <History className="h-7 w-7 text-primary" />
            Nhật Ký Biến Động Tồn Kho (Stock Audit Trail)
          </h1>
          <p className="text-sm text-muted-foreground">
            Truy xuất lịch sử 100% mọi hành động cộng/trừ tồn kho, người thực hiện và chứng từ gốc
          </p>
        </div>
      </div>

      {/* Toolbar & Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm, mã SKU, mã chứng từ, lý do..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2 w-56">
          <SearchableSelect
            options={[
              { label: 'Tất cả loại biến động', value: '' },
              { label: 'Nhập Kho (IMPORT)', value: 'IMPORT' },
              { label: 'Xuất Kho (EXPORT)', value: 'EXPORT' },
              { label: 'Điều Chỉnh Kho (ADJUSTMENT)', value: 'ADJUSTMENT' },
            ]}
            value={type}
            onChange={(val) => {
              setType(val);
              setPage(1);
            }}
            creatable={false}
            placeholder="Tất cả loại biến động"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Thời Gian</th>
                <th className="px-4 py-3">Sản Phẩm & SKU</th>
                <th className="px-4 py-3">Loại Biến Động</th>
                <th className="px-4 py-3 text-center">Tồn Trước</th>
                <th className="px-4 py-3 text-center">Thay Đổi</th>
                <th className="px-4 py-3 text-center">Tồn Sau</th>
                <th className="px-4 py-3">Chứng Từ</th>
                <th className="px-4 py-3">Lý Do / Ghi Chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                    Đang tải nhật ký tồn kho...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                    Chưa có lịch sử biến động kho nào
                  </td>
                </tr>
              ) : (
                movements.map((log) => (
                  <tr key={log._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{log.productName}</div>
                      <div className="text-xs text-muted-foreground font-mono">{log.sku || '-'}</div>
                    </td>
                    <td className="px-4 py-3">{renderTypeBadge(log.type)}</td>
                    <td className="px-4 py-3 text-center font-mono text-muted-foreground">{log.beforeStock}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold">
                      <span
                        className={
                          log.changeQty > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }
                      >
                        {log.changeQty > 0 ? `+${log.changeQty}` : log.changeQty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-foreground">{log.afterStock}</td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">
                      {log.referenceNumber || '-'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">
                      {log.reason || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <DataTablePagination
          page={page}
          pageSize={pageSize}
          totalItems={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}
