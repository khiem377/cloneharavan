import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import DataTablePagination from '@/components/ui/DataTablePagination';
import {
  TicketPercent,
  Copy,
  Check,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Trash2,
  History,
} from '@/components/ui/Icons';

function formatCurrency(n) {
  if (!n && n !== 0) return '0đ';
  return n.toLocaleString('vi-VN') + 'đ';
}

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CouponTable({
  coupons = [],
  isLoading = false,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  onOpenEdit,
  onToggleStatus,
  onDeleteClick,
  onViewHistory,
  page = 1,
  limit = 10,
  pagination = {},
  onPageChange,
  onPageSizeChange,
}) {
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  return (
    <Card className="rounded-[6px] border border-border shadow-none overflow-hidden bg-card">
      {isLoading ? (
        <Table>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={`coupon-skel-${i}`}>
                <TableCell className="w-10 text-center"><Skeleton className="size-4 mx-auto" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-5 w-20 mx-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-7 w-16 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : coupons.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center text-muted-foreground gap-2">
          <TicketPercent className="size-8 text-muted-foreground/40" />
          <p className="text-xs font-mono">Chưa có mã giảm giá nào</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="px-3 py-2 w-10 text-center">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={
                        coupons.length > 0 && selectedIds.length === coupons.length
                          ? true
                          : selectedIds.length > 0
                          ? 'indeterminate'
                          : false
                      }
                      onCheckedChange={onToggleSelectAll}
                      aria-label="Chọn tất cả mã giảm giá"
                    />
                  </div>
                </TableHead>
                <TableHead className="text-xs font-semibold py-2">Tên Voucher</TableHead>
                <TableHead className="text-xs font-semibold py-2">Mã Code</TableHead>
                <TableHead className="text-xs font-semibold py-2">Giá Trị Giảm</TableHead>
                <TableHead className="text-xs font-semibold py-2">Đơn Tối Thiểu</TableHead>
                <TableHead className="text-xs font-semibold py-2">Lượt Dùng</TableHead>
                <TableHead className="text-xs font-semibold py-2">Thời Hạn</TableHead>
                <TableHead className="text-xs font-semibold py-2 text-center">Trạng Thái</TableHead>
                <TableHead className="text-right py-2 w-32"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((item) => {
                const now = new Date();
                const isExpired = new Date(item.endDate) < now;
                const isNotStarted = new Date(item.startDate) > now;
                const usagePercent = item.usageLimit
                  ? Math.min(100, Math.round(((item.usedCount || 0) / item.usageLimit) * 100))
                  : null;

                return (
                  <TableRow
                    key={item._id}
                    className={`hover:bg-muted/30 transition-colors ${selectedIds.includes(item._id) ? 'bg-muted/50' : ''}`}
                  >
                    <TableCell className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={selectedIds.includes(item._id)}
                          onCheckedChange={() => onToggleSelect(item._id)}
                          aria-label={`Chọn voucher ${item.name}`}
                        />
                      </div>
                    </TableCell>

                    <TableCell className="py-2">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-foreground">{item.name}</span>
                          {item.category === 'shipping' ? (
                            <span className="inline-flex items-center rounded-[3px] px-1.5 py-0.2 text-[10px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                              Freeship
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-[3px] px-1.5 py-0.2 text-[10px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                              Đơn hàng
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <span className="text-[11px] text-muted-foreground line-clamp-1">{item.description}</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="py-2">
                      <div className="flex flex-col gap-1 items-start">
                        <div className="inline-flex items-center gap-1.5 rounded-[4px] bg-muted px-2 py-0.5 border border-border/60 font-mono text-xs font-bold text-foreground">
                          {item.code}
                          <button
                            type="button"
                            onClick={() => handleCopyCode(item.code)}
                            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            title="Sao chép"
                          >
                            {copiedCode === item.code ? (
                              <Check size={12} className="text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                          {(item.applicableChannels || ['online', 'pos']).map((ch) => (
                            <span key={ch} className="text-[9px] uppercase px-1 py-0.2 rounded bg-muted text-muted-foreground font-mono font-semibold border">
                              {ch === 'pos' ? 'POS' : 'Web'}
                            </span>
                          ))}
                          {item.applicableCustomerGroups?.length > 0 ? (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/10 text-purple-600 font-mono font-semibold border border-purple-500/20">
                              {item.applicableCustomerGroups.length} nhóm khách
                            </span>
                          ) : (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-slate-500/10 text-slate-500 font-mono">
                              Mọi khách
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-2">
                      <div className="flex flex-col">
                        {item.category === 'shipping' ? (
                          item.type === 'free_shipping' ? (
                            <span className="font-semibold text-xs font-mono tabular-nums text-sky-600 dark:text-sky-400">
                              Freeship 100%
                            </span>
                          ) : item.type === 'percent' ? (
                            <>
                              <span className="font-semibold text-xs font-mono tabular-nums text-sky-600 dark:text-sky-400">
                                Giảm {item.value}% ship
                              </span>
                              {item.maxDiscount && (
                                <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
                                  Tối đa: {formatCurrency(item.maxDiscount)}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="font-semibold text-xs font-mono tabular-nums text-sky-600 dark:text-sky-400">
                              Giảm {formatCurrency(item.value)} ship
                            </span>
                          )
                        ) : (
                          <>
                            <span className="font-semibold text-xs font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                              {item.type === 'percent' ? `Giảm ${item.value}%` : `Giảm ${formatCurrency(item.value)}`}
                            </span>
                            {item.type === 'percent' && item.maxDiscount && (
                              <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
                                Tối đa: {formatCurrency(item.maxDiscount)}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="py-2 font-mono text-xs tabular-nums text-foreground">
                      {item.minOrderValue > 0 ? formatCurrency(item.minOrderValue) : '0đ'}
                    </TableCell>

                    <TableCell className="py-2 min-w-[130px]">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs font-mono tabular-nums text-foreground">
                          <span>{item.usedCount || 0} {item.usageLimit ? `/ ${item.usageLimit}` : 'lượt'}</span>
                          {usagePercent !== null ? (
                            <span className={`text-[10px] font-semibold ${
                              usagePercent >= 90 ? 'text-rose-500' : usagePercent >= 70 ? 'text-amber-500' : 'text-muted-foreground'
                            }`}>
                              {usagePercent}%
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-500 font-semibold font-sans">Vô hạn</span>
                          )}
                        </div>
                        {item.usageLimit && (
                          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                usagePercent >= 90 ? 'bg-rose-500' : usagePercent >= 70 ? 'bg-amber-500' : 'bg-primary'
                              }`}
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        )}
                        <div className="text-[10px] text-muted-foreground">
                          Tối đa: <span className="font-mono font-medium text-foreground">{item.usageLimitPerUser || 1}</span> lần/khách
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-2 text-[11px] text-muted-foreground font-mono tabular-nums whitespace-nowrap">
                      <div>{formatDate(item.startDate)}</div>
                      <div>đến {formatDate(item.endDate)}</div>
                    </TableCell>

                    <TableCell className="py-2 text-center">
                      {isExpired ? (
                        <span className="inline-flex items-center rounded-[4px] px-2 py-0.5 text-[10px] font-semibold bg-destructive/10 text-destructive border border-destructive/20">
                          Hết hạn
                        </span>
                      ) : isNotStarted ? (
                        <span className="inline-flex items-center rounded-[4px] px-2 py-0.5 text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          Chưa bắt đầu
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center rounded-[4px] px-2 py-0.5 text-[10px] font-semibold border ${
                            item.isActive
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          {item.isActive ? 'Hoạt động' : 'Tắt'}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onViewHistory && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-[4px] text-muted-foreground hover:text-foreground"
                            title="Lịch sử sử dụng"
                            onClick={() => onViewHistory(item)}
                          >
                            <History size={13} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-[4px] text-muted-foreground hover:text-foreground"
                          title="Sửa"
                          onClick={() => onOpenEdit(item)}
                        >
                          <Pencil size={13} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-[4px] text-muted-foreground hover:text-foreground"
                          title={item.isActive ? 'Tắt' : 'Bật'}
                          onClick={() => onToggleStatus(item)}
                        >
                          {item.isActive ? (
                            <ToggleRight size={14} className="text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <ToggleLeft size={14} />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-[4px] text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                          title="Xóa"
                          onClick={() => onDeleteClick(item)}
                        >
                          <Trash2 size={13} />
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

      <DataTablePagination
        page={page}
        pageSize={limit}
        total={pagination?.total ?? 0}
        totalPages={pagination?.totalPages ?? 1}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        className="px-4 py-2 border-t border-border"
      />
    </Card>
  );
}
