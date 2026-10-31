import React from 'react';
import { Gift, Pencil, Trash2, ToggleLeft, ToggleRight } from '@/components/ui/Icons';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DataTablePagination from '@/components/ui/DataTablePagination';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function GiftProgramTable({
  programs,
  isLoading,
  selectedIds,
  toggleSelect,
  toggleSelectAll,
  openEdit,
  handleToggle,
  setDeleteTarget,
  allProducts,
  allCategories,
  page,
  limit,
  pagination,
  setPage,
  setLimit,
}) {
  const scopeLabel = (item) => {
    if (item.scope?.type === 'all') return 'Tất cả SP';
    if (item.scope?.type === 'products') {
      const pList = item.scope.productIds || [];
      if (pList.length === 1) {
        const p0 = pList[0];
        const name = typeof p0 === 'object' ? p0.name : allProducts.find((x) => x._id === p0)?.name || '1 sản phẩm';
        return <span className="line-clamp-1 max-w-[150px] font-medium" title={name}>{name}</span>;
      }
      return `${pList.length} sản phẩm`;
    }
    if (item.scope?.type === 'categories') {
      const cList = item.scope.categoryIds || [];
      if (cList.length === 1) {
        const c0 = cList[0];
        const name = typeof c0 === 'object' ? c0.name : allCategories.find((x) => x._id === c0)?.name || '1 danh mục';
        return <span className="line-clamp-1 max-w-[150px] font-medium" title={name}>{name}</span>;
      }
      return `${cList.length} danh mục`;
    }
    return '—';
  };

  return (
    <Card className="rounded-[6px] border border-border shadow-none overflow-hidden">
      {isLoading ? (
        <Table>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={`gift-skel-${i}`}>
                <TableCell className="w-10 px-3"><Skeleton className="size-4 mx-auto" /></TableCell>
                <TableCell className="px-4"><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell className="px-4"><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell className="px-4"><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="px-4"><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell className="px-4"><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="px-4"><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell className="px-4"><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="px-4"><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell className="px-4 text-right"><Skeleton className="h-7 w-16 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : programs.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center text-muted-foreground gap-2">
          <Gift className="size-10 text-muted-foreground/40" />
          <p className="text-sm">Chưa có chương trình tặng kèm nào</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="border-b border-border">
                <TableHead className="w-10 px-3">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={
                        programs.length > 0 && selectedIds.length === programs.length
                          ? true
                          : selectedIds.length > 0
                          ? 'indeterminate'
                          : false
                      }
                      onCheckedChange={toggleSelectAll}
                      aria-label="Chọn tất cả chương trình tặng quà"
                    />
                  </div>
                </TableHead>
                <TableHead className="px-4">Tên chương trình</TableHead>
                <TableHead className="px-4">Loại tặng</TableHead>
                <TableHead className="px-4">SP kích hoạt</TableHead>
                <TableHead className="px-4">Điều kiện</TableHead>
                <TableHead className="px-4">Quà tặng</TableHead>
                <TableHead className="px-4">Đã tặng / Giới hạn</TableHead>
                <TableHead className="px-4">Thời gian</TableHead>
                <TableHead className="px-4">Trạng thái</TableHead>
                <TableHead className="px-4 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/60">
              {programs.map((item) => {
                const now = new Date();
                const isExpired = new Date(item.endDate) < now;
                const isNotStarted = new Date(item.startDate) > now;
                const isQuotaReached = item.giftLimit !== null && item.giftLimit !== undefined && item.giftLimit > 0 && (item.giftUsedCount || 0) >= item.giftLimit;

                return (
                  <TableRow key={item._id} className={selectedIds.includes(item._id) ? 'bg-muted/60' : ''}>
                    <TableCell className="px-3 py-3 align-middle">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={selectedIds.includes(item._id)}
                          onCheckedChange={() => toggleSelect(item._id)}
                          aria-label={`Chọn chương trình ${item.name}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 align-middle">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-sm">{item.name}</span>
                        {item.description && <span className="text-xs text-muted-foreground line-clamp-1">{item.description}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 align-middle">
                      <Badge
                        variant="outline"
                        className={`rounded-[6px] text-xs font-medium ${item.giftType === 'same_product' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' : 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20'}`}
                      >
                        {item.giftType === 'same_product' ? 'Cùng sản phẩm' : 'Khác sản phẩm'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 align-middle text-xs text-muted-foreground">
                      {scopeLabel(item)}
                    </TableCell>
                    <TableCell className="px-4 py-3 align-middle text-xs text-foreground font-mono tabular-nums">
                      Mua từ {item.triggerQty} SP
                    </TableCell>
                    <TableCell className="px-4 py-3 align-middle text-xs text-foreground font-mono tabular-nums">
                      {item.giftType === 'same_product'
                        ? <span>Tặng {item.giftQty} SP cùng loại</span>
                        : <span>{item.giftProducts?.length || 0} sản phẩm tặng</span>
                      }
                    </TableCell>
                    <TableCell className="px-4 py-3 align-middle">
                      {item.giftLimit !== null && item.giftLimit !== undefined && item.giftLimit > 0 ? (
                        <div className="flex flex-col gap-1 min-w-[120px]">
                          <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                            <span className="font-semibold text-foreground">{item.giftUsedCount || 0}</span>
                            <span className="text-muted-foreground">/ {item.giftLimit} suất</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-[2px] overflow-hidden border border-border/40">
                            <div
                              className={`h-full transition-all ${
                                isQuotaReached ? 'bg-destructive' : 'bg-primary'
                              }`}
                              style={{
                                width: `${Math.min(100, Math.round(((item.giftUsedCount || 0) / item.giftLimit) * 100))}%`,
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col text-xs">
                          <span className="font-mono tabular-nums text-foreground font-medium">Đã tặng: {item.giftUsedCount || 0}</span>
                          <span className="text-[11px] text-muted-foreground font-mono">Không giới hạn</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 align-middle text-xs text-muted-foreground font-mono tabular-nums whitespace-nowrap">
                      <div>{formatDate(item.startDate)}</div>
                      <div className="text-[11px] text-muted-foreground/80">đến {formatDate(item.endDate)}</div>
                    </TableCell>
                    <TableCell className="px-4 py-3 align-middle">
                      {isQuotaReached ? (
                        <Badge variant="destructive" className="rounded-[6px] text-xs font-normal">Hết suất quà</Badge>
                      ) : isExpired ? (
                        <Badge variant="destructive" className="rounded-[6px] text-xs font-normal">Hết hạn</Badge>
                      ) : isNotStarted ? (
                        <Badge variant="outline" className="rounded-[6px] text-xs font-normal border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10">Chưa diễn ra</Badge>
                      ) : (
                        <Badge variant="outline" className={`rounded-[6px] text-xs font-normal ${item.isActive ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' : 'border-border text-muted-foreground bg-muted'}`}>
                          {item.isActive ? 'Hoạt động' : 'Tắt'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 align-middle text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="size-8 rounded-[6px]" onClick={() => openEdit(item)}>
                          <Pencil size={15} />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8 rounded-[6px]" onClick={() => handleToggle(item)}>
                          {item.isActive ? <ToggleRight size={16} className="text-emerald-600 dark:text-emerald-400" /> : <ToggleLeft size={16} />}
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8 rounded-[6px] text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(item)}>
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      <DataTablePagination page={page} pageSize={limit} total={pagination?.total ?? 0} totalPages={pagination?.totalPages ?? 1} onPageChange={setPage} onPageSizeChange={setLimit} />
    </Card>
  );
}
