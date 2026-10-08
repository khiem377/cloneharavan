import React, { useState } from 'react';
import {
  History, SearchIcon as Search, ArrowUpRight, ArrowDownRight, RefreshCw,
  Package, Calendar, UsersIcon as User,
} from '@/components/ui/Icons';
import { useStockMovements } from '@/hooks/useInventory';
import DataTablePagination from '@/components/ui/DataTablePagination';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';

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
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-300 font-semibold text-xs">
            <ArrowUpRight className="h-3.5 w-3.5 mr-1" /> Nhập Kho (IMPORT)
          </Badge>
        );
      case 'EXPORT':
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-300 font-semibold text-xs">
            <ArrowDownRight className="h-3.5 w-3.5 mr-1" /> Xuất Kho (EXPORT)
          </Badge>
        );
      case 'ADJUSTMENT':
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-300 font-semibold text-xs">
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Cân Bằng (ADJUSTMENT)
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="font-semibold text-xs">
            {t}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 p-6 antialiased">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Nhật Ký Biến Động Tồn Kho (Stock Audit Trail)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Truy xuất lịch sử 100% mọi hành động cộng/trừ tồn kho, người thực hiện và chứng từ gốc
          </p>
        </div>
      </div>

      {/* Toolbar & Filter */}
      <Card className="rounded-[6px] border border-border p-4 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm theo tên sản phẩm, mã SKU, mã chứng từ, lý do..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9 text-xs rounded-[6px]"
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
      </Card>

      {/* Table */}
      <Card className="rounded-[6px] border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/60 font-bold text-foreground text-[11px]">
                <th className="px-4 py-3.5 whitespace-nowrap">Thời Gian</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Sản Phẩm & SKU</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Loại Biến Động</th>
                <th className="px-4 py-3.5 text-center whitespace-nowrap">Tồn Trước</th>
                <th className="px-4 py-3.5 text-center whitespace-nowrap">Thay Đổi</th>
                <th className="px-4 py-3.5 text-center whitespace-nowrap">Tồn Sau</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Chứng Từ</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Lý Do / Ghi Chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-muted-foreground">
                    Đang tải nhật ký tồn kho...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-muted-foreground">
                    Chưa có lịch sử biến động kho nào
                  </td>
                </tr>
              ) : (
                movements.map((log) => (
                  <tr key={log._id} className="hover:bg-muted/30 transition-colors align-middle">
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono tabular-nums whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground text-xs">{log.productName}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{log.sku || '-'}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{renderTypeBadge(log.type)}</td>
                    <td className="px-4 py-3 text-center font-mono text-muted-foreground text-xs tabular-nums">{log.beforeStock}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-xs tabular-nums">
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
                    <td className="px-4 py-3 text-center font-mono font-bold text-foreground text-xs tabular-nums">{log.afterStock}</td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-primary whitespace-nowrap">
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
      </Card>
    </div>
  );
}
